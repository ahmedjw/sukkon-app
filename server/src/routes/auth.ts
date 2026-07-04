import { createHash, randomBytes } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { signToken } from '../auth/jwt.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { HttpError } from '../http/error.js';
import { perMinute } from '../http/rateLimit.js';
import { asyncHandler, parseBody } from '../http/validate.js';

export const authRouter = Router();

authRouter.use(perMinute(10));

function publicUser(u: { id: string; email: string; name: string; locale: string; avatarUrl: string | null; role: string }) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    locale: u.locale as 'en' | 'ar',
    avatarUrl: u.avatarUrl ?? undefined,
    role: u.role,
  };
}

const SignupBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  locale: z.enum(['en', 'ar']).optional(),
});

authRouter.post(
  '/signup',
  asyncHandler(async (req) => {
    const body = parseBody(req, SignupBody);
    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) throw new HttpError(409, 'Email already registered');
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name,
        passwordHash,
        locale: body.locale ?? 'en',
      },
    });
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: publicUser(user) };
  }),
);

const SigninBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  '/signin',
  asyncHandler(async (req) => {
    const body = parseBody(req, SigninBody);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || !user.passwordHash) throw new HttpError(401, 'Invalid email or password');
    const ok = await verifyPassword(user.passwordHash, body.password);
    if (!ok) throw new HttpError(401, 'Invalid email or password');
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: publicUser(user) };
  }),
);

const SocialBody = z.object({
  provider: z.enum(['google', 'facebook', 'twitter']),
});

// Dev-only demo login. Real OAuth (verified provider tokens) ships post-launch;
// until then this endpoint must never be reachable in production.
authRouter.post(
  '/social',
  asyncHandler(async (req) => {
    if (env.NODE_ENV === 'production' || !env.ENABLE_DEV_SOCIAL_AUTH) {
      throw new HttpError(501, 'Social sign-in is not available yet');
    }
    const { provider } = parseBody(req, SocialBody);
    const email = `${provider}@sukoun.app`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: `Sukoun ${provider}`, locale: 'en' },
    });
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return { token, user: publicUser(user) };
  }),
);

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

const ForgotBody = z.object({ email: z.string().email() });

authRouter.post(
  '/forgot-password',
  asyncHandler(async (req) => {
    const { email } = parseBody(req, ForgotBody);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always answer {ok:true} so the endpoint can't be used to enumerate accounts.
    if (!user) return { ok: true };

    const token = randomBytes(32).toString('hex');
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(Date.now() + env.RESET_TOKEN_TTL_MIN * 60_000),
      },
    });

    // Email dispatch is the deployment's job (SMTP/SES seam). Until wired, dev
    // builds surface the token so the reset flow is testable end-to-end.
    if (env.NODE_ENV !== 'production') {
      req.log?.info({ email: user.email }, 'password reset token issued (dev)');
      return { ok: true, devResetToken: token };
    }
    return { ok: true };
  }),
);

const ResetBody = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
});

authRouter.post(
  '/reset-password',
  asyncHandler(async (req) => {
    const body = parseBody(req, ResetBody);
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(body.token) },
    });
    if (!row || row.expiresAt.getTime() < Date.now()) {
      throw new HttpError(400, 'Invalid or expired reset token');
    }
    const passwordHash = await hashPassword(body.password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
    ]);
    return { ok: true };
  }),
);
