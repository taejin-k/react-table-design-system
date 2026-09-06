import { forwardRef, type MouseEvent } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { ToggleProps } from "./Toggle.types";

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    { size = "md", checked, loading = false, onChange, onClick, disabled, className, ...rest },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        {...rest}
        type="button"
        disabled={disabled}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          if (loading) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onClick?.(event);
          if (!event.defaultPrevented) onChange?.(!checked);
        }}
        className={twMerge(trackVariants({ size, checked, loading }), className)}
      >
        <span key={size} className={knobVariants({ size, checked })}>
          <span
            data-toggle-loading-icon
            className={twMerge(
              "inline-flex items-center justify-center transition-opacity duration-200 ease-out motion-reduce:transition-none",
              loading ? "opacity-100" : "opacity-0",
            )}
          >
            <Icon
              color={checked ? "primary" : "gray"}
              icon="loading"
              size={loadingIconSizes[size]}
            />
          </span>
        </span>
      </button>
    );
  },
);

Toggle.displayName = "Toggle";

const loadingIconSizes = {
  lg: 20,
  md: 16,
  sm: 14,
} as const;

const trackVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-[background-color,opacity] duration-200 ease-out outline-none disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
  {
    variants: {
      size: {
        lg: "h-[30px]",
        md: "h-[24px]",
        sm: "h-[20px]",
      },
      checked: {
        true: "bg-primary",
        false: "bg-border",
      },
      loading: {
        true: "cursor-default opacity-70",
        false: "",
      },
    },
    compoundVariants: [
      { size: "lg", className: "w-[50px]" },
      { size: "md", className: "w-[40px]" },
      { size: "sm", className: "w-[32px]" },
    ],
    defaultVariants: {
      size: "md",
      checked: false,
      loading: false,
    },
  },
);

const knobVariants = cva(
  "absolute top-[3px] inline-flex items-center justify-center rounded-full bg-white transition-[left] duration-200 ease-out motion-reduce:transition-none",
  {
    variants: {
      size: {
        lg: "size-[24px]",
        md: "size-[18px]",
        sm: "size-[14px]",
      },
      checked: {
        true: "",
        false: "left-[3px]",
      },
    },
    compoundVariants: [
      { checked: true, size: "lg", className: "left-[calc(100%-27px)]" },
      { checked: true, size: "md", className: "left-[calc(100%-21px)]" },
      { checked: true, size: "sm", className: "left-[calc(100%-17px)]" },
    ],
    defaultVariants: {
      size: "md",
      checked: false,
    },
  },
);
