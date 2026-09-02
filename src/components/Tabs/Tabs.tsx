import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { TabItemType, TabsProps } from "./Tabs.types";

const EMPTY_ITEMS: TabItemType[] = [];

export function Tabs(props: TabsProps) {
  const {
    items = EMPTY_ITEMS,
    activeKey,
    defaultActiveKey,
    animated = false,
    centered = false,
    destroyOnHidden = false,
    type = "line",
    size = "md",
    tabPlacement: placement = "top",
    tabBarGutter,
    tabBarStyle,
    addIcon,
    removeIcon,
    indicator,
    className,
    onChange,
    onAdd,
    onDelete,
    onTabClick,
    renderTabBar,
  } = props;
  const vertical = placement === "start" || placement === "end";
  const [innerActive, setInnerActive] = useState(
    defaultActiveKey ?? items.find((item) => !item.disabled)?.key,
  );
  const selected = activeKey ?? innerActive;
  useEffect(() => {
    if (activeKey !== undefined || items.some((item) => item.key === selected)) return;
    setInnerActive(items.find((item) => !item.disabled)?.key);
  }, [activeKey, items, selected]);
  const visitedKeys = useRef(new Set(selected === undefined ? [] : [selected]));
  useEffect(() => {
    if (selected !== undefined) visitedKeys.current.add(selected);
  }, [selected]);
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const headerRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const [ink, setInk] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });
  useLayoutEffect(() => {
    const updateInk = () => {
      const node = selected === undefined ? undefined : refs.current.get(selected);
      const root = headerRef.current;
      if (!node || !root) return;
      const nodeRect = node.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const origin = vertical ? nodeRect.height : nodeRect.width;
      const configured =
        typeof indicator?.size === "function"
          ? indicator.size(origin)
          : (indicator?.size ?? origin);
      const alignOffset =
        indicator?.align === "start"
          ? 0
          : indicator?.align === "end"
            ? origin - configured
            : (origin - configured) / 2;
      setInk({
        left: vertical
          ? placement === "start"
            ? root.clientWidth - 2
            : 0
          : nodeRect.left - rootRect.left + alignOffset,
        top: vertical
          ? nodeRect.top - rootRect.top + alignOffset
          : placement === "bottom"
            ? 0
            : root.clientHeight - 2,
        width: vertical ? 2 : configured,
        height: vertical ? configured : 2,
        ready: true,
      });
    };
    updateInk();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateInk);
    if (headerRef.current) observer?.observe(headerRef.current);
    const activeTab = selected === undefined ? undefined : refs.current.get(selected);
    if (activeTab) observer?.observe(activeTab);
    const tabList = tabListRef.current;
    tabList?.addEventListener("scroll", updateInk, { passive: true });
    return () => {
      observer?.disconnect();
      tabList?.removeEventListener("scroll", updateInk);
    };
  }, [selected, items, vertical, indicator, placement]);
  const change = (key: string, event: React.MouseEvent<HTMLElement>) => {
    onTabClick?.(key, event);
    const item = items.find((entry) => entry.key === key);
    if (!item || item.disabled || key === selected) return;
    if (activeKey === undefined) setInnerActive(key);
    onChange?.(key);
  };
  const add = () => {
    if (!onAdd) return;
    let index = 1;
    while (items.some((item) => item.key === `new-${index}`)) index += 1;
    const key = `new-${index}`;
    onAdd([...items, { key, label: `새 탭 ${index}`, children: `새 탭 ${index} 내용` }]);
    if (activeKey === undefined) setInnerActive(key);
    onChange?.(key);
  };
  const remove = (key: string) => {
    if (!onDelete) return;
    const removedIndex = items.findIndex((item) => item.key === key);
    const nextItems = items.filter((item) => item.key !== key);
    onDelete(nextItems);
    if (key !== selected) return;
    const nextSelected = [
      ...nextItems.slice(Math.max(removedIndex, 0)),
      ...nextItems.slice(0, Math.max(removedIndex, 0)).reverse(),
    ].find((item) => !item.disabled)?.key;
    if (activeKey === undefined) setInnerActive(nextSelected);
    if (nextSelected !== undefined) onChange?.(nextSelected);
  };
  const linePadding =
    size === "lg"
      ? "px-4 py-4 text-base"
      : size === "sm"
        ? "px-2 py-2 text-sm"
        : "px-3 py-3 text-sm";
  const cardSize =
    size === "lg"
      ? "h-12 px-4 text-base"
      : size === "sm"
        ? "h-8 px-2 text-sm"
        : "h-10 px-4 text-sm";
  const cardEdge = vertical
    ? placement === "start"
      ? "rounded-l-md border-r-0"
      : "rounded-r-md border-l-0"
    : placement === "bottom"
      ? "rounded-b-md border-t-0"
      : "rounded-t-md border-b-0";
  const indicatorTransition = "width 300ms, height 300ms, transform 300ms";
  const DefaultTabBar = () => (
    <div
      ref={headerRef}
      data-tabs-header=""
      data-tabs-type={type}
      className={twMerge(
        "relative flex min-w-0 items-center",
        vertical ? "flex-col" : "w-full",
        centered && !vertical && "justify-center",
        type === "line" &&
          (placement === "start"
            ? "border-r border-[#f0f0f0]"
            : placement === "end"
              ? "border-l border-[#f0f0f0]"
              : placement === "bottom"
                ? "border-t border-[#f0f0f0]"
                : "border-b border-[#f0f0f0]"),
        type !== "line" &&
          (vertical
            ? placement === "start"
              ? "border-r border-[#d9d9d9]"
              : "border-l border-[#d9d9d9]"
            : placement === "bottom"
              ? "border-t border-[#d9d9d9]"
              : "border-b border-[#d9d9d9]"),
      )}
      style={{ gap: tabBarGutter, ...tabBarStyle }}
    >
      <div
        ref={tabListRef}
        className={twMerge(
          "wizard-scrollbar-hidden flex min-w-0 overflow-auto",
          vertical ? "w-full flex-col" : type === "line" ? "items-center" : "items-start",
          type !== "line" && (vertical ? "gap-y-0.5" : "gap-x-0.5"),
        )}
      >
        {items.map((item) => (
          <button
            key={item.key}
            ref={(node) => {
              if (node) refs.current.set(item.key, node);
              else refs.current.delete(item.key);
            }}
            type="button"
            disabled={item.disabled}
            data-tabs-item={item.key}
            data-tabs-active={item.key === selected ? "true" : "false"}
            className={twMerge(
              "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-[#666] hover:text-[#0062df] disabled:cursor-not-allowed disabled:text-[#bbb] motion-reduce:transition-none",
              item.key === selected && "font-medium text-[#0062df]",
              type === "line"
                ? `${linePadding} transition-colors duration-200`
                : `${cardSize} border border-[#d9d9d9] bg-[#fafafa] ${cardEdge} transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)]`,
              type !== "line" && item.key === selected && "z-[1] bg-white",
              type !== "line" && vertical ? "w-full" : "",
            )}
            onClick={(event) => change(item.key, event)}
          >
            {item.icon}
            <span>{item.label}</span>
            {type === "editable-card" && onDelete !== undefined && item.closable !== false ? (
              <span
                data-tab-close={item.key}
                className="inline-flex cursor-pointer rounded p-0.5 hover:bg-black/5"
                onClick={(event) => {
                  event.stopPropagation();
                  remove(item.key);
                }}
              >
                {item.closeIcon ?? removeIcon ?? <Icon icon="close" size={12} />}
              </span>
            ) : null}
          </button>
        ))}
        {type === "editable-card" && onAdd !== undefined ? (
          <button
            type="button"
            data-tabs-add=""
            className={twMerge(
              "inline-flex shrink-0 cursor-pointer items-center justify-center border border-[#d9d9d9] bg-[#fafafa] text-[#111] transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] hover:border-[#0062df] hover:text-[#0062df] motion-reduce:transition-none",
              cardSize,
              vertical
                ? "w-full"
                : size === "sm"
                  ? "w-8 px-0"
                  : size === "lg"
                    ? "w-12 px-0"
                    : "w-10 px-0",
              cardEdge,
            )}
            onClick={add}
          >
            {addIcon ?? <Icon icon="add" />}
          </button>
        ) : null}
      </div>
      {type === "line" && ink.ready ? (
        <span
          data-tabs-indicator=""
          className={twMerge(
            "pointer-events-none absolute top-0 left-0 bg-[#0062df] will-change-transform",
          )}
          style={{
            width: ink.width,
            height: ink.height,
            transform: `translate3d(${ink.left}px, ${ink.top}px, 0)`,
            transition: indicatorTransition,
            transitionTimingFunction: "cubic-bezier(0.645, 0.045, 0.355, 1)",
          }}
        />
      ) : null}
      {type !== "line" && ink.ready ? (
        <span
          data-tabs-card-bridge=""
          className="pointer-events-none absolute z-[2] bg-white"
          style={
            vertical
              ? {
                  top: 0,
                  [placement === "start" ? "right" : "left"]: -1,
                  width: 1,
                  height: ink.height,
                  transform: `translate3d(0, ${ink.top}px, 0)`,
                  transition: indicatorTransition,
                  transitionTimingFunction: "cubic-bezier(0.645, 0.045, 0.355, 1)",
                }
              : {
                  [placement === "bottom" ? "top" : "bottom"]: -1,
                  left: 0,
                  width: ink.width,
                  height: 1,
                  transform: `translate3d(${ink.left}px, 0, 0)`,
                  transition: indicatorTransition,
                  transitionTimingFunction: "cubic-bezier(0.645, 0.045, 0.355, 1)",
                }
          }
        />
      ) : null}
    </div>
  );
  const tabBar = renderTabBar?.(props, DefaultTabBar) ?? DefaultTabBar();
  return (
    <div
      className={twMerge(
        "flex min-w-0 font-pretendard text-[#111]",
        vertical ? "flex-row" : "flex-col",
        placement === "end" && "flex-row-reverse",
        placement === "bottom" && "flex-col-reverse",
        className,
      )}
    >
      {tabBar}
      <div
        className={twMerge(
          "min-w-0 flex-1 [overflow-wrap:anywhere] break-words",
          vertical ? "px-6" : "py-4",
        )}
      >
        {items.map((item) => {
          const active = item.key === selected;
          if (!active && (destroyOnHidden || item.destroyOnHidden) && !item.forceRender)
            return null;
          if (!active && !item.forceRender && !visitedKeys.current.has(item.key)) return null;
          return (
            <div
              key={item.key}
              data-tab-panel={item.key}
              hidden={!active}
              className={twMerge(
                animated &&
                  active &&
                  "animate-[wizard-tab-pane-in_0.3s_cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none",
              )}
            >
              {item.children}
            </div>
          );
        })}
      </div>
    </div>
  );
}
