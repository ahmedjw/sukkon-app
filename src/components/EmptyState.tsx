import { StyleSheet, Text, View } from 'react-native';

import { colors, space, font } from '@theme/tokens';

type Props = {
  glyph?: string;
  title: string;
  subtitle?: string;
};

export function EmptyState({ glyph = '🌱', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.glyph}>{glyph}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: space[6], gap: space[2] },
  glyph: { fontSize: 48 },
  title: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.semibold },
  subtitle: { fontSize: font.size.body, color: colors.textMd, textAlign: 'center' },
});
