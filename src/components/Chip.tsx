import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, space, font } from '@theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: selected ? colors.surface : colors.textMd }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  unselected: { backgroundColor: colors.surface, borderColor: colors.border },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.8 },
  label: { fontSize: font.size.caption, fontWeight: font.weight.medium },
});
