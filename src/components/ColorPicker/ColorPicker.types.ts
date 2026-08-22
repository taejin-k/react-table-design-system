import type { CSSProperties, ReactNode } from "react";
import type { FloatingPlacement } from "../_internal/floating-position";

export type ColorFormat = "hex" | "rgb" | "hsb";
export type ColorValue = string | Color | { color: string; percent: number }[];
export type ColorPickerMode = "single" | "gradient";

export interface HsbColor {
  h: number;
  s: number;
  b: number;
  a: number;
}
export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Color {
  toCssString(): string;
  toHex(): string;
  toHexString(): string;
  toHsb(): HsbColor;
  toHsbString(): string;
  toRgb(): RgbColor;
  toRgbString(): string;
}

export interface ColorPreset {
  label: ReactNode;
  colors: ColorValue[];
  defaultOpen?: boolean;
  key?: React.Key;
}

export interface ColorPickerProps {
  value?: ColorValue;
  defaultValue?: ColorValue;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  mode?: ColorPickerMode | ColorPickerMode[];
  defaultMode?: ColorPickerMode;
  size?: "large" | "medium" | "small";
  disabled?: boolean;
  disabledAlpha?: boolean;
  allowClear?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  trigger?: "click" | "hover";
  placement?: FloatingPlacement;
  showText?: boolean | ((color: Color) => ReactNode);
  presets?: ColorPreset[];
  children?: ReactNode;
  panelRender?: (
    panel: ReactNode,
    extra: { components: { Picker: ReactNode; Presets: ReactNode } },
  ) => ReactNode;
  className?: string;
  style?: CSSProperties;
  onChange?: (value: Color, css: string) => void;
  onChangeComplete?: (value: Color) => void;
  onFormatChange?: (format: ColorFormat) => void;
  onOpenChange?: (open: boolean) => void;
  onClear?: () => void;
}
