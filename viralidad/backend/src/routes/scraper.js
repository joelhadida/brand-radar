import { Router } from 'express';
import { spawn } from 'child_process';
import { transcribeAudio, extractAudio } from '../services/transcribeService.js';
import { analyzeTranscript } from '../services/analyzeService.js';
import { downloadVideo } from '../services/downloadService.js';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// POST /api/scraper/channel — list videos from a YouTube channel
router.post('/channel', async (req, res) => {
  try {
    const { channelUrl } = req.body;
    if (!channelUrl?.trim()) {
      return res.status(400).json({ error: 'channelUrl is required' });
    }

    const videos = [];
    let currentOutput = '';

    return new Promise((resolve) => {
      // Use yt-dlp to list videos from channel with metadata
      const proc = spawn('yt-dlp', [
        '--flat-playlist',
        '--dump-json',
        '--no-warnings',
        channelUrl.trim(),
      ]);

      proc.stdout.on('data', (data) => {
        currentOutput += data.toString();
      });

      proc.on('close', (code) => {
        try {
          if (code !== 0) {
            return res.status(400).json({ error: 'Failed to scrape channel' });
          }

          // Parse JSON output (one object per line)
          const lines = currentOutput.trim().split('\n').filter((l) => l);
          for (const line of lines) {
            try {
              const video = JSON.parse(line);
              videos.push({
                id: video.id || video.url || '',
                title: video.title || 'Sin título',
                date: video.upload_date ? formatDate(video.upload_date) : null,
                duration: video.duration || null,
                views: video.view_count || null,
                url: `https://www.youtube.com/watch?v=${video.id}`,
              });
            } catch {
              // Skip malformed lines
            }
          }

          res.json({ videos });
        } catch (err) {
          res.status(500).json({ error: err.message });
        }
      });

      proc.on('error', () => {
        res.status(500).json({ error: 'yt-dlp not found — install from https://github.com/yt-dlp/yt-dlp' });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scraper/analyze-viralilty — analyze selected videos for viralilty patterns
router.post('/analyze-viralilty', async (req, res) => {
  try {
    const { videos } = req.body;
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({ error: 'videos array is required' });
    }

    // Limit to first 5 videos to avoid timeout
    const sampled = videos.slice(0, 5);
    const patterns = [];

    for (let i = 0; i < sampled.length; i++) {
      const video = sampled[i];
      try {
        // Download video (limit to 10 min to speed up)
        const { videoPath } = await downloadVideo(
          video.url,
          `scraper_${i}_${Date.now()}`,
          () => {}
        );

        // Extract audio
        const audioPath = await extractAudio(videoPath, `scraper_${i}`);

        // Transcribe
        const transcript = await transcribeAudio(audioPath);

        // Analyze for viral patterns
        const analysis = await analyzeTranscript(transcript, video.title);

        patterns.push({
          title: video.title,
          moments: analysis.slice(0, 2).map((m) => ({
            category: m.category,
            score: m.score,
            reason: m.reason,
          })),
        });

        // Cleanup
        await fs.unlink(videoPath).catch(() => {});
        await fs.unlink(audioPath).catch(() => {});
      } catch (err) {
        console.error(`Failed to analyze ${video.title}:`, err.message);
      }
    }

    // Generate summary of viral patterns
    const summaryPrompt = `
Analiza estos momentos virales encontrados en ${sampled.length} video(s) de YouTube.
Identifica los patrones comunes de viralidad:

${patterns
  .map(
    (p) => `
Video: "${p.title}"
Momentos: ${p.moments.map((m) => `${m.category} (score: ${m.score}) - ${m.reason}`).join('; ')}
`
  )
  .join('\n')}

Resume en 3-4 puntos los patrones de viralidad encontrados. Sé conciso y accionable.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en análisis de viralidad en YouTube. Identifica y resume patrones clave de contenido viral en español.',
          },
          { role: 'user', content: summaryPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const patternsSummary = data.choices?.[0]?.message?.content || 'No se pudieron extraer patrones';

    res.json({
      patterns: patternsSummary,
      videosAnalyzed: sampled.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: format date from YYYYMMDD to readable format
function formatDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return null;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${day}/${month}/${year}`;
}

export default router;
