import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, font, shadow } from '@theme/tokens';

import { Avatar } from './Avatar';
import { Button } from './Button';
import { RatingStars } from './RatingStars';

export type TherapistSummary = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  available: boolean;
  avatarUrl?: string;
};

type Props = {
  therapist: TherapistSummary;
  onPress?: () => void;
  onBook?: () => void;
};

export function TherapistCard({ therapist, onPress, onBook }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Avatar uri={therapist.avatarUrl} name={therapist.name} size={56} />
      <View style={styles.info}>
        <Text style={styles.name}>{therapist.name}</Text>
        <Text style={styles.specialty}>{therapist.specialty}</Text>
        <View style={styles.metaRow}>
          <RatingStars rating={therapist.rating} />
          <View
            style={[
              styles.statusDot,
              { backgroundColor: therapist.available ? colors.success : colors.textLo },
            ]}
          />
          <Text style={styles.statusText}>
            {therapist.available ? 'Available' : 'Offline'}
          </Text>
        </View>
      </View>
      {onBook ? <Button title="Book" size="sm" onPress={onBook} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: colors.surface,
    padding: space[3],
    borderRadius: radius.lg,
    ...shadow.card,
  },
  pressed: { opacity: 0.9 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: font.size.body, fontWeight: font.weight.semibold, color: colors.textHi },
  specialty: { fontSize: font.size.caption, color: colors.textMd },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: radius.pill },
  statusText: { fontSize: font.size.micro, color: colors.textMd },
});
