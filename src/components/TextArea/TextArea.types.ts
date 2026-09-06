import type { ReactNode, TextareaHTMLAttributes } from "react";
import type { AllowedCharacterType } from "../_internal/filterAllowedCharacters";
import type { ValidatableErrorMessage } from "../_internal/useErrorMessageValidation";

export type TextAreaSizeType = "lg" | "md" | "sm";
export type TextAreaVariantType = "default" | "filled";
export type TextAreaErrorMessage = ValidatableErrorMessage<string>;

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
  size?: TextAreaSizeType;
  variant?: TextAreaVariantType;
  label?: ReactNode;
  errorMessage?: TextAreaErrorMessage;
  autoSize?: boolean | TextAreaAutoSize;
  allowOnly?: AllowedCharacterType;
  resize?: boolean;
  showCount?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onEnter?: () => void;
}
