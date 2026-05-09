import { useCallback, useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function useMutation<Args extends unknown[], R>(fn: (...args: Args) => Promise<R>) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (...args: Args): Promise<R | undefined> => {
      setStatus('loading');
      setError(null);
      try {
        const result = await fn(...args);
        setStatus('success');
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        setStatus('error');
        return undefined;
      }
    },
    [fn],
  );

  return { mutate, status, error, isLoading: status === 'loading' };
}
