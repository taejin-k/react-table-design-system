import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type { PopoverProps } from "./Popover.types";

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
  const resolvedTitle = typeof title === "function" ? title() : title;
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

  return (
    <>
      <span
        ref={floating.triggerRef}
        className={twMerge("inline-flex min-w-0", className)}
        {...floating.triggerProps}
      >
        {children}
      </span>
      {floating.isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={floating.popupRef}
              data-popover
              data-placement={floating.position?.placement ?? placement}
              className="fixed max-w-80 min-w-[177px] font-pretendard text-sm leading-[22px] text-[#111]"
              style={{
                left: floating.position?.left ?? 0,
                top: floating.position?.top ?? 0,
                zIndex,
                visibility: floating.position ? "visible" : "hidden",
              }}
              {...floating.popupProps}
            >
              <div
                className="relative rounded-lg px-3 py-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]"
                style={{ backgroundColor: color, color: getTextColor(color) }}
              >
                {resolvedTitle !== null && resolvedTitle !== undefined && resolvedTitle !== "" ? (
                  <div className="mb-1 font-semibold">{resolvedTitle}</div>
                ) : null}
                <div>{resolvedContent}</div>
              </div>
              {arrow ? (
                <span
                  data-popover-arrow
                  className="absolute size-2 rotate-45"
                  style={{ backgroundColor: color, ...floating.position?.arrowStyle }}
                />
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
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
