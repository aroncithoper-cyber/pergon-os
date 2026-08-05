/** Design token contracts for @pergon/ui — values live in globals.css */

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
} as const;

export const verificationWidths = [375, 768, 1024, 1440] as const;

export const spacingScale = [4, 8, 12, 16, 24, 32, 48, 64] as const;

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
