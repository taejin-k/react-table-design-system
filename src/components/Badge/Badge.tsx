import { twMerge } from "tailwind-merge";
import type { BadgeProps, BadgeStatusType } from "./Badge.types";

const statusColors: Record<BadgeStatusType, string> = {
  success: "#52c41a",
  processing: "#0062df",
  default: "#bfbfbf",
  error: "#ff4d4f",
  warning: "#faad14",
};

export function Badge({ status, process = false, text, color, className, style }: BadgeProps) {
  const statusColor = color ?? statusColors[status];

  return (
    <span
      className={twMerge(
        "inline-flex items-center gap-2 font-pretendard text-sm text-[#666]",
        className,
      )}
      style={style}
    >
      <span
        className={twMerge(
          "relative size-1.5 shrink-0 rounded-full",
          process &&
            "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-current motion-reduce:after:animate-none",
        )}
        style={{ backgroundColor: statusColor, color: statusColor }}
      />
      {text !== undefined && text !== null ? <span>{text}</span> : null}
    </span>
  );
}
