import { api } from './client';

export type MoodKind = 'HAPPY' | 'EXCITED' | 'NEUTRAL' | 'ANGRY' | 'COOL';

export type MoodLog = {
  id: string;
  mood: MoodKind;
  note?: string;
  createdAt: string;
};

const moodHistory: MoodLog[] = [];

export const moodApi = {
  /** POST /me/mood */
  log: (input: { mood: MoodKind; note?: string }) =>
    api('POST /me/mood', () => {
      const entry: MoodLog = {
        id: Math.random().toString(36).slice(2, 10),
        mood: input.mood,
        note: input.note,
        createdAt: new Date().toISOString(),
      };
      moodHistory.unshift(entry);
      return entry;
    }),

  /** GET /me/mood */
  history: () => api<MoodLog[]>('GET /me/mood', () => [...moodHistory]),
};
