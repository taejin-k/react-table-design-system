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

function resolveSize(size: DrawerSizeType) {
  return size === "large" ? 736 : size === "default" ? 378 : size;
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
  closable = true,
  extra,
  footer,
  keyboard = true,
  mask = true,
  scrollLock = true,
  forceRender = false,
  destroyOnHidden = false,
  push = true,
  resizable = false,
  zIndex = 1000,
  onAfterClose,
  onAfterOpen,
  onClose,
}: DrawerProps) {
  const [rootVisible, setRootVisible] = useState(open);
  const [hasOpened, setHasOpened] = useState(open);
  const [childOpen, setChildOpen] = useState(false);
  const [resized, setResized] = useState<number>();
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastOpenPlacementRef = useRef(placement);
  const parentPush = useContext(DrawerPushContext);
  if (open) lastOpenPlacementRef.current = placement;
  const motionPlacement = open ? placement : lastOpenPlacementRef.current;
  const drawerSize = resized ?? resolveSize(size);

  useEffect(() => {
    setResized(undefined);
  }, [placement, size]);

  useEffect(() => {
    if (open) {
      setRootVisible(true);
      setHasOpened(true);
    }
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
      if (event.key === "Escape") {
        event.preventDefault();
        panelRef.current?.focus({ preventScroll: true });
        onClose?.(event);
        return;
      }
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
    const focusTimer = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }));
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
    return {
      width: "100%",
      height: "100%",
      transform: childOpen && push ? pushTransform(motionPlacement, 180) : "translate(0)",
    };
  }, [childOpen, motionPlacement, push]);
  const motionWrapperStyle = useMemo<React.CSSProperties>(
    () =>
      motionPlacement === "left" || motionPlacement === "right"
        ? { width: drawerSize, height: "100%" }
        : { width: "100%", height: drawerSize },
    [drawerSize, motionPlacement],
  );

  const close = (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => onClose?.(event);
  const closeButton = closable ? (
    <OverlayCloseButton className="self-start" onClick={close} />
  ) : null;
  const panel = (
    <div
      ref={panelRef}
      data-drawer-panel
      tabIndex={-1}
      className={twMerge(
        "wizard-drawer-panel absolute flex flex-col bg-white font-pretendard text-sm text-[#111] shadow-[-8px_0_24px_rgba(0,0,0,0.12)] outline-none",
        "pointer-events-auto",
        motionPlacement === "left" && "inset-y-0 left-0",
        motionPlacement === "right" && "inset-y-0 right-0",
        motionPlacement === "top" && "inset-x-0 top-0",
        motionPlacement === "bottom" && "inset-x-0 bottom-0",
      )}
      style={panelStyle}
    >
      {resizable ? (
        <ResizeHandle placement={motionPlacement} config={resizable} onResize={setResized} />
      ) : null}
      {title !== undefined || extra || closeButton ? (
        <div className="flex min-h-14 items-center gap-3 border-b border-[#f0f0f0] px-5 py-4">
          <div className="min-w-0 flex-1 text-base leading-6 font-semibold [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
            {title}
          </div>
          {extra ? <div className="shrink-0">{extra}</div> : null}
          {closeButton}
        </div>
      ) : null}
      <div data-drawer-scroll-container className="min-h-0 flex-1 overflow-auto p-5">
        {typeof children === "string" || typeof children === "number" ? (
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
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex,
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
      {forceRender || open || hasOpened ? (
        <CSSMotion
          visible={open}
          motionName="wizard-drawer-motion"
          motionDeadline={MOTION_DURATION_SLOW + 50}
          forceRender={forceRender}
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
      ) : null}
    </div>
  );
  return typeof document === "undefined" ? content : createPortal(content, document.body);
}

function ResizeHandle({
  placement,
  config,
  onResize,
}: {
  placement: DrawerPlacementType;
  config: boolean | DrawerResizableConfig;
  onResize: (value: number) => void;
}) {
  const settings = typeof config === "object" ? config : {};
  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const panel = event.currentTarget.closest<HTMLElement>("[data-drawer-panel]");
    const panelRect = panel?.getBoundingClientRect();
    const startSize =
      placement === "left" || placement === "right"
        ? (panelRect?.width ?? 378)
        : (panelRect?.height ?? 378);
    settings.onResizeStart?.(startSize);
    const startPoint =
      placement === "left" || placement === "right" ? event.clientX : event.clientY;
    const sign = placement === "right" || placement === "bottom" ? -1 : 1;
    let lastValue = startSize;
    const move = (moveEvent: PointerEvent) => {
      const point =
        placement === "left" || placement === "right" ? moveEvent.clientX : moveEvent.clientY;
      const next = Math.min(
        settings.max ?? Number.POSITIVE_INFINITY,
        Math.max(settings.min ?? 180, startSize + (point - startPoint) * sign),
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
      data-drawer-resize-handle
      className={twMerge(
        "absolute z-10 transition-colors duration-200 hover:bg-[#0062df]/20",
        (placement === "left" || placement === "right") && "inset-y-0 w-2 cursor-col-resize",
        (placement === "top" || placement === "bottom") && "inset-x-0 h-2 cursor-row-resize",
        placement === "left" && "right-0",
        placement === "right" && "left-0",
        placement === "top" && "bottom-0",
        placement === "bottom" && "top-0",
      )}
      onPointerDown={start}
    />
  );
}
