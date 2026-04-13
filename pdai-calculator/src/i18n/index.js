import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './ru.json';
import en from './en.json';
import uz from './uz.json';
import kk from './kk.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      uz: { translation: uz },
      kk: { translation: kk },
    },
    fallbackLng: 'en',
    supportedLngs: ['ru', 'en', 'uz', 'kk'],
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
