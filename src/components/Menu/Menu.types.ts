import type { CSSProperties, Key, MouseEvent, ReactNode } from "react";

export type MenuModeType = "vertical" | "horizontal" | "inline";
export type MenuThemeType = "light" | "dark";
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
  danger?: boolean;
  children?: MenuItemType[];
  type?: MenuItemKindType;
  dashed?: boolean;
  popupClassName?: string;
  popupOffset?: [number, number];
  onClick?: (info: MenuClickInfo) => void;
  onTitleClick?: (info: { key: string; domEvent: MouseEvent<HTMLElement> }) => void;
}

export interface MenuProps {
  items?: MenuItemType[];
  mode?: MenuModeType;
  theme?: MenuThemeType;
  selectable?: boolean;
  multiple?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  inlineCollapsed?: boolean;
  inlineIndent?: number;
  forceSubMenuRender?: boolean;
  triggerSubMenuAction?: MenuTriggerType;
  subMenuOpenDelay?: number;
  subMenuCloseDelay?: number;
  expandIcon?: ReactNode | ((props: { isOpen: boolean; item: MenuItemType }) => ReactNode);
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<"root" | "item" | "itemIcon" | "itemContent" | "popup", string>>;
  styles?: Partial<Record<"root" | "item" | "itemIcon" | "itemContent" | "popup", CSSProperties>>;
  onClick?: (info: MenuClickInfo) => void;
  onSelect?: (info: MenuSelectInfo) => void;
  onDeselect?: (info: MenuSelectInfo) => void;
  onOpenChange?: (openKeys: string[]) => void;
}
