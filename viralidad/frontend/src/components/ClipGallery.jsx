import { ClipCard } from './ClipCard';

export function ClipGallery({ clips, loading, onRefresh, onDelete }) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Generated Clips</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {clips.length > 0
              ? `${clips.length} clip${clips.length !== 1 ? 's' : ''} ready`
              : 'No clips yet'}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Empty state */}
      {clips.length === 0 && !loading && (
        <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl">
          <div className="text-5xl mb-4 opacity-40">✂️</div>
          <p className="text-slate-500 font-medium">No clips generated yet</p>
          <p className="text-slate-600 text-sm mt-1">
            Paste a YouTube URL above to get started
          </p>
        </div>
      )}

      {/* Clip grid */}
      {clips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
