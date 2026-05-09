import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@components/index';
import { colors, font, space } from '@theme/tokens';

type Props = {
  titleKey: string;
};

export function PlaceholderScreen({ titleKey }: Props) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t(titleKey)}</Text>
        <Text style={styles.badge}>{t('common.phaseZero')}</Text>
      </View>
      <View style={styles.body}>
        <EmptyState
          glyph="🌿"
          title={t('common.comingSoon')}
          subtitle={t('app.tagline')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: { padding: space[4], gap: space[1] },
  title: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold },
  badge: { fontSize: font.size.caption, color: colors.primaryDk },
  body: { flex: 1, justifyContent: 'center', padding: space[4] },
});
