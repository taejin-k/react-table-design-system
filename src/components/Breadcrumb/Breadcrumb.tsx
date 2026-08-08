import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import type { BreadcrumbProps } from './Breadcrumb.types';

const rootClass = 'font-pretendard text-[14px] leading-[22px]';
const listClass = 'm-0 flex min-w-0 list-none flex-wrap items-center gap-y-1 p-0';
const itemClass = 'inline-flex min-w-0 items-center';
const contentClass = 'inline-flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-[#999]';
const linkClass =
  'cursor-pointer no-underline transition-[color,background-color] hover:bg-[#f5f5f5] hover:text-[#111] focus-visible:bg-[#f5f5f5] focus-visible:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df] motion-reduce:transition-none';
const currentClass = 'font-medium text-[#111]';
const separatorClass = 'mx-2 inline-flex shrink-0 items-center text-[#aaa] max-[575px]:mx-1.5';

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items = [], className, 'aria-label': ariaLabel = 'Breadcrumb', ...rest }, ref) => (
    <nav ref={ref} aria-label={ariaLabel} className={twMerge(rootClass, className)} {...rest}>
      <ol className={listClass}>
        {items.map(({ key, title, href, icon, color, className: itemClassName, style, ...linkProps }, index) => {
          const isCurrent = index === items.length - 1;
          const content = (
            <>
              {icon ? <span className="inline-flex size-4 shrink-0 items-center justify-center" aria-hidden>{icon}</span> : null}
              <span className="min-w-0 truncate">{title}</span>
            </>
          );

          return (
            <li key={key ?? index} className={itemClass}>
              {index > 0 ? <span className={separatorClass} aria-hidden>/</span> : null}
              {href ? (
                <a
                  {...linkProps}
                  href={href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={twMerge(contentClass, linkClass, isCurrent && currentClass, itemClassName)}
                  style={{ color, ...style }}
                >
                  {content}
                </a>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className={twMerge(contentClass, isCurrent && currentClass, itemClassName)}
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

Breadcrumb.displayName = 'Breadcrumb';
