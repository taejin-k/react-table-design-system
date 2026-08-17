import type { ButtonHTMLAttributes } from "react";

export type ToggleSize = "lg" | "md" | "sm";

export interface ToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-checked" | "checked" | "onChange" | "role" | "size" | "type"
> {
  checked: boolean;
  size?: ToggleSize;
  loading?: boolean;
  onChange?: (checked: boolean) => void;
}
