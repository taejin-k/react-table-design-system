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
    { color = "dark", variant = "filled", prefixIcon, suffixIcon, className, children, ...rest },
    ref,
  ) => {
    return (
      <span ref={ref} className={twMerge(tagVariants({ color, variant }), className)} {...rest}>
        {hasContent(prefixIcon) ? <IconSocket>{prefixIcon}</IconSocket> : null}
        {typeof children === "string" || typeof children === "number" ? (
          <span className="min-w-0 flex-1 truncate">{children}</span>
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
  "inline-flex min-h-[22px] min-w-0 max-w-full items-center gap-1 overflow-hidden rounded px-[6px] py-0.5 font-pretendard text-[11px] leading-[1.6] font-medium transition-[color,background-color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
  {
    variants: {
      color: {
        success: "",
        navy: "",
        danger: "",
        gray: "",
        dark: "",
        purple: "",
        primary: "",
      },
      variant: {
        filled: "",
        outlined: "bg-white",
        solid: "",
        "soft-outlined": "",
      },
    },
    compoundVariants: [
      { color: "success", variant: "filled", className: "bg-[#eff5ee] text-success" },
      {
        color: "success",
        variant: "outlined",
        className: "text-success ring-1 ring-success ring-inset",
      },
      { color: "success", variant: "solid", className: "bg-success text-white" },
      {
        color: "success",
        variant: "soft-outlined",
        className: "bg-[#eff5ee] text-success shadow-[inset_0_0_0_1px_#b7d9b4]",
      },
      { color: "navy", variant: "filled", className: "bg-[#eef0f8] text-navy" },
      {
        color: "navy",
        variant: "outlined",
        className: "text-navy ring-1 ring-navy ring-inset",
      },
      { color: "navy", variant: "solid", className: "bg-navy text-white" },
      {
        color: "navy",
        variant: "soft-outlined",
        className: "bg-[#eef0f8] text-navy shadow-[inset_0_0_0_1px_#bdc9e7]",
      },
      { color: "danger", variant: "filled", className: "bg-[#faefef] text-danger" },
      {
        color: "danger",
        variant: "outlined",
        className: "text-danger ring-1 ring-danger ring-inset",
      },
      { color: "danger", variant: "solid", className: "bg-danger text-white" },
      {
        color: "danger",
        variant: "soft-outlined",
        className: "bg-[#faefef] text-danger shadow-[inset_0_0_0_1px_#efbcbc]",
      },
      { color: "gray", variant: "filled", className: "bg-hover text-gray" },
      {
        color: "gray",
        variant: "outlined",
        className: "text-gray shadow-[inset_0_0_0_1px_var(--color-gray)]",
      },
      { color: "gray", variant: "solid", className: "bg-gray text-white" },
      {
        color: "gray",
        variant: "soft-outlined",
        className: "bg-hover text-gray shadow-[inset_0_0_0_1px_#d5d5d5]",
      },
      { color: "dark", variant: "filled", className: "bg-hover text-dark" },
      {
        color: "dark",
        variant: "outlined",
        className: "text-dark ring-1 ring-dark ring-inset",
      },
      { color: "dark", variant: "solid", className: "bg-dark text-white" },
      {
        color: "dark",
        variant: "soft-outlined",
        className: "bg-hover text-dark shadow-[inset_0_0_0_1px_#d0d0d0]",
      },
      { color: "purple", variant: "filled", className: "bg-[#f5f2fd] text-purple" },
      {
        color: "purple",
        variant: "outlined",
        className: "text-purple ring-1 ring-purple ring-inset",
      },
      { color: "purple", variant: "solid", className: "bg-purple text-white" },
      {
        color: "purple",
        variant: "soft-outlined",
        className: "bg-[#f5f2fd] text-purple shadow-[inset_0_0_0_1px_#d7c8f4]",
      },
      { color: "primary", variant: "filled", className: "bg-[#ebf4ff] text-primary" },
      {
        color: "primary",
        variant: "outlined",
        className: "text-primary ring-1 ring-primary ring-inset",
      },
      { color: "primary", variant: "solid", className: "bg-primary text-white" },
      {
        color: "primary",
        variant: "soft-outlined",
        className: "bg-[#ebf4ff] text-primary shadow-[inset_0_0_0_1px_#bdd8f7]",
      },
    ],
    defaultVariants: {
      color: "dark",
      variant: "filled",
    },
  },
);
