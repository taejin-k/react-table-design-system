import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import {
  MOTION_DURATION_MID,
  MOTION_EASE_IN_OUT_CIRC,
  MOTION_EASE_OUT_CIRC,
} from "../_internal/motion";
import type {
  NotificationApi,
  NotificationArgsProps,
  NotificationGlobalConfig,
  NotificationInstance,
  NotificationPlacement,
  NotificationType,
} from "./Notification.types";

interface NotificationItem extends NotificationArgsProps {
  key: string;
  closing?: boolean;
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
  const closeTimers = useRef(new Map<string, number>());
  const close = useCallback((key?: string) => {
    const targetKeys = key === undefined ? Array.from(onCloseCallbacks.current.keys()) : [key];
    setItems((current) =>
      current.map((item) =>
        targetKeys.includes(item.key) && !item.closing ? { ...item, closing: true } : item,
      ),
    );
    targetKeys.forEach((targetKey) => {
      if (closeTimers.current.has(targetKey)) return;
      closeTimers.current.set(
        targetKey,
        window.setTimeout(() => {
          onCloseCallbacks.current.get(targetKey)?.();
          onCloseCallbacks.current.delete(targetKey);
          setItems((latest) => latest.filter((item) => item.key !== targetKey));
          closeTimers.current.delete(targetKey);
        }, MOTION_DURATION_MID),
      );
    });
  }, []);
  useEffect(() => () => closeTimers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const open = useCallback(
    (input: NotificationArgsProps) => {
      const key = input.key ?? `notification-${Date.now()}-${Math.random()}`;
      const closeTimer = closeTimers.current.get(key);
      if (closeTimer !== undefined) {
        window.clearTimeout(closeTimer);
        closeTimers.current.delete(key);
      }
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
        return resolvedConfig.maxCount ? next.slice(-resolvedConfig.maxCount) : next;
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
  return [api, <NotificationHolder items={items} config={resolvedConfig} onClose={close} />];
}

const placementClasses: Record<NotificationPlacement, string> = {
  top: "top-0 left-1/2 -translate-x-1/2 items-center",
  topLeft: "top-0 left-0 items-start",
  topRight: "top-0 right-0 items-end",
  bottom: "bottom-0 left-1/2 -translate-x-1/2 items-center",
  bottomLeft: "bottom-0 left-0 items-start",
  bottomRight: "right-0 bottom-0 items-end",
};

function NotificationHolder({
  items,
  config,
  onClose,
}: {
  items: NotificationItem[];
  config: NotificationGlobalConfig;
  onClose: (key?: string) => void;
}) {
  const placements = Array.from(new Set(items.map((item) => item.placement ?? "topRight")));
  if (typeof document === "undefined") return null;
  return createPortal(
    <>
      {placements.map((placement) => {
        const placedItems = items.filter((item) => item.placement === placement);
        const threshold = typeof config.stack === "object" ? (config.stack.threshold ?? 3) : 3;
        const stacked = config.stack !== false && placedItems.length > threshold;
        const visible = stacked ? placedItems.slice(-threshold) : placedItems;
        return (
          <div
            key={placement}
            className={twMerge(
              "pointer-events-none fixed z-[2050] flex w-[384px] max-w-[calc(100vw-32px)] flex-col gap-3 p-4 font-pretendard",
              placementClasses[placement],
            )}
            style={
              placement.startsWith("top")
                ? { top: config.top ?? 24 }
                : { bottom: config.bottom ?? 24 }
            }
            dir={config.rtl ? "rtl" : undefined}
          >
            {visible.map((item, index) => (
              <NotificationCard
                key={item.key}
                item={item}
                stacked={stacked}
                index={index}
                count={visible.length}
                globalCloseIcon={config.closeIcon}
                onClose={() => onClose(item.key)}
              />
            ))}
          </div>
        );
      })}
    </>,
    config.getContainer?.() ?? document.body,
  );
}

function NotificationCard({
  item,
  stacked,
  index,
  count,
  globalCloseIcon,
  onClose,
}: {
  item: NotificationItem;
  stacked: boolean;
  index: number;
  count: number;
  globalCloseIcon?: ReactNode;
  onClose: () => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const [entered, setEntered] = useState(false);
  const [paused, setPaused] = useState(false);
  const startTimer = useCallback(() => {
    window.clearTimeout(timer.current);
    if (item.closing) return;
    if (item.duration !== false && item.duration && item.duration > 0)
      timer.current = window.setTimeout(onClose, item.duration * 1000);
  }, [item.closing, item.duration, onClose]);
  useEffect(() => {
    startTimer();
    return () => window.clearTimeout(timer.current);
  }, [startTimer]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const closable = item.closable !== false;
  const closeDisabled = typeof item.closable === "object" && item.closable.disabled;
  const closeIcon = typeof item.closable === "object" ? item.closable.closeIcon : undefined;
  const title = item.title ?? item.message;
  return (
    <div
      {...item.props}
      role={item.role ?? "alert"}
      className={twMerge(
        "pointer-events-auto relative w-full overflow-hidden rounded-lg bg-white p-4 text-sm text-[#111] shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-[transform,opacity] duration-200 motion-reduce:transition-none",
        item.closing && "pointer-events-none",
        item.classNames?.root,
        item.className,
      )}
      style={{
        opacity: entered && !item.closing ? 1 : 0,
        transform:
          entered && !item.closing
            ? stacked
              ? `translateY(${(count - index - 1) * -5}px) scale(${1 - (count - index - 1) * 0.03})`
              : "translate(0)"
            : notificationHiddenTransform(item.placement ?? "topRight"),
        transitionTimingFunction:
          entered && !item.closing ? MOTION_EASE_OUT_CIRC : MOTION_EASE_IN_OUT_CIRC,
        ...item.style,
        ...item.styles?.root,
      }}
      onClick={item.onClick}
      onMouseEnter={() => {
        if (item.pauseOnHover !== false) {
          setPaused(true);
          window.clearTimeout(timer.current);
        }
      }}
      onMouseLeave={() => {
        if (item.pauseOnHover !== false) {
          setPaused(false);
          startTimer();
        }
      }}
    >
      <div className="flex gap-3 pr-6">
        <span
          className={twMerge("mt-0.5 inline-flex shrink-0", item.classNames?.icon)}
          style={item.styles?.icon}
        >
          {item.icon ?? <NotificationIcon type={item.type ?? "info"} />}
        </span>
        <div className="min-w-0 flex-1">
          {title !== undefined ? (
            <div
              className={twMerge("font-semibold", item.classNames?.title)}
              style={item.styles?.title}
            >
              {title}
            </div>
          ) : null}
          <div
            className={twMerge(
              title !== undefined && "mt-1 text-[#666]",
              item.classNames?.description,
            )}
            style={item.styles?.description}
          >
            {item.description}
          </div>
          {item.actions ? (
            <div
              className={twMerge("mt-3 flex justify-end gap-2", item.classNames?.actions)}
              style={item.styles?.actions}
            >
              {item.actions}
            </div>
          ) : null}
        </div>
      </div>
      {closable ? (
        <button
          type="button"
          disabled={closeDisabled}
          className={twMerge(
            "absolute top-3 right-3 inline-flex size-6 cursor-pointer items-center justify-center rounded text-[#999] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40",
            item.classNames?.close,
          )}
          style={item.styles?.close}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
        >
          {closeIcon ?? item.closeIcon ?? globalCloseIcon ?? <Icon icon="close" />}
        </button>
      ) : null}
      {item.showProgress && item.duration !== false && item.duration ? (
        <div
          className={twMerge(
            "absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[#0062df]",
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

function NotificationIcon({ type }: { type: NotificationType }) {
  if (type === "success") return <Icon icon="check-circle" color="#52c41a" size={20} />;
  if (type === "error") return <Icon icon="close-circle" color="#ff4d4f" size={20} />;
  if (type === "warning") return <Icon icon="warning" color="#faad14" size={20} />;
  return <Icon icon="info" color="#0062df" size={20} />;
}

function notificationHiddenTransform(placement: NotificationPlacement) {
  if (placement.endsWith("Left")) return "translateX(-100%)";
  if (placement.endsWith("Right")) return "translateX(100%)";
  return placement === "bottom" ? "translateY(100%)" : "translateY(-100%)";
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;
let staticInstance: NotificationInstance | null = null;
const queue: Array<(api: NotificationInstance) => void> = [];

function StaticNotificationHost() {
  const [api, holder] = useNotificationHolder();
  useEffect(() => {
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
  useNotification: useNotificationHolder,
};
