import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'sukoun.auth.token';
const isWeb = Platform.OS === 'web';

async function readPersisted(): Promise<string | null> {
  try {
    if (isWeb) return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function writePersisted(t: string | null): Promise<void> {
  try {
    if (isWeb) {
      if (t) globalThis.localStorage?.setItem(TOKEN_KEY, t);
      else globalThis.localStorage?.removeItem(TOKEN_KEY);
      return;
    }
    if (t) await SecureStore.setItemAsync(TOKEN_KEY, t);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Persistence failing (e.g. keychain unavailable) degrades to session-only auth.
  }
}

let cached: string | null = null;
let loaded = false;
const listeners = new Set<(t: string | null) => void>();

export const authStorage = {
  async getToken(): Promise<string | null> {
    if (!loaded) {
      cached = await readPersisted();
      loaded = true;
    }
    return cached;
  },
  async setToken(t: string | null): Promise<void> {
    cached = t;
    loaded = true;
    await writePersisted(t);
    listeners.forEach((fn) => fn(t));
  },
  subscribe(fn: (t: string | null) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
