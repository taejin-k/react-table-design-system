import type { ButtonHTMLAttributes, ReactElement } from "react";

export type ButtonVariantType = "primary" | "secondary" | "tertiary" | "dark" | "ghost";

export type ButtonSizeType = "lg" | "md" | "sm";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "prefix"> {
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  iconOnly?: boolean;
  shadow?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  loading?: boolean;
  /** 버튼 이름 앞에 표시할 단일 아이콘이다. */
  prefixIcon?: ReactElement | null;
  /** 버튼 이름 뒤에 표시할 단일 아이콘이다. */
  suffixIcon?: ReactElement | null;
}
