import type { Key, ReactNode } from "react";

export type NotificationStatusType = "success" | "error" | "info" | "warning" | "loading";
export type NotificationPlacementType =
  "top" | "topLeft" | "topRight" | "bottom" | "bottomLeft" | "bottomRight";

export interface NotificationArgsProps {
  title?: ReactNode;
  description: ReactNode;
  type?: NotificationStatusType;
  actions?: ReactNode;
  closable?: boolean;
  duration?: number;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  icon?: ReactNode;
  key?: Key;
  placement?: NotificationPlacementType;
  onClick?: () => void;
  onClose?: () => void;
}

export interface NotificationInstance {
  open: (config: NotificationArgsProps) => void;
  success: (config: NotificationArgsProps) => void;
  error: (config: NotificationArgsProps) => void;
  info: (config: NotificationArgsProps) => void;
  warning: (config: NotificationArgsProps) => void;
  loading: (config: NotificationArgsProps) => void;
  destroy: (key?: Key) => void;
}

export type NotificationApi = NotificationInstance;
