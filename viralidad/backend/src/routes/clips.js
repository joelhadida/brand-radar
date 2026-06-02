import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { listClips, deleteClipFiles, CLIPS_DIR, loadJobData } from '../utils/fileManager.js';
import { exportVertical, createClip } from '../services/clipService.js';
import { generateHooks } from '../services/hookService.js';
import { computeAdjustedTimestamps } from '../services/adjustService.js';
import { getJob } from '../services/jobService.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns the transcript text for a clip's time range.
// Priority: (1) embedded segmentText, (2) in-memory transcript, (3) _job.json on disk.
async function getSegmentText(meta) {
  if (meta.segmentText) return meta.segmentText;
  return extractFromTranscript(meta, await resolveTranscript(meta));
}

// Returns extended context (±60s) for richer GPT-4o prompts.
async function getExtendedContext(meta) {
  const transcript = await resolveTranscript(meta);
  if (!transcript?.segments?.length) return meta.segmentText || null;

  return transcript.segments
    .filter((s) => s.start >= meta.startTime - 60 && s.end <= meta.endTime + 60)
    .map((s) => `[${s.start.toFixed(1)}s] ${s.text}`)
    .join(' ');
}

async function resolveTranscript(meta) {
  const memJob = getJob(meta.jobId);
  if (memJob?.transcript?.segments?.length) return memJob.transcript;
  try {
    const jobData = await loadJobData(meta.jobId);
    return jobData.transcript;
  } catch {
    return null;
  }
}

function extractFromTranscript(meta, transcript) {
  if (!transcript?.segments?.length) return null;
  return (
    transcript.segments
      .filter((s) => s.start >= meta.startTime - 1 && s.end <= meta.endTime + 1)
      .map((s) => s.text)
      .join(' ')
      .trim() || null
  );
}

// Returns the path to the source video for this clip's job.
async function resolveVideoPath(meta) {
  if (meta.videoPath) return meta.videoPath;
  const memJob = getJob(meta.jobId);
  if (memJob?.videoPath) return memJob.videoPath;
  try {
    const jobData = await loadJobData(meta.jobId);
    return jobData.videoPath || null;
  } catch {
    return null;
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.get('/', async (_req, res) => {
  try { res.json(await listClips()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteClipFiles(req.params.id);
    res.json({ message: 'Clip deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/clips/:id/approve — toggles approved + auto-generates hooks on first approval
router.post('/:id/approve', async (req, res) => {
  try {
    const metaPath = path.join(CLIPS_DIR, `${req.params.id}.json`);
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));

    meta.approved = !meta.approved;
    meta.approvedAt = meta.approved ? new Date().toISOString() : null;

    if (meta.approved && !meta.hooks?.length) {
      const segmentText = await getSegmentText(meta);
      if (segmentText) {
        try { meta.hooks = await generateHooks(segmentText); }
        catch { meta.hooks = null; }
      } else {
        meta.hooks = null;
      }
    }

    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
    res.json(meta);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/clips/:id/export-vertical — letterbox scale-to-fit 9:16
router.post('/:id/export-vertical', async (req, res) => {
  try {
    const { id } = req.params;
    const sourceClipPath = path.join(CLIPS_DIR, `${id}.mp4`);
    const verticalPath = path.join(CLIPS_DIR, `${id}_vertical.mp4`);
    await fs.access(sourceClipPath);
    await exportVertical(sourceClipPath, verticalPath);
    res.json({ filename: `${id}_vertical.mp4`, downloadUrl: `/clips/${id}_vertical.mp4` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/clips/:id/generate-hooks — manual retry when auto-generation fails
router.post('/:id/generate-hooks', async (req, res) => {
  try {
    const metaPath = path.join(CLIPS_DIR, `${req.params.id}.json`);
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));

    const segmentText = await getSegmentText(meta);
    if (!segmentText) {
      return res.status(400).json({
        error: 'Transcripción no disponible. Vuelve a procesar el video para activar hooks.',
      });
    }

    const hooks = await generateHooks(segmentText);
    meta.hooks = hooks;
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
    res.json({ hooks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// POST /api/clips/:id/adjust — re-process clip with user instruction
router.post('/:id/adjust', async (req, res) => {
  try {
    const { instruction } = req.body;
    if (!instruction?.trim()) {
      return res.status(400).json({ error: 'instruction is required' });
    }

    const metaPath = path.join(CLIPS_DIR, `${req.params.id}.json`);
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));

    const segmentText = await getSegmentText(meta);
    if (!segmentText) {
      return res.status(400).json({
        error: 'Transcripción no disponible para este clip. Vuelve a procesar el video.',
      });
    }

    const extendedContext = await getExtendedContext(meta);

    // Get source video path
    const videoPath = await resolveVideoPath(meta);
    if (!videoPath) {
      return res.status(400).json({
        error: 'Video original no encontrado. Vuelve a procesar el video para usar esta función.',
      });
    }
    try { await fs.access(videoPath); }
    catch {
      return res.status(400).json({ error: 'El archivo de video original fue eliminado.' });
    }

    // GPT-4o computes new timestamps
    const adjusted = await computeAdjustedTimestamps(
      meta, segmentText, extendedContext, instruction.trim()
    );

    // Create adjusted clip
    const adjId = `${req.params.id}_adj${Date.now()}`;
    await createClip(videoPath, adjusted.start_time, adjusted.end_time, adjId);

    res.json({
      id: adjId,
      filename: `${adjId}.mp4`,
      startTime: adjusted.start_time,
      endTime: adjusted.end_time,
      duration: parseFloat((adjusted.end_time - adjusted.start_time).toFixed(2)),
      reason: adjusted.reason,
      instruction: instruction.trim(),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/clips/:id/replace-with-adjusted — replace original with adjusted version
router.post('/:id/replace-with-adjusted', async (req, res) => {
  try {
    const { adjustedFilename } = req.body;
    if (!adjustedFilename) {
      return res.status(400).json({ error: 'adjustedFilename is required' });
    }

    const metaPath = path.join(CLIPS_DIR, `${req.params.id}.json`);
    const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));

    const originalPath = path.join(CLIPS_DIR, meta.filename);
    const adjustedPath = path.join(CLIPS_DIR, adjustedFilename);

    // Verify both files exist
    try { await fs.access(originalPath); }
    catch { return res.status(404).json({ error: 'Original clip not found' }); }
    try { await fs.access(adjustedPath); }
    catch { return res.status(404).json({ error: 'Adjusted clip not found' }); }

    // Delete original, move adjusted to original location
    await fs.unlink(originalPath);
    await fs.rename(adjustedPath, originalPath);

    // Update metadata
    meta.approvedAt = null; // Reset approval since clip changed
    meta.approved = false;
    meta.hooks = null;
    meta.selectedHook = null;
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

    res.json({ message: 'Clip original sustituido por versión ajustada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
