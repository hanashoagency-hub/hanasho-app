"use client";

import { createContext, useContext, useEffect, useState } from "react";
import so from "./dictionaries/so";
import en from "./dictionaries/en";
import ar from "./dictionaries/ar";

export type Lang = "so" | "en" | "ar";
export type Dictionary = typeof so;

const dictionaries: Record<Lang, Dictionary> = { so, en, ar };
const RTL_LANGS: Lang[] = ["ar"];
const STORAGE_KEY = "hanhub-lang";

interface LanguageContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  dict: Dictionary;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("so");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && dictionaries[stored]) {
      setLangState(stored);
      applyDomLang(stored);
    }
  }, []);

  const applyDomLang = (next: Lang) => {
    document.documentElement.lang = next;
    document.documentElement.dir = RTL_LANGS.includes(next) ? "rtl" : "ltr";
  };

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyDomLang(next);
  };

  const dir: "ltr" | "rtl" = RTL_LANGS.includes(lang) ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, dir, dict: dictionaries[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
