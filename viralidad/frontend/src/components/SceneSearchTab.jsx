import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ClipCard } from './ClipCard';

export function SceneSearchTab({ job, onClipCreated }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [foundClip, setFoundClip] = useState(null);

  const canSearch = job?.id;

  const handleSearch = async () => {
    if (!query.trim() || !canSearch || searching) return;

    setSearching(true);
    setSearchError(null);
    setFoundClip(null);

    try {
      const result = await api.searchScene(job.id, query.trim());
      setFoundClip(result);
      onClipCreated(); // Refresh clips list
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400">
          Describe un momento que quieras encontrar
        </label>
        <div className="flex gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ej: cuando se ríen todos a la vez, momento emotivo, explosión de adrenalina…"
            rows={2}
            disabled={!canSearch || searching}
            className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-sm
                       text-slate-100 placeholder:text-slate-600 resize-none leading-relaxed
                       focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
                       disabled:opacity-50 transition"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || !canSearch || searching}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-violet-600 hover:bg-violet-500 active:bg-violet-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-white text-sm font-medium transition-colors"
          >
            {searching ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Buscando…
              </>
            ) : (
              <>
                🔍 Buscar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error message */}
      {searchError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-xs text-red-400">{searchError}</p>
        </div>
      )}

      {/* Found clip */}
      {foundClip && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <p className="text-xs font-medium text-slate-400">Clip encontrado:</p>
          <ClipCard clip={foundClip} onDelete={() => setFoundClip(null)} />
        </div>
      )}

      {/* Empty state */}
      {!foundClip && !searching && !searchError && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">Escribe una descripción y busca un momento específico</p>
        </div>
      )}
    </div>
  );
}
