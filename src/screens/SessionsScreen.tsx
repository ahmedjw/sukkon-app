import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  Card,
  EmptyState,
  ErrorState,
  Input,
  SessionCard,
  Skeleton,
  useToast,
  type SessionSummary,
} from '@components/index';
import { sessionsApi, type SessionDetail } from '@/services/api';
import { useAsync, useMutation } from '@/services/hooks';
import { colors, font, radius, space } from '@theme/tokens';

type Tab = 'all' | 'mine';

export function SessionsScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('all');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.sessions')}</Text>
        <View style={styles.tabRow}>
          <TabButton label={t('sessions.tabAll')} active={tab === 'all'} onPress={() => setTab('all')} />
          <TabButton label={t('sessions.tabMine')} active={tab === 'mine'} onPress={() => setTab('mine')} />
        </View>
      </View>
      {tab === 'all' ? <AllSessions /> : <MySessions />}
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function AllSessions() {
  const { t } = useTranslation();
  const toast = useToast();
  const [query, setQuery] = useState('');

  const list = useAsync(() => sessionsApi.list(query), [query]);
  const popular = useAsync(() => sessionsApi.popular(), []);
  const toggleSave = useMutation((id: string) => sessionsApi.toggleSave(id));

  const onToggleSave = useCallback(
    async (id: string, becomingSaved: boolean) => {
      const result = await toggleSave.mutate(id);
      if (result) {
        toast.show(
          result.saved ? t('sessions.savedToast') : t('sessions.unsavedToast'),
          'success',
        );
        list.reload();
      } else if (becomingSaved) {
        toast.show(t('errors.generic'), 'error');
      }
    },
    [toggleSave, toast, t, list],
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Input
        placeholder={t('sessions.search')}
        value={query}
        onChangeText={setQuery}
      />

      <Text style={styles.sectionTitle}>{t('sessions.popular')}</Text>
      {popular.status === 'loading' && !popular.data ? (
        <Skeleton width="100%" height={160} />
      ) : popular.status === 'error' ? (
        <ErrorState onRetry={popular.reload} />
      ) : popular.data ? (
        <PopularHero session={popular.data} />
      ) : null}

      <Text style={styles.sectionTitle}>{t('sessions.recommended')}</Text>
      <SessionList state={list} onToggleSave={onToggleSave} />
    </ScrollView>
  );
}

function MySessions() {
  const { t } = useTranslation();
  const saved = useAsync(() => sessionsApi.saved(), []);
  const toggleSave = useMutation((id: string) => sessionsApi.toggleSave(id));

  const onToggleSave = async (id: string) => {
    await toggleSave.mutate(id);
    saved.reload();
  };

  if (saved.status === 'loading' && !saved.data) {
    return (
      <View style={styles.content}>
        <Skeleton width="100%" height={120} />
        <Skeleton width="100%" height={120} />
      </View>
    );
  }
  if (saved.status === 'error') return <ErrorState onRetry={saved.reload} />;

  const items = saved.data ?? [];
  if (items.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          glyph="🔖"
          title={t('sessions.savedEmpty')}
          subtitle={t('sessions.savedEmptyHint')}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {items.map((s) => (
        <SavedRow key={s.id} session={s} onUnsave={() => onToggleSave(s.id)} />
      ))}
    </ScrollView>
  );
}

function PopularHero({ session }: { session: SessionDetail }) {
  const { t } = useTranslation();
  return (
    <View style={styles.hero}>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>{session.category}</Text>
      </View>
      <Text style={styles.heroTitle} numberOfLines={2}>
        {session.title}
      </Text>
      <Text style={styles.heroAuthor}>{session.author}</Text>
      <Text style={styles.heroDuration}>
        {t('booking.minutes', { count: session.durationMin })}
      </Text>
      <Pressable style={styles.heroPlay}>
        <Text style={styles.heroPlayLabel}>▶ {t('sessions.play')}</Text>
      </Pressable>
    </View>
  );
}

function SessionList({
  state,
  onToggleSave,
}: {
  state: ReturnType<typeof useAsync<SessionDetail[]>>;
  onToggleSave: (id: string, becomingSaved: boolean) => void;
}) {
  const { t } = useTranslation();
  if (state.status === 'loading' && !state.data) {
    return (
      <View style={styles.grid}>
        <Skeleton width="48%" height={180} />
        <Skeleton width="48%" height={180} />
      </View>
    );
  }
  if (state.status === 'error') return <ErrorState onRetry={state.reload} />;
  const items = state.data ?? [];
  if (items.length === 0) return <EmptyState glyph="🌿" title={t('sessions.noResults')} />;

  return (
    <View style={styles.grid}>
      {items.map((s) => (
        <View key={s.id} style={styles.gridItem}>
          <SessionCard session={s as SessionSummary} />
          <Pressable
            style={styles.saveButton}
            onPress={() => onToggleSave(s.id, !s.saved)}
            hitSlop={6}
          >
            <Text style={[styles.saveGlyph, s.saved && styles.saveGlyphActive]}>
              {s.saved ? '★' : '☆'}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function SavedRow({ session, onUnsave }: { session: SessionDetail; onUnsave: () => void }) {
  const { t } = useTranslation();
  return (
    <Card>
      <View style={styles.savedRowInner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.savedCategory}>{session.category}</Text>
          <Text style={styles.savedTitle}>{session.title}</Text>
          <Text style={styles.savedMeta}>
            {session.author} · {t('booking.minutes', { count: session.durationMin })}
          </Text>
        </View>
        <Pressable onPress={onUnsave} hitSlop={6}>
          <Text style={[styles.saveGlyph, styles.saveGlyphActive]}>★</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { padding: space[4], gap: space[3] },
  title: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold },
  tabRow: { flexDirection: 'row', gap: space[2] },
  tabButton: {
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabLabel: { fontSize: font.size.caption, color: colors.textMd, fontWeight: font.weight.semibold },
  tabLabelActive: { color: colors.surface },
  content: { paddingHorizontal: space[4], paddingBottom: space[7], gap: space[4] },
  sectionTitle: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.semibold },
  hero: {
    backgroundColor: colors.navy,
    borderRadius: radius.xl,
    padding: space[5],
    gap: space[1],
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.yellow,
    paddingHorizontal: space[3],
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: space[2],
  },
  heroBadgeText: { color: colors.navy, fontSize: font.size.micro, fontWeight: font.weight.bold },
  heroTitle: { color: colors.surface, fontSize: font.size.h2, fontWeight: font.weight.bold },
  heroAuthor: { color: colors.surface, opacity: 0.85, fontSize: font.size.caption, marginTop: space[1] },
  heroDuration: { color: colors.surface, opacity: 0.7, fontSize: font.size.micro },
  heroPlay: {
    marginTop: space[3],
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
  },
  heroPlayLabel: { color: colors.surface, fontWeight: font.weight.bold, fontSize: font.size.body },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], rowGap: space[3] },
  gridItem: { width: '48%', position: 'relative' },
  saveButton: {
    position: 'absolute',
    top: space[2],
    right: space[2],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveGlyph: { fontSize: 18, color: colors.textMd },
  saveGlyphActive: { color: colors.yellow },
  emptyWrap: { flex: 1, justifyContent: 'center', padding: space[4] },
  savedRowInner: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  savedCategory: {
    fontSize: font.size.micro,
    color: colors.primaryDk,
    fontWeight: font.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savedTitle: { fontSize: font.size.body, color: colors.textHi, fontWeight: font.weight.semibold, marginTop: 2 },
  savedMeta: { fontSize: font.size.caption, color: colors.textMd, marginTop: 2 },
});
