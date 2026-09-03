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
  "primary-hover": "#227cef",
  "primary-loading": "#6ea0fa",
  success: "#52c41a",
  warning: "#faad14",
  danger: "#ff4d4f",
  "danger-hover": "#ff7875",
  navy: "#023f97",
  purple: "#4f19c4",
} as const;

const presentationSources = import.meta.glob<string>(
  ["./**/*.tsx", "!./**/*.stories.tsx", "!./**/*.test.tsx", "!./ColorPicker/ColorPicker.tsx"],
  { eager: true, import: "default", query: "?raw" },
);

describe("semantic color token contract", () => {
  it("defines every semantic color as a static Tailwind theme token", () => {
    expect(themeCss).toContain("@theme static");

    for (const [name, value] of Object.entries(tokens)) {
      expect(themeCss.toLowerCase()).toContain(`--color-${name}: ${value}`);
      expect(inputCss).toContain(name);
    }
  });

  it("keeps semantic presentation colors out of component implementations", () => {
    const hardcodedToken = new RegExp(Object.values(tokens).join("|"), "i");

    for (const [path, source] of Object.entries(presentationSources)) {
      expect(source, path).not.toMatch(hardcodedToken);
    }
    expect(interactiveCss).not.toMatch(hardcodedToken);
  });
});
