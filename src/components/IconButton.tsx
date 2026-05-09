import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius } from '@theme/tokens';

type Props = {
  glyph: string;
  onPress?: () => void;
  size?: number;
  badge?: number;
  style?: ViewStyle;
};

export function IconButton({ glyph, onPress, size = 40, badge, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.glyph}>{glyph}</Text>
      {badge !== undefined && badge > 0 ? (
        <Text style={styles.badge}>{badge > 9 ? '9+' : String(badge)}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  pressed: { opacity: 0.7 },
  glyph: { fontSize: 18 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
});
