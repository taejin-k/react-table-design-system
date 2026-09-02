import type { Key, ReactNode } from "react";

export type CollapseSizeType = "sm" | "md" | "lg";
export type CollapseCollapsibleType = "header" | "icon" | "disabled";
export type CollapseExpandIconPlacementType = "start" | "end";

export interface CollapseItem {
  key: Key;
  label?: ReactNode;
  children?: ReactNode;
  extra?: ReactNode;
  collapsible?: CollapseCollapsibleType;
  showArrow?: boolean;
}

export interface CollapseProps {
  items?: CollapseItem[];
  accordion?: boolean;
  activeKey?: Key[];
  defaultActiveKey?: Key[];
  bordered?: boolean;
  expandIconPlacement?: CollapseExpandIconPlacementType;
  ghost?: boolean;
  size?: CollapseSizeType;
  className?: string;
  onChange?: (keys: Key[]) => void;
}
