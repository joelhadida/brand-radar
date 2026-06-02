import { useState } from 'react';
import { api, downloadClip } from '../services/api';

// ── Metadata maps ─────────────────────────────────────────────────────────────

const CATEGORY_META = {
  HUMOR:        { emoji: '😂', label: 'Humor',        color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  NOSTALGICO:   { emoji: '💜', label: 'Nostálgico',   color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
  DATO_CURIOSO: { emoji: '🤯', label: 'Dato Curioso', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  PERSONAL:     { emoji: '❤️', label: 'Personal',     color: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  DEBATE:       { emoji: '⚡', label: 'Debate',       color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  CARRUSEL:     { emoji: '📱', label: 'Carrusel',     color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  BUSQUEDA:     { emoji: '🔍', label: 'Búsqueda',     color: 'text-slate-400 bg-slate-700/50 border-slate-600' },
};

function scoreStyle(n) {
  if (n == null) return 'text-slate-500 bg-slate-800';
  if (n >= 80)  return 'text-red-400 bg-red-400/10';
  if (n >= 60)  return 'text-orange-400 bg-orange-400/10';
  if (n >= 40)  return 'text-yellow-400 bg-yellow-400/10';
  return 'text-slate-500 bg-slate-800';
}

function fmtDuration(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// ── CategoryBadge ─────────────────────────────────────────────────────────────

function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
      {meta.emoji} {meta.label}
    </span>
  );
}

// ── CarouselSection ───────────────────────────────────────────────────────────

function CarouselSection({ points }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-green-500/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/5 transition-colors"
      >
        <span className="flex items-center gap-1.5">📋 Ver puntos del carrusel ({points.length})</span>
        <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1.5">
          {points.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="text-green-500 font-bold shrink-0">{i + 1}.</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── VideoPreviewModal ─────────────────────────────────────────────────────────

function VideoPreviewModal({ isOpen, videoSrc, isVertical, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl overflow-hidden max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className={`bg-black ${isVertical ? 'flex justify-center' : ''}`}>
          <video
            src={videoSrc}
            controls
            autoPlay
            className={`w-full ${isVertical ? 'max-w-xs' : 'h-auto'}`}
          />
        </div>
      </div>
    </div>
  );
}

// ── HooksPanel ────────────────────────────────────────────────────────────────

function HooksPanel({ hooks, onCopy }) {
  if (!hooks?.length) return null;

  return (
    <div className="border-t border-slate-800 pt-3 space-y-2.5">
      <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
        <span>💡</span>
        Ideas de hook para reel
      </p>
      <div className="space-y-1.5">
        {hooks.map((hook, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-3 bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2.5"
          >
            <p className="text-xs text-slate-300 leading-relaxed flex-1">{hook}</p>
            <button
              onClick={() => onCopy(hook)}
              className="shrink-0 text-slate-500 hover:text-teal-400 transition-colors"
              title="Copiar al portapapeles"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ClipCard ──────────────────────────────────────────────────────────────────

export function ClipCard({ clip, onDelete }) {
  const [approved, setApproved] = useState(clip.approved || false);
  const [approving, setApproving] = useState(false);
  const [hooks, setHooks] = useState(clip.hooks || null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, isVertical: false });
  const [verticalFilename, setVerticalFilename] = useState(null);
  const [generatingVertical, setGeneratingVertical] = useState(false);
  const [observation, setObservation] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustedClip, setAdjustedClip] = useState(null);
  const [adjustError, setAdjustError] = useState(null);

  // ── Approve with auto-download ────────────────────────────────────────────

  const handleApprove = async () => {
    setApproving(true);
    try {
      const updated = await api.approveClip(clip.id);
      setApproved(updated.approved);

      if (updated.approved) {
        // Store generated hooks
        if (updated.hooks?.length) {
          setHooks(updated.hooks);
        }

        // Generate vertical version for preview
        setGeneratingVertical(true);
        api.exportVertical(clip.id)
          .then((result) => {
            setVerticalFilename(result.filename);
          })
          .catch((err) => {
            console.error('Failed to generate vertical:', err);
          })
          .finally(() => {
            setGeneratingVertical(false);
          });

        // Auto-download both versions after a delay
        setTimeout(() => {
          downloadClip(clip.filename, `${clip.videoTitle}_horizontal`);
          if (verticalFilename) {
            downloadClip(verticalFilename, `${clip.videoTitle}_vertical`);
          }
        }, 300);
      }
    } catch {
      // Approval failed
    } finally {
      setApproving(false);
    }
  };

  // ── Open preview modal (generate vertical if needed) ─────────────────────

  const handlePreviewClick = async (isVertical) => {
    if (isVertical) {
      // Always generate/check vertical before opening modal
      if (!verticalFilename && !generatingVertical) {
        setGeneratingVertical(true);
        try {
          const result = await api.exportVertical(clip.id);
          setVerticalFilename(result.filename);
          setPreviewModal({ isOpen: true, isVertical: true });
        } catch (err) {
          console.error('Failed to generate vertical:', err);
          alert('Error generando versión vertical: ' + err.message);
          setGeneratingVertical(false);
          return;
        } finally {
          setGeneratingVertical(false);
        }
      } else if (verticalFilename) {
        // Already generated, just open
        setPreviewModal({ isOpen: true, isVertical: true });
      }
    } else {
      // Horizontal is always ready
      setPreviewModal({ isOpen: true, isVertical: false });
    }
  };

  // ── Adjust ────────────────────────────────────────────────────────────────

  const handleAdjust = async () => {
    if (!observation.trim() || adjusting) return;
    setAdjusting(true);
    setAdjustError(null);
    setAdjustedClip(null);
    try {
      const result = await api.adjustClip(clip.id, observation.trim());
      setAdjustedClip(result);
      setObservation('');
    } catch (err) {
      setAdjustError(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(clip.id);
  };

  // ── Copy hook to clipboard ────────────────────────────────────────────────

  const copyHookToClipboard = (hook) => {
    navigator.clipboard.writeText(hook).then(() => {
      // Visual feedback
      alert('Hook copiado al portapapeles ✓');
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className={[
          'flex flex-col rounded-2xl overflow-hidden transition-all duration-200 border',
          approved
            ? 'border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]'
            : 'border-slate-800 bg-slate-900 hover:border-slate-700',
        ].join(' ')}
      >
        {/* ── Video preview ── */}
        <div className="relative bg-black aspect-video">
          <video
            src={`/clips/${clip.filename}`}
            preload="metadata"
            className="w-full h-full object-contain"
          />
          {clip.score != null && (
            <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${scoreStyle(clip.score)}`}>
              {clip.score >= 80 ? '🔥 ' : ''}{clip.score}/100
            </div>
          )}
          {approved && (
            <div className="absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-emerald-500/30">
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Aprobado
            </div>
          )}
        </div>

        {/* ── Metadata ── */}
        <div className="px-4 pt-4 pb-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-semibold text-white line-clamp-2">{clip.title}</h3>
              <p className="text-xs text-slate-400">{fmtDuration(clip.duration)} · {clip.category && <CategoryBadge category={clip.category} />}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{clip.reason}</p>

          {/* ── Carousel points ── */}
          {clip.carouselPoints?.length > 0 && (
            <CarouselSection points={clip.carouselPoints} />
          )}
        </div>

        {/* ── Preview + Approve buttons ── */}
        <div className="px-4 py-3 border-t border-slate-800 space-y-2.5">
          <div className="flex gap-2">
            <button
              onClick={() => handlePreviewClick(false)}
              className="flex-1 text-xs font-medium px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
            >
              📺 Ver horizontal
            </button>
            <button
              onClick={() => handlePreviewClick(true)}
              disabled={generatingVertical}
              className="flex-1 text-xs font-medium px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white disabled:opacity-50 transition-colors"
            >
              {generatingVertical ? '⏳ Generando…' : '📱 Ver vertical 9:16'}
            </button>
          </div>
          <button
            onClick={handleApprove}
            disabled={approving || approved}
            className="w-full text-xs font-semibold px-3 py-2 rounded-lg
                       bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-white transition-colors"
          >
            {approving ? 'Aprobando…' : approved ? '✓ Aprobado' : 'Aprobar'}
          </button>
        </div>

        {/* ── Hooks (shown after approval) ── */}
        {approved && hooks?.length > 0 && (
          <HooksPanel hooks={hooks} onCopy={copyHookToClipboard} />
        )}

        {/* ── Adjust ── */}
        <div className="px-4 py-3 border-t border-slate-800 space-y-2">
          <p className="text-xs font-medium text-slate-400">✏️ Ajustar clip</p>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ej: le falta contexto al inicio, corta más rápido el chiste…"
            rows={2}
            disabled={adjusting}
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 text-xs
                       text-slate-100 placeholder:text-slate-600 resize-none leading-relaxed
                       focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
                       disabled:opacity-50 transition"
          />
          <button
            onClick={handleAdjust}
            disabled={!observation.trim() || adjusting}
            className="w-full text-xs font-medium px-3 py-1.5 rounded-lg
                       bg-violet-600 hover:bg-violet-500 active:bg-violet-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-white transition-colors"
          >
            {adjusting ? 'Procesando…' : '🎬 Generar versión ajustada'}
          </button>
          {adjustError && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{adjustError}</p>
          )}
          {adjustedClip && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-3 space-y-2.5">
              <p className="text-xs text-emerald-400 font-medium">✓ Versión ajustada creada</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewModal({ isOpen: true, isVertical: false, adjustedClipPath: `/clips/${adjustedClip.filename}` })}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  👁️ Ver preview
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Replace original clip file with adjusted one
                      await fetch(`/api/clips/${clip.id}/replace-with-adjusted`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ adjustedFilename: adjustedClip.filename })
                      });
                      // Reload original clip metadata
                      setAdjustedClip(null);
                      setObservation('');
                      alert('Clip original sustituido por versión ajustada ✓');
                    } catch (err) {
                      alert('Error al sustituir: ' + err.message);
                    }
                  }}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors font-medium"
                >
                  ✓ Usar versión ajustada
                </button>
              </div>
              <button
                onClick={() => setAdjustedClip(null)}
                className="w-full text-xs px-2 py-1 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-300 transition-colors"
              >
                Descartar
              </button>
            </div>
          )}
        </div>

        {/* ── Delete ── */}
        <div className="px-4 py-3 border-t border-slate-800">
          <button
            onClick={handleDelete}
            className={[
              'w-full text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
              confirmDelete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10',
            ].join(' ')}
          >
            {confirmDelete ? '⚠️ Click again to delete' : '🗑️ Delete'}
          </button>
        </div>
      </div>

      {/* ── Video preview modal ── */}
      <VideoPreviewModal
        isOpen={previewModal.isOpen}
        videoSrc={previewModal.adjustedClipPath || `/clips/${previewModal.isVertical ? verticalFilename : clip.filename}`}
        isVertical={previewModal.isVertical}
        onClose={() => setPreviewModal({ isOpen: false, isVertical: false })}
      />
    </>
  );
}
