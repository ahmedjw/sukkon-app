import { Router } from 'express';
import { prisma } from '../db.js';
import { optionalAuth, requireAuth } from '../auth/middleware.js';
import { HttpError } from '../http/error.js';
import { asyncHandler } from '../http/validate.js';

export const sessionsRouter = Router();

type SessionRow = Awaited<ReturnType<typeof prisma.session.findMany>>[number];

async function withSaved(row: SessionRow, userId?: string) {
  let saved = false;
  if (userId) {
    const found = await prisma.savedSession.findUnique({
      where: { userId_sessionId: { userId, sessionId: row.id } },
    });
    saved = !!found;
  }
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    durationMin: row.durationMin,
    description: row.description,
    author: row.author,
    saved,
  };
}

sessionsRouter.get(
  '/',
  optionalAuth,
  asyncHandler(async (req) => {
    const q = (req.query.q as string | undefined)?.trim();
    const curated = req.query.curated as string | undefined;
    let rows = await prisma.session.findMany({ where: { popular: false } });
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(
        (s) => s.title.toLowerCase().includes(needle) || s.category.toLowerCase().includes(needle),
      );
    }
    if (curated === 'special') rows = rows.slice(0, 4);
    return Promise.all(rows.map((r) => withSaved(r, req.user?.id)));
  }),
);

sessionsRouter.get(
  '/popular',
  optionalAuth,
  asyncHandler(async (req) => {
    const row = await prisma.session.findFirst({ where: { popular: true } });
    if (!row) throw new HttpError(404, 'No popular session');
    return withSaved(row, req.user?.id);
  }),
);

sessionsRouter.get(
  '/saved',
  requireAuth,
  asyncHandler(async (req) => {
    const links = await prisma.savedSession.findMany({
      where: { userId: req.user!.id },
      include: { session: true },
    });
    return Promise.all(links.map((l) => withSaved(l.session, req.user!.id)));
  }),
);

sessionsRouter.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req) => {
    const row = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!row) throw new HttpError(404, 'Session not found');
    return withSaved(row, req.user?.id);
  }),
);

sessionsRouter.post(
  '/:id/save',
  requireAuth,
  asyncHandler(async (req) => {
    const id = req.params.id;
    const userId = req.user!.id;
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw new HttpError(404, 'Session not found');
    const exists = await prisma.savedSession.findUnique({
      where: { userId_sessionId: { userId, sessionId: id } },
    });
    if (exists) {
      await prisma.savedSession.delete({ where: { userId_sessionId: { userId, sessionId: id } } });
      return { id, saved: false };
    }
    await prisma.savedSession.create({ data: { userId, sessionId: id } });
    return { id, saved: true };
  }),
);
