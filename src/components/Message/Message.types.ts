import type { CSSProperties, ReactNode } from "react";

export type MessageStatusType = "success" | "error" | "info" | "warning" | "loading";
export type MessageKeyType = string | number;

export interface MessageArgsProps {
  content: ReactNode;
  type?: MessageStatusType;
  duration?: number;
  icon?: ReactNode;
  key?: MessageKeyType;
  pauseOnHover?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  onClose?: () => void;
}

export interface MessageType extends PromiseLike<boolean> {
  (): void;
}

export interface MessageInstance {
  open: (config: MessageArgsProps) => MessageType;
  success: (config: MessageArgsProps) => MessageType;
  error: (config: MessageArgsProps) => MessageType;
  info: (config: MessageArgsProps) => MessageType;
  warning: (config: MessageArgsProps) => MessageType;
  loading: (config: MessageArgsProps) => MessageType;
  destroy: (key?: MessageKeyType) => void;
}

export type MessageApi = MessageInstance;
