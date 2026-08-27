import type { HTMLAttributes, ReactNode } from "react";

export type SegmentedSizeType = "lg" | "md" | "sm";

export interface SegmentedItem {
  value: string | number;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  tooltip?: string;
}

export interface SegmentedProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  options: SegmentedItem[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  fullWidth?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  size?: SegmentedSizeType;
}
