import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { CollapseItem, CollapseKey, CollapseProps } from "./Collapse.types";

function keys(value?: CollapseKey | CollapseKey[]) {
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : [value]).map(String);
}

export function Collapse({
  items = [],
  accordion = false,
  activeKey,
  defaultActiveKey,
  bordered = true,
  collapsible,
  destroyOnHidden = false,
  expandIcon,
  expandIconPlacement = "start",
  ghost = false,
  size = "medium",
  className,
  style,
  onChange,
}: CollapseProps) {
  const [innerKeys, setInnerKeys] = useState(() => keys(defaultActiveKey));
  const opened = activeKey === undefined ? innerKeys : keys(activeKey);
  const toggle = (item: CollapseItem) => {
    const key = String(item.key);
    const isOpen = opened.includes(key);
    const next = accordion
      ? isOpen
        ? []
        : [key]
      : isOpen
        ? opened.filter((value) => value !== key)
        : [...opened, key];
    if (activeKey === undefined) setInnerKeys(next);
    onChange?.(accordion ? (next[0] ?? "") : next);
  };
  const padding = size === "large" ? "px-6 py-4" : size === "small" ? "px-3 py-2" : "px-4 py-3";
  return (
    <div
      className={twMerge(
        "overflow-hidden font-pretendard text-sm text-[#111]",
        bordered && !ghost && "rounded-lg border border-[#d9d9d9]",
        ghost && "bg-transparent",
        !ghost && "bg-[#fafafa]",
        className,
      )}
      style={style}
    >
      {items.map((item, index) => {
        const open = opened.includes(String(item.key));
        const itemCollapsible = item.collapsible ?? collapsible;
        const disabled = itemCollapsible === "disabled";
        const arrow = expandIcon?.({ isActive: open, item }) ?? (
          <Icon icon="chevron-right" size={12} />
        );
        return (
          <section
            key={item.key}
            className={twMerge(
              index > 0 && bordered && !ghost && "border-t border-[#d9d9d9]",
              item.className,
            )}
            style={item.style}
          >
            <div
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-expanded={open}
              aria-disabled={disabled}
              className={twMerge(
                "flex items-center gap-3 bg-[rgba(0,0,0,0.02)] transition-colors hover:bg-[#f0f0f0] motion-reduce:transition-none",
                ghost && "bg-transparent hover:bg-transparent",
                disabled ? "cursor-not-allowed text-[#bbb]" : "cursor-pointer",
                padding,
                item.classNames?.header,
              )}
              style={item.styles?.header}
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
                  className="inline-flex transition-transform duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none"
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
              <span className="min-w-0 flex-1">{item.label}</span>
              {item.extra ? (
                <span onClick={(event) => event.stopPropagation()}>{item.extra}</span>
              ) : null}
              {item.showArrow !== false && expandIconPlacement === "end" ? (
                <span
                  className="inline-flex transition-transform duration-200"
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
                {open || item.forceRender || !destroyOnHidden ? (
                  <div
                    className={twMerge(
                      "bg-white",
                      ghost && "bg-transparent",
                      padding,
                      item.classNames?.body,
                    )}
                    style={item.styles?.body}
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
