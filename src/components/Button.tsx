import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, space, font } from '@theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <Text style={[styles.text, textSize[size], { color: textColor[variant] }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: font.weight.semibold },
});

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: space[2], paddingHorizontal: space[4] },
  md: { paddingVertical: space[3], paddingHorizontal: space[5] },
  lg: { paddingVertical: space[4], paddingHorizontal: space[6] },
};

const textSize = {
  sm: { fontSize: font.size.caption },
  md: { fontSize: font.size.body },
  lg: { fontSize: font.size.h3 },
};

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
};

const textColor: Record<Variant, string> = {
  primary: colors.surface,
  secondary: colors.textHi,
  ghost: colors.primary,
  danger: colors.surface,
};
