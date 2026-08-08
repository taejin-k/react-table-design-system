import type { InputHTMLAttributes, ReactNode } from "react";

export type InputSize = "lg" | "md" | "sm";
export type InputVariant = "default" | "filled";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onBlur" | "onChange" | "onError" | "prefix" | "size" | "value"
> {
  value?: string;
  size?: InputSize;
  variant?: InputVariant;
  label?: ReactNode;
  errorText?: ReactNode;
  required?: boolean;
  allowClear?: boolean;
  showCount?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  className?: string;
  onBlur?: (value: string) => void;
  onChange?: (value: string) => void;
  onError?: (error: string) => void;
}
