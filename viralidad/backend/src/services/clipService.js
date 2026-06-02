import { spawn } from 'child_process';
import path from 'path';
import { CLIPS_DIR } from '../utils/fileManager.js';

export async function createClip(videoPath, startTime, endTime, clipId) {
  const outputPath = path.join(CLIPS_DIR, `${clipId}.mp4`);
  const duration = (endTime - startTime).toFixed(3);

  return new Promise((resolve, reject) => {
    // -ss before -i = fast keyframe seek; -t limits duration
    // re-encode to ensure clean cut at exact timestamps
    const proc = spawn('ffmpeg', [
      '-ss', startTime.toFixed(3),
      '-i', videoPath,
      '-t', duration,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-preset', 'fast',
      '-crf', '23',
      '-movflags', '+faststart',
      '-y',
      outputPath,
    ]);

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`FFmpeg clip failed (code ${code}): ${stderr.slice(-200)}`));
      }
      resolve(outputPath);
    });

    proc.on('error', () =>
      reject(new Error('ffmpeg not found — install from https://ffmpeg.org'))
    );
  });
}

// Reframe a landscape clip to 9:16 by cropping the sides (no black bars).
// Uses a horizontal center crop: keeps full height, trims left and right equally.
// crop=w:h:x:y  →  w=ih*(9/16), h=ih (full height), x=center, y=0
// Then scales up to standard 1080×1920 for TikTok/Reels/Shorts.
export async function exportVertical(sourceClipPath, outputPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-i', sourceClipPath,
      '-vf', [
        // Step 1: center-crop to 9:16 — removes left/right, keeps full height
        'crop=ih*9/16:ih:(iw-ih*9/16)/2:0',
        // Step 2: scale to standard 9:16 HD (1080×1920) for social media
        'scale=1080:1920:flags=lanczos',
        'setsar=1',
      ].join(','),
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-preset', 'fast',
      '-crf', '23',
      '-movflags', '+faststart',
      '-y',
      outputPath,
    ]);

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`FFmpeg vertical export failed (code ${code}): ${stderr.slice(-200)}`));
      }
      resolve(outputPath);
    });

    proc.on('error', () =>
      reject(new Error('ffmpeg not found — install from https://ffmpeg.org'))
    );
  });
}
