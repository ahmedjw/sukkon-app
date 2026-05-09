import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

import { colors, radius, space, font } from '@theme/tokens';

type Props = {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  containerStyle,
}: Props) {
  const [hidden, setHidden] = useState(true);
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
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLo}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
        />
        <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
          <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space[1] },
  label: { fontSize: font.size.caption, color: colors.textMd, fontWeight: font.weight.medium },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: space[4],
  },
  fieldFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  fieldError: { borderColor: colors.danger },
  input: { flex: 1, paddingVertical: space[3], fontSize: font.size.body, color: colors.textHi },
  toggle: { color: colors.primary, fontWeight: font.weight.semibold, fontSize: font.size.caption },
  error: { fontSize: font.size.caption, color: colors.danger },
});
