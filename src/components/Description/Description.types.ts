import type { CSSProperties, ReactNode } from "react";

export type DescriptionSize = "large" | "medium" | "small";
export type DescriptionLayout = "horizontal" | "vertical";
export type DescriptionSpan =
  number | "filled" | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number>>;

export interface DescriptionItem {
  key?: React.Key;
  label?: ReactNode;
  children?: ReactNode;
  span?: DescriptionSpan;
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
  layout?: DescriptionLayout;
  size?: DescriptionSize;
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
