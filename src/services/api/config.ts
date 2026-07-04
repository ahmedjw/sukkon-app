import { Platform } from 'react-native';
import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
  apiBaseUrlAndroid?: string;
  termsUrl?: string;
  privacyUrl?: string;
  crisisHelplineUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const ENV_OVERRIDE = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!__DEV__ && !ENV_OVERRIDE) {
  // Release builds must point at a real backend — eas.json sets this per profile.
  console.warn('[config] EXPO_PUBLIC_API_BASE_URL is not set; falling back to dev URLs.');
}

function pickBase(): string {
  if (ENV_OVERRIDE && ENV_OVERRIDE.length > 0) return ENV_OVERRIDE;
  if (Platform.OS === 'android') {
    return extra.apiBaseUrlAndroid ?? extra.apiBaseUrl ?? 'http://10.0.2.2:4000/v1';
  }
  return extra.apiBaseUrl ?? 'http://localhost:4000/v1';
}

export const API_BASE_URL = pickBase();

export const TERMS_URL = extra.termsUrl ?? 'https://sukoun.app/terms';
export const PRIVACY_URL = extra.privacyUrl ?? 'https://sukoun.app/privacy';
export const CRISIS_HELPLINE_URL = extra.crisisHelplineUrl ?? 'https://findahelpline.com';
