import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonType = "primary" | "secondary" | "tertiary" | "dark" | "ghost";

export type ButtonSize = "lg" | "md" | "sm";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "prefix"> {
  type?: ButtonType;
  size?: ButtonSize;
  iconOnly?: boolean;
  shadow?: boolean;
  fullWidth?: boolean;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /** 아이콘 0~여러 개. 배열로 넘기면 각 아이콘이 버튼의 gap을 그대로 공유해 간격이 일정하다. */
  prefixIcon?: ReactNode;
  /** 아이콘 0~여러 개. 배열로 넘기면 각 아이콘이 버튼의 gap을 그대로 공유해 간격이 일정하다. */
  suffixIcon?: ReactNode;
}
