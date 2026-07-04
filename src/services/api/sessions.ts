import type { SessionSummary } from '@components/index';

import { http } from './client';

export type SessionCategory = 'mindful' | 'sleep' | 'anxiety' | 'self' | 'family';

export type SessionDetail = SessionSummary & {
  description: string;
  author: string;
  saved: boolean;
};

export const sessionsApi = {
  specialForYou: () =>
    http<SessionSummary[]>('/sessions', { query: { curated: 'special' } }),

  popular: () => http<SessionDetail>('/sessions/popular'),

  list: (q?: string) => http<SessionDetail[]>('/sessions', { query: { q } }),

  detail: (id: string) => http<SessionDetail>(`/sessions/${id}`),

  saved: () => http<SessionDetail[]>('/sessions/saved'),

  toggleSave: (id: string) =>
    http<{ id: string; saved: boolean }>(`/sessions/${id}/save`, { method: 'POST' }),
};
