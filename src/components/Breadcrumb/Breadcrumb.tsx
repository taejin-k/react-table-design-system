import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { BreadcrumbProps } from "./Breadcrumb.types";

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items = [], className, ...rest }, ref) => (
    <nav
      ref={ref}
      className={twMerge("font-pretendard text-[14px] leading-[22px]", className)}
      {...rest}
    >
      <ol className="m-0 flex min-w-0 list-none flex-wrap items-center gap-y-1 p-0">
        {items.map(
          (
            { title, href, onClick, icon, color, className: itemClassName, style, ...linkProps },
            index,
          ) => {
            const isCurrent = index === items.length - 1;
            const content = (
              <>
                {icon ? (
                  <span className="inline-flex size-4 shrink-0 items-center justify-center">
                    {icon}
                  </span>
                ) : null}
                {title !== undefined && title !== null ? (
                  <span className="min-w-0 truncate">{title}</span>
                ) : null}
              </>
            );

            return (
              <li key={index} className="inline-flex min-w-0 items-center">
                {index > 0 ? (
                  <span className="mx-2 inline-flex shrink-0 items-center text-[#aaa] max-[575px]:mx-1.5">
                    /
                  </span>
                ) : null}
                {href ? (
                  <a
                    {...linkProps}
                    href={href}
                    onClick={onClick}
                    className={twMerge(
                      contentVariants({ interactive: true, current: isCurrent }),
                      itemClassName,
                    )}
                    style={{ color, ...style }}
                  >
                    {content}
                  </a>
                ) : onClick ? (
                  <button
                    type="button"
                    onClick={onClick}
                    className={twMerge(
                      contentVariants({ interactive: true, current: isCurrent }),
                      "appearance-none border-0 bg-transparent [font:inherit]",
                      itemClassName,
                    )}
                    style={{ color, ...style }}
                  >
                    {content}
                  </button>
                ) : (
                  <span
                    className={twMerge(contentVariants({ current: isCurrent }), itemClassName)}
                    style={{ color, ...style }}
                  >
                    {content}
                  </span>
                )}
              </li>
            );
          },
        )}
      </ol>
    </nav>
  ),
);

Breadcrumb.displayName = "Breadcrumb";

const contentVariants = cva(
  "inline-flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-[#999]",
  {
    variants: {
      interactive: {
        true: "cursor-pointer no-underline transition-[color,background-color] hover:bg-[#f5f5f5] hover:text-[#111] focus-visible:bg-[#f5f5f5] focus-visible:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df] motion-reduce:transition-none",
        false: "",
      },
      current: {
        true: "font-medium text-[#111]",
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
      current: false,
    },
  },
);
