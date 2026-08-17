import type { ReactNode, TextareaHTMLAttributes } from "react";
import type { InputSize } from "../Input";
import type { AllowedCharacterType } from "../_internal/filterAllowedCharacters";

export type TextAreaVariant = "default" | "filled";

export interface TextAreaAutoSize {
  minRows?: number;
  maxRows?: number;
}

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "onChange" | "onError" | "size" | "value" | "width"
> {
  value?: string;
  width?: number;
  size?: InputSize;
  variant?: TextAreaVariant;
  label?: ReactNode;
  errorMessage?: ReactNode;
  autoSize?: boolean | TextAreaAutoSize;
  allowOnly?: AllowedCharacterType;
  resize?: boolean;
  showCount?: boolean;
  className?: string;
  validate?: (value: string) => string | Promise<string>;
  onChange?: (value: string) => void;
  onEnter?: () => void;
}
