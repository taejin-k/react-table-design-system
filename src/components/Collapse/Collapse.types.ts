import type { CSSProperties, ReactNode } from "react";

export type CollapseKeyType = string | number;
export type CollapseSizeType = "large" | "medium" | "small";
export type CollapseCollapsibleType = "header" | "icon" | "disabled";
export type CollapseExpandIconPlacementType = "start" | "end";

export interface CollapseItem {
  key: CollapseKeyType;
  label?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  collapsible?: CollapseCollapsibleType;
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
  activeKey?: CollapseKeyType | CollapseKeyType[];
  defaultActiveKey?: CollapseKeyType | CollapseKeyType[];
  bordered?: boolean;
  collapsible?: CollapseCollapsibleType;
  destroyOnHidden?: boolean;
  expandIcon?: (props: { isActive: boolean; item: CollapseItem }) => ReactNode;
  expandIconPlacement?: CollapseExpandIconPlacementType;
  ghost?: boolean;
  size?: CollapseSizeType;
  className?: string;
  style?: CSSProperties;
  onChange?: (key: CollapseKeyType | CollapseKeyType[]) => void;
}
