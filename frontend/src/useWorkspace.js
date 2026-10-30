import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

/** Loads the signed-in user's teams, projects and assigned tasks in one go. */
export function useWorkspace() {
  const [data, setData] = useState({ teams: [], projects: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    try {
      const [teams, projects, tasks] = await Promise.all([
        api.get('/teams/mine'), api.get('/projects/mine'), api.get('/tasks/mine'),
      ]);
      setData({ teams, projects, tasks });
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { ...data, loading, error, reload };
}
