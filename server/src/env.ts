import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  CORS_ORIGIN: z.string().default('*'),
  // Dev-only escape hatch: mints a demo account for the social buttons. Never honored in production.
  ENABLE_DEV_SOCIAL_AUTH: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  // Minutes a password-reset token stays valid.
  RESET_TOKEN_TTL_MIN: z.coerce.number().default(30),
});

export const env = schema.parse(process.env);

if (env.NODE_ENV === 'production') {
  if (/change-me|dev-secret|example|placeholder/i.test(env.JWT_SECRET)) {
    throw new Error('JWT_SECRET is a placeholder value — set a real random secret in production.');
  }
  if (env.CORS_ORIGIN === '*') {
    throw new Error('CORS_ORIGIN must list explicit origins in production (comma-separated).');
  }
}
