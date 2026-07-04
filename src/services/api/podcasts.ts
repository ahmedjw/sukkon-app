import type { PodcastSummary } from '@components/index';

import { http } from './client';

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

export const podcastsApi = {
  list: (category: PodcastCategory = 'all') =>
    http<PodcastDetail[]>('/podcasts', { query: { category } }),

  popular: () => http<PodcastDetail[]>('/podcasts/popular'),

  recommended: () => http<PodcastDetail[]>('/podcasts/recommended'),

  detail: (id: string) => http<PodcastDetail>(`/podcasts/${id}`),
};
