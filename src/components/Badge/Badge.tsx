import { twMerge } from "tailwind-merge";
import type { CSSProperties } from "react";
import { resolveColorToken, resolveReadableTextColor } from "../../color-tokens";
import { Tooltip } from "../Tooltip/Tooltip";
import type { BadgeProps } from "./Badge.types";
import { useBadgeContentOverflow } from "./use-badge-content-overflow";

export function Badge({
  color,
  process = false,
  label,
  children,
  content,
  offset = [0, 0],
  className,
  style,
}: BadgeProps) {
  const badgeColor = resolveColorToken(color);
  const hasTarget = children !== undefined && children !== null && typeof children !== "boolean";
  const hasContent = content !== undefined && content !== null && content !== "";
  const { indicatorRef, contentRef, truncated } = useBadgeContentOverflow(hasContent);
  const x = Number.isFinite(offset[0]) ? offset[0] : 0;
  const y = Number.isFinite(offset[1]) ? offset[1] : 0;
  const indicator = (
    <span
      ref={indicatorRef}
      data-badge-indicator
      className={twMerge(
        "relative shrink-0 rounded-full",
        hasContent
          ? "inline-flex h-5 w-max items-center justify-center text-xs leading-none font-medium"
          : "size-1.5",
        hasTarget ? "pointer-events-none absolute z-10 shadow-xs" : !hasContent && "mt-[7px]",
        process &&
          "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-[var(--badge-color)] motion-reduce:after:animate-none",
      )}
      style={
        {
          backgroundColor: badgeColor,
          color: hasContent ? resolveReadableTextColor(badgeColor) : badgeColor,
          "--badge-color": badgeColor,
          ...(hasContent
            ? {
                maxWidth: "min(160px, var(--badge-available-width, calc(100vw - 16px)))",
                minWidth: "min(1.25rem, var(--badge-available-width, 1.25rem))",
                paddingInline: "min(0.375rem, calc(var(--badge-available-width, 160px) / 2))",
              }
            : undefined),
          ...(hasTarget ? { top: 0, left: "100%" } : undefined),
          transform: hasTarget
            ? `translate(${hasContent ? "-0.625rem" : "-0.1875rem"}, -50%) translate(${x}px, ${y}px)`
            : undefined,
        } as CSSProperties
      }
    >
      {hasContent ? (
        <Tooltip
          title={truncated ? content : undefined}
          className={twMerge("relative z-[1]", truncated && "pointer-events-auto")}
        >
          <span ref={contentRef} data-badge-content className="min-w-0 truncate">
            {content}
          </span>
        </Tooltip>
      ) : null}
    </span>
  );

  return (
    <span
      className={twMerge(
        "inline-flex max-w-full min-w-0 items-start gap-2 font-pretendard text-sm text-dark-gray",
        hasTarget && "relative align-middle",
        className,
      )}
      style={style}
    >
      {hasTarget ? (
        <span className="relative inline-flex max-w-full min-w-0 shrink-0 align-middle">
          {children}
          {indicator}
        </span>
      ) : (
        indicator
      )}
      {label !== undefined && label !== null ? (
        <span className="min-w-0 overflow-hidden [overflow-wrap:anywhere] break-all whitespace-pre-line">
          {label}
        </span>
      ) : null}
    </span>
  );
}
