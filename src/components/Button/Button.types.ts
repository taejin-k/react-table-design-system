import type { ButtonHTMLAttributes, ReactElement } from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "dark" | "ghost";

export type ButtonSize = "lg" | "md" | "sm";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "prefix"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  shadow?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  /** 버튼 이름 앞에 표시할 단일 아이콘이다. */
  prefixIcon?: ReactElement | null;
  /** 버튼 이름 뒤에 표시할 단일 아이콘이다. */
  suffixIcon?: ReactElement | null;
}
