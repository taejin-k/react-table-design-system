import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Icon } from "../Icon";
import {
  MOTION_DURATION_MID,
  MOTION_EASE_IN_OUT_CIRC,
  MOTION_EASE_OUT_CIRC,
} from "../_internal/motion";
import { lockBodyScroll } from "../_internal/body-scroll-lock";
import type {
  ModalComponent,
  ModalFuncConfig,
  ModalFuncResult,
  ModalProps,
  ModalStaticFunctions,
  ModalWidth,
} from "./Modal.types";

const breakpointWidth = { xs: 480, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600 };

function resolveWidth(width: ModalWidth | undefined) {
  if (!width || typeof width !== "object") return width ?? 520;
  if (typeof window === "undefined") return width.xs ?? 520;
  return Object.entries(breakpointWidth).reduce<number | string>((current, [key, minWidth]) => {
    const next = width[key as keyof typeof width];
    return window.innerWidth >= minWidth && next !== undefined ? next : current;
  }, width.xs ?? 520);
}

function resolveContainer(getContainer: ModalProps["getContainer"]) {
  if (getContainer === false || typeof document === "undefined") return null;
  if (typeof getContainer === "string") return document.querySelector<HTMLElement>(getContainer);
  if (typeof getContainer === "function") return getContainer();
  return getContainer ?? document.body;
}

function ModalBase({
  open = false,
  title,
  children,
  footer,
  closable = true,
  closeIcon,
  centered = false,
  width = 520,
  loading = false,
  confirmLoading = false,
  okText = "확인",
  cancelText = "취소",
  okType = "primary",
  okButtonProps,
  cancelButtonProps,
  keyboard = true,
  mask = true,
  maskClosable,
  scrollLock = true,
  forceRender = false,
  destroyOnHidden = false,
  destroyOnClose = false,
  focusable,
  focusTriggerAfterClose,
  getContainer,
  zIndex = 1000,
  style,
  className,
  rootClassName,
  wrapClassName,
  classNames,
  styles,
  modalRender,
  afterClose,
  afterOpenChange,
  onOk,
  onCancel,
}: ModalProps) {
  const [rendered, setRendered] = useState(open || forceRender);
  const [closing, setClosing] = useState(false);
  const [motionVisible, setMotionVisible] = useState(false);
  const motionFrameRef = useRef<number | undefined>(undefined);
  const didMountRef = useRef(false);
  const renderedRef = useRef(open || forceRender);
  const lifecycleRef = useRef({
    afterClose,
    afterOpenChange,
    focusTriggerAfterClose,
    focusable,
    forceRender,
    shouldDestroy: destroyOnHidden || destroyOnClose,
  });
  lifecycleRef.current = {
    afterClose,
    afterOpenChange,
    focusTriggerAfterClose,
    focusable,
    forceRender,
    shouldDestroy: destroyOnHidden || destroyOnClose,
  };
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const resolvedCloseIcon =
    typeof closable === "object" ? (closable.closeIcon ?? closeIcon) : closeIcon;
  const closeDisabled = typeof closable === "object" && closable.disabled;
  const showClose = closable !== false;
  const maskEnabled = typeof mask === "object" ? mask.enabled !== false : mask;
  const canCloseMask = maskClosable ?? (typeof mask === "object" ? mask.closable !== false : true);
  const blurMask = typeof mask === "object" && mask.blur;
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      if (!open) return;
    }
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
      renderedRef.current = true;
      setRendered(true);
      setClosing(false);
      window.cancelAnimationFrame(motionFrameRef.current ?? 0);
      motionFrameRef.current = window.requestAnimationFrame(() => {
        motionFrameRef.current = window.requestAnimationFrame(() => setMotionVisible(true));
      });
      const timer = window.setTimeout(
        () => lifecycleRef.current.afterOpenChange?.(true),
        MOTION_DURATION_MID,
      );
      return () => {
        window.cancelAnimationFrame(motionFrameRef.current ?? 0);
        window.clearTimeout(timer);
      };
    }
    if (!renderedRef.current) return;
    setClosing(true);
    setMotionVisible(false);
    const timer = window.setTimeout(() => {
      setClosing(false);
      if (lifecycleRef.current.shouldDestroy && !lifecycleRef.current.forceRender) {
        renderedRef.current = false;
        setRendered(false);
      }
      lifecycleRef.current.afterOpenChange?.(false);
      lifecycleRef.current.afterClose?.();
      if (
        lifecycleRef.current.focusable?.focusTriggerAfterClose ??
        lifecycleRef.current.focusTriggerAfterClose ??
        true
      )
        triggerRef.current?.focus();
    }, MOTION_DURATION_MID);
    return () => {
      window.cancelAnimationFrame(motionFrameRef.current ?? 0);
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !keyboard) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel?.(event as unknown as MouseEvent<HTMLDivElement>);
      if (event.key !== "Tab" || focusable?.trap === false || !panelRef.current) return;
      const elements = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const focusTimer = window.setTimeout(() =>
      panelRef.current?.querySelector<HTMLElement>("button:not(:disabled)")?.focus(),
    );
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [focusable?.trap, keyboard, onCancel, open]);

  useEffect(() => {
    if (!open || !scrollLock) return;
    return lockBodyScroll();
  }, [open, scrollLock]);

  if (!rendered && !open) return null;

  const close = (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => onCancel?.(event);
  const CancelBtn = () => (
    <Button variant="secondary" {...cancelButtonProps} onClick={(event) => close(event)}>
      {cancelText}
    </Button>
  );
  const OkBtn = () => (
    <Button
      variant={okType}
      {...okButtonProps}
      disabled={confirmLoading || okButtonProps?.disabled}
      onClick={onOk}
    >
      {confirmLoading ? <Icon icon="loading" /> : null}
      {okText}
    </Button>
  );
  const defaultFooter = (
    <div className="flex justify-end gap-2">
      <CancelBtn />
      <OkBtn />
    </div>
  );
  const footerNode =
    typeof footer === "function"
      ? footer(defaultFooter, { OkBtn, CancelBtn })
      : footer === undefined
        ? defaultFooter
        : footer;
  const panel = (
    <div
      ref={panelRef}
      data-modal-panel
      className={twMerge(
        "relative max-h-[calc(100vh-48px)] overflow-hidden rounded-lg bg-white font-pretendard text-sm text-[#111] shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-[opacity,transform] duration-200 motion-reduce:transition-none",
        motionVisible ? "scale-100 opacity-100" : "scale-[0.8] opacity-0",
        className,
      )}
      style={{
        width: resolveWidth(width),
        maxWidth: "calc(100vw - 32px)",
        transitionTimingFunction: motionVisible ? MOTION_EASE_OUT_CIRC : MOTION_EASE_IN_OUT_CIRC,
        ...style,
      }}
    >
      {title !== undefined ? (
        <div
          className={twMerge(
            "flex min-h-14 items-center px-6 pr-14 text-base font-semibold",
            classNames?.header,
          )}
          style={styles?.header}
        >
          {title}
        </div>
      ) : null}
      {showClose ? (
        <button
          type="button"
          disabled={closeDisabled}
          className="absolute top-4 right-4 inline-flex size-6 cursor-pointer items-center justify-center rounded text-[#666] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
          onClick={close}
        >
          {resolvedCloseIcon ?? <Icon icon="close" />}
        </button>
      ) : null}
      <div
        className={twMerge("max-h-[calc(100vh-176px)] overflow-auto px-6 py-5", classNames?.body)}
        style={styles?.body}
      >
        {loading ? (
          <div className="grid gap-3 py-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#eee]" />
            <div className="h-4 animate-pulse rounded bg-[#eee]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[#eee]" />
          </div>
        ) : (
          children
        )}
      </div>
      {footerNode !== null ? (
        <div
          className={twMerge("border-t border-[#f0f0f0] px-6 py-4", classNames?.footer)}
          style={styles?.footer}
        >
          {footerNode}
        </div>
      ) : null}
    </div>
  );
  const content = (
    <div
      data-modal-root
      className={twMerge(
        "fixed inset-0 font-pretendard",
        open || closing ? "pointer-events-auto visible" : "pointer-events-none invisible",
        rootClassName,
        classNames?.root,
      )}
      style={{ zIndex, ...styles?.root }}
    >
      {maskEnabled ? (
        <div
          data-modal-mask
          className={twMerge(
            "absolute inset-0 bg-black/45 transition-opacity duration-200 motion-reduce:transition-none",
            blurMask && "backdrop-blur-sm",
            motionVisible ? "opacity-100" : "opacity-0",
            classNames?.mask,
          )}
          style={styles?.mask}
          onClick={canCloseMask ? close : undefined}
        />
      ) : null}
      <div
        className={twMerge(
          "absolute inset-0 flex overflow-auto px-4 py-6",
          centered ? "items-center justify-center" : "items-start justify-center pt-[100px]",
          wrapClassName,
          classNames?.wrapper,
        )}
        style={styles?.wrapper}
      >
        {modalRender ? modalRender(panel) : panel}
      </div>
    </div>
  );
  const container = resolveContainer(getContainer);
  return container ? createPortal(content, container) : content;
}

type ManagedModal = { key: string; config: ModalFuncConfig; resolve: (value: boolean) => void };

function useModalHolder(): [Omit<ModalStaticFunctions, "destroyAll">, ReactNode] {
  const [items, setItems] = useState<ManagedModal[]>([]);
  const resolvers = useRef(new Map<string, (value: boolean) => void>());
  const close = useCallback((key: string, value: boolean) => {
    resolvers.current.get(key)?.(value);
    resolvers.current.delete(key);
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);
  const open = useCallback(
    (type: ModalFuncConfig["type"], initial: ModalFuncConfig) => {
      const key = `modal-${Date.now()}-${Math.random()}`;
      let resolvePromise: (value: boolean) => void = () => undefined;
      const promise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve;
      });
      resolvers.current.set(key, resolvePromise);
      setItems((current) => [
        ...current,
        { key, config: { ...initial, type }, resolve: resolvePromise },
      ]);
      const result: ModalFuncResult = {
        // oxlint-disable-next-line unicorn/no-thenable -- Ant Design-compatible awaitable modal API.
        then: promise.then.bind(promise),
        destroy: () => close(key, false),
        update: (config) =>
          setItems((current) =>
            current.map((item) =>
              item.key === key
                ? {
                    ...item,
                    config:
                      typeof config === "function"
                        ? config(item.config)
                        : { ...item.config, ...config },
                  }
                : item,
            ),
          ),
      };
      return result;
    },
    [close],
  );
  const api = useMemo(
    () => ({
      info: (config: ModalFuncConfig) => open("info", config),
      success: (config: ModalFuncConfig) => open("success", config),
      error: (config: ModalFuncConfig) => open("error", config),
      warning: (config: ModalFuncConfig) => open("warning", config),
      confirm: (config: ModalFuncConfig) => open("confirm", config),
    }),
    [open],
  );
  const holder = items.map(({ key, config }) => (
    <ConfirmModal key={key} config={config} onClose={(value) => close(key, value)} />
  ));
  return [api, holder];
}

function ConfirmModal({
  config,
  onClose,
}: {
  config: ModalFuncConfig;
  onClose: (value: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const iconName =
    config.type === "success"
      ? "check-circle-outlined"
      : config.type === "error" || config.type === "warning"
        ? "warning"
        : "info-circle-outlined";
  const iconColor =
    config.type === "success"
      ? "#52c41a"
      : config.type === "error"
        ? "#ff4d4f"
        : config.type === "warning"
          ? "#faad14"
          : "#0062df";
  const run = async (
    action: ModalFuncConfig["onOk"] | ModalFuncConfig["onCancel"],
    value: boolean,
  ) => {
    setLoading(true);
    try {
      await action?.(() => onClose(value));
      onClose(value);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ModalBase
      {...config}
      open
      width={config.width ?? 416}
      confirmLoading={loading}
      title={config.title}
      footer={config.footer}
      onCancel={() => void run(config.onCancel, false)}
      onOk={() => void run(config.onOk, true)}
    >
      <div className="flex gap-3">
        {config.icon === null
          ? null
          : (config.icon ?? <Icon icon={iconName} color={iconColor} size={22} />)}
        <div className="min-w-0 flex-1">{config.content}</div>
      </div>
    </ModalBase>
  );
}

let staticRoot: Root | null = null;
let staticApi: Omit<ModalStaticFunctions, "destroyAll"> | null = null;
let staticContainer: HTMLDivElement | null = null;
const queued: Array<(api: Omit<ModalStaticFunctions, "destroyAll">) => void> = [];

function StaticModalHost() {
  const [api, holder] = useModalHolder();
  useEffect(() => {
    staticApi = api;
    queued.splice(0).forEach((run) => run(api));
  }, [api]);
  return holder;
}

function ensureStaticHost() {
  if (staticRoot || typeof document === "undefined") return;
  staticContainer = document.createElement("div");
  document.body.append(staticContainer);
  staticRoot = createRoot(staticContainer);
  staticRoot.render(createElement(StaticModalHost));
}

function callStatic(
  method: keyof Omit<ModalStaticFunctions, "destroyAll">,
  config: ModalFuncConfig,
) {
  ensureStaticHost();
  if (staticApi) return staticApi[method](config);
  let result: ModalFuncResult | undefined;
  queued.push((api) => {
    result = api[method](config);
  });
  const pending = new Promise<boolean>((resolve) => {
    queued.push(() => result?.then(resolve));
  });
  return {
    // oxlint-disable-next-line unicorn/no-thenable -- Ant Design-compatible awaitable modal API.
    then: pending.then.bind(pending),
    destroy: () => result?.destroy(),
    update: (next: ModalFuncConfig | ((previous: ModalFuncConfig) => ModalFuncConfig)) =>
      result?.update(next),
  };
}

const staticFunctions: ModalStaticFunctions = {
  info: (config) => callStatic("info", config),
  success: (config) => callStatic("success", config),
  error: (config) => callStatic("error", config),
  warning: (config) => callStatic("warning", config),
  confirm: (config) => callStatic("confirm", config),
  destroyAll: () => {
    staticRoot?.unmount();
    staticContainer?.remove();
    staticRoot = null;
    staticContainer = null;
    staticApi = null;
  },
};

export const Modal = Object.assign(ModalBase, staticFunctions, {
  useModal: useModalHolder,
}) as ModalComponent;
