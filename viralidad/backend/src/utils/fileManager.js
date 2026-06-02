import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BACKEND_DIR = path.resolve(__dirname, '../..');
export const UPLOADS_DIR = path.join(BACKEND_DIR, 'uploads');
export const CLIPS_DIR = path.join(BACKEND_DIR, 'clips');

export async function ensureDirs() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(CLIPS_DIR, { recursive: true });
}

// Clip sidecar JSONs — exclude internal job-data files
export async function listClips() {
  const files = await fs.readdir(CLIPS_DIR);
  const jsonFiles = files.filter(
    (f) => f.endsWith('.json') && !f.endsWith('_job.json')
  );

  const clips = await Promise.all(
    jsonFiles.map(async (f) => {
      const raw = await fs.readFile(path.join(CLIPS_DIR, f), 'utf-8');
      return JSON.parse(raw);
    })
  );

  return clips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteClipFiles(clipId) {
  await Promise.allSettled([
    fs.unlink(path.join(CLIPS_DIR, `${clipId}.mp4`)),
    fs.unlink(path.join(CLIPS_DIR, `${clipId}.json`)),
    fs.unlink(path.join(CLIPS_DIR, `${clipId}_vertical.mp4`)),
  ]);
}

// Persists transcript + video path so scene-search works after server restart.
// Saved in clips/ (not uploads/) to survive the audio-only cleanup.
export async function saveJobData(jobId, { transcript, videoPath, videoTitle }) {
  await fs.writeFile(
    path.join(CLIPS_DIR, `${jobId}_job.json`),
    JSON.stringify({ transcript, videoPath, videoTitle }, null, 2)
  );
}

export async function loadJobData(jobId) {
  const raw = await fs.readFile(
    path.join(CLIPS_DIR, `${jobId}_job.json`),
    'utf-8'
  );
  return JSON.parse(raw);
}

// Returns all jobs that have clips on disk, marking which ones have a full transcript
// available for scene-search. Scans clip JSONs so it works even without _job.json files.
export async function listSavedJobs() {
  const files = await fs.readdir(CLIPS_DIR);
  const jobMap = new Map();

  // Build map from clip sidecars (always present)
  const clipJsons = files.filter((f) => f.endsWith('.json') && !f.endsWith('_job.json'));
  await Promise.allSettled(
    clipJsons.map(async (f) => {
      try {
        const raw = await fs.readFile(path.join(CLIPS_DIR, f), 'utf-8');
        const clip = JSON.parse(raw);
        if (clip.jobId && clip.videoTitle && !jobMap.has(clip.jobId)) {
          // A job has a searchable transcript if:
          // (a) it has a _job.json (full transcript for wide-context search), OR
          // (b) its clips have segmentText embedded (sufficient for hook/adjust)
          const hasJobFile = files.includes(`${clip.jobId}_job.json`);
          jobMap.set(clip.jobId, {
            jobId: clip.jobId,
            videoTitle: clip.videoTitle,
            hasTranscript: hasJobFile,
          });
        }
      } catch { /* skip malformed file */ }
    })
  );

  return [...jobMap.values()];
}

// Only deletes the extracted audio — the source video is kept for scene-search.
export async function cleanupUploads(jobId) {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    await Promise.allSettled(
      files
        .filter((f) => f.startsWith(jobId) && f.includes('_audio'))
        .map((f) => fs.unlink(path.join(UPLOADS_DIR, f)))
    );
  } catch {
    // Non-fatal
  }
}
