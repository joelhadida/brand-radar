import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { UPLOADS_DIR } from '../utils/fileManager.js';

export async function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const proc = spawn('yt-dlp', [
      '--dump-json',
      '--no-download',
      '--no-playlist',
      url,
    ]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp info failed (code ${code}): ${stderr.slice(-300)}`));
      }
      try {
        const info = JSON.parse(stdout.trim());
        resolve({
          id: info.id,
          title: info.title,
          duration: info.duration,
          thumbnail: info.thumbnail,
        });
      } catch {
        reject(new Error('Could not parse video metadata from yt-dlp'));
      }
    });

    proc.on('error', () =>
      reject(new Error('yt-dlp not found — install with: pip install yt-dlp'))
    );
  });
}

// Default cap: 90 minutes. Long lives/podcasts can be trimmed before Whisper's 25 MB limit hits.
const MAX_DURATION_SECONDS = 90 * 60;

export async function downloadVideo(url, jobId, onProgress) {
  const info = await getVideoInfo(url);

  // Warn early for very long content
  if (info.duration && info.duration > MAX_DURATION_SECONDS) {
    console.warn(
      `[${jobId}] Video is ${Math.round(info.duration / 60)} min — downloading first ${MAX_DURATION_SECONDS / 60} min only.`
    );
  }

  const outputTemplate = path.join(UPLOADS_DIR, `${jobId}.%(ext)s`);

  return new Promise((resolve, reject) => {
    const args = [
      '--no-playlist',
      '-f',
      'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
      '--merge-output-format', 'mp4',
      '-o', outputTemplate,
      '--newline',
    ];

    // Cap duration for long-form content (lives, podcasts)
    if (!info.duration || info.duration > MAX_DURATION_SECONDS) {
      args.push('--download-sections', `*0-${MAX_DURATION_SECONDS}`);
    }

    args.push(url);

    const proc = spawn('yt-dlp', args);

    let stderr = '';

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      // yt-dlp progress lines: "[download]  45.2% of ..."
      const match = text.match(/\[download\]\s+(\d+\.?\d*)%/);
      if (match && onProgress) onProgress(parseFloat(match[1]));
    });

    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', async (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp download failed (code ${code}): ${stderr.slice(-400)}`));
      }
      try {
        const files = await fs.readdir(UPLOADS_DIR);
        const videoFile = files.find((f) => f.startsWith(jobId) && f.endsWith('.mp4'));

        if (!videoFile) {
          return reject(new Error('Downloaded file not found. The format may not be available as mp4.'));
        }

        resolve({
          videoPath: path.join(UPLOADS_DIR, videoFile),
          videoTitle: info.title,
          videoDuration: info.duration,
          videoId: info.id,
          thumbnail: info.thumbnail,
        });
      } catch (err) {
        reject(err);
      }
    });

    proc.on('error', () =>
      reject(new Error('yt-dlp not found — install with: pip install yt-dlp'))
    );
  });
}
