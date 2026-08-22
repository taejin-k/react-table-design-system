import type { LabelHTMLAttributes, ReactNode } from "react";

export type LabelSizeType = "lg" | "md" | "sm";

export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "children"> {
  label: ReactNode;
  size?: LabelSizeType;
  required?: boolean;
}
