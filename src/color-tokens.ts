export const colorTokenNames = [
  "primary",
  "selected",
  "success",
  "warning",
  "danger",
  "navy",
  "purple",
  "dark",
  "dark-gray",
  "gray",
  "disabled",
  "border",
  "hover",
  "black",
  "white",
] as const;

export type ColorTokenType = (typeof colorTokenNames)[number];

export const shadowTokenNames = [
  "shadow-xs",
  "shadow-sm",
  "shadow-md",
  "shadow-lg",
  "shadow-xl",
  "shadow-2xl",
] as const;

export type ShadowTokenType = (typeof shadowTokenNames)[number];

const colorTokenSet = new Set<string>(colorTokenNames);

export function resolveColorToken(color: string): string {
  return colorTokenSet.has(color) ? `var(--color-${color})` : color;
}
