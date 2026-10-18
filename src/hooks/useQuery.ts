import { useCallback, useEffect, useState } from "react";
import { useApi } from "./useApi";

/**
 * GET a path and unwrap `{ success, data }` into `data`.
 * Pass `null` to skip the request (e.g. while an id isn't known yet).
 */
export function useQuery<T>(path: string | null) {
  const api = useApi();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    api
      .get<T>(path)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, path, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, refetch };
}
