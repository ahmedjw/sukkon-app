import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, space, font, shadow } from '@theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export function BannerCTA({ title, subtitle, ctaLabel, onPress, style }: Props) {
  return (
    <View style={[styles.banner, style]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {ctaLabel ? (
          <Pressable onPress={onPress} style={styles.cta}>
            <Text style={styles.ctaLabel}>{ctaLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: space[5],
    ...shadow.card,
  },
  content: { gap: space[2] },
  title: { color: colors.surface, fontSize: font.size.h3, fontWeight: font.weight.bold },
  subtitle: { color: colors.surface, opacity: 0.85, fontSize: font.size.caption },
  cta: {
    alignSelf: 'flex-start',
    marginTop: space[2],
    backgroundColor: colors.yellow,
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
  },
  ctaLabel: { color: colors.navy, fontWeight: font.weight.bold, fontSize: font.size.caption },
});
