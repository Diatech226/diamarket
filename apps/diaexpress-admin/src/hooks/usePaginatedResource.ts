'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaginatedParams, PaginatedResult } from '@/src/types/pagination';

export type PaginatedResourceState<T> = PaginatedResult<T> & {
  loading: boolean;
  error: Error | null;
  setParams: (params: Partial<PaginatedParams>) => void;
  refresh: () => Promise<void>;
};

export function usePaginatedResource<T>(
  fetcher: (params: PaginatedParams) => Promise<PaginatedResult<T>>,
  initialParams: PaginatedParams = { page: 1, pageSize: 10 }
): PaginatedResourceState<T> {
  const [params, setParamsState] = useState<PaginatedParams>(initialParams);
  const paramsRef = useRef(params);
  const [result, setResult] = useState<PaginatedResult<T>>({ items: [], total: 0, page: 1, pageSize: initialParams.pageSize ?? 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (override?: Partial<PaginatedParams>) => {
    setLoading(true);
    setError(null);
    const nextParams = { ...paramsRef.current, ...override };
    try {
      const data = await fetcher(nextParams);
      setResult(data);
      paramsRef.current = nextParams;
      setParamsState(nextParams);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...result,
    loading,
    error,
    setParams: (partial) => {
      void load(partial);
    },
    refresh: () => load()
  };
}
