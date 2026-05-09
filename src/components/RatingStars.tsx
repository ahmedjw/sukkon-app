import { StyleSheet, Text, View } from 'react-native';

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
      {stars.map((s, i) => (
        <Text
          key={i}
          style={[
            styles.star,
            { fontSize: size, color: s === 'empty' ? colors.textLo : colors.yellow },
          ]}
        >
          {s === 'half' ? '⯪' : '★'}
        </Text>
      ))}
      {showValue ? <Text style={[styles.value, { fontSize: size - 2 }]}>{rating.toFixed(1)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { lineHeight: 16 },
  value: { color: colors.textMd, marginLeft: 4, fontWeight: font.weight.medium },
});
