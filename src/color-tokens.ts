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
  "light-gray",
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

const lightColorTokens = new Set<ColorTokenType>([
  "selected",
  "gray",
  "disabled",
  "border",
  "hover",
  "light-gray",
  "white",
]);

export function resolveReadableTextColor(color: string): string {
  const trimmed = color.trim();
  const tokenMatch = trimmed.match(/^var\(--color-([\w-]+)\)$/)?.[1] ?? trimmed;

  if (colorTokenSet.has(tokenMatch)) {
    return lightColorTokens.has(tokenMatch as ColorTokenType)
      ? "var(--color-dark)"
      : "var(--color-white)";
  }

  const rgb = parseCssColor(trimmed);
  if (!rgb) return "var(--color-dark)";
  return rgb.red * 0.299 + rgb.green * 0.587 + rgb.blue * 0.114 > 160
    ? "var(--color-dark)"
    : "var(--color-white)";
}

function parseCssColor(color: string) {
  const hex = color.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i)?.[1];
  if (hex) {
    const normalized = hex.length <= 4 ? [...hex].map((value) => value + value).join("") : hex;
    const alpha = normalized.length === 8 ? Number.parseInt(normalized.slice(6, 8), 16) / 255 : 1;
    const composite = (channel: string) => Number.parseInt(channel, 16) * alpha + 255 * (1 - alpha);
    return {
      red: composite(normalized.slice(0, 2)),
      green: composite(normalized.slice(2, 4)),
      blue: composite(normalized.slice(4, 6)),
    };
  }

  const rgb = color.match(
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)/i,
  );
  if (!rgb) return null;
  return { red: Number(rgb[1]), green: Number(rgb[2]), blue: Number(rgb[3]) };
}
