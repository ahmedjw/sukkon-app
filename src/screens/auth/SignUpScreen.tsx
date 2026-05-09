import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth';
import { validateEmail, validateName, validatePassword } from '@/auth/validation';
import { Button, Input, PasswordInput, SocialButton, useToast } from '@components/index';
import { colors, font, space } from '@theme/tokens';

type Props = {
  onSignIn: () => void;
};

export function SignUpScreen({ onSignIn }: Props) {
  const { t } = useTranslation();
  const { signUp, signInWithProvider } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errs, setErrs] = useState<{ name?: string; email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    const nErr = validateName(name, t);
    const eErr = validateEmail(email, t);
    const pErr = validatePassword(password, t);
    setErrs({ name: nErr, email: eErr, password: pErr });
    if (nErr || eErr || pErr) return;
    try {
      setBusy(true);
      await signUp(name.trim(), email.trim(), password);
    } catch {
      toast.show('Sign up failed', 'error');
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
            <Text style={styles.title}>{t('auth.signUpTitle')}</Text>
            <Text style={styles.subtitle}>{t('auth.signUpSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.name')}
              placeholder={t('auth.namePlaceholder')}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
              error={errs.name}
            />
            <Input
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={errs.email}
            />
            <PasswordInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              error={errs.password}
            />

            <Button title={t('auth.signUp')} fullWidth loading={busy} onPress={onSubmit} />
            <Text style={styles.agree}>{t('auth.agree')}</Text>
          </View>

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

          <View style={styles.bottomLink}>
            <Text style={styles.bottomLinkText}>{t('auth.haveAccount')} </Text>
            <Pressable onPress={onSignIn} hitSlop={8}>
              <Text style={styles.linkAction}>{t('auth.signIn')}</Text>
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
  agree: { color: colors.textLo, fontSize: font.size.caption, textAlign: 'center', marginTop: space[1] },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { color: colors.textLo, fontSize: font.size.caption },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: space[3] },
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto' },
  bottomLinkText: { color: colors.textMd, fontSize: font.size.body },
  linkAction: { color: colors.primary, fontSize: font.size.body, fontWeight: font.weight.semibold },
});
