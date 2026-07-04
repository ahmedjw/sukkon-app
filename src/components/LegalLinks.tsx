import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PRIVACY_URL, TERMS_URL } from '@/services/api';
import { colors, font, space } from '@theme/tokens';

export function LegalLinks() {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{t('auth.agreePrefix')} </Text>
      <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={4}>
        <Text style={styles.link}>{t('auth.termsLink')}</Text>
      </Pressable>
      <Text style={styles.text}> {t('auth.agreeAnd')} </Text>
      <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={4}>
        <Text style={styles.link}>{t('auth.privacyLink')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: space[1],
  },
  text: { color: colors.textLo, fontSize: font.size.caption, textAlign: 'center' },
  link: {
    color: colors.primary,
    fontSize: font.size.caption,
    fontWeight: font.weight.semibold,
    textDecorationLine: 'underline',
  },
});
