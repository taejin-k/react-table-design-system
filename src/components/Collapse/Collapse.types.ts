import type { ReactNode } from "react";

export type CollapseKeyType = string | number;
export type CollapseSizeType = "sm" | "md" | "lg";
export type CollapseCollapsibleType = "header" | "icon" | "disabled";
export type CollapseExpandIconPlacementType = "start" | "end";

export interface CollapseItem {
  key: CollapseKeyType;
  label?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  collapsible?: CollapseCollapsibleType;
  showArrow?: boolean;
}

export interface CollapseProps {
  items?: CollapseItem[];
  accordion?: boolean;
  activeKey?: CollapseKeyType[];
  defaultActiveKey?: CollapseKeyType[];
  bordered?: boolean;
  expandIconPlacement?: CollapseExpandIconPlacementType;
  ghost?: boolean;
  size?: CollapseSizeType;
  className?: string;
  onChange?: (keys: CollapseKeyType[]) => void;
}
