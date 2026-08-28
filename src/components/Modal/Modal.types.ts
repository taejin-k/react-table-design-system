import type { CSSProperties, MouseEvent, ReactNode } from "react";

export interface ModalBreakpointMap {
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
  xxl?: number | string;
}

export interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: (origin: ReactNode) => ReactNode;
  closable?: boolean;
  centered?: boolean;
  width?: number | string | ModalBreakpointMap;
  confirmLoading?: boolean;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  keyboard?: boolean;
  mask?: boolean;
  scrollLock?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  zIndex?: number;
  style?: CSSProperties;
  className?: string;
  onAfterClose?: () => void;
  onAfterOpen?: () => void;
  onConfirm?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onCancel?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement> | KeyboardEvent) => void;
}

export interface ModalFuncConfig extends Omit<
  ModalProps,
  "open" | "children" | "onConfirm" | "onCancel"
> {
  content?: ReactNode;
  icon?: ReactNode;
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
