import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { ButtonProps, ButtonVariantType } from "../Button";

export type ModalSemanticNameType =
  "root" | "mask" | "wrapper" | "panel" | "header" | "body" | "footer";
export type ModalWidthType =
  number | string | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number | string>>;
export type ModalClosableType = boolean | { closeIcon?: ReactNode; disabled?: boolean };
export type ModalMaskType = boolean | { enabled?: boolean; blur?: boolean; closable?: boolean };
export type ModalStatusType = "info" | "success" | "error" | "warning" | "confirm";

export interface ModalProps {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?:
    | ReactNode
    | ((
        originNode: ReactNode,
        extra: { OkBtn: () => ReactNode; CancelBtn: () => ReactNode },
      ) => ReactNode);
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
  focusable?: { trap?: boolean; focusTriggerAfterClose?: boolean };
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  zIndex?: number;
  style?: CSSProperties;
  className?: string;
  classNames?: Partial<Record<ModalSemanticNameType, string>>;
  styles?: Partial<Record<ModalSemanticNameType, CSSProperties>>;
  modalRender?: (node: ReactNode) => ReactNode;
  afterClose?: () => void;
  afterOpenChange?: (open: boolean) => void;
  onOk?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  onCancel?: (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
}

export interface ModalFuncConfig extends Omit<
  ModalProps,
  "open" | "children" | "onOk" | "onCancel"
> {
  content?: ReactNode;
  icon?: ReactNode;
  type?: ModalStatusType;
  onOk?: (close: () => void) => void | Promise<void>;
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
