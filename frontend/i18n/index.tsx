import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import en from './en';
import bg from './bg';

export type Language = 'en' | 'bg';
type TranslationKeys = keyof typeof en;
type Translations = Record<TranslationKeys, string>;

const translations: Record<Language, Translations> = { en, bg };

const LANG_KEY = 'app_language';

async function loadLanguage(): Promise<Language> {
  try {
    if (Platform.OS === 'web') {
      return (localStorage.getItem(LANG_KEY) as Language) || 'en';
    }
    const SecureStore = await import('expo-secure-store');
    const val = await SecureStore.getItemAsync(LANG_KEY);
    return (val as Language) || 'en';
  } catch {
    return 'en';
  }
}

async function saveLanguage(lang: Language) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(LANG_KEY, lang);
    } else {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync(LANG_KEY, lang);
    }
  } catch { /* ignore */ }
}

interface I18nContextType {
  lang: Language;
  t: (key: TranslationKeys) => string;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  t: (key) => en[key] || key,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage().then(setLangState);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    saveLanguage(newLang);
  }, []);

  const t = useCallback((key: TranslationKeys): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}

export type { TranslationKeys };
