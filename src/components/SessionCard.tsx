import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, font, shadow } from '@theme/tokens';

export type SessionSummary = {
  id: string;
  title: string;
  category: string;
  durationMin: number;
  coverUrl?: string;
};

type Props = {
  session: SessionSummary;
  onPress?: () => void;
  width?: number;
};

export function SessionCard({ session, onPress, width }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        width !== undefined ? { width } : null,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.cover}>
        {session.coverUrl ? (
          <Image source={{ uri: session.coverUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.category}>{session.category}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {session.title}
        </Text>
        <Text style={styles.duration}>{session.durationMin} min</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: { opacity: 0.9 },
  cover: { aspectRatio: 16 / 10, backgroundColor: colors.surfaceAlt },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, backgroundColor: colors.primarySoft },
  body: { padding: space[3], gap: 2 },
  category: {
    fontSize: font.size.micro,
    color: colors.primaryDk,
    fontWeight: font.weight.semibold,
    textTransform: 'uppercase',
  },
  title: { fontSize: font.size.body, fontWeight: font.weight.semibold, color: colors.textHi },
  duration: { fontSize: font.size.caption, color: colors.textMd, marginTop: 2 },
});
