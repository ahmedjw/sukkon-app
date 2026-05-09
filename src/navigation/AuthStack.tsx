import { useState } from 'react';

import {
  ForgotPasswordScreen,
  SignInScreen,
  SignUpScreen,
  WelcomeScreen,
} from '@screens/auth/index';

type AuthStep = 'welcome' | 'signIn' | 'signUp' | 'forgot';

export function AuthStack() {
  const [step, setStep] = useState<AuthStep>('welcome');

  switch (step) {
    case 'welcome':
      return <WelcomeScreen onFinish={() => setStep('signIn')} />;
    case 'signIn':
      return (
        <SignInScreen
          onSignUp={() => setStep('signUp')}
          onForgot={() => setStep('forgot')}
        />
      );
    case 'signUp':
      return <SignUpScreen onSignIn={() => setStep('signIn')} />;
    case 'forgot':
      return <ForgotPasswordScreen onBack={() => setStep('signIn')} />;
  }
}
