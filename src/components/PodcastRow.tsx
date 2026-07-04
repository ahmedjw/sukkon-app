import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';

import { colors, radius, space, font } from '@theme/tokens';

export type PodcastSummary = {
  id: string;
  title: string;
  author: string;
  durationMin: number;
  coverUrl?: string;
};

type Props = {
  podcast: PodcastSummary;
  onPress?: () => void;
  onPlay?: () => void;
};

export function PodcastRow({ podcast, onPress, onPlay }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.cover}>
        {podcast.coverUrl ? (
          <Image source={{ uri: podcast.coverUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {podcast.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {podcast.author}
        </Text>
        <Text style={styles.duration}>{podcast.durationMin} min</Text>
      </View>
      <Pressable onPress={onPlay} style={styles.play} hitSlop={8}>
        <Play size={16} color={colors.surface} fill={colors.surface} strokeWidth={0} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
  },
  pressed: { opacity: 0.85 },
  cover: { width: 56, height: 56, borderRadius: radius.md, overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, backgroundColor: colors.primarySoft },
  info: { flex: 1, gap: 2 },
  title: { fontSize: font.size.body, fontWeight: font.weight.semibold, color: colors.textHi },
  author: { fontSize: font.size.caption, color: colors.textMd },
  duration: { fontSize: font.size.micro, color: colors.textLo },
  play: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
});
