import { useState } from 'react';
import { api } from '../services/api';

const PRESET_CHANNELS = {
  'ia-espanol': [
    { name: 'Centeia Education', url: 'https://www.youtube.com/@centeia-education' },
    { name: 'Dot CSV', url: 'https://www.youtube.com/@DotCSV' },
    { name: 'Learning Heroes', url: 'https://www.youtube.com/channel/UCAlC2fwu34G2nd40gCZxocQ' },
    { name: 'Javi Manzano IA', url: 'https://www.youtube.com/@javimanzanoia' },
    { name: 'EDteam', url: 'https://www.youtube.com/@EDteam' },
    { name: 'Platzi', url: 'https://www.youtube.com/@PlatziOnline' },
    { name: 'Xavier Mitjana', url: 'https://www.youtube.com/@XavierMitjana' },
    { name: 'La Inteligencia Artificial', url: 'https://www.youtube.com/@la_inteligencia_artificial' },
  ],
  'ia-global': [
    { name: 'Fireship', url: 'https://www.youtube.com/@Fireship' },
    { name: 'Two Minute Papers', url: 'https://www.youtube.com/@TwoMinutePapers' },
    { name: 'Matt Wolfe', url: 'https://www.youtube.com/@mreflow' },
    { name: 'AI Explained', url: 'https://www.youtube.com/@aiexplained-official' },
    { name: 'NetworkChuck', url: 'https://www.youtube.com/@NetworkChuck' },
    { name: 'Google DeepMind', url: 'https://www.youtube.com/@googledeepmind' },
    { name: 'OpenAI', url: 'https://www.youtube.com/@OpenAI' },
    { name: 'Anthropic', url: 'https://www.youtube.com/@anthropic-ai' },
    { name: 'Authority Hacker', url: 'https://www.youtube.com/@AuthorityHacker' },
    { name: 'Greg Isenberg', url: 'https://www.youtube.com/@GregIsenberg' },
  ],
};

export function CenteiaScraper() {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleChannelSelect = (url) => {
    setChannelUrl(url);
  };

  const handleScrapeChannel = async () => {
    if (!channelUrl.trim()) {
      setError('Ingresa una URL de canal');
      return;
    }

    setLoading(true);
    setError(null);
    setVideos([]);
    setSelectedVideos(new Set());

    try {
      const result = await api.scrapeChannel(channelUrl.trim());
      const filtered = result.videos
        .filter((v) => (v.views || 0) >= 20000)
        .sort((a, b) => (b.views || 0) - (a.views || 0));
      setVideos(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = (videoId) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map((v) => v.id)));
    }
  };

  const handleAnalyzeViralilty = async () => {
    if (selectedVideos.size === 0) {
      setError('Selecciona al menos un video para analizar');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const selectedVideosList = videos.filter((v) => selectedVideos.has(v.id));
      const result = await api.analyzeChannelViralilty(selectedVideosList);
      setAnalysisResult(result);
    } catch (err) {
      setError('Error en análisis: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportCSV = () => {
    if (videos.length === 0) {
      setError('No hay videos para exportar');
      return;
    }

    const headers = ['Título', 'Fecha', 'Duración (min)', 'Vistas', 'URL'];
    const rows = videos.map((v) => [
      `"${v.title.replace(/"/g, '""')}"`,
      v.date || '',
      v.duration ? Math.round(v.duration / 60) : '',
      v.views || '',
      v.url,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `videos_centeia_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Preset channels */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Canales de IA</h3>

        {/* IA en Español group */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium">🇪🇸 IA en Español</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-2">
            {PRESET_CHANNELS['ia-espanol'].map((ch) => (
              <button
                key={ch.url}
                onClick={() => handleChannelSelect(ch.url)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                  channelUrl === ch.url
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300'
                    : 'border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                {ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* IA Global (English) group */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium">🌍 IA Global (English)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {PRESET_CHANNELS['ia-global'].map((ch) => (
              <button
                key={ch.url}
                onClick={() => handleChannelSelect(ch.url)}
                className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                  channelUrl === ch.url
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300'
                    : 'border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                {ch.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Channel input */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Scraper de canal</h3>
        <div className="flex gap-2">
          <input
            type="url"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            placeholder="https://www.youtube.com/@canal…"
            className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-sm
                       placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/70
                       focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50 transition"
          />
          <button
            onClick={handleScrapeChannel}
            disabled={loading || !channelUrl.trim()}
            className="shrink-0 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              '📺 Scrapear'
            )}
          </button>
        </div>
        {error && (
          <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* No videos message */}
      {!loading && videos.length === 0 && channelUrl && !error && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">No hay videos con más de 20.000 vistas en este canal</p>
        </div>
      )}

      {/* Videos table */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {videos.length} video{videos.length !== 1 ? 's' : ''} con +20K vistas • {selectedVideos.size} seleccionado{selectedVideos.size !== 1 ? 's' : ''}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs px-2 py-1 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {selectedVideos.size === videos.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
              <button
                onClick={handleExportCSV}
                className="text-xs px-2 py-1 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-300 transition-colors"
              >
                📥 Exportar CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/50 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedVideos.size === videos.length && videos.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium">Título</th>
                  <th className="px-3 py-2 text-left text-slate-400 font-medium whitespace-nowrap">Fecha</th>
                  <th className="px-3 py-2 text-right text-slate-400 font-medium whitespace-nowrap">Duración</th>
                  <th className="px-3 py-2 text-right text-slate-400 font-medium whitespace-nowrap">Vistas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {videos.map((video) => (
                  <tr
                    key={video.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => handleSelectVideo(video.id)}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedVideos.has(video.id)}
                        onChange={() => handleSelectVideo(video.id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-3 py-2 text-slate-300 truncate max-w-xs">{video.title}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{video.date || '—'}</td>
                    <td className="px-3 py-2 text-slate-500 text-right whitespace-nowrap">
                      {video.duration ? Math.round(video.duration / 60) : '—'} min
                    </td>
                    <td className="px-3 py-2 text-slate-500 text-right whitespace-nowrap">
                      {video.views ? (video.views / 1000).toFixed(0) + 'K' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyzeViralilty}
            disabled={selectedVideos.size === 0 || analyzing}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg
                       bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-white transition-colors"
          >
            {analyzing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analizando…
              </span>
            ) : (
              `✨ Analizar ${selectedVideos.size} video${selectedVideos.size !== 1 ? 's' : ''} para patrones educativos`
            )}
          </button>
        </div>
      )}

      {/* Analysis result */}
      {analysisResult && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-cyan-400">Patrones de viralidad educativa encontrados</h4>
          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {analysisResult.patterns}
          </div>
          <p className="text-xs text-slate-500">
            Estos patrones se usarán para enriquecer análisis futuros de clips de contenido IA
          </p>
        </div>
      )}
    </div>
  );
}
