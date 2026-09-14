import type { Dictionary, Locale } from "./types";
import en from "./locales/en";
import ar from "./locales/ar";

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  ar,
};

export const defaultLocale: Locale = "en";
