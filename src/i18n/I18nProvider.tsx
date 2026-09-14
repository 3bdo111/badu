"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionaries } from "./dictionaries";
import {
  directionFor,
  LOCALE_COOKIE,
  type DictionaryPath,
  type Direction,
  type Dictionary,
  type Locale,
} from "./types";

interface I18nContextValue {
  locale: Locale;
  dir: Direction;
  t: (key: DictionaryPath<Dictionary>) => string;
  /** Full dictionary — for structured content like FAQ items and feature lists. */
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveKey(dictionary: Dictionary, path: string): string {
  let current: unknown = dictionary;
  for (const segment of path.split(".")) {
    if (current === null || typeof current !== "object") break;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === "string" ? current : path;
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    // Persist so the server renders the correct language on the next visit.
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = directionFor(next);
  }, []);

  const t = useCallback(
    (key: DictionaryPath<Dictionary>) => resolveKey(dictionaries[locale], key),
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir: directionFor(locale),
      t,
      dict: dictionaries[locale],
      setLocale,
    }),
    [locale, t, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within <I18nProvider>");
  }
  return context;
}
