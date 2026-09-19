import { useEffect, useState } from 'react';
import { aboutCopy, type Language } from '@/constants/aboutCopy';

const KEY = 'language';

// Same model as the portfolio (localStorage 'language'), plus ?lang=ja so the
// portfolio's JA mode can link here — localStorage isn't shared across origins.
export function useAboutLanguage() {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Read after mount (client-only); the server always renders EN.
    const param = new URLSearchParams(window.location.search).get('lang');
    const stored = param ?? localStorage.getItem(KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === 'en' || stored === 'ja') setLanguage(stored);
  }, []);

  // The app shell ships lang="ja"; restore it when leaving this page.
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = prev;
    };
  }, [language]);

  const toggleLanguage = () => {
    const next = language === 'en' ? 'ja' : 'en';
    setLanguage(next);
    localStorage.setItem(KEY, next);
  };

  return { t: aboutCopy[language], toggleLanguage };
}
