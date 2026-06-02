import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { downloadVideo } from './downloadService.js';
import { extractAudio, transcribeAudio } from './transcribeService.js';
import { analyzeTranscript } from './analyzeService.js';
import { analyzeTranscriptCenteia } from './analyzeCenteia.js';
import { createClip } from './clipService.js';
import { CLIPS_DIR, cleanupUploads, saveJobData } from '../utils/fileManager.js';

// In-memory store — sufficient for internal tool, no persistence needed
const jobs = new Map();
const sseClients = new Map(); // jobId -> Set<Response>

// ── Public API ────────────────────────────────────────────────────────

export function createJob(url, contentType = 'stream-zero') {
  const id = uuidv4();
  const job = {
    id,
    url,
    contentType,
    status: 'pending',
    progress: 0,
    message: 'Job queued',
    videoTitle: null,
    videoDuration: null,
    thumbnail: null,
    transcript: null,
    viralMoments: null,
    clips: [],
    warning: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  jobs.set(id, job);
  sseClients.set(id, new Set());

  // Fire-and-forget — errors are caught and stored on the job
  runPipeline(id, contentType).catch((err) => {
    updateJob(id, { status: 'failed', error: err.message });
  });

  return job;
}

export function getJob(id) {
  return jobs.get(id) ?? null;
}

export function getAllJobs() {
  return [...jobs.values()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function deleteJob(id) {
  sseClients.get(id)?.forEach((c) => c.end());
  sseClients.delete(id);
  jobs.delete(id);
}

export function addSSEClient(jobId, res) {
  sseClients.get(jobId)?.add(res);
}

export function removeSSEClient(jobId, res) {
  sseClients.get(jobId)?.delete(res);
}

// ── Internal helpers ──────────────────────────────────────────────────

function updateJob(id, updates) {
  const job = jobs.get(id);
  if (!job) return;

  Object.assign(job, updates, { updatedAt: new Date().toISOString() });

  const clients = sseClients.get(id);
  if (!clients?.size) return;

  const payload = `data: ${JSON.stringify(job)}\n\n`;
  const isTerminal = job.status === 'completed' || job.status === 'failed';

  for (const client of clients) {
    client.write(payload);
    if (isTerminal) {
      client.write('event: done\ndata: {}\n\n');
      client.end();
    }
  }

  if (isTerminal) clients.clear();
}

// ── Pipeline ──────────────────────────────────────────────────────────

async function runPipeline(jobId) {
  const getUrl = () => jobs.get(jobId)?.url;

  // Stage 1 ── Download ────────────────────────────────────────────────
  updateJob(jobId, { status: 'downloading', progress: 5, message: 'Starting download...' });

  const { videoPath, videoTitle, videoDuration, thumbnail } = await downloadVideo(
    getUrl(),
    jobId,
    (pct) =>
      updateJob(jobId, {
        progress: 5 + Math.round(pct * 0.25),
        message: `Downloading... ${pct.toFixed(1)}%`,
      })
  );

  const MAX_SECS = 90 * 60;
  const wasTrimmed = videoDuration && videoDuration > MAX_SECS;

  updateJob(jobId, {
    videoTitle,
    videoDuration,
    thumbnail,
    progress: 30,
    message: 'Download complete',
    warning: wasTrimmed
      ? `Video is ${Math.round(videoDuration / 60)} min — only the first 90 min were processed to stay within Whisper's file size limit.`
      : null,
  });

  // Stage 2 ── Transcribe ───────────────────────────────────────────────
  updateJob(jobId, { status: 'transcribing', progress: 32, message: 'Extracting audio...' });

  const audioPath = await extractAudio(videoPath, jobId);

  updateJob(jobId, { progress: 40, message: 'Transcribing with Whisper...' });

  const transcript = await transcribeAudio(audioPath);

  updateJob(jobId, {
    transcript,
    progress: 60,
    message: `Transcription complete — ${transcript.segments.length} segments`,
  });

  // Stage 3 ── Analyze ──────────────────────────────────────────────────
  updateJob(jobId, { status: 'analyzing', progress: 62, message: 'Analyzing with GPT-4o...' });

  const contentType = jobs.get(jobId)?.contentType || 'stream-zero';
  const viralMoments = contentType === 'centeia'
    ? await analyzeTranscriptCenteia(transcript, videoTitle)
    : await analyzeTranscript(transcript, videoTitle);

  updateJob(jobId, {
    viralMoments,
    progress: 75,
    message: `Found ${viralMoments.length} viral moment${viralMoments.length !== 1 ? 's' : ''}`,
  });

  // Stage 4 ── Clip ─────────────────────────────────────────────────────
  updateJob(jobId, { status: 'clipping', progress: 77, message: 'Cutting clips with FFmpeg...' });

  const clips = [];

  for (let i = 0; i < viralMoments.length; i++) {
    const moment = viralMoments[i];
    const clipId = `${jobId}_${String(i + 1).padStart(2, '0')}`;

    updateJob(jobId, {
      progress: 77 + Math.round(((i + 1) / viralMoments.length) * 18),
      message: `Creating clip ${i + 1} of ${viralMoments.length}...`,
    });

    try {
      await createClip(videoPath, moment.start_time, moment.end_time, clipId);

      // Embed the transcript segment directly so hooks/adjust work after any server restart
      const segmentText = transcript.segments
        .filter((s) => s.start >= moment.start_time - 1 && s.end <= moment.end_time + 1)
        .map((s) => s.text)
        .join(' ')
        .trim() || null;

      // Relative-time transcript segments for subtitle burning
      const transcriptSegments = transcript.segments
        .filter((s) => s.start >= moment.start_time - 0.3 && s.end <= moment.end_time + 0.3)
        .map((s) => ({
          start: Math.max(0, parseFloat((s.start - moment.start_time).toFixed(2))),
          end: parseFloat(Math.min(s.end - moment.start_time, moment.end_time - moment.start_time + 0.3).toFixed(2)),
          text: s.text.trim(),
        }))
        .filter((s) => s.text && s.end > s.start);

      const meta = {
        id: clipId,
        jobId,
        url: getUrl(),
        videoTitle,
        thumbnail,
        title: moment.title,
        category: moment.category,
        reason: moment.reason,
        score: moment.score,
        carouselPoints: moment.carousel_points || null,
        segmentText,
        transcriptSegments,
        videoPath,
        startTime: moment.start_time,
        endTime: moment.end_time,
        duration: parseFloat((moment.end_time - moment.start_time).toFixed(2)),
        filename: `${clipId}.mp4`,
        approved: false,
        approvedAt: null,
        hooks: null,
        selectedHook: null,
        createdAt: new Date().toISOString(),
      };

      await fs.writeFile(
        path.join(CLIPS_DIR, `${clipId}.json`),
        JSON.stringify(meta, null, 2)
      );

      clips.push(meta);
    } catch (err) {
      console.error(`Clip ${i + 1} failed:`, err.message);
    }
  }

  // Persist transcript + video path so scene-search works after server restart
  await saveJobData(jobId, { transcript, videoPath, videoTitle }).catch(() => {});

  // Cleanup ── only remove the extracted audio; keep source video for scene-search
  await cleanupUploads(jobId);

  updateJob(jobId, {
    status: 'completed',
    progress: 100,
    message: `Done! Created ${clips.length} clip${clips.length !== 1 ? 's' : ''}`,
    clips,
  });
}
