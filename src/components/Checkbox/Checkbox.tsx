import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** 있으면 체크박스 오른쪽에 레이블 텍스트를 함께 렌더링한다. */
  label?: ReactNode;
  /** true면 테두리/체크 색이 warning(red) 색으로 바뀐다. */
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, error = false, disabled, className, id, ...rest }, ref) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label htmlFor={inputId} className={twMerge("inline-flex items-center gap-1.5", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
      <input ref={ref} id={inputId} type="checkbox" disabled={disabled} className={twMerge(checkboxVariants({ error }), className)} {...rest} />
      {label && (
        <span className={twMerge("font-pretendard text-[14px] leading-4 whitespace-nowrap", disabled ? "text-[#aaa]" : "text-[#111]")}>{label}</span>
      )}
    </label>
  );
});

Checkbox.displayName = "Checkbox";

const checkboxVariants = cva(
  "relative m-0 size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border border-solid bg-white bg-[length:12px_12px] bg-center bg-no-repeat transition-colors border-[#ddd] hover:border-[#0062df] checked:border-[#0062df] checked:bg-[#0062df] checked:bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221.7%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m2.2%206.1%202.3%202.3%205.3-5.2%22%2F%3E%3C%2Fsvg%3E')] disabled:cursor-not-allowed disabled:border-[#ddd] disabled:bg-[#f5f5f5] disabled:hover:border-[#ddd] disabled:checked:bg-[#f5f5f5] disabled:checked:bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23ccc%22%20stroke-width%3D%221.7%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m2.2%206.1%202.3%202.3%205.3-5.2%22%2F%3E%3C%2Fsvg%3E')] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df]",
  {
    variants: {
      error: {
        true: "border-[#fe5150] hover:border-[#fe5150] checked:border-[#fe5150] checked:bg-[#fe5150]",
        false: "",
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);
