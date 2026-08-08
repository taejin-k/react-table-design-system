import { cloneElement, forwardRef, isValidElement, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { ButtonProps } from "./Button.types";

/** null/undefined/빈 배열이면 false. 배열이 아니면 일반 truthy 체크. */
function hasContent(node: ReactNode): boolean {
  return Array.isArray(node) ? node.length > 0 : Boolean(node);
}

/** prefixIcon/suffixIcon으로 내려온 엘리먼트에 onClick이 붙어있어도 무시하도록 제거한다. */
function stripOnClick(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(stripOnClick);
  if (isValidElement<{ onClick?: unknown }>(node)) return cloneElement(node, { onClick: undefined });
  return node;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      htmlType = "button",
      type = "primary",
      size = "md",
      iconOnly = false,
      shadow = false,
      fullWidth = false,
      prefixIcon: rawPrefixIcon,
      suffixIcon: rawSuffixIcon,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const prefixIcon = stripOnClick(rawPrefixIcon);
    const suffixIcon = stripOnClick(rawSuffixIcon);
    const hasIcon = hasContent(prefixIcon) || hasContent(suffixIcon);
    const effectiveIconOnly = iconOnly && hasIcon;
    const icon = effectiveIconOnly ? (hasContent(prefixIcon) ? prefixIcon : suffixIcon) : prefixIcon;

    return (
      <button
        ref={ref}
        type={htmlType}
        className={twMerge(buttonVariants({ type, size, iconOnly: effectiveIconOnly, shadow, fullWidth }), className)}
        {...rest}>
        {icon}
        {!effectiveIconOnly && children}
        {!effectiveIconOnly && suffixIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded font-pretendard font-medium whitespace-nowrap transition-[color,background-color,box-shadow] cursor-pointer disabled:cursor-not-allowed",
  {
    variants: {
      type: {
        primary:
          "ring-1 ring-inset ring-transparent bg-[#0062df] text-white hover:bg-[#227cef] disabled:ring-[#dddddd] disabled:bg-[#f5f5f5] disabled:text-[#999999]",
        secondary:
          "ring-1 ring-inset ring-[#999999] bg-white text-[#111111] hover:bg-[#f5f5f5] disabled:ring-[#dddddd] disabled:bg-[#f5f5f5] disabled:text-[#999999]",
        tertiary:
          "ring-1 ring-inset ring-transparent bg-[#f5f5f5] text-[#111111] hover:ring-[#999999] disabled:ring-[#dddddd] disabled:text-[#999999]",
        dark: "ring-1 ring-inset ring-transparent bg-[#111111] text-white hover:bg-[#303030] disabled:ring-[#dddddd] disabled:bg-[#f5f5f5] disabled:text-[#999999]",
        ghost:
          "ring-1 ring-inset ring-transparent bg-white text-[#111111] hover:ring-[#999999] disabled:ring-[#dddddd] disabled:bg-[#f5f5f5] disabled:text-[#999999]",
      },
      size: {
        lg: "h-10 px-3.5 text-base",
        md: "h-[30px] px-2.5 text-sm",
        sm: "h-5 px-1.5 text-xs",
      },
      iconOnly: {
        true: "",
        false: "",
      },
      shadow: {
        true: "shadow-[0px_2px_4px_0px_rgba(0,0,0,0.16)]",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "lg", className: "w-10 px-0" },
      { iconOnly: true, size: "md", className: "w-[30px] px-0" },
      { iconOnly: true, size: "sm", className: "w-5 px-0" },
    ],
    defaultVariants: {
      type: "primary",
      size: "md",
      iconOnly: false,
      shadow: false,
      fullWidth: false,
    },
  },
);
