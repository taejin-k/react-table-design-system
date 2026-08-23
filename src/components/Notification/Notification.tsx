import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
  type ReactNode,
} from "react";
import { CSSMotionList } from "@rc-component/motion";
import { createRoot, type Root } from "react-dom/client";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { MOTION_DURATION_MID } from "../_internal/motion";
import type {
  NotificationApi,
  NotificationArgsProps,
  NotificationGlobalConfig,
  NotificationInstance,
  NotificationPlacementType,
  NotificationStatusType,
} from "./Notification.types";

interface NotificationItem extends NotificationArgsProps {
  key: string;
}

const globalConfig: NotificationGlobalConfig = {
  bottom: 24,
  duration: 4.5,
  pauseOnHover: true,
  placement: "topRight",
  showProgress: false,
  stack: { threshold: 3 },
  top: 24,
};

function useNotificationHolder(
  config: NotificationGlobalConfig = {},
): [NotificationInstance, ReactNode] {
  const resolvedConfig = { ...globalConfig, ...config };
  const [items, setItems] = useState<NotificationItem[]>([]);
  const onCloseCallbacks = useRef(new Map<string, (() => void) | undefined>());
  const close = useCallback((key?: string) => {
    setItems((current) => (key === undefined ? [] : current.filter((item) => item.key !== key)));
  }, []);
  const finishClose = useCallback((key: string) => {
    onCloseCallbacks.current.get(key)?.();
    onCloseCallbacks.current.delete(key);
  }, []);
  const open = useCallback(
    (input: NotificationArgsProps) => {
      const key = input.key ?? `notification-${Date.now()}-${Math.random()}`;
      onCloseCallbacks.current.set(key, input.onClose);
      setItems((current) => {
        const item = {
          ...input,
          key,
          duration: input.duration ?? resolvedConfig.duration,
          pauseOnHover: input.pauseOnHover ?? resolvedConfig.pauseOnHover,
          placement: input.placement ?? resolvedConfig.placement,
          showProgress: input.showProgress ?? resolvedConfig.showProgress,
        };
        const next = current.some((currentItem) => currentItem.key === key)
          ? current.map((currentItem) => (currentItem.key === key ? item : currentItem))
          : [...current, item];
        if (!resolvedConfig.maxCount || next.length <= resolvedConfig.maxCount) return next;
        return next.slice(-resolvedConfig.maxCount);
      });
    },
    [
      resolvedConfig.duration,
      resolvedConfig.maxCount,
      resolvedConfig.pauseOnHover,
      resolvedConfig.placement,
      resolvedConfig.showProgress,
    ],
  );
  const api = useMemo<NotificationInstance>(
    () => ({
      open,
      success: (config) => open({ ...config, type: "success" }),
      error: (config) => open({ ...config, type: "error" }),
      info: (config) => open({ ...config, type: "info" }),
      warning: (config) => open({ ...config, type: "warning" }),
      destroy: close,
    }),
    [close, open],
  );
  return [
    api,
    <NotificationHolder
      items={items}
      config={resolvedConfig}
      onClose={close}
      onAfterClose={finishClose}
    />,
  ];
}

const NOTIFICATION_EDGE = 24;
const NOTIFICATION_GAP = 16;
const NOTIFICATION_STACK_OFFSET = 8;
const NOTIFICATION_ESTIMATED_HEIGHT = 86;

const placementClasses: Record<NotificationPlacementType, string> = {
  top: "left-1/2 -translate-x-1/2",
  topLeft: "left-0",
  topRight: "right-0",
  bottom: "left-1/2 -translate-x-1/2",
  bottomLeft: "left-0",
  bottomRight: "right-0",
};

function NotificationHolder({
  items,
  config,
  onClose,
  onAfterClose,
}: {
  items: NotificationItem[];
  config: NotificationGlobalConfig;
  onClose: (key?: string) => void;
  onAfterClose: (key: string) => void;
}) {
  const [expandedPlacements, setExpandedPlacements] = useState<Set<NotificationPlacementType>>(
    () => new Set(),
  );
  const activePlacements = Array.from(new Set(items.map((item) => item.placement ?? "topRight")));
  const [placements, setPlacements] = useState<Set<NotificationPlacementType>>(
    () => new Set(activePlacements),
  );

  useEffect(() => {
    if (activePlacements.length === 0) return;
    setPlacements((current) => {
      const next = new Set(current);
      activePlacements.forEach((placement) => next.add(placement));
      return next.size === current.size ? current : next;
    });
  }, [activePlacements]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      {Array.from(placements).map((placement) => {
        const placedItems = items.filter((item) => item.placement === placement);
        return (
          <NotificationPlacementList
            key={placement}
            items={placedItems}
            placement={placement}
            config={config}
            expanded={expandedPlacements.has(placement)}
            onExpandedChange={(expanded) => {
              setExpandedPlacements((current) => {
                const next = new Set(current);
                if (expanded) next.add(placement);
                else next.delete(placement);
                return next;
              });
            }}
            onClose={onClose}
            onAfterClose={onAfterClose}
            onAllRemoved={() => {
              setPlacements((current) => {
                const next = new Set(current);
                next.delete(placement);
                return next;
              });
              setExpandedPlacements((current) => {
                const next = new Set(current);
                next.delete(placement);
                return next;
              });
            }}
          />
        );
      })}
    </>,
    config.getContainer?.() ?? document.body,
  );
}

function NotificationPlacementList({
  items,
  placement,
  config,
  expanded,
  onExpandedChange,
  onClose,
  onAfterClose,
  onAllRemoved,
}: {
  items: NotificationItem[];
  placement: NotificationPlacementType;
  config: NotificationGlobalConfig;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onClose: (key?: string) => void;
  onAfterClose: (key: string) => void;
  onAllRemoved: () => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<number | undefined>(undefined);
  const threshold = typeof config.stack === "object" ? (config.stack.threshold ?? 3) : 3;
  const stackEnabled = config.stack !== false;
  const stackCollapsed = stackEnabled && items.length > threshold && !expanded;
  const { positions, totalHeight, setNodeSize } = useNotificationLayout(
    items,
    stackCollapsed,
    threshold,
  );
  const positionCacheRef = useRef(new Map<string, number>());
  const indexCacheRef = useRef(new Map<string, number>());
  const keys = useMemo(
    () =>
      items.map((item, index) => ({
        key: item.key,
        item,
        notificationIndex: items.length - index - 1,
      })),
    [items],
  );
  keys.forEach(({ key, notificationIndex }) => {
    positionCacheRef.current.set(key, positions.get(key) ?? 0);
    indexCacheRef.current.set(key, notificationIndex);
  });
  const previousHeightRef = useRef(totalHeight);
  const decreasing = totalHeight < previousHeightRef.current;

  useEffect(() => {
    previousHeightRef.current = totalHeight;
  }, [totalHeight]);

  useEffect(
    () => () => {
      window.clearTimeout(collapseTimerRef.current);
    },
    [],
  );

  const isBottom = placement.startsWith("bottom");

  return (
    <div
      ref={listRef}
      className={twMerge(
        "wizard-notification-list pointer-events-none fixed z-[2050] flex h-screen max-h-screen w-[432px] max-w-screen overflow-x-hidden overflow-y-auto overscroll-contain p-6 font-pretendard",
        isBottom ? "flex-col-reverse" : "flex-col",
        placementClasses[placement],
      )}
      style={
        isBottom
          ? { bottom: (config.bottom ?? NOTIFICATION_EDGE) - NOTIFICATION_EDGE }
          : { top: (config.top ?? NOTIFICATION_EDGE) - NOTIFICATION_EDGE }
      }
      dir={config.rtl ? "rtl" : undefined}
      onMouseEnter={() => {
        window.clearTimeout(collapseTimerRef.current);
        if (stackEnabled && items.length > threshold) onExpandedChange(true);
      }}
      onMouseLeave={(event) => {
        const { clientX, clientY } = event;
        window.clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = window.setTimeout(() => {
          const elementAtPointer = document.elementFromPoint?.(clientX, clientY);
          if (elementAtPointer && listRef.current?.contains(elementAtPointer)) return;
          onExpandedChange(false);
        }, MOTION_DURATION_MID);
      }}
    >
      <div
        className={twMerge(
          "wizard-notification-list-content pointer-events-none relative flex w-full shrink-0 flex-col gap-4",
          decreasing && "wizard-notification-list-content-decrease",
        )}
        style={{ height: totalHeight }}
      >
        <CSSMotionList
          component={false}
          keys={keys}
          motionAppear
          motionName="wizard-notification-motion"
          motionDeadline={MOTION_DURATION_MID + 50}
          onVisibleChanged={(visible, info) => {
            if (!visible) onAfterClose(String(info.key));
          }}
          onAllRemoved={onAllRemoved}
        >
          {(
            { item, notificationIndex, visible, className: motionClassName, style: motionStyle },
            motionRef,
          ) => {
            const resolvedNotificationIndex =
              notificationIndex ?? indexCacheRef.current.get(item.key) ?? 0;
            return (
              <NotificationCard
                key={item.key}
                item={item}
                visible={visible}
                placement={placement}
                offset={positions.get(item.key) ?? positionCacheRef.current.get(item.key) ?? 0}
                notificationIndex={resolvedNotificationIndex}
                stackEnabled={stackEnabled}
                stackCollapsed={stackCollapsed}
                hiddenInStack={stackCollapsed && resolvedNotificationIndex >= threshold}
                entering={
                  motionClassName?.includes("-appear") ||
                  motionClassName?.includes("-enter") ||
                  false
                }
                forcedPaused={expanded}
                globalCloseIcon={config.closeIcon}
                motionClassName={motionClassName}
                motionStyle={motionStyle}
                motionRef={motionRef as Ref<HTMLDivElement>}
                onMeasure={setNodeSize}
                onClose={() => onClose(item.key)}
              />
            );
          }}
        </CSSMotionList>
      </div>
    </div>
  );
}

function useNotificationLayout(
  items: NotificationItem[],
  stackCollapsed: boolean,
  threshold: number,
) {
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const observersRef = useRef(new Map<string, ResizeObserver>());

  const setNodeSize = useCallback((key: string, node: HTMLDivElement | null) => {
    observersRef.current.get(key)?.disconnect();
    observersRef.current.delete(key);
    if (!node) return;

    const measure = () => {
      // transform(scale)은 시각 크기만 바꾸므로 배치 계산에는 원래 레이아웃 높이를 사용한다.
      const height = node.offsetHeight || node.getBoundingClientRect().height;
      if (!height) return;
      setSizes((current) => (current[key] === height ? current : { ...current, [key]: height }));
    };

    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      observersRef.current.set(key, observer);
    }
  }, []);

  useEffect(() => {
    const activeKeys = new Set(items.map((item) => item.key));
    setSizes((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([key]) => activeKeys.has(key)),
      );
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
    observersRef.current.forEach((observer, key) => {
      if (!activeKeys.has(key)) {
        observer.disconnect();
        observersRef.current.delete(key);
      }
    });
  }, [items]);

  useEffect(
    () => () => {
      observersRef.current.forEach((observer) => observer.disconnect());
      observersRef.current.clear();
    },
    [],
  );

  return useMemo(() => {
    const positions = new Map<string, number>();
    const fallbackHeight =
      items
        .slice()
        .reverse()
        .map((item) => sizes[item.key])
        .find((height) => height !== undefined && height > 0) ?? 0;
    let offset = 0;
    let totalHeight = 0;

    items
      .slice()
      .reverse()
      .forEach((item, index) => {
        // A newly opened card is measured after its first commit. Reuse the latest measured
        // card height for that single frame so an existing stack never jumps to a negative row.
        const height = sizes[item.key] ?? (fallbackHeight || estimateNotificationHeight(item));
        const position =
          stackCollapsed && index > 0 ? offset + NOTIFICATION_STACK_OFFSET - height : offset;
        positions.set(item.key, position);

        if (!stackCollapsed || index < threshold) {
          totalHeight = Math.max(totalHeight, position + height);
        }
        offset = stackCollapsed ? position + height : position + height + NOTIFICATION_GAP;
      });

    return { positions, totalHeight, setNodeSize };
  }, [items, setNodeSize, sizes, stackCollapsed, threshold]);
}

function estimateNotificationHeight(item: NotificationItem) {
  const contentHeight =
    item.title != null && item.description != null ? 54 : item.title != null ? 24 : 22;
  const actionsHeight = item.actions ? 44 : 0;
  return NOTIFICATION_ESTIMATED_HEIGHT - 54 + contentHeight + actionsHeight;
}

function NotificationCard({
  item,
  visible,
  placement,
  offset,
  notificationIndex,
  stackEnabled,
  stackCollapsed,
  hiddenInStack,
  entering,
  forcedPaused,
  globalCloseIcon,
  motionClassName,
  motionStyle,
  motionRef,
  onMeasure,
  onClose,
}: {
  item: NotificationItem;
  visible?: boolean;
  placement: NotificationPlacementType;
  offset: number;
  notificationIndex: number;
  stackEnabled: boolean;
  stackCollapsed: boolean;
  hiddenInStack: boolean;
  entering: boolean;
  forcedPaused: boolean;
  globalCloseIcon?: ReactNode;
  motionClassName?: string;
  motionStyle?: CSSProperties;
  motionRef: Ref<HTMLDivElement>;
  onMeasure: (key: string, node: HTMLDivElement | null) => void;
  onClose: () => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const onCloseRef = useRef(onClose);
  const remainingRef = useRef(0);
  const startedAtRef = useRef(0);
  const pausedRef = useRef(false);
  const hoveringRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      assignRef(motionRef, node);
      onMeasure(item.key, node);
    },
    [item.key, motionRef, onMeasure],
  );
  onCloseRef.current = onClose;
  const resumeTimer = useCallback(() => {
    window.clearTimeout(timer.current);
    if (visible === false) return;
    if (remainingRef.current <= 0) return;
    pausedRef.current = false;
    setPaused(false);
    startedAtRef.current = Date.now();
    timer.current = window.setTimeout(() => onCloseRef.current(), remainingRef.current);
  }, [visible]);
  const pauseTimer = useCallback(() => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    setPaused(true);
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    window.clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    remainingRef.current =
      item.duration !== false && item.duration && item.duration > 0 ? item.duration * 1000 : 0;
    resumeTimer();
    return () => window.clearTimeout(timer.current);
  }, [item.duration, item.key, resumeTimer]);
  useEffect(() => {
    if (item.pauseOnHover === false) return;
    if (forcedPaused) pauseTimer();
    else if (!hoveringRef.current) resumeTimer();
  }, [forcedPaused, item.pauseOnHover, pauseTimer, resumeTimer]);
  const closable = item.closable !== false;
  const closeDisabled = typeof item.closable === "object" && item.closable.disabled;
  const closeIcon = typeof item.closable === "object" ? item.closable.closeIcon : undefined;
  const title = item.title;
  const description = item.description;
  const isBottom = placement.startsWith("bottom");
  const scale = stackCollapsed ? 1 - Math.min(notificationIndex, 2) * 0.06 : 1;
  const stackClipPath = !stackEnabled
    ? undefined
    : !stackCollapsed || entering || notificationIndex === 0
      ? "inset(-48px)"
      : isBottom
        ? "inset(-48px -48px 50% -48px)"
        : "inset(50% -48px -48px -48px)";
  return (
    <div
      ref={combinedRef}
      data-notification-index={notificationIndex}
      className={twMerge(
        "wizard-notification-card wizard-notification-motion pointer-events-auto absolute w-full overflow-visible rounded-lg bg-white px-6 py-4 text-sm leading-[1.5715] text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
        motionClassName,
        visible === false && "pointer-events-none",
        hiddenInStack && "wizard-notification-stack-hidden",
        item.classNames?.root,
        item.className,
      )}
      style={
        {
          "--wizard-notification-hidden-transform": notificationHiddenTransform(
            item.placement ?? "topRight",
          ),
          "--wizard-notification-scale": scale,
          "--wizard-notification-visible-transform":
            "translate3d(0, 0, 0) scale(var(--wizard-notification-scale, 1))",
          [isBottom ? "bottom" : "top"]: offset,
          clipPath: stackClipPath,
          transformOrigin: isBottom ? "center top" : "center bottom",
          zIndex: notificationIndex === 0 ? 1000 : 1000 - notificationIndex,
          ...item.style,
          ...item.styles?.root,
          ...motionStyle,
        } as CSSProperties
      }
      onClick={item.onClick}
      onMouseEnter={() => {
        hoveringRef.current = true;
        if (item.pauseOnHover !== false) {
          pauseTimer();
        }
      }}
      onMouseLeave={() => {
        hoveringRef.current = false;
        if (item.pauseOnHover !== false && !forcedPaused) {
          resumeTimer();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className={twMerge("inline-flex shrink-0 leading-none", item.classNames?.icon)}
          style={item.styles?.icon}
        >
          {item.icon ?? <NotificationIcon type={item.type ?? "info"} />}
        </span>
        <div
          className={twMerge(
            "min-w-0 flex-1",
            title != null && description != null && "flex flex-col gap-2",
          )}
        >
          {title != null ? (
            <div
              className={twMerge(
                "text-base leading-6 font-normal",
                closable && "pr-6",
                item.classNames?.title,
              )}
              style={item.styles?.title}
            >
              {title}
            </div>
          ) : null}
          {description != null ? (
            <div
              className={twMerge(
                "text-sm text-[#111]",
                closable && title == null && "pr-6",
                item.classNames?.description,
              )}
              style={item.styles?.description}
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>
      {item.actions ? (
        <div
          className={twMerge("mt-3 flex justify-end gap-2", item.classNames?.actions)}
          style={item.styles?.actions}
        >
          {item.actions}
        </div>
      ) : null}
      {closable ? (
        <Button
          variant="ghost"
          size="md"
          iconOnly
          prefixIcon={
            <span className="inline-flex">
              {closeIcon ?? globalCloseIcon ?? <Icon icon="close" size={16} />}
            </span>
          }
          disabled={closeDisabled}
          className={twMerge(
            "absolute top-[14px] right-5 inline-flex size-7 cursor-pointer items-center justify-center rounded text-[#999] transition-[color,background-color] duration-200 hover:bg-[#f5f5f5] hover:text-[#666] active:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-40",
            item.classNames?.close,
          )}
          style={item.styles?.close}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        />
      ) : null}
      {item.showProgress && item.duration !== false && item.duration ? (
        <div
          className={twMerge(
            "absolute right-2 bottom-0 left-2 h-0.5 origin-left rounded-lg bg-[linear-gradient(90deg,#69b1ff,#0062df)]",
            item.classNames?.progress,
          )}
          style={{
            animation: `wizard-notification-progress ${item.duration}s linear forwards`,
            animationPlayState: paused ? "paused" : "running",
            ...item.styles?.progress,
          }}
        />
      ) : null}
    </div>
  );
}

function NotificationIcon({ type }: { type: NotificationStatusType }) {
  if (type === "success") {
    return (
      <Icon icon="check-circle-filled" color="#52c41a" size={24} data-icon="check-circle-filled" />
    );
  }
  if (type === "error") {
    return (
      <Icon icon="close-circle-filled" color="#ff4d4f" size={24} data-icon="close-circle-filled" />
    );
  }
  if (type === "warning") {
    return (
      <Icon
        icon="warning-circle-filled"
        color="#faad14"
        size={24}
        data-icon="warning-circle-filled"
      />
    );
  }
  return (
    <Icon icon="info-circle-filled" color="#0062df" size={24} data-icon="info-circle-filled" />
  );
}

function notificationHiddenTransform(placement: NotificationPlacementType) {
  const scale = "scale(var(--wizard-notification-scale, 1))";
  if (placement.endsWith("Left")) return `translate3d(-64px, 0, 0) ${scale}`;
  if (placement.endsWith("Right")) return `translate3d(64px, 0, 0) ${scale}`;
  return placement === "bottom"
    ? `translate3d(0, 64px, 0) ${scale}`
    : `translate3d(0, -64px, 0) ${scale}`;
}

function assignRef<T>(ref: Ref<T> | null, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;
let staticInstance: NotificationInstance | null = null;
const queue: Array<(api: NotificationInstance) => void> = [];

function StaticNotificationHost() {
  const [api, holder] = useNotificationHolder();
  useLayoutEffect(() => {
    staticInstance = api;
    queue.splice(0).forEach((run) => run(api));
  }, [api]);
  return holder;
}

function ensureHost() {
  if (root || typeof document === "undefined") return;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  root.render(createElement(StaticNotificationHost));
}

function invoke(
  method: keyof Omit<NotificationInstance, "destroy">,
  config: NotificationArgsProps,
) {
  ensureHost();
  const run = (api: NotificationInstance) => api[method](config);
  if (staticInstance) run(staticInstance);
  else queue.push(run);
}

export const notification: NotificationApi = {
  open: (config) => invoke("open", config),
  success: (config) => invoke("success", config),
  error: (config) => invoke("error", config),
  info: (config) => invoke("info", config),
  warning: (config) => invoke("warning", config),
  destroy: (key) => staticInstance?.destroy(key),
  config: (next) => {
    Object.assign(globalConfig, next);
    if (root) root.render(createElement(StaticNotificationHost));
  },
};
