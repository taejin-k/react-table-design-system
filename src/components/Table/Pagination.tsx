import {
  useEffect,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Icon } from "../Icon/Icon";
import { Input } from "../Input";
import { Select } from "../Select";
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
  "flex min-w-0 flex-nowrap items-center gap-2 font-pretendard text-[14px] text-[#111]",
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
  "inline-flex cursor-pointer items-center justify-center rounded border border-transparent text-[#111] transition-colors hover:bg-[#f5f5f5] disabled:pointer-events-none disabled:cursor-not-allowed disabled:!border-transparent disabled:!bg-transparent disabled:opacity-40 disabled:!ring-transparent aria-[current=page]:border-[#0062df] aria-[current=page]:bg-[#0062df] aria-[current=page]:text-white aria-[current=page]:transition-none aria-[current=page]:hover:bg-[#0062df] disabled:aria-[current=page]:!bg-[#0062df] disabled:aria-[current=page]:!opacity-60",
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
  const buttonSize = size === "large" ? "lg" : size === "small" ? "sm" : "md";

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
    <Button
      variant="ghost"
      size={buttonSize}
      iconOnly
      prefixIcon={<Icon icon="chevron-left" size={12} />}
      className={itemClassName}
      style={itemStyle}
      aria-label={locale.prev_page ?? "이전 페이지"}
      disabled={disabled || page <= 1}
      onClick={() => jump(page - 1)}
    />
  );
  const next = (
    <Button
      variant="ghost"
      size={buttonSize}
      iconOnly
      prefixIcon={<Icon icon="chevron-right" size={12} />}
      className={itemClassName}
      style={itemStyle}
      aria-label={locale.next_page ?? "다음 페이지"}
      disabled={disabled || page >= pageCount}
      onClick={() => jump(page + 1)}
    />
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
            <Input
              aria-label="현재 페이지"
              inputMode="numeric"
              disabled={disabled}
              readOnly={typeof config.simple === "object" && config.simple.readOnly}
              value={simpleValue}
              onChange={(value) => {
                if (/^\d*$/.test(value)) setSimpleValue(value);
              }}
              onKeyDown={simpleKeyDown}
              onBlur={simpleBlur}
              className="w-[40px] [&_input]:text-center"
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
                <Button
                  variant="ghost"
                  size={buttonSize}
                  className={twMerge(itemClassName, "text-[#999] hover:text-[#111]")}
                  style={itemStyle}
                  aria-label={label}
                  disabled={disabled}
                  onClick={() => jump(target)}
                >
                  •••
                </Button>
              );
              return (
                <span key={item}>{config.showPrevNextJumpers === false ? null : element}</span>
              );
            }
            const label = `${item} ${locale.page ?? "페이지"}`;
            const element = (
              <Button
                variant="ghost"
                size={buttonSize}
                className={itemClassName}
                style={itemStyle}
                aria-label={label}
                aria-current={item === page ? "page" : undefined}
                disabled={disabled}
                onClick={() => jump(item)}
              >
                {item}
              </Button>
            );
            return <span key={item}>{element}</span>;
          })
        )}
        {next}
      </div>
      {sizeChanger && (
        <Select
          options={pageSizeOptions.map((value) => ({
            label: `${value} ${locale.items_per_page ?? "/ 페이지"}`,
            value,
          }))}
          disabled={
            disabled ||
            (typeof config.showSizeChanger === "object" && config.showSizeChanger.disabled)
          }
          value={pageSize}
          width={112}
          onChange={(value) => {
            if (Array.isArray(value) || value == null || typeof value === "object") return;
            const nextSize = Number(value);
            const nextPage = Math.min(page, Math.max(1, Math.ceil(total / nextSize)));
            config.onShowSizeChange?.(page, nextSize);
            onChange(nextPage, nextSize);
          }}
        />
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
            <Button type="submit" disabled={disabled}>
              {config.showQuickJumper.goButton}
            </Button>
          ) : (
            <span className="text-[#999]">{locale.page ?? "페이지"}</span>
          )}
        </form>
      )}
    </nav>
  );
}
