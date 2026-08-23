import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Tooltip } from "../Tooltip";
import type { SegmentedProps } from "./Segmented.types";

export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  fullWidth = false,
  disabled = false,
  vertical = false,
  size = "md",
  className,
  ...rest
}: SegmentedProps) {
  const normalized = options;
  const [innerValue, setInnerValue] = useState<string | number | undefined>(
    defaultValue ?? normalized[0]?.value,
  );
  const selectedValue = value ?? innerValue;
  const direction = vertical ? "vertical" : "horizontal";
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string | number, HTMLLabelElement>());
  const hasMeasuredThumb = useRef(false);
  const canAnimateThumb = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const [thumb, setThumb] = useState<{
    animate: boolean;
    height: number;
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const updateThumb = useCallback(() => {
    const selectedItem =
      selectedValue === undefined ? undefined : itemRefs.current.get(selectedValue);

    if (!selectedItem) return;

    setThumb({
      animate: hasMeasuredThumb.current && canAnimateThumb.current,
      height: selectedItem.offsetHeight,
      left: selectedItem.offsetLeft,
      top: selectedItem.offsetTop,
      width: selectedItem.offsetWidth,
    });
    hasMeasuredThumb.current = true;

    if (!canAnimateThumb.current && animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(() => {
        canAnimateThumb.current = true;
        animationFrameRef.current = null;
      });
    }
  }, [selectedValue]);

  useLayoutEffect(() => {
    updateThumb();

    const root = rootRef.current;
    const observer =
      root && typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateThumb) : null;
    if (root && observer) {
      observer.observe(root);
      itemRefs.current.forEach((item) => observer.observe(item));
    }

    return () => {
      observer?.disconnect();
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [normalized, direction, updateThumb]);

  return (
    <div
      ref={rootRef}
      className={twMerge(segmentedVariants({ fullWidth, direction }), className)}
      {...rest}
    >
      {selectedValue !== undefined && thumb ? (
        <span
          data-segmented-thumb=""
          className={twMerge(
            thumbClassName,
            thumb.animate
              ? "transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none"
              : "transition-none",
          )}
          style={{
            height: thumb.height,
            transform: `translate3d(${thumb.left}px, ${thumb.top}px, 0)`,
            width: thumb.width,
          }}
        />
      ) : null}
      {normalized.map((option) => {
        const selected = option.value === selectedValue;
        const itemDisabled = disabled || option.disabled;
        const item = (
          <label
            key={option.value}
            ref={(node) => {
              if (node) itemRefs.current.set(option.value, node);
              else itemRefs.current.delete(option.value);
            }}
            className={twMerge(
              itemVariants({ size }),
              fullWidth && direction === "horizontal" ? "flex-1" : "flex-none",
              itemDisabled
                ? "cursor-not-allowed text-[#bbb]"
                : selected
                  ? "cursor-pointer font-medium text-[#111]"
                  : "cursor-pointer text-[#666] hover:text-[#111]",
              option.className,
            )}
          >
            <input
              type="radio"
              className="sr-only"
              value={option.value}
              checked={selected}
              disabled={itemDisabled}
              onChange={() => {
                if (value === undefined) setInnerValue(option.value);
                onChange?.(option.value);
              }}
            />
            {option.icon ? <span className="inline-flex shrink-0">{option.icon}</span> : null}
            {option.label !== undefined ? (
              <span className="min-w-0 truncate">{option.label}</span>
            ) : null}
          </label>
        );

        if (!option.tooltip) return item;
        return (
          <Tooltip
            key={option.value}
            {...(typeof option.tooltip === "string" ? { title: option.tooltip } : option.tooltip)}
          >
            {item}
          </Tooltip>
        );
      })}
    </div>
  );
}

const segmentedVariants = cva(
  "relative isolate inline-flex w-fit gap-0.5 rounded-lg bg-[#f5f5f5] p-0.5 font-pretendard",
  {
    variants: {
      fullWidth: { true: "flex w-full", false: "" },
      direction: { horizontal: "flex-row", vertical: "flex-col" },
    },
  },
);

const itemVariants = cva(
  "relative z-10 inline-flex min-w-0 items-center justify-center gap-1 rounded-md whitespace-nowrap transition-[color,font-weight] duration-200 ease-out motion-reduce:transition-none",
  {
    variants: {
      size: {
        lg: "h-9 px-4 text-base",
        md: "h-[26px] px-3 text-sm",
        sm: "h-4 px-2 text-xs",
      },
    },
  },
);

const thumbClassName =
  "pointer-events-none absolute top-0 left-0 z-0 rounded-md bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] will-change-transform";
