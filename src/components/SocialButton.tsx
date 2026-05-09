import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, space, font } from '@theme/tokens';

type Provider = 'google' | 'facebook' | 'twitter';

type Props = {
  provider: Provider;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const PROVIDER_GLYPHS: Record<Provider, string> = {
  google: 'G',
  facebook: 'f',
  twitter: '𝕏',
};

const PROVIDER_COLORS: Record<Provider, string> = {
  google: '#DB4437',
  facebook: '#1877F2',
  twitter: '#0F1419',
};

export function SocialButton({ provider, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.glyph, { color: PROVIDER_COLORS[provider] }]}>
        {PROVIDER_GLYPHS[provider]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
  glyph: { fontSize: 22, fontWeight: font.weight.bold },
});
