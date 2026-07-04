import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth';
import { validateEmail, validatePassword } from '@/auth/validation';
import { Button, Input, PasswordInput, useToast } from '@components/index';
import { colors, font, space } from '@theme/tokens';

type Props = {
  onBack: () => void;
};

type Step = 'email' | 'reset';

export function ForgotPasswordScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const { requestPasswordReset, resetPassword } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState<string>();
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState<string>();
  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState<string>();
  const [busy, setBusy] = useState(false);

  const onRequest = async () => {
    const err = validateEmail(email, t);
    setEmailErr(err);
    if (err) return;
    try {
      setBusy(true);
      const devToken = await requestPasswordReset(email.trim());
      // Dev builds get the token back so the flow is testable without email.
      if (devToken) setCode(devToken);
      toast.show(t('auth.resetSent'), 'success');
      setStep('reset');
    } catch (e) {
      toast.show(e instanceof Error ? e.message : t('errors.generic'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    const cErr = code.trim().length < 32 ? t('validation.resetCodeInvalid') : undefined;
    const pErr = validatePassword(password, t);
    setCodeErr(cErr);
    setPasswordErr(pErr);
    if (cErr || pErr) return;
    try {
      setBusy(true);
      await resetPassword(code.trim(), password);
      toast.show(t('auth.resetDone'), 'success');
      onBack();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : t('errors.generic'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={onBack} hitSlop={8} style={styles.back}>
            <ArrowLeft size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.backText}>{t('common.back')}</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.forgotTitle')}</Text>
            <Text style={styles.subtitle}>
              {step === 'email' ? t('auth.forgotSubtitle') : t('auth.resetStepSubtitle')}
            </Text>
          </View>

          {step === 'email' ? (
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
              <Button title={t('auth.sendReset')} fullWidth loading={busy} onPress={onRequest} />
              <Pressable onPress={() => setStep('reset')} hitSlop={8} style={styles.haveCode}>
                <Text style={styles.haveCodeText}>{t('auth.haveResetCode')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label={t('auth.resetCode')}
                placeholder={t('auth.resetCodePlaceholder')}
                autoCapitalize="none"
                value={code}
                onChangeText={setCode}
                error={codeErr}
              />
              <PasswordInput
                label={t('auth.newPassword')}
                placeholder={t('auth.newPasswordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                error={passwordErr}
              />
              <Button title={t('auth.resetPasswordCta')} fullWidth loading={busy} onPress={onReset} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: space[5], gap: space[5], flexGrow: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: space[1] },
  backText: { color: colors.primary, fontSize: font.size.body, fontWeight: font.weight.semibold },
  header: { gap: space[1] },
  title: { fontSize: font.size.h1, color: colors.textHi, fontWeight: font.weight.bold },
  subtitle: { fontSize: font.size.body, color: colors.textMd },
  form: { gap: space[3] },
  haveCode: { alignSelf: 'center', paddingVertical: space[1] },
  haveCodeText: { color: colors.primary, fontSize: font.size.caption, fontWeight: font.weight.semibold },
});
