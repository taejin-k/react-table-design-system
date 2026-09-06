import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { resolveColorToken, resolveReadableTextColor } from "../../color-tokens";
import {
  calculateFloatingPosition,
  getFloatingTransformOrigin,
  type FloatingPlacement,
} from "../_internal/floating-position";
import type { TooltipProps } from "./Tooltip.types";
import { observeFloatingResize } from "../_internal/observe-floating-resize";

const VIEWPORT_GAP = 8;
const TARGET_GAP = 9;
const ARROW_SIZE = 8;
const EDGE_ARROW_CENTER = 16;
const MOTION_DURATION = 200;
const HOVER_DELAY = 100;

export function Tooltip({
  title,
  children,
  placement = "top",
  trigger = "hover",
  arrow = true,
  color = "dark",
  open,
  defaultOpen = false,
  zIndex = 1070,
  className,
  onOpenChange,
}: TooltipProps) {
  const resolvedColor = resolveColorToken(color);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contextMenuPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentPlacementRef = useRef<FloatingPlacement | undefined>(undefined);
  const requestedPlacementRef = useRef(placement);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<ReturnType<typeof calculateFloatingPosition> | null>(
    null,
  );
  const triggers = useMemo(() => new Set(Array.isArray(trigger) ? trigger : [trigger]), [trigger]);
  const enabled = title !== null && title !== undefined && title !== "";
  const isOpen = enabled && (open ?? innerOpen);
  const [popupMounted, setPopupMounted] = useState(isOpen);
  const [motionVisible, setMotionVisible] = useState(false);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const changeOpen = useCallback(
    (nextOpen: boolean) => {
      if (!enabled || nextOpen === isOpen) return;
      if (open === undefined) setInnerOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [enabled, isOpen, onOpenChange, open],
  );

  const scheduleOpen = useCallback(() => {
    if (!enabled) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = setTimeout(() => changeOpen(true), HOVER_DELAY);
  }, [changeOpen, enabled]);

  const scheduleClose = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => changeOpen(false), HOVER_DELAY);
  }, [changeOpen]);

  const updatePosition = useCallback(() => {
    const target = triggerRef.current;
    const popup = popupRef.current;
    if (!target || !popup) return;
    if (requestedPlacementRef.current !== placement) {
      requestedPlacementRef.current = placement;
      currentPlacementRef.current = undefined;
    }

    const targetRect = contextMenuPointRef.current
      ? createPointRect(contextMenuPointRef.current.x, contextMenuPointRef.current.y)
      : target.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const nextPosition = calculateFloatingPosition(targetRect, popupRect, placement, {
      arrowSize: ARROW_SIZE,
      autoAdjustOverflow: true,
      edgeArrowCenter: EDGE_ARROW_CENTER,
      targetGap: TARGET_GAP,
      viewportGap: VIEWPORT_GAP,
      currentPlacement: currentPlacementRef.current,
      recoverPreferredAxis: false,
    });
    currentPlacementRef.current = nextPosition.placement;
    setPosition(nextPosition);
  }, [placement]);

  useEffect(() => {
    if (motionTimerRef.current) clearTimeout(motionTimerRef.current);

    if (isOpen) {
      setPopupMounted(true);
      return;
    }

    setMotionVisible(false);
    motionTimerRef.current = setTimeout(() => {
      setPopupMounted(false);
      setPosition(null);
    }, MOTION_DURATION);

    return () => {
      if (motionTimerRef.current) clearTimeout(motionTimerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !popupMounted) return;

    const frame = requestAnimationFrame(() => setMotionVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen, popupMounted]);

  useLayoutEffect(() => {
    if (!isOpen) {
      currentPlacementRef.current = undefined;
      return;
    }
    if (!popupMounted) {
      setPosition(null);
      return;
    }

    updatePosition();
    const handleScroll = () => {
      clearTimers();
      changeOpen(false);
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    const resizeObserver = observeFloatingResize(updatePosition);
    if (triggerRef.current) resizeObserver?.observe(triggerRef.current);
    if (popupRef.current) resizeObserver?.observe(popupRef.current);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
      resizeObserver?.disconnect();
    };
  }, [changeOpen, clearTimers, isOpen, popupMounted, title, updatePosition]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!isOpen || (!triggers.has("click") && !triggers.has("contextMenu"))) return;

    const handleOutsidePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) return;
      clearTimers();
      changeOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      clearTimers();
      changeOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [changeOpen, clearTimers, isOpen, triggers]);

  const handlePointerEnter = (_event: PointerEvent<HTMLSpanElement>) => {
    if (!triggers.has("hover")) return;
    contextMenuPointRef.current = null;
    scheduleOpen();
  };

  const handlePointerLeave = (_event: PointerEvent<HTMLSpanElement>) => {
    if (triggers.has("hover")) scheduleClose();
  };

  const handleFocus = (_event: FocusEvent<HTMLSpanElement>) => {
    if (!triggers.has("focus")) return;
    contextMenuPointRef.current = null;
    scheduleOpen();
  };

  const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (triggers.has("focus") && !event.currentTarget.contains(event.relatedTarget))
      scheduleClose();
  };

  const handleClick = (_event: MouseEvent<HTMLSpanElement>) => {
    if (!triggers.has("click")) return;
    contextMenuPointRef.current = null;
    clearTimers();
    changeOpen(!isOpen);
  };

  const handleContextMenu = (event: MouseEvent<HTMLSpanElement>) => {
    if (!triggers.has("contextMenu")) return;
    event.preventDefault();
    contextMenuPointRef.current = { x: event.clientX, y: event.clientY };
    clearTimers();
    if (isOpen) updatePosition();
    else changeOpen(true);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className={twMerge("inline-flex max-w-full min-w-0", className)}
        onBlur={handleBlur}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onFocus={handleFocus}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {children}
      </span>
      {popupMounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              data-placement={position?.placement ?? placement}
              data-tooltip
              className="pointer-events-none fixed max-w-[min(250px,calc(100vw-16px))] min-w-0 font-pretendard text-xs leading-[18px] text-white"
              style={{
                left: position?.left ?? 0,
                top: position?.top ?? 0,
                zIndex,
                visibility: position ? "visible" : "hidden",
              }}
            >
              <div
                data-tooltip-motion
                className={twMerge(
                  "relative",
                  motionVisible && position
                    ? "wizard-zoom-big-fast-enter"
                    : isOpen
                      ? "scale-[0.8] opacity-0"
                      : "wizard-zoom-big-fast-leave",
                )}
                style={{
                  transformOrigin: getFloatingTransformOrigin(
                    position?.placement ?? placement,
                    position?.arrowStyle,
                    ARROW_SIZE,
                  ),
                }}
              >
                <div
                  className="relative rounded px-2 py-1 shadow-2xl"
                  style={{
                    backgroundColor: resolvedColor,
                    color: resolveReadableTextColor(color),
                  }}
                >
                  <span className="block min-h-5 max-w-full min-w-0 break-all whitespace-pre-wrap">
                    {title}
                  </span>
                </div>
                {arrow ? (
                  <span
                    data-tooltip-arrow
                    className="absolute size-2 rotate-45"
                    style={{
                      backgroundColor: resolvedColor,
                      ...position?.arrowStyle,
                    }}
                  />
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function createPointRect(x: number, y: number): DOMRect {
  return {
    x,
    y,
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
    toJSON: () => ({ x, y, width: 0, height: 0, top: y, right: x, bottom: y, left: x }),
  };
}
