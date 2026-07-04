import { StyleSheet, Text, View } from 'react-native';
import { Star, StarHalf } from 'lucide-react-native';

import { colors, font } from '@theme/tokens';

type Props = {
  rating: number;
  size?: number;
  showValue?: boolean;
};

export function RatingStars({ rating, size = 14, showValue = true }: Props) {
  const rounded = Math.round(rating * 2) / 2;
  const stars = [1, 2, 3, 4, 5].map((i) => {
    if (rounded >= i) return 'full';
    if (rounded >= i - 0.5) return 'half';
    return 'empty';
  });

  return (
    <View style={styles.row}>
      {stars.map((s, i) =>
        s === 'half' ? (
          <StarHalf key={i} size={size} color={colors.yellow} fill={colors.yellow} strokeWidth={1.5} />
        ) : (
          <Star
            key={i}
            size={size}
            color={s === 'full' ? colors.yellow : colors.textLo}
            fill={s === 'full' ? colors.yellow : 'transparent'}
            strokeWidth={1.5}
          />
        ),
      )}
      {showValue ? <Text style={[styles.value, { fontSize: size - 2 }]}>{rating.toFixed(1)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  value: { color: colors.textMd, marginLeft: 4, fontWeight: font.weight.medium },
});
