import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  Card,
  EmptyState,
  ErrorState,
  PodcastRow,
  Skeleton,
  type PodcastSummary,
} from '@components/index';
import { useAuth } from '@/auth';
import { podcastsApi, type PodcastCategory, type PodcastDetail } from '@/services/api';
import { useAsync } from '@/services/hooks';
import { colors, font, radius, space } from '@theme/tokens';

const CATEGORIES: { key: PodcastCategory; glyph: string }[] = [
  { key: 'all', glyph: '✨' },
  { key: 'family', glyph: '👨‍👩‍👧' },
  { key: 'food', glyph: '🍲' },
  { key: 'spouse', glyph: '💞' },
  { key: 'kids', glyph: '🧒' },
  { key: 'self', glyph: '🌿' },
  { key: 'world', glyph: '🌍' },
];

export function PodcastScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [category, setCategory] = useState<PodcastCategory>('all');
  const [playing, setPlaying] = useState<PodcastDetail | null>(null);

  const list = useAsync(() => podcastsApi.list(category), [category]);
  const popular = useAsync(() => podcastsApi.popular(), []);
  const recommended = useAsync(() => podcastsApi.recommended(), []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {t('podcast.greeting', { name: user?.name ?? 'Manar' })}
        </Text>

        <View style={styles.categoryRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setCategory(c.key)}
              style={[styles.categoryItem, category === c.key && styles.categoryItemActive]}
            >
              <Text style={styles.categoryGlyph}>{c.glyph}</Text>
              <Text
                style={[styles.categoryLabel, category === c.key && styles.categoryLabelActive]}
                numberOfLines={1}
              >
                {t(`podcast.categories.${c.key}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('podcast.popular')}</Text>
        <PopularList state={popular} onPlay={setPlaying} />

        <Text style={styles.sectionTitle}>{t('podcast.specialForYou')}</Text>
        <PodcastList state={list} onPlay={setPlaying} />

        <Text style={styles.sectionTitle}>{t('podcast.recommended')}</Text>
        <PodcastList state={recommended} onPlay={setPlaying} />
      </ScrollView>

      {playing ? <MiniPlayer podcast={playing} onStop={() => setPlaying(null)} /> : null}
    </SafeAreaView>
  );
}

function PopularList({
  state,
  onPlay,
}: {
  state: ReturnType<typeof useAsync<PodcastDetail[]>>;
  onPlay: (p: PodcastDetail) => void;
}) {
  if (state.status === 'loading' && !state.data) {
    return <Skeleton width="100%" height={120} />;
  }
  if (state.status === 'error') return <ErrorState onRetry={state.reload} />;
  const items = state.data ?? [];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
      {items.map((p) => (
        <Pressable key={p.id} onPress={() => onPlay(p)} style={styles.popularCard}>
          <View style={styles.popularCover} />
          <Text style={styles.popularTitle} numberOfLines={2}>
            {p.title}
          </Text>
          <Text style={styles.popularAuthor} numberOfLines={1}>
            {p.author}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function PodcastList({
  state,
  onPlay,
}: {
  state: ReturnType<typeof useAsync<PodcastDetail[]>>;
  onPlay: (p: PodcastDetail) => void;
}) {
  const { t } = useTranslation();
  if (state.status === 'loading' && !state.data) {
    return (
      <View style={{ gap: space[2] }}>
        <Skeleton width="100%" height={64} />
        <Skeleton width="100%" height={64} />
      </View>
    );
  }
  if (state.status === 'error') return <ErrorState onRetry={state.reload} />;
  const items = state.data ?? [];
  if (items.length === 0) return <EmptyState glyph="🎙️" title={t('podcast.empty')} />;

  return (
    <Card>
      {items.map((p, idx) => (
        <View key={p.id}>
          <PodcastRow podcast={p as PodcastSummary} onPlay={() => onPlay(p)} onPress={() => onPlay(p)} />
          {idx < items.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </Card>
  );
}

function MiniPlayer({ podcast, onStop }: { podcast: PodcastDetail; onStop: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={styles.miniPlayer}>
      <View style={styles.miniCover} />
      <View style={{ flex: 1 }}>
        <Text style={styles.miniTitle} numberOfLines={1}>
          {podcast.title}
        </Text>
        <Text style={styles.miniAuthor} numberOfLines={1}>
          {podcast.author} · {t('booking.minutes', { count: podcast.durationMin })}
        </Text>
      </View>
      <Pressable style={styles.miniButton} onPress={onStop} hitSlop={8}>
        <Text style={styles.miniButtonGlyph}>■</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { padding: space[4], gap: space[4], paddingBottom: 120 },
  title: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: space[3],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  categoryItemActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  categoryGlyph: { fontSize: 22 },
  categoryLabel: { fontSize: font.size.micro, color: colors.textMd, fontWeight: font.weight.medium },
  categoryLabelActive: { color: colors.primaryDk, fontWeight: font.weight.bold },
  sectionTitle: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.semibold },
  popularRow: { gap: space[3] },
  popularCard: {
    width: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: space[3],
    gap: space[1],
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularCover: {
    aspectRatio: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    marginBottom: space[2],
  },
  popularTitle: { fontSize: font.size.body, color: colors.textHi, fontWeight: font.weight.semibold },
  popularAuthor: { fontSize: font.size.caption, color: colors.textMd },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 56 + space[3] },
  miniPlayer: {
    position: 'absolute',
    left: space[3],
    right: space[3],
    bottom: space[3],
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  miniCover: { width: 40, height: 40, backgroundColor: colors.primary, borderRadius: radius.md },
  miniTitle: { color: colors.surface, fontSize: font.size.body, fontWeight: font.weight.semibold },
  miniAuthor: { color: colors.surface, opacity: 0.75, fontSize: font.size.micro },
  miniButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniButtonGlyph: { color: colors.surface, fontSize: 14 },
});
