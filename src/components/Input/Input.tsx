import { cloneElement, forwardRef, isValidElement, useId, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Label } from "../Label";
import { ErrorText } from "../ErrorText";
import { Icon } from "../Icon";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix" | "value" | "onChange">,
    Pick<VariantProps<typeof inputRowVariants>, "size" | "variant"> {
  value?: string;
  onChange?: (value: string) => void;
  /** 있으면 입력창 위에 Label을 함께 렌더링한다. */
  label?: ReactNode;
  /** 있으면 입력창 아래에 ErrorText를 함께 렌더링하고, 입력창 테두리도 warning 색으로 바뀐다. */
  errorText?: ReactNode;
  /** true면 Label 뒤에 * 표시. label이 없으면 의미 없다. */
  required?: boolean;
  /** 입력값이 있을 때 지우기(X) 버튼을 보여준다. 누르면 onChange('')를 호출한다. */
  allowClear?: boolean;
  /** value.length만 보여준다. maxLength가 있으면 무시되고 "n / maxLength" 형식으로 대신 보여준다. */
  showCount?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  /** 입력 영역 wrapper에 적용한다. 기존 className도 호환을 위해 wrapper에 적용된다. */
  rootClassName?: string;
  /** 실제 input 엘리먼트에 적용한다. */
  inputClassName?: string;
  /** 지우기 버튼을 누른 직후 호출한다. */
  onClear?: () => void;
}

/** prefixIcon/suffixIcon에 onClick이 붙어있어도 무시하도록 제거한다(장식 목적). */
function stripOnClick(node: ReactNode): ReactNode {
  if (isValidElement<{ onClick?: unknown }>(node)) return cloneElement(node, { onClick: undefined });
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
      id,
      className,
      rootClassName,
      inputClassName,
      onClear,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(errorText);
    const hasValue = Boolean(value);
    const errorId = `${inputId}-error`;
    const describedBy = [ariaDescribedBy, hasError ? errorId : undefined].filter(Boolean).join(" ") || undefined;
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <div className="flex w-full flex-col gap-[4px]">
        {label && (
          <Label size={size} required={required} htmlFor={inputId}>
            {label}
          </Label>
        )}
        <div className={twMerge(inputRowVariants({ size, variant, error: hasError, disabled }), className, rootClassName)}>
          {prefixIcon && <span className="flex size-4 shrink-0 items-center justify-center">{stripOnClick(prefixIcon)}</span>}
          <input
            ref={inputRef}
            id={inputId}
            value={value}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            aria-invalid={ariaInvalid ?? (hasError || undefined)}
            aria-describedby={describedBy}
            className={twMerge(inputVariants({ size, disabled }), "min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#999]", inputClassName)}
            onChange={(event) => {
              const nextValue = event.target.value;
              // 한글 등 IME 조합 중에는 네이티브 maxLength가 강제되지 않아 직접 막는다.
              if (maxLength !== undefined && nextValue.length > maxLength) return;
              onChange?.(nextValue);
            }}
            {...rest}
          />
          {(showCount || maxLength !== undefined) && (
            <span className="shrink-0 whitespace-nowrap font-pretendard text-[12px] text-[#aaa]">
              {maxLength !== undefined ? `${value?.length ?? 0} / ${maxLength}` : (value?.length ?? 0)}
            </span>
          )}
          {allowClear && hasValue && !disabled && (
            <button
              type="button"
              aria-label="입력 내용 지우기"
              className="flex size-4 shrink-0 items-center justify-center rounded border-0 bg-transparent p-0 text-[#999] hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df]"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange?.("");
                onClear?.();
                inputRef.current?.focus();
              }}
            >
              <Icon icon="close" size={16} aria-hidden />
            </button>
          )}
          {suffixIcon && <span className="flex size-4 shrink-0 items-center justify-center">{stripOnClick(suffixIcon)}</span>}
        </div>
        <ErrorText id={errorId} className="-mt-0.5">{errorText}</ErrorText>
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

const inputVariants = cva("font-pretendard font-medium leading-[1.6] text-[#111]", {
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
