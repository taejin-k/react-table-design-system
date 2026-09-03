import { cloneElement, forwardRef, isValidElement, type ReactElement } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { ButtonProps } from "./Button.types";

/** prefixIcon/suffixIcon으로 내려온 엘리먼트에 onClick이 붙어있어도 무시하도록 제거한다. */
function stripOnClick(node: ReactElement | null | undefined): ReactElement | null | undefined {
  if (node == null) return node;
  if (!isValidElement<{ onClick?: unknown }>(node)) return null;
  return cloneElement(node, { onClick: undefined });
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = "button",
      variant = "primary",
      size = "md",
      iconOnly = false,
      shadow = false,
      fullWidth = false,
      rounded = false,
      loading = false,
      prefixIcon: rawPrefixIcon,
      suffixIcon: rawSuffixIcon,
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const prefixIcon = stripOnClick(rawPrefixIcon);
    const suffixIcon = stripOnClick(rawSuffixIcon);
    const hasIcon = Boolean(prefixIcon || suffixIcon || loading);
    const effectiveIconOnly = iconOnly && hasIcon;
    const loadingIcon = (
      <span className="inline-flex size-4 shrink-0 animate-[wizard-button-loading-in_160ms_ease-out] items-center justify-center motion-reduce:animate-none">
        <Icon icon="loading" />
      </span>
    );
    const animatedLoadingSlot = (
      <span
        className={twMerge(
          "inline-flex size-4 shrink-0 items-center justify-center overflow-hidden transition-[width,margin-left,opacity,transform] duration-200 ease-out motion-reduce:transition-none",
          loading ? "ml-0 scale-100 opacity-100" : "-ml-1 w-0 scale-75 opacity-0",
        )}
      >
        <Icon icon="loading" />
      </span>
    );
    let displayedPrefixIcon = effectiveIconOnly ? prefixIcon || suffixIcon : prefixIcon;
    let displayedSuffixIcon = effectiveIconOnly ? null : suffixIcon;

    if (loading) {
      if (effectiveIconOnly) displayedPrefixIcon = loadingIcon;
      else if (suffixIcon) displayedSuffixIcon = loadingIcon;
      else if (prefixIcon) displayedPrefixIcon = loadingIcon;
      else displayedSuffixIcon = animatedLoadingSlot;
    }
    if (!loading && !effectiveIconOnly && !prefixIcon && !suffixIcon) {
      displayedSuffixIcon = animatedLoadingSlot;
    }

    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(
          buttonVariants({
            variant,
            size,
            iconOnly: effectiveIconOnly,
            shadow,
            fullWidth,
            rounded,
            loading,
          }),
          className,
        )}
        onClick={(event) => {
          if (loading) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onClick?.(event);
        }}
        {...rest}
      >
        {displayedPrefixIcon}
        {!effectiveIconOnly && children}
        {displayedSuffixIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-1 rounded font-pretendard font-medium whitespace-nowrap duration-200 ease-out disabled:cursor-not-allowed motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[#0062df] text-white ring-1 ring-transparent ring-inset hover:bg-[#227cef] disabled:bg-[#f5f5f5] disabled:text-[#999999] disabled:ring-[#dddddd]",
        danger:
          "bg-[#ff4d4f] text-white ring-1 ring-transparent ring-inset hover:bg-[#ff7875] disabled:bg-[#f5f5f5] disabled:text-[#999999] disabled:ring-[#dddddd]",
        secondary:
          "bg-white text-[#111111] ring-1 ring-[#ddd] ring-inset hover:bg-[#f5f5f5] disabled:bg-[#f5f5f5] disabled:text-[#999999] disabled:ring-[#dddddd]",
        tertiary:
          "bg-[#f5f5f5] text-[#111111] ring-1 ring-transparent ring-inset hover:ring-[#ddd] disabled:text-[#999999] disabled:ring-[#dddddd]",
        dark: "bg-[#111111] text-white ring-1 ring-transparent ring-inset hover:bg-[#303030] disabled:bg-[#f5f5f5] disabled:text-[#999999] disabled:ring-[#dddddd]",
        ghost:
          "bg-transparent text-[#111111] ring-1 ring-transparent ring-inset hover:bg-[#f5f5f5] disabled:bg-[#f5f5f5] disabled:text-[#999999] disabled:ring-[#dddddd]",
      },
      size: {
        lg: "h-10 px-3.5 text-base",
        md: "h-[30px] px-2.5 text-sm",
        sm: "h-5 px-1.5 text-xs",
      },
      iconOnly: {
        true: "transition-[opacity,color,background-color,box-shadow]",
        false: "transition-[width,opacity,color,background-color,box-shadow]",
      },
      shadow: {
        true: "",
        false: "",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      rounded: {
        true: "",
        false: "",
      },
      loading: {
        true: "cursor-default opacity-70",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "lg", className: "w-10 px-0" },
      { iconOnly: true, size: "md", className: "w-[30px] px-0" },
      { iconOnly: true, size: "sm", className: "w-5 px-0" },
      { rounded: true, size: "lg", className: "rounded-[40px]" },
      { rounded: true, size: "md", className: "rounded-[30px]" },
      { rounded: true, size: "sm", className: "rounded-[20px]" },
      {
        shadow: true,
        size: "sm",
        className: "shadow-[0_1px_2px_rgba(0,0,0,0.12)]",
      },
      {
        shadow: true,
        size: "md",
        className: "shadow-[0_2px_4px_rgba(0,0,0,0.16)]",
      },
      {
        shadow: true,
        size: "lg",
        className: "shadow-[0_3px_6px_rgba(0,0,0,0.20)]",
      },
      {
        loading: true,
        variant: "primary",
        className: "bg-[#6ea0fa] opacity-100 hover:bg-[#6ea0fa]",
      },
      {
        loading: true,
        variant: "danger",
        className: "hover:bg-[#ff4d4f]",
      },
      { loading: true, variant: "secondary", className: "hover:bg-white" },
      { loading: true, variant: "tertiary", className: "hover:ring-transparent" },
      { loading: true, variant: "dark", className: "hover:bg-[#111111]" },
      { loading: true, variant: "ghost", className: "hover:bg-transparent" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconOnly: false,
      shadow: false,
      fullWidth: false,
      rounded: false,
      loading: false,
    },
  },
);
