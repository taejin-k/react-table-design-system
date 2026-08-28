import type { CSSProperties, MouseEvent, ReactNode } from "react";

export type DrawerPlacementType = "top" | "right" | "bottom" | "left";
export type DrawerSizeType = "default" | "large" | number | string;

export interface DrawerMaskConfig {
  enabled?: boolean;
  blur?: boolean;
  closable?: boolean;
}

export interface DrawerPushConfig {
  distance?: number | string;
}

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
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  extra?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  keyboard?: boolean;
  mask?: boolean | DrawerMaskConfig;
  scrollLock?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  push?: boolean | DrawerPushConfig;
  resizable?: boolean | DrawerResizableConfig;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  onAfterClose?: () => void;
  onAfterOpen?: () => void;
  onClose?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement> | KeyboardEvent) => void;
}
