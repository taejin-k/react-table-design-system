import type { HTMLAttributes, Key, ReactNode } from "react";

export type SegmentedSizeType = "lg" | "md" | "sm";

export interface SegmentedItem {
  value: Key;
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
  value?: Key;
  defaultValue?: Key;
  onChange?: (value: Key) => void;
  fullWidth?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  size?: SegmentedSizeType;
}
