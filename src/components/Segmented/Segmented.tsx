import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Tooltip } from "../Tooltip";
import type { SegmentedProps, SegmentedValue } from "./Segmented.types";

export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  fullWidth = false,
  disabled = false,
  vertical = false,
  size = "md",
  shape = "default",
  className,
  ...rest
}: SegmentedProps) {
  const normalized = options;
  const [innerValue, setInnerValue] = useState<SegmentedValue | undefined>(
    defaultValue ?? normalized[0]?.value,
  );
  const selectedValue = value ?? innerValue;
  const direction = vertical ? "vertical" : "horizontal";
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<SegmentedValue, HTMLLabelElement>());
  const hasMeasuredThumb = useRef(false);
  const [thumb, setThumb] = useState({
    animate: false,
    height: 0,
    left: 0,
    top: 0,
    width: 0,
  });

  const updateThumb = useCallback(() => {
    const selectedItem =
      selectedValue === undefined ? undefined : itemRefs.current.get(selectedValue);

    if (!selectedItem) return;

    setThumb({
      animate: hasMeasuredThumb.current,
      height: selectedItem.offsetHeight,
      left: selectedItem.offsetLeft,
      top: selectedItem.offsetTop,
      width: selectedItem.offsetWidth,
    });
    hasMeasuredThumb.current = true;
  }, [selectedValue]);

  useLayoutEffect(() => {
    updateThumb();

    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateThumb);
    observer.observe(root);
    itemRefs.current.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [normalized, direction, updateThumb]);

  return (
    <div
      ref={rootRef}
      className={twMerge(segmentedVariants({ fullWidth, direction, shape }), className)}
      {...rest}
    >
      {selectedValue !== undefined ? (
        <span
          aria-hidden
          data-segmented-thumb=""
          className={twMerge(
            thumbVariants({ shape }),
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
              itemVariants({ size, shape }),
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
  "relative isolate inline-flex w-fit gap-0.5 bg-[#f5f5f5] p-0.5 font-pretendard",
  {
    variants: {
      fullWidth: { true: "flex w-full", false: "" },
      direction: { horizontal: "flex-row", vertical: "flex-col" },
      shape: { default: "rounded-lg", round: "rounded-full" },
    },
  },
);

const itemVariants = cva(
  "relative z-10 inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap transition-[color,font-weight] duration-200 ease-out motion-reduce:transition-none",
  {
    variants: {
      size: {
        lg: "h-9 px-4 text-base",
        md: "h-[26px] px-3 text-sm",
        sm: "h-4 px-2 text-xs",
      },
      shape: { default: "rounded-md", round: "rounded-full" },
    },
  },
);

const thumbVariants = cva(
  "pointer-events-none absolute top-0 left-0 z-0 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] will-change-transform",
  {
    variants: {
      shape: { default: "rounded-md", round: "rounded-full" },
    },
  },
);
