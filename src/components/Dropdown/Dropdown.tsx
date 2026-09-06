import { useCallback, useLayoutEffect, useRef, useState, type Key, type ReactNode } from "react";
import { MultilineText } from "../_internal/MultilineText";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import { observeFloatingResize } from "../_internal/observe-floating-resize";
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
    onOpenChange: (nextOpen) => onOpenChange?.(nextOpen),
  });
  const handleItemClick = (item: DropdownItem, event: React.MouseEvent<HTMLElement>) => {
    if (item.disabled || item.type === "divider" || item.type === "group" || item.children?.length)
      return;

    const info: DropdownClickInfo = { value: item.value, event };
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
        className={twMerge("inline-flex max-w-full min-w-0", className)}
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
                "fixed max-w-[calc(100vw-16px)] min-w-32 font-pretendard text-sm text-dark",
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
                <div className="relative rounded-lg bg-white p-1 shadow-2xl">
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
  selectedValues: Key[];
  selectable?: boolean;
  onItemClick: (item: DropdownItem, event: React.MouseEvent<HTMLElement>) => void;
}

function MenuItems({ items, selectedValues, selectable, onItemClick }: MenuItemsProps) {
  const [openSubmenuValue, setOpenSubmenuValue] = useState<Key | null>(null);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-0.5">
      {items.map((item) => {
        if (item.type === "divider")
          return <div key={item.value} className="my-1 h-px bg-border" />;

        if (item.type === "group") {
          return (
            <div key={item.value} className="min-w-0">
              {item.label ? (
                <div className="px-3 py-1 text-xs leading-5 text-gray">
                  <MultilineText wrap>{item.label}</MultilineText>
                </div>
              ) : null}
              {item.children?.length ? (
                <MenuItems
                  items={item.children}
                  selectedValues={selectedValues}
                  selectable={selectable}
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
              "flex h-8 w-full cursor-pointer items-center gap-2 rounded px-3 text-left whitespace-nowrap transition-colors duration-200 ease-out outline-none motion-reduce:transition-none",
              selected ? "bg-selected text-primary" : "hover:bg-hover",
              item.disabled && "cursor-not-allowed text-disabled hover:bg-transparent",
            )}
            onClick={(event) => {
              if (item.children?.length) {
                setOpenSubmenuValue((current) => (current === item.value ? null : item.value));
                return;
              }
              onItemClick(item, event);
            }}
          >
            {item.icon ? <span className="inline-flex shrink-0">{item.icon}</span> : null}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.extra ? (
              <span className="max-w-[50%] min-w-0 shrink truncate text-xs text-gray">
                {item.extra}
              </span>
            ) : null}
            {item.children?.length ? <Icon icon="chevron-right" color="disabled" /> : null}
          </button>
        );

        if (!item.children?.length)
          return (
            <div key={item.value} className="min-w-0">
              {content}
            </div>
          );

        return (
          <Submenu
            key={item.value}
            trigger={content}
            disabled={item.disabled}
            open={openSubmenuValue === item.value}
          >
            <MenuItems
              items={item.children}
              selectedValues={selectedValues}
              selectable={selectable}
              onItemClick={onItemClick}
            />
          </Submenu>
        );
      })}
    </div>
  );
}

function Submenu({
  trigger,
  children,
  disabled,
  open,
}: {
  trigger: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  open: boolean;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const hoveredRef = useRef(false);
  const hasOpenedRef = useRef(false);
  const currentSideRef = useRef<boolean | null>(null);
  openRef.current = open;
  const [position, setPosition] = useState({ left: 0, top: 0, maxWidth: 0, toLeft: false });
  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const popup = popupRef.current;
    const active = openRef.current || hoveredRef.current;
    if (!anchor || !popup || (!active && hasOpenedRef.current)) return;
    const rect = anchor.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const rightSpace = viewportWidth - rect.right - 16;
    const leftSpace = rect.left - 16;
    const currentSide = active ? currentSideRef.current : null;
    const toLeft =
      currentSide !== null && popup.offsetWidth <= (currentSide ? leftSpace : rightSpace)
        ? currentSide
        : popup.offsetWidth > rightSpace && leftSpace > rightSpace;
    if (active) {
      currentSideRef.current = toLeft;
      hasOpenedRef.current = true;
    }
    const available = Math.max(leftSpace, rightSpace);
    const maxWidth = Math.max(0, Math.min(viewportWidth - 16, Math.max(128, available)));
    const width = Math.min(popup.offsetWidth, maxWidth);
    const left =
      Math.max(
        8,
        Math.min(toLeft ? rect.left - 8 - width : rect.right + 8, viewportWidth - width - 8),
      ) - rect.left;
    const top =
      Math.max(
        8,
        Math.min(rect.top, document.documentElement.clientHeight - popup.offsetHeight - 8),
      ) - rect.top;
    setPosition((current) =>
      current.left === left &&
      current.top === top &&
      current.maxWidth === maxWidth &&
      current.toLeft === toLeft
        ? current
        : { left, top, maxWidth, toLeft },
    );
  }, []);
  useLayoutEffect(() => {
    if (!open && !hoveredRef.current) currentSideRef.current = null;
    updatePosition();
  });
  useLayoutEffect(() => {
    const observer = observeFloatingResize(updatePosition);
    if (anchorRef.current) observer?.observe(anchorRef.current);
    if (popupRef.current) observer?.observe(popupRef.current);
    window.addEventListener("resize", updatePosition);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);
  return (
    <div
      ref={anchorRef}
      onMouseEnter={() => {
        hoveredRef.current = !disabled;
        updatePosition();
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        if (!openRef.current) currentSideRef.current = null;
      }}
      className={twMerge("relative min-w-0", !disabled && "group/submenu")}
    >
      {trigger}
      <div
        ref={popupRef}
        data-dropdown-submenu
        className={twMerge(
          "invisible absolute z-10 min-w-32 scale-x-[0.8] rounded-lg bg-white p-1 opacity-0 shadow-2xl transition-[opacity,scale,visibility] duration-200 ease-out group-hover/submenu:visible group-hover/submenu:scale-x-100 group-hover/submenu:opacity-100 before:absolute before:top-0 before:h-full before:w-2 before:content-[''] motion-reduce:transition-none",
          position.toLeft ? "origin-right before:left-full" : "origin-left before:right-full",
          !disabled && open && "visible scale-x-100 opacity-100",
        )}
        style={{
          left: position.maxWidth ? position.left : "100%",
          top: position.top,
          maxWidth: position.maxWidth || "calc(100vw - 16px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
