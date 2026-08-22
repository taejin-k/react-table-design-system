import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { MenuClickInfo, MenuItemType, MenuProps } from "./Menu.types";

function normalize(keys?: string[]) {
  return keys?.map(String) ?? [];
}

export function Menu({
  items = [],
  mode = "vertical",
  theme = "light",
  selectable = true,
  multiple = false,
  selectedKeys,
  defaultSelectedKeys = [],
  openKeys,
  defaultOpenKeys = [],
  inlineCollapsed = false,
  inlineIndent = 24,
  forceSubMenuRender = false,
  triggerSubMenuAction = "hover",
  subMenuOpenDelay = 0,
  subMenuCloseDelay = 0.1,
  expandIcon,
  className,
  style,
  classNames,
  styles,
  onClick,
  onSelect,
  onDeselect,
  onOpenChange,
}: MenuProps) {
  const [innerSelected, setInnerSelected] = useState(normalize(defaultSelectedKeys));
  const [innerOpen, setInnerOpen] = useState(normalize(defaultOpenKeys));
  const selected = selectedKeys === undefined ? innerSelected : normalize(selectedKeys);
  const opened = openKeys === undefined ? innerOpen : normalize(openKeys);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    [],
  );

  const changeOpen = (key: string, nextOpen: boolean) => {
    const next = nextOpen
      ? Array.from(new Set([...opened, key]))
      : opened.filter((value) => value !== key);
    if (openKeys === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const delayOpen = (key: string, nextOpen: boolean) => {
    const previous = timers.current.get(key);
    if (previous) clearTimeout(previous);
    const delay = (nextOpen ? subMenuOpenDelay : subMenuCloseDelay) * 1000;
    timers.current.set(
      key,
      setTimeout(() => changeOpen(key, nextOpen), delay),
    );
  };

  const selectItem = (
    item: MenuItemType,
    keyPath: string[],
    domEvent: React.MouseEvent<HTMLElement>,
  ) => {
    if (item.disabled || item.children?.length || item.type === "group" || item.type === "divider")
      return;
    const key = String(item.key);
    const info: MenuClickInfo = { key, keyPath, domEvent };
    item.onClick?.(info);
    onClick?.(info);
    if (!selectable) return;
    const isSelected = selected.includes(key);
    const next = multiple
      ? isSelected
        ? selected.filter((value) => value !== key)
        : [...selected, key]
      : [key];
    if (selectedKeys === undefined) setInnerSelected(next);
    if (isSelected && multiple) onDeselect?.({ ...info, selectedKeys: next });
    else onSelect?.({ ...info, selectedKeys: next });
  };

  const renderItems = (
    data: MenuItemType[],
    parentPath: string[] = [],
    level = 0,
    popup = false,
  ) => (
    <ul
      role={level === 0 ? "menu" : "group"}
      className={twMerge(
        "m-0 list-none p-1",
        level === 0 && mode === "horizontal" && "flex items-center border-b border-[#f0f0f0] p-0",
        level === 0 && mode !== "horizontal" && "w-64",
        popup &&
          "min-w-40 rounded-lg bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
        popup && theme === "dark" && "bg-[#001529]",
      )}
    >
      {data.map((item, index) => {
        const key = String(item.key);
        const path = [key, ...parentPath];
        if (item.type === "divider")
          return (
            <li
              key={key || `divider-${index}`}
              role="separator"
              className={twMerge(
                "my-1 border-t border-[#f0f0f0]",
                item.dashed && "border-dashed",
                theme === "dark" && "border-white/20",
              )}
            />
          );
        if (item.type === "group")
          return (
            <li key={key} role="presentation" className="py-1">
              {item.label ? (
                <div
                  className={twMerge(
                    "px-3 py-1 text-xs text-[#999]",
                    theme === "dark" && "text-white/45",
                  )}
                >
                  {item.label}
                </div>
              ) : null}
              {renderItems(item.children ?? [], path, level + 1, popup)}
            </li>
          );
        const hasChildren = Boolean(item.children?.length);
        const open = opened.includes(key);
        const active = selected.includes(key);
        const collapsed = inlineCollapsed && level === 0;
        const itemNode = (
          <button
            type="button"
            role="menuitem"
            aria-haspopup={hasChildren || undefined}
            aria-expanded={hasChildren ? open : undefined}
            aria-disabled={item.disabled || undefined}
            title={
              collapsed
                ? (item.title ?? (typeof item.label === "string" ? item.label : undefined))
                : item.title
            }
            disabled={item.disabled}
            className={twMerge(
              "relative flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm transition-colors duration-200 motion-reduce:transition-none",
              theme === "dark"
                ? "text-white/65 hover:bg-white/10 hover:text-white"
                : "text-[#111] hover:bg-[#f5f5f5]",
              active &&
                (theme === "dark" ? "bg-[#0062df] text-white" : "bg-[#e6f4ff] text-[#0062df]"),
              item.danger && "text-[#ff4d4f] hover:bg-[#fff2f0]",
              item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
              mode === "horizontal" &&
                level === 0 &&
                "h-12 rounded-none px-5 after:absolute after:right-4 after:bottom-0 after:left-4 after:h-0.5 after:origin-center after:scale-x-0 after:bg-[#0062df] after:transition-transform hover:text-[#0062df]",
              mode === "horizontal" && level === 0 && active && "bg-transparent after:scale-x-100",
              collapsed && "justify-center px-0",
              classNames?.item,
            )}
            style={{
              paddingInlineStart:
                mode === "inline" && !collapsed ? 12 + level * inlineIndent : undefined,
              ...styles?.item,
            }}
            onClick={(event) => {
              if (hasChildren) {
                item.onTitleClick?.({ key, domEvent: event });
                if (triggerSubMenuAction === "click" || mode === "inline") changeOpen(key, !open);
              } else selectItem(item, path, event);
            }}
          >
            {item.icon ? (
              <span
                className={twMerge("inline-flex shrink-0", classNames?.itemIcon)}
                style={styles?.itemIcon}
              >
                {item.icon}
              </span>
            ) : null}
            {!collapsed ? (
              <span
                className={twMerge("min-w-0 flex-1 truncate", classNames?.itemContent)}
                style={styles?.itemContent}
              >
                {item.label}
              </span>
            ) : null}
            {!collapsed && item.extra ? (
              <span className="shrink-0 text-xs text-[#999]">{item.extra}</span>
            ) : null}
            {!collapsed && hasChildren ? (
              <span
                className={twMerge(
                  "inline-flex transition-transform duration-200",
                  open && mode === "inline" && "rotate-90",
                )}
              >
                {typeof expandIcon === "function"
                  ? expandIcon({ isOpen: open, item })
                  : (expandIcon ?? <Icon icon="chevron-right" size={12} />)}
              </span>
            ) : null}
          </button>
        );
        const inlineSubmenu = mode === "inline" && !collapsed;
        return (
          <li
            key={key}
            role="none"
            className={twMerge("relative", mode === "horizontal" && level === 0 && "h-12")}
            onMouseEnter={() =>
              hasChildren &&
              !inlineSubmenu &&
              triggerSubMenuAction === "hover" &&
              delayOpen(key, true)
            }
            onMouseLeave={() =>
              hasChildren &&
              !inlineSubmenu &&
              triggerSubMenuAction === "hover" &&
              delayOpen(key, false)
            }
          >
            {itemNode}
            {hasChildren && inlineSubmenu ? (
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)]"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  {open || forceSubMenuRender ? renderItems(item.children!, path, level + 1) : null}
                </div>
              </div>
            ) : hasChildren && (open || forceSubMenuRender) ? (
              <div
                className={twMerge(
                  "absolute z-[1050] pt-1 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  mode === "horizontal" && level === 0 ? "top-full left-0" : "top-0 left-full pl-1",
                  open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
                  item.popupClassName,
                  classNames?.popup,
                )}
                style={{
                  marginLeft: item.popupOffset?.[0],
                  marginTop: item.popupOffset?.[1],
                  ...styles?.popup,
                }}
              >
                {renderItems(item.children!, path, level + 1, true)}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      className={twMerge(
        "font-pretendard",
        theme === "dark" && "bg-[#001529]",
        className,
        classNames?.root,
      )}
      style={{ ...style, ...styles?.root }}
    >
      {renderItems(items)}
    </nav>
  );
}
