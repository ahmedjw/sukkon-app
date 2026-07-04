import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/** Per-minute limiter keyed by user id when authenticated, else IP. */
export function perMinute(max: number) {
  return rateLimit({
    windowMs: 60_000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => req.user?.id ?? req.ip ?? 'unknown',
  });
}
