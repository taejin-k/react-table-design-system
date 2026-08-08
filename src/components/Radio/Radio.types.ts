import type { InputHTMLAttributes, ReactNode } from "react";

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "size" | "type"
> {
  label?: ReactNode;
  error?: boolean;
  className?: string;
}
