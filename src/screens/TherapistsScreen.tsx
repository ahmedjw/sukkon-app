import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  BannerCTA,
  BottomSheet,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  TherapistCard,
  TherapistCardSkeleton,
  type TherapistSummary,
} from '@components/index';
import {
  bookingsApi,
  therapistsApi,
  type Booking,
  type Condition,
  type Gender,
  type TherapistFilters,
} from '@/services/api';
import { useAsync } from '@/services/hooks';
import { colors, font, radius, space } from '@theme/tokens';

const CONDITION_OPTIONS: (Condition | 'ANY')[] = [
  'ANY',
  'ANXIETY',
  'DEPRESSION',
  'BIPOLAR',
  'SCHIZOPHRENIA',
  'ADDICTION',
  'FAMILY',
  'TRAUMA',
];

const GENDER_OPTIONS: Gender[] = ['ANY', 'FEMALE', 'MALE'];

const EXPERIENCE_OPTIONS: { label: string; min?: number; max?: number }[] = [
  { label: 'any' },
  { label: 'lt5', max: 4 },
  { label: 'b5_10', min: 5, max: 10 },
  { label: 'gt10', min: 11 },
];

const BUDGET_OPTIONS: { label: string; min?: number; max?: number }[] = [
  { label: 'any' },
  { label: 'lt60', max: 5999 },
  { label: 'b60_80', min: 6000, max: 8000 },
  { label: 'gt80', min: 8001 },
];

type Tab = 'all' | 'mine';

type Props = {
  onOpenTherapist: (id: string) => void;
  onBookTherapist: (id: string) => void;
  pendingMode?: 'instant' | 'scheduled' | null;
};

export function TherapistsScreen({ onOpenTherapist, onBookTherapist, pendingMode }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('all');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.therapists')}</Text>
        {pendingMode ? (
          <View style={styles.pendingPill}>
            <Text style={styles.pendingPillText}>
              {t(pendingMode === 'instant' ? 'therapists.pickForInstant' : 'therapists.pickForScheduled')}
            </Text>
          </View>
        ) : null}
        <View style={styles.tabRow}>
          <TabButton
            label={t('therapists.tabAll')}
            active={tab === 'all'}
            onPress={() => setTab('all')}
          />
          <TabButton
            label={t('therapists.tabMine')}
            active={tab === 'mine'}
            onPress={() => setTab('mine')}
          />
        </View>
      </View>
      {tab === 'all' ? (
        <AllTherapists onOpenTherapist={onOpenTherapist} onBookTherapist={onBookTherapist} />
      ) : (
        <MyTherapist />
      )}
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active ? styles.tabButtonActive : null]}
    >
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

function AllTherapists({
  onOpenTherapist,
  onBookTherapist,
}: {
  onOpenTherapist: (id: string) => void;
  onBookTherapist: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TherapistFilters>({});
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<TherapistFilters>({});

  const list = useAsync(() => therapistsApi.list(filters), [JSON.stringify(filters)]);

  const activeFilterCount = useMemo(() => countActive(filters), [filters]);

  const onSearch = useCallback((q: string) => {
    setFilters((f) => ({ ...f, query: q || undefined }));
  }, []);

  const openFilters = () => {
    setDraftFilters(filters);
    setFilterSheetOpen(true);
  };

  const applyFilters = () => {
    setFilters({ ...draftFilters, query: filters.query });
    setFilterSheetOpen(false);
  };

  const clearFilters = () => {
    setDraftFilters({});
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchRow}>
          <Input
            placeholder={t('therapists.search')}
            defaultValue={filters.query}
            onChangeText={onSearch}
            containerStyle={{ flex: 1 }}
          />
          <Pressable onPress={openFilters} style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙︎</Text>
            {activeFilterCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <BannerCTA
          title={t('therapists.promoTitle')}
          subtitle={t('therapists.promoSubtitle')}
        />

        <Text style={styles.sectionTitle}>{t('therapists.specialForYou')}</Text>

        <ListBody
          state={list}
          onOpenTherapist={onOpenTherapist}
          onBookTherapist={onBookTherapist}
        />
      </ScrollView>

      <BottomSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title={t('therapists.filterTitle')}
      >
        <FilterGroup label={t('therapists.experience')}>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <Chip
              key={opt.label}
              label={t(`therapists.experienceOpts.${opt.label}`)}
              selected={
                draftFilters.minExperience === opt.min && draftFilters.maxExperience === opt.max
              }
              onPress={() =>
                setDraftFilters((d) => ({
                  ...d,
                  minExperience: opt.min,
                  maxExperience: opt.max,
                }))
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t('therapists.gender')}>
          {GENDER_OPTIONS.map((g) => (
            <Chip
              key={g}
              label={t(`therapists.genderOpts.${g}`)}
              selected={(draftFilters.gender ?? 'ANY') === g}
              onPress={() => setDraftFilters((d) => ({ ...d, gender: g }))}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t('therapists.problem')}>
          {CONDITION_OPTIONS.map((c) => (
            <Chip
              key={c}
              label={c === 'ANY' ? t('common.any') : t(`conditions.${c}`)}
              selected={(draftFilters.condition ?? 'ANY') === c}
              onPress={() => setDraftFilters((d) => ({ ...d, condition: c }))}
            />
          ))}
        </FilterGroup>

        <FilterGroup label={t('therapists.budget')}>
          {BUDGET_OPTIONS.map((opt) => (
            <Chip
              key={opt.label}
              label={t(`therapists.budgetOpts.${opt.label}`)}
              selected={
                draftFilters.minBudget === opt.min && draftFilters.maxBudget === opt.max
              }
              onPress={() =>
                setDraftFilters((d) => ({
                  ...d,
                  minBudget: opt.min,
                  maxBudget: opt.max,
                }))
              }
            />
          ))}
        </FilterGroup>

        <View style={styles.sheetActions}>
          <Button
            title={t('therapists.clearFilters')}
            variant="secondary"
            onPress={clearFilters}
            style={{ flex: 1 }}
          />
          <Button
            title={t('therapists.applyFilters')}
            onPress={applyFilters}
            style={{ flex: 1 }}
          />
        </View>
      </BottomSheet>
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterGroupLabel}>{label}</Text>
      <View style={styles.filterChipRow}>{children}</View>
    </View>
  );
}

function ListBody({
  state,
  onOpenTherapist,
  onBookTherapist,
}: {
  state: ReturnType<typeof useAsync<TherapistSummary[]>>;
  onOpenTherapist: (id: string) => void;
  onBookTherapist: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (state.status === 'loading' && !state.data) {
    return (
      <View style={{ gap: space[3] }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <TherapistCardSkeleton key={i} />
        ))}
      </View>
    );
  }
  if (state.status === 'error') return <ErrorState onRetry={state.reload} />;
  const items = state.data ?? [];
  if (items.length === 0) return <EmptyState glyph="🌱" title={t('therapists.noResults')} />;

  return (
    <View style={{ gap: space[3] }}>
      {items.map((th) => (
        <TherapistCard
          key={th.id}
          therapist={th}
          onPress={() => onOpenTherapist(th.id)}
          onBook={() => onBookTherapist(th.id)}
        />
      ))}
    </View>
  );
}

function MyTherapist() {
  const { t } = useTranslation();
  const bookings = useAsync(() => bookingsApi.list(), []);

  if (bookings.status === 'loading' && !bookings.data) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <TherapistCardSkeleton />
        <TherapistCardSkeleton />
      </ScrollView>
    );
  }
  if (bookings.status === 'error') return <ErrorState onRetry={bookings.reload} />;

  const all = bookings.data ?? [];
  const upcoming = all.filter((b) => b.status === 'CONFIRMED' && new Date(b.startsAtIso) >= new Date());
  const past = all.filter((b) => !(b.status === 'CONFIRMED' && new Date(b.startsAtIso) >= new Date()));

  if (all.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState
          glyph="📅"
          title={t('therapists.noBookings')}
          subtitle={t('therapists.noBookingsHint')}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {upcoming.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('therapists.upcoming')}</Text>
          {upcoming.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </>
      ) : null}
      {past.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('therapists.past')}</Text>
          {past.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const { t } = useTranslation();
  const when = new Date(booking.startsAtIso);
  const status = t(`booking.status.${booking.status}`);

  return (
    <Card>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingName}>{booking.therapistName}</Text>
        <View
          style={[
            styles.statusPill,
            booking.status === 'CONFIRMED' && { backgroundColor: colors.primarySoft },
            booking.status === 'CANCELLED' && { backgroundColor: '#FCE7E7' },
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              booking.status === 'CONFIRMED' && { color: colors.primaryDk },
              booking.status === 'CANCELLED' && { color: colors.danger },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
      <Text style={styles.bookingSpecialty}>{booking.therapistSpecialty}</Text>
      <View style={styles.bookingMetaRow}>
        <Text style={styles.bookingMeta}>{when.toLocaleString()}</Text>
        <Text style={styles.bookingMeta}>·</Text>
        <Text style={styles.bookingMeta}>{t('booking.minutes', { count: booking.durationMin })}</Text>
      </View>
    </Card>
  );
}

function countActive(f: TherapistFilters): number {
  let n = 0;
  if (f.minExperience !== undefined || f.maxExperience !== undefined) n++;
  if (f.gender && f.gender !== 'ANY') n++;
  if (f.condition && f.condition !== 'ANY') n++;
  if (f.minBudget !== undefined || f.maxBudget !== undefined) n++;
  return n;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { padding: space[4], gap: space[3] },
  pendingPill: {
    alignSelf: 'flex-start',
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  pendingPillText: { fontSize: font.size.caption, color: colors.primaryDk, fontWeight: font.weight.semibold },
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: { fontSize: 22, color: colors.textHi },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: colors.surface, fontSize: font.size.micro, fontWeight: font.weight.bold },
  sectionTitle: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.semibold },
  filterGroup: { gap: space[2] },
  filterGroupLabel: {
    fontSize: font.size.caption,
    color: colors.textMd,
    fontWeight: font.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  sheetActions: { flexDirection: 'row', gap: space[2], marginTop: space[3] },
  emptyWrap: { flex: 1, justifyContent: 'center', padding: space[4] },
  bookingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bookingName: { fontSize: font.size.body, fontWeight: font.weight.semibold, color: colors.textHi },
  bookingSpecialty: { fontSize: font.size.caption, color: colors.textMd, marginTop: 2 },
  bookingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[2] },
  bookingMeta: { fontSize: font.size.caption, color: colors.textMd },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: space[3],
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  statusPillText: { fontSize: font.size.micro, fontWeight: font.weight.semibold, color: colors.textMd },
});
