import { forwardRef, useId, useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { ErrorMessage } from "../ErrorMessage";
import { Label } from "../Label";
import { filterAllowedCharacters } from "../_internal/filterAllowedCharacters";
import { useErrorMessageValidation } from "../_internal/useErrorMessageValidation";
import type { TextAreaProps } from "./TextArea.types";
import { useTextAreaScrollbar } from "./use-textarea-scrollbar";

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
      readOnly = false,
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
      onChange,
      onBlur,
      onEnter,
      onKeyDown,
      onMouseDown,
      ...rest
    },
    forwardedRef,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const innerRef = useRef<HTMLTextAreaElement | null>(null);
    const [innerValue, setInnerValue] = useState(() => String(defaultValue ?? ""));
    const currentValue = value ?? innerValue;
    const { clearValidationError, displayedErrorMessage, hasError, validateErrorMessage } =
      useErrorMessageValidation(errorMessage, String(value ?? defaultValue ?? ""));
    const autoSizeOptions = typeof autoSize === "object" ? autoSize : {};
    const countText =
      maxLength === undefined
        ? String(currentValue.length)
        : `${currentValue.length} / ${maxLength}`;

    useLayoutEffect(() => {
      if (!autoSize || !innerRef.current) return;
      const textarea = innerRef.current;
      const resizeToContent = () => {
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
      };
      resizeToContent();
      let previousWidth = textarea.getBoundingClientRect().width;
      const observer =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(() => {
              const width = textarea.getBoundingClientRect().width;
              // Height changes caused by autoSize must not retrigger the observer.
              if (width === previousWidth) return;
              previousWidth = width;
              resizeToContent();
            });
      observer?.observe(textarea);
      return () => {
        observer?.disconnect();
        textarea.style.height = "";
        textarea.style.overflowY = "";
      };
    }, [autoSize, autoSizeOptions.maxRows, autoSizeOptions.minRows, currentValue, size]);

    const scrollbar = useTextAreaScrollbar(
      innerRef,
      currentValue,
      resize && !autoSize && !disabled,
    );

    const changeValue = (nextValue: string) => {
      if (maxLength !== undefined && nextValue.length > maxLength) return;
      if (value === undefined) setInnerValue(nextValue);
      onChange?.(nextValue);
      clearValidationError();
    };

    return (
      <div className={twMerge("flex w-full flex-col", className)}>
        {label ? (
          <Label
            label={label}
            htmlFor={readOnly ? undefined : textareaId}
            required={required}
            size={size}
            className="mb-1"
          />
        ) : null}
        <div className="w-full" style={{ width }}>
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
              readOnly={readOnly}
              disabled={disabled}
              maxLength={maxLength}
              className={twMerge(
                textAreaVariants({ size, disabled, autoSize: Boolean(autoSize) }),
                !resize && "resize-none",
                readOnly && !disabled && "cursor-default",
              )}
              onChange={(event) =>
                changeValue(filterAllowedCharacters(event.target.value, allowOnly))
              }
              onBlur={(event) => {
                validateErrorMessage(currentValue);
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
              onMouseDown={(event) => {
                onMouseDown?.(event);
                if (readOnly) event.preventDefault();
              }}
            />
            {scrollbar.visible && (
              <div
                ref={scrollbar.trackRef}
                data-textarea-scrollbar-track
                className="absolute top-1 right-0 w-2 cursor-pointer touch-none"
                style={{ bottom: scrollbar.bottom }}
                onPointerDown={scrollbar.onTrackPointerDown}
              >
                <div
                  data-textarea-scrollbar-thumb
                  className="absolute right-px w-1.5 cursor-grab touch-none rounded-full bg-disabled transition-colors duration-200 ease-out hover:bg-disabled active:cursor-grabbing motion-reduce:transition-none"
                  style={{
                    height: scrollbar.thumbHeight,
                    transform: `translateY(${scrollbar.top}px)`,
                  }}
                  onPointerDown={scrollbar.onThumbPointerDown}
                  onPointerMove={scrollbar.onThumbPointerMove}
                  onPointerUp={scrollbar.onThumbPointerEnd}
                  onPointerCancel={scrollbar.onThumbPointerEnd}
                  onLostPointerCapture={scrollbar.onThumbPointerEnd}
                />
              </div>
            )}
          </div>
        </div>
        <div className="relative w-full">
          <div
            className={twMerge(
              "grid items-start",
              showCount ? "grid-cols-[minmax(0,1fr)_auto] gap-x-2" : "grid-cols-1",
            )}
          >
            <ErrorMessage
              className={twMerge("min-w-0", hasError && "pt-1")}
              errorMessage={displayedErrorMessage}
            />
            {showCount ? (
              <span
                data-textarea-count-spacer
                className="invisible h-0 shrink-0 overflow-hidden font-pretendard text-xs whitespace-nowrap"
              >
                {countText}
              </span>
            ) : null}
          </div>
          {showCount ? (
            <span
              data-textarea-count
              className="pointer-events-none absolute top-1 right-0 font-pretendard text-xs whitespace-nowrap text-disabled"
            >
              {countText}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

const textAreaRootVariants = cva(
  "relative overflow-hidden rounded bg-white ring-1 transition-[box-shadow,background-color] duration-200 ease-out ring-inset focus-within:ring-primary motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "ring-border",
        filled: "bg-hover ring-hover",
      },
      error: { true: "ring-danger", false: "" },
      disabled: { true: "bg-hover ring-border", false: "" },
    },
    defaultVariants: { variant: "default", error: false, disabled: false },
  },
);

const textAreaVariants = cva(
  "block w-full resize-y border-0 bg-transparent font-pretendard leading-[1.6] font-medium text-dark outline-none placeholder:text-disabled",
  {
    variants: {
      size: {
        lg: "pr-1 pl-3 text-base",
        md: "pr-0.5 pl-2.5 text-sm",
        sm: "pr-0 pl-2 text-xs",
      },
      disabled: {
        true: "resize-none font-normal text-disabled placeholder:text-disabled",
        false: "",
      },
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
