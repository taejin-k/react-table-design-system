import type { HTMLAttributes, ReactNode } from "react";

export type TagColor = "black" | "green" | "navy" | "red" | "grey" | "purple" | "blue";
export type TagVariant = "filled" | "outlined" | "solid" | "soft-outlined";

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color" | "prefix"> {
  color?: TagColor;
  variant?: TagVariant;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}
