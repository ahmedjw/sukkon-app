import { Router } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../http/error.js';
import { asyncHandler } from '../http/validate.js';

export const podcastsRouter = Router();

podcastsRouter.get(
  '/',
  asyncHandler(async (req) => {
    const category = (req.query.category as string | undefined) ?? 'all';
    const where = category === 'all' ? undefined : { category };
    return prisma.podcast.findMany({ where });
  }),
);

// Curated slices until play-count data exists; ordered so results are
// deterministic and the two lists don't overlap.
podcastsRouter.get(
  '/popular',
  asyncHandler(async () => {
    return prisma.podcast.findMany({ orderBy: { id: 'asc' }, take: 3 });
  }),
);

podcastsRouter.get(
  '/recommended',
  asyncHandler(async () => {
    return prisma.podcast.findMany({ orderBy: { id: 'asc' }, skip: 3, take: 4 });
  }),
);

podcastsRouter.get(
  '/:id',
  asyncHandler(async (req) => {
    const row = await prisma.podcast.findUnique({ where: { id: req.params.id } });
    if (!row) throw new HttpError(404, 'Podcast not found');
    return row;
  }),
);
