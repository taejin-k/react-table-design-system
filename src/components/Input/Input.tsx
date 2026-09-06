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
import { ErrorMessage } from "../ErrorMessage";
import { Icon } from "../Icon";
import { filterAllowedCharacters } from "../_internal/filterAllowedCharacters";
import { useErrorMessageValidation } from "../_internal/useErrorMessageValidation";
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
      errorMessage,
      required = false,
      password = false,
      allowOnly,
      allowClear = false,
      showCount = false,
      maxLength,
      prefixIcon,
      suffixIcon,
      readOnly = false,
      disabled,
      defaultValue,
      id,
      autoComplete = "off",
      autoCorrect = "off",
      autoCapitalize = "off",
      spellCheck = false,
      type = "text",
      inputMode,
      width,
      className,
      onBlur,
      onEnter,
      onKeyDown,
      onMouseDown,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement>(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState(() => String(defaultValue ?? ""));
    const currentValue = value ?? uncontrolledValue;
    const { clearValidationError, displayedErrorMessage, hasError, validateErrorMessage } =
      useErrorMessageValidation(errorMessage, String(value ?? defaultValue ?? ""));
    const hasValue = currentValue.length > 0;
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <div className={twMerge("flex w-full flex-col", className)}>
        {label && (
          <Label
            label={label}
            size={size}
            required={required}
            htmlFor={readOnly ? undefined : inputId}
            className="mb-1"
          />
        )}
        <div
          className={twMerge(inputRowVariants({ size, variant, error: hasError, disabled }))}
          style={{ width }}
        >
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
            readOnly={readOnly}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            autoCapitalize={autoCapitalize}
            spellCheck={spellCheck}
            type={password ? (passwordVisible ? "text" : "password") : type}
            inputMode={inputMode ?? (allowOnly === "number" ? "numeric" : undefined)}
            className={twMerge(
              inputVariants({ size, disabled }),
              "min-w-0 flex-1 bg-transparent outline-none",
              readOnly && !disabled && "cursor-default",
            )}
            onBlur={(event) => {
              validateErrorMessage(currentValue);
              onBlur?.(event);
            }}
            onChange={(event) => {
              const nextValue = filterAllowedCharacters(event.target.value, allowOnly);
              // 한글 등 IME 조합 중에는 네이티브 maxLength가 강제되지 않아 직접 막는다.
              if (maxLength !== undefined && nextValue.length > maxLength) return;
              if (value === undefined) setUncontrolledValue(nextValue);
              onChange?.(nextValue);
              clearValidationError();
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
            onMouseDown={(event) => {
              onMouseDown?.(event);
              if (readOnly) event.preventDefault();
            }}
            {...rest}
          />
          {showCount && (
            <span className="shrink-0 font-pretendard text-[12px] whitespace-nowrap text-disabled">
              {maxLength !== undefined
                ? `${currentValue.length} / ${maxLength}`
                : currentValue.length}
            </span>
          )}
          {allowClear && hasValue && !readOnly && !disabled && (
            <Icon
              icon="close"
              className="shrink-0 text-gray"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (value === undefined) setUncontrolledValue("");
                onChange?.("");
                clearValidationError();
                inputRef.current?.focus();
              }}
            />
          )}
          {suffixIcon && (
            <span className="flex size-4 shrink-0 items-center justify-center">
              {stripOnClick(suffixIcon)}
            </span>
          )}
          {password && (
            <Icon
              icon={passwordVisible ? "eye" : "eye-off"}
              disabled={disabled}
              className="shrink-0 text-gray"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setPasswordVisible((visible) => !visible)}
            />
          )}
        </div>
        <ErrorMessage
          className={hasError ? "mt-0.5" : undefined}
          errorMessage={displayedErrorMessage}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

const inputRowVariants = cva(
  "flex w-full items-center gap-[6px] rounded-[4px] border border-solid bg-white transition-colors duration-200 ease-out focus-within:border-primary motion-reduce:transition-none",
  {
    variants: {
      size: {
        lg: "h-[40px] px-[12px] py-[8px]",
        md: "h-[30px] px-[10px] py-[4px]",
        sm: "h-[20px] px-[8px] py-[1px]",
      },
      variant: {
        default: "border-border",
        filled: "border-hover bg-hover",
        borderless: "border-transparent bg-white focus-within:border-transparent",
        underlined:
          "rounded-none border-x-transparent border-t-transparent border-b-border bg-white focus-within:border-x-transparent focus-within:border-t-transparent focus-within:border-b-primary",
      },
      error: {
        true: "",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed border-border bg-hover",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      error: false,
      disabled: false,
    },
    compoundVariants: [
      {
        variant: ["default", "filled", "borderless"],
        error: true,
        disabled: false,
        className: "border-danger focus-within:border-danger",
      },
      {
        variant: "underlined",
        error: true,
        disabled: false,
        className:
          "border-x-transparent border-t-transparent border-b-danger focus-within:border-x-transparent focus-within:border-t-transparent focus-within:border-b-danger",
      },
      {
        variant: "underlined",
        disabled: true,
        className: "rounded-[4px] border-x-border border-t-border",
      },
    ],
  },
);

const inputVariants = cva(
  "font-pretendard leading-[1.6] font-medium text-dark placeholder:text-disabled",
  {
    variants: {
      size: {
        lg: "text-[16px]",
        md: "text-[14px]",
        sm: "text-[12px]",
      },
      disabled: {
        true: "cursor-not-allowed text-disabled opacity-100 placeholder:text-disabled",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      disabled: false,
    },
  },
);
