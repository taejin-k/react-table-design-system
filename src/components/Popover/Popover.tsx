import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type { PopoverPlacementType, PopoverProps } from "./Popover.types";

const MOTION_DURATION = 100;

export function Popover({
  children,
  title,
  content,
  placement = "top",
  trigger = "hover",
  arrow = true,
  color = "#ffffff",
  open,
  defaultOpen = false,
  autoAdjustOverflow = true,
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  zIndex = 1030,
  className,
  onOpenChange,
}: PopoverProps) {
  const resolvedContent = typeof content === "function" ? content() : content;
  const enabled = resolvedContent !== null && resolvedContent !== undefined;
  const floating = useFloatingLayer({
    enabled,
    placement,
    trigger,
    open,
    defaultOpen,
    autoAdjustOverflow,
    mouseEnterDelay,
    mouseLeaveDelay,
    onOpenChange: (nextOpen) => onOpenChange?.(nextOpen),
  });
  const motionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPositionRef = useRef(floating.position);
  const [popupMounted, setPopupMounted] = useState(floating.isOpen);
  const [motionVisible, setMotionVisible] = useState(false);

  if (floating.position) lastPositionRef.current = floating.position;
  const renderPosition = floating.position ?? lastPositionRef.current;

  useEffect(() => {
    if (motionTimerRef.current) clearTimeout(motionTimerRef.current);

    if (floating.isOpen) {
      setPopupMounted(true);
      return;
    }

    setMotionVisible(false);
    motionTimerRef.current = setTimeout(() => {
      setPopupMounted(false);
      lastPositionRef.current = null;
    }, MOTION_DURATION);

    return () => {
      if (motionTimerRef.current) clearTimeout(motionTimerRef.current);
    };
  }, [floating.isOpen]);

  useEffect(() => {
    if (!floating.isOpen || !popupMounted) return;
    const frame = requestAnimationFrame(() => setMotionVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [floating.isOpen, popupMounted]);

  useLayoutEffect(() => {
    if (floating.isOpen && popupMounted) floating.updatePosition();
  }, [floating.isOpen, floating.updatePosition, popupMounted]);

  return (
    <>
      <span
        ref={floating.triggerRef}
        className={twMerge("inline-flex min-w-0", className)}
        {...floating.triggerProps}
      >
        {children}
      </span>
      {popupMounted && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={floating.popupRef}
              data-popover
              data-placement={renderPosition?.placement ?? placement}
              className="fixed max-w-80 min-w-[177px] font-pretendard text-sm leading-[22px] text-[#111]"
              style={{
                left: renderPosition?.left ?? 0,
                top: renderPosition?.top ?? 0,
                zIndex,
                visibility: renderPosition ? "visible" : "hidden",
              }}
              {...floating.popupProps}
            >
              <div
                data-popover-motion
                className={twMerge(
                  "relative",
                  motionVisible && renderPosition
                    ? "wizard-zoom-big-fast-enter"
                    : floating.isOpen
                      ? "scale-[0.8] opacity-0"
                      : "wizard-zoom-big-fast-leave",
                )}
                style={{
                  transformOrigin: getTransformOrigin(renderPosition?.placement ?? placement),
                }}
              >
                <div
                  className="relative rounded-lg px-3 py-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]"
                  style={{ backgroundColor: color, color: getTextColor(color) }}
                >
                  {title !== null && title !== undefined && title !== "" ? (
                    <div className="mb-1 font-semibold whitespace-pre-line">{title}</div>
                  ) : null}
                  <div className="whitespace-pre-line">{resolvedContent}</div>
                </div>
                {arrow ? (
                  <span
                    data-popover-arrow
                    className="absolute size-2 rotate-45"
                    style={{ backgroundColor: color, ...renderPosition?.arrowStyle }}
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

function getTransformOrigin(placement: PopoverPlacementType) {
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
  if (!hex) return "#111111";
  const normalized = hex.length === 3 ? [...hex].map((value) => value + value).join("") : hex;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114 > 160 ? "#111111" : "#ffffff";
}
