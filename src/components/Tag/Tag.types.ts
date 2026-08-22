import type { HTMLAttributes, ReactNode } from "react";

export type TagColorType = "black" | "green" | "navy" | "red" | "grey" | "purple" | "blue";
export type TagVariantType = "filled" | "outlined" | "solid" | "soft-outlined";

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color" | "prefix"> {
  color?: TagColorType;
  variant?: TagVariantType;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}
