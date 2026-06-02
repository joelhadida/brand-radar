import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ensureDirs } from './src/utils/fileManager.js';
import jobsRouter from './src/routes/jobs.js';
import clipsRouter from './src/routes/clips.js';
import scraperRouter from './src/routes/scraper.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Internal tool — allow all localhost origins regardless of port
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
}));
app.use(express.json());

// Serve generated clips as static files
app.use('/clips', express.static(path.join(__dirname, 'clips')));

app.use('/api/jobs', jobsRouter);
app.use('/api/clips', clipsRouter);
app.use('/api/scraper', scraperRouter);

// Under /api so Vite's proxy forwards it correctly
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

ensureDirs()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Stream Zero Clipper backend → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });
