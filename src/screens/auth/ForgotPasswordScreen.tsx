import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth';
import { validateEmail } from '@/auth/validation';
import { Button, Input, useToast } from '@components/index';
import { colors, font, space } from '@theme/tokens';

type Props = {
  onBack: () => void;
};

export function ForgotPasswordScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const { requestPasswordReset } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState<string>();
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const err = validateEmail(email, t);
    setEmailErr(err);
    if (err) return;
    try {
      setBusy(true);
      await requestPasswordReset(email.trim());
      toast.show(t('auth.resetSent'), 'success');
      onBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={onBack} hitSlop={8} style={styles.back}>
            <Text style={styles.backText}>← {t('common.back')}</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.forgotTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.forgotSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={emailErr}
            />
            <Button title={t('auth.sendReset')} fullWidth loading={busy} onPress={onSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: space[5], gap: space[5], flexGrow: 1 },
  back: { paddingVertical: space[1] },
  backText: { color: colors.primary, fontSize: font.size.body, fontWeight: font.weight.semibold },
  header: { gap: space[1] },
  title: { fontSize: font.size.h1, color: colors.textHi, fontWeight: font.weight.bold },
  subtitle: { fontSize: font.size.body, color: colors.textMd },
  form: { gap: space[3] },
});
