import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { I18nManager } from 'react-native';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';

export type AppLocale = 'en' | 'ar';

const SUPPORTED: AppLocale[] = ['en', 'ar'];

function detectInitialLocale(): AppLocale {
  const device = Localization.getLocales()[0]?.languageCode ?? 'en';
  return SUPPORTED.includes(device as AppLocale) ? (device as AppLocale) : 'en';
}

export async function setupI18n(): Promise<AppLocale> {
  const initial = detectInitialLocale();

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: initial,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  applyRTL(initial);
  return initial;
}

export function applyRTL(locale: AppLocale) {
  const shouldBeRTL = locale === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }
}

export async function changeLocale(locale: AppLocale) {
  await i18n.changeLanguage(locale);
  applyRTL(locale);
}

export default i18n;
