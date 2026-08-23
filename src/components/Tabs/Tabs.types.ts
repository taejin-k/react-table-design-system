import type { CSSProperties, MouseEvent, ReactElement, ReactNode } from "react";

export type TabsPlacementType = "top" | "end" | "bottom" | "start";
export type TabsSizeType = "large" | "medium" | "small";
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
  animated?: boolean | { inkBar?: boolean; tabPane?: boolean };
  centered?: boolean;
  destroyOnHidden?: boolean;
  type?: TabsType;
  size?: TabsSizeType;
  tabPlacement?: TabsPlacementType;
  tabBarGutter?: number;
  tabBarExtraContent?: ReactNode | { left?: ReactNode; right?: ReactNode };
  tabBarStyle?: CSSProperties;
  hideAdd?: boolean;
  addIcon?: ReactNode;
  removeIcon?: ReactNode;
  indicator?: { size?: number | ((origin: number) => number); align?: "start" | "center" | "end" };
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<"root" | "header" | "body" | "item" | "indicator", string>>;
  styles?: Partial<Record<"root" | "header" | "body" | "item" | "indicator", CSSProperties>>;
  onChange?: (activeKey: string) => void;
  onEdit?: (targetKey: string | MouseEvent, action: "add" | "remove") => void;
  onTabClick?: (key: string, event: MouseEvent<HTMLElement>) => void;
  renderTabBar?: (props: TabsProps, DefaultTabBar: () => ReactElement) => ReactElement;
}
