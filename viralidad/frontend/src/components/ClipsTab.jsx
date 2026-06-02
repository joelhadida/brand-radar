import { useState } from 'react';
import { ClipCard } from './ClipCard';

const CATEGORY_META = {
  HUMOR:        { emoji: '😂', label: 'Humor' },
  NOSTALGICO:   { emoji: '💜', label: 'Nostálgico' },
  DATO_CURIOSO: { emoji: '🤯', label: 'Dato Curioso' },
  PERSONAL:     { emoji: '❤️', label: 'Personal' },
  DEBATE:       { emoji: '⚡', label: 'Debate' },
  CARRUSEL:     { emoji: '📱', label: 'Carrusel' },
  BUSQUEDA:     { emoji: '🔍', label: 'Búsqueda' },
};

function fmtDuration(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export function ClipsTab({ clips, loading, onDelete }) {
  const [expandedClipId, setExpandedClipId] = useState(null);

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-sm">Cargando clips…</p>
      </div>
    );
  }

  if (!clips || clips.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p className="text-sm">No hay clips generados</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Summary */}
      <p className="text-xs text-slate-500 px-1">
        {clips.length} clip{clips.length !== 1 ? 's' : ''} encontrado{clips.length !== 1 ? 's' : ''}
      </p>

      {/* Clips list */}
      <div className="space-y-2">
        {clips.map((clip) => {
          const isExpanded = expandedClipId === clip.id;
          const meta = CATEGORY_META[clip.category];

          return (
            <div key={clip.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
              {/* Clip header — clickable to expand */}
              <button
                onClick={() => setExpandedClipId(isExpanded ? null : clip.id)}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  {/* Category badge */}
                  {meta && (
                    <span className="shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800/50 border border-slate-700">
                      {meta.emoji} {meta.label}
                    </span>
                  )}

                  {/* Title */}
                  <span className="text-sm font-medium text-white truncate">{clip.title}</span>

                  {/* Score + Duration */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-red-400 font-semibold">{clip.score}/100</span>
                    <span className="text-slate-600">•</span>
                    <span>{fmtDuration(clip.duration)}</span>
                  </div>

                  {/* Approved badge */}
                  {clip.approved && (
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                      ✓ Aprobado
                    </span>
                  )}
                </div>

                {/* Expand arrow */}
                <span className={`shrink-0 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {/* Expanded content — full ClipCard */}
              {isExpanded && (
                <div className="border-t border-slate-800 p-4 bg-slate-900/50">
                  <ClipCard clip={clip} onDelete={onDelete} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
