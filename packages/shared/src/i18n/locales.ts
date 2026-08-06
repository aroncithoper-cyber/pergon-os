/**
 * Locale constants for PerGon OS.
 * UI BackOffice default: Mexican Spanish. English catalog is prepared for future use.
 */
export const UI_LOCALES = ["es-MX", "en-US"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

/** Default UI locale for Admin / internal surfaces. */
export const DEFAULT_UI_LOCALE: UiLocale = "es-MX";

/** HTML `lang` attribute (BCP 47). */
export const DEFAULT_LOCALE = "es-MX" as const;

/** CMS content locale (separate from UI locale). */
export const DEFAULT_CONTENT_LOCALE = "es" as const;
