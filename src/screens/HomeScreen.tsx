import { useCallback, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth';
import {
  Avatar,
  BannerCTA,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  IconButton,
  MoodPicker,
  SessionCard,
  Skeleton,
  TherapistCard,
  TherapistCardSkeleton,
  useToast,
  type Mood,
  type SessionSummary,
  type TherapistSummary,
} from '@components/index';
import { moodApi, sessionsApi, therapistsApi, type Condition, type MoodKind } from '@/services/api';
import { useAsync, useMutation } from '@/services/hooks';
import { colors, font, space } from '@theme/tokens';

const CONDITIONS: Condition[] = ['DEPRESSION', 'ANXIETY', 'BIPOLAR', 'SCHIZOPHRENIA', 'ADDICTION'];

function getGreetingKey(): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' {
  const h = new Date().getHours();
  if (h < 12) return 'greetingMorning';
  if (h < 18) return 'greetingAfternoon';
  return 'greetingEvening';
}

type Props = {
  onOpenSettings: () => void;
  onStartBooking: (mode: 'instant' | 'scheduled') => void;
  onOpenTherapist: (id: string) => void;
};

export function HomeScreen({ onOpenSettings, onStartBooking, onOpenTherapist }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const userName = user?.name ?? 'Manar';

  const [mood, setMood] = useState<Mood | undefined>();
  const [condition, setCondition] = useState<Condition>('DEPRESSION');

  const topRated = useAsync(() => therapistsApi.topRated(), []);
  const special = useAsync(() => sessionsApi.specialForYou(), []);
  const recommended = useAsync(
    () => therapistsApi.recommendedFor(condition),
    [condition],
  );

  const logMood = useMutation((m: MoodKind) => moodApi.log({ mood: m }));

  const onPickMood = useCallback(
    async (m: Mood) => {
      setMood(m);
      const result = await logMood.mutate(m as MoodKind);
      if (result) toast.show(t('home.moodLogged'), 'success');
      else toast.show(t('errors.generic'), 'error');
    },
    [logMood, toast, t],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={onOpenSettings} hitSlop={8}>
            <Avatar name={userName} size={44} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{t('app.tagline')}</Text>
            <Text style={styles.greeting}>{t(`home.${getGreetingKey()}`, { name: userName })}</Text>
          </View>
          <IconButton icon={Bell} />
        </View>

        <Card>
          <Text style={styles.sectionTitle}>{t('home.moodPrompt')}</Text>
          <View style={{ marginTop: space[3] }}>
            <MoodPicker value={mood} onChange={onPickMood} />
          </View>
        </Card>

        <View style={styles.consultRow}>
          <BannerCTA
            title={t('home.consultInstant')}
            subtitle={t('home.instantSubtitle')}
            ctaLabel={t('home.instantCta')}
            onPress={() => onStartBooking('instant')}
            style={{ flex: 1 }}
          />
          <BannerCTA
            title={t('home.consultScheduled')}
            subtitle={t('home.scheduledSubtitle')}
            ctaLabel={t('home.scheduledCta')}
            onPress={() => onStartBooking('scheduled')}
            style={{ flex: 1 }}
          />
        </View>

        <SectionTitle>{t('home.specialForYou')}</SectionTitle>
        <SpecialForYou state={special} />

        <SectionTitle>{t('home.topRated')}</SectionTitle>
        <TherapistList
          state={topRated}
          emptyKey="home.noTherapists"
          onOpenTherapist={onOpenTherapist}
        />

        <SectionTitle>{t('home.recommended')}</SectionTitle>
        <ConditionPills value={condition} onChange={setCondition} />
        <TherapistList
          state={recommended}
          emptyKey="home.noTherapists"
          compact
          onOpenTherapist={onOpenTherapist}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function SpecialForYou({ state }: { state: ReturnType<typeof useAsync<SessionSummary[]>> }) {
  const { t } = useTranslation();
  if (state.status === 'loading' && !state.data) {
    return (
      <View style={styles.specialSkeletonRow}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.skeletonCard}>
            <Skeleton height={110} />
            <View style={{ padding: space[3], gap: 6 }}>
              <Skeleton width="60%" height={10} />
              <Skeleton width="80%" height={14} />
            </View>
          </View>
        ))}
      </View>
    );
  }
  if (state.status === 'error') return <ErrorState onRetry={state.reload} />;
  const items = state.data ?? [];
  if (items.length === 0) return <EmptyState title={t('home.specialEmpty')} />;

  return (
    <FlatList
      horizontal
      data={items}
      keyExtractor={(s) => s.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: space[3], paddingRight: space[4] }}
      renderItem={({ item }) => <SessionCard session={item} width={180} />}
    />
  );
}

function TherapistList({
  state,
  emptyKey,
  compact = false,
  onOpenTherapist,
}: {
  state: ReturnType<typeof useAsync<TherapistSummary[]>>;
  emptyKey: string;
  compact?: boolean;
  onOpenTherapist: (id: string) => void;
}) {
  const { t } = useTranslation();

  if (state.status === 'loading' && !state.data) {
    return (
      <View style={{ gap: space[3] }}>
        {Array.from({ length: compact ? 2 : 3 }).map((_, i) => (
          <TherapistCardSkeleton key={i} />
        ))}
      </View>
    );
  }
  if (state.status === 'error') return <ErrorState onRetry={state.reload} />;
  const items = state.data ?? [];
  if (items.length === 0) return <EmptyState title={t(emptyKey)} />;

  return (
    <View style={{ gap: space[3] }}>
      {items.map((th) => (
        <TherapistCard
          key={th.id}
          therapist={th}
          onPress={() => onOpenTherapist(th.id)}
          onBook={() => onOpenTherapist(th.id)}
        />
      ))}
    </View>
  );
}

function ConditionPills({
  value,
  onChange,
}: {
  value: Condition;
  onChange: (c: Condition) => void;
}) {
  const { t } = useTranslation();
  return (
    <FlatList
      horizontal
      data={CONDITIONS}
      keyExtractor={(c) => c}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: space[2], paddingRight: space[4] }}
      renderItem={({ item }) => (
        <Chip
          label={t(`conditions.${item}`)}
          selected={item === value}
          onPress={() => onChange(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { padding: space[4], gap: space[4], paddingBottom: space[7] },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  eyebrow: {
    fontSize: font.size.micro,
    color: colors.primaryDk,
    fontWeight: font.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  greeting: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold },
  sectionTitle: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.semibold },
  consultRow: { flexDirection: 'row', gap: space[3] },
  specialSkeletonRow: { flexDirection: 'row', gap: space[3] },
  skeletonCard: {
    width: 180,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
