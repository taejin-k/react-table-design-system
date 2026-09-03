/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";
// The package's public tsconfig intentionally excludes Node types; Vitest still runs in Node.
// @ts-expect-error -- node:fs is only used by this build-contract test.
import { readFileSync } from "node:fs";

const themeCss = readFileSync("theme.css", "utf8");
const inputCss = readFileSync("src/styles/input.css", "utf8");
const interactiveCss = readFileSync("src/styles/interactive.css", "utf8");

const tokens = {
  primary: "#0062df",
  selected: "#e6f4ff",
  success: "#52c41a",
  warning: "#faad14",
  danger: "#ff4d4f",
  navy: "#023f97",
  purple: "#4f19c4",
  dark: "#111111",
  "dark-gray": "#666666",
  gray: "#999999",
  disabled: "#bbbbbb",
  border: "#dddddd",
  hover: "#f2f2f2",
  black: "#000000",
  white: "#ffffff",
} as const;

const shadows = {
  xs: "0 1px 2px rgb(0 0 0 / 0.12)",
  sm: "0 2px 4px rgb(0 0 0 / 0.16)",
  md: "0 3px 8px rgb(0 0 0 / 0.12)",
  lg: "0 3px 6px rgb(0 0 0 / 0.2)",
} as const;

const presentationSources = import.meta.glob<string>(
  ["./**/*.tsx", "!./**/*.stories.tsx", "!./**/*.test.tsx", "!./ColorPicker/ColorPicker.tsx"],
  { eager: true, import: "default", query: "?raw" },
);

const presentationTokenValues = Object.entries(tokens)
  .filter(([name]) => name !== "black" && name !== "white")
  .map(([, value]) => value);

describe("semantic color token contract", () => {
  it("defines every semantic color as a static Tailwind theme token", () => {
    expect(themeCss).toContain("@theme static");

    for (const [name, value] of Object.entries(tokens)) {
      expect(themeCss.toLowerCase()).toContain(`--color-${name}: ${value}`);
      expect(inputCss).toContain(name);
    }
  });

  it("keeps semantic presentation colors out of component implementations", () => {
    const hardcodedToken = new RegExp(presentationTokenValues.join("|"), "i");

    for (const [path, source] of Object.entries(presentationSources)) {
      expect(source, path).not.toMatch(hardcodedToken);
    }
    expect(interactiveCss).not.toMatch(hardcodedToken);
  });
});

describe("shadow token contract", () => {
  it("defines the shared elevation scale as static Tailwind theme tokens", () => {
    for (const [name, value] of Object.entries(shadows)) {
      expect(themeCss.toLowerCase()).toContain(`--shadow-${name}: ${value}`);
    }
    expect(themeCss).toContain("--shadow-xl:");
    expect(themeCss).toContain("--shadow-2xl:");
    expect(themeCss).toContain("--drop-shadow-md:");
  });
});
