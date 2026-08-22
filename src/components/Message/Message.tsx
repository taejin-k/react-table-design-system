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
  MessageApi,
  MessageArgsProps,
  MessageGlobalConfig,
  MessageInstance,
  MessageKey,
  MessageType,
  MessageTypeName,
} from "./Message.types";

interface MessageItem extends MessageArgsProps {
  key: MessageKey;
  resolve: (value: boolean) => void;
  closing?: boolean;
}

const globalConfig: MessageGlobalConfig = { duration: 3, stack: false, top: 8 };

function normalize(
  type: MessageTypeName,
  content: ReactNode | MessageArgsProps,
  duration?: number,
  onClose?: () => void,
): MessageArgsProps {
  return typeof content === "object" && content !== null && "content" in content
    ? { ...content, type: content.type ?? type }
    : { content, type, duration, onClose };
}

function useMessageHolder(config: MessageGlobalConfig = {}): [MessageInstance, ReactNode] {
  const resolvedConfig = { ...globalConfig, ...config };
  const [items, setItems] = useState<MessageItem[]>([]);
  const resolvers = useRef(new Map<MessageKey, (value: boolean) => void>());
  const onCloseCallbacks = useRef(new Map<MessageKey, (() => void) | undefined>());
  const closeTimers = useRef(new Map<MessageKey, number>());
  const close = useCallback((key?: MessageKey) => {
    setItems((current) =>
      current.map((item) =>
        (key === undefined || item.key === key) && !item.closing
          ? { ...item, closing: true }
          : item,
      ),
    );
    const keys = key === undefined ? Array.from(resolvers.current.keys()) : [key];
    keys.forEach((targetKey) => {
      if (closeTimers.current.has(targetKey)) return;
      closeTimers.current.set(
        targetKey,
        window.setTimeout(() => {
          onCloseCallbacks.current.get(targetKey)?.();
          onCloseCallbacks.current.delete(targetKey);
          setItems((current) => current.filter((item) => item.key !== targetKey));
          resolvers.current.get(targetKey)?.(true);
          resolvers.current.delete(targetKey);
          closeTimers.current.delete(targetKey);
        }, MOTION_DURATION_MID),
      );
    });
  }, []);
  useEffect(() => () => closeTimers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const open = useCallback(
    (input: MessageArgsProps) => {
      const key = input.key ?? `message-${Date.now()}-${Math.random()}`;
      const closeTimer = closeTimers.current.get(key);
      if (closeTimer !== undefined) {
        window.clearTimeout(closeTimer);
        closeTimers.current.delete(key);
      }
      let resolvePromise: (value: boolean) => void = () => undefined;
      const promise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve;
      });
      resolvers.current.set(key, resolvePromise);
      onCloseCallbacks.current.set(key, input.onClose);
      setItems((current) => {
        const nextItem = {
          ...input,
          key,
          duration: input.duration ?? resolvedConfig.duration,
          resolve: resolvePromise,
        };
        const exists = current.some((item) => item.key === key);
        const next = exists
          ? current.map((item) => (item.key === key ? nextItem : item))
          : [...current, nextItem];
        return resolvedConfig.maxCount ? next.slice(-resolvedConfig.maxCount) : next;
      });
      const result = (() => close(key)) as MessageType;
      // oxlint-disable-next-line unicorn/no-thenable -- Ant Design-compatible awaitable message API.
      result.then = promise.then.bind(promise);
      return result;
    },
    [close, resolvedConfig.duration, resolvedConfig.maxCount],
  );
  const api = useMemo<MessageInstance>(
    () => ({
      open,
      success: (content, duration, onClose) =>
        open(normalize("success", content, duration, onClose)),
      error: (content, duration, onClose) => open(normalize("error", content, duration, onClose)),
      info: (content, duration, onClose) => open(normalize("info", content, duration, onClose)),
      warning: (content, duration, onClose) =>
        open(normalize("warning", content, duration, onClose)),
      loading: (content, duration = 0, onClose) =>
        open(normalize("loading", content, duration, onClose)),
      destroy: close,
    }),
    [close, open],
  );
  const holder = <MessageHolder items={items} config={resolvedConfig} onClose={close} />;
  return [api, holder];
}

function MessageHolder({
  items,
  config,
  onClose,
}: {
  items: MessageItem[];
  config: MessageGlobalConfig;
  onClose: (key?: MessageKey) => void;
}) {
  const threshold = typeof config.stack === "object" ? (config.stack.threshold ?? 3) : 3;
  const stacked = Boolean(config.stack) && items.length > threshold;
  const visibleItems = stacked ? items.slice(-threshold) : items;
  const content = (
    <div
      className={twMerge(
        "pointer-events-none fixed inset-x-0 flex flex-col items-center gap-2 px-4 font-pretendard",
        config.prefixCls,
      )}
      dir={config.rtl ? "rtl" : undefined}
      style={{ top: config.top ?? 8, zIndex: 2010 }}
    >
      {visibleItems.map((item, index) => (
        <MessageCard
          key={item.key}
          item={item}
          stacked={stacked}
          index={index}
          count={visibleItems.length}
          onClose={() => onClose(item.key)}
        />
      ))}
    </div>
  );
  if (typeof document === "undefined") return null;
  return createPortal(content, config.getContainer?.() ?? document.body);
}

function MessageCard({
  item,
  stacked,
  index,
  count,
  onClose,
}: {
  item: MessageItem;
  stacked: boolean;
  index: number;
  count: number;
  onClose: () => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const startTimer = useCallback(() => {
    window.clearTimeout(timer.current);
    if (item.closing) return;
    if (item.duration && item.duration > 0)
      timer.current = window.setTimeout(onClose, item.duration * 1000);
  }, [item.closing, item.duration, onClose]);
  useEffect(() => {
    startTimer();
    return () => window.clearTimeout(timer.current);
  }, [startTimer]);
  const icon = item.icon ?? <TypeIcon type={item.type ?? "info"} />;
  return (
    <div
      className={twMerge(
        "pointer-events-auto flex min-h-10 max-w-[calc(100vw-32px)] items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-[#111] shadow-[0_6px_18px_rgba(0,0,0,0.14)] transition-[transform,opacity] duration-200 motion-reduce:transition-none",
        item.closing && "pointer-events-none",
        item.classNames?.root,
        item.className,
      )}
      style={{
        opacity: entered && !item.closing ? 1 : 0,
        transform:
          entered && !item.closing
            ? stacked
              ? `translateY(${(count - index - 1) * -4}px) scale(${1 - (count - index - 1) * 0.03})`
              : "translateY(0)"
            : "translateY(-100%)",
        transitionTimingFunction:
          entered && !item.closing ? MOTION_EASE_OUT_CIRC : MOTION_EASE_IN_OUT_CIRC,
        ...item.style,
        ...item.styles?.root,
      }}
      onClick={item.onClick}
      onMouseEnter={() => item.pauseOnHover !== false && window.clearTimeout(timer.current)}
      onMouseLeave={() => item.pauseOnHover !== false && startTimer()}
    >
      <span
        className={twMerge("inline-flex shrink-0", item.classNames?.icon)}
        style={item.styles?.icon}
      >
        {icon}
      </span>
      <span className={twMerge("min-w-0", item.classNames?.content)} style={item.styles?.content}>
        {item.content}
      </span>
    </div>
  );
}

function TypeIcon({ type }: { type: MessageTypeName }) {
  if (type === "loading") return <Icon icon="loading" color="#0062df" />;
  if (type === "success") return <Icon icon="check-circle-outlined" color="#52c41a" />;
  if (type === "error") return <Icon icon="close-circle-outlined" color="#ff4d4f" />;
  if (type === "warning") return <Icon icon="warning" color="#faad14" />;
  return <Icon icon="info-circle-outlined" color="#0062df" />;
}

let root: Root | null = null;
let container: HTMLDivElement | null = null;
let staticInstance: MessageInstance | null = null;
const queue: Array<(api: MessageInstance) => void> = [];

function StaticMessageHost() {
  const [api, holder] = useMessageHolder();
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
  root.render(createElement(StaticMessageHost));
}

function invoke(method: keyof Omit<MessageInstance, "destroy">, ...args: unknown[]) {
  ensureHost();
  let result: MessageType | undefined;
  const run = (api: MessageInstance) => {
    result = (api[method] as (...values: unknown[]) => MessageType)(...args);
  };
  if (staticInstance) run(staticInstance);
  else queue.push(run);
  const pending = new Promise<boolean>((resolve) => queue.push(() => result?.then(resolve)));
  const handle = (() => result?.()) as MessageType;
  // oxlint-disable-next-line unicorn/no-thenable -- Ant Design-compatible awaitable message API.
  handle.then = pending.then.bind(pending);
  return result ?? handle;
}

export const message: MessageApi = {
  open: (config) => invoke("open", config),
  success: (content, duration, onClose) => invoke("success", content, duration, onClose),
  error: (content, duration, onClose) => invoke("error", content, duration, onClose),
  info: (content, duration, onClose) => invoke("info", content, duration, onClose),
  warning: (content, duration, onClose) => invoke("warning", content, duration, onClose),
  loading: (content, duration, onClose) => invoke("loading", content, duration, onClose),
  destroy: (key) => staticInstance?.destroy(key),
  config: (next) => {
    Object.assign(globalConfig, next);
    if (root) root.render(createElement(StaticMessageHost));
  },
  useMessage: useMessageHolder,
};
