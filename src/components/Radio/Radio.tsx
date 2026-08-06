import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** 있으면 라디오 오른쪽에 레이블 텍스트를 함께 렌더링한다. */
  label?: ReactNode;
  /** true면 테두리/선택 색이 warning(red) 색으로 바뀐다. */
  error?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ label, error = false, disabled, className, id, ...rest }, ref) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label htmlFor={inputId} className={twMerge("inline-flex items-center gap-1.5", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
      <input ref={ref} id={inputId} type="radio" disabled={disabled} className={twMerge(radioVariants({ error }), className)} {...rest} />
      {label && (
        <span className={twMerge("font-pretendard text-[14px] leading-4 whitespace-nowrap", disabled ? "text-[#aaa]" : "text-[#111]")}>{label}</span>
      )}
    </label>
  );
});

Radio.displayName = "Radio";

const radioVariants = cva(
  // 안쪽 흰 점은 inset box-shadow의 spread 값으로 만드는데, 미체크 상태엔 애초에
  // box-shadow가 없어서(none) 체크 시 "none → 4px" 전환을 브라우저가 부드럽게
  // 보간하지 못하고 순간적으로 나타나거나 사라져버림(배경색만 서서히 바뀌다가
  // 점이 뚝 끊기듯 나타남/사라짐). 미체크 상태에도 spread가 원을 전부 덮는
  // 8px(size-4의 절반) 흰색 shadow를 깔아둬서, 체크 시 8px→4px로 spread만
  // 매끄럽게 줄어들며(=점이 자라나며) 배경색 전환과 함께 애니메이션되게 함.
  "relative m-0 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-solid bg-white shadow-[inset_0_0_0_8px_white] transition-[background-color,border-color,box-shadow] border-[#ddd] hover:border-[#0062df] checked:border-[#0062df] checked:bg-[#0062df] checked:shadow-[inset_0_0_0_4px_white] disabled:cursor-not-allowed disabled:border-[#ddd] disabled:bg-[#f5f5f5] disabled:shadow-[inset_0_0_0_8px_#f5f5f5] disabled:hover:border-[#ddd] disabled:checked:bg-[#ccc] disabled:checked:shadow-[inset_0_0_0_4px_#f5f5f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df]",
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
