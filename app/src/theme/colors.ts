/**
 * Color palette (provided design tokens):
 * - FDFFFC — off-white
 * - 235789 — blue
 * - C1292E — red
 * - F1D302 — yellow
 * - 020100 — near-black
 *
 * Mapped to semantic roles used across the app. Keep all raw hex values here;
 * screens/components should reference the semantic tokens, not raw hex codes.
 */
export const palette = {
  offWhite: "#FDFFFC",
  blue: "#235789",
  red: "#C1292E",
  yellow: "#F1D302",
  black: "#020100",
} as const;

export const colors = {
  background: palette.offWhite,
  surface: palette.offWhite,
  primary: palette.blue,
  onPrimary: palette.offWhite,
  error: palette.red,
  onError: palette.offWhite,
  accent: palette.yellow,
  onAccent: palette.black,
  text: palette.black,
  textMuted: "#5A5A57",
  border: "#D8D8D4",
} as const;

export type ColorToken = keyof typeof colors;
