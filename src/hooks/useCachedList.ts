import { useCallback, useEffect, useRef, useState } from "react";
import { dataCache } from "../utils/dataCache";

export function useCachedList<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number },
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(() => {
    const f = fetcherRef.current;
    const opts = optionsRef.current;
    const cached = dataCache.get<T>(cacheKey);
    if (cached !== undefined && !dataCache.isStale(cacheKey, opts?.ttl)) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    if (cached !== undefined) {
      setData(cached);
      setLoading(true);
    } else {
      setData(null);
      setLoading(true);
    }
    setError(null);

    dataCache.fetch<T>(cacheKey, f, opts?.ttl)
      .then((fresh) => {
        if (mountedRef.current) {
          setData(fresh);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          if (cached === undefined) setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });
  }, [cacheKey]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    dataCache.invalidate(cacheKey);
    load();
  }, [cacheKey, load]);

  return { data, loading, error, refresh };
}
