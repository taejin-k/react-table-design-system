import type { HTMLAttributes, ReactNode } from "react";

export type ChipColor = "green" | "navy" | "red" | "grey" | "black" | "purple" | "blue";
export type ChipVariant = "filled" | "soft-filled" | "outlined";

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color" | "prefix"> {
  color?: ChipColor;
  variant?: ChipVariant;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}
