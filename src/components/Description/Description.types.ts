import type { ReactNode } from "react";

export type DescriptionSizeType = "lg" | "md" | "sm";
export type DescriptionLayoutType = "horizontal" | "vertical";
export type DescriptionBreakpointType = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type DescriptionResponsiveType = Partial<Record<DescriptionBreakpointType, number>>;
export type DescriptionColumnType = number | DescriptionResponsiveType;
export type DescriptionSpanType = number | "filled" | DescriptionResponsiveType;

export interface DescriptionItemType {
  key?: React.Key;
  label?: ReactNode;
  children?: ReactNode;
  span?: DescriptionSpanType;
}

export interface DescriptionProps {
  items?: DescriptionItemType[];
  children?: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  bordered?: boolean;
  colon?: boolean;
  column?: DescriptionColumnType;
  layout?: DescriptionLayoutType;
  size?: DescriptionSizeType;
  className?: string;
}

export interface DescriptionItemProps extends Omit<DescriptionItemType, "children"> {
  children?: ReactNode;
}
export interface DescriptionComponent {
  (props: DescriptionProps): ReactNode;
  Item: (props: DescriptionItemProps) => ReactNode;
}
