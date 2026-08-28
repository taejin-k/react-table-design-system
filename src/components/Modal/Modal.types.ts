import type { CSSProperties, MouseEvent, ReactNode } from "react";

export interface ModalMaskConfig {
  enabled?: boolean;
  blur?: boolean;
  closable?: boolean;
}
export interface ModalFocusableConfig {
  trap?: boolean;
  focusTriggerAfterClose?: boolean;
}
export interface ModalBreakpointMap {
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
  xxl?: number | string;
}
export type ModalStatusType = "info" | "success" | "error" | "warning" | "confirm";

export interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: (originNode: ReactNode) => ReactNode;
  closable?: boolean;
  centered?: boolean;
  width?: number | string | ModalBreakpointMap;
  confirmLoading?: boolean;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  keyboard?: boolean;
  mask?: boolean | ModalMaskConfig;
  scrollLock?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  focusable?: ModalFocusableConfig;
  zIndex?: number;
  style?: CSSProperties;
  className?: string;
  onAfterClose?: () => void;
  onAfterOpen?: () => void;
  onConfirm?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onCancel?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
}

export interface ModalFuncConfig extends Omit<
  ModalProps,
  "open" | "children" | "onConfirm" | "onCancel"
> {
  content?: ReactNode;
  icon?: ReactNode;
  type?: ModalStatusType;
  onConfirm?: (close: () => void) => void | Promise<void>;
  onCancel?: (close: () => void) => void | Promise<void>;
}

export interface ModalFuncResult extends PromiseLike<boolean> {
  destroy: () => void;
  update: (config: ModalFuncConfig | ((previous: ModalFuncConfig) => ModalFuncConfig)) => void;
}

export interface ModalStaticFunctions {
  info: (config: ModalFuncConfig) => ModalFuncResult;
  success: (config: ModalFuncConfig) => ModalFuncResult;
  error: (config: ModalFuncConfig) => ModalFuncResult;
  warning: (config: ModalFuncConfig) => ModalFuncResult;
  confirm: (config: ModalFuncConfig) => ModalFuncResult;
  destroyAll: () => void;
}

export interface ModalComponent extends ModalStaticFunctions {
  (props: ModalProps): ReactNode;
}
