import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import CSSMotion from "@rc-component/motion";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Skeleton } from "../Skeleton";
import { OverlayCloseButton } from "../_internal/OverlayCloseButton";
import { MOTION_DURATION_SLOW } from "../_internal/motion";
import { lockBodyScroll } from "../_internal/body-scroll-lock";
import type {
  DrawerPlacementType,
  DrawerProps,
  DrawerResizableConfig,
  DrawerSizeType,
} from "./Drawer.types";

const DrawerPushContext = createContext<(open: boolean) => void>(() => undefined);

function resolveSize(
  size: DrawerSizeType,
  placement: DrawerPlacementType,
  width?: number | string,
  height?: number | string,
) {
  if (placement === "left" || placement === "right")
    return width ?? (size === "large" ? 736 : size === "default" ? 378 : size);
  return height ?? (size === "large" ? 736 : size === "default" ? 378 : size);
}

function pushTransform(placement: DrawerPlacementType, distance: number | string) {
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
  extra,
  footer,
  loading = false,
  keyboard = true,
  mask = true,
  scrollLock = true,
  forceRender = false,
  destroyOnHidden = false,
  push = { distance: 180 },
  resizable = false,
  zIndex = 1000,
  className,
  style,
  onAfterClose,
  onAfterOpen,
  onClose,
}: DrawerProps) {
  const [rootVisible, setRootVisible] = useState(open);
  const [childOpen, setChildOpen] = useState(false);
  const [resized, setResized] = useState<number>();
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastOpenPlacementRef = useRef(placement);
  const parentPush = useContext(DrawerPushContext);
  if (open) lastOpenPlacementRef.current = placement;
  const motionPlacement = open ? placement : lastOpenPlacementRef.current;
  const drawerSize = resized ?? resolveSize(size, motionPlacement, width, height);
  const pushDistance = typeof push === "object" ? (push.distance ?? 180) : 180;

  useEffect(() => {
    if (open) setRootVisible(true);
  }, [open]);

  useEffect(() => {
    parentPush(open);
    return () => parentPush(false);
  }, [open, parentPush]);

  useEffect(() => {
    if (open) triggerRef.current = document.activeElement as HTMLElement;
  }, [open]);

  useEffect(() => {
    if (!open || !keyboard) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.(event);
      if (event.key !== "Tab" || !panelRef.current) return;
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
  }, [keyboard, onClose, open]);

  const keepScrollLocked = open || rootVisible;
  useEffect(() => {
    if (!keepScrollLocked || !scrollLock) return;
    const releaseScrollLock = lockBodyScroll();
    return () => {
      window.requestAnimationFrame(releaseScrollLock);
    };
  }, [keepScrollLocked, scrollLock]);

  const panelStyle = useMemo(() => {
    const horizontal = motionPlacement === "left" || motionPlacement === "right";
    const base: React.CSSProperties = horizontal
      ? { width: drawerSize, height: "100%" }
      : { height: drawerSize, width: "100%" };
    return {
      ...base,
      transform:
        childOpen && push !== false ? pushTransform(motionPlacement, pushDistance) : "translate(0)",
    };
  }, [childOpen, drawerSize, motionPlacement, push, pushDistance]);
  const motionWrapperStyle = useMemo<React.CSSProperties>(
    () =>
      motionPlacement === "left" || motionPlacement === "right"
        ? { width: drawerSize, height: "100%" }
        : { width: "100%", height: drawerSize },
    [drawerSize, motionPlacement],
  );

  const close = (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => onClose?.(event);
  const closeButton = closable ? <OverlayCloseButton onClick={close} /> : null;
  const panel = (
    <div
      ref={panelRef}
      data-drawer-panel
      className={twMerge(
        "wizard-drawer-panel absolute flex flex-col bg-white font-pretendard text-sm text-[#111] shadow-[-8px_0_24px_rgba(0,0,0,0.12)]",
        "pointer-events-auto",
        motionPlacement === "left" && "inset-y-0 left-0",
        motionPlacement === "right" && "inset-y-0 right-0",
        motionPlacement === "top" && "inset-x-0 top-0",
        motionPlacement === "bottom" && "inset-x-0 bottom-0",
      )}
      style={panelStyle}
    >
      {resizable ? (
        <ResizeHandle
          placement={motionPlacement}
          value={typeof drawerSize === "number" ? drawerSize : 378}
          config={resizable}
          onResize={setResized}
        />
      ) : null}
      {title !== undefined || extra || closeButton ? (
        <div className="flex min-h-14 items-center gap-3 border-b border-[#f0f0f0] px-5">
          <div className="min-w-0 flex-1 text-base font-semibold [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
            {title}
          </div>
          {extra ? <div className="shrink-0">{extra}</div> : null}
          {closeButton}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-auto p-5">
        {loading ? (
          <Skeleton active />
        ) : typeof children === "string" || typeof children === "number" ? (
          <span className="[overflow-wrap:anywhere] break-words whitespace-pre-wrap">
            {children}
          </span>
        ) : (
          children
        )}
      </div>
      {footer !== undefined ? (
        <div className="border-t border-[#f0f0f0] px-5 py-4">{footer}</div>
      ) : null}
    </div>
  );
  const content = (
    <div
      data-drawer-root
      className={twMerge("pointer-events-none fixed inset-0", className)}
      style={{
        zIndex,
        ...style,
        display: open || rootVisible ? undefined : "none",
      }}
    >
      {mask ? (
        <CSSMotion
          visible={open}
          motionName="wizard-drawer-mask-motion"
          motionDeadline={MOTION_DURATION_SLOW + 50}
          removeOnLeave
        >
          {({ className: maskMotionClassName, style: maskMotionStyle }, maskRef) => (
            <div
              ref={maskRef}
              data-drawer-mask
              className={twMerge(
                "pointer-events-auto absolute inset-0 cursor-pointer bg-black/45",
                maskMotionClassName,
              )}
              style={maskMotionStyle}
              onClick={close}
            />
          )}
        </CSSMotion>
      ) : null}
      <CSSMotion
        visible={open}
        motionName="wizard-drawer-motion"
        motionDeadline={MOTION_DURATION_SLOW + 50}
        forceRender={forceRender || !destroyOnHidden}
        removeOnLeave={destroyOnHidden}
        onVisibleChanged={(visible) => {
          setRootVisible(visible);
          if (visible) {
            onAfterOpen?.();
            return;
          }
          onAfterClose?.();
          triggerRef.current?.focus();
        }}
      >
        {({ className: motionClassName, style: motionStyle }, motionRef) => (
          <div
            ref={motionRef}
            data-drawer-motion
            data-placement={motionPlacement}
            className={twMerge(
              "pointer-events-none absolute",
              motionPlacement === "left" && "inset-y-0 left-0",
              motionPlacement === "right" && "inset-y-0 right-0",
              motionPlacement === "top" && "inset-x-0 top-0",
              motionPlacement === "bottom" && "inset-x-0 bottom-0",
              motionClassName,
            )}
            style={{ ...motionWrapperStyle, ...motionStyle }}
          >
            <DrawerPushContext.Provider value={setChildOpen}>{panel}</DrawerPushContext.Provider>
          </div>
        )}
      </CSSMotion>
    </div>
  );
  return typeof document === "undefined" ? content : createPortal(content, document.body);
}

function ResizeHandle({
  placement,
  value,
  config,
  onResize,
}: {
  placement: DrawerPlacementType;
  value: number;
  config: boolean | DrawerResizableConfig;
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
        settings.max ?? Number.POSITIVE_INFINITY,
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
