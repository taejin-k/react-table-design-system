import type { HTMLAttributes, ReactNode } from "react";
import type { TooltipProps } from "../Tooltip";

export type SegmentedValue = string | number;
export type SegmentedSize = "lg" | "md" | "sm";

export interface SegmentedItemType {
  value: SegmentedValue;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  tooltip?: string | Omit<TooltipProps, "children">;
}

export type SegmentedOption = SegmentedItemType;

export interface SegmentedProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  options: SegmentedOption[];
  value?: SegmentedValue;
  defaultValue?: SegmentedValue;
  onChange?: (value: SegmentedValue) => void;
  fullWidth?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  size?: SegmentedSize;
  shape?: "default" | "round";
}
