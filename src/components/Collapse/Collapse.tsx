import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { CollapseItem, CollapseKeyType, CollapseProps } from "./Collapse.types";

function keys(value?: CollapseKeyType | CollapseKeyType[]) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
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
  const visitedKeys = useRef(new Set(opened.map(String)));
  const [renderedKeys, setRenderedKeys] = useState(new Set(opened.map(String)));
  useEffect(() => {
    opened.forEach((key) => visitedKeys.current.add(String(key)));
    setRenderedKeys((current) => new Set([...current, ...opened.map(String)]));
  }, [activeKey, innerKeys]);
  const toggle = (item: CollapseItem) => {
    const key = item.key;
    const isOpen = opened.some((value) => String(value) === String(key));
    const next = accordion
      ? isOpen
        ? []
        : [key]
      : isOpen
        ? opened.filter((value) => String(value) !== String(key))
        : [...opened, key];
    if (activeKey === undefined) setInnerKeys(next);
    onChange?.(accordion ? (next[0] ?? []) : next);
  };
  const padding =
    size === "large" ? "px-6 py-3" : size === "small" ? "px-3 py-1.5" : "px-4 py-2";
  return (
    <div
      className={twMerge(
        "overflow-hidden font-pretendard text-sm leading-[22px] text-[#111]",
        bordered && !ghost && "rounded-lg border border-[#ddd]",
        ghost && "bg-transparent",
        !ghost && "bg-[#fafafa]",
        className,
      )}
      style={style}
    >
      {items.map((item, index) => {
        const open = opened.some((value) => String(value) === String(item.key));
        const itemCollapsible = item.collapsible ?? collapsible;
        const disabled = itemCollapsible === "disabled";
        const arrow = expandIcon?.({ isActive: open, item }) ?? (
          <Icon icon="chevron-right" size={12} />
        );
        return (
          <section
            key={item.key}
            className={twMerge(
              index > 0 && bordered && !ghost && "border-t border-[#ddd]",
              item.className,
            )}
            style={item.style}
          >
            <div
              tabIndex={disabled ? -1 : 0}
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
              onTransitionEnd={(event) => {
                if (
                  event.propertyName !== "grid-template-rows" ||
                  open ||
                  !destroyOnHidden ||
                  item.forceRender
                )
                  return;
                setRenderedKeys((current) => {
                  const next = new Set(current);
                  next.delete(String(item.key));
                  return next;
                });
              }}
            >
              <div className="overflow-hidden">
                {open ||
                item.forceRender ||
                renderedKeys.has(String(item.key)) ||
                (!destroyOnHidden && visitedKeys.current.has(String(item.key))) ? (
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
