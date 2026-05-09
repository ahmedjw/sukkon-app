import { api } from './client';

export type Topic = 'general' | 'friends' | 'health' | 'community' | 'marriage';

export type Post = {
  id: string;
  authorName: string;
  authorAvatarUrl?: string;
  topic: Topic;
  body: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
  createdAtIso: string;
};

const NOW = Date.now();

const STORE: Post[] = [
  {
    id: 'p1',
    authorName: 'Manar Hassan',
    topic: 'general',
    body: 'First mood log today: 7/10. Small wins count.',
    likes: 24,
    comments: 6,
    likedByMe: false,
    createdAtIso: new Date(NOW - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'p2',
    authorName: 'Adam K.',
    topic: 'friends',
    body: 'Asked an old friend how they were really doing. They cried. We talked for an hour. Worth it.',
    likes: 88,
    comments: 14,
    likedByMe: true,
    createdAtIso: new Date(NOW - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'p3',
    authorName: 'Layla F.',
    topic: 'health',
    body: 'Day 14 of walking 30 min before breakfast. The morning anxiety has actually moved.',
    likes: 152,
    comments: 22,
    likedByMe: false,
    createdAtIso: new Date(NOW - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'p4',
    authorName: 'Yusuf T.',
    topic: 'community',
    body: 'Question for everyone: what helped you the most when you started therapy?',
    likes: 41,
    comments: 31,
    likedByMe: false,
    createdAtIso: new Date(NOW - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'p5',
    authorName: 'Sara K.',
    topic: 'marriage',
    body: 'We started reading the same book before bed instead of scrolling. Tiny change, big shift.',
    likes: 209,
    comments: 18,
    likedByMe: true,
    createdAtIso: new Date(NOW - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const communityApi = {
  list: (topic?: Topic | 'all') =>
    api<Post[]>(`GET /community/posts?topic=${topic ?? 'all'}`, () => {
      const sorted = [...STORE].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
      if (!topic || topic === 'all') return sorted;
      return sorted.filter((p) => p.topic === topic);
    }),

  create: (input: { authorName: string; topic: Topic; body: string }) =>
    api<Post>('POST /community/posts', () => {
      const post: Post = {
        id: `p-${Date.now()}`,
        authorName: input.authorName,
        topic: input.topic,
        body: input.body,
        likes: 0,
        comments: 0,
        likedByMe: false,
        createdAtIso: new Date().toISOString(),
      };
      STORE.unshift(post);
      return post;
    }),

  toggleLike: (id: string) =>
    api<Post>(`POST /community/posts/${id}/like`, () => {
      const idx = STORE.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Post not found');
      const liked = !STORE[idx].likedByMe;
      STORE[idx] = {
        ...STORE[idx],
        likedByMe: liked,
        likes: STORE[idx].likes + (liked ? 1 : -1),
      };
      return STORE[idx];
    }),
};
