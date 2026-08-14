import type { HTMLAttributes, ReactNode } from "react";
import type { TooltipProps } from "../Tooltip";

export type SegmentedValue = string | number;
export type SegmentedSize = "large" | "medium" | "small";
export type SegmentedOrientation = "horizontal" | "vertical";

export interface SegmentedItemType {
  value: SegmentedValue;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  tooltip?: string | Omit<TooltipProps, "children">;
}

export type SegmentedOption = SegmentedValue | SegmentedItemType;

export interface SegmentedProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  options: SegmentedOption[];
  value?: SegmentedValue;
  defaultValue?: SegmentedValue;
  onChange?: (value: SegmentedValue) => void;
  block?: boolean;
  disabled?: boolean;
  orientation?: SegmentedOrientation;
  vertical?: boolean;
  size?: SegmentedSize;
  shape?: "default" | "round";
  name?: string;
  classNames?: Partial<Record<"root" | "item" | "label", string>>;
  styles?: Partial<Record<"root" | "item" | "label", React.CSSProperties>>;
}
