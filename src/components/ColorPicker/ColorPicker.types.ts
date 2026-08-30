import type { ReactNode } from "react";
import type { FloatingPlacement } from "../_internal/floating-position";

export type ColorFormatType = "hex" | "rgb" | "hsb";
export type ColorPickerSizeType = "sm" | "md" | "lg";
export type ColorPickerTriggerType = "click" | "hover";
export type ColorPickerPlacementType = FloatingPlacement;

export interface ColorPresetType {
  label: ReactNode;
  colors: string[];
}

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  format?: ColorFormatType;
  defaultFormat?: ColorFormatType;
  size?: ColorPickerSizeType;
  disabled?: boolean;
  readOnly?: boolean;
  allowClear?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  trigger?: ColorPickerTriggerType;
  placement?: ColorPickerPlacementType;
  showLabel?: boolean;
  presets?: ColorPresetType[];
  className?: string;
  onChange?: (color: string) => void;
  onChangeComplete?: (color: string) => void;
  onFormatChange?: (format: ColorFormatType) => void;
  onOpenChange?: (open: boolean) => void;
  onClear?: () => void;
}
