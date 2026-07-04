import type { TherapistSummary } from '@components/index';

import { http } from './client';

export type Condition =
  | 'BIPOLAR'
  | 'SCHIZOPHRENIA'
  | 'DEPRESSION'
  | 'ANXIETY'
  | 'ADDICTION'
  | 'FAMILY'
  | 'TRAUMA';

export type Gender = 'MALE' | 'FEMALE' | 'ANY';

export type TherapistFilters = {
  query?: string;
  minExperience?: number;
  maxExperience?: number;
  gender?: Gender;
  condition?: Condition | 'ANY';
  minBudget?: number;
  maxBudget?: number;
};

export type TherapistDetail = TherapistSummary & {
  bio: string;
  yearsExperience: number;
  hourlyRateCents: number;
  gender: Gender;
  problems: Condition[];
  reviewsCount: number;
  languages: string[];
  nextAvailable: string;
};

export const therapistsApi = {
  topRated: () =>
    http<TherapistSummary[]>('/therapists', { query: { topRated: 'true', limit: 4 } }),

  recommendedFor: (condition: Condition) =>
    http<TherapistSummary[]>('/therapists', { query: { condition, limit: 4 } }),

  list: (filters: TherapistFilters = {}) =>
    http<TherapistSummary[]>('/therapists', {
      query: {
        query: filters.query,
        minExperience: filters.minExperience,
        maxExperience: filters.maxExperience,
        gender: filters.gender,
        condition: filters.condition,
        minBudget: filters.minBudget,
        maxBudget: filters.maxBudget,
      },
    }),

  detail: (id: string) => http<TherapistDetail>(`/therapists/${id}`),
};
