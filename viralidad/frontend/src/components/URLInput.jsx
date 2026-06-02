import { useState } from 'react';

export function URLInput({ onSubmit, isLoading, error }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setUrl('');
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          disabled={isLoading}
          className="
            flex-1 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-sm
            placeholder:text-slate-600 focus:outline-none focus:border-violet-500/70
            focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 transition
          "
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="
            shrink-0 bg-violet-600 hover:bg-violet-500 active:bg-violet-700
            disabled:opacity-40 disabled:cursor-not-allowed
            text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors
          "
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Procesar'
          )}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
