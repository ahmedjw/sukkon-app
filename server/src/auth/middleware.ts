import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../db.js';
import { verifyToken } from './jwt.js';

export type AuthedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  locale: string;
  avatarUrl: string | null;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

async function attachUser(req: Request): Promise<AuthedUser | null> {
  const header = req.header('authorization') ?? req.header('Authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      locale: user.locale,
      avatarUrl: user.avatarUrl,
    };
  } catch {
    return null;
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const user = await attachUser(req);
  if (user) req.user = user;
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = await attachUser(req);
  if (!user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
}
