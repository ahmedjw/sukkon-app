import { StyleSheet, View } from 'react-native';

import { colors, radius, space, shadow } from '@theme/tokens';

import { Skeleton } from './Skeleton';

export function TherapistCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={styles.info}>
        <Skeleton width="65%" height={14} />
        <Skeleton width="45%" height={12} />
        <Skeleton width="35%" height={10} />
      </View>
      <Skeleton width={64} height={32} borderRadius={radius.pill} />
    </View>
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
  info: { flex: 1, gap: space[1] },
});
