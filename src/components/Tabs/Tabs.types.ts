import type { MouseEvent, ReactElement, ReactNode } from "react";

export type TabsPlacementType = "top" | "end" | "bottom" | "start";
export type TabsSizeType = "lg" | "md" | "sm";
export type TabsType = "line" | "card";

export interface TabItemType {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

export interface TabsProps {
  items?: TabItemType[];
  activeKey?: string;
  defaultActiveKey?: string;
  type?: TabsType;
  size?: TabsSizeType;
  tabPlacement?: TabsPlacementType;
  animated?: boolean;
  centered?: boolean;
  className?: string;
  onChange?: (activeKey: string) => void;
  onAdd?: (items: TabItemType[]) => void;
  onDelete?: (items: TabItemType[]) => void;
  onTabClick?: (key: string, event: MouseEvent<HTMLElement>) => void;
  renderTabBar?: (props: TabsProps, DefaultTabBar: () => ReactElement) => ReactElement;
}
