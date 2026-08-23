import type { CSSProperties, ReactNode } from "react";
import type { FloatingPlacement } from "../_internal/floating-position";

export type ColorFormatType = "hex" | "rgb" | "hsb";
export type ColorValueType = string | Color;
export type ColorGradientType = { color: string; percent: number }[];
export type ColorPickerSizeType = "large" | "medium" | "small";
export type ColorPickerTriggerType = "click" | "hover";
export type ColorPickerPlacementType = FloatingPlacement;

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
  colors: Array<ColorValueType | ColorGradientType>;
  defaultOpen?: boolean;
  key?: React.Key;
}

export interface ColorPickerProps {
  value?: ColorValueType;
  defaultValue?: ColorValueType;
  format?: ColorFormatType;
  defaultFormat?: ColorFormatType;
  size?: ColorPickerSizeType;
  disabled?: boolean;
  allowClear?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  trigger?: ColorPickerTriggerType;
  placement?: ColorPickerPlacementType;
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
  onFormatChange?: (format: ColorFormatType) => void;
  onOpenChange?: (open: boolean) => void;
  onClear?: () => void;
}
