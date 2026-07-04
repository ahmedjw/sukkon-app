import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiError, authApi, authStorage, setSessionExpiredHandler, type SignedUser } from '@/services/api';

export type AuthUser = SignedUser;

type Status = 'loading' | 'authed' | 'unauthed';

type AuthContextValue = {
  status: Status;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'twitter') => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string | undefined>;
  resetPassword: (token: string, password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function friendly(err: unknown): never {
  if (err instanceof ApiError) {
    throw new Error(err.message);
  }
  throw err instanceof Error ? err : new Error('Network error');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Bootstrap: if a token already lives in storage, try to load the user.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await authStorage.getToken();
      if (!token) {
        if (!cancelled) setStatus('unauthed');
        return;
      }
      try {
        const me = await authApi.me();
        if (cancelled) return;
        setUser(me);
        setStatus('authed');
      } catch {
        await authStorage.setToken(null);
        if (!cancelled) setStatus('unauthed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const apply = useCallback(async (session: { token: string; user: SignedUser }) => {
    await authStorage.setToken(session.token);
    setUser(session.user);
    setStatus('authed');
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setStatus('loading');
      try {
        const session = await authApi.signin({ email, password });
        await apply(session);
      } catch (e) {
        setStatus('unauthed');
        friendly(e);
      }
    },
    [apply],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      setStatus('loading');
      try {
        const session = await authApi.signup({ name, email, password });
        await apply(session);
      } catch (e) {
        setStatus('unauthed');
        friendly(e);
      }
    },
    [apply],
  );

  const signInWithProvider = useCallback(
    async (provider: 'google' | 'facebook' | 'twitter') => {
      setStatus('loading');
      try {
        const session = await authApi.social(provider);
        await apply(session);
      } catch (e) {
        setStatus('unauthed');
        friendly(e);
      }
    },
    [apply],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const res = await authApi.forgotPassword(email);
      return res.devResetToken;
    } catch (e) {
      friendly(e);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      await authApi.resetPassword(token, password);
    } catch (e) {
      friendly(e);
    }
  }, []);

  const signOut = useCallback(() => {
    authStorage.setToken(null);
    setUser(null);
    setStatus('unauthed');
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      await authApi.deleteAccount();
    } catch (e) {
      friendly(e);
    }
    signOut();
  }, [signOut]);

  // Expired/revoked token mid-session → the HTTP client clears storage and
  // pings us so the UI returns to the auth stack.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus('unauthed');
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn,
      signUp,
      signInWithProvider,
      requestPasswordReset,
      resetPassword,
      deleteAccount,
      signOut,
    }),
    [status, user, signIn, signUp, signInWithProvider, requestPasswordReset, resetPassword, deleteAccount, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
