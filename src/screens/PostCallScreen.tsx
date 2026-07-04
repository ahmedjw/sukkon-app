import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { Avatar, Button, Card, Chip, Input, useToast } from '@components/index';
import { bookingsApi } from '@/services/api';
import { useMutation } from '@/services/hooks';
import { colors, font, radius, space } from '@theme/tokens';

const TIPS_USD = [0, 5, 10, 20];

type Props = {
  bookingId: string;
  therapistName: string;
  onClose: () => void;
};

export function PostCallScreen({ bookingId, therapistName, onClose }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [tipUsd, setTipUsd] = useState(0);
  const [notes, setNotes] = useState('');

  const finish = useMutation((review: { rating: number; tipCents: number; notes: string }) =>
    bookingsApi.finishCall(bookingId, review),
  );

  const submit = async () => {
    const result = await finish.mutate({
      rating,
      tipCents: tipUsd * 100,
      notes: notes.trim(),
    });
    if (result) {
      toast.show(t('postcall.thanks'), 'success');
      onClose();
    } else {
      toast.show(t('errors.generic'), 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Avatar name={therapistName} size={72} />
          <Text style={styles.title}>{t('postcall.title')}</Text>
          <Text style={styles.body}>{t('postcall.body', { name: therapistName })}</Text>
        </View>

        <Card>
          <Text style={styles.groupLabel}>{t('postcall.rate')}</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= rating;
              return (
                <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
                  <Star
                    size={36}
                    color={filled ? colors.yellow : colors.border}
                    fill={filled ? colors.yellow : 'transparent'}
                    strokeWidth={1.5}
                  />
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.groupLabel}>{t('postcall.tip')}</Text>
          <View style={styles.chipRow}>
            {TIPS_USD.map((amt) => (
              <Chip
                key={amt}
                label={amt === 0 ? t('postcall.noTip') : `$${amt}`}
                selected={tipUsd === amt}
                onPress={() => setTipUsd(amt)}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.groupLabel}>{t('postcall.notes')}</Text>
          <Input
            placeholder={t('postcall.notesPlaceholder')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={{ minHeight: 96, textAlignVertical: 'top' }}
          />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('postcall.skip')}
          variant="secondary"
          style={{ flex: 1 }}
          onPress={onClose}
        />
        <Button
          title={t('postcall.submit')}
          loading={finish.isLoading}
          style={{ flex: 1 }}
          onPress={submit}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { padding: space[4], gap: space[3], paddingBottom: space[7] },
  hero: { alignItems: 'center', gap: space[2], padding: space[3] },
  title: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold, marginTop: space[2] },
  body: { fontSize: font.size.body, color: colors.textMd, textAlign: 'center' },
  groupLabel: {
    fontSize: font.size.caption,
    color: colors.textMd,
    fontWeight: font.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: space[2],
  },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: space[2] },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  footer: {
    flexDirection: 'row',
    gap: space[2],
    padding: space[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
