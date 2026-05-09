import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, font } from '@theme/tokens';

type Props = {
  uri?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
};

export function Avatar({ uri, name, size = 48, style }: Props) {
  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  initials: { color: colors.primaryDk, fontWeight: font.weight.bold },
});
