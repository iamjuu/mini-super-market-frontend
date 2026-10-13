import en from './en';
import ar from './ar';
import hi from './hi';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export const translations = {
  en,
  ar,
  hi,
};

export const getTranslation = (langCode = 'en') => {
  return translations[langCode] || translations.en;
};

export const getAppLanguage = () => {
  try {
    return localStorage.getItem('app_language') || 'en';
  } catch (e) {
    return 'en';
  }
};

export const setAppLanguage = (code) => {
  try {
    localStorage.setItem('app_language', code);
  } catch (e) {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app_language_changed', { detail: code }));
  }
};

export default translations;
