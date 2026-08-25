import type { CSSProperties, ReactNode } from "react";

export type DescriptionSizeType = "large" | "medium" | "small";
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
  className?: string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  styles?: Partial<Record<"label" | "content", CSSProperties>>;
  classNames?: Partial<Record<"label" | "content", string>>;
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
  style?: CSSProperties;
}

export interface DescriptionItemProps extends Omit<DescriptionItemType, "children"> {
  children?: ReactNode;
}
export interface DescriptionComponent {
  (props: DescriptionProps): ReactNode;
  Item: (props: DescriptionItemProps) => ReactNode;
}
