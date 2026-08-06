import { DEFAULT_UI_LOCALE, type UiLocale } from "@pergon/shared/i18n";

import { enUS } from "./messages/en-US";
import { esMX } from "./messages/es-MX";
import { resolveMessage, type MessageTree } from "./types";

export const DICTIONARIES: Record<UiLocale, MessageTree> = {
  "es-MX": esMX,
  "en-US": enUS,
};

/** Translate without React — default es-MX (nav, loading, server components). */
export function tStatic(key: string, params?: Record<string, string | number>): string {
  const primary = resolveMessage(DICTIONARIES[DEFAULT_UI_LOCALE], key, params);
  return primary;
}

export function tLocale(
  locale: UiLocale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const primary = resolveMessage(DICTIONARIES[locale], key, params);
  if (primary !== key) return primary;
  return resolveMessage(DICTIONARIES[DEFAULT_UI_LOCALE], key, params);
}
