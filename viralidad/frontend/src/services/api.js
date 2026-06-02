const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  createJob: (url) =>
    request('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }),

  getJobs: () => request('/jobs'),
  getJob: (id) => request(`/jobs/${id}`),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  getClips: () => request('/clips'),
  deleteClip: (id) => request(`/clips/${id}`, { method: 'DELETE' }),
  approveClip: (id) => request(`/clips/${id}/approve`, { method: 'POST' }),
  exportVertical: (id) => request(`/clips/${id}/export-vertical`, { method: 'POST' }),
  generateHooks: (id) => request(`/clips/${id}/generate-hooks`, { method: 'POST' }),
  selectHook: (id, hook) =>
    request(`/clips/${id}/select-hook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hook }),
    }),

  getJobs: () => request('/jobs'),
  getSavedJobs: () => request('/jobs/saved'),
  searchScene: (jobId, query) =>
    request(`/jobs/${jobId}/search-scene`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }),

  adjustClip: (id, instruction) =>
    request(`/clips/${id}/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instruction }),
    }),

  scrapeChannel: (channelUrl) =>
    request('/scraper/channel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelUrl }),
    }),

  analyzeChannelViralilty: (videos) =>
    request('/scraper/analyze-viralilty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videos }),
    }),
};

export const downloadClip = (filename, label) => {
  const link = document.createElement('a');
  link.href = `/clips/${filename}`;
  link.download = `${label}.mp4`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
