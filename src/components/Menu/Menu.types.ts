import type { CSSProperties, Key, MouseEvent, ReactNode } from "react";

export type MenuMode = "vertical" | "horizontal" | "inline";
export type MenuTheme = "light" | "dark";

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
  type?: "item" | "group" | "divider";
  dashed?: boolean;
  popupClassName?: string;
  popupOffset?: [number, number];
  theme?: MenuTheme;
  onClick?: (info: MenuClickInfo) => void;
  onTitleClick?: (info: { key: string; domEvent: MouseEvent<HTMLElement> }) => void;
}

export interface MenuProps {
  items?: MenuItemType[];
  mode?: MenuMode;
  theme?: MenuTheme;
  selectable?: boolean;
  multiple?: boolean;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  inlineCollapsed?: boolean;
  inlineIndent?: number;
  forceSubMenuRender?: boolean;
  triggerSubMenuAction?: "hover" | "click";
  subMenuOpenDelay?: number;
  subMenuCloseDelay?: number;
  expandIcon?: ReactNode | ((props: { isOpen: boolean; item: MenuItemType }) => ReactNode);
  overflowedIndicator?: ReactNode;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<"root" | "item" | "itemIcon" | "itemContent" | "popup", string>>;
  styles?: Partial<Record<"root" | "item" | "itemIcon" | "itemContent" | "popup", CSSProperties>>;
  onClick?: (info: MenuClickInfo) => void;
  onSelect?: (info: MenuSelectInfo) => void;
  onDeselect?: (info: MenuSelectInfo) => void;
  onOpenChange?: (openKeys: string[]) => void;
}
