import { http } from './client';

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

export const communityApi = {
  list: (topic?: Topic | 'all') =>
    http<Post[]>('/community/posts', { query: { topic: topic ?? 'all' } }),

  // `authorName` is no longer needed — backend uses the JWT'd user — but kept in the
  // signature so screens don't need to change.
  create: (input: { authorName?: string; topic: Topic; body: string }) =>
    http<Post>('/community/posts', {
      method: 'POST',
      body: { topic: input.topic, body: input.body },
    }),

  toggleLike: (id: string) => http<Post>(`/community/posts/${id}/like`, { method: 'POST' }),

  comment: (id: string, body: string) =>
    http<{ id: string; body: string; authorName: string; createdAtIso: string }>(
      `/community/posts/${id}/comment`,
      { method: 'POST', body: { body } },
    ),
};
