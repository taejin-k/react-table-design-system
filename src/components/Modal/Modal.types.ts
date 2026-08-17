import type { CSSProperties, MouseEvent, ReactNode } from "react";
import type { ButtonProps, ButtonVariant } from "../Button";

export type ModalSemanticName = "root" | "mask" | "wrapper" | "header" | "body" | "footer";
export type ModalWidth =
  number | string | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number | string>>;
export type ModalClosable = boolean | { closeIcon?: ReactNode; disabled?: boolean };
export type ModalMask = boolean | { enabled?: boolean; blur?: boolean; closable?: boolean };

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
  closable?: ModalClosable;
  closeIcon?: ReactNode;
  centered?: boolean;
  width?: ModalWidth;
  loading?: boolean;
  confirmLoading?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okType?: ButtonVariant;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  keyboard?: boolean;
  mask?: ModalMask;
  maskClosable?: boolean;
  scrollLock?: boolean;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
  destroyOnClose?: boolean;
  focusable?: { trap?: boolean; focusTriggerAfterClose?: boolean };
  focusTriggerAfterClose?: boolean;
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  zIndex?: number;
  style?: CSSProperties;
  className?: string;
  rootClassName?: string;
  wrapClassName?: string;
  classNames?: Partial<Record<ModalSemanticName, string>>;
  styles?: Partial<Record<ModalSemanticName, CSSProperties>>;
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
  type?: "info" | "success" | "error" | "warning" | "confirm";
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
  useModal: () => [Omit<ModalStaticFunctions, "destroyAll">, ReactNode];
}
