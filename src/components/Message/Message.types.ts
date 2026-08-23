import type { CSSProperties, ReactNode } from "react";

export type MessageStatusType = "success" | "error" | "info" | "warning" | "loading";
export type MessageKeyType = string | number;
export type MessageSemanticNameType = "root" | "content" | "icon";

export interface MessageArgsProps {
  content: ReactNode;
  type?: MessageStatusType;
  duration?: number;
  icon?: ReactNode;
  key?: MessageKeyType;
  pauseOnHover?: boolean;
  className?: string;
  classNames?: Partial<Record<MessageSemanticNameType, string>>;
  style?: CSSProperties;
  styles?: Partial<Record<MessageSemanticNameType, CSSProperties>>;
  onClick?: () => void;
  onClose?: () => void;
}

export interface MessageGlobalConfig {
  duration?: number;
  getContainer?: () => HTMLElement;
  maxCount?: number;
  rtl?: boolean;
  top?: number;
}

export interface MessageType extends PromiseLike<boolean> {
  (): void;
}

export interface MessageInstance {
  open: (config: MessageArgsProps) => MessageType;
  success: (
    content: ReactNode | MessageArgsProps,
    duration?: number,
    onClose?: () => void,
  ) => MessageType;
  error: (
    content: ReactNode | MessageArgsProps,
    duration?: number,
    onClose?: () => void,
  ) => MessageType;
  info: (
    content: ReactNode | MessageArgsProps,
    duration?: number,
    onClose?: () => void,
  ) => MessageType;
  warning: (
    content: ReactNode | MessageArgsProps,
    duration?: number,
    onClose?: () => void,
  ) => MessageType;
  loading: (
    content: ReactNode | MessageArgsProps,
    duration?: number,
    onClose?: () => void,
  ) => MessageType;
  destroy: (key?: MessageKeyType) => void;
}

export interface MessageApi extends MessageInstance {
  config: (config: MessageGlobalConfig) => void;
}
