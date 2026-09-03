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
          "bg-primary text-white ring-1 ring-transparent ring-inset hover:bg-[#227cef] disabled:bg-hover disabled:text-gray disabled:ring-border",
        danger:
          "bg-danger text-white ring-1 ring-transparent ring-inset hover:bg-[#ff7875] disabled:bg-hover disabled:text-gray disabled:ring-border",
        secondary:
          "bg-white text-dark ring-1 ring-border ring-inset hover:bg-hover disabled:bg-hover disabled:text-gray disabled:ring-border",
        tertiary:
          "bg-hover text-dark ring-1 ring-transparent ring-inset hover:ring-border disabled:text-gray disabled:ring-border",
        dark: "bg-dark text-white ring-1 ring-transparent ring-inset hover:bg-[#303030] disabled:bg-hover disabled:text-gray disabled:ring-border",
        ghost:
          "bg-transparent text-dark ring-1 ring-transparent ring-inset hover:bg-hover disabled:bg-hover disabled:text-gray disabled:ring-border",
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
        className: "shadow-xs",
      },
      {
        shadow: true,
        size: "md",
        className: "shadow-sm",
      },
      {
        shadow: true,
        size: "lg",
        className: "shadow-lg",
      },
      {
        loading: true,
        variant: "primary",
        className: "bg-[#6ea0fa] opacity-100 hover:bg-[#6ea0fa]",
      },
      {
        loading: true,
        variant: "danger",
        className: "hover:bg-danger",
      },
      { loading: true, variant: "secondary", className: "hover:bg-white" },
      { loading: true, variant: "tertiary", className: "hover:ring-transparent" },
      { loading: true, variant: "dark", className: "hover:bg-dark" },
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
