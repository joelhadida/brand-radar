import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useClips(job) {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const allClips = await api.getClips();
      // Filter clips to only show those from the current job
      if (job?.id) {
        setClips(allClips.filter(c => c.jobId === job.id));
      } else {
        setClips([]);
      }
    } catch {
      // fail silently — clips just won't update
    } finally {
      setLoading(false);
    }
  }, [job?.id]);

  // Auto-refresh when the active job finishes
  useEffect(() => {
    if (job?.status === 'completed') refresh();
  }, [job?.status, refresh]);

  const deleteClip = useCallback(async (id) => {
    await api.deleteClip(id);
    setClips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { clips, loading, refresh, deleteClip };
}
