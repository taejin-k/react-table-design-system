import type { Key, MouseEvent, ReactNode } from "react";

export type MenuModeType = "vertical" | "horizontal" | "inline";
export type MenuTriggerType = "hover" | "click";
export type MenuItemKindType = "item" | "group" | "divider";

export interface MenuClickInfo {
  key: string;
  keyPath: string[];
  domEvent: MouseEvent<HTMLElement>;
}

export interface MenuSelectInfo extends MenuClickInfo {
  selectedKeys: string[];
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
  onTitleClick?: (info: { key: string; domEvent: MouseEvent<HTMLElement> }) => void;
}

export interface MenuProps {
  items?: MenuItemType[];
  mode?: MenuModeType;
  selectable?: boolean;
  multiple?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  inlineCollapsed?: boolean;
  inlineIndent?: number;
  triggerSubMenuAction?: MenuTriggerType;
  className?: string;
  onClick?: (info: MenuClickInfo) => void;
  onSelect?: (info: MenuSelectInfo) => void;
  onDeselect?: (info: MenuSelectInfo) => void;
  onOpenChange?: (openKeys: string[]) => void;
}
