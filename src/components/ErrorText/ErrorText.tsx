import { forwardRef, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { ErrorTextProps } from "./ErrorText.types";

/**
 * children이 생기면 위→아래로 슬라이드하며 나타나고, 없어지면 반대로 슬라이드업하며 사라진다.
 * children이 사라지는 순간 바로 비우면 애니메이션 중 텍스트가 먼저 사라져 보이므로,
 * 마지막으로 있던 텍스트를 붙잡아뒀다가(lastChildren) 접히는 애니메이션이 끝난 뒤에야 비운다.
 * Input뿐 아니라 Select/CheckBox 등 다양한 필드에서 공용으로 쓰므로 애니메이션은 여기서만 책임진다.
 */
export const ErrorText = forwardRef<HTMLDivElement, ErrorTextProps>(
  ({ className, children, id, ...rest }, ref) => {
    const hasContent = Boolean(children);
    const [lastChildren, setLastChildren] = useState(children);

    useEffect(() => {
      if (hasContent) {
        setLastChildren(children);
        return;
      }
      const timeout = setTimeout(() => setLastChildren(undefined), 200);
      return () => clearTimeout(timeout);
    }, [hasContent, children]);

    return (
      <div
        ref={ref}
        className={twMerge(
          "grid transition-all duration-200 ease-out motion-reduce:transition-none",
          hasContent ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          className,
        )}
        {...rest}
      >
        <div className="overflow-hidden">
          <div
            id={id}
            role="alert"
            aria-live="polite"
            className="flex min-w-0 items-start pl-[4px] font-pretendard text-[12px] break-words text-[#fe5150]"
          >
            {lastChildren}
          </div>
        </div>
      </div>
    );
  },
);

ErrorText.displayName = "ErrorText";
