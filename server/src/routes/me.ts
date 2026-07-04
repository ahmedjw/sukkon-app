import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../auth/middleware.js';
import { perMinute } from '../http/rateLimit.js';
import { asyncHandler, parseBody } from '../http/validate.js';

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get(
  '/',
  asyncHandler(async (req) => {
    const u = req.user!;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      locale: u.locale as 'en' | 'ar',
      avatarUrl: u.avatarUrl ?? undefined,
      role: u.role,
    };
  }),
);

const PatchBody = z.object({
  name: z.string().min(1).optional(),
  locale: z.enum(['en', 'ar']).optional(),
  avatarUrl: z.string().url().optional(),
});

meRouter.patch(
  '/',
  asyncHandler(async (req) => {
    const body = parseBody(req, PatchBody);
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: body,
    });
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      locale: updated.locale,
      avatarUrl: updated.avatarUrl ?? undefined,
      role: updated.role,
    };
  }),
);

const MoodBody = z.object({
  mood: z.enum(['HAPPY', 'EXCITED', 'NEUTRAL', 'ANGRY', 'COOL']),
  note: z.string().max(500).optional(),
});

meRouter.post(
  '/mood',
  perMinute(30),
  asyncHandler(async (req) => {
    const body = parseBody(req, MoodBody);
    const log = await prisma.moodLog.create({
      data: { userId: req.user!.id, mood: body.mood, note: body.note },
    });
    return {
      id: log.id,
      mood: log.mood,
      note: log.note ?? undefined,
      createdAt: log.createdAt.toISOString(),
    };
  }),
);

// Full account deletion (store compliance). Personal rows are removed;
// community posts/comments are anonymized so threads stay coherent.
meRouter.delete(
  '/',
  asyncHandler(async (req) => {
    const userId = req.user!.id;
    await prisma.$transaction([
      prisma.moodLog.deleteMany({ where: { userId } }),
      prisma.savedSession.deleteMany({ where: { userId } }),
      prisma.postLike.deleteMany({ where: { userId } }),
      prisma.passwordResetToken.deleteMany({ where: { userId } }),
      prisma.comment.updateMany({ where: { userId }, data: { userId: null, authorName: 'Deleted user' } }),
      prisma.post.updateMany({ where: { authorId: userId }, data: { authorId: null, authorName: 'Deleted user' } }),
      prisma.booking.deleteMany({ where: { clientId: userId } }),
      prisma.therapist.updateMany({ where: { userId }, data: { userId: null } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
    return { ok: true };
  }),
);

meRouter.get(
  '/mood',
  asyncHandler(async (req) => {
    const logs = await prisma.moodLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return logs.map((l) => ({
      id: l.id,
      mood: l.mood,
      note: l.note ?? undefined,
      createdAt: l.createdAt.toISOString(),
    }));
  }),
);
