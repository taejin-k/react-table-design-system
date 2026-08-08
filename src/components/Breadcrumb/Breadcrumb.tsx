import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { BreadcrumbProps } from "./Breadcrumb.types";

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items = [], className, "aria-label": ariaLabel = "Breadcrumb", ...rest }, ref) => (
    <nav ref={ref} aria-label={ariaLabel} className={twMerge("font-pretendard text-[14px] leading-[22px]", className)} {...rest}>
      <ol className="m-0 flex min-w-0 list-none flex-wrap items-center gap-y-1 p-0">
        {items.map(({ key, title, href, icon, color, className: itemClassName, style, ...linkProps }, index) => {
          const isCurrent = index === items.length - 1;
          const content = (
            <>
              {icon ? <span className="inline-flex size-4 shrink-0 items-center justify-center" aria-hidden>{icon}</span> : null}
              <span className="min-w-0 truncate">{title}</span>
            </>
          );

          return (
            <li key={key ?? index} className="inline-flex min-w-0 items-center">
              {index > 0 ? <span className="mx-2 inline-flex shrink-0 items-center text-[#aaa] max-[575px]:mx-1.5" aria-hidden>/</span> : null}
              {href ? (
                <a
                  {...linkProps}
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={twMerge(contentVariants({ link: true, current: isCurrent }), itemClassName)}
                  style={{ color, ...style }}
                >
                  {content}
                </a>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={twMerge(contentVariants({ current: isCurrent }), itemClassName)}
                  style={{ color, ...style }}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  ),
);

Breadcrumb.displayName = "Breadcrumb";

const contentVariants = cva("inline-flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-[#999]", {
  variants: {
    link: {
      true: "cursor-pointer no-underline transition-[color,background-color] hover:bg-[#f5f5f5] hover:text-[#111] focus-visible:bg-[#f5f5f5] focus-visible:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df] motion-reduce:transition-none",
      false: "",
    },
    current: {
      true: "font-medium text-[#111]",
      false: "",
    },
  },
  defaultVariants: {
    link: false,
    current: false,
  },
});
