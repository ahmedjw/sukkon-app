import { http } from './client';

export type SignedUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  locale: 'en' | 'ar';
  role: string;
};

export type AuthSession = {
  token: string;
  user: SignedUser;
};

export const authApi = {
  signup: (input: { name: string; email: string; password: string; locale?: 'en' | 'ar' }) =>
    http<AuthSession>('/auth/signup', { method: 'POST', body: input }),

  signin: (input: { email: string; password: string }) =>
    http<AuthSession>('/auth/signin', { method: 'POST', body: input }),

  social: (provider: 'google' | 'facebook' | 'twitter') =>
    http<AuthSession>('/auth/social', { method: 'POST', body: { provider } }),

  forgotPassword: (email: string) =>
    http<{ ok: true; devResetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (token: string, password: string) =>
    http<{ ok: true }>('/auth/reset-password', { method: 'POST', body: { token, password } }),

  me: () => http<SignedUser>('/me'),

  deleteAccount: () => http<{ ok: true }>('/me', { method: 'DELETE' }),
};
