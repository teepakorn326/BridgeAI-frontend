"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import en from "@/locales/en.json";
import zh from "@/locales/zh.json";

export type Locale = "en" | "zh";

const MESSAGES: Record<Locale, unknown> = { en, zh };
const STORAGE_KEY = "bridgeai.locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: <T = string>(key: string) => T;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolvePath(obj: unknown, key: string): unknown {
  const parts = key.split(".");
  let node: unknown = obj;
  for (const part of parts) {
    if (node == null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return node;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "zh") setLocaleState(stored);
    } catch {
      /* no-op */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* no-op */
    }
  }, []);

  const t = useCallback(
    <T,>(key: string): T => {
      const value = resolvePath(MESSAGES[locale], key);
      return (value ?? key) as T;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside I18nProvider");
  return ctx;
}

export function LanguageToggle() {
  const { locale, setLocale } = useT();
  const cls = (active: boolean) =>
    `transition-colors ${
      active
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div
      className="flex items-center text-xs font-medium select-none"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cls(locale === "en")}
      >
        EN
      </button>
      <span className="mx-1.5 text-muted-foreground/40">/</span>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className={cls(locale === "zh")}
      >
        中文
      </button>
    </div>
  );
}
