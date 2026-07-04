import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ExternalLink, LifeBuoy } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth';
import { CRISIS_HELPLINE_URL, PRIVACY_URL, TERMS_URL } from '@/services/api';
import { changeLocale, type AppLocale } from '@i18n/index';
import { Avatar, Button, Card, useToast } from '@components/index';
import { colors, font, radius, space } from '@theme/tokens';

type Props = {
  onClose: () => void;
};

export function SettingsScreen({ onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { user, signOut, deleteAccount } = useAuth();
  const toast = useToast();
  const current = (i18n.language as AppLocale) ?? 'en';
  const [deleting, setDeleting] = useState(false);

  const switchLocale = async (loc: AppLocale) => {
    if (loc === current) return;
    await changeLocale(loc);
  };

  const doDelete = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      toast.show(t('settings.deleted'), 'success');
    } catch (e) {
      toast.show(e instanceof Error ? e.message : t('errors.generic'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (globalThis.confirm?.(`${t('settings.deleteConfirmTitle')}\n\n${t('settings.deleteConfirmBody')}`)) {
        void doDelete();
      }
      return;
    }
    Alert.alert(t('settings.deleteConfirmTitle'), t('settings.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.deleteAccount'), style: 'destructive', onPress: () => void doDelete() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.backRow}>
            <ArrowLeft size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.back}>{t('common.back')}</Text>
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

        <Text style={styles.langHint}>{t('settings.rtlHint')}</Text>

        <Text style={styles.sectionLabel}>{t('settings.crisisTitle')}</Text>
        <Card>
          <View style={styles.crisisRow}>
            <LifeBuoy size={22} color={colors.danger} strokeWidth={2} />
            <View style={{ flex: 1, gap: space[2] }}>
              <Text style={styles.crisisBody}>{t('settings.crisisBody')}</Text>
              <Pressable onPress={() => Linking.openURL(CRISIS_HELPLINE_URL)} hitSlop={6}>
                <Text style={styles.linkText}>{t('settings.crisisFind')}</Text>
              </Pressable>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>{t('settings.legal')}</Text>
        <Card>
          <Pressable style={styles.legalRow} onPress={() => Linking.openURL(TERMS_URL)} hitSlop={4}>
            <Text style={styles.legalText}>{t('settings.terms')}</Text>
            <ExternalLink size={16} color={colors.textMd} strokeWidth={2} />
          </Pressable>
          <View style={styles.legalDivider} />
          <Pressable style={styles.legalRow} onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={4}>
            <Text style={styles.legalText}>{t('settings.privacyPolicy')}</Text>
            <ExternalLink size={16} color={colors.textMd} strokeWidth={2} />
          </Pressable>
        </Card>

        <Text style={styles.sectionLabel}>{t('settings.account')}</Text>
        <View style={styles.accountActions}>
          <Button title={t('settings.signOut')} variant="secondary" fullWidth onPress={signOut} />
          <Pressable onPress={confirmDelete} disabled={deleting} style={styles.deleteBtn} hitSlop={6}>
            <Text style={styles.deleteText}>{t('settings.deleteAccount')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceAlt },
  content: { padding: space[4], gap: space[4] },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
  crisisRow: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  crisisBody: { color: colors.textMd, fontSize: font.size.caption, lineHeight: 18 },
  linkText: { color: colors.primary, fontSize: font.size.caption, fontWeight: font.weight.semibold },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[2],
  },
  legalText: { color: colors.textHi, fontSize: font.size.body },
  legalDivider: { height: 1, backgroundColor: colors.border },
  accountActions: { gap: space[3] },
  deleteBtn: { alignSelf: 'center', paddingVertical: space[1] },
  deleteText: { color: colors.danger, fontSize: font.size.caption, fontWeight: font.weight.semibold },
});
