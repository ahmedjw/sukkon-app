import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { colors, radius, space, font } from '@theme/tokens';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export function Input({ label, error, containerStyle, onFocus, onBlur, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}
      >
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={colors.textLo}
          style={[styles.input, style]}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space[1] },
  label: { fontSize: font.size.caption, color: colors.textMd, fontWeight: font.weight.medium },
  field: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: space[4],
  },
  fieldFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  fieldError: { borderColor: colors.danger },
  input: {
    paddingVertical: space[3],
    fontSize: font.size.body,
    color: colors.textHi,
  },
  error: { fontSize: font.size.caption, color: colors.danger },
});
