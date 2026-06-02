const STAGES = [
  { key: 'downloading', label: 'Download' },
  { key: 'transcribing', label: 'Transcribe' },
  { key: 'analyzing', label: 'Analyze' },
  { key: 'clipping', label: 'Clip' },
];

// Maps each status to how far the pipeline has progressed
const ORDER = ['pending', 'downloading', 'transcribing', 'analyzing', 'clipping', 'completed'];

export function StageIndicator({ status }) {
  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="flex items-center flex-wrap gap-y-2">
      {STAGES.map((stage, i) => {
        const stageOrderIdx = i + 1;
        const isDone = currentIdx > stageOrderIdx;
        const isActive = currentIdx === stageOrderIdx;

        return (
          <div key={stage.key} className="flex items-center">
            <div
              className={[
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all',
                isDone
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : isActive
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30 ring-1 ring-violet-500/20'
                  : 'text-slate-600 border border-transparent',
              ].join(' ')}
            >
              {isDone && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {isActive && (
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              <span>{stage.label}</span>
            </div>

            {i < STAGES.length - 1 && (
              <div
                className={[
                  'h-px w-5 mx-0.5',
                  isDone ? 'bg-emerald-500/30' : 'bg-slate-800',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
