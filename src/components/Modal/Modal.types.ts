import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { ButtonProps, ButtonVariantType } from "../Button";

export interface ModalBreakpointMap {
  xs?: number | string;
  sm?: number | string;
  md?: number | string;
  lg?: number | string;
  xl?: number | string;
  xxl?: number | string;
}
export type ModalWidthType = number | string | ModalBreakpointMap;
export interface ModalClosableConfig {
  closeIcon?: ReactNode;
  disabled?: boolean;
}
export type ModalClosableType = boolean | ModalClosableConfig;
export interface ModalMaskConfig {
  enabled?: boolean;
  blur?: boolean;
  closable?: boolean;
}
export type ModalMaskType = boolean | ModalMaskConfig;
export interface ModalFocusableConfig {
  trap?: boolean;
  focusTriggerAfterClose?: boolean;
}
export interface ModalFooterRenderExtra {
  OkBtn: () => ReactNode;
  CancelBtn: () => ReactNode;
}
export type ModalFooterRenderType = (
  originNode: ReactNode,
  extra: ModalFooterRenderExtra,
) => ReactNode;
export type ModalContainerType = HTMLElement | (() => HTMLElement) | string | false;
export type ModalStatusType = "info" | "success" | "error" | "warning" | "confirm";

export interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode | ModalFooterRenderType;
  closable?: ModalClosableType;
  centered?: boolean;
  width?: ModalWidthType;
  confirmLoading?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okType?: ButtonVariantType;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  keyboard?: boolean;
  mask?: ModalMaskType;
  scrollLock?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  focusable?: ModalFocusableConfig;
  getContainer?: ModalContainerType;
  zIndex?: number;
  style?: CSSProperties;
  className?: string;
  modalRender?: (node: ReactNode) => ReactNode;
  afterClose?: () => void;
  afterOpenChange?: (open: boolean) => void;
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
