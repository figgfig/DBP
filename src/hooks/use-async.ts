import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

interface InternalState<T> {
  key: string;
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Small data-loading hook with pull-to-refresh support.
 * `deps` works like a useEffect dependency list: the loader re-runs when they change.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const depsKey = JSON.stringify(deps);
  const [state, setState] = useState<InternalState<T>>({ key: depsKey, data: null, error: null, loading: true });
  const loaderRef = useRef(loader);

  // Reset to a loading state whenever the dependencies change.
  if (state.key !== depsKey) {
    setState({ key: depsKey, data: null, error: null, loading: true });
  }

  useEffect(() => {
    loaderRef.current = loader;
  });

  const refresh = useCallback(async () => {
    try {
      const result = await loaderRef.current();
      setState((prev) => ({ ...prev, data: result, error: null, loading: false }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      setState((prev) => ({ ...prev, error: message, loading: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, depsKey]);

  return { data: state.data, error: state.error, loading: state.loading, refresh };
}
