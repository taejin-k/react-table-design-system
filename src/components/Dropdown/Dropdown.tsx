import { useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type { DropdownClickInfo, DropdownItem, DropdownProps } from "./Dropdown.types";

export function Dropdown({
  children,
  menu,
  placement = "bottomLeft",
  trigger = "hover",
  arrow = false,
  disabled = false,
  open,
  defaultOpen = false,
  autoAdjustOverflow = true,
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  zIndex = 1050,
  className,
  onOpenChange,
}: DropdownProps) {
  const [innerSelectedValues, setInnerSelectedValues] = useState(menu.defaultSelectedValues ?? []);
  const selectedValues = menu.selectedValues ?? innerSelectedValues;
  const floating = useFloatingLayer({
    disabled,
    placement,
    trigger,
    open,
    defaultOpen,
    autoAdjustOverflow,
    mouseEnterDelay,
    mouseLeaveDelay,
    onOpenChange: (nextOpen) => onOpenChange?.(nextOpen),
  });
  const handleItemClick = (
    item: DropdownItem,
    valuePath: string[],
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (item.disabled || item.type === "divider" || item.type === "group" || item.children?.length)
      return;

    const info: DropdownClickInfo = { value: item.value, valuePath, event };
    item.onClick?.(info);
    menu.onClick?.(info);

    if (menu.selectable) {
      const nextSelectedValues = menu.multiple
        ? selectedValues.includes(item.value)
          ? selectedValues.filter((value) => value !== item.value)
          : [...selectedValues, item.value]
        : [item.value];
      if (menu.selectedValues === undefined) setInnerSelectedValues(nextSelectedValues);
      menu.onSelect?.({ value: item.value, selectedValues: nextSelectedValues });
    }

    if (!(menu.selectable && menu.multiple)) floating.changeOpen(false, "menu");
  };

  return (
    <>
      <span
        ref={floating.triggerRef}
        className={twMerge("inline-flex min-w-0", className)}
        {...floating.triggerProps}
      >
        {children}
      </span>
      {floating.isRendered && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={floating.popupRef}
              data-dropdown
              data-placement={floating.position?.placement ?? placement}
              className={twMerge(
                "fixed min-w-32 font-pretendard text-sm text-[#111]",
                !floating.isMotionVisible && "pointer-events-none",
              )}
              style={{
                left: floating.position?.left ?? 0,
                top: floating.position?.top ?? 0,
                zIndex,
                visibility: floating.position ? "visible" : "hidden",
              }}
              {...floating.popupProps}
            >
              <div
                data-dropdown-motion
                className="relative motion-reduce:transition-none"
                style={getPopupMotionStyle(
                  floating.position?.placement ?? placement,
                  floating.isMotionVisible && Boolean(floating.position),
                )}
              >
                <div className="relative rounded-lg bg-white p-1 shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]">
                  <MenuItems
                    items={menu.items}
                    selectedValues={selectedValues}
                    selectable={menu.selectable}
                    onItemClick={handleItemClick}
                  />
                </div>
                {arrow ? (
                  <span
                    data-dropdown-arrow
                    className="absolute size-2 rotate-45 bg-white"
                    style={floating.position?.arrowStyle}
                  />
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

interface MenuItemsProps {
  items: DropdownItem[];
  selectedValues: string[];
  selectable?: boolean;
  valuePath?: string[];
  onItemClick: (
    item: DropdownItem,
    valuePath: string[],
    event: React.MouseEvent<HTMLElement>,
  ) => void;
}

function MenuItems({
  items,
  selectedValues,
  selectable,
  valuePath = [],
  onItemClick,
}: MenuItemsProps) {
  const [openSubmenuValue, setOpenSubmenuValue] = useState<string | null>(null);

  return (
    <div className="grid gap-0.5">
      {items.map((item) => {
        const nextValuePath = [item.value, ...valuePath];
        if (item.type === "divider")
          return <div key={item.value} className="my-1 h-px bg-[#f0f0f0]" />;

        if (item.type === "group") {
          return (
            <div key={item.value}>
              {item.label ? (
                <div className="px-3 py-1 text-xs leading-5 text-[#999]">{item.label}</div>
              ) : null}
              {item.children?.length ? (
                <MenuItems
                  items={item.children}
                  selectedValues={selectedValues}
                  selectable={selectable}
                  valuePath={nextValuePath}
                  onItemClick={onItemClick}
                />
              ) : null}
            </div>
          );
        }

        const selected = selectable && selectedValues.includes(item.value);
        const content = (
          <button
            type="button"
            disabled={item.disabled}
            className={twMerge(
              "flex h-8 w-full cursor-pointer items-center gap-2 rounded px-3 text-left whitespace-nowrap transition-colors",
              selected ? "bg-selected text-primary" : "hover:bg-[#f5f5f5]",
              item.disabled && "cursor-not-allowed text-[#bbb] hover:bg-transparent",
            )}
            onClick={(event) => {
              if (item.children?.length) {
                setOpenSubmenuValue((current) => (current === item.value ? null : item.value));
                return;
              }
              onItemClick(item, nextValuePath, event);
            }}
          >
            {item.icon ? <span className="inline-flex shrink-0">{item.icon}</span> : null}
            <span className="min-w-0 flex-1">{item.label}</span>
            {item.extra ? <span className="shrink-0 text-xs text-[#999]">{item.extra}</span> : null}
            {item.children?.length ? <Icon icon="chevron-right" color="#999" /> : null}
          </button>
        );

        if (!item.children?.length) return <div key={item.value}>{content}</div>;

        return (
          <div key={item.value} className="group/submenu relative">
            {content}
            <div
              className={twMerge(
                "invisible absolute top-0 left-full z-10 ml-2 min-w-32 rounded-lg bg-white p-1 opacity-0 shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] transition-opacity group-hover/submenu:visible group-hover/submenu:opacity-100 before:absolute before:top-0 before:right-full before:h-full before:w-2 before:content-['']",
                openSubmenuValue === item.value && "visible opacity-100",
              )}
            >
              <MenuItems
                items={item.children}
                selectedValues={selectedValues}
                selectable={selectable}
                valuePath={nextValuePath}
                onItemClick={onItemClick}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
