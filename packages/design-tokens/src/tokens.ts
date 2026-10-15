/**
 * Serrote Imobiliária — design tokens (source of truth).
 *
 * Palette values were derived from the supplied brand assets in /UI
 * (logo.png, ui-ligth-pricipal.png, ui-dark.png) and cross-checked against the
 * Master Prompt's starting tokens. Update here only — never scatter raw colors
 * through components.
 */

export const colors = {
  brand: {
    navy: "#20334B",
    navyDeep: "#17283B",
    navySoft: "#2B425C",
    orange: "#FF690D",
    orangeHover: "#E85E08",
    orangeSoft: "#FFE9DA",
    mist: "#9DC5D4",
    cream: "#FAF6EE",
  },
  surface: {
    base: "#FFFFFF",
    soft: "#F7F8FA",
    muted: "#EFF3F7",
    inverse: "#0B0D0F",
    inverseElevated: "#14181D",
    inverseRaised: "#1B222B",
  },
  text: {
    primary: "#24364C",
    secondary: "#667386",
    muted: "#8A94A3",
    inverse: "#FFFFFF",
    inverseMuted: "#9AA6B2",
    brand: "#20334B",
  },
  border: {
    base: "#E4E9EF",
    strong: "#CBD5E1",
    inverse: "#2A333F",
  },
  state: {
    success: "#1E7A4B",
    warning: "#B45309",
    danger: "#C0392B",
    info: "#1D6FA5",
  },
} as const;

export const radius = {
  xs: "6px",
  sm: "8px",
  control: "12px",
  card: "16px",
  pill: "999px",
} as const;

export const shadow = {
  card: "0 8px 28px rgba(25, 43, 63, 0.08)",
  elevated: "0 18px 48px rgba(25, 43, 63, 0.14)",
  focusRing: "0 0 0 3px rgba(255, 105, 13, 0.35)",
} as const;

export const typography = {
  fontSans:
    'var(--font-sans), "Inter", "Manrope", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontDisplay:
    'var(--font-display), "Manrope", "Inter", system-ui, sans-serif',
} as const;

export const motion = {
  durationFast: "150ms",
  durationBase: "240ms",
  durationSlow: "400ms",
  easeStandard: "cubic-bezier(0.2, 0.7, 0.2, 1)",
} as const;

export const tokens = { colors, radius, shadow, typography, motion } as const;

export type Tokens = typeof tokens;
