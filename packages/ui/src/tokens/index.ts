/** Design token contracts for @pergon/ui — values live in globals.css */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
  verify: [375, 430, 768, 820, 1024, 1440, 1920],
} as const;

/** Canonical spacing scale (px). Never invent off-scale values. */
export const spacingScale = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

/**
 * Official Signature radii (px). Never use random radii in product UI.
 * Controls → md · Panels → lg · Artifacts → xl · Hero rare → 2xl
 */
export const signatureRadii = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
} as const;

/** Signature material palette — Instrumental Realism / PerGon universe */
export const signatureMaterials = [
  "carbon",
  "graphite",
  "steel",
  "electric",
  "white",
  "glass",
] as const;

export type SignatureMaterial = (typeof signatureMaterials)[number];

/** Signature utility family (CSS classes) */
export const signatureUtilities = [
  "sig-universe",
  "sig-grid",
  "sig-grid-12",
  "sig-grid-lines",
  "sig-glow",
  "sig-glow-soft",
  "sig-glow-rim",
  "sig-glass",
  "sig-glass-deep",
  "sig-panel",
  "sig-panel-raised",
  "sig-divider",
  "sig-divider-strong",
  "sig-card",
  "sig-card-interactive",
  "sig-icon",
  "sig-icon-signal",
  "sig-qr",
  "sig-data",
  "sig-data-label",
  "sig-data-value",
  "sig-btn-face",
] as const;

/** Modular type roles — map to CSS utilities `.type-*` */
export const typographyRoles = [
  "display-xxl",
  "display-xl",
  "display-l",
  "h1",
  "h2",
  "h3",
  "lead",
  "body-xl",
  "body",
  "small",
  "caption",
  "label",
] as const;

export type TypographyRole = (typeof typographyRoles)[number];

export const motionDurations = {
  micro: "var(--duration-micro)",
  ui: "var(--duration-ui)",
  panel: "var(--duration-panel)",
  section: "var(--duration-section)",
} as const;

export const motionEasing = {
  out: "var(--ease-out)",
  in: "var(--ease-in)",
  inout: "var(--ease-inout)",
} as const;

export const zIndex = {
  base: "var(--z-base)",
  raised: "var(--z-raised)",
  sticky: "var(--z-sticky)",
  dropdown: "var(--z-dropdown)",
  overlay: "var(--z-overlay)",
  modal: "var(--z-modal)",
  toast: "var(--z-toast)",
  tooltip: "var(--z-tooltip)",
} as const;

export const semanticStatuses = [
  "default",
  "success",
  "warning",
  "info",
  "destructive",
  "muted",
] as const;

export type SemanticStatus = (typeof semanticStatuses)[number];

export const verificationWidths = [375, 430, 768, 820, 1024, 1440, 1920] as const;
