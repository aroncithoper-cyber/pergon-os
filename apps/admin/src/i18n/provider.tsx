"use client";

import * as React from "react";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { DEFAULT_UI_LOCALE, type UiLocale } from "@pergon/shared/i18n";

import { DICTIONARIES } from "./dictionary";
import { resolveMessage } from "./types";

type I18nContextValue = {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale = DEFAULT_UI_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: UiLocale;
}) {
  const [locale, setLocale] = React.useState<UiLocale>(initialLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const primary = resolveMessage(DICTIONARIES[locale], key, params);
      if (primary !== key) return primary;
      return resolveMessage(DICTIONARIES[DEFAULT_UI_LOCALE], key, params);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n debe usarse dentro de I18nProvider");
  }
  return ctx;
}
