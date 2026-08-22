import type { InputHTMLAttributes, ReactNode } from "react";
import type { AllowedCharacterType } from "../_internal/filterAllowedCharacters";

export type { AllowedCharacterType } from "../_internal/filterAllowedCharacters";

export type InputSizeType = "lg" | "md" | "sm";
export type InputVariantType = "default" | "filled" | "borderless" | "underlined";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onChange" | "onError" | "prefix" | "size" | "value" | "width"
> {
  value?: string;
  width?: number;
  size?: InputSizeType;
  variant?: InputVariantType;
  label?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  password?: boolean;
  allowOnly?: AllowedCharacterType;
  allowClear?: boolean;
  showCount?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  className?: string;
  validate?: (value: string) => string | Promise<string>;
  onChange?: (value: string) => void;
  onEnter?: () => void;
}
