import type { SessionSummary } from '@components/index';

import { api } from './client';

export type SessionCategory = 'mindful' | 'sleep' | 'anxiety' | 'self' | 'family';

export type SessionDetail = SessionSummary & {
  description: string;
  author: string;
  saved: boolean;
};

const CATALOG: SessionDetail[] = [
  {
    id: 'sp1',
    title: 'Breathe & Reset (10 min)',
    category: 'Mindful',
    durationMin: 10,
    description: 'A short box-breathing routine to reset your nervous system in the middle of the day.',
    author: 'Dr. Layla Hassan',
    saved: false,
  },
  {
    id: 'sp2',
    title: 'Sleep Wind-down',
    category: 'Sleep',
    durationMin: 18,
    description: 'A guided body-scan and progressive relaxation to help you ease into sleep.',
    author: 'Dr. Sara Khoury',
    saved: false,
  },
  {
    id: 'sp3',
    title: 'Anxious Mornings',
    category: 'Anxiety',
    durationMin: 12,
    description: 'Grounding practice for the first 12 minutes of your day. Less spiral, more steadiness.',
    author: 'Dr. Lina Farah',
    saved: false,
  },
  {
    id: 'sp4',
    title: 'Self-compassion Walk',
    category: 'Self',
    durationMin: 15,
    description: 'A walking meditation to soften self-criticism and reconnect with your values.',
    author: 'Dr. Maya Younes',
    saved: false,
  },
  {
    id: 'sp5',
    title: 'Letting Go of the Day',
    category: 'Mindful',
    durationMin: 8,
    description: 'A short practice to close the workday cleanly before transitioning to home life.',
    author: 'Dr. Tom Reed',
    saved: false,
  },
  {
    id: 'sp6',
    title: 'Family Tension Reset',
    category: 'Family',
    durationMin: 14,
    description: 'A pause-before-react practice for moments of family tension.',
    author: 'Dr. Tom Reed',
    saved: false,
  },
];

const POPULAR: SessionDetail = {
  id: 'pop-1',
  title: 'Relaxing — A Conversation with Dr. Tom & Dr. Ahmad',
  category: 'Featured',
  durationMin: 32,
  description: 'A long-form conversation about everyday rituals that move us from tension to ease.',
  author: 'Dr. Tom & Dr. Ahmad',
  saved: false,
};

const SAVED = new Set<string>();

function withSaved(s: SessionDetail): SessionDetail {
  return { ...s, saved: SAVED.has(s.id) };
}

export const sessionsApi = {
  specialForYou: () =>
    api<SessionSummary[]>('GET /sessions?curated=special', () => CATALOG.slice(0, 4)),

  popular: () => api<SessionDetail>('GET /sessions/popular', () => withSaved(POPULAR)),

  list: (q?: string) =>
    api<SessionDetail[]>(`GET /sessions?q=${q ?? ''}`, () => {
      if (!q) return CATALOG.map(withSaved);
      const needle = q.toLowerCase();
      return CATALOG.filter(
        (s) => s.title.toLowerCase().includes(needle) || s.category.toLowerCase().includes(needle),
      ).map(withSaved);
    }),

  detail: (id: string) =>
    api<SessionDetail>(`GET /sessions/${id}`, () => {
      const found = id === POPULAR.id ? POPULAR : CATALOG.find((s) => s.id === id);
      if (!found) throw new Error(`Session ${id} not found`);
      return withSaved(found);
    }),

  saved: () =>
    api<SessionDetail[]>('GET /sessions/saved', () =>
      [POPULAR, ...CATALOG].filter((s) => SAVED.has(s.id)).map(withSaved),
    ),

  toggleSave: (id: string) =>
    api<{ id: string; saved: boolean }>(`POST /sessions/${id}/save`, () => {
      if (SAVED.has(id)) SAVED.delete(id);
      else SAVED.add(id);
      return { id, saved: SAVED.has(id) };
    }),
};
