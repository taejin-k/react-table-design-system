import type { CSSProperties, ReactNode } from "react";

export type CollapseKey = string | number;
export type CollapseSize = "large" | "medium" | "small";
export type CollapseCollapsible = "header" | "icon" | "disabled";

export interface CollapseItem {
  key: CollapseKey;
  label?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  collapsible?: CollapseCollapsible;
  forceRender?: boolean;
  showArrow?: boolean;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<"header" | "body", string>>;
  styles?: Partial<Record<"header" | "body", CSSProperties>>;
}

export interface CollapseProps {
  items?: CollapseItem[];
  accordion?: boolean;
  activeKey?: CollapseKey | CollapseKey[];
  defaultActiveKey?: CollapseKey | CollapseKey[];
  bordered?: boolean;
  collapsible?: CollapseCollapsible;
  destroyOnHidden?: boolean;
  expandIcon?: (props: { isActive: boolean; item: CollapseItem }) => ReactNode;
  expandIconPlacement?: "start" | "end";
  ghost?: boolean;
  size?: CollapseSize;
  className?: string;
  style?: CSSProperties;
  onChange?: (key: CollapseKey | CollapseKey[]) => void;
}
