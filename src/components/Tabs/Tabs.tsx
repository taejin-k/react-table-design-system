import { useLayoutEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { TabsPlacement, TabsProps } from "./Tabs.types";

function placementFromLegacy(value?: TabsProps["tabPosition"]): TabsPlacement | undefined {
  return value === "left" ? "start" : value === "right" ? "end" : value;
}

export function Tabs(props: TabsProps) {
  const {
    items = [],
    activeKey,
    defaultActiveKey,
    animated = { inkBar: true, tabPane: false },
    centered = false,
    destroyOnHidden = false,
    type = "line",
    size = "medium",
    tabPlacement: placementProp,
    tabPosition,
    tabBarGutter,
    tabBarExtraContent,
    tabBarStyle,
    hideAdd = false,
    addIcon,
    removeIcon,
    indicator,
    className,
    style,
    classNames,
    styles,
    onChange,
    onEdit,
    onTabClick,
    renderTabBar,
  } = props;
  const placement = placementProp ?? placementFromLegacy(tabPosition) ?? "top";
  const vertical = placement === "start" || placement === "end";
  const [innerActive, setInnerActive] = useState(
    defaultActiveKey ?? items.find((item) => !item.disabled)?.key,
  );
  const selected = activeKey ?? innerActive;
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const headerRef = useRef<HTMLDivElement>(null);
  const [ink, setInk] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });
  useLayoutEffect(() => {
    const node = selected ? refs.current.get(selected) : undefined;
    const root = headerRef.current;
    if (!node || !root) return;
    const origin = vertical ? node.offsetHeight : node.offsetWidth;
    const configured =
      typeof indicator?.size === "function" ? indicator.size(origin) : (indicator?.size ?? origin);
    const alignOffset =
      indicator?.align === "start"
        ? 0
        : indicator?.align === "end"
          ? origin - configured
          : (origin - configured) / 2;
    setInk({
      left: node.offsetLeft + (vertical ? 0 : alignOffset),
      top: node.offsetTop + (vertical ? alignOffset : 0),
      width: vertical ? 2 : configured,
      height: vertical ? configured : 2,
      ready: true,
    });
  }, [selected, items, vertical, indicator]);
  const change = (key: string, event: React.MouseEvent<HTMLElement>) => {
    onTabClick?.(key, event);
    const item = items.find((entry) => entry.key === key);
    if (!item || item.disabled || key === selected) return;
    if (activeKey === undefined) setInnerActive(key);
    onChange?.(key);
  };
  const extra: { left?: React.ReactNode; right?: React.ReactNode } =
    typeof tabBarExtraContent === "object" &&
    tabBarExtraContent !== null &&
    ("left" in tabBarExtraContent || "right" in tabBarExtraContent)
      ? (tabBarExtraContent as { left?: React.ReactNode; right?: React.ReactNode })
      : { right: tabBarExtraContent as React.ReactNode };
  const padding =
    size === "large"
      ? "px-4 py-4 text-base"
      : size === "small"
        ? "px-2 py-2 text-sm"
        : "px-3 py-3 text-sm";
  const DefaultTabBar = () => (
    <div
      ref={headerRef}
      className={twMerge(
        "relative flex min-w-0 items-center",
        vertical ? "flex-col" : "w-full",
        centered && !vertical && "justify-center",
        type === "line" && (vertical ? "border-r border-[#f0f0f0]" : "border-b border-[#f0f0f0]"),
        classNames?.header,
      )}
      style={{ gap: tabBarGutter, ...tabBarStyle, ...styles?.header }}
    >
      {extra.left ? <div className={vertical ? "mb-2" : "mr-auto"}>{extra.left}</div> : null}
      <div
        className={twMerge(
          "wizard-scrollbar-hidden flex min-w-0 overflow-auto",
          vertical ? "w-full flex-col" : "items-center",
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
            role="tab"
            aria-selected={item.key === selected}
            aria-controls={`tab-panel-${item.key}`}
            disabled={item.disabled}
            className={twMerge(
              "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-[#666] transition-colors duration-200 hover:text-[#0062df] disabled:cursor-not-allowed disabled:text-[#bbb] motion-reduce:transition-none",
              item.key === selected && "font-medium text-[#0062df]",
              padding,
              type !== "line" && "border border-[#d9d9d9] bg-[#fafafa]",
              type !== "line" && item.key === selected && "bg-white",
              type !== "line" && vertical ? "w-full" : "",
              classNames?.item,
            )}
            style={styles?.item}
            onClick={(event) => change(item.key, event)}
          >
            {item.icon}
            <span>{item.label}</span>
            {type === "editable-card" && item.closable !== false ? (
              <span
                role="button"
                aria-label={`${String(item.label)} 닫기`}
                className="inline-flex rounded p-0.5 hover:bg-black/5"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit?.(item.key, "remove");
                }}
              >
                {item.closeIcon ?? removeIcon ?? <Icon icon="close" size={12} />}
              </span>
            ) : null}
          </button>
        ))}
        {type === "editable-card" && !hideAdd ? (
          <button
            type="button"
            aria-label="탭 추가"
            className={twMerge(
              "inline-flex items-center justify-center border border-[#d9d9d9] bg-[#fafafa]",
              padding,
            )}
            onClick={(event) => onEdit?.(event, "add")}
          >
            {addIcon ?? <Icon icon="add" />}
          </button>
        ) : null}
      </div>
      {type === "line" && ink.ready ? (
        <span
          className={twMerge(
            "absolute bg-[#0062df]",
            (typeof animated === "boolean" ? animated : animated.inkBar !== false) &&
              "transition-[transform,width,height] duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
            classNames?.indicator,
          )}
          style={{
            width: ink.width,
            height: ink.height,
            transform: `translate3d(${ink.left}px, ${ink.top + (vertical ? 0 : (headerRef.current?.offsetHeight ?? 0) - 2)}px, 0)`,
            ...styles?.indicator,
          }}
        />
      ) : null}
      {extra.right ? <div className={vertical ? "mt-2" : "ml-auto"}>{extra.right}</div> : null}
    </div>
  );
  const tabBar = renderTabBar?.(props, DefaultTabBar) ?? <DefaultTabBar />;
  const paneAnimated = typeof animated === "object" && animated.tabPane;
  return (
    <div
      className={twMerge(
        "flex min-w-0 font-pretendard text-[#111]",
        vertical ? "flex-row" : "flex-col",
        placement === "end" && "flex-row-reverse",
        placement === "bottom" && "flex-col-reverse",
        className,
        classNames?.root,
      )}
      style={{ ...style, ...styles?.root }}
    >
      {tabBar}
      <div
        className={twMerge("min-w-0 flex-1", vertical ? "px-6" : "py-4", classNames?.body)}
        style={styles?.body}
      >
        {items.map((item) => {
          const active = item.key === selected;
          if (!active && (destroyOnHidden || item.destroyOnHidden) && !item.forceRender)
            return null;
          if (!active && !item.forceRender && selected !== item.key) return null;
          return (
            <div
              key={item.key}
              id={`tab-panel-${item.key}`}
              role="tabpanel"
              aria-hidden={!active}
              hidden={!active}
              className={twMerge(
                paneAnimated &&
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
