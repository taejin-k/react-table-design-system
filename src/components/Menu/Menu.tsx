import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Key,
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
const INLINE_INDENT = 24;

function normalize(keys?: Key[]) {
  return keys ?? [];
}

function MenuPopupPortal({
  getAnchor,
  open,
  offset,
  className,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  getAnchor: () => HTMLElement | null;
  open: boolean;
  offset?: [number, number];
  className?: string;
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
      "rightTop",
      { targetGap: 4 },
    );
    setPosition((current) =>
      current?.left === next.left &&
      current.top === next.top &&
      current.placement === next.placement
        ? current
        : next,
    );
  }, []);

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
  const resolvedPlacement = position?.placement ?? "rightTop";
  const hiddenTransform = getMenuPopupHiddenTransform(resolvedPlacement);

  return createPortal(
    <div
      ref={setPopupNode}
      data-menu-popup=""
      data-placement={resolvedPlacement}
      className={twMerge(
        "fixed z-[1050] will-change-[opacity,transform] motion-reduce:transition-none",
        motionOpen ? "translate-x-0 translate-y-0 opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
      style={{
        left: position ? position.left + (offset?.[0] ?? 0) : 0,
        top: position ? position.top + (offset?.[1] ?? 0) : 0,
        visibility: position ? "visible" : "hidden",
        transform: motionOpen ? "translate3d(0, 0, 0) scale(1)" : hiddenTransform,
        transformOrigin: getMenuPopupTransformOrigin(resolvedPlacement),
        transition:
          "opacity 220ms cubic-bezier(0.2, 0, 0, 1), transform 260ms cubic-bezier(0.2, 0, 0, 1)",
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
  if (placement.startsWith("top")) return "translate3d(0, 4px, 0) scale(0.98)";
  if (placement.startsWith("bottom")) return "translate3d(0, -4px, 0) scale(0.98)";
  if (placement.startsWith("left")) return "translate3d(4px, 0, 0) scale(0.98)";
  return "translate3d(-4px, 0, 0) scale(0.98)";
}

function getMenuPopupTransformOrigin(placement: FloatingPlacement) {
  if (placement.startsWith("top")) return "bottom center";
  if (placement.startsWith("bottom")) return "top center";
  if (placement.startsWith("left")) return "center right";
  return "center left";
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
  triggerSubMenuAction = "hover",
  className,
  onClick,
  onSelect,
  onDeselect,
  onOpenChange,
}: MenuProps) {
  const [innerSelected, setInnerSelected] = useState(normalize(defaultSelectedKeys));
  const [innerOpen, setInnerOpen] = useState(normalize(defaultOpenKeys));
  const [collapsedPopupOpen, setCollapsedPopupOpen] = useState<Key[]>([]);
  const selected = selectedKeys === undefined ? innerSelected : normalize(selectedKeys);
  const opened = openKeys === undefined ? innerOpen : normalize(openKeys);
  const visitedOpenKeys = useRef(new Set(opened));
  const visitedCollapsedPopupKeys = useRef(new Set<Key>());
  const timers = useRef(new Map<Key, ReturnType<typeof setTimeout>>());
  const popupAnchors = useRef(new Map<Key, HTMLLIElement>());
  useEffect(() => {
    opened.forEach((key) => visitedOpenKeys.current.add(key));
  }, [opened]);
  useLayoutEffect(() => {
    setCollapsedPopupOpen((current) => (current.length === 0 ? current : []));
    visitedCollapsedPopupKeys.current.clear();
  }, [inlineCollapsed]);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    [],
  );

  const changeOpen = (key: Key, nextOpen: boolean, collapsedPopup = false) => {
    const current = collapsedPopup ? collapsedPopupOpen : opened;
    const next = nextOpen
      ? Array.from(new Set([...current, key]))
      : current.filter((value) => !Object.is(value, key));
    if (collapsedPopup) {
      if (nextOpen) visitedCollapsedPopupKeys.current.add(key);
      setCollapsedPopupOpen(next);
    } else if (openKeys === undefined) {
      setInnerOpen(next);
    }
    onOpenChange?.(next);
  };

  const delayOpen = (key: Key, nextOpen: boolean, collapsedPopup = false) => {
    const previous = timers.current.get(key);
    if (previous) clearTimeout(previous);
    const delay = nextOpen ? 0 : SUBMENU_CLOSE_DELAY_MS;
    timers.current.set(
      key,
      setTimeout(() => changeOpen(key, nextOpen, collapsedPopup), delay),
    );
  };

  const selectItem = (item: MenuItemType, event: React.MouseEvent<HTMLElement>) => {
    if (item.disabled || item.children?.length || item.type === "group" || item.type === "divider")
      return;
    const key = item.key;
    const info: MenuClickInfo = { key, event };
    item.onClick?.(info);
    onClick?.(info);
    if (!selectable) return;
    const isSelected = selected.includes(key);
    const next = multiple
      ? isSelected
        ? selected.filter((value) => !Object.is(value, key))
        : [...selected, key]
      : [key];
    if (selectedKeys === undefined) setInnerSelected(next);
    if (isSelected && multiple) onDeselect?.({ ...info, selectedKeys: next });
    else onSelect?.({ ...info, selectedKeys: next });
  };

  const renderItems = (data: MenuItemType[], level = 0, popup = false) => (
    <ul
      className={twMerge(
        "m-0 list-none space-y-1 p-1",
        level === 0 &&
          "transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[width] motion-reduce:transition-none",
        level === 0 && mode === "inline" && "overflow-hidden",
        level === 0 && (mode === "inline" && inlineCollapsed ? "w-16" : "w-64"),
        level > 0 && mode === "inline" && !popup && "pb-0",
        popup &&
          "min-w-40 rounded-lg bg-white shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
      )}
    >
      {data.map((item) => {
        const key = item.key;
        if (item.type === "divider") return <li key={key} className="border-t border-[#f0f0f0]" />;
        if (item.type === "group")
          return (
            <li key={key} className="py-1">
              {item.label != null ? (
                <div className="px-3 py-1 text-xs text-[#999]">{item.label}</div>
              ) : null}
              {renderItems(item.children ?? [], level, popup)}
            </li>
          );
        const hasChildren = Boolean(item.children?.length);
        const inlineOpen = opened.includes(key);
        const active = selected.includes(key);
        const collapsed = mode === "inline" && inlineCollapsed && level === 0;
        const collapsedPopup = mode === "inline" && collapsed;
        const open = collapsedPopup ? collapsedPopupOpen.includes(key) : inlineOpen;
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
              "relative block h-10 w-full cursor-pointer overflow-hidden rounded-md px-3 text-left text-sm text-[#111] transition-colors duration-200 outline-none hover:bg-[#f5f5f5] motion-reduce:transition-none",
              active && "bg-[#e6f4ff] text-[#0062df]",
              item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
            )}
            style={{
              paddingInlineStart:
                mode === "inline" && !collapsed ? 12 + level * INLINE_INDENT : undefined,
            }}
            onClick={(event) => {
              if (hasChildren) {
                item.onTitleClick?.({ key, event });
                if (triggerSubMenuAction === "click" || mode === "inline")
                  changeOpen(key, !open, collapsedPopup);
              } else selectItem(item, event);
            }}
          >
            {item.icon ? (
              <span
                className={twMerge(
                  "absolute top-1/2 left-3 inline-flex shrink-0 -translate-y-1/2 transform-gpu transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform motion-reduce:transition-none",
                  collapsed ? "translate-x-2" : "translate-x-0",
                )}
                style={{
                  left: mode === "inline" && !collapsed ? 12 + level * INLINE_INDENT : undefined,
                }}
              >
                {item.icon}
              </span>
            ) : null}
            <span
              className={twMerge(
                "flex h-full min-w-0 items-center gap-2 transition-opacity duration-150 ease-out motion-reduce:transition-none",
                item.icon && "pl-6",
                collapsed ? "pointer-events-none opacity-0 delay-0" : "opacity-100 delay-100",
              )}
            >
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.extra ? (
                <span className="shrink-0 text-xs whitespace-nowrap text-[#999]">{item.extra}</span>
              ) : null}
              {hasChildren ? (
                <span
                  className={twMerge(
                    "inline-flex shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
                    open && mode === "inline" && "rotate-90",
                  )}
                >
                  <Icon icon="chevron-right" size={12} />
                </span>
              ) : null}
            </span>
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
            className="relative"
            onMouseEnter={() =>
              hasChildren &&
              popupSubmenu &&
              triggerSubMenuAction === "hover" &&
              delayOpen(key, true, collapsedPopup)
            }
            onMouseLeave={() =>
              hasChildren &&
              popupSubmenu &&
              triggerSubMenuAction === "hover" &&
              delayOpen(key, false, collapsedPopup)
            }
          >
            {itemNode}
            {hasChildren && inlineSubmenu ? (
              <div
                className="grid transition-[grid-template-rows,opacity] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
                style={{
                  gridTemplateRows: inlineOpen && !collapsed ? "1fr" : "0fr",
                  opacity: inlineOpen && !collapsed ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  {inlineOpen || visitedOpenKeys.current.has(key)
                    ? renderItems(item.children!, level + 1)
                    : null}
                </div>
              </div>
            ) : null}
            {hasChildren &&
            popupSubmenu &&
            (open ||
              (collapsedPopup
                ? visitedCollapsedPopupKeys.current.has(key)
                : visitedOpenKeys.current.has(key))) ? (
              <MenuPopupPortal
                getAnchor={() => popupAnchors.current.get(key) ?? null}
                open={open}
                offset={item.popupOffset}
                className={item.popupClassName}
                onMouseEnter={() => {
                  if (triggerSubMenuAction === "hover") delayOpen(key, true, collapsedPopup);
                }}
                onMouseLeave={() => {
                  if (triggerSubMenuAction === "hover") delayOpen(key, false, collapsedPopup);
                }}
              >
                {renderItems(item.children!, level + 1, true)}
              </MenuPopupPortal>
            ) : null}
          </li>
        );
      })}
    </ul>
  );

  return <nav className={twMerge("font-pretendard", className)}>{renderItems(items)}</nav>;
}
