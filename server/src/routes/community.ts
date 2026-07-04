import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { optionalAuth, requireAuth } from '../auth/middleware.js';
import { HttpError } from '../http/error.js';
import { perMinute } from '../http/rateLimit.js';
import { asyncHandler, parseBody } from '../http/validate.js';

export const communityRouter = Router();

type PostRow = Awaited<ReturnType<typeof prisma.post.findMany>>[number];

async function shape(row: PostRow, userId?: string) {
  const [likes, comments, likedRow] = await Promise.all([
    prisma.postLike.count({ where: { postId: row.id } }),
    prisma.comment.count({ where: { postId: row.id } }),
    userId
      ? prisma.postLike.findUnique({ where: { postId_userId: { postId: row.id, userId } } })
      : Promise.resolve(null),
  ]);
  return {
    id: row.id,
    authorName: row.authorName,
    authorAvatarUrl: row.authorAvatarUrl ?? undefined,
    topic: row.topic,
    body: row.body,
    imageUrl: row.imageUrl ?? undefined,
    likes,
    comments,
    likedByMe: !!likedRow,
    createdAtIso: row.createdAt.toISOString(),
  };
}

communityRouter.get(
  '/posts',
  optionalAuth,
  asyncHandler(async (req) => {
    const topic = req.query.topic as string | undefined;
    const where = !topic || topic === 'all' ? undefined : { topic };
    const rows = await prisma.post.findMany({ where, orderBy: { createdAt: 'desc' } });
    return Promise.all(rows.map((r) => shape(r, req.user?.id)));
  }),
);

const CreateBody = z.object({
  topic: z.enum(['general', 'friends', 'health', 'community', 'marriage']),
  body: z.string().min(1).max(2000),
  imageUrl: z.string().url().optional(),
});

communityRouter.post(
  '/posts',
  requireAuth,
  perMinute(30),
  asyncHandler(async (req) => {
    const body = parseBody(req, CreateBody);
    const created = await prisma.post.create({
      data: {
        authorId: req.user!.id,
        authorName: req.user!.name,
        authorAvatarUrl: req.user!.avatarUrl,
        topic: body.topic,
        body: body.body,
        imageUrl: body.imageUrl,
      },
    });
    return shape(created, req.user!.id);
  }),
);

communityRouter.post(
  '/posts/:id/like',
  requireAuth,
  perMinute(60),
  asyncHandler(async (req) => {
    const id = req.params.id;
    const userId = req.user!.id;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new HttpError(404, 'Post not found');
    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });
    if (existing) {
      await prisma.postLike.delete({ where: { postId_userId: { postId: id, userId } } });
    } else {
      await prisma.postLike.create({ data: { postId: id, userId } });
    }
    return shape(post, userId);
  }),
);

const CommentBody = z.object({ body: z.string().min(1).max(2000) });

communityRouter.post(
  '/posts/:id/comment',
  requireAuth,
  perMinute(30),
  asyncHandler(async (req) => {
    const body = parseBody(req, CommentBody);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw new HttpError(404, 'Post not found');
    const c = await prisma.comment.create({
      data: {
        postId: post.id,
        userId: req.user!.id,
        authorName: req.user!.name,
        body: body.body,
      },
    });
    return {
      id: c.id,
      postId: c.postId,
      authorName: c.authorName,
      body: c.body,
      createdAtIso: c.createdAt.toISOString(),
    };
  }),
);
