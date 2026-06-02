import { useState, useEffect, useCallback } from 'react';

export function useJobCenteia() {
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startJob = useCallback(async (url) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, contentType: 'centeia' }),
      });
      if (!res.ok) throw new Error('Failed to create job');
      const newJob = await res.json();
      setJob(newJob);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearJob = useCallback(() => setJob(null), []);

  // Open SSE stream when a new active job is created
  useEffect(() => {
    if (!job?.id) return;
    if (job.status === 'completed' || job.status === 'failed') return;

    const es = new EventSource(`/api/jobs/${job.id}/events`);

    es.onmessage = (e) => setJob(JSON.parse(e.data));
    es.addEventListener('done', () => es.close());
    es.onerror = () => es.close();

    return () => es.close();
  }, [job?.id]);

  return { job, error, isSubmitting, startJob, clearJob };
}
