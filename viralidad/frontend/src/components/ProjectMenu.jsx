export function ProjectMenu({ onSelect, onBack }) {
  const projects = [
    {
      id: 'centeia',
      name: 'Centeia Education',
      emoji: '🤖',
      description: 'Análisis viral especializado para contenido educativo de IA',
      status: 'Disponible',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-slate-300 mb-4 flex items-center gap-1"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-white">Infoproductos</h1>
          <p className="text-xs text-slate-500 mt-1">Selecciona un proyecto</p>
        </div>
      </header>

      {/* Projects grid */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelect(project.id)}
              className="text-left p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all group"
            >
              <div className="text-5xl mb-4">{project.emoji}</div>
              <h2 className="text-xl font-bold text-white mb-2">{project.name}</h2>
              <p className="text-sm text-slate-400 mb-4">{project.description}</p>
              <span className="inline-block text-xs px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                {project.status}
              </span>
            </button>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-12 p-6 rounded-xl border border-slate-800/50 bg-slate-900/30 text-center">
          <p className="text-sm text-slate-500">
            Más proyectos próximamente: YouTube Growth, Email Marketing, Podcast Tools
          </p>
        </div>
      </main>
    </div>
  );
}
