import { forwardRef, useId, useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { ErrorText } from "../ErrorText";
import { Icon } from "../Icon";
import { Label } from "../Label";
import type { TextAreaProps } from "./TextArea.types";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = "md",
      variant = "default",
      value,
      defaultValue,
      label,
      errorText,
      required = false,
      disabled = false,
      autoSize = false,
      allowClear = false,
      showCount = false,
      count,
      maxLength,
      rows = 4,
      id,
      className,
      onChange,
      onBlur,
      onError,
      onEnter,
      ...rest
    },
    forwardedRef,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const [innerValue, setInnerValue] = useState(() => String(defaultValue ?? ""));
    const currentValue = value ?? innerValue;
    const hasError = Boolean(errorText);
    const autoSizeOptions = typeof autoSize === "object" ? autoSize : {};

    useLayoutEffect(() => {
      if (!autoSize || !innerRef.current) return;
      const textarea = innerRef.current;
      const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight) || 22;
      const minRows = autoSizeOptions.minRows ?? 1;
      const maxRows = autoSizeOptions.maxRows ?? Number.POSITIVE_INFINITY;
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, lineHeight * minRows), lineHeight * maxRows)}px`;
    }, [autoSize, autoSizeOptions.maxRows, autoSizeOptions.minRows, currentValue]);

    const countValue = count?.strategy?.(currentValue) ?? currentValue.length;
    const countMax = count?.max ?? maxLength;
    const countVisible = count?.show ?? (count ? true : showCount);

    const changeValue = (nextValue: string) => {
      if (maxLength !== undefined && nextValue.length > maxLength) return;
      const formattedValue =
        count?.max !== undefined && nextValue.length > count.max && count.exceedFormatter
          ? count.exceedFormatter(nextValue, { max: count.max })
          : nextValue;
      if (value === undefined) setInnerValue(formattedValue);
      onChange?.(formattedValue);
      onError?.("");
    };

    return (
      <div className={twMerge("flex w-full flex-col gap-1", className)}>
        {label ? (
          <Label htmlFor={textareaId} required={required} size={size}>
            {label}
          </Label>
        ) : null}
        <div className={textAreaRootVariants({ variant, error: hasError, disabled })}>
          <textarea
            {...rest}
            ref={(node) => {
              innerRef.current = node;
              if (typeof forwardedRef === "function") forwardedRef(node);
              else if (forwardedRef) forwardedRef.current = node;
            }}
            id={textareaId}
            rows={autoSize ? undefined : rows}
            value={currentValue}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            aria-invalid={hasError || undefined}
            className={twMerge(
              textAreaVariants({ size, disabled }),
              (countVisible || (allowClear && currentValue && !disabled)) && "pb-7",
            )}
            onChange={(event) => changeValue(event.target.value)}
            onBlur={onBlur}
            onKeyDown={(event) => {
              rest.onKeyDown?.(event);
              if (event.key === "Enter" && !event.shiftKey) onEnter?.();
            }}
          />
          <div className="pointer-events-none absolute right-5 bottom-1.5 flex min-h-4 items-center justify-end gap-2">
            {countVisible ? (
              <span className="font-pretendard text-xs whitespace-nowrap text-[#999]">
                {typeof countVisible === "function"
                  ? countVisible({ value: currentValue, count: countValue, maxLength: countMax })
                  : countMax === undefined
                    ? countValue
                    : `${countValue} / ${countMax}`}
              </span>
            ) : null}
            {allowClear && currentValue && !disabled ? (
              <Icon
                icon="close"
                color="#999"
                className="pointer-events-auto"
                onClick={() => {
                  changeValue("");
                  innerRef.current?.focus();
                }}
              />
            ) : null}
          </div>
        </div>
        <ErrorText>{errorText}</ErrorText>
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

const textAreaRootVariants = cva(
  "relative overflow-hidden rounded border border-solid bg-white transition-colors focus-within:border-[#0062df]",
  {
    variants: {
      variant: {
        default: "border-[#ddd]",
        filled: "border-[#f5f5f5] bg-[#f5f5f5]",
      },
      error: { true: "border-[#fe5150]", false: "" },
      disabled: { true: "border-[#ddd] bg-[#f8f8f8]", false: "" },
    },
    defaultVariants: { variant: "default", error: false, disabled: false },
  },
);

const textAreaVariants = cva(
  "block w-full resize-y border-0 bg-transparent font-pretendard leading-[1.55] font-medium text-[#111] outline-none placeholder:text-[#999]",
  {
    variants: {
      size: {
        lg: "min-h-24 px-3 pt-2.5 text-base",
        md: "min-h-20 px-2.5 pt-2 text-sm",
        sm: "min-h-16 px-2 pt-1.5 text-xs",
      },
      disabled: { true: "resize-none font-normal text-[#999]", false: "" },
    },
    defaultVariants: { size: "md", disabled: false },
  },
);
