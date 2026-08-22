import { twMerge } from "tailwind-merge";
import type { BadgeComponent, BadgeProps, BadgeRibbonProps, BadgeStatus } from "./Badge.types";

const statusColors: Record<BadgeStatus, string> = {
  success: "#52c41a",
  processing: "#0062df",
  default: "#bfbfbf",
  error: "#ff4d4f",
  warning: "#faad14",
};

function BadgeBase({
  children,
  count,
  color,
  dot = false,
  offset,
  overflowCount = 99,
  showZero = false,
  size = "medium",
  status,
  text,
  title,
  className,
  style,
  classNames,
  styles,
}: BadgeProps) {
  if (status) {
    return (
      <span
        className={twMerge(
          "inline-flex items-center gap-2 font-pretendard text-sm text-[#666]",
          className,
          classNames?.root,
        )}
        style={{ ...style, ...styles?.root }}
      >
        <span
          className={twMerge(
            "relative size-1.5 shrink-0 rounded-full",
            status === "processing" &&
              "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-current motion-reduce:after:animate-none",
            classNames?.status,
          )}
          style={{
            backgroundColor: color ?? statusColors[status],
            color: color ?? statusColors[status],
            ...styles?.status,
          }}
        />
        {text ? (
          <span className={classNames?.statusText} style={styles?.statusText}>
            {text}
          </span>
        ) : null}
      </span>
    );
  }

  const numeric = typeof count === "number" ? count : null;
  const hidden = !dot && (count === undefined || count === null || (numeric === 0 && !showZero));
  const display = dot
    ? null
    : numeric !== null && numeric > overflowCount
      ? `${overflowCount}+`
      : count;
  return (
    <span
      className={twMerge("relative inline-block font-pretendard", className, classNames?.root)}
      style={{ ...style, ...styles?.root }}
    >
      {children}
      {!hidden ? (
        <sup
          title={
            title === false || title === null
              ? undefined
              : (title ??
                (typeof display === "string" || typeof display === "number"
                  ? String(display)
                  : undefined))
          }
          className={twMerge(
            "absolute top-0 right-0 z-auto flex origin-[100%_0%] translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[#ff4d4f] text-center text-xs whitespace-nowrap text-white shadow-[0_0_0_1px_#fff] transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
            dot
              ? "size-1.5 rounded-full p-0"
              : size === "small"
                ? "h-3.5 min-w-3.5 rounded-[7px] px-1"
                : "h-5 min-w-5 rounded-[10px] px-1.5",
            classNames?.indicator,
          )}
          style={{
            backgroundColor: color,
            transform: `translate(50%, -50%) translate(${offset?.[0] ?? 0}px, ${offset?.[1] ?? 0}px)`,
            ...styles?.indicator,
          }}
        >
          {display}
        </sup>
      ) : null}
    </span>
  );
}

function Ribbon({
  children,
  color = "#0062df",
  placement = "end",
  text,
  className,
  style,
}: BadgeRibbonProps) {
  return (
    <div className="relative font-pretendard">
      {children}
      <div
        className={twMerge(
          "absolute top-2 z-[1] h-8 px-3 leading-8 text-white shadow-sm before:absolute before:top-full before:border-4 before:border-transparent",
          placement === "end"
            ? "right-[-8px] rounded-l before:right-0 before:border-t-[#003e8f] before:border-l-[#003e8f]"
            : "left-[-8px] rounded-r before:left-0 before:border-t-[#003e8f] before:border-r-[#003e8f]",
          className,
        )}
        style={{ backgroundColor: color, ...style }}
      >
        {text}
      </div>
    </div>
  );
}

export const Badge = Object.assign(BadgeBase, { Ribbon }) as BadgeComponent;
