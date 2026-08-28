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
import { OverlayCloseButton } from "../_internal/OverlayCloseButton";
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

function resolveWidth(width: ModalWidthType | undefined, viewportWidth: number) {
  if (!width || typeof width !== "object") return width ?? 420;
  return Object.entries(breakpointWidth).reduce<number | string>((current, [key, minWidth]) => {
    const next = width[key as keyof typeof width];
    return viewportWidth >= minWidth && next !== undefined ? next : current;
  }, width.xs ?? 420);
}

function useResolvedWidth(width: ModalWidthType | undefined) {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth,
  );

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  return resolveWidth(width, viewportWidth);
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
  width = 420,
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
  modalRender,
  afterClose,
  afterOpenChange,
  onConfirm,
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
  const resolvedWidth = useResolvedWidth(width);

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

  const keepScrollLocked = open || rootVisible;
  useEffect(() => {
    if (!keepScrollLocked || !scrollLock) return;
    const releaseScrollLock = lockBodyScroll();
    return () => {
      // Let the hidden Modal root reach the next paint before restoring the page scrollbar.
      // Otherwise the centered panel can be recomposited once at the narrower viewport width.
      window.requestAnimationFrame(releaseScrollLock);
    };
  }, [keepScrollLocked, scrollLock]);

  const close = (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => onCancel?.(event);
  const renderCancelButton = () => (
    <Button variant="secondary" {...cancelButtonProps} onClick={(event) => close(event)}>
      {cancelText}
    </Button>
  );
  const renderOkButton = () => (
    <Button
      variant={okType}
      {...okButtonProps}
      loading={confirmLoading}
      disabled={okButtonProps?.disabled}
      onClick={onConfirm}
    >
      {okText}
    </Button>
  );
  const defaultFooter = (
    <div className="flex justify-end gap-2">
      {renderCancelButton()}
      {renderOkButton()}
    </div>
  );
  const footerNode =
    typeof footer === "function"
      ? footer(defaultFooter, { OkBtn: renderOkButton, CancelBtn: renderCancelButton })
      : footer === undefined
        ? defaultFooter
        : footer;
  const panel = (
    <div
      ref={panelRef}
      data-modal-panel
      className={twMerge(
        "wizard-modal-panel relative max-h-[calc(100vh-48px)] overflow-hidden rounded-lg bg-white px-6 py-5 font-pretendard text-sm leading-[22px] text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
        "pointer-events-auto min-w-0",
      )}
      style={{
        width: resolvedWidth,
        maxWidth: "calc(100vw - 32px)",
        transformOrigin: transformOriginRef.current,
      }}
    >
      {title !== undefined ? (
        <div className="mb-2 min-w-0 text-base leading-6 font-semibold [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
          {title}
        </div>
      ) : null}
      {showClose ? (
        <OverlayCloseButton
          icon={resolvedCloseIcon}
          disabled={closeDisabled}
          className="absolute top-3 right-3"
          onClick={close}
        />
      ) : null}
      <div className="max-h-[calc(100vh-152px)] min-w-0 overflow-x-hidden overflow-y-auto [overflow-wrap:anywhere] break-words">
        {typeof children === "string" || typeof children === "number" ? (
          <span className="whitespace-pre-wrap">{children}</span>
        ) : (
          children
        )}
      </div>
      {footerNode !== null ? <div className="mt-3">{footerNode}</div> : null}
    </div>
  );
  const content = (
    <div
      data-modal-root
      className={twMerge("pointer-events-none fixed inset-0 font-pretendard", className)}
      style={{
        zIndex,
        ...style,
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
              )}
              style={maskMotionStyle}
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
              "pointer-events-none absolute inset-0 flex overflow-x-hidden overflow-y-auto px-4 py-6",
              centered ? "items-center justify-center" : "items-start justify-center pt-[100px]",
              motionClassName,
            )}
            style={motionStyle}
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
        : config.type === "warning"
          ? "warning-circle-filled"
          : "info-circle-filled";
  const iconColor =
    config.type === "success"
      ? "#52c41a"
      : config.type === "error"
        ? "#ff4d4f"
        : config.type === "warning"
          ? "#faad14"
          : "#0062df";
  const run = async (
    action: ModalFuncConfig["onConfirm"] | ModalFuncConfig["onCancel"],
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
  const renderCancelButton = () => (
    <Button
      variant="secondary"
      {...config.cancelButtonProps}
      onClick={() => void run(config.onCancel, false)}
    >
      {config.cancelText ?? "취소"}
    </Button>
  );
  const renderOkButton = () => (
    <Button
      variant={config.okType ?? "primary"}
      {...config.okButtonProps}
      loading={loading}
      onClick={() => void run(config.onConfirm, true)}
    >
      {config.okText ?? "확인"}
    </Button>
  );
  const defaultFooter = (
    <div className="flex justify-end gap-2">
      {config.type === "confirm" ? renderCancelButton() : null}
      {renderOkButton()}
    </div>
  );
  const footerNode =
    typeof config.footer === "function"
      ? config.footer(defaultFooter, {
          OkBtn: renderOkButton,
          CancelBtn: renderCancelButton,
        })
      : config.footer === undefined
        ? defaultFooter
        : config.footer;
  return (
    <ModalBase
      {...config}
      open={open}
      width={config.width ?? 420}
      title={undefined}
      footer={footerNode}
      closable={config.closable ?? false}
      mask={config.mask ?? true}
      afterClose={onAfterClose}
      onCancel={() => void run(config.onCancel, false)}
      onConfirm={undefined}
    >
      <div className="flex items-start">
        {config.icon === null ? null : (
          <span
            className={twMerge(
              "mr-2.5 inline-flex size-7 shrink-0 items-center justify-center leading-none",
              config.title !== undefined ? "-mt-0.5" : "-mt-[3px]",
            )}
          >
            {config.icon ?? <Icon icon={iconName} color={iconColor} size={28} />}
          </span>
        )}
        <div className="min-w-0 flex-1 [overflow-wrap:anywhere] break-words">
          {config.title !== undefined ? (
            <div className="text-base leading-6 font-semibold whitespace-pre-wrap">
              {config.title}
            </div>
          ) : null}
          {config.content !== undefined ? (
            <div
              className={twMerge(
                "text-sm leading-[22px] whitespace-pre-wrap",
                config.title !== undefined && "mt-2",
              )}
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
