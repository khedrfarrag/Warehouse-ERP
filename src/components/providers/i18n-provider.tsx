"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { en, TranslationDictionary } from "@/lib/i18n/en";
import { ar } from "@/lib/i18n/ar";

export type Language = "en" | "ar";

interface I18nContextType {
  language: Language;
  direction: "ltr" | "rtl";
  isRtl: boolean;
  t: TranslationDictionary;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "sinoma_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "ar" || saved === "en") {
      setLanguageState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    } else {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const currentDict = language === "ar" ? ar : en;
  const direction = language === "ar" ? "rtl" : "ltr";

  const isRtl = direction === "rtl";

  return (
    <I18nContext.Provider
      value={{
        language,
        direction,
        isRtl,
        t: currentDict,
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

