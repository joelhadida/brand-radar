import { StageIndicator } from './StageIndicator';

const STATUS_LABEL = {
  pending: 'Queued',
  downloading: 'Downloading',
  transcribing: 'Transcribing',
  analyzing: 'Analyzing with GPT-4o',
  clipping: 'Cutting clips',
  completed: 'Completed',
  failed: 'Failed',
};

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function scoreColor(n) {
  if (n >= 80) return 'text-red-400';
  if (n >= 60) return 'text-orange-400';
  if (n >= 40) return 'text-yellow-400';
  return 'text-slate-500';
}

export function JobStatus({ job, onClear }) {
  const isTerminal = job.status === 'completed' || job.status === 'failed';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {!isTerminal && (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
            </span>
          )}
          {job.status === 'completed' && (
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
          )}
          {job.status === 'failed' && (
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
          )}

          <div className="min-w-0">
            <p className="font-semibold text-sm">{STATUS_LABEL[job.status] ?? job.status}</p>
            {job.videoTitle && (
              <p className="text-slate-400 text-xs truncate mt-0.5">{job.videoTitle}</p>
            )}
          </div>
        </div>

        {isTerminal && (
          <button
            onClick={onClear}
            className="text-slate-500 hover:text-slate-300 text-xs transition-colors shrink-0"
          >
            Dismiss ✕
          </button>
        )}
      </div>

      {/* Progress bar (only while active) */}
      {!isTerminal && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{job.message}</span>
            <span className="font-mono">{job.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stage indicator (not shown for failed) */}
      {job.status !== 'failed' && (
        <StageIndicator status={job.status} />
      )}

      {/* Viral moments list — appears once GPT-4o responds */}
      {job.viralMoments && job.viralMoments.length > 0 && (
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Momentos detectados ({job.viralMoments.length})
          </p>
          {job.viralMoments.map((m, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
              {m.category && (
                <span className="text-xs font-medium text-slate-400 shrink-0 w-24 truncate">{m.category}</span>
              )}
              <span className="font-mono text-xs text-slate-500 shrink-0">
                {formatTime(m.start_time)}→{formatTime(m.end_time)}
              </span>
              <span className="text-slate-200 truncate flex-1 text-xs">{m.title}</span>
              <span className={`font-bold text-xs shrink-0 ${scoreColor(m.score)}`}>
                {m.score}/100
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Trim warning (long lives / podcasts) */}
      {job.warning && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-400 flex items-start gap-2">
          <span className="shrink-0">⚠</span>
          <span>{job.warning}</span>
        </div>
      )}

      {/* Error state */}
      {job.status === 'failed' && job.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          <span className="font-medium">Error: </span>{job.error}
        </div>
      )}

      {/* Success state */}
      {job.status === 'completed' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {job.message} — scroll down to view and download your clips
        </div>
      )}
    </div>
  );
}
