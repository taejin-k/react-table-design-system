import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { LabelProps } from "./Label.types";

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ label, size = "md", required = false, className, ...rest }, ref) => {
    return (
      <label ref={ref} className={twMerge(labelVariants({ size }), className)} {...rest}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-[#fe5150]">
            *
          </span>
        )}
      </label>
    );
  },
);

Label.displayName = "Label";

const labelVariants = cva(
  "inline-flex items-start gap-[2px] pl-[4px] font-pretendard whitespace-nowrap text-black",
  {
    variants: {
      size: {
        lg: "text-[14px]",
        md: "text-[12px]",
        sm: "text-[10px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);
