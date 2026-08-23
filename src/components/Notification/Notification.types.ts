import type { CSSProperties, ReactNode } from "react";

export type NotificationStatusType = "success" | "error" | "info" | "warning";
export type NotificationPlacementType =
  "top" | "topLeft" | "topRight" | "bottom" | "bottomLeft" | "bottomRight";
export type NotificationSemanticNameType =
  "root" | "icon" | "title" | "description" | "actions" | "close" | "progress";

export interface NotificationArgsProps {
  title?: ReactNode;
  description: ReactNode;
  type?: NotificationStatusType;
  actions?: ReactNode;
  closable?: boolean | { closeIcon?: ReactNode; disabled?: boolean };
  duration?: number | false;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  icon?: ReactNode;
  key?: string;
  placement?: NotificationPlacementType;
  className?: string;
  classNames?: Partial<Record<NotificationSemanticNameType, string>>;
  style?: CSSProperties;
  styles?: Partial<Record<NotificationSemanticNameType, CSSProperties>>;
  onClick?: () => void;
  onClose?: () => void;
}

export interface NotificationGlobalConfig {
  bottom?: number;
  closeIcon?: ReactNode;
  duration?: number | false;
  getContainer?: () => HTMLElement;
  maxCount?: number;
  pauseOnHover?: boolean;
  placement?: NotificationPlacementType;
  rtl?: boolean;
  showProgress?: boolean;
  stack?: boolean | { threshold?: number };
  top?: number;
}

export interface NotificationInstance {
  open: (config: NotificationArgsProps) => void;
  success: (config: NotificationArgsProps) => void;
  error: (config: NotificationArgsProps) => void;
  info: (config: NotificationArgsProps) => void;
  warning: (config: NotificationArgsProps) => void;
  destroy: (key?: string) => void;
}

export interface NotificationApi extends NotificationInstance {
  config: (config: NotificationGlobalConfig) => void;
}
