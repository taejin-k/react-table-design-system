import type { CSSProperties, ReactNode } from "react";

export type NotificationType = "success" | "error" | "info" | "warning";
export type NotificationPlacement =
  "top" | "topLeft" | "topRight" | "bottom" | "bottomLeft" | "bottomRight";
export type NotificationSemanticName =
  "root" | "icon" | "title" | "description" | "actions" | "close" | "progress";

export interface NotificationArgsProps {
  title?: ReactNode;
  message?: ReactNode;
  description: ReactNode;
  type?: NotificationType;
  actions?: ReactNode;
  closable?: boolean | { closeIcon?: ReactNode; disabled?: boolean };
  closeIcon?: ReactNode;
  duration?: number | false;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  icon?: ReactNode;
  key?: string;
  placement?: NotificationPlacement;
  role?: "alert" | "status";
  className?: string;
  classNames?: Partial<Record<NotificationSemanticName, string>>;
  style?: CSSProperties;
  styles?: Partial<Record<NotificationSemanticName, CSSProperties>>;
  props?: Record<string, unknown>;
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
  placement?: NotificationPlacement;
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
  useNotification: (config?: NotificationGlobalConfig) => [NotificationInstance, ReactNode];
}
