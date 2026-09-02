import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import {
  calculateFloatingPosition,
  type FloatingPlacement,
  type FloatingPosition,
} from "../_internal/floating-position";
import type { MenuClickInfo, MenuItemType, MenuProps } from "./Menu.types";

const SUBMENU_CLOSE_DELAY_MS = 100;

function normalize(keys?: string[]) {
  return keys?.map(String) ?? [];
}

function MenuPopupPortal({
  getAnchor,
  open,
  placement,
  offset,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  getAnchor: () => HTMLElement | null;
  open: boolean;
  placement: "bottomLeft" | "rightTop";
  offset?: [number, number];
  className?: string;
  style?: CSSProperties;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: ReactNode;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const getAnchorRef = useRef(getAnchor);
  const [position, setPosition] = useState<FloatingPosition | null>(null);
  const [motionOpen, setMotionOpen] = useState(false);
  getAnchorRef.current = getAnchor;

  const updatePosition = useCallback(() => {
    const anchor = getAnchorRef.current();
    const popup = popupRef.current;
    if (!anchor || !popup) return;
    const next = calculateFloatingPosition(
      anchor.getBoundingClientRect(),
      popup.getBoundingClientRect(),
      placement,
      { targetGap: 4 },
    );
    setPosition((current) =>
      current?.left === next.left &&
      current.top === next.top &&
      current.placement === next.placement
        ? current
        : next,
    );
  }, [placement]);

  const setPopupNode = useCallback(
    (node: HTMLDivElement | null) => {
      popupRef.current = node;
      if (node) updatePosition();
    },
    [updatePosition],
  );

  useLayoutEffect(() => {
    updatePosition();
    const anchor = getAnchorRef.current();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updatePosition);
    if (anchor) observer?.observe(anchor);
    if (popupRef.current) observer?.observe(popupRef.current);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { capture: true, passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  useEffect(() => {
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open || !position) {
      setMotionOpen(false);
      return;
    }
    const frame = requestAnimationFrame(() => setMotionOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [open, position]);

  if (typeof document === "undefined") return null;
  const resolvedPlacement = position?.placement ?? placement;
  const hiddenTransform = getMenuPopupHiddenTransform(resolvedPlacement);

  return createPortal(
    <div
      ref={setPopupNode}
      data-menu-popup=""
      data-placement={resolvedPlacement}
      className={twMerge(
        "fixed z-[1050] transition-[opacity,transform] duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        motionOpen
          ? "translate-x-0 translate-y-0 opacity-100"
          : `pointer-events-none opacity-0 ${hiddenTransform}`,
        className,
      )}
      style={{
        left: position ? position.left + (offset?.[0] ?? 0) : 0,
        top: position ? position.top + (offset?.[1] ?? 0) : 0,
        visibility: position ? "visible" : "hidden",
        ...style,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>,
    document.body,
  );
}

function getMenuPopupHiddenTransform(placement: FloatingPlacement) {
  if (placement.startsWith("top")) return "translate-y-1";
  if (placement.startsWith("bottom")) return "-translate-y-1";
  if (placement.startsWith("left")) return "translate-x-1";
  return "-translate-x-1";
}

export function Menu({
  items = [],
  mode = "vertical",
  selectable = true,
  multiple = false,
  selectedKeys,
  defaultSelectedKeys = [],
  openKeys,
  defaultOpenKeys = [],
  inlineCollapsed = false,
  inlineIndent = 24,
  triggerSubMenuAction = "hover",
  className,
  onClick,
  onSelect,
  onDeselect,
  onOpenChange,
}: MenuProps) {
  const [innerSelected, setInnerSelected] = useState(normalize(defaultSelectedKeys));
  const [innerOpen, setInnerOpen] = useState(normalize(defaultOpenKeys));
  const selected = selectedKeys === undefined ? innerSelected : normalize(selectedKeys);
  const opened = openKeys === undefined ? innerOpen : normalize(openKeys);
  const visitedOpenKeys = useRef(new Set(opened));
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const popupAnchors = useRef(new Map<string, HTMLLIElement>());
  useEffect(() => {
    opened.forEach((key) => visitedOpenKeys.current.add(key));
  }, [opened]);
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
    const delay = nextOpen ? 0 : SUBMENU_CLOSE_DELAY_MS;
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
      className={twMerge(
        "m-0 list-none space-y-1 p-1",
        level === 0 &&
          mode === "horizontal" &&
          "wizard-scrollbar-hidden flex max-w-full items-center gap-2 space-y-0 overflow-x-auto border-b border-[#f0f0f0] p-0",
        level === 0 &&
          mode !== "horizontal" &&
          "transition-[width] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
        level === 0 && mode !== "horizontal" && (inlineCollapsed ? "w-16" : "w-64"),
        popup &&
          "min-w-40 rounded-lg bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
      )}
    >
      {data.map((item, index) => {
        const key = String(item.key);
        const path = [key, ...parentPath];
        if (item.type === "divider")
          return <li key={key || `divider-${index}`} className="my-1 border-t border-[#f0f0f0]" />;
        if (item.type === "group")
          return (
            <li key={key} className="py-1">
              {item.label ? (
                <div className="px-3 py-1 text-xs text-[#999]">{item.label}</div>
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
            title={
              collapsed
                ? (item.title ?? (typeof item.label === "string" ? item.label : undefined))
                : item.title
            }
            disabled={item.disabled}
            className={twMerge(
              "relative flex h-10 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-left text-sm text-[#111] transition-[color,background-color,gap,padding] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] outline-none hover:bg-[#f5f5f5] motion-reduce:transition-none",
              active && "bg-[#e6f4ff] text-[#0062df]",
              item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
              mode === "horizontal" &&
                level === 0 &&
                "h-12 rounded-none px-5 after:absolute after:right-4 after:bottom-0 after:left-4 after:h-0.5 after:origin-center after:scale-x-0 after:bg-[#0062df] after:transition-transform hover:text-[#0062df]",
              mode === "horizontal" && level === 0 && active && "bg-transparent after:scale-x-100",
              collapsed && "justify-center gap-0 px-0",
            )}
            style={{
              paddingInlineStart:
                mode === "inline" && !collapsed ? 12 + level * inlineIndent : undefined,
            }}
            onClick={(event) => {
              if (hasChildren) {
                item.onTitleClick?.({ key, domEvent: event });
                if (triggerSubMenuAction === "click" || mode === "inline") changeOpen(key, !open);
              } else selectItem(item, path, event);
            }}
          >
            {item.icon ? <span className="inline-flex shrink-0">{item.icon}</span> : null}
            <span
              className={twMerge(
                "min-w-0 flex-1 truncate transition-[max-width,opacity] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
                collapsed ? "max-w-0 flex-none opacity-0" : "max-w-48 opacity-100",
              )}
            >
              {item.label}
            </span>
            {item.extra ? (
              <span
                className={twMerge(
                  "shrink-0 overflow-hidden text-xs whitespace-nowrap text-[#999] transition-[max-width,opacity] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
                  collapsed ? "max-w-0 opacity-0" : "max-w-24 opacity-100",
                )}
              >
                {item.extra}
              </span>
            ) : null}
            {hasChildren ? (
              <span
                className={twMerge(
                  "inline-flex shrink-0 overflow-hidden transition-[max-width,opacity,transform] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
                  collapsed ? "max-w-0 opacity-0" : "max-w-4 opacity-100",
                  open && mode === "inline" && "rotate-90",
                  open && mode === "horizontal" && level === 0 && "rotate-180",
                )}
              >
                <Icon
                  icon={mode === "horizontal" && level === 0 ? "chevron-down" : "chevron-right"}
                  size={12}
                />
              </span>
            ) : null}
          </button>
        );
        const inlineSubmenu = mode === "inline";
        const popupSubmenu = !inlineSubmenu || collapsed;
        return (
          <li
            key={key}
            ref={(node) => {
              if (node) popupAnchors.current.set(key, node);
              else popupAnchors.current.delete(key);
            }}
            className={twMerge("relative", mode === "horizontal" && level === 0 && "h-12")}
            onMouseEnter={() =>
              hasChildren &&
              popupSubmenu &&
              triggerSubMenuAction === "hover" &&
              delayOpen(key, true)
            }
            onMouseLeave={() =>
              hasChildren &&
              popupSubmenu &&
              triggerSubMenuAction === "hover" &&
              delayOpen(key, false)
            }
          >
            {itemNode}
            {hasChildren && inlineSubmenu ? (
              <div
                className="grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none"
                style={{
                  gridTemplateRows: open && !collapsed ? "1fr" : "0fr",
                  opacity: open && !collapsed ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  {open || visitedOpenKeys.current.has(key)
                    ? renderItems(item.children!, path, level + 1)
                    : null}
                </div>
              </div>
            ) : null}
            {hasChildren && popupSubmenu && (open || visitedOpenKeys.current.has(key)) ? (
              <MenuPopupPortal
                getAnchor={() => popupAnchors.current.get(key) ?? null}
                open={open}
                placement={mode === "horizontal" && level === 0 ? "bottomLeft" : "rightTop"}
                offset={item.popupOffset}
                className={item.popupClassName}
                onMouseEnter={() => {
                  if (triggerSubMenuAction === "hover") delayOpen(key, true);
                }}
                onMouseLeave={() => {
                  if (triggerSubMenuAction === "hover") delayOpen(key, false);
                }}
              >
                {renderItems(item.children!, path, level + 1, true)}
              </MenuPopupPortal>
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  return <nav className={twMerge("font-pretendard", className)}>{renderItems(items)}</nav>;
}
