import { Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import {
  createJob,
  getJob,
  getAllJobs,
  deleteJob,
  addSSEClient,
  removeSSEClient,
} from '../services/jobService.js';
import { loadJobData, listSavedJobs, CLIPS_DIR } from '../utils/fileManager.js';
import { findScene } from '../services/searchSceneService.js';
import { createClip } from '../services/clipService.js';

const router = Router();

// GET /api/jobs — list in-memory jobs
router.get('/', (_req, res) => {
  res.json(getAllJobs());
});

// GET /api/jobs/saved — jobs with persisted data on disk (for scene-search after restart)
router.get('/saved', async (_req, res) => {
  try {
    res.json(await listSavedJobs());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id — get a single job
router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// POST /api/jobs — create job and kick off pipeline
router.post('/', (req, res) => {
  const { url, contentType = 'stream-zero' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  const isYouTube =
    url.includes('youtube.com/watch') ||
    url.includes('youtu.be/') ||
    url.includes('youtube.com/shorts') ||
    url.includes('youtube.com/live/');

  if (!isYouTube) {
    return res.status(400).json({ error: 'Only YouTube URLs are supported' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set on the server' });
  }

  const job = createJob(url, contentType);
  res.status(201).json(job);
});

// GET /api/jobs/:id/events — SSE stream for real-time progress
router.get('/:id/events', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify(job)}\n\n`);

  if (job.status === 'completed' || job.status === 'failed') {
    res.write('event: done\ndata: {}\n\n');
    return res.end();
  }

  addSSEClient(req.params.id, res);
  req.on('close', () => removeSSEClient(req.params.id, res));
});

// POST /api/jobs/:id/search-scene — semantic scene search within a processed video
router.post('/:id/search-scene', async (req, res) => {
  const { query } = req.body;
  const jobId = req.params.id;

  if (!query?.trim()) {
    return res.status(400).json({ error: 'query is required' });
  }

  // Load transcript + video path — try disk first (survives restarts), fall back to memory
  let jobData;
  try {
    jobData = await loadJobData(jobId);
  } catch {
    const memJob = getJob(jobId);
    if (!memJob?.transcript) {
      return res.status(404).json({
        error: 'Transcripción no disponible. Vuelve a procesar el video.',
      });
    }
    jobData = { transcript: memJob.transcript, videoPath: null, videoTitle: memJob.videoTitle };
  }

  if (!jobData.videoPath) {
    return res.status(400).json({
      error: 'Ruta del video no encontrada en los datos guardados.',
    });
  }

  // Verify source video still exists
  try {
    await fs.access(jobData.videoPath);
  } catch {
    return res.status(400).json({
      error: 'El video original fue eliminado. Vuelve a procesar el video.',
    });
  }

  // Ask GPT-4o to locate the scene
  let scene;
  try {
    scene = await findScene(jobData.transcript, query.trim());
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }

  // Create the clip with FFmpeg
  const clipId = `${jobId}_scene_${Date.now()}`;
  try {
    await createClip(jobData.videoPath, scene.start_time, scene.end_time, clipId);
  } catch (err) {
    return res.status(500).json({ error: `Error creando clip: ${err.message}` });
  }

  // Save metadata sidecar
  const meta = {
    id: clipId,
    jobId,
    url: null,
    videoTitle: jobData.videoTitle,
    thumbnail: null,
    title: scene.title,
    category: 'BUSQUEDA',
    reason: scene.reason,
    score: null,
    carouselPoints: null,
    startTime: scene.start_time,
    endTime: scene.end_time,
    duration: parseFloat((scene.end_time - scene.start_time).toFixed(2)),
    filename: `${clipId}.mp4`,
    approved: false,
    approvedAt: null,
    searchQuery: query.trim(),
    hooks: null,
    selectedHook: null,
    createdAt: new Date().toISOString(),
  };

  await fs.writeFile(
    path.join(CLIPS_DIR, `${clipId}.json`),
    JSON.stringify(meta, null, 2)
  );

  res.status(201).json(meta);
});

// DELETE /api/jobs/:id
router.delete('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  deleteJob(req.params.id);
  res.json({ message: 'Job deleted' });
});

export default router;
