import { Children, isValidElement } from "react";
import { twMerge } from "tailwind-merge";
import type {
  DescriptionComponent,
  DescriptionItem,
  DescriptionItemProps,
  DescriptionProps,
} from "./Description.types";

function Item(_props: DescriptionItemProps) {
  return null;
}

function DescriptionBase({
  items,
  children,
  title,
  extra,
  bordered = false,
  colon = true,
  column = 3,
  layout = "horizontal",
  size = "large",
  className,
  style,
}: DescriptionProps) {
  const childItems: DescriptionItem[] = Children.toArray(children).flatMap((child, index) =>
    isValidElement<DescriptionItemProps>(child) && child.type === Item
      ? [{ ...child.props, key: child.key ?? index }]
      : [],
  );
  const data = items ?? childItems;
  const columns = typeof column === "number" ? column : (column.md ?? column.sm ?? column.xs ?? 3);
  const padding = size === "small" ? "px-3 py-2" : size === "medium" ? "px-4 py-3" : "px-4 py-4";
  return (
    <div className={twMerge("font-pretendard text-sm text-[#111]", className)} style={style}>
      {title || extra ? (
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="text-base font-semibold">{title}</div>
          <div>{extra}</div>
        </div>
      ) : null}
      <dl
        className={twMerge(
          "grid",
          bordered && "overflow-hidden rounded-lg border border-[#d9d9d9]",
        )}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {data.map((item, index) => {
          const rawSpan =
            item.span === "filled"
              ? columns - (index % columns)
              : typeof item.span === "number"
                ? item.span
                : typeof item.span === "object"
                  ? (item.span.md ?? item.span.sm ?? item.span.xs ?? 1)
                  : 1;
          const span = Math.max(1, Math.min(columns, rawSpan));
          return (
            <div
              key={item.key ?? index}
              className={twMerge(
                "min-w-0",
                bordered ? "grid border-r border-b border-[#d9d9d9] last:border-r-0" : "mb-4 pr-4",
                layout === "vertical" && !bordered ? "gap-1" : "grid-cols-[auto_1fr]",
                item.className,
              )}
              style={{ gridColumn: `span ${span}`, ...item.style }}
            >
              <dt
                className={twMerge(
                  "text-[#666]",
                  bordered && `bg-[#fafafa] ${padding}`,
                  item.classNames?.label,
                )}
                style={{ ...item.labelStyle, ...item.styles?.label }}
              >
                {item.label}
                {colon && layout === "horizontal" && item.label ? (
                  <span className="mr-2 ml-0.5">:</span>
                ) : null}
              </dt>
              <dd
                className={twMerge("m-0 min-w-0", bordered && padding, item.classNames?.content)}
                style={{ ...item.contentStyle, ...item.styles?.content }}
              >
                {item.children}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export const Description = Object.assign(DescriptionBase, { Item }) as DescriptionComponent;
export const Descriptions = Description;
