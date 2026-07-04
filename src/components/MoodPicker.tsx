import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type LucideIcon, Frown, Glasses, Laugh, Meh, Smile } from 'lucide-react-native';

import { colors, radius, space, font } from '@theme/tokens';

export type Mood = 'HAPPY' | 'EXCITED' | 'NEUTRAL' | 'ANGRY' | 'COOL';

const MOODS: { key: Mood; icon: LucideIcon; labelKey: string }[] = [
  { key: 'HAPPY', icon: Smile, labelKey: 'happy' },
  { key: 'EXCITED', icon: Laugh, labelKey: 'excited' },
  { key: 'NEUTRAL', icon: Meh, labelKey: 'neutral' },
  { key: 'ANGRY', icon: Frown, labelKey: 'angry' },
  { key: 'COOL', icon: Glasses, labelKey: 'cool' },
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
        const IconCmp = m.icon;
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
            <IconCmp
              size={28}
              color={active ? colors.primaryDk : colors.textMd}
              strokeWidth={1.8}
            />
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
    gap: space[1],
  },
  itemActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.7 },
  label: {
    fontSize: font.size.micro,
    color: colors.textMd,
    fontWeight: font.weight.medium,
    textTransform: 'capitalize',
  },
  labelActive: { color: colors.primaryDk },
});
