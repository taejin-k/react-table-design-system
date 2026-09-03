import { forwardRef, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { TagProps } from "./Tag.types";

/** null/undefined/빈 배열이면 false. 배열이 아니면 일반 truthy 체크. */
function hasContent(node: ReactNode): boolean {
  return Array.isArray(node) ? node.length > 0 : Boolean(node);
}

/** 아이콘을 Tag의 텍스트와 같은 간격으로 배치하는 16x16 소켓. */
const IconSocket = ({ children }: { children: ReactNode }) => (
  <span data-tag-icon className="inline-flex size-4 shrink-0 items-center justify-center">
    {children}
  </span>
);

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    { color = "black", variant = "filled", prefixIcon, suffixIcon, className, children, ...rest },
    ref,
  ) => {
    return (
      <span ref={ref} className={twMerge(tagVariants({ color, variant }), className)} {...rest}>
        {hasContent(prefixIcon) ? <IconSocket>{prefixIcon}</IconSocket> : null}
        {typeof children === "string" || typeof children === "number" ? (
          <span className="whitespace-pre-line">{children}</span>
        ) : (
          children
        )}
        {hasContent(suffixIcon) ? <IconSocket>{suffixIcon}</IconSocket> : null}
      </span>
    );
  },
);

Tag.displayName = "Tag";

const tagVariants = cva(
  "inline-flex min-h-[22px] items-center gap-1 rounded px-[6px] py-0.5 font-pretendard text-[11px] leading-[1.6] font-medium",
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
        outlined: "bg-white",
        solid: "",
        "soft-outlined": "",
      },
    },
    compoundVariants: [
      { color: "green", variant: "filled", className: "bg-[#eff5ee] text-[#52c41a]" },
      {
        color: "green",
        variant: "outlined",
        className: "text-[#52c41a] shadow-[inset_0_0_0_1px_#52c41a]",
      },
      { color: "green", variant: "solid", className: "bg-[#52c41a] text-white" },
      {
        color: "green",
        variant: "soft-outlined",
        className: "bg-[#eff5ee] text-[#52c41a] shadow-[inset_0_0_0_1px_#b7d9b4]",
      },
      { color: "navy", variant: "filled", className: "bg-[#eef0f8] text-[#023f97]" },
      {
        color: "navy",
        variant: "outlined",
        className: "text-[#023f97] shadow-[inset_0_0_0_1px_#023f97]",
      },
      { color: "navy", variant: "solid", className: "bg-[#023f97] text-white" },
      {
        color: "navy",
        variant: "soft-outlined",
        className: "bg-[#eef0f8] text-[#023f97] shadow-[inset_0_0_0_1px_#bdc9e7]",
      },
      { color: "red", variant: "filled", className: "bg-[#faefef] text-[#ff4d4f]" },
      {
        color: "red",
        variant: "outlined",
        className: "text-[#ff4d4f] shadow-[inset_0_0_0_1px_#ff4d4f]",
      },
      { color: "red", variant: "solid", className: "bg-[#ff4d4f] text-white" },
      {
        color: "red",
        variant: "soft-outlined",
        className: "bg-[#faefef] text-[#ff4d4f] shadow-[inset_0_0_0_1px_#efbcbc]",
      },
      { color: "grey", variant: "filled", className: "bg-[#f2f2f2] text-[#777777]" },
      {
        color: "grey",
        variant: "outlined",
        className: "text-[#999999] shadow-[inset_0_0_0_1px_#999999]",
      },
      { color: "grey", variant: "solid", className: "bg-[#777777] text-white" },
      {
        color: "grey",
        variant: "soft-outlined",
        className: "bg-[#f2f2f2] text-[#777777] shadow-[inset_0_0_0_1px_#d5d5d5]",
      },
      { color: "black", variant: "filled", className: "bg-[#f5f5f5] text-[#111111]" },
      {
        color: "black",
        variant: "outlined",
        className: "text-[#111111] shadow-[inset_0_0_0_1px_#111111]",
      },
      { color: "black", variant: "solid", className: "bg-[#111111] text-white" },
      {
        color: "black",
        variant: "soft-outlined",
        className: "bg-[#f5f5f5] text-[#111111] shadow-[inset_0_0_0_1px_#d0d0d0]",
      },
      { color: "purple", variant: "filled", className: "bg-[#f5f2fd] text-[#4f19c4]" },
      {
        color: "purple",
        variant: "outlined",
        className: "text-[#4f19c4] shadow-[inset_0_0_0_1px_#4f19c4]",
      },
      { color: "purple", variant: "solid", className: "bg-[#4f19c4] text-white" },
      {
        color: "purple",
        variant: "soft-outlined",
        className: "bg-[#f5f2fd] text-[#4f19c4] shadow-[inset_0_0_0_1px_#d7c8f4]",
      },
      { color: "blue", variant: "filled", className: "bg-[#ebf4ff] text-[#0062df]" },
      {
        color: "blue",
        variant: "outlined",
        className: "text-[#0062df] shadow-[inset_0_0_0_1px_#0062df]",
      },
      { color: "blue", variant: "solid", className: "bg-[#0062df] text-white" },
      {
        color: "blue",
        variant: "soft-outlined",
        className: "bg-[#ebf4ff] text-[#0062df] shadow-[inset_0_0_0_1px_#bdd8f7]",
      },
    ],
    defaultVariants: {
      color: "black",
      variant: "filled",
    },
  },
);
