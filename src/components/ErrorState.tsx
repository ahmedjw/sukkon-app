import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, font, space } from '@theme/tokens';

import { Button } from './Button';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.glyph}>⚠️</Text>
      <Text style={styles.message}>{message ?? t('errors.generic')}</Text>
      {onRetry ? <Button title={t('common.retry')} variant="secondary" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: space[5], gap: space[2] },
  glyph: { fontSize: 40 },
  message: { color: colors.textMd, fontSize: font.size.body, textAlign: 'center' },
});
