import type { ReactNode, TextareaHTMLAttributes } from "react";
import type { InputSize, InputVariant } from "../Input";

export interface TextAreaAutoSize {
  minRows?: number;
  maxRows?: number;
}

export interface TextAreaCountConfig {
  max?: number;
  strategy?: (value: string) => number;
  show?: boolean | ((info: { value: string; count: number; maxLength?: number }) => ReactNode);
  exceedFormatter?: (value: string, config: { max: number }) => string;
}

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "onBlur" | "onChange" | "onError" | "size" | "value"
> {
  value?: string;
  size?: InputSize;
  variant?: InputVariant;
  label?: ReactNode;
  errorText?: ReactNode;
  autoSize?: boolean | TextAreaAutoSize;
  allowClear?: boolean;
  showCount?: boolean;
  count?: TextAreaCountConfig;
  className?: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onError?: (error: string) => void;
  onEnter?: () => void;
}
