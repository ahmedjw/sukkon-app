import type { TherapistSummary } from '@components/index';

import { api } from './client';

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

const ALL: TherapistDetail[] = [
  {
    id: 't1',
    name: 'Dr. Layla Hassan',
    specialty: 'Anxiety & Depression',
    rating: 4.9,
    available: true,
    yearsExperience: 12,
    hourlyRateCents: 7500,
    gender: 'FEMALE',
    problems: ['ANXIETY', 'DEPRESSION'],
    reviewsCount: 312,
    languages: ['en', 'ar'],
    nextAvailable: 'Today, 6:30 PM',
    bio: 'Clinical psychologist specialising in CBT for anxiety and mood disorders. Warm, evidence-based, bilingual (EN/AR).',
  },
  {
    id: 't2',
    name: 'Dr. Tom Reed',
    specialty: 'Family & Couples',
    rating: 4.7,
    available: true,
    yearsExperience: 18,
    hourlyRateCents: 9000,
    gender: 'MALE',
    problems: ['FAMILY'],
    reviewsCount: 421,
    languages: ['en'],
    nextAvailable: 'Tomorrow, 10:00 AM',
    bio: 'Marriage and family therapist with two decades of practice. Focus on communication and attachment repair.',
  },
  {
    id: 't3',
    name: 'Dr. Ahmad Saleh',
    specialty: 'Addiction Recovery',
    rating: 4.8,
    available: false,
    yearsExperience: 9,
    hourlyRateCents: 6500,
    gender: 'MALE',
    problems: ['ADDICTION'],
    reviewsCount: 188,
    languages: ['en', 'ar'],
    nextAvailable: 'Wed, 4:00 PM',
    bio: 'Addiction specialist using motivational interviewing and relapse-prevention frameworks.',
  },
  {
    id: 't4',
    name: 'Dr. Sara Khoury',
    specialty: 'Trauma & PTSD',
    rating: 4.9,
    available: true,
    yearsExperience: 14,
    hourlyRateCents: 8500,
    gender: 'FEMALE',
    problems: ['TRAUMA', 'ANXIETY'],
    reviewsCount: 256,
    languages: ['en', 'ar'],
    nextAvailable: 'Today, 8:00 PM',
    bio: 'Trauma-focused EMDR practitioner. Specialises in complex PTSD and anxiety co-morbidities.',
  },
  {
    id: 't5',
    name: 'Dr. Maya Younes',
    specialty: 'Bipolar specialist',
    rating: 4.8,
    available: true,
    yearsExperience: 11,
    hourlyRateCents: 7800,
    gender: 'FEMALE',
    problems: ['BIPOLAR'],
    reviewsCount: 142,
    languages: ['en', 'ar'],
    nextAvailable: 'Today, 7:00 PM',
    bio: 'Mood-disorder specialist with extensive experience in bipolar I/II care planning.',
  },
  {
    id: 't6',
    name: 'Dr. Karim Adel',
    specialty: 'Mood disorders',
    rating: 4.6,
    available: true,
    yearsExperience: 7,
    hourlyRateCents: 5500,
    gender: 'MALE',
    problems: ['BIPOLAR', 'DEPRESSION'],
    reviewsCount: 98,
    languages: ['ar'],
    nextAvailable: 'Tomorrow, 1:00 PM',
    bio: 'Psychiatrist focused on mood disorders, integrative care, and lifestyle coaching.',
  },
  {
    id: 't7',
    name: 'Dr. Hadi Nassar',
    specialty: 'Psychosis care',
    rating: 4.7,
    available: false,
    yearsExperience: 16,
    hourlyRateCents: 8200,
    gender: 'MALE',
    problems: ['SCHIZOPHRENIA'],
    reviewsCount: 174,
    languages: ['en', 'ar'],
    nextAvailable: 'Thu, 3:30 PM',
    bio: 'Senior clinician with deep experience in schizophrenia and psychosis-spectrum care.',
  },
  {
    id: 't8',
    name: 'Dr. Rana Othman',
    specialty: 'Schizophrenia',
    rating: 4.9,
    available: true,
    yearsExperience: 13,
    hourlyRateCents: 7900,
    gender: 'FEMALE',
    problems: ['SCHIZOPHRENIA'],
    reviewsCount: 205,
    languages: ['en', 'ar'],
    nextAvailable: 'Today, 5:00 PM',
    bio: 'Cognitive remediation and family-focused therapy for schizophrenia spectrum disorders.',
  },
  {
    id: 't9',
    name: 'Dr. Lina Farah',
    specialty: 'CBT for depression',
    rating: 4.7,
    available: true,
    yearsExperience: 8,
    hourlyRateCents: 6200,
    gender: 'FEMALE',
    problems: ['DEPRESSION', 'ANXIETY'],
    reviewsCount: 162,
    languages: ['en', 'ar'],
    nextAvailable: 'Today, 9:00 PM',
    bio: 'Short-term CBT and behavioural activation. Practical, structured, goal-oriented.',
  },
  {
    id: 't10',
    name: 'Dr. Yusuf Tarek',
    specialty: 'Anxiety disorders',
    rating: 4.8,
    available: true,
    yearsExperience: 10,
    hourlyRateCents: 7000,
    gender: 'MALE',
    problems: ['ANXIETY'],
    reviewsCount: 219,
    languages: ['en'],
    nextAvailable: 'Tomorrow, 11:00 AM',
    bio: 'Specialises in panic, social anxiety, and OCD. Uses exposure-response prevention.',
  },
  {
    id: 't11',
    name: 'Dr. Noor Mansour',
    specialty: 'Substance use',
    rating: 4.6,
    available: true,
    yearsExperience: 6,
    hourlyRateCents: 5000,
    gender: 'FEMALE',
    problems: ['ADDICTION'],
    reviewsCount: 84,
    languages: ['ar'],
    nextAvailable: 'Tomorrow, 2:00 PM',
    bio: 'Substance-use counsellor blending CBT with harm-reduction approaches.',
  },
];

function toSummary(t: TherapistDetail): TherapistSummary {
  return {
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    rating: t.rating,
    available: t.available,
    avatarUrl: t.avatarUrl,
  };
}

function applyFilters(items: TherapistDetail[], f: TherapistFilters): TherapistDetail[] {
  return items.filter((t) => {
    if (f.query) {
      const q = f.query.toLowerCase();
      if (!t.name.toLowerCase().includes(q) && !t.specialty.toLowerCase().includes(q)) return false;
    }
    if (f.minExperience !== undefined && t.yearsExperience < f.minExperience) return false;
    if (f.maxExperience !== undefined && t.yearsExperience > f.maxExperience) return false;
    if (f.gender && f.gender !== 'ANY' && t.gender !== f.gender) return false;
    if (f.condition && f.condition !== 'ANY' && !t.problems.includes(f.condition)) return false;
    if (f.minBudget !== undefined && t.hourlyRateCents < f.minBudget) return false;
    if (f.maxBudget !== undefined && t.hourlyRateCents > f.maxBudget) return false;
    return true;
  });
}

export const therapistsApi = {
  topRated: () =>
    api<TherapistSummary[]>('GET /therapists?sort=rating', () =>
      [...ALL].sort((a, b) => b.rating - a.rating).slice(0, 4).map(toSummary),
    ),

  recommendedFor: (condition: Condition) =>
    api<TherapistSummary[]>(`GET /therapists?condition=${condition}`, () =>
      ALL.filter((t) => t.problems.includes(condition))
        .slice(0, 4)
        .map(toSummary),
    ),

  list: (filters: TherapistFilters = {}) =>
    api<TherapistSummary[]>(`GET /therapists?${JSON.stringify(filters)}`, () =>
      applyFilters(ALL, filters).map(toSummary),
    ),

  detail: (id: string) =>
    api<TherapistDetail>(`GET /therapists/${id}`, () => {
      const found = ALL.find((t) => t.id === id);
      if (!found) throw new Error(`Therapist ${id} not found`);
      return found;
    }),
};
