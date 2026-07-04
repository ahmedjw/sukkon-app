import { StyleSheet, Text, View } from 'react-native';
import { type LucideIcon, Sprout } from 'lucide-react-native';

import { colors, space, font } from '@theme/tokens';

type Props = {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon: IconCmp = Sprout, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <IconCmp size={32} color={colors.primaryDk} strokeWidth={1.6} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: space[6], gap: space[2] },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[1],
  },
  title: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.semibold },
  subtitle: { fontSize: font.size.body, color: colors.textMd, textAlign: 'center' },
});
