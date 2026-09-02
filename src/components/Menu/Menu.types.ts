import type { Key, MouseEvent, ReactNode } from "react";

export type MenuModeType = "vertical" | "inline";
export type MenuTriggerType = "hover" | "click";
export type MenuItemKindType = "item" | "group" | "divider";

export interface MenuClickInfo {
  key: Key;
  event: MouseEvent<HTMLElement>;
}

export interface MenuSelectInfo extends MenuClickInfo {
  selectedKeys: Key[];
}

export interface MenuItemType {
  key: Key;
  label?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  title?: string;
  disabled?: boolean;
  children?: MenuItemType[];
  type?: MenuItemKindType;
  popupClassName?: string;
  popupOffset?: [number, number];
  onClick?: (info: MenuClickInfo) => void;
  onTitleClick?: (info: { key: Key; event: MouseEvent<HTMLElement> }) => void;
}

export interface MenuProps {
  items?: MenuItemType[];
  mode?: MenuModeType;
  selectable?: boolean;
  multiple?: boolean;
  selectedKeys?: Key[];
  defaultSelectedKeys?: Key[];
  openKeys?: Key[];
  defaultOpenKeys?: Key[];
  inlineCollapsed?: boolean;
  triggerSubMenuAction?: MenuTriggerType;
  className?: string;
  onClick?: (info: MenuClickInfo) => void;
  onSelect?: (info: MenuSelectInfo) => void;
  onDeselect?: (info: MenuSelectInfo) => void;
  onOpenChange?: (openKeys: Key[]) => void;
}
