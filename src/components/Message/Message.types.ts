import type { CSSProperties, ReactNode } from "react";

export type MessageTypeName = "success" | "error" | "info" | "warning" | "loading";
export type MessageKey = string | number;
export type MessageSemanticName = "root" | "content" | "icon";

export interface MessageArgsProps {
  content: ReactNode;
  type?: MessageTypeName;
  duration?: number;
  icon?: ReactNode;
  key?: MessageKey;
  pauseOnHover?: boolean;
  className?: string;
  classNames?: Partial<Record<MessageSemanticName, string>>;
  style?: CSSProperties;
  styles?: Partial<Record<MessageSemanticName, CSSProperties>>;
  onClick?: () => void;
  onClose?: () => void;
}

export interface MessageGlobalConfig {
  duration?: number;
  getContainer?: () => HTMLElement;
  maxCount?: number;
  prefixCls?: string;
  rtl?: boolean;
  stack?: boolean | { threshold?: number };
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
  destroy: (key?: MessageKey) => void;
}

export interface MessageApi extends MessageInstance {
  config: (config: MessageGlobalConfig) => void;
  useMessage: (config?: MessageGlobalConfig) => [MessageInstance, ReactNode];
}
