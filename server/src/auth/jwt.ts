import jwt from 'jsonwebtoken';
import { env } from '../env.js';

const EXPIRES_IN = '30d';

export type JwtPayload = {
  sub: string; // user id
  email: string;
  role: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
