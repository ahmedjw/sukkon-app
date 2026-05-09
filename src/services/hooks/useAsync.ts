import { useCallback, useEffect, useRef, useState } from 'react';

type State<T> =
  | { status: 'idle'; data: undefined; error: undefined }
  | { status: 'loading'; data: T | undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: T | undefined; error: Error };

type Options = {
  /** Run the loader on mount. Defaults to true. */
  immediate?: boolean;
  /** Reset to idle between runs. Defaults to false (data is preserved while loading). */
  resetBetweenRuns?: boolean;
};

export type UseAsyncResult<T> = State<T> & {
  reload: () => Promise<void>;
};

export function useAsync<T>(
  loader: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  opts: Options = {},
): UseAsyncResult<T> {
  const { immediate = true, resetBetweenRuns = false } = opts;
  const [state, setState] = useState<State<T>>({ status: 'idle', data: undefined, error: undefined });
  const cancelRef = useRef(0);

  const run = useCallback(async () => {
    const ticket = ++cancelRef.current;
    setState((prev) =>
      resetBetweenRuns
        ? { status: 'loading', data: undefined, error: undefined }
        : { status: 'loading', data: prev.data, error: undefined },
    );
    try {
      const data = await loader();
      if (ticket === cancelRef.current) {
        setState({ status: 'success', data, error: undefined });
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (ticket === cancelRef.current) {
        setState((prev) => ({ status: 'error', data: prev.data, error: err }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) void run();
    return () => {
      cancelRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  return { ...state, reload: run };
}
