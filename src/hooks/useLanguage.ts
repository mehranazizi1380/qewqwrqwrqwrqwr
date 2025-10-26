
import { useState, useEffect } from 'react';

export type Language = 'en' | 'fa' | 'ar' | 'es' | 'fr' | 'de' | 'ru' | 'zh' | 'ja' | 'ko';

const languages = {
  en: 'English',
  fa: 'فارسی',
  ar: 'العربية',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
};

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && languages[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
    
    // Update document direction for RTL languages
    if (language === 'fa' || language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    languages,
  };
}
