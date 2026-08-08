import { forwardRef, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { ChipProps } from "./Chip.types";

/** null/undefined/빈 배열이면 false. 배열이 아니면 일반 truthy 체크. */
function hasContent(node: ReactNode): boolean {
  return Array.isArray(node) ? node.length > 0 : Boolean(node);
}

/** 아이콘을 Chip의 텍스트와 같은 간격으로 배치하는 16x16 소켓. */
const IconSocket = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex size-4 shrink-0 items-center justify-center">{children}</span>
);

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  (
    { color = "green", variant = "filled", prefixIcon, suffixIcon, className, children, ...rest },
    ref,
  ) => {
    return (
      <span ref={ref} className={twMerge(chipVariants({ color, variant }), className)} {...rest}>
        {hasContent(prefixIcon) ? <IconSocket>{prefixIcon}</IconSocket> : null}
        {children}
        {hasContent(suffixIcon) ? <IconSocket>{suffixIcon}</IconSocket> : null}
      </span>
    );
  },
);

Chip.displayName = "Chip";

const chipVariants = cva(
  "inline-flex h-[22px] items-center gap-1 rounded px-1 py-0.5 font-pretendard text-[11px] leading-[1.6] font-medium whitespace-nowrap",
  {
    variants: {
      color: {
        green: "",
        navy: "",
        red: "",
        grey: "",
        black: "",
        purple: "",
        blue: "",
      },
      variant: {
        filled: "",
        "soft-filled": "",
        outlined: "border border-solid bg-white",
      },
    },
    compoundVariants: [
      { color: "green", variant: "filled", className: "bg-[#1c8616] text-white" },
      { color: "green", variant: "soft-filled", className: "bg-[#eff5ee] text-[#1c8616]" },
      { color: "green", variant: "outlined", className: "border-[#1c8616] text-[#1c8616]" },
      { color: "navy", variant: "filled", className: "bg-[#2149a5] text-white" },
      { color: "navy", variant: "soft-filled", className: "bg-[#eef0f8] text-[#2149a5]" },
      { color: "navy", variant: "outlined", className: "border-[#2149a5] text-[#2149a5]" },
      { color: "red", variant: "filled", className: "bg-[#d92626] text-white" },
      { color: "red", variant: "soft-filled", className: "bg-[#faefef] text-[#d92626]" },
      { color: "red", variant: "outlined", className: "border-[#d92626] text-[#d92626]" },
      { color: "grey", variant: "filled", className: "bg-[#999999] text-white" },
      { color: "grey", variant: "soft-filled", className: "bg-[#f2f2f2] text-[#999999]" },
      { color: "grey", variant: "outlined", className: "border-[#999999] text-[#999999]" },
      { color: "black", variant: "filled", className: "bg-[#111111] text-white" },
      { color: "black", variant: "soft-filled", className: "bg-[#f5f5f5] text-[#111111]" },
      { color: "black", variant: "outlined", className: "border-[#111111] text-[#111111]" },
      { color: "purple", variant: "filled", className: "bg-[#4f19c4] text-white" },
      { color: "purple", variant: "soft-filled", className: "bg-[#f5f2fd] text-[#4f19c4]" },
      { color: "purple", variant: "outlined", className: "border-[#4f19c4] text-[#4f19c4]" },
      { color: "blue", variant: "filled", className: "bg-[#1e59a3] text-white" },
      { color: "blue", variant: "soft-filled", className: "bg-[#ebf4ff] text-[#1e59a3]" },
      { color: "blue", variant: "outlined", className: "border-[#1e59a3] text-[#1e59a3]" },
    ],
    defaultVariants: {
      color: "green",
      variant: "filled",
    },
  },
);
