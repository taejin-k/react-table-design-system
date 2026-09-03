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
          "inline-flex items-start gap-1.5",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        <input
          ref={inputRef}
          {...rest}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          className={checkboxVariants({ error })}
        />
        {label != null ? (
          <span
            className={twMerge(
              "font-pretendard text-[14px] leading-4 whitespace-pre-line",
              disabled ? "text-[#aaa]" : "text-[#111]",
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
  "relative m-0 size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border border-solid border-[#ddd] bg-white bg-[length:12px_12px] bg-center bg-no-repeat transition-colors checked:border-primary checked:bg-primary checked:bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221.7%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m2.2%206.1%202.3%202.3%205.3-5.2%22%2F%3E%3C%2Fsvg%3E')] indeterminate:border-primary indeterminate:bg-primary indeterminate:bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221.7%22%20stroke-linecap%3D%22round%22%20d%3D%22M3%206h6%22%2F%3E%3C%2Fsvg%3E')] hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-[#ddd] disabled:bg-[#f5f5f5] disabled:checked:bg-[#f5f5f5] disabled:checked:bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%221.7%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m2.2%206.1%202.3%202.3%205.3-5.2%22%2F%3E%3C%2Fsvg%3E')] disabled:indeterminate:border-[#ddd] disabled:indeterminate:bg-[#f5f5f5] disabled:indeterminate:bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%221.7%22%20stroke-linecap%3D%22round%22%20d%3D%22M3%206h6%22%2F%3E%3C%2Fsvg%3E')] disabled:hover:border-[#ddd]",
  {
    variants: {
      error: {
        true: "border-danger checked:border-danger checked:bg-danger hover:border-danger",
        false: "",
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);
