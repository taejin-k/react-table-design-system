import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import type { TooltipPlacement, TooltipProps } from "./Tooltip.types";

const VIEWPORT_GAP = 8;
const TARGET_GAP = 9;
const ARROW_SIZE = 8;
const EDGE_ARROW_CENTER = 16;

interface TooltipPosition {
  left: number;
  top: number;
  placement: TooltipPlacement;
  arrowStyle: CSSProperties;
}

export function Tooltip({
  title,
  children,
  placement = "top",
  trigger = "hover",
  arrow = true,
  color = "#111",
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
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const triggers = useMemo(() => new Set(Array.isArray(trigger) ? trigger : [trigger]), [trigger]);
  const content = typeof title === "function" ? title() : title;
  const enabled = content !== null && content !== undefined && content !== "";
  const isOpen = enabled && (open ?? innerOpen);

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

    const targetRect = target.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const nextPosition = calculatePosition(targetRect, popupRect, placement, autoAdjustOverflow);
    setPosition(nextPosition);
  }, [autoAdjustOverflow, placement]);

  useLayoutEffect(() => {
    if (!isOpen) {
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
  }, [changeOpen, clearTimers, content, isOpen, updatePosition]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!isOpen || !triggers.has("click")) return;

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
    if (triggers.has("hover")) scheduleOpen();
  };

  const handlePointerLeave = (_event: PointerEvent<HTMLSpanElement>) => {
    if (triggers.has("hover")) scheduleClose();
  };

  const handleFocus = (_event: FocusEvent<HTMLSpanElement>) => {
    if (triggers.has("focus")) scheduleOpen();
  };

  const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (triggers.has("focus") && !event.currentTarget.contains(event.relatedTarget))
      scheduleClose();
  };

  const handleClick = (_event: MouseEvent<HTMLSpanElement>) => {
    if (!triggers.has("click")) return;
    clearTimers();
    changeOpen(!isOpen);
  };

  return (
    <>
      <span
        ref={triggerRef}
        className={twMerge("inline-flex min-w-0", className)}
        onBlur={handleBlur}
        onClick={handleClick}
        onFocus={handleFocus}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {children}
      </span>
      {isOpen && typeof document !== "undefined"
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
                className="relative rounded px-2 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
                style={{ backgroundColor: color, color: getTextColor(color) }}
              >
                <span className="block min-h-5">{content}</span>
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
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function calculatePosition(
  target: DOMRect,
  popup: DOMRect,
  requestedPlacement: TooltipPlacement,
  autoAdjustOverflow: boolean,
): TooltipPosition {
  let placement = requestedPlacement;
  let point = getPlacementPoint(target, popup, placement);

  if (autoAdjustOverflow && overflowsMainAxis(point, popup, placement)) {
    placement = flipPlacement(placement);
    point = getPlacementPoint(target, popup, placement);
  }

  const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - popup.width - VIEWPORT_GAP);
  const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - popup.height - VIEWPORT_GAP);
  const left = autoAdjustOverflow ? clamp(point.left, VIEWPORT_GAP, maxLeft) : point.left;
  const top = autoAdjustOverflow ? clamp(point.top, VIEWPORT_GAP, maxTop) : point.top;

  return {
    left,
    top,
    placement,
    arrowStyle: getArrowStyle(target, popup, placement, left, top),
  };
}

function getPlacementPoint(target: DOMRect, popup: DOMRect, placement: TooltipPlacement) {
  const vertical = placement.startsWith("top") || placement.startsWith("bottom");
  const side = placement.startsWith("top")
    ? "top"
    : placement.startsWith("bottom")
      ? "bottom"
      : placement.startsWith("left")
        ? "left"
        : "right";

  if (vertical) {
    const left = placement.endsWith("Left")
      ? target.left
      : placement.endsWith("Right")
        ? target.right - popup.width
        : target.left + (target.width - popup.width) / 2;
    const top =
      side === "top" ? target.top - popup.height - TARGET_GAP : target.bottom + TARGET_GAP;
    return { left, top };
  }

  const top = placement.endsWith("Top")
    ? target.top
    : placement.endsWith("Bottom")
      ? target.bottom - popup.height
      : target.top + (target.height - popup.height) / 2;
  const left = side === "left" ? target.left - popup.width - TARGET_GAP : target.right + TARGET_GAP;
  return { left, top };
}

function overflowsMainAxis(
  point: { left: number; top: number },
  popup: DOMRect,
  placement: TooltipPlacement,
) {
  if (placement.startsWith("top")) return point.top < VIEWPORT_GAP;
  if (placement.startsWith("bottom"))
    return point.top + popup.height > window.innerHeight - VIEWPORT_GAP;
  if (placement.startsWith("left")) return point.left < VIEWPORT_GAP;
  return point.left + popup.width > window.innerWidth - VIEWPORT_GAP;
}

function flipPlacement(placement: TooltipPlacement): TooltipPlacement {
  if (placement.startsWith("top")) return placement.replace("top", "bottom") as TooltipPlacement;
  if (placement.startsWith("bottom")) return placement.replace("bottom", "top") as TooltipPlacement;
  if (placement.startsWith("left")) return placement.replace("left", "right") as TooltipPlacement;
  return placement.replace("right", "left") as TooltipPlacement;
}

function getArrowStyle(
  target: DOMRect,
  popup: DOMRect,
  placement: TooltipPlacement,
  left: number,
  top: number,
): CSSProperties {
  const halfArrow = ARROW_SIZE / 2;
  const targetCenterX = target.left + target.width / 2 - left - halfArrow;
  const targetCenterY = target.top + target.height / 2 - top - halfArrow;
  const horizontalArrowPosition = placement.endsWith("Left")
    ? EDGE_ARROW_CENTER - halfArrow
    : placement.endsWith("Right")
      ? popup.width - EDGE_ARROW_CENTER - halfArrow
      : targetCenterX;
  const verticalArrowPosition = placement.endsWith("Top")
    ? EDGE_ARROW_CENTER - halfArrow
    : placement.endsWith("Bottom")
      ? popup.height - EDGE_ARROW_CENTER - halfArrow
      : targetCenterY;

  if (placement.startsWith("top")) {
    return {
      bottom: -halfArrow,
      left: clamp(horizontalArrowPosition, ARROW_SIZE, popup.width - ARROW_SIZE * 2),
    };
  }
  if (placement.startsWith("bottom")) {
    return {
      top: -halfArrow,
      left: clamp(horizontalArrowPosition, ARROW_SIZE, popup.width - ARROW_SIZE * 2),
    };
  }
  if (placement.startsWith("left")) {
    return {
      right: -halfArrow,
      top: clamp(verticalArrowPosition, ARROW_SIZE, popup.height - ARROW_SIZE * 2),
    };
  }
  return {
    left: -halfArrow,
    top: clamp(verticalArrowPosition, ARROW_SIZE, popup.height - ARROW_SIZE * 2),
  };
}

function getTextColor(color: string) {
  const hex = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (!hex) return "#ffffff";
  const normalized = hex.length === 3 ? [...hex].map((value) => value + value).join("") : hex;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114 > 160 ? "#111111" : "#ffffff";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
