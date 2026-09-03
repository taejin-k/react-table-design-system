import { forwardRef, useId, useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { ErrorMessage } from "../ErrorMessage";
import { Label } from "../Label";
import { filterAllowedCharacters } from "../_internal/filterAllowedCharacters";
import type { TextAreaProps } from "./TextArea.types";

function getInitialValidationError(validate: TextAreaProps["validate"], value: string): string {
  if (!validate || validate.constructor.name === "AsyncFunction") return "";
  const result = validate(value);
  return typeof result === "string" ? result : "";
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = "md",
      variant = "default",
      value,
      defaultValue,
      label,
      errorMessage,
      required = false,
      disabled = false,
      autoSize = false,
      allowOnly,
      resize = true,
      showCount = false,
      maxLength,
      rows = 4,
      id,
      width,
      className,
      validate,
      onChange,
      onBlur,
      onEnter,
      onKeyDown,
      ...rest
    },
    forwardedRef,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const validationRequestRef = useRef(0);
    const [innerValue, setInnerValue] = useState(() => String(defaultValue ?? ""));
    const [hasVerticalOverflow, setHasVerticalOverflow] = useState(false);
    const currentValue = value ?? innerValue;
    const [validationError, setValidationError] = useState(() =>
      getInitialValidationError(validate, String(value ?? defaultValue ?? "")),
    );
    const displayedErrorMessage = errorMessage || validationError;
    const hasError = Boolean(displayedErrorMessage);
    const autoSizeOptions = typeof autoSize === "object" ? autoSize : {};

    useLayoutEffect(() => {
      if (!autoSize || !innerRef.current) return;
      const textarea = innerRef.current;
      const computedStyle = getComputedStyle(textarea);
      const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 22;
      const minRows = autoSizeOptions.minRows ?? 1;
      const maxRows = autoSizeOptions.maxRows ?? Number.POSITIVE_INFINITY;
      const singleRowHeight = autoSizeSingleRowHeights[size];
      const minAutoHeight = singleRowHeight + lineHeight * (minRows - 1);
      const maxAutoHeight = singleRowHeight + lineHeight * (maxRows - 1);
      textarea.style.height = "auto";
      const contentHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(Math.max(contentHeight, minAutoHeight), maxAutoHeight)}px`;
      textarea.style.overflowY = contentHeight > maxAutoHeight ? "auto" : "hidden";
    }, [autoSize, autoSizeOptions.maxRows, autoSizeOptions.minRows, currentValue, size]);

    useLayoutEffect(() => {
      const textarea = innerRef.current;
      if (!textarea) return;

      const updateOverflow = () => {
        setHasVerticalOverflow(textarea.scrollHeight > textarea.clientHeight + 1);
      };

      updateOverflow();
      if (typeof ResizeObserver === "undefined") return;

      const observer = new ResizeObserver(updateOverflow);
      observer.observe(textarea);
      return () => observer.disconnect();
    }, [autoSize, currentValue, rows, size]);

    const changeValue = (nextValue: string) => {
      if (maxLength !== undefined && nextValue.length > maxLength) return;
      if (value === undefined) setInnerValue(nextValue);
      onChange?.(nextValue);
      validationRequestRef.current += 1;
      setValidationError("");
    };

    return (
      <div className={twMerge("flex w-full flex-col", className)} style={{ width }}>
        {label ? (
          <Label
            label={label}
            htmlFor={textareaId}
            required={required}
            size={size}
            className="mb-1"
          />
        ) : null}
        <div className="relative">
          <div className={twMerge(textAreaRootVariants({ variant, error: hasError, disabled }))}>
            <textarea
              {...rest}
              data-textarea-scroll-container
              ref={(node) => {
                innerRef.current = node;
                if (typeof forwardedRef === "function") forwardedRef(node);
                else if (forwardedRef) forwardedRef.current = node;
              }}
              id={textareaId}
              rows={autoSize ? 1 : rows}
              value={currentValue}
              required={required}
              disabled={disabled}
              maxLength={maxLength}
              className={twMerge(
                textAreaVariants({ size, disabled, autoSize: Boolean(autoSize) }),
                !resize && "resize-none",
                hasVerticalOverflow && overflowPaddingBySize[size],
              )}
              onChange={(event) =>
                changeValue(filterAllowedCharacters(event.target.value, allowOnly))
              }
              onBlur={(event) => {
                if (validate) {
                  const requestId = ++validationRequestRef.current;
                  const result = validate(currentValue);

                  if (typeof result === "string") {
                    setValidationError(result);
                  } else {
                    void result
                      .then((nextError) => {
                        if (validationRequestRef.current === requestId) {
                          setValidationError(nextError);
                        }
                      })
                      .catch(() => {
                        if (validationRequestRef.current === requestId) {
                          setValidationError("");
                        }
                      });
                  }
                }
                onBlur?.(event);
              }}
              onKeyDown={(event) => {
                onKeyDown?.(event);
                if (
                  !event.defaultPrevented &&
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  onEnter?.();
                }
              }}
            />
          </div>
          {showCount ? (
            <div className="pointer-events-none absolute top-full right-0 mt-1 flex items-center justify-end">
              <span className="font-pretendard text-xs whitespace-nowrap text-[#999]">
                {maxLength === undefined
                  ? currentValue.length
                  : `${currentValue.length} / ${maxLength}`}
              </span>
            </div>
          ) : null}
        </div>
        <ErrorMessage
          className={hasError ? "mt-1" : undefined}
          errorMessage={displayedErrorMessage}
        />
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

const textAreaRootVariants = cva(
  "relative overflow-hidden rounded bg-white ring-1 transition-[box-shadow,background-color] ring-inset focus-within:ring-primary",
  {
    variants: {
      variant: {
        default: "ring-[#ddd]",
        filled: "bg-[#f5f5f5] ring-[#f5f5f5]",
      },
      error: { true: "ring-danger", false: "" },
      disabled: { true: "bg-[#f8f8f8] ring-[#ddd]", false: "" },
    },
    defaultVariants: { variant: "default", error: false, disabled: false },
  },
);

const textAreaVariants = cva(
  "block w-full resize-y border-0 bg-transparent font-pretendard leading-[1.6] font-medium text-[#111] outline-none placeholder:text-[#999]",
  {
    variants: {
      size: {
        lg: "px-3 text-base",
        md: "px-2.5 text-sm",
        sm: "px-2 text-xs",
      },
      disabled: { true: "resize-none font-normal text-[#999]", false: "" },
      autoSize: { true: "resize-none", false: "" },
    },
    compoundVariants: [
      { size: "lg", autoSize: false, className: "min-h-24 py-2.5" },
      { size: "md", autoSize: false, className: "min-h-20 py-2" },
      { size: "sm", autoSize: false, className: "min-h-16 py-1.5" },
      { size: "lg", autoSize: true, className: "pt-[8px] pb-[6px]" },
      { size: "md", autoSize: true, className: "pt-[4.5px] pb-[3px]" },
      { size: "sm", autoSize: true, className: "py-0.5" },
    ],
    defaultVariants: { size: "md", disabled: false, autoSize: false },
  },
);

const autoSizeSingleRowHeights = {
  lg: 40,
  md: 30,
  sm: 20,
} as const;

const overflowPaddingBySize = {
  lg: "pr-1",
  md: "pr-0.5",
  sm: "pr-0",
} as const;
