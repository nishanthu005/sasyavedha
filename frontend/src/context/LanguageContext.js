import React, { createContext, useContext, useState } from 'react';
import translations from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = { ...translations.en, ...(translations[lang] || {}) };
  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
