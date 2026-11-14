/**
 * Regis Properties — design tokens (source of truth).
 *
 * Palette values follow the Regis Properties logo (Azul #0B4EA2, Azul
 * Profundo #0F2B4C, Dourado #E0A010, Cinza Claro #E5E7EB, Branco #FFFFFF).
 * Update here only — never scatter raw colors through components.
 */

export const colors = {
  brand: {
    navy: "#0F2B4C",
    navyDeep: "#071C30",
    navySoft: "#1E4468",
    accent: "#0B4EA2",
    accentHover: "#093E82",
    accentSoft: "#E4ECF5",
    gold: "#E0A010",
    goldHover: "#B87F0B",
    goldSoft: "#FBF0CE",
    cream: "#E5E7EB",
  },
  surface: {
    base: "#FFFFFF",
    soft: "#F7F7F7",
    muted: "#F1F1F1",
    inverse: "#101010",
    inverseElevated: "#161616",
    inverseRaised: "#1F1F1F",
  },
  text: {
    primary: "#0F2B4C",
    secondary: "#3F5872",
    muted: "#6B7F93",
    inverse: "#FFFFFF",
    inverseMuted: "#D4D4D4",
    brand: "#0F2B4C",
  },
  border: {
    base: "#E5E7EB",
    strong: "#CFCFCF",
    inverse: "#2A2A2A",
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
  card: "0 8px 28px rgba(7, 28, 48, 0.1)",
  elevated: "0 18px 48px rgba(7, 28, 48, 0.18)",
  focusRing: "0 0 0 3px rgba(11, 78, 162, 0.4)",
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
