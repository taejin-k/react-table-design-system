import type { Key, ReactNode } from "react";

export type MessageStatusType = "success" | "error" | "info" | "warning" | "loading";

export interface MessageConfig {
  content: ReactNode;
  type?: MessageStatusType;
  duration?: number;
  icon?: ReactNode;
  key?: Key;
  pauseOnHover?: boolean;
  onClick?: () => void;
  onClose?: () => void;
}

export interface MessageType extends PromiseLike<boolean> {
  (): void;
}

export interface MessageInstance {
  open: (config: MessageConfig) => MessageType;
  success: (config: MessageConfig) => MessageType;
  error: (config: MessageConfig) => MessageType;
  info: (config: MessageConfig) => MessageType;
  warning: (config: MessageConfig) => MessageType;
  loading: (config: MessageConfig) => MessageType;
  destroy: (key?: Key) => void;
}

export type MessageApi = MessageInstance;
