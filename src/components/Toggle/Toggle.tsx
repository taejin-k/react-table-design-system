import { forwardRef, type MouseEvent } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { ToggleProps } from "./Toggle.types";

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ size = "md", checked, onChange, onClick, disabled, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        {...rest}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) onChange?.(!checked);
        }}
        className={twMerge(trackVariants({ size, checked }), className)}
      >
        <span className={knobVariants({ size, checked })} />
      </button>
    );
  },
);

Toggle.displayName = "Toggle";

const trackVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0062df] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
  {
    variants: {
      size: {
        lg: "h-[30px] w-[50px]",
        md: "h-[24px] w-[40px]",
        sm: "h-[20px] w-[32px]",
      },
      checked: {
        true: "bg-[#0062df]",
        false: "bg-[#ddd]",
      },
    },
    defaultVariants: {
      size: "md",
      checked: false,
    },
  },
);

const knobVariants = cva(
  "absolute top-[3px] rounded-full bg-white transition-[left] duration-200 ease-out motion-reduce:transition-none",
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
      { checked: true, size: "lg", className: "left-[23px]" },
      { checked: true, size: "md", className: "left-[19px]" },
      { checked: true, size: "sm", className: "left-[15px]" },
    ],
    defaultVariants: {
      size: "md",
      checked: false,
    },
  },
);
