import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

export function useResource(path) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!path) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    api(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error });
      });
    return () => controller.abort();
  }, [path, revision]);
  return { ...state, reload };
}
