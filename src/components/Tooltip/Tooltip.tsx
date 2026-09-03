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
import { calculateFloatingPosition } from "../_internal/floating-position";
import type { TooltipPlacementType, TooltipProps } from "./Tooltip.types";

const VIEWPORT_GAP = 8;
const TARGET_GAP = 9;
const ARROW_SIZE = 8;
const EDGE_ARROW_CENTER = 16;
const MOTION_DURATION = 100;

export function Tooltip({
  title,
  children,
  placement = "top",
  trigger = "hover",
  arrow = true,
  color = "var(--color-dark)",
  open,
  defaultOpen = false,
  autoAdjustOverflow = true,
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  zIndex = 1070,
  className,
  onOpenChange,
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contextMenuPointRef = useRef<{ x: number; y: number } | null>(null);
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
    if (mouseEnterDelay <= 0) {
      changeOpen(true);
      return;
    }
    openTimerRef.current = setTimeout(() => changeOpen(true), mouseEnterDelay * 1000);
  }, [changeOpen, enabled, mouseEnterDelay]);

  const scheduleClose = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (mouseLeaveDelay <= 0) {
      changeOpen(false);
      return;
    }
    closeTimerRef.current = setTimeout(() => changeOpen(false), mouseLeaveDelay * 1000);
  }, [changeOpen, mouseLeaveDelay]);

  const updatePosition = useCallback(() => {
    const target = triggerRef.current;
    const popup = popupRef.current;
    if (!target || !popup) return;

    const targetRect = contextMenuPointRef.current
      ? createPointRect(contextMenuPointRef.current.x, contextMenuPointRef.current.y)
      : target.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const nextPosition = calculateFloatingPosition(targetRect, popupRect, placement, {
      arrowSize: ARROW_SIZE,
      autoAdjustOverflow,
      edgeArrowCenter: EDGE_ARROW_CENTER,
      targetGap: TARGET_GAP,
      viewportGap: VIEWPORT_GAP,
    });
    setPosition(nextPosition);
  }, [autoAdjustOverflow, placement]);

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

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updatePosition);
    if (triggerRef.current) resizeObserver?.observe(triggerRef.current);
    if (popupRef.current) resizeObserver?.observe(popupRef.current);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
      resizeObserver?.disconnect();
    };
  }, [changeOpen, clearTimers, popupMounted, title, updatePosition]);

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
        className={twMerge("inline-flex min-w-0", className)}
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
              className="pointer-events-none fixed max-w-[250px] font-pretendard text-xs leading-[18px] break-words text-white"
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
                  transformOrigin: getTransformOrigin(position?.placement ?? placement),
                }}
              >
                <div
                  className="relative rounded px-2 py-1 shadow-lg"
                  style={{ backgroundColor: color, color: getTextColor(color) }}
                >
                  <span className="block min-h-5 [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                    {title}
                  </span>
                </div>
                {arrow ? (
                  <span
                    data-tooltip-arrow
                    className="absolute size-2 rotate-45"
                    style={{
                      backgroundColor: color,
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

function getTransformOrigin(placement: TooltipPlacementType) {
  if (placement.startsWith("top")) {
    if (placement.endsWith("Left")) return "16px bottom";
    if (placement.endsWith("Right")) return "calc(100% - 16px) bottom";
    return "center bottom";
  }
  if (placement.startsWith("bottom")) {
    if (placement.endsWith("Left")) return "16px top";
    if (placement.endsWith("Right")) return "calc(100% - 16px) top";
    return "center top";
  }
  if (placement.startsWith("left")) {
    if (placement.endsWith("Top")) return "right 16px";
    if (placement.endsWith("Bottom")) return "right calc(100% - 16px)";
    return "right center";
  }
  if (placement.endsWith("Top")) return "left 16px";
  if (placement.endsWith("Bottom")) return "left calc(100% - 16px)";
  return "left center";
}

function getTextColor(color: string) {
  const hex = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (!hex) return "#ffffff";
  const normalized = hex.length === 3 ? [...hex].map((value) => value + value).join("") : hex;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114 > 160 ? "var(--color-dark)" : "#ffffff";
}
