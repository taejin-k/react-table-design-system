import type { CSSProperties, ReactNode } from "react";

export type DescriptionSizeType = "large" | "medium" | "small";
export type DescriptionLayoutType = "horizontal" | "vertical";
export type DescriptionSpanType =
  number | "filled" | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number>>;

export interface DescriptionItem {
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
  items?: DescriptionItem[];
  children?: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  bordered?: boolean;
  colon?: boolean;
  column?: number | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number>>;
  layout?: DescriptionLayoutType;
  size?: DescriptionSizeType;
  className?: string;
  style?: CSSProperties;
}

export interface DescriptionItemProps extends Omit<DescriptionItem, "children"> {
  children?: ReactNode;
}
export interface DescriptionComponent {
  (props: DescriptionProps): ReactNode;
  Item: (props: DescriptionItemProps) => ReactNode;
}
