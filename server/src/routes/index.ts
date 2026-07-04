import { Router } from 'express';
import { prisma } from '../db.js';
import { authRouter } from './auth.js';
import { meRouter } from './me.js';
import { therapistsRouter } from './therapists.js';
import { bookingsRouter } from './bookings.js';
import { sessionsRouter } from './sessions.js';
import { podcastsRouter } from './podcasts.js';
import { communityRouter } from './community.js';

export const v1 = Router();

v1.get('/healthz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, now: new Date().toISOString() });
  } catch {
    res.status(503).json({ ok: false, message: 'Database unreachable' });
  }
});

v1.use('/auth', authRouter);
v1.use('/me', meRouter);
v1.use('/therapists', therapistsRouter);
v1.use('/bookings', bookingsRouter);
v1.use('/sessions', sessionsRouter);
v1.use('/podcasts', podcastsRouter);
v1.use('/community', communityRouter);
