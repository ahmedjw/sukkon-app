import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/index';
import { colors, font, radius, space } from '@theme/tokens';

const { width } = Dimensions.get('window');

type Slide = {
  key: string;
  glyph: string;
  titleKey: string;
  bodyKey: string;
  bg: string;
};

const SLIDES: Slide[] = [
  { key: '1', glyph: '🌿', titleKey: 'welcome.slide1Title', bodyKey: 'welcome.slide1Body', bg: colors.primarySoft },
  { key: '2', glyph: '🩺', titleKey: 'welcome.slide2Title', bodyKey: 'welcome.slide2Body', bg: '#FFF4D1' },
  { key: '3', glyph: '🌍', titleKey: 'welcome.slide3Title', bodyKey: 'welcome.slide3Body', bg: '#E0EBFA' },
];

type Props = {
  onFinish: () => void;
};

export function WelcomeScreen({ onFinish }: Props) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      onFinish();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={onFinish} hitSlop={12}>
          <Text style={styles.skip}>{t('welcome.skip')}</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.illustration, { backgroundColor: item.bg }]}>
              <Text style={styles.glyph}>{item.glyph}</Text>
            </View>
            <Text style={styles.title}>{t(item.titleKey)}</Text>
            <Text style={styles.body}>{t(item.bodyKey)}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          title={index === SLIDES.length - 1 ? t('welcome.getStarted') : t('welcome.next')}
          fullWidth
          onPress={goNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: { alignItems: 'flex-end', padding: space[4] },
  skip: { color: colors.textMd, fontSize: font.size.body, fontWeight: font.weight.medium },
  slide: {
    paddingHorizontal: space[5],
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
  },
  illustration: {
    width: 220,
    height: 220,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: 96 },
  title: {
    fontSize: font.size.h1,
    color: colors.textHi,
    fontWeight: font.weight.bold,
    textAlign: 'center',
  },
  body: {
    fontSize: font.size.body,
    color: colors.textMd,
    textAlign: 'center',
    lineHeight: font.lineHeight.body,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space[1],
    paddingVertical: space[4],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  footer: { paddingHorizontal: space[5], paddingBottom: space[4] },
});
