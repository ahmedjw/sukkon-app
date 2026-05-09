export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type FakeRoute<T> = () => T | Promise<T>;

type ClientOptions = {
  /** Probability (0..1) of a simulated 500 error. Useful for exercising error UI in dev. */
  failureRate?: number;
  /** Min latency in ms */
  minLatency?: number;
  /** Max latency in ms */
  maxLatency?: number;
};

const DEFAULTS: Required<ClientOptions> = {
  failureRate: 0,
  minLatency: 250,
  maxLatency: 600,
};

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function createMockClient(opts: ClientOptions = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  return async function call<T>(route: string, handler: FakeRoute<T>): Promise<T> {
    const latency = cfg.minLatency + Math.random() * (cfg.maxLatency - cfg.minLatency);
    await delay(latency);
    if (cfg.failureRate > 0 && Math.random() < cfg.failureRate) {
      throw new ApiError(500, `Mock failure on ${route}`);
    }
    return await handler();
  };
}

export const api = createMockClient();
