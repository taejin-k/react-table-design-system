import { Children, Fragment, isValidElement, useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import type {
  DescriptionBreakpointType,
  DescriptionComponent,
  DescriptionItemProps,
  DescriptionItemType,
  DescriptionProps,
  DescriptionResponsiveType,
} from "./Description.types";

function Item(_props: DescriptionItemProps) {
  return null;
}

const breakpoints: Record<DescriptionBreakpointType, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

const defaultColumns: DescriptionResponsiveType = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 3,
  xxl: 3,
};

interface ResolvedDescriptionItem extends DescriptionItemType {
  resolvedSpan: number;
}

function resolveResponsive(
  value: number | DescriptionResponsiveType | undefined,
  viewportWidth: number,
  fallback: number,
) {
  if (typeof value === "number") return value;

  return (Object.keys(breakpoints) as DescriptionBreakpointType[]).reduce(
    (current, breakpoint) =>
      viewportWidth >= breakpoints[breakpoint] && value?.[breakpoint] !== undefined
        ? value[breakpoint]!
        : current,
    fallback,
  );
}

function createRows(items: DescriptionItemType[], columns: number, viewportWidth: number) {
  const rows: ResolvedDescriptionItem[][] = [];
  let row: ResolvedDescriptionItem[] = [];
  let occupied = 0;

  items.forEach((item) => {
    const remaining = columns - occupied;
    const requestedSpan =
      item.span === "filled"
        ? remaining
        : typeof item.span === "object"
          ? resolveResponsive(item.span, viewportWidth, 1)
          : (item.span ?? 1);
    const resolvedSpan = Math.max(1, Math.min(remaining, requestedSpan));

    row.push({ ...item, resolvedSpan });
    occupied += resolvedSpan;

    if (item.span === "filled" || occupied >= columns) {
      rows.push(row);
      row = [];
      occupied = 0;
    }
  });

  if (row.length) {
    const lastItem = row[row.length - 1];
    lastItem.resolvedSpan += columns - occupied;
    rows.push(row);
  }

  return rows;
}

function DescriptionBase({
  items,
  children,
  title,
  extra,
  bordered = false,
  colon = true,
  column,
  layout = "horizontal",
  size = "lg",
  className,
}: DescriptionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window === "undefined" ? 768 : window.innerWidth,
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateContainerWidth = () => {
      const width = root.getBoundingClientRect().width;
      setContainerWidth(width || window.innerWidth);
    };

    updateContainerWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateContainerWidth);
      return () => window.removeEventListener("resize", updateContainerWidth);
    }

    const observer = new ResizeObserver(updateContainerWidth);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const childItems: DescriptionItemType[] = Children.toArray(children).flatMap((child, index) =>
    isValidElement<DescriptionItemProps>(child) && child.type === Item
      ? [{ ...child.props, key: child.key ?? index }]
      : [],
  );
  const data = items ?? childItems;
  const columns = Math.max(
    1,
    resolveResponsive(column ?? defaultColumns, containerWidth, containerWidth < 576 ? 1 : 3),
  );
  const rows = createRows(data, columns, containerWidth);
  const borderedPadding = size === "sm" ? "px-4 py-2" : size === "md" ? "px-6 py-3" : "px-6 py-4";
  const itemPaddingBottom = size === "sm" ? "pb-2" : size === "md" ? "pb-3" : "pb-4";

  const borderedCellClass = (hasBottomBorder: boolean) =>
    twMerge(
      "border-r border-[#f0f0f0] text-left align-top font-normal last:border-r-0",
      hasBottomBorder && "border-b",
      borderedPadding,
    );
  const itemCellClass = (hasBottomPadding: boolean) =>
    twMerge(
      "pr-4 text-left align-top font-normal last:pr-0",
      hasBottomPadding && itemPaddingBottom,
    );

  const renderLabel = (item: ResolvedDescriptionItem, showColon: boolean) => (
    <span className="inline-flex shrink-0 items-baseline whitespace-nowrap text-[#666]">
      {item.label}
      {showColon && item.label !== undefined && item.label !== null ? (
        <span className="relative -top-px mr-2 ml-0.5">:</span>
      ) : null}
    </span>
  );

  const renderContent = (item: ResolvedDescriptionItem) => (
    <span className="min-w-0 flex-1 [overflow-wrap:anywhere] text-[#111]">{item.children}</span>
  );

  return (
    <div
      ref={rootRef}
      className={twMerge("min-w-0 font-pretendard text-sm leading-[1.5715] text-[#111]", className)}
    >
      {title || extra ? (
        <div className="mb-5 flex items-center">
          {title ? (
            <div className="min-w-0 flex-auto text-base leading-6 font-semibold [overflow-wrap:anywhere]">
              {title}
            </div>
          ) : null}
          {extra ? <div className="ml-auto text-sm text-[#111]">{extra}</div> : null}
        </div>
      ) : null}
      <div
        data-description-view
        className={twMerge(
          "w-full rounded-lg border border-transparent",
          bordered && "overflow-hidden border-[#f0f0f0]",
        )}
      >
        <table className="w-full table-fixed border-separate border-spacing-0">
          <colgroup>
            {layout === "horizontal" && bordered
              ? Array.from({ length: columns }, (_, index) => (
                  <Fragment key={`columns-${index}`}>
                    <col style={{ width: `${40 / columns}%` }} />
                    <col style={{ width: `${60 / columns}%` }} />
                  </Fragment>
                ))
              : Array.from({ length: columns }, (_, index) => (
                  <col key={`column-${index}`} style={{ width: `${100 / columns}%` }} />
                ))}
          </colgroup>
          <tbody>
            {rows.map((row, rowIndex) => {
              const isLastRow = rowIndex === rows.length - 1;

              if (layout === "vertical") {
                return (
                  <Fragment key={`row-${rowIndex}`}>
                    <tr>
                      {row.map((item, itemIndex) => (
                        <th
                          key={`label-${item.key ?? itemIndex}`}
                          colSpan={item.resolvedSpan}
                          className={twMerge(
                            bordered ? borderedCellClass(true) : itemCellClass(true),
                            bordered && "min-w-0 bg-[#fafafa] [overflow-wrap:anywhere] text-[#666]",
                          )}
                        >
                          {bordered ? item.label : renderLabel(item, colon)}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {row.map((item, itemIndex) => (
                        <td
                          key={`content-${item.key ?? itemIndex}`}
                          colSpan={item.resolvedSpan}
                          className={twMerge(
                            bordered ? borderedCellClass(!isLastRow) : itemCellClass(!isLastRow),
                            bordered && "min-w-0 [overflow-wrap:anywhere] text-[#111]",
                          )}
                        >
                          {bordered ? item.children : renderContent(item)}
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                );
              }

              if (bordered) {
                return (
                  <tr key={`row-${rowIndex}`}>
                    {row.flatMap((item, itemIndex) => [
                      <th
                        key={`label-${item.key ?? itemIndex}`}
                        className={twMerge(
                          borderedCellClass(!isLastRow),
                          "min-w-0 bg-[#fafafa] [overflow-wrap:anywhere] text-[#666]",
                        )}
                      >
                        {item.label}
                      </th>,
                      <td
                        key={`content-${item.key ?? itemIndex}`}
                        colSpan={item.resolvedSpan * 2 - 1}
                        className={twMerge(
                          borderedCellClass(!isLastRow),
                          "min-w-0 [overflow-wrap:anywhere] text-[#111]",
                        )}
                      >
                        {item.children}
                      </td>,
                    ])}
                  </tr>
                );
              }

              return (
                <tr key={`row-${rowIndex}`}>
                  {row.map((item, itemIndex) => (
                    <td
                      key={item.key ?? itemIndex}
                      colSpan={item.resolvedSpan}
                      className={itemCellClass(!isLastRow)}
                    >
                      <div className="flex min-w-0">
                        {renderLabel(item, colon)}
                        {renderContent(item)}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Description = Object.assign(DescriptionBase, { Item }) as DescriptionComponent;
export const Descriptions = Description;
