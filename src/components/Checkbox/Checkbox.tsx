import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error = false, partiallyChecked = false, disabled, className, id, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
    useEffect(() => {
      if (inputRef.current) inputRef.current.indeterminate = partiallyChecked;
    }, [partiallyChecked]);

    return (
      <label
        htmlFor={inputId}
        className={twMerge(
          "inline-flex max-w-full min-w-0 items-start gap-1.5 select-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        <span className="relative size-4 shrink-0">
          <input
            ref={inputRef}
            {...rest}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className={twMerge(checkboxVariants({ error }))}
          />
          <svg
            data-checkbox-mark
            viewBox="0 0 12 12"
            className="pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 scale-75 text-white opacity-0 transition-[color,opacity,transform] duration-200 ease-out peer-checked:scale-100 peer-checked:opacity-100 peer-indeterminate:scale-100 peer-indeterminate:opacity-100 peer-disabled:text-disabled motion-reduce:transition-none"
          >
            <path
              d={partiallyChecked ? "M3 6h6" : "m2.2 6.1 2.3 2.3 5.3-5.2"}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {label != null ? (
          <span
            className={twMerge(
              "min-w-0 font-pretendard text-[14px] leading-4 break-all whitespace-pre-line transition-colors duration-200 ease-out motion-reduce:transition-none",
              disabled ? "text-disabled" : "text-dark",
            )}
          >
            {label}
          </span>
        ) : null}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

const checkboxVariants = cva(
  "peer relative m-0 block size-4 cursor-pointer appearance-none rounded-[4px] border border-solid border-border bg-white transition-[background-color,border-color] duration-200 ease-out outline-none checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary hover:border-primary disabled:cursor-not-allowed disabled:border-border disabled:bg-hover disabled:checked:bg-hover disabled:indeterminate:border-border disabled:indeterminate:bg-hover disabled:hover:border-border motion-reduce:transition-none",
  {
    variants: {
      error: {
        true: "border-danger checked:border-danger checked:bg-danger indeterminate:border-danger indeterminate:bg-danger hover:border-danger",
        false: "",
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);
