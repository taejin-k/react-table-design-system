import { forwardRef, type LabelHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "children">, VariantProps<typeof labelVariants> {
  children: ReactNode;
  /** true면 라벨 뒤에 빨간 * 표시를 붙인다. */
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ size = "md", required = false, className, children, ...rest }, ref) => {
  return (
    <label ref={ref} className={twMerge(labelVariants({ size }), className)} {...rest}>
      {children}
      {required && <span aria-hidden="true" className="text-[#fe5150]">*</span>}
    </label>
  );
});

Label.displayName = "Label";

const labelVariants = cva("inline-flex items-start gap-[2px] pl-[4px] font-pretendard whitespace-nowrap text-black", {
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
});
