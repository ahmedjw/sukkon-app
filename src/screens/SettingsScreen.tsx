import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth';
import { changeLocale, type AppLocale } from '@i18n/index';
import { Avatar, Button, Card } from '@components/index';
import { colors, font, radius, space } from '@theme/tokens';

type Props = {
  onClose: () => void;
};

export function SettingsScreen({ onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const current = (i18n.language as AppLocale) ?? 'en';

  const switchLocale = async (loc: AppLocale) => {
    if (loc === current) return;
    await changeLocale(loc);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.back}>← {t('common.back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <View style={{ width: 50 }} />
        </View>

        <Card>
          <View style={styles.profile}>
            <Avatar name={user?.name} size={64} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
        <View style={styles.langRow}>
          <Pressable
            style={[styles.langBtn, current === 'en' && styles.langBtnActive]}
            onPress={() => switchLocale('en')}
          >
            <Text style={[styles.langText, current === 'en' && styles.langTextActive]}>
              {t('common.english')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.langBtn, current === 'ar' && styles.langBtnActive]}
            onPress={() => switchLocale('ar')}
          >
            <Text style={[styles.langText, current === 'ar' && styles.langTextActive]}>
              {t('common.arabic')}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.langHint}>
          Switching to Arabic flips the layout to RTL. A full app reload may be needed for native RTL on first toggle.
        </Text>

        <View style={styles.signOut}>
          <Button title={t('settings.signOut')} variant="secondary" fullWidth onPress={signOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { padding: space[4], gap: space[4] },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: colors.primary, fontSize: font.size.body, fontWeight: font.weight.semibold },
  title: { fontSize: font.size.h2, color: colors.textHi, fontWeight: font.weight.bold },
  profile: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  name: { fontSize: font.size.h3, color: colors.textHi, fontWeight: font.weight.bold },
  email: { fontSize: font.size.caption, color: colors.textMd },
  sectionLabel: {
    fontSize: font.size.caption,
    color: colors.textMd,
    fontWeight: font.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: space[2],
  },
  langRow: { flexDirection: 'row', gap: space[2] },
  langBtn: {
    flex: 1,
    paddingVertical: space[3],
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langBtnActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  langText: { color: colors.textMd, fontWeight: font.weight.medium, fontSize: font.size.body },
  langTextActive: { color: colors.primaryDk, fontWeight: font.weight.bold },
  langHint: { fontSize: font.size.micro, color: colors.textLo },
  signOut: { marginTop: space[4] },
});
