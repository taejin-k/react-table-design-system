import type { MouseEvent, ReactNode } from "react";

export type DrawerPlacementType = "top" | "right" | "bottom" | "left";
export type DrawerSizeType = "default" | "large" | number | string;

export interface DrawerResizableConfig {
  min?: number;
  max?: number;
  onResizeStart?: (size: number) => void;
  onResize?: (size: number) => void;
  onResizeEnd?: (size: number) => void;
}

export interface DrawerProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  placement?: DrawerPlacementType;
  size?: DrawerSizeType;
  closable?: boolean;
  extra?: ReactNode;
  footer?: ReactNode;
  keyboard?: boolean;
  mask?: boolean;
  scrollLock?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  push?: boolean;
  resizable?: boolean | DrawerResizableConfig;
  zIndex?: number;
  onAfterClose?: () => void;
  onAfterOpen?: () => void;
  onClose?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement> | KeyboardEvent) => void;
}
