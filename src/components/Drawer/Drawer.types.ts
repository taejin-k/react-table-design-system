import type { CSSProperties, MouseEvent, ReactNode } from "react";

export type DrawerPlacementType = "top" | "right" | "bottom" | "left";
export type DrawerSizeType = "default" | "large" | number | string;
export type DrawerSemanticNameType =
  "root" | "mask" | "wrapper" | "panel" | "header" | "body" | "footer";
export type DrawerMaskType = boolean | { enabled?: boolean; blur?: boolean; closable?: boolean };
export type DrawerClosableType =
  boolean | { closeIcon?: ReactNode; disabled?: boolean; placement?: "start" | "end" };

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
  closable?: DrawerClosableType;
  extra?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  keyboard?: boolean;
  mask?: DrawerMaskType;
  scrollLock?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  push?: boolean | { distance?: number | string };
  resizable?: boolean | DrawerResizableConfig;
  focusable?: { trap?: boolean; focusTriggerAfterClose?: boolean };
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<DrawerSemanticNameType, string>>;
  styles?: Partial<Record<DrawerSemanticNameType, CSSProperties>>;
  drawerRender?: (node: ReactNode) => ReactNode;
  afterOpenChange?: (open: boolean) => void;
  onClose?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement> | KeyboardEvent) => void;
}
