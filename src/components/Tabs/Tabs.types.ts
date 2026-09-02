import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from "react";

export type TabsPlacementType = "top" | "end" | "bottom" | "start";
export type TabsSizeType = "lg" | "md" | "sm";
export type TabsType = "line" | "card" | "editable-card";

export interface TabItemType {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  closeIcon?: ReactNode;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
}

export interface TabsProps {
  items?: TabItemType[];
  activeKey?: string;
  defaultActiveKey?: string;
  animated?: boolean;
  centered?: boolean;
  destroyOnHidden?: boolean;
  type?: TabsType;
  size?: TabsSizeType;
  tabPlacement?: TabsPlacementType;
  tabBarGutter?: number;
  tabBarStyle?: CSSProperties;
  hideAdd?: boolean;
  addIcon?: ReactNode;
  removeIcon?: ReactNode;
  indicator?: { size?: number | ((origin: number) => number); align?: "start" | "center" | "end" };
  className?: string;
  onChange?: (activeKey: string) => void;
  onAdd?: (items: TabItemType[]) => void;
  onDelete?: (items: TabItemType[]) => void;
  onTabClick?: (key: string, event: MouseEvent<HTMLElement>) => void;
  renderTabBar?: (props: TabsProps, DefaultTabBar: () => ReactElement) => ReactElement;
}
