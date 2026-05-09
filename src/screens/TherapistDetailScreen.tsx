import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  Avatar,
  Button,
  Card,
  Chip,
  ErrorState,
  RatingStars,
  Skeleton,
} from '@components/index';
import { therapistsApi } from '@/services/api';
import { useAsync } from '@/services/hooks';
import { colors, font, radius, space } from '@theme/tokens';

type Props = {
  therapistId: string;
  onBack: () => void;
  onBook: () => void;
};

export function TherapistDetailScreen({ therapistId, onBack, onBook }: Props) {
  const { t } = useTranslation();
  const detail = useAsync(() => therapistsApi.detail(therapistId), [therapistId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>← {t('common.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('therapists.detailTitle')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {detail.status === 'loading' && !detail.data ? (
        <View style={styles.body}>
          <Skeleton width="100%" height={140} />
          <Skeleton width="80%" height={20} />
          <Skeleton width="60%" height={14} />
          <Skeleton width="100%" height={80} />
        </View>
      ) : detail.status === 'error' ? (
        <ErrorState onRetry={detail.reload} />
      ) : detail.data ? (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <Avatar name={detail.data.name} size={96} />
              <Text style={styles.name}>{detail.data.name}</Text>
              <Text style={styles.specialty}>{detail.data.specialty}</Text>
              <View style={{ marginTop: space[2] }}>
                <RatingStars rating={detail.data.rating} size={16} />
              </View>
              <Text style={styles.reviewCount}>
                {t('therapists.reviewsCount', { count: detail.data.reviewsCount })}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <Stat
                label={t('therapists.experience')}
                value={t('therapists.years', { count: detail.data.yearsExperience })}
              />
              <Stat
                label={t('therapists.rate')}
                value={`$${(detail.data.hourlyRateCents / 100).toFixed(0)}/hr`}
              />
              <Stat
                label={t('therapists.next')}
                value={detail.data.nextAvailable}
              />
            </View>

            <Card>
              <Text style={styles.sectionTitle}>{t('therapists.about')}</Text>
              <Text style={styles.bio}>{detail.data.bio}</Text>
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>{t('therapists.specialties')}</Text>
              <View style={styles.chipRow}>
                {detail.data.problems.map((p) => (
                  <Chip key={p} label={t(`conditions.${p}`)} />
                ))}
              </View>
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>{t('therapists.languages')}</Text>
              <View style={styles.chipRow}>
                {detail.data.languages.map((l) => (
                  <Chip key={l} label={t(`common.${l === 'en' ? 'english' : 'arabic'}`)} />
                ))}
              </View>
            </Card>
          </ScrollView>

          <View style={styles.bookBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookPrice}>
                ${(detail.data.hourlyRateCents / 100).toFixed(0)}/hr
              </Text>
              <Text style={styles.bookAvail}>
                {detail.data.available ? t('therapists.available') : t('therapists.offline')}
              </Text>
            </View>
            <Button title={t('therapists.book')} onPress={onBook} size="lg" />
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    paddingVertical: space[3],
  },
  back: { color: colors.primary, fontSize: font.size.body, fontWeight: font.weight.semibold },
  headerTitle: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.bold },
  body: { padding: space[4], gap: space[3] },
  scroll: { padding: space[4], gap: space[3], paddingBottom: space[7] },
  hero: { alignItems: 'center', gap: space[2], paddingVertical: space[3] },
  name: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold },
  specialty: { fontSize: font.size.body, color: colors.textMd },
  reviewCount: { fontSize: font.size.caption, color: colors.textMd, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[3],
    justifyContent: 'space-between',
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: font.size.body, color: colors.textHi, fontWeight: font.weight.semibold },
  statLabel: { fontSize: font.size.micro, color: colors.textMd, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: {
    fontSize: font.size.h3,
    color: colors.textHi,
    fontWeight: font.weight.semibold,
    marginBottom: space[2],
  },
  bio: { fontSize: font.size.body, color: colors.textMd, lineHeight: font.lineHeight.body },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  bookBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookPrice: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.bold },
  bookAvail: { fontSize: font.size.caption, color: colors.textMd },
});
