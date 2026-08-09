import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Label } from "../Label";
import { ErrorText } from "../ErrorText";
import { Icon } from "../Icon";
import type { InputProps } from "./Input.types";

/** prefixIcon/suffixIcon에 onClick이 붙어있어도 무시하도록 제거한다(장식 목적). */
function stripOnClick(node: ReactNode): ReactNode {
  if (isValidElement<{ onClick?: unknown }>(node))
    return cloneElement(node, { onClick: undefined });
  return node;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      variant = "default",
      value,
      onChange,
      label,
      errorText,
      required = false,
      allowClear = false,
      showCount = false,
      maxLength,
      prefixIcon,
      suffixIcon,
      disabled,
      defaultValue,
      id,
      className,
      onBlur,
      onError,
      onEnter,
      onKeyDown,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(() => String(defaultValue ?? ""));
    const currentValue = value ?? uncontrolledValue;
    const hasError = Boolean(errorText);
    const hasValue = currentValue.length > 0;
    const errorId = `${inputId}-error`;
    const describedBy =
      [ariaDescribedBy, hasError ? errorId : undefined].filter(Boolean).join(" ") || undefined;
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <div className={twMerge("flex w-full flex-col gap-[4px]", className)}>
        {label && (
          <Label size={size} required={required} htmlFor={inputId}>
            {label}
          </Label>
        )}
        <div className={twMerge(inputRowVariants({ size, variant, error: hasError, disabled }))}>
          {prefixIcon && (
            <span className="flex size-4 shrink-0 items-center justify-center">
              {stripOnClick(prefixIcon)}
            </span>
          )}
          <input
            ref={inputRef}
            id={inputId}
            value={currentValue}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            aria-invalid={ariaInvalid ?? (hasError || undefined)}
            aria-describedby={describedBy}
            className={twMerge(
              inputVariants({ size, disabled }),
              "min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#999]",
            )}
            onBlur={onBlur}
            onChange={(event) => {
              const nextValue = event.target.value;
              // 한글 등 IME 조합 중에는 네이티브 maxLength가 강제되지 않아 직접 막는다.
              if (maxLength !== undefined && nextValue.length > maxLength) return;
              if (value === undefined) setUncontrolledValue(nextValue);
              onChange?.(nextValue);
              onError?.("");
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (
                !event.defaultPrevented &&
                event.key === "Enter" &&
                !event.nativeEvent.isComposing
              ) {
                onEnter?.();
              }
            }}
            {...rest}
          />
          {showCount && (
            <span className="shrink-0 font-pretendard text-[12px] whitespace-nowrap text-[#aaa]">
              {maxLength !== undefined
                ? `${currentValue.length} / ${maxLength}`
                : currentValue.length}
            </span>
          )}
          {allowClear && hasValue && !disabled && (
            <Icon
              icon="close"
              className="shrink-0 text-[#999]"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (value === undefined) setUncontrolledValue("");
                onChange?.("");
                onError?.("");
                inputRef.current?.focus();
              }}
            />
          )}
          {suffixIcon && (
            <span className="flex size-4 shrink-0 items-center justify-center">
              {stripOnClick(suffixIcon)}
            </span>
          )}
        </div>
        <ErrorText id={errorId} className="-mt-0.5">
          {errorText}
        </ErrorText>
      </div>
    );
  },
);

Input.displayName = "Input";

const inputRowVariants = cva(
  "flex w-full items-center gap-[6px] rounded-[4px] border border-solid bg-white transition-colors focus-within:border-[#0062df]",
  {
    variants: {
      size: {
        lg: "h-[40px] px-[12px] py-[8px]",
        md: "h-[30px] px-[10px] py-[4px]",
        sm: "h-[20px] px-[8px] py-[1px]",
      },
      variant: {
        default: "border-[#ddd]",
        filled: "border-[#f5f5f5] bg-[#f5f5f5]",
      },
      error: {
        true: "border-[#fe5150]",
        false: "",
      },
      disabled: {
        true: "border-[#ddd] bg-[#f8f8f8]",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      error: false,
      disabled: false,
    },
  },
);

const inputVariants = cva("font-pretendard leading-[1.6] font-medium text-[#111]", {
  variants: {
    size: {
      lg: "text-[16px]",
      md: "text-[14px]",
      sm: "text-[12px]",
    },
    disabled: {
      true: "font-normal text-[#999]",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    disabled: false,
  },
});
