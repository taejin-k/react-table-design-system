import {
  useEffect,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon/Icon";
import { Input } from "../Input";
import type { PaginationConfig, PaginationPlacement } from "./Table.types";

type PaginationProps = {
  config: PaginationConfig;
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
  placement: PaginationPlacement;
  onChange: (page: number, size?: number) => void;
  className?: string;
  style?: CSSProperties;
};

type PageItem = number | "jump-prev" | "jump-next";

function pageItems(current: number, total: number, less: boolean): PageItem[] {
  const buffer = less ? 1 : 2;
  if (total <= 3 + buffer * 2) return Array.from({ length: total }, (_, index) => index + 1);
  let left = Math.max(1, current - buffer);
  let right = Math.min(current + buffer, total);
  if (current - 1 <= buffer) right = 1 + buffer * 2;
  if (total - current <= buffer) left = total - buffer * 2;
  const hasJumpPrev = current - 1 >= buffer * 2 && current !== 3;
  const hasJumpNext = total - current >= buffer * 2 && current !== total - 2;
  if (!less && hasJumpPrev && right !== total) left += 1;
  if (!less && hasJumpNext && left !== 1) right -= 1;
  const items: PageItem[] = [];
  for (let page = left; page <= right; page += 1) items.push(page);
  if (hasJumpPrev) items.unshift("jump-prev");
  if (left !== 1) items.unshift(1);
  if (hasJumpNext) items.push("jump-next");
  if (right !== total) items.push(total);
  return items;
}

const navVariants = cva(
  "flex flex-wrap items-center gap-2 font-pretendard text-[14px] text-[#111]",
  {
    variants: {
      align: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
      },
    },
    defaultVariants: { align: "end" },
  },
);

const itemSizeVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded border border-transparent text-[#111] transition-colors hover:bg-[#f5f5f5] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-[current=page]:border-[#0062df] aria-[current=page]:bg-[#0062df] aria-[current=page]:text-white aria-[current=page]:transition-none aria-[current=page]:hover:bg-[#0062df]",
  {
    variants: {
      size: {
        large: "h-[40px] min-w-[40px] px-2",
        medium: "h-[32px] min-w-[32px] px-1.5",
        small: "h-[24px] min-w-[24px] px-1",
      },
    },
    defaultVariants: { size: "medium" },
  },
);

const controlClass =
  "h-[32px] rounded border border-[#ddd] bg-white px-2 font-pretendard text-[14px] text-[#111] outline-none transition-colors focus-visible:border-[#0062df] disabled:bg-[#f8f8f8] disabled:text-[#999]";

export function Pagination({
  config,
  page,
  pageSize,
  total,
  pageCount,
  placement,
  onChange,
  className = "",
  style,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");
  const [simpleValue, setSimpleValue] = useState(String(page));
  useEffect(() => setSimpleValue(String(page)), [page]);
  const locale = config.locale ?? {};
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(total, page * pageSize);
  const sizeChanger = config.showSizeChanger ?? total > (config.totalBoundaryShowSizeChanger ?? 50);
  const pageSizeOptions = [
    ...new Set([pageSize, ...(config.pageSizeOptions ?? [10, 20, 50, 100]).map(Number)]),
  ].sort((left, right) => left - right);
  const disabled = config.disabled ?? false;
  const size = config.size ?? "medium";
  const semanticClassNames =
    typeof config.classNames === "function"
      ? config.classNames({ current: page, pageSize, total })
      : config.classNames;
  const semanticStyles =
    typeof config.styles === "function"
      ? config.styles({ current: page, pageSize, total })
      : config.styles;
  const placementAlign = placement.endsWith("Start")
    ? "start"
    : placement.endsWith("Center")
      ? "center"
      : "end";
  const align = config.align ?? placementAlign;
  const itemClassName = twMerge(itemSizeVariants({ size }), semanticClassNames?.item);
  const itemStyle = semanticStyles?.item;

  const jump = (next: number) => onChange(Math.max(1, Math.min(pageCount, next)));
  const commitJump = () => {
    if (!jumpValue.trim()) return;
    const next = Number(jumpValue);
    if (Number.isFinite(next)) jump(next);
    setJumpValue("");
  };
  const commitSimple = () => {
    if (!simpleValue.trim()) {
      setSimpleValue(String(page));
      return;
    }
    const next = Number(simpleValue);
    if (Number.isInteger(next)) jump(next);
    else setSimpleValue(String(page));
  };
  const simpleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commitSimple();
    if (event.key === "ArrowUp" || event.key === "ArrowDown") event.preventDefault();
  };
  const simpleBlur = (_event: FocusEvent<HTMLInputElement>) => commitSimple();

  const prev = (
    <button
      type="button"
      className={itemClassName}
      style={itemStyle}
      title={config.showTitle === false ? undefined : (locale.prev_page ?? "이전 페이지")}
      aria-label={locale.prev_page ?? "이전 페이지"}
      disabled={disabled || page <= 1}
      onClick={() => jump(page - 1)}
    >
      <Icon icon="chevron-left" size={12} />
    </button>
  );
  const next = (
    <button
      type="button"
      className={itemClassName}
      style={itemStyle}
      title={config.showTitle === false ? undefined : (locale.next_page ?? "다음 페이지")}
      aria-label={locale.next_page ?? "다음 페이지"}
      disabled={disabled || page >= pageCount}
      onClick={() => jump(page + 1)}
    >
      <Icon icon="chevron-right" size={12} />
    </button>
  );

  return (
    <nav
      className={twMerge(
        navVariants({ align }),
        config.className,
        className,
        semanticClassNames?.root,
      )}
      style={{ ...config.style, ...style, ...semanticStyles?.root }}
      aria-label={config["aria-label"] ?? "페이지네이션"}
    >
      {config.showTotal && (
        <span className="text-[#999]">{config.showTotal(total, [start, end])}</span>
      )}
      <div className="flex items-center gap-1">
        {prev}
        {config.simple ? (
          <span className="flex items-center gap-1">
            <input
              aria-label="현재 페이지"
              inputMode="numeric"
              disabled={disabled}
              readOnly={typeof config.simple === "object" && config.simple.readOnly}
              value={simpleValue}
              onChange={(event) => {
                if (/^\d*$/.test(event.target.value)) setSimpleValue(event.target.value);
              }}
              onKeyDown={simpleKeyDown}
              onBlur={simpleBlur}
              className={twMerge(controlClass, "w-[40px] text-center")}
            />
            <span className="text-[#999]">/</span>
            <span>{pageCount}</span>
          </span>
        ) : (
          pageItems(page, pageCount, config.showLessItems ?? false).map((item) => {
            if (item === "jump-prev" || item === "jump-next") {
              const delta = config.showLessItems ? 3 : 5;
              const target = item === "jump-prev" ? page - delta : page + delta;
              const label =
                item === "jump-prev"
                  ? ((delta === 3 ? locale.prev_3 : locale.prev_5) ?? `이전 ${delta}페이지`)
                  : ((delta === 3 ? locale.next_3 : locale.next_5) ?? `다음 ${delta}페이지`);
              const element = (
                <button
                  type="button"
                  className={twMerge(itemClassName, "text-[#999] hover:text-[#111]")}
                  style={itemStyle}
                  title={config.showTitle === false ? undefined : label}
                  aria-label={label}
                  disabled={disabled}
                  onClick={() => jump(target)}
                >
                  •••
                </button>
              );
              return (
                <span key={item}>{config.showPrevNextJumpers === false ? null : element}</span>
              );
            }
            const element = (
              <button
                type="button"
                className={itemClassName}
                style={itemStyle}
                title={
                  config.showTitle === false ? undefined : `${item} ${locale.page ?? "페이지"}`
                }
                aria-label={`${item} ${locale.page ?? "페이지"}`}
                aria-current={item === page ? "page" : undefined}
                disabled={disabled}
                onClick={() => jump(item)}
              >
                {item}
              </button>
            );
            return <span key={item}>{element}</span>;
          })
        )}
        {next}
      </div>
      {sizeChanger && (
        <select
          aria-label={locale.page_size ?? "페이지 크기"}
          disabled={
            disabled ||
            (typeof config.showSizeChanger === "object" && config.showSizeChanger.disabled)
          }
          value={pageSize}
          onChange={(event) => {
            const nextSize = Number(event.target.value);
            const nextPage = Math.min(page, Math.max(1, Math.ceil(total / nextSize)));
            config.onShowSizeChange?.(page, nextSize);
            onChange(nextPage, nextSize);
          }}
          className={twMerge(
            controlClass,
            "cursor-pointer appearance-none bg-[length:10px_10px] bg-[position:right_8px_center] bg-no-repeat pr-6 disabled:cursor-not-allowed",
            "bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2010%2010%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23999%22%20stroke-width%3D%221.4%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m2%203.5%203%203%203-3%22%2F%3E%3C%2Fsvg%3E')]",
          )}
        >
          {pageSizeOptions.map((value) => (
            <option key={value} value={value}>
              {value} {locale.items_per_page ?? "/ 페이지"}
            </option>
          ))}
        </select>
      )}
      {total > pageSize && config.showQuickJumper && (
        <form
          className="flex items-center gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            commitJump();
          }}
        >
          <label className="flex items-center gap-1 text-[#999]">
            {locale.jump_to ?? "이동"}
            <Input
              aria-label="이동할 페이지"
              className="w-[48px] [&_input]:text-center"
              inputMode="numeric"
              disabled={disabled}
              size="md"
              value={jumpValue}
              onChange={(value) => {
                if (/^\d*$/.test(value)) setJumpValue(value);
              }}
            />
          </label>
          {typeof config.showQuickJumper === "object" && config.showQuickJumper.goButton ? (
            <button
              type="submit"
              disabled={disabled}
              className="cursor-pointer rounded bg-[#0062df] px-2 py-1 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {config.showQuickJumper.goButton}
            </button>
          ) : (
            <span className="text-[#999]">{locale.page ?? "페이지"}</span>
          )}
        </form>
      )}
    </nav>
  );
}
