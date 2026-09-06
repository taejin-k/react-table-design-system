import { forwardRef, useId } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { RadioProps } from "./Radio.types";

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error = false, disabled, className, id, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <label
        htmlFor={inputId}
        className={twMerge(
          "inline-flex max-w-full min-w-0 items-start gap-1.5",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="radio"
          disabled={disabled}
          className={twMerge(radioVariants({ error }))}
          {...rest}
        />
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

Radio.displayName = "Radio";

const radioVariants = cva(
  // 안쪽 흰 점은 inset box-shadow의 spread 값으로 만드는데, 미체크 상태엔 애초에
  // box-shadow가 없어서(none) 체크 시 "none → 4px" 전환을 브라우저가 부드럽게
  // 보간하지 못하고 순간적으로 나타나거나 사라져버림(배경색만 서서히 바뀌다가
  // 점이 뚝 끊기듯 나타남/사라짐). 미체크 상태에도 spread가 원을 전부 덮는
  // 8px(size-4의 절반) 흰색 shadow를 깔아둬서, 체크 시 8px→4px로 spread만
  // 매끄럽게 줄어들며(=점이 자라나며) 배경색 전환과 함께 애니메이션되게 함.
  "relative m-0 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-solid border-border bg-white shadow-[inset_0_0_0_8px_white] transition-[background-color,border-color,box-shadow] duration-200 ease-out outline-none checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_4px_white] hover:border-primary disabled:cursor-not-allowed disabled:border-border disabled:bg-hover disabled:shadow-[inset_0_0_0_8px_var(--color-hover)] disabled:checked:bg-disabled disabled:checked:shadow-[inset_0_0_0_4px_var(--color-hover)] disabled:hover:border-border motion-reduce:transition-none",
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
