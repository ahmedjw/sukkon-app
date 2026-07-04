import { http } from './client';

export type MoodKind = 'HAPPY' | 'EXCITED' | 'NEUTRAL' | 'ANGRY' | 'COOL';

export type MoodLog = {
  id: string;
  mood: MoodKind;
  note?: string;
  createdAt: string;
};

export const moodApi = {
  log: (input: { mood: MoodKind; note?: string }) =>
    http<MoodLog>('/me/mood', { method: 'POST', body: input }),

  history: () => http<MoodLog[]>('/me/mood'),
};
