export function MainMenu({ onSelect }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 px-4">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-4xl font-bold text-white">Momentio</h1>
        <p className="text-slate-400">Platform de análisis viral</p>
      </div>

      {/* Menu buttons */}
      <div className="flex flex-col gap-4 max-w-md w-full">
        {/* Momentio TV */}
        <button
          onClick={() => onSelect('stream-zero')}
          className="group p-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-violet-900/10 hover:border-violet-500/50 hover:from-violet-600/20 hover:to-violet-900/20 transition-all"
        >
          <div className="text-4xl mb-3">📺</div>
          <h2 className="text-xl font-bold text-white mb-2">Momentio TV</h2>
          <p className="text-sm text-slate-400">
            Analiza videos en vivo, extrae clips virales, buscador de escenas y scraper de canales
          </p>
        </button>

        {/* Infoproductos */}
        <button
          onClick={() => onSelect('infoproductos')}
          className="group p-8 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-emerald-900/10 hover:border-emerald-500/50 hover:from-emerald-600/20 hover:to-emerald-900/20 transition-all"
        >
          <div className="text-4xl mb-3">🎓</div>
          <h2 className="text-xl font-bold text-white mb-2">Infoproductos</h2>
          <p className="text-sm text-slate-400">
            Suite de herramientas especializadas para diferentes tipos de contenido
          </p>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-slate-600">
        <p>Powered by yt-dlp, Whisper, GPT-4o</p>
      </div>
    </div>
  );
}
