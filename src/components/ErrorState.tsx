import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
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
      <View style={styles.iconWrap}>
        <AlertTriangle size={28} color={colors.danger} strokeWidth={1.8} />
      </View>
      <Text style={styles.message}>{message ?? t('errors.generic')}</Text>
      {onRetry ? <Button title={t('common.retry')} variant="secondary" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: space[5], gap: space[2] },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FCE7E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[1],
  },
  message: { color: colors.textMd, fontSize: font.size.body, textAlign: 'center' },
});
