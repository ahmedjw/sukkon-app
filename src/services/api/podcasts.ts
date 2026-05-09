import type { PodcastSummary } from '@components/index';

import { api } from './client';

export type PodcastCategory =
  | 'all'
  | 'family'
  | 'food'
  | 'spouse'
  | 'kids'
  | 'self'
  | 'world';

export type PodcastDetail = PodcastSummary & {
  category: Exclude<PodcastCategory, 'all'>;
  description: string;
};

const CATALOG: PodcastDetail[] = [
  {
    id: 'pc1',
    title: 'On Sleep, Stillness, and Self',
    author: 'Dr. Layla Hassan',
    durationMin: 28,
    category: 'self',
    description: 'A long conversation about why sleep is the foundation of mental health.',
  },
  {
    id: 'pc2',
    title: 'Modern Marriage, Old Wisdom',
    author: 'Dr. Tom Reed',
    durationMin: 41,
    category: 'spouse',
    description: 'On building partnerships that survive the noise of modern life.',
  },
  {
    id: 'pc3',
    title: 'When Your Kid Stops Talking',
    author: 'Dr. Sara Khoury',
    durationMin: 33,
    category: 'kids',
    description: 'How to keep the door open during the silent years.',
  },
  {
    id: 'pc4',
    title: 'Family Recipes, Family Repair',
    author: 'Dr. Karim Adel',
    durationMin: 22,
    category: 'food',
    description: 'How a shared meal can become an unspoken apology.',
  },
  {
    id: 'pc5',
    title: 'Belonging in a Big World',
    author: 'Dr. Maya Younes',
    durationMin: 36,
    category: 'world',
    description: 'On loneliness, the modern city, and finding your people.',
  },
  {
    id: 'pc6',
    title: 'The Family Circle',
    author: 'Dr. Tom Reed',
    durationMin: 29,
    category: 'family',
    description: 'Conversations that hold a family together when the years get heavy.',
  },
];

export const podcastsApi = {
  list: (category: PodcastCategory = 'all') =>
    api<PodcastDetail[]>(`GET /podcasts?category=${category}`, () =>
      category === 'all' ? CATALOG : CATALOG.filter((p) => p.category === category),
    ),

  popular: () => api<PodcastDetail[]>('GET /podcasts/popular', () => CATALOG.slice(0, 3)),

  recommended: () =>
    api<PodcastDetail[]>('GET /podcasts/recommended', () => CATALOG.slice(2, 6)),

  detail: (id: string) =>
    api<PodcastDetail>(`GET /podcasts/${id}`, () => {
      const p = CATALOG.find((x) => x.id === id);
      if (!p) throw new Error(`Podcast ${id} not found`);
      return p;
    }),
};
