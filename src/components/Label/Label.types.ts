import type { LabelHTMLAttributes, ReactNode } from "react";

export type LabelSize = "lg" | "md" | "sm";

export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "children"> {
  label: ReactNode;
  size?: LabelSize;
  required?: boolean;
}
