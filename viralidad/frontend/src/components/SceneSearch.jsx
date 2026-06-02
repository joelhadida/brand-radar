import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

function fmtDuration(s) {
  if (!s) return '';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// job: the currently active job from App (used to refresh options when it completes)
export function SceneSearch({ onClipCreated, job }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchOptions = useCallback(() => {
    setLoading(true);
    Promise.allSettled([api.getJobs(), api.getSavedJobs()]).then(
      ([jobsRes, savedRes]) => {
        const map = new Map();

        // Saved jobs on disk — filtered to those with transcripts
        if (savedRes.status === 'fulfilled') {
          savedRes.value
            .filter((j) => j.hasTranscript)
            .forEach((j) => map.set(j.jobId, { id: j.jobId, videoTitle: j.videoTitle }));
        }

        // In-memory completed jobs — always have transcript available
        if (jobsRes.status === 'fulfilled') {
          jobsRes.value
            .filter((j) => j.status === 'completed')
            .forEach((j) => map.set(j.id, { id: j.id, videoTitle: j.videoTitle }));
        }

        const list = [...map.values()].filter((j) => j.videoTitle);
        setOptions(list);
        setSelectedJobId((prev) => (prev && list.find((j) => j.id === prev) ? prev : list[0]?.id ?? ''));
        setLoading(false);
      }
    );
  }, []);

  // Initial fetch
  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  // Re-fetch when a job finishes processing in this session
  useEffect(() => {
    if (job?.status === 'completed') fetchOptions();
  }, [job?.status, job?.id, fetchOptions]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedJobId || !query.trim()) return;
    setSearching(true);
    setError(null);
    setResult(null);
    try {
      const clip = await api.searchScene(selectedJobId, query.trim());
      setResult(clip);
      onClipCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <span>🔍</span> Buscar escena
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Describe un momento con tus palabras — GPT-4o lo localiza en la transcripción y genera el clip.
          </p>
        </div>
        {loading && (
          <svg className="w-4 h-4 animate-spin text-slate-600 shrink-0 mt-1" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      {/* No videos available */}
      {!loading && options.length === 0 && (
        <div className="flex items-center gap-2.5 text-sm text-slate-600 bg-slate-800/50 rounded-xl px-4 py-3">
          <span className="text-base opacity-60">⏳</span>
          <span>Procesa un video primero — el buscador se activa automáticamente cuando termina.</span>
        </div>
      )}

      {/* Search form */}
      {options.length > 0 && (
        <form onSubmit={handleSearch} className="space-y-3">
          <select
            value={selectedJobId}
            onChange={(e) => { setSelectedJobId(e.target.value); setResult(null); setError(null); }}
            disabled={searching}
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm
                       text-slate-200 focus:outline-none focus:border-violet-500/70
                       focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 transition"
          >
            {options.map((j) => (
              <option key={j.id} value={j.id}>{j.videoTitle}</option>
            ))}
          </select>

          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ej: "cuando se ríen de las fotos del cole"'
              disabled={searching}
              className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm
                         placeholder:text-slate-600 focus:outline-none focus:border-violet-500/70
                         focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 transition"
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="shrink-0 bg-violet-600 hover:bg-violet-500 active:bg-violet-700
                         disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {searching ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Buscando…
                </span>
              ) : 'Buscar'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
          <span className="shrink-0 mt-px">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-medium text-emerald-400">"{result.title}"</p>
            <p className="text-xs text-slate-500 mt-0.5">{fmtDuration(result.duration)} · {result.reason}</p>
            <p className="text-xs text-slate-600 mt-1">Clip añadido a la galería ↓</p>
          </div>
        </div>
      )}
    </div>
  );
}
