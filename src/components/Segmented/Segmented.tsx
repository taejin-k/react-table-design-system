import { useMemo, useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Tooltip } from "../Tooltip";
import type {
  SegmentedItemType,
  SegmentedOption,
  SegmentedProps,
  SegmentedValue,
} from "./Segmented.types";

function normalizeOption(option: SegmentedOption): SegmentedItemType {
  return typeof option === "object" ? option : { label: String(option), value: option };
}

export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  block = false,
  disabled = false,
  orientation,
  vertical = false,
  size = "medium",
  shape = "default",
  name,
  className,
  classNames,
  styles,
  ...rest
}: SegmentedProps) {
  const normalized = useMemo(() => options.map(normalizeOption), [options]);
  const [innerValue, setInnerValue] = useState<SegmentedValue | undefined>(
    defaultValue ?? normalized[0]?.value,
  );
  const selectedValue = value ?? innerValue;
  const direction = orientation ?? (vertical ? "vertical" : "horizontal");

  return (
    <div
      className={twMerge(
        segmentedVariants({ block, direction, shape }),
        classNames?.root,
        className,
      )}
      style={styles?.root}
      {...rest}
    >
      {normalized.map((option) => {
        const selected = option.value === selectedValue;
        const item = (
          <label
            key={option.value}
            className={twMerge(
              itemVariants({ size, selected, shape }),
              disabled || option.disabled ? "cursor-not-allowed text-[#bbb]" : "cursor-pointer",
              option.className,
              classNames?.item,
            )}
            style={styles?.item}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={option.value}
              checked={selected}
              disabled={disabled || option.disabled}
              onChange={() => {
                if (value === undefined) setInnerValue(option.value);
                onChange?.(option.value);
              }}
            />
            {option.icon ? <span className="inline-flex shrink-0">{option.icon}</span> : null}
            {option.label !== undefined ? (
              <span
                className={twMerge("min-w-0 truncate", classNames?.label)}
                style={styles?.label}
              >
                {option.label}
              </span>
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

const segmentedVariants = cva("inline-flex gap-0.5 bg-[#f5f5f5] p-0.5 font-pretendard", {
  variants: {
    block: { true: "flex w-full", false: "" },
    direction: { horizontal: "flex-row", vertical: "flex-col" },
    shape: { default: "rounded-lg", round: "rounded-full" },
  },
});

const itemVariants = cva(
  "inline-flex min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap transition-[color,background-color,box-shadow]",
  {
    variants: {
      size: {
        large: "h-10 px-4 text-base",
        medium: "h-8 px-3 text-sm",
        small: "h-6 px-2 text-xs",
      },
      selected: {
        true: "bg-white font-medium text-[#111] shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
        false: "text-[#666] hover:text-[#111]",
      },
      shape: { default: "rounded-md", round: "rounded-full" },
    },
  },
);
