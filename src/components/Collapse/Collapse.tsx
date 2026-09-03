import { useEffect, useRef, useState, type Key } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { CollapseItem, CollapseProps } from "./Collapse.types";

function keys(value?: Key[]) {
  return value ?? [];
}

function includesKey(values: Key[], key: Key) {
  return values.some((value) => Object.is(value, key));
}

export function Collapse({
  items = [],
  accordion = false,
  activeKey,
  defaultActiveKey,
  bordered = true,
  expandIconPlacement = "start",
  ghost = false,
  size = "md",
  className,
  onChange,
}: CollapseProps) {
  const [innerKeys, setInnerKeys] = useState(() => keys(defaultActiveKey));
  const opened = activeKey === undefined ? innerKeys : keys(activeKey);
  const visitedKeys = useRef(new Set(opened));
  useEffect(() => {
    opened.forEach((key) => visitedKeys.current.add(key));
  }, [activeKey, innerKeys]);
  const toggle = (item: CollapseItem) => {
    const key = item.key;
    const isOpen = includesKey(opened, key);
    const next = accordion
      ? isOpen
        ? []
        : [key]
      : isOpen
        ? opened.filter((value) => !Object.is(value, key))
        : [...opened, key];
    if (activeKey === undefined) setInnerKeys(next);
    onChange?.(next);
  };
  const headerSize =
    size === "lg"
      ? "min-h-[46px] px-6 py-3"
      : size === "sm"
        ? "min-h-[30px] px-3 py-1"
        : "min-h-[38px] px-4 py-2";
  const bodyPadding = size === "lg" ? "px-6 py-4" : size === "sm" ? "px-3 py-2" : "px-4 py-3";
  return (
    <div
      className={twMerge(
        "min-w-0 overflow-hidden border border-transparent font-pretendard text-sm leading-[22px] text-dark",
        !ghost && "rounded-lg",
        bordered && !ghost && "border-border",
        ghost && "bg-transparent",
        !ghost && "bg-hover",
        className,
      )}
    >
      {items.map((item, index) => {
        const open = includesKey(opened, item.key);
        const itemCollapsible = item.collapsible ?? "header";
        const disabled = itemCollapsible === "disabled";
        const arrow = <Icon icon="chevron-right" size={12} />;
        const arrowClassName = twMerge(
          "inline-flex transition-transform duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
          !disabled && "cursor-pointer",
        );
        return (
          <section
            key={item.key}
            className={twMerge(
              index > 0 && "border-t border-transparent",
              index > 0 && bordered && !ghost && "border-border",
            )}
          >
            <div
              tabIndex={disabled ? -1 : 0}
              className={twMerge(
                "flex items-center gap-3 bg-black/[0.02] transition-colors hover:bg-hover motion-reduce:transition-none",
                ghost && "bg-transparent hover:bg-transparent",
                disabled
                  ? "cursor-not-allowed text-disabled"
                  : itemCollapsible === "icon"
                    ? "cursor-default"
                    : "cursor-pointer",
                headerSize,
              )}
              onClick={() => itemCollapsible !== "icon" && !disabled && toggle(item)}
              onKeyDown={(event) => {
                if (
                  itemCollapsible !== "icon" &&
                  !disabled &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  toggle(item);
                }
              }}
            >
              {item.showArrow !== false && expandIconPlacement === "start" ? (
                <span
                  className={arrowClassName}
                  style={{ transform: open ? "rotate(90deg)" : undefined }}
                  onClick={(event) => {
                    if (itemCollapsible === "icon") {
                      event.stopPropagation();
                      toggle(item);
                    }
                  }}
                >
                  {arrow}
                </span>
              ) : null}
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                {item.label}
              </span>
              {item.extra ? (
                <span onClick={(event) => event.stopPropagation()}>{item.extra}</span>
              ) : null}
              {item.showArrow !== false && expandIconPlacement === "end" ? (
                <span
                  className={arrowClassName}
                  style={{ transform: open ? "rotate(90deg)" : undefined }}
                  onClick={(event) => {
                    if (itemCollapsible === "icon") {
                      event.stopPropagation();
                      toggle(item);
                    }
                  }}
                >
                  {arrow}
                </span>
              ) : null}
            </div>
            <div
              className="grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                {open || visitedKeys.current.has(item.key) ? (
                  <div
                    className={twMerge(
                      "min-w-0 bg-white [overflow-wrap:anywhere] break-words whitespace-pre-wrap",
                      ghost && "bg-transparent",
                      bodyPadding,
                    )}
                  >
                    {item.children}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
