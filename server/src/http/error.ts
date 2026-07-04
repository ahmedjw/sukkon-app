import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ message: 'Validation failed', details: err.flatten() });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, details: err.details });
    return;
  }
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code;
    // Prisma known errors: P2025 record not found, P2003 broken FK reference, P2002 unique violation
    if (code === 'P2025' || code === 'P2003') {
      res.status(404).json({ message: 'Not found' });
      return;
    }
    if (code === 'P2002') {
      res.status(409).json({ message: 'Already exists' });
      return;
    }
  }
  (req.log ?? console).error(err, '[unhandled]');
  res.status(500).json({ message: 'Internal server error' });
};
