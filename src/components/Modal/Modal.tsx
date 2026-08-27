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
import CSSMotion from "@rc-component/motion";
import { createRoot, type Root } from "react-dom/client";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { MOTION_DURATION_MID } from "../_internal/motion";
import { lockBodyScroll } from "../_internal/body-scroll-lock";
import type {
  ModalComponent,
  ModalFuncConfig,
  ModalFuncResult,
  ModalProps,
  ModalStaticFunctions,
  ModalWidthType,
} from "./Modal.types";

const breakpointWidth = { xs: 480, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600 };

let latestPointerPosition: { x: number; y: number; time: number } | null = null;
let pointerListenerAttached = false;

function ensurePointerListener() {
  if (pointerListenerAttached || typeof document === "undefined") return;
  pointerListenerAttached = true;
  document.addEventListener(
    "click",
    (event) => {
      latestPointerPosition = { x: event.clientX, y: event.clientY, time: Date.now() };
    },
    true,
  );
}

ensurePointerListener();

function resolveWidth(width: ModalWidthType | undefined) {
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
  centered = false,
  width = 520,
  confirmLoading = false,
  okText = "확인",
  cancelText = "취소",
  okType = "primary",
  okButtonProps,
  cancelButtonProps,
  keyboard = true,
  mask = true,
  scrollLock = true,
  forceRender = false,
  destroyOnHidden = false,
  focusable,
  getContainer,
  zIndex = 1000,
  style,
  className,
  classNames,
  styles,
  modalRender,
  afterClose,
  afterOpenChange,
  onOk,
  onCancel,
}: ModalProps) {
  const [rootVisible, setRootVisible] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const transformOriginRef = useRef("center center");
  const resolvedCloseIcon = typeof closable === "object" ? closable.closeIcon : undefined;
  const closeDisabled = typeof closable === "object" && closable.disabled;
  const showClose = closable !== false;
  const maskEnabled = typeof mask === "object" ? mask.enabled !== false : mask;
  const canCloseMask = typeof mask === "object" ? mask.closable !== false : true;
  const blurMask = typeof mask === "object" && mask.blur;

  useEffect(() => {
    if (open) setRootVisible(true);
  }, [open]);

  useEffect(() => {
    if (open) triggerRef.current = document.activeElement as HTMLElement;
  }, [open]);

  const prepareTransformOrigin = useCallback(() => {
    if (!panelRef.current) return;
    const point = latestPointerPosition;
    if (!point || Date.now() - point.time > 500) {
      transformOriginRef.current = "center center";
      panelRef.current.style.transformOrigin = transformOriginRef.current;
      return;
    }
    const rect = panelRef.current.getBoundingClientRect();
    transformOriginRef.current = `${point.x - rect.left}px ${point.y - rect.top}px`;
    panelRef.current.style.transformOrigin = transformOriginRef.current;
  }, []);

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
      loading={confirmLoading}
      disabled={okButtonProps?.disabled}
      onClick={onOk}
    >
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
        "wizard-modal-panel relative max-h-[calc(100vh-48px)] overflow-hidden rounded-lg bg-white px-6 py-5 font-pretendard text-sm leading-[22px] text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
        "pointer-events-auto",
        classNames?.panel,
      )}
      style={{
        width: resolveWidth(width),
        maxWidth: "calc(100vw - 32px)",
        transformOrigin: transformOriginRef.current,
        ...styles?.panel,
      }}
    >
      {title !== undefined ? (
        <div
          className={twMerge("mb-2 text-base leading-6 font-semibold", classNames?.header)}
          style={styles?.header}
        >
          {title}
        </div>
      ) : null}
      {showClose ? (
        <Button
          variant="ghost"
          size="md"
          iconOnly
          prefixIcon={
            <span className="inline-flex">
              {resolvedCloseIcon ?? <Icon icon="close" size={16} />}
            </span>
          }
          disabled={closeDisabled}
          className="absolute top-3 right-3 size-7 text-[#666]"
          onClick={close}
        />
      ) : null}
      <div
        className={twMerge("max-h-[calc(100vh-152px)] overflow-auto", classNames?.body)}
        style={styles?.body}
      >
        {children}
      </div>
      {footerNode !== null ? (
        <div className={twMerge("mt-3", classNames?.footer)} style={styles?.footer}>
          {footerNode}
        </div>
      ) : null}
    </div>
  );
  const content = (
    <div
      data-modal-root
      className={twMerge(
        "pointer-events-none fixed inset-0 font-pretendard",
        className,
        classNames?.root,
      )}
      style={{
        zIndex,
        ...style,
        ...styles?.root,
        display: open || rootVisible ? undefined : "none",
      }}
    >
      {maskEnabled ? (
        <CSSMotion
          visible={open}
          motionName="wizard-modal-mask-motion"
          motionDeadline={MOTION_DURATION_MID + 50}
          removeOnLeave
        >
          {({ className: maskMotionClassName, style: maskMotionStyle }, maskRef) => (
            <div
              ref={maskRef}
              data-modal-mask
              className={twMerge(
                "pointer-events-auto absolute inset-0 bg-black/45",
                canCloseMask && "cursor-pointer",
                blurMask && "backdrop-blur-sm",
                maskMotionClassName,
                classNames?.mask,
              )}
              style={{ ...styles?.mask, ...maskMotionStyle }}
              onClick={canCloseMask ? close : undefined}
            />
          )}
        </CSSMotion>
      ) : null}
      <CSSMotion
        visible={open}
        motionName="wizard-modal-motion"
        motionDeadline={MOTION_DURATION_MID + 50}
        forceRender={forceRender || !destroyOnHidden}
        removeOnLeave={destroyOnHidden}
        onAppearPrepare={prepareTransformOrigin}
        onEnterPrepare={prepareTransformOrigin}
        onVisibleChanged={(visible) => {
          setRootVisible(visible);
          afterOpenChange?.(visible);
          if (visible) return;
          afterClose?.();
          if (focusable?.focusTriggerAfterClose !== false) triggerRef.current?.focus();
        }}
      >
        {({ className: motionClassName, style: motionStyle }, motionRef) => (
          <div
            ref={motionRef}
            data-modal-motion
            className={twMerge(
              "pointer-events-none absolute inset-0 flex overflow-auto px-4 py-6",
              centered ? "items-center justify-center" : "items-start justify-center pt-[100px]",
              motionClassName,
              classNames?.wrapper,
            )}
            style={{ ...styles?.wrapper, ...motionStyle }}
          >
            {modalRender ? modalRender(panel) : panel}
          </div>
        )}
      </CSSMotion>
    </div>
  );
  const container = resolveContainer(getContainer);
  return container ? createPortal(content, container) : content;
}

type ManagedModal = {
  key: string;
  config: ModalFuncConfig;
  open: boolean;
  result?: boolean;
  resolve: (value: boolean) => void;
};

function useModalHolder(): [Omit<ModalStaticFunctions, "destroyAll">, ReactNode] {
  const [items, setItems] = useState<ManagedModal[]>([]);
  const resolvers = useRef(new Map<string, (value: boolean) => void>());
  const close = useCallback((key: string, value: boolean) => {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, open: false, result: value } : item)),
    );
  }, []);
  const remove = useCallback((key: string) => {
    setItems((current) => {
      const target = current.find((item) => item.key === key);
      if (target) resolvers.current.get(key)?.(target.result ?? false);
      resolvers.current.delete(key);
      return current.filter((item) => item.key !== key);
    });
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
        { key, config: { ...initial, type }, open: true, resolve: resolvePromise },
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
  const holder = items.map(({ key, config, open: itemOpen }) => (
    <ConfirmModal
      key={key}
      config={config}
      open={itemOpen}
      onClose={(value) => close(key, value)}
      onAfterClose={() => remove(key)}
    />
  ));
  return [api, holder];
}

function ConfirmModal({
  config,
  open,
  onClose,
  onAfterClose,
}: {
  config: ModalFuncConfig;
  open: boolean;
  onClose: (value: boolean) => void;
  onAfterClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const iconName =
    config.type === "success"
      ? "check-circle-filled"
      : config.type === "error"
        ? "close-circle-filled"
        : config.type === "warning" || config.type === "confirm"
          ? "warning-circle-filled"
          : "info-circle-filled";
  const iconColor =
    config.type === "success"
      ? "#52c41a"
      : config.type === "error"
        ? "#ff4d4f"
        : config.type === "warning" || config.type === "confirm"
          ? "#faad14"
          : "#0062df";
  const run = async (
    action: ModalFuncConfig["onOk"] | ModalFuncConfig["onCancel"],
    value: boolean,
  ) => {
    setLoading(true);
    let closed = false;
    const closeOnce = () => {
      if (closed) return;
      closed = true;
      onClose(value);
    };
    try {
      await action?.(closeOnce);
      closeOnce();
    } finally {
      setLoading(false);
    }
  };
  const CancelBtn = () => (
    <Button
      variant="secondary"
      {...config.cancelButtonProps}
      onClick={() => void run(config.onCancel, false)}
    >
      {config.cancelText ?? "취소"}
    </Button>
  );
  const OkBtn = () => (
    <Button
      variant={config.okType ?? "primary"}
      {...config.okButtonProps}
      loading={loading}
      onClick={() => void run(config.onOk, true)}
    >
      {config.okText ?? "확인"}
    </Button>
  );
  const defaultFooter = (
    <div className="flex justify-end gap-2">
      {config.type === "confirm" ? <CancelBtn /> : null}
      <OkBtn />
    </div>
  );
  const footerNode =
    typeof config.footer === "function"
      ? config.footer(defaultFooter, { OkBtn, CancelBtn })
      : config.footer === undefined
        ? defaultFooter
        : config.footer;
  return (
    <ModalBase
      {...config}
      open={open}
      width={config.width ?? 416}
      title={undefined}
      footer={footerNode}
      closable={config.closable ?? false}
      mask={config.mask ?? true}
      afterClose={onAfterClose}
      onCancel={() => void run(config.onCancel, false)}
      onOk={undefined}
    >
      <div className="flex items-start">
        {config.icon === null ? null : (
          <span className="mt-px mr-3 inline-flex size-6 shrink-0 items-center justify-center leading-none">
            {config.icon ?? <Icon icon={iconName} color={iconColor} size={24} />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {config.title !== undefined ? (
            <div className="text-base leading-6 font-semibold">{config.title}</div>
          ) : null}
          {config.content !== undefined ? (
            <div
              className={twMerge("text-sm leading-[22px]", config.title !== undefined && "mt-2")}
            >
              {config.content}
            </div>
          ) : null}
        </div>
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
  let destroyRequested = false;
  const pendingUpdates: Array<ModalFuncConfig | ((previous: ModalFuncConfig) => ModalFuncConfig)> =
    [];
  const pending = new Promise<boolean>((resolve) => {
    queued.push((api) => {
      result = api[method](config);
      pendingUpdates.splice(0).forEach((next) => result?.update(next));
      if (destroyRequested) result.destroy();
      result.then(resolve);
    });
  });
  return {
    // oxlint-disable-next-line unicorn/no-thenable -- Ant Design-compatible awaitable modal API.
    then: pending.then.bind(pending),
    destroy: () => {
      if (result) result.destroy();
      else destroyRequested = true;
    },
    update: (next: ModalFuncConfig | ((previous: ModalFuncConfig) => ModalFuncConfig)) => {
      if (result) result.update(next);
      else pendingUpdates.push(next);
    },
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

export const Modal = Object.assign(ModalBase, staticFunctions) as ModalComponent;
