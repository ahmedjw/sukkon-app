import type { Request } from 'express';
import { z } from 'zod';

export function parseBody<T extends z.ZodTypeAny>(req: Request, schema: T): z.infer<T> {
  return schema.parse(req.body);
}

export function parseQuery<T extends z.ZodTypeAny>(req: Request, schema: T): z.infer<T> {
  return schema.parse(req.query);
}

/** Tiny async wrapper so handlers can throw and the error middleware catches it. */
export function asyncHandler<T>(fn: (req: Request) => Promise<T>) {
  return async (req: any, res: any, next: any) => {
    try {
      const result = await fn(req);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
}
