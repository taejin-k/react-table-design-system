import { useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
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
  const [innerSelectedKeys, setInnerSelectedKeys] = useState(menu.defaultSelectedKeys ?? []);
  const selectedKeys = menu.selectedKeys ?? innerSelectedKeys;
  const floating = useFloatingLayer({
    disabled,
    placement,
    trigger,
    open,
    defaultOpen,
    autoAdjustOverflow,
    mouseEnterDelay,
    mouseLeaveDelay,
    onOpenChange: (nextOpen, source) =>
      onOpenChange?.(nextOpen, { source: source === "menu" ? "menu" : "trigger" }),
  });

  const handleItemClick = (
    item: DropdownItem,
    keyPath: string[],
    domEvent: React.MouseEvent<HTMLElement>,
  ) => {
    if (item.disabled || item.type === "divider" || item.type === "group" || item.children?.length)
      return;

    const info: DropdownClickInfo = { key: item.key, keyPath, domEvent };
    item.onClick?.(info);
    menu.onClick?.(info);

    if (menu.selectable) {
      const nextSelectedKeys = menu.multiple
        ? selectedKeys.includes(item.key)
          ? selectedKeys.filter((key) => key !== item.key)
          : [...selectedKeys, item.key]
        : [item.key];
      if (menu.selectedKeys === undefined) setInnerSelectedKeys(nextSelectedKeys);
      menu.onSelect?.({ key: item.key, selectedKeys: nextSelectedKeys });
    }

    if (!(menu.selectable && menu.multiple)) floating.changeOpen(false, "menu");
  };

  return (
    <>
      <span
        ref={floating.triggerRef}
        className={twMerge(
          "inline-flex min-w-0",
          disabled && "cursor-not-allowed opacity-50 [&>*]:pointer-events-none",
          className,
        )}
        {...floating.triggerProps}
      >
        {children}
      </span>
      {floating.isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={floating.popupRef}
              data-dropdown
              data-placement={floating.position?.placement ?? placement}
              className="fixed min-w-32 font-pretendard text-sm text-[#111]"
              style={{
                left: floating.position?.left ?? 0,
                top: floating.position?.top ?? 0,
                zIndex,
                visibility: floating.position ? "visible" : "hidden",
              }}
              {...floating.popupProps}
            >
              <div className="relative rounded-lg bg-white p-1 shadow-[0_6px_16px_rgba(0,0,0,0.06),0_3px_6px_-4px_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.03)]">
                <MenuItems
                  items={menu.items}
                  selectedKeys={selectedKeys}
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
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

interface MenuItemsProps {
  items: DropdownItem[];
  selectedKeys: string[];
  selectable?: boolean;
  keyPath?: string[];
  onItemClick: (
    item: DropdownItem,
    keyPath: string[],
    event: React.MouseEvent<HTMLElement>,
  ) => void;
}

function MenuItems({ items, selectedKeys, selectable, keyPath = [], onItemClick }: MenuItemsProps) {
  const [openSubmenuKey, setOpenSubmenuKey] = useState<string | null>(null);

  return (
    <div className="grid gap-0.5">
      {items.map((item) => {
        const nextKeyPath = [item.key, ...keyPath];
        if (item.type === "divider")
          return <div key={item.key} className="my-1 h-px bg-[#f0f0f0]" />;

        if (item.type === "group") {
          return (
            <div key={item.key}>
              {item.label ? (
                <div className="px-3 py-1 text-xs leading-5 text-[#999]">{item.label}</div>
              ) : null}
              {item.children?.length ? (
                <MenuItems
                  items={item.children}
                  selectedKeys={selectedKeys}
                  selectable={selectable}
                  keyPath={nextKeyPath}
                  onItemClick={onItemClick}
                />
              ) : null}
            </div>
          );
        }

        const selected = selectable && selectedKeys.includes(item.key);
        const content = (
          <button
            type="button"
            disabled={item.disabled}
            className={twMerge(
              "flex h-8 w-full cursor-pointer items-center gap-2 rounded px-3 text-left whitespace-nowrap transition-colors",
              selected ? "bg-[#e6f4ff] text-[#0062df]" : "hover:bg-[#f5f5f5]",
              item.danger && "text-[#ff4d4f] hover:bg-[#fff2f0]",
              item.disabled && "cursor-not-allowed text-[#bbb] hover:bg-transparent",
            )}
            onClick={(event) => {
              if (item.children?.length) {
                setOpenSubmenuKey((current) => (current === item.key ? null : item.key));
                return;
              }
              onItemClick(item, nextKeyPath, event);
            }}
          >
            {item.icon ? <span className="inline-flex shrink-0">{item.icon}</span> : null}
            <span className="min-w-0 flex-1">{item.label}</span>
            {item.extra ? <span className="shrink-0 text-xs text-[#999]">{item.extra}</span> : null}
            {item.children?.length ? <Icon icon="chevron-right" color="#999" /> : null}
          </button>
        );

        if (!item.children?.length) return <div key={item.key}>{content}</div>;

        return (
          <div key={item.key} className="group/submenu relative">
            {content}
            <div
              className={twMerge(
                "invisible absolute top-0 left-full z-10 ml-1 min-w-32 rounded-lg bg-white p-1 opacity-0 shadow-[0_6px_16px_rgba(0,0,0,0.06),0_3px_6px_-4px_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.03)] transition-opacity group-hover/submenu:visible group-hover/submenu:opacity-100",
                openSubmenuKey === item.key && "visible opacity-100",
              )}
            >
              <MenuItems
                items={item.children}
                selectedKeys={selectedKeys}
                selectable={selectable}
                keyPath={nextKeyPath}
                onItemClick={onItemClick}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
