import { useState } from 'react';
import { useJobCenteia } from '../hooks/useJobCenteia';
import { useClips } from '../hooks/useClips';
import { URLInput } from './URLInput';
import { ProgressBar } from './ProgressBar';
import { ClipsTab } from './ClipsTab';
import { SceneSearchTab } from './SceneSearchTab';
import { CenteiaScraper } from './CenteiaScraper';

export function CenteiApp({ onBack }) {
  const { job, error, isSubmitting, startJob, clearJob } = useJobCenteia();
  const { clips, loading, refresh, deleteClip } = useClips(job);
  const [activeTab, setActiveTab] = useState('clips');
  const [showScraper, setShowScraper] = useState(false);

  const isProcessing = job && job.status !== 'completed' && job.status !== 'failed';
  const isCompleted = job && job.status === 'completed';

  const handleNewSearch = () => {
    clearJob();
    setActiveTab('clips');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-slate-300 mb-4 flex items-center gap-1"
          >
            ← Volver
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-base">
              🤖
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Centeia Education</h1>
              <p className="text-xs text-slate-500 mt-0.5">Análisis viral para contenido educativo de IA</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* MODE SWITCHER */}
        <div className="flex gap-2 border-b border-slate-800 pb-4">
          <button
            onClick={() => setShowScraper(false)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              !showScraper
                ? 'border-cyan-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            📹 Analizar clips
          </button>
          <button
            onClick={() => setShowScraper(true)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              showScraper
                ? 'border-cyan-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            📺 Scraper de canales
          </button>
        </div>

        {!showScraper && (
          <>
            {/* 1. INPUT SECTION */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-300">Procesar video</h2>
              <URLInput onSubmit={startJob} isLoading={isSubmitting} error={error} />
            </section>

            {/* 2. PROGRESS SECTION */}
            {(isProcessing || isCompleted) && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-300">Progreso</h2>
                <ProgressBar job={job} onClear={clearJob} />
              </section>
            )}

            {/* 3. RESULTS SECTION — Two tabs */}
            {isCompleted && (
              <section className="space-y-4">
                <div className="flex gap-2 border-b border-slate-800 items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('clips')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'clips'
                          ? 'border-cyan-500 text-white'
                          : 'border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      📹 Clips automáticos
                    </button>
                    <button
                      onClick={() => setActiveTab('search')}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'search'
                          ? 'border-cyan-500 text-white'
                          : 'border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      🔍 Buscar escena
                    </button>
                  </div>
                  <div className="flex gap-2 pb-2">
                    <button
                      onClick={refresh}
                      className="px-3 py-1 text-xs rounded-lg border border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-colors"
                      title="Refrescar clips"
                    >
                      🔄 Refrescar
                    </button>
                    <button
                      onClick={handleNewSearch}
                      className="px-3 py-1 text-xs rounded-lg border border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600 transition-colors"
                      title="Nueva búsqueda"
                    >
                      ⟲ Nueva búsqueda
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  {activeTab === 'clips' && (
                    <ClipsTab clips={clips} loading={loading} onDelete={deleteClip} />
                  )}
                  {activeTab === 'search' && (
                    <SceneSearchTab job={job} onClipCreated={refresh} />
                  )}
                </div>
              </section>
            )}

            {/* Empty state */}
            {!job && !isProcessing && !isCompleted && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-sm">Ingresa una URL de YouTube para comenzar análisis de contenido IA</p>
              </div>
            )}
          </>
        )}

        {/* SCRAPER SECTION */}
        {showScraper && (
          <section className="space-y-4">
            <CenteiaScraper />
          </section>
        )}
      </main>
    </div>
  );
}
