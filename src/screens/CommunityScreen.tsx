import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  useToast,
} from '@components/index';
import { useAuth } from '@/auth';
import { communityApi, type Post, type Topic } from '@/services/api';
import { useAsync, useMutation } from '@/services/hooks';
import { colors, font, space } from '@theme/tokens';

const TOPICS: ('all' | Topic)[] = ['all', 'general', 'friends', 'health', 'community', 'marriage'];

export function CommunityScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [topic, setTopic] = useState<'all' | Topic>('all');
  const [draftBody, setDraftBody] = useState('');
  const [draftTopic, setDraftTopic] = useState<Topic>('general');

  const list = useAsync(() => communityApi.list(topic), [topic]);
  const create = useMutation((input: { body: string; topic: Topic }) =>
    communityApi.create({
      body: input.body,
      topic: input.topic,
      authorName: user?.name ?? 'You',
    }),
  );
  const like = useMutation((id: string) => communityApi.toggleLike(id));

  const onPost = async () => {
    const body = draftBody.trim();
    if (body.length < 3) {
      toast.show(t('community.tooShort'), 'error');
      return;
    }
    const result = await create.mutate({ body, topic: draftTopic });
    if (result) {
      setDraftBody('');
      list.reload();
      toast.show(t('community.posted'), 'success');
    } else {
      toast.show(t('errors.generic'), 'error');
    }
  };

  const onLike = async (id: string) => {
    await like.mutate(id);
    list.reload();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('tabs.community')}</Text>

        <Card>
          <View style={styles.composerRow}>
            <Avatar name={user?.name ?? 'You'} size={40} />
            <Text style={styles.composerLabel}>{t('community.share')}</Text>
          </View>
          <Input
            placeholder={t('community.placeholder')}
            value={draftBody}
            onChangeText={setDraftBody}
            multiline
            numberOfLines={3}
            style={{ minHeight: 64, textAlignVertical: 'top' }}
            containerStyle={{ marginTop: space[2] }}
          />
          <View style={styles.composerActions}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(['general', 'friends', 'health', 'community', 'marriage'] as Topic[]).map((tp) => (
                <Chip
                  key={tp}
                  label={t(`community.topics.${tp}`)}
                  selected={tp === draftTopic}
                  onPress={() => setDraftTopic(tp)}
                />
              ))}
            </ScrollView>
            <Button
              title={t('community.post')}
              size="sm"
              onPress={onPost}
              loading={create.isLoading}
            />
          </View>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TOPICS.map((tp) => (
            <Chip
              key={tp}
              label={tp === 'all' ? t('common.all') : t(`community.topics.${tp}`)}
              selected={tp === topic}
              onPress={() => setTopic(tp)}
            />
          ))}
        </ScrollView>

        <FeedBody state={list} onLike={onLike} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedBody({
  state,
  onLike,
}: {
  state: ReturnType<typeof useAsync<Post[]>>;
  onLike: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (state.status === 'loading' && !state.data) {
    return (
      <View style={{ gap: space[3] }}>
        <Skeleton width="100%" height={120} />
        <Skeleton width="100%" height={120} />
      </View>
    );
  }
  if (state.status === 'error') return <ErrorState onRetry={state.reload} />;
  const items = state.data ?? [];
  if (items.length === 0) return <EmptyState glyph="🌱" title={t('community.feedEmpty')} />;

  return (
    <View style={{ gap: space[3] }}>
      {items.map((p) => (
        <PostCard key={p.id} post={p} onLike={() => onLike(p.id)} />
      ))}
    </View>
  );
}

function PostCard({ post, onLike }: { post: Post; onLike: () => void }) {
  const { t } = useTranslation();
  const when = formatRelative(new Date(post.createdAtIso));

  return (
    <Card>
      <View style={styles.postHeader}>
        <Avatar name={post.authorName} uri={post.authorAvatarUrl} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={styles.postAuthor}>{post.authorName}</Text>
          <Text style={styles.postMeta}>
            {t(`community.topics.${post.topic}`)} · {when}
          </Text>
        </View>
      </View>
      <Text style={styles.postBody}>{post.body}</Text>
      <View style={styles.postActions}>
        <Pressable style={styles.action} onPress={onLike} hitSlop={6}>
          <Text style={[styles.actionGlyph, post.likedByMe && styles.actionGlyphActive]}>
            {post.likedByMe ? '♥' : '♡'}
          </Text>
          <Text style={styles.actionCount}>{post.likes}</Text>
        </Pressable>
        <View style={styles.action}>
          <Text style={styles.actionGlyph}>💬</Text>
          <Text style={styles.actionCount}>{post.comments}</Text>
        </View>
      </View>
    </Card>
  );
}

function formatRelative(d: Date): string {
  const diffSec = (Date.now() - d.getTime()) / 1000;
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return `${Math.floor(diffSec / 86400)}d`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { padding: space[4], gap: space[3], paddingBottom: space[7] },
  title: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold },
  composerRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  composerLabel: { fontSize: font.size.body, color: colors.textHi, fontWeight: font.weight.semibold },
  composerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    marginTop: space[3],
  },
  chipRow: { gap: space[2], paddingRight: space[3] },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[2] },
  postAuthor: { fontSize: font.size.body, color: colors.textHi, fontWeight: font.weight.semibold },
  postMeta: { fontSize: font.size.micro, color: colors.textMd, marginTop: 2 },
  postBody: { fontSize: font.size.body, color: colors.textHi, lineHeight: font.lineHeight.body },
  postActions: { flexDirection: 'row', gap: space[5], marginTop: space[3] },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionGlyph: { fontSize: 18, color: colors.textMd },
  actionGlyphActive: { color: colors.danger },
  actionCount: { fontSize: font.size.caption, color: colors.textMd, fontWeight: font.weight.medium },
});
