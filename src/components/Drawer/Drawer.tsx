import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { lockBodyScroll } from "../_internal/body-scroll-lock";
import type {
  DrawerPlacement,
  DrawerProps,
  DrawerResizableConfig,
  DrawerSize,
} from "./Drawer.types";

const DrawerPushContext = createContext<(open: boolean) => void>(() => undefined);

function resolveContainer(getContainer: DrawerProps["getContainer"]) {
  if (getContainer === false || typeof document === "undefined") return null;
  if (typeof getContainer === "string") return document.querySelector<HTMLElement>(getContainer);
  if (typeof getContainer === "function") return getContainer();
  return getContainer ?? document.body;
}

function resolveSize(
  size: DrawerSize,
  placement: DrawerPlacement,
  width?: number | string,
  height?: number | string,
) {
  if (placement === "left" || placement === "right")
    return width ?? (size === "large" ? 736 : size === "default" ? 378 : size);
  return height ?? (size === "large" ? 736 : size === "default" ? 378 : size);
}

function hiddenTransform(placement: DrawerPlacement) {
  if (placement === "left") return "translateX(-100%)";
  if (placement === "right") return "translateX(100%)";
  if (placement === "top") return "translateY(-100%)";
  return "translateY(100%)";
}

function pushTransform(placement: DrawerPlacement, distance: number | string) {
  const value = typeof distance === "number" ? `${distance}px` : distance;
  if (placement === "left") return `translateX(${value})`;
  if (placement === "right") return `translateX(calc(-1 * ${value}))`;
  if (placement === "top") return `translateY(${value})`;
  return `translateY(calc(-1 * ${value}))`;
}

export function Drawer({
  open = false,
  title,
  children,
  placement = "right",
  size = "default",
  width,
  height,
  closable = true,
  closeIcon,
  extra,
  footer,
  loading = false,
  keyboard = true,
  mask = true,
  maskClosable,
  scrollLock = true,
  forceRender = false,
  destroyOnHidden = false,
  destroyOnClose = false,
  push = { distance: 180 },
  resizable = false,
  maxSize,
  focusable,
  getContainer,
  zIndex = 1000,
  className,
  rootClassName,
  style,
  rootStyle,
  classNames,
  styles,
  drawerRender,
  afterOpenChange,
  onClose,
}: DrawerProps) {
  const [rendered, setRendered] = useState(open || forceRender);
  const [closing, setClosing] = useState(false);
  const didMountRef = useRef(false);
  const renderedRef = useRef(open || forceRender);
  const lifecycleRef = useRef({
    afterOpenChange,
    focusable,
    forceRender,
    shouldDestroy: destroyOnHidden || destroyOnClose,
  });
  lifecycleRef.current = {
    afterOpenChange,
    focusable,
    forceRender,
    shouldDestroy: destroyOnHidden || destroyOnClose,
  };
  const [childOpen, setChildOpen] = useState(false);
  const [resized, setResized] = useState<number>();
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const parentPush = useContext(DrawerPushContext);
  const resolvedCloseIcon =
    typeof closable === "object" ? (closable.closeIcon ?? closeIcon) : closeIcon;
  const closePlacement = typeof closable === "object" ? (closable.placement ?? "start") : "start";
  const closeDisabled = typeof closable === "object" && closable.disabled;
  const maskEnabled = typeof mask === "object" ? mask.enabled !== false : mask;
  const canCloseMask = maskClosable ?? (typeof mask === "object" ? mask.closable !== false : true);
  const blurMask = typeof mask === "object" && mask.blur;
  const drawerSize = resized ?? resolveSize(size, placement, width, height);
  const pushDistance = typeof push === "object" ? (push.distance ?? 180) : 180;

  useEffect(() => {
    parentPush(open);
    return () => parentPush(false);
  }, [open, parentPush]);

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
      lifecycleRef.current.afterOpenChange?.(true);
      return;
    }
    if (!renderedRef.current) return;
    setClosing(true);
    const timer = window.setTimeout(() => {
      setClosing(false);
      if (lifecycleRef.current.shouldDestroy && !lifecycleRef.current.forceRender) {
        renderedRef.current = false;
        setRendered(false);
      }
      lifecycleRef.current.afterOpenChange?.(false);
      if (lifecycleRef.current.focusable?.focusTriggerAfterClose !== false)
        triggerRef.current?.focus();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || !keyboard) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.(event);
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
    window.setTimeout(() =>
      panelRef.current?.querySelector<HTMLElement>("button:not(:disabled)")?.focus(),
    );
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusable?.trap, keyboard, onClose, open]);

  useEffect(() => {
    if (!open || !scrollLock) return;
    return lockBodyScroll();
  }, [open, scrollLock]);

  const panelStyle = useMemo(() => {
    const horizontal = placement === "left" || placement === "right";
    const base: React.CSSProperties = horizontal
      ? { width: drawerSize, height: "100%" }
      : { height: drawerSize, width: "100%" };
    return {
      ...base,
      transform:
        open && !closing
          ? childOpen && push !== false
            ? pushTransform(placement, pushDistance)
            : "translate(0)"
          : hiddenTransform(placement),
      ...style,
    };
  }, [childOpen, closing, drawerSize, open, placement, push, pushDistance, style]);

  if (!rendered && !open) return null;
  const close = (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => onClose?.(event);
  const closeButton =
    closable === false ? null : (
      <button
        type="button"
        disabled={closeDisabled}
        className="inline-flex size-7 cursor-pointer items-center justify-center rounded text-[#666] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
        onClick={close}
      >
        {resolvedCloseIcon ?? <Icon icon="close" />}
      </button>
    );
  const panel = (
    <div
      ref={panelRef}
      data-drawer-panel
      className={twMerge(
        "absolute flex flex-col bg-white font-pretendard text-sm text-[#111] shadow-[-8px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out",
        placement === "left" && "inset-y-0 left-0",
        placement === "right" && "inset-y-0 right-0",
        placement === "top" && "inset-x-0 top-0",
        placement === "bottom" && "inset-x-0 bottom-0",
        className,
      )}
      style={panelStyle}
    >
      {resizable ? (
        <ResizeHandle
          placement={placement}
          value={typeof drawerSize === "number" ? drawerSize : 378}
          config={resizable}
          maxSize={maxSize}
          onResize={setResized}
        />
      ) : null}
      {title !== undefined || extra || closeButton ? (
        <div
          className={twMerge(
            "flex min-h-14 items-center gap-3 border-b border-[#f0f0f0] px-5",
            classNames?.header,
          )}
          style={styles?.header}
        >
          {closePlacement === "start" ? closeButton : null}
          <div className="min-w-0 flex-1 truncate text-base font-semibold">{title}</div>
          {extra ? <div className="shrink-0">{extra}</div> : null}
          {closePlacement === "end" ? closeButton : null}
        </div>
      ) : null}
      <div
        className={twMerge("min-h-0 flex-1 overflow-auto p-5", classNames?.body)}
        style={styles?.body}
      >
        {loading ? (
          <div className="grid gap-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#eee]" />
            <div className="h-4 animate-pulse rounded bg-[#eee]" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-[#eee]" />
          </div>
        ) : (
          children
        )}
      </div>
      {footer !== undefined ? (
        <div
          className={twMerge("border-t border-[#f0f0f0] px-5 py-4", classNames?.footer)}
          style={styles?.footer}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
  const content = (
    <div
      data-drawer-root
      className={twMerge(
        "fixed inset-0",
        open || closing ? "pointer-events-auto visible" : "pointer-events-none invisible",
        rootClassName,
        classNames?.root,
      )}
      style={{ zIndex, ...rootStyle, ...styles?.root }}
    >
      {maskEnabled ? (
        <div
          className={twMerge(
            "absolute inset-0 bg-black/45 transition-opacity duration-200",
            blurMask && "backdrop-blur-sm",
            open && !closing ? "opacity-100" : "opacity-0",
            classNames?.mask,
          )}
          style={styles?.mask}
          onClick={canCloseMask ? close : undefined}
        />
      ) : null}
      <div className={twMerge("absolute inset-0", classNames?.wrapper)} style={styles?.wrapper}>
        <DrawerPushContext.Provider value={setChildOpen}>
          {drawerRender ? drawerRender(panel) : panel}
        </DrawerPushContext.Provider>
      </div>
    </div>
  );
  const container = resolveContainer(getContainer);
  return container ? createPortal(content, container) : content;
}

function ResizeHandle({
  placement,
  value,
  config,
  maxSize,
  onResize,
}: {
  placement: DrawerPlacement;
  value: number;
  config: boolean | DrawerResizableConfig;
  maxSize?: number;
  onResize: (value: number) => void;
}) {
  const settings = typeof config === "object" ? config : {};
  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    settings.onResizeStart?.(value);
    const startPoint =
      placement === "left" || placement === "right" ? event.clientX : event.clientY;
    const sign = placement === "right" || placement === "bottom" ? -1 : 1;
    let lastValue = value;
    const move = (moveEvent: PointerEvent) => {
      const point =
        placement === "left" || placement === "right" ? moveEvent.clientX : moveEvent.clientY;
      const next = Math.min(
        maxSize ?? settings.max ?? Number.POSITIVE_INFINITY,
        Math.max(settings.min ?? 180, value + (point - startPoint) * sign),
      );
      lastValue = next;
      onResize(next);
      settings.onResize?.(next);
    };
    const end = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", end);
      settings.onResizeEnd?.(lastValue);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", end);
  };
  return (
    <div
      className={twMerge(
        "absolute z-10 hover:bg-[#0062df]/20",
        (placement === "left" || placement === "right") && "inset-y-0 w-1 cursor-col-resize",
        (placement === "top" || placement === "bottom") && "inset-x-0 h-1 cursor-row-resize",
        placement === "left" && "right-0",
        placement === "right" && "left-0",
        placement === "top" && "bottom-0",
        placement === "bottom" && "top-0",
      )}
      onPointerDown={start}
    />
  );
}
