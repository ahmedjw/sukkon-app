import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, font, space } from '@theme/tokens';

type Props = {
  onDone: () => void;
};

export function SplashScreen({ onDone }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDone, 1400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoMark}>س</Text>
      </View>
      <Text style={styles.brand}>{t('app.name')}</Text>
      <Text style={styles.tagline}>{t('app.tagline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: { fontSize: 48, color: colors.primaryDk, fontWeight: font.weight.bold },
  brand: { fontSize: font.size.h1, color: colors.surface, fontWeight: font.weight.bold },
  tagline: { fontSize: font.size.body, color: colors.surface, opacity: 0.9 },
});
