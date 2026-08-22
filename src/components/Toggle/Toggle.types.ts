import type { ButtonHTMLAttributes } from "react";

export type ToggleSizeType = "lg" | "md" | "sm";

export interface ToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "checked" | "onChange" | "size" | "type"
> {
  checked: boolean;
  size?: ToggleSizeType;
  loading?: boolean;
  onChange?: (checked: boolean) => void;
}
