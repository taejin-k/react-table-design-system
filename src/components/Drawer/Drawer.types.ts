import type { CSSProperties, MouseEvent, ReactNode } from "react";

export type DrawerPlacement = "top" | "right" | "bottom" | "left";
export type DrawerSize = "default" | "large" | number | string;
export type DrawerSemanticName = "root" | "mask" | "wrapper" | "header" | "body" | "footer";
export type DrawerMask = boolean | { enabled?: boolean; blur?: boolean; closable?: boolean };
export type DrawerClosable =
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
  placement?: DrawerPlacement;
  size?: DrawerSize;
  width?: number | string;
  height?: number | string;
  closable?: DrawerClosable;
  closeIcon?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  keyboard?: boolean;
  mask?: DrawerMask;
  maskClosable?: boolean;
  scrollLock?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  destroyOnClose?: boolean;
  push?: boolean | { distance?: number | string };
  resizable?: boolean | DrawerResizableConfig;
  maxSize?: number;
  focusable?: { trap?: boolean; focusTriggerAfterClose?: boolean };
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  zIndex?: number;
  className?: string;
  rootClassName?: string;
  style?: CSSProperties;
  rootStyle?: CSSProperties;
  classNames?: Partial<Record<DrawerSemanticName, string>>;
  styles?: Partial<Record<DrawerSemanticName, CSSProperties>>;
  drawerRender?: (node: ReactNode) => ReactNode;
  afterOpenChange?: (open: boolean) => void;
  onClose?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement> | KeyboardEvent) => void;
}
