import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { TabItemType, TabsProps } from "./Tabs.types";

const EMPTY_ITEMS: TabItemType[] = [];
const restrictToHorizontalAxis: Modifier = ({ transform }) => ({ ...transform, y: 0 });
const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

export function reorderTabItems(items: TabItemType[], activeKey: string, overKey: string) {
  const previousIndex = items.findIndex((item) => item.key === activeKey);
  const nextIndex = items.findIndex((item) => item.key === overKey);
  if (previousIndex < 0 || nextIndex < 0 || previousIndex === nextIndex) return items;
  return arrayMove(items, previousIndex, nextIndex);
}

interface TabsSortContextProps {
  children: ReactNode;
  enabled: boolean;
  items: string[];
  vertical: boolean;
  onDragEnd: (event: DragEndEvent) => void;
}

function TabsSortContext({ children, enabled, items, vertical, onDragEnd }: TabsSortContextProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      autoScroll={false}
      modifiers={[vertical ? restrictToVerticalAxis : restrictToHorizontalAxis]}
      onDragEnd={enabled ? onDragEnd : undefined}
    >
      <SortableContext
        items={items}
        strategy={vertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

interface SortableTabButtonProps {
  active: boolean;
  children: ReactNode;
  className: string;
  disabled: boolean;
  enabled: boolean;
  itemKey: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  register: (node: HTMLButtonElement | null) => void;
}

function SortableTabButton({
  active,
  children,
  className,
  disabled,
  enabled,
  itemKey,
  onClick,
  register,
}: SortableTabButtonProps) {
  const { isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: itemKey,
    disabled: { draggable: !enabled || disabled, droppable: !enabled },
  });

  return (
    <button
      ref={(node) => {
        setNodeRef(node);
        register(node);
      }}
      type="button"
      disabled={disabled}
      data-tabs-item={itemKey}
      data-tabs-active={active ? "true" : "false"}
      data-tabs-dragging={isDragging || undefined}
      className={twMerge(
        className,
        enabled && !disabled && "active:cursor-grabbing",
        isDragging && "z-10 opacity-40",
      )}
      style={
        {
          transform: CSS.Transform.toString(transform),
          transition,
        } as CSSProperties
      }
      {...(enabled && !disabled ? listeners : undefined)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Tabs(props: TabsProps) {
  const {
    items = EMPTY_ITEMS,
    activeKey,
    defaultActiveKey,
    animated = false,
    centered = false,
    type = "line",
    size = "md",
    placement = "top",
    className,
    onChange,
    onAdd,
    onDelete,
    onDrag,
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
      setInk({
        left: vertical
          ? placement === "start"
            ? root.clientWidth - 2
            : 0
          : nodeRect.left - rootRect.left,
        top: vertical
          ? nodeRect.top - rootRect.top
          : placement === "bottom"
            ? 0
            : root.clientHeight - 2,
        width: vertical ? 2 : origin,
        height: vertical ? origin : 2,
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
  }, [selected, items, vertical, placement]);
  const change = (key: string, event: React.MouseEvent<HTMLElement>) => {
    onTabClick?.(key, event);
    const item = items.find((entry) => entry.key === key);
    if (!item || item.disabled || key === selected) return;
    if (activeKey === undefined) setInnerActive(key);
    onChange?.(key);
  };
  const remove = (key: string) => {
    if (!onDelete) return;
    const removedIndex = items.findIndex((item) => item.key === key);
    if (removedIndex < 0 || items[removedIndex]?.disabled) return;
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
  const sortingEnabled = type === "card" && onDrag !== undefined;
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!sortingEnabled || !onDrag || !over || active.id === over.id) return;
    const nextItems = reorderTabItems(items, String(active.id), String(over.id));
    if (nextItems !== items) onDrag(nextItems);
  };
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
    >
      <TabsSortContext
        enabled={sortingEnabled}
        items={items.map((item) => item.key)}
        vertical={vertical}
        onDragEnd={handleDragEnd}
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
            <SortableTabButton
              key={item.key}
              active={item.key === selected}
              className={twMerge(
                "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-[#666] hover:text-[#0062df] disabled:cursor-not-allowed disabled:text-[#bbb] motion-reduce:transition-none",
                item.key === selected && "font-medium text-[#0062df]",
                type === "line"
                  ? `${linePadding} transition-colors duration-200`
                  : `${cardSize} border border-[#d9d9d9] bg-[#fafafa] ${cardEdge} transition-[background-color,border-color,color] duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)]`,
                type !== "line" && item.key === selected && "z-[1] bg-white",
                type !== "line" && vertical ? "w-full" : "",
              )}
              disabled={Boolean(item.disabled)}
              enabled={sortingEnabled}
              itemKey={item.key}
              register={(node) => {
                if (node) refs.current.set(item.key, node);
                else refs.current.delete(item.key);
              }}
              onClick={(event) => change(item.key, event)}
            >
              {item.icon}
              <span>{item.label}</span>
              {type === "card" && onDelete !== undefined && item.closable !== false ? (
                <span
                  data-tab-close={item.key}
                  className={twMerge(
                    "inline-flex rounded p-0.5",
                    item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                  )}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (item.disabled) return;
                    remove(item.key);
                  }}
                >
                  <Icon icon="close" size={12} />
                </span>
              ) : null}
            </SortableTabButton>
          ))}
          {type === "card" && onAdd !== undefined ? (
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
              onClick={() => onAdd(items)}
            >
              <Icon icon="add" />
            </button>
          ) : null}
        </div>
      </TabsSortContext>
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
          if (!active && !visitedKeys.current.has(item.key)) return null;
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
