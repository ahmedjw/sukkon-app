import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, font } from '@theme/tokens';

export type Mood = 'HAPPY' | 'EXCITED' | 'NEUTRAL' | 'ANGRY' | 'COOL';

const MOODS: { key: Mood; emoji: string; labelKey: string }[] = [
  { key: 'HAPPY', emoji: '😊', labelKey: 'happy' },
  { key: 'EXCITED', emoji: '😄', labelKey: 'excited' },
  { key: 'NEUTRAL', emoji: '😐', labelKey: 'neutral' },
  { key: 'ANGRY', emoji: '😠', labelKey: 'angry' },
  { key: 'COOL', emoji: '😎', labelKey: 'cool' },
];

type Props = {
  value?: Mood;
  onChange: (mood: Mood) => void;
};

export function MoodPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {MOODS.map((m) => {
        const active = value === m.key;
        return (
          <Pressable
            key={m.key}
            onPress={() => onChange(m.key)}
            style={({ pressed }) => [
              styles.item,
              active && styles.itemActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.emoji}>{m.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{m.labelKey}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space[3],
    marginHorizontal: space[1],
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.7 },
  emoji: { fontSize: 28, marginBottom: 4 },
  label: {
    fontSize: font.size.micro,
    color: colors.textMd,
    fontWeight: font.weight.medium,
    textTransform: 'capitalize',
  },
  labelActive: { color: colors.primaryDk },
});
