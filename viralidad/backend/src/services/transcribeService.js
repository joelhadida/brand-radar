import { spawn } from 'child_process';
import OpenAI from 'openai';
import fs from 'fs';
import { UPLOADS_DIR } from '../utils/fileManager.js';
import path from 'path';

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Converts opaque OpenAI SDK errors into readable messages
function openAIErrorMessage(step, err) {
  const status = err?.status;
  const detail = err?.error?.message || err?.message || String(err);
  if (status === 401) return `${step}: invalid or expired API key — check OPENAI_API_KEY`;
  if (status === 429) return `${step}: OpenAI quota exceeded — add credits at platform.openai.com/billing`;
  if (status === 400) return `${step}: bad request — ${detail}`;
  if (status === 503 || status === 529) return `${step}: OpenAI service temporarily unavailable — retry later`;
  return `${step} failed: ${detail}`;
}

export async function extractAudio(videoPath, jobId) {
  const audioPath = path.join(UPLOADS_DIR, `${jobId}_audio.mp3`);

  return new Promise((resolve, reject) => {
    // 16 kHz mono mp3 keeps file small for Whisper's 25 MB limit
    const proc = spawn('ffmpeg', [
      '-i', videoPath,
      '-vn',
      '-acodec', 'libmp3lame',
      '-ar', '16000',
      '-ac', '1',
      '-q:a', '5',
      '-y',
      audioPath,
    ]);

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`FFmpeg audio extraction failed: ${stderr.slice(-200)}`));
      }
      resolve(audioPath);
    });

    proc.on('error', () =>
      reject(new Error('ffmpeg not found — install from https://ffmpeg.org'))
    );
  });
}

export async function transcribeAudio(audioPath) {
  const stats = fs.statSync(audioPath);
  const sizeMB = stats.size / (1024 * 1024);

  if (sizeMB > 24) {
    throw new Error(
      `Audio file is ${sizeMB.toFixed(1)} MB — Whisper limit is 25 MB. Try a shorter video (< ~2h).`
    );
  }

  const openai = getClient();

  let response;
  try {
    response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });
  } catch (err) {
    throw new Error(openAIErrorMessage('Whisper', err));
  }

  return {
    text: response.text,
    language: response.language,
    segments: (response.segments || []).map((s) => ({
      id: s.id,
      start: parseFloat(s.start.toFixed(2)),
      end: parseFloat(s.end.toFixed(2)),
      text: s.text.trim(),
    })),
  };
}
