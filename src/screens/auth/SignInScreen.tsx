import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth';
import { validateEmail, validatePassword } from '@/auth/validation';
import { Button, Input, LegalLinks, PasswordInput, SocialButton, useToast } from '@components/index';
import { colors, font, space } from '@theme/tokens';

type Props = {
  onSignUp: () => void;
  onForgot: () => void;
};

export function SignInScreen({ onSignUp, onForgot }: Props) {
  const { t } = useTranslation();
  const { signIn, signInWithProvider } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState<string>();
  const [passwordErr, setPasswordErr] = useState<string>();
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const eErr = validateEmail(email, t);
    const pErr = validatePassword(password, t);
    setEmailErr(eErr);
    setPasswordErr(pErr);
    if (eErr || pErr) return;
    try {
      setBusy(true);
      await signIn(email.trim(), password);
    } catch {
      toast.show('Sign in failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.signInTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.signInSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={emailErr}
            />
            <PasswordInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              error={passwordErr}
            />
            <Pressable onPress={onForgot} style={styles.forgot} hitSlop={8}>
              <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
            </Pressable>

            <Button
              title={t('auth.signIn')}
              fullWidth
              loading={busy}
              onPress={onSubmit}
            />
          </View>

          {__DEV__ ? (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>{t('auth.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <SocialButton provider="google" onPress={() => signInWithProvider('google')} />
                <SocialButton provider="facebook" onPress={() => signInWithProvider('facebook')} />
                <SocialButton provider="twitter" onPress={() => signInWithProvider('twitter')} />
              </View>
            </>
          ) : null}

          <LegalLinks />

          <View style={styles.bottomLink}>
            <Text style={styles.bottomLinkText}>{t('auth.noAccount')} </Text>
            <Pressable onPress={onSignUp} hitSlop={8}>
              <Text style={styles.linkAction}>{t('auth.signUp')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: space[5], gap: space[5], flexGrow: 1 },
  header: { gap: space[1] },
  title: { fontSize: font.size.h1, color: colors.textHi, fontWeight: font.weight.bold },
  subtitle: { fontSize: font.size.body, color: colors.textMd },
  form: { gap: space[3] },
  forgot: { alignSelf: 'flex-end', paddingVertical: space[1] },
  forgotText: { color: colors.primary, fontWeight: font.weight.semibold, fontSize: font.size.caption },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { color: colors.textLo, fontSize: font.size.caption },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: space[3] },
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto' },
  bottomLinkText: { color: colors.textMd, fontSize: font.size.body },
  linkAction: { color: colors.primary, fontSize: font.size.body, fontWeight: font.weight.semibold },
});
