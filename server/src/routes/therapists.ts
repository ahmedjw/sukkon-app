import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../http/error.js';
import { asyncHandler, parseQuery } from '../http/validate.js';

export const therapistsRouter = Router();

type TherapistRow = Awaited<ReturnType<typeof prisma.therapist.findMany>>[number];

function toDetail(t: TherapistRow) {
  return {
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    rating: t.rating,
    available: t.available,
    avatarUrl: t.avatarUrl ?? undefined,
    bio: t.bio,
    yearsExperience: t.yearsExperience,
    hourlyRateCents: t.hourlyRateCents,
    gender: t.gender,
    problems: JSON.parse(t.problems) as string[],
    reviewsCount: t.reviewsCount,
    languages: JSON.parse(t.languages) as string[],
    nextAvailable: t.nextAvailable ?? '',
  };
}

function toSummary(t: TherapistRow) {
  return {
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    rating: t.rating,
    available: t.available,
    avatarUrl: t.avatarUrl ?? undefined,
  };
}

const ListQuery = z.object({
  query: z.string().optional(),
  topRated: z.string().optional(),
  condition: z.string().optional(),
  minExperience: z.coerce.number().optional(),
  maxExperience: z.coerce.number().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'ANY']).optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

therapistsRouter.get(
  '/',
  asyncHandler(async (req) => {
    const q = parseQuery(req, ListQuery);
    const where: any = {};
    if (q.query) {
      where.OR = [
        { name: { contains: q.query } },
        { specialty: { contains: q.query } },
      ];
    }
    if (q.minExperience !== undefined) where.yearsExperience = { ...(where.yearsExperience || {}), gte: q.minExperience };
    if (q.maxExperience !== undefined) where.yearsExperience = { ...(where.yearsExperience || {}), lte: q.maxExperience };
    if (q.gender && q.gender !== 'ANY') where.gender = q.gender;
    if (q.minBudget !== undefined) where.hourlyRateCents = { ...(where.hourlyRateCents || {}), gte: q.minBudget };
    if (q.maxBudget !== undefined) where.hourlyRateCents = { ...(where.hourlyRateCents || {}), lte: q.maxBudget };

    // `problems` is a JSON-string array; matching the quoted value filters in
    // SQL so the condition applies before the row limit.
    if (q.condition && q.condition !== 'ANY') {
      where.problems = { contains: `"${q.condition}"` };
    }

    const rows = await prisma.therapist.findMany({
      where,
      orderBy: q.topRated ? { rating: 'desc' } : undefined,
      take: q.limit ?? (q.topRated || q.condition ? 4 : 50),
    });

    return rows.map(toSummary);
  }),
);

therapistsRouter.get(
  '/:id',
  asyncHandler(async (req) => {
    const t = await prisma.therapist.findUnique({ where: { id: req.params.id } });
    if (!t) throw new HttpError(404, 'Therapist not found');
    return toDetail(t);
  }),
);

therapistsRouter.get(
  '/:id/slots',
  asyncHandler(async (req) => {
    const t = await prisma.therapist.findUnique({ where: { id: req.params.id } });
    if (!t) throw new HttpError(404, 'Therapist not found');
    const now = new Date();
    const labels = ['Today', 'Tomorrow', 'Day after'];
    const out: Array<{ iso: string; label: string }> = [];
    for (let day = 0; day < 3; day++) {
      const base = new Date(now);
      base.setDate(now.getDate() + day);
      for (const hour of [10, 13, 16, 19]) {
        const slot = new Date(base);
        slot.setHours(hour, 0, 0, 0);
        if (slot.getTime() <= now.getTime()) continue;
        const h12 = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        out.push({ iso: slot.toISOString(), label: `${labels[day]} · ${h12}:00 ${ampm}` });
      }
    }
    return out;
  }),
);
