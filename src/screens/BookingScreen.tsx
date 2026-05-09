import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Skeleton,
  useToast,
} from '@components/index';
import {
  bookingHelpers,
  bookingsApi,
  therapistsApi,
  type Booking,
  type BookingMode,
  type Slot,
  type TherapistDetail,
} from '@/services/api';
import { useAsync, useMutation } from '@/services/hooks';
import { colors, font, radius, space } from '@theme/tokens';

type Step = 'slot' | 'review' | 'pay' | 'done';

const DURATION_OPTIONS = [30, 45, 60] as const;
type Duration = (typeof DURATION_OPTIONS)[number];

type Props = {
  therapistId: string;
  mode: BookingMode;
  onClose: () => void;
  onJoinCall: (booking: Booking) => void;
};

export function BookingScreen({ therapistId, mode, onClose, onJoinCall }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [step, setStep] = useState<Step>('slot');
  const [duration, setDuration] = useState<Duration>(45);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const therapist = useAsync(() => therapistsApi.detail(therapistId), [therapistId]);
  const slots = useAsync(() => bookingsApi.slots(therapistId), [therapistId]);
  const create = useMutation(bookingsApi.create);

  const slotForInstant: Slot = useMemo(
    () => ({ iso: new Date(Date.now() + 5 * 60_000).toISOString(), label: t('booking.startsNow') }),
    [t],
  );
  const effectiveSlot = mode === 'instant' ? slotForInstant : selectedSlot;

  const priceCents = therapist.data
    ? bookingHelpers.priceForDuration(therapist.data.hourlyRateCents, duration)
    : 0;

  const stepIndex = step === 'slot' ? 0 : step === 'review' ? 1 : step === 'pay' ? 2 : 3;

  const onBack = () => {
    if (step === 'slot') return onClose();
    if (step === 'review') return setStep('slot');
    if (step === 'pay') return setStep('review');
    onClose();
  };

  const onConfirmReview = () => {
    if (!effectiveSlot) {
      toast.show(t('booking.pickSlotFirst'), 'error');
      return;
    }
    setStep('pay');
  };

  const onPay = async () => {
    if (!therapist.data || !effectiveSlot) return;
    const result = await create.mutate({
      therapist: {
        id: therapist.data.id,
        name: therapist.data.name,
        specialty: therapist.data.specialty,
        hourlyRateCents: therapist.data.hourlyRateCents,
      },
      mode,
      startsAtIso: effectiveSlot.iso,
      durationMin: duration,
    });
    if (result) {
      setConfirmedBooking(result);
      setStep('done');
      toast.show(t('booking.confirmed'), 'success');
    } else {
      toast.show(t('errors.generic'), 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>← {t('common.back')}</Text>
        </Pressable>
        <Text style={styles.title}>
          {mode === 'instant' ? t('home.consultInstant') : t('home.consultScheduled')}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <Stepper index={stepIndex} />

      {therapist.status === 'loading' && !therapist.data ? (
        <View style={styles.loading}>
          <Skeleton width="100%" height={80} />
          <Skeleton width="100%" height={120} />
        </View>
      ) : therapist.status === 'error' ? (
        <ErrorState onRetry={therapist.reload} />
      ) : therapist.data ? (
        <>
          {step === 'slot' && (
            <SlotStep
              therapist={therapist.data}
              mode={mode}
              duration={duration}
              onChangeDuration={setDuration}
              slotsState={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              onContinue={() => setStep('review')}
            />
          )}
          {step === 'review' && effectiveSlot && (
            <ReviewStep
              therapist={therapist.data}
              mode={mode}
              slot={effectiveSlot}
              duration={duration}
              priceCents={priceCents}
              onContinue={onConfirmReview}
            />
          )}
          {step === 'pay' && effectiveSlot && (
            <PayStep
              priceCents={priceCents}
              loading={create.isLoading}
              onPay={onPay}
            />
          )}
          {step === 'done' && confirmedBooking && (
            <DoneStep
              booking={confirmedBooking}
              mode={mode}
              onClose={onClose}
              onJoinCall={() => onJoinCall(confirmedBooking)}
            />
          )}
        </>
      ) : (
        <EmptyState title={t('errors.generic')} />
      )}
    </SafeAreaView>
  );
}

function Stepper({ index }: { index: number }) {
  const { t } = useTranslation();
  const labels = [
    t('booking.steps.slot'),
    t('booking.steps.review'),
    t('booking.steps.pay'),
    t('booking.steps.done'),
  ];
  return (
    <View style={styles.stepper}>
      {labels.map((label, i) => (
        <View key={label} style={styles.stepItem}>
          <View
            style={[
              styles.stepDot,
              i <= index && styles.stepDotActive,
              i === index && styles.stepDotCurrent,
            ]}
          >
            <Text style={[styles.stepDotText, i <= index && styles.stepDotTextActive]}>{i + 1}</Text>
          </View>
          <Text style={[styles.stepLabel, i === index && styles.stepLabelActive]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SlotStep({
  therapist,
  mode,
  duration,
  onChangeDuration,
  slotsState,
  selectedSlot,
  onSelectSlot,
  onContinue,
}: {
  therapist: TherapistDetail;
  mode: BookingMode;
  duration: Duration;
  onChangeDuration: (d: Duration) => void;
  slotsState: ReturnType<typeof useAsync<Slot[]>>;
  selectedSlot: Slot | null;
  onSelectSlot: (s: Slot) => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const canContinue = mode === 'instant' || selectedSlot !== null;

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.therapistName}>{therapist.name}</Text>
          <Text style={styles.therapistSpec}>{therapist.specialty}</Text>
        </Card>

        <View style={styles.group}>
          <Text style={styles.groupLabel}>{t('booking.duration')}</Text>
          <View style={styles.chipRow}>
            {DURATION_OPTIONS.map((d) => (
              <Chip
                key={d}
                label={t('booking.minutes', { count: d })}
                selected={d === duration}
                onPress={() => onChangeDuration(d)}
              />
            ))}
          </View>
        </View>

        {mode === 'scheduled' ? (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>{t('booking.pickSlot')}</Text>
            {slotsState.status === 'loading' && !slotsState.data ? (
              <View style={{ gap: space[2] }}>
                <Skeleton width="100%" height={48} />
                <Skeleton width="100%" height={48} />
                <Skeleton width="100%" height={48} />
              </View>
            ) : slotsState.status === 'error' ? (
              <ErrorState onRetry={slotsState.reload} />
            ) : (
              <View style={styles.slotGrid}>
                {(slotsState.data ?? []).map((s) => {
                  const active = selectedSlot?.iso === s.iso;
                  return (
                    <Pressable
                      key={s.iso}
                      onPress={() => onSelectSlot(s)}
                      style={[styles.slotCell, active && styles.slotCellActive]}
                    >
                      <Text
                        style={[styles.slotCellText, active && styles.slotCellTextActive]}
                        numberOfLines={1}
                      >
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <Card>
            <Text style={styles.groupLabel}>{t('booking.instantNote')}</Text>
            <Text style={styles.instantBody}>{t('booking.instantBody')}</Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('common.continue')}
          fullWidth
          disabled={!canContinue}
          onPress={onContinue}
        />
      </View>
    </>
  );
}

function ReviewStep({
  therapist,
  mode,
  slot,
  duration,
  priceCents,
  onContinue,
}: {
  therapist: TherapistDetail;
  mode: BookingMode;
  slot: Slot;
  duration: Duration;
  priceCents: number;
  onContinue: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Row label={t('booking.therapist')} value={therapist.name} />
          <Row label={t('booking.mode')} value={t(mode === 'instant' ? 'home.consultInstant' : 'home.consultScheduled')} />
          <Row label={t('booking.when')} value={slot.label} />
          <Row label={t('booking.duration')} value={t('booking.minutes', { count: duration })} />
          <Row label={t('booking.price')} value={`$${(priceCents / 100).toFixed(2)}`} emphasis />
        </Card>

        <Card>
          <Text style={styles.fineprintTitle}>{t('booking.policyTitle')}</Text>
          <Text style={styles.fineprint}>{t('booking.policyBody')}</Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('booking.continueToPay')} fullWidth onPress={onContinue} />
      </View>
    </>
  );
}

function PayStep({
  priceCents,
  loading,
  onPay,
}: {
  priceCents: number;
  loading: boolean;
  onPay: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.fineprintTitle}>{t('booking.payMockTitle')}</Text>
          <Text style={styles.fineprint}>{t('booking.payMockBody')}</Text>
        </Card>

        <Card>
          <Row label={t('booking.amountDue')} value={`$${(priceCents / 100).toFixed(2)}`} emphasis />
          <Row label={t('booking.method')} value="•••• 4242" />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('booking.payNow', { amount: `$${(priceCents / 100).toFixed(2)}` })}
          fullWidth
          loading={loading}
          onPress={onPay}
        />
      </View>
    </>
  );
}

function DoneStep({
  booking,
  mode,
  onClose,
  onJoinCall,
}: {
  booking: Booking;
  mode: BookingMode;
  onClose: () => void;
  onJoinCall: () => void;
}) {
  const { t } = useTranslation();
  const when = new Date(booking.startsAtIso);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.doneHero}>
          <View style={styles.doneIcon}>
            <Text style={styles.doneIconText}>✓</Text>
          </View>
          <Text style={styles.doneTitle}>{t('booking.confirmedTitle')}</Text>
          <Text style={styles.doneBody}>
            {t('booking.confirmedBody', { name: booking.therapistName })}
          </Text>
        </View>

        <Card>
          <Row label={t('booking.therapist')} value={booking.therapistName} />
          <Row label={t('booking.when')} value={when.toLocaleString()} />
          <Row label={t('booking.duration')} value={t('booking.minutes', { count: booking.durationMin })} />
          <Row label={t('booking.confirmation')} value={booking.id} />
        </Card>
      </ScrollView>

      <View style={[styles.footer, { flexDirection: 'row', gap: space[2] }]}>
        <Button
          title={t('booking.done')}
          variant="secondary"
          style={{ flex: 1 }}
          onPress={onClose}
        />
        <Button
          title={mode === 'instant' ? t('booking.joinNow') : t('booking.openLobby')}
          style={{ flex: 1 }}
          onPress={onJoinCall}
        />
      </View>
    </>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, emphasis && styles.rowValueEmphasis]}>{value}</Text>
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
  title: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.bold },
  loading: { padding: space[4], gap: space[3] },
  stepper: {
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: space[4],
    paddingBottom: space[3],
  },
  stepItem: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  stepDotCurrent: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotText: { fontSize: font.size.caption, color: colors.textMd, fontWeight: font.weight.bold },
  stepDotTextActive: { color: colors.surface },
  stepLabel: { fontSize: font.size.micro, color: colors.textMd },
  stepLabelActive: { color: colors.textHi, fontWeight: font.weight.semibold },
  scroll: { padding: space[4], gap: space[3], paddingBottom: space[7] },
  therapistName: { fontSize: font.size.body, color: colors.textHi, fontWeight: font.weight.semibold },
  therapistSpec: { fontSize: font.size.caption, color: colors.textMd, marginTop: 2 },
  group: { gap: space[2] },
  groupLabel: {
    fontSize: font.size.caption,
    color: colors.textMd,
    fontWeight: font.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  slotCell: {
    paddingVertical: space[3],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '48%',
    alignItems: 'center',
  },
  slotCellActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotCellText: { fontSize: font.size.caption, color: colors.textHi, fontWeight: font.weight.medium },
  slotCellTextActive: { color: colors.surface, fontWeight: font.weight.bold },
  instantBody: { fontSize: font.size.body, color: colors.textMd, marginTop: space[2] },
  footer: {
    padding: space[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: space[3],
  },
  rowLabel: { color: colors.textMd, fontSize: font.size.caption },
  rowValue: { color: colors.textHi, fontSize: font.size.body, fontWeight: font.weight.semibold, flexShrink: 1, textAlign: 'right' },
  rowValueEmphasis: { color: colors.primaryDk, fontSize: font.size.h3 },
  fineprintTitle: { fontSize: font.size.body, color: colors.textHi, fontWeight: font.weight.semibold },
  fineprint: { fontSize: font.size.caption, color: colors.textMd, marginTop: space[2], lineHeight: 20 },
  doneHero: { alignItems: 'center', gap: space[2], padding: space[5] },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneIconText: { fontSize: 32, color: colors.primaryDk, fontWeight: font.weight.bold },
  doneTitle: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold },
  doneBody: { fontSize: font.size.body, color: colors.textMd, textAlign: 'center', paddingHorizontal: space[4] },
});
