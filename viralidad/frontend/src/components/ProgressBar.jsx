export function ProgressBar({ job, onClear }) {
  const stages = [
    { key: 'downloading', label: 'Descargando', icon: '⬇️' },
    { key: 'transcribing', label: 'Transcribiendo', icon: '🎙️' },
    { key: 'analyzing', label: 'Analizando', icon: '🤖' },
    { key: 'completed', label: 'Listo', icon: '✓' },
  ];

  const currentStageIndex = stages.findIndex(
    (s) => s.key === job?.status
  ) >= 0 ? stages.findIndex((s) => s.key === job?.status) :
    (job?.status === 'completed' ? 3 : 0);

  const statusMap = {
    downloading: 'Descargando video…',
    transcribing: 'Transcribiendo con Whisper…',
    analyzing: 'Analizando con GPT-4o…',
    clipping: 'Generando clips…',
    completed: '¡Video procesado con éxito!',
    failed: 'Error en el procesamiento',
  };

  const statusText = statusMap[job?.status] || 'Procesando…';
  const progress = job?.progress || 0;

  return (
    <div className="space-y-4 p-6 rounded-xl border border-slate-800 bg-slate-900/50">
      {/* Status text */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-100">{statusText}</p>
        <p className="text-xs text-slate-400">
          {progress}% • {job?.videoTitle || 'Procesando'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            job?.status === 'failed' ? 'bg-red-500' : 'bg-violet-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stages */}
      <div className="grid grid-cols-4 gap-2">
        {stages.map((stage, idx) => {
          const isActive = idx <= currentStageIndex;
          const isCompleted = idx < currentStageIndex;
          return (
            <div
              key={stage.key}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isCompleted
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : isActive
                  ? 'bg-violet-500/20 border border-violet-500/30'
                  : 'bg-slate-800/30 border border-slate-700/30'
              }`}
            >
              <span className="text-base">{stage.icon}</span>
              <p className={`text-xs font-medium ${
                isActive ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {job?.status === 'failed' && job?.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <p className="text-xs text-red-400">{job.error}</p>
        </div>
      )}

      {/* Clear button */}
      {(job?.status === 'completed' || job?.status === 'failed') && (
        <button
          onClick={onClear}
          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white transition-colors"
        >
          Procesar otro video
        </button>
      )}
    </div>
  );
}
