import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  locale: 'en' | 'ar';
};

type Status = 'loading' | 'authed' | 'unauthed';

type AuthContextValue = {
  status: Status;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'twitter') => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function fakeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('unauthed');
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback(async (email: string, _password: string) => {
    setStatus('loading');
    await delay(600);
    setUser({
      id: fakeId(),
      name: email.split('@')[0] || 'Manar',
      email,
      locale: 'en',
    });
    setStatus('authed');
  }, []);

  const signUp = useCallback(async (name: string, email: string, _password: string) => {
    setStatus('loading');
    await delay(700);
    setUser({
      id: fakeId(),
      name,
      email,
      locale: 'en',
    });
    setStatus('authed');
  }, []);

  const signInWithProvider = useCallback(async (provider: 'google' | 'facebook' | 'twitter') => {
    setStatus('loading');
    await delay(500);
    setUser({
      id: fakeId(),
      name: `Sukoun ${provider}`,
      email: `${provider}@sukoun.app`,
      locale: 'en',
    });
    setStatus('authed');
  }, []);

  const requestPasswordReset = useCallback(async (_email: string) => {
    await delay(500);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setStatus('unauthed');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, signInWithProvider, requestPasswordReset, signOut }),
    [status, user, signIn, signUp, signInWithProvider, requestPasswordReset, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
