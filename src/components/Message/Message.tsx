import {
  createElement,
  useCallback,
  useEffect,
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
import { Icon } from "../Icon";
import { MOTION_DURATION_MID } from "../_internal/motion";
import type {
  MessageApi,
  MessageArgsProps,
  MessageInstance,
  MessageKeyType,
  MessageType,
  MessageStatusType,
} from "./Message.types";

interface MessageItem extends MessageArgsProps {
  key: MessageKeyType;
  resolve: (value: boolean) => void;
}

const MESSAGE_DURATION = 3;
const MESSAGE_TOP = 8;

function useMessageHolder(): [MessageInstance, ReactNode] {
  const [items, setItems] = useState<MessageItem[]>([]);
  const resolvers = useRef(new Map<MessageKeyType, Array<(value: boolean) => void>>());
  const onCloseCallbacks = useRef(new Map<MessageKeyType, (() => void) | undefined>());
  const close = useCallback((key?: MessageKeyType) => {
    setItems((current) => (key === undefined ? [] : current.filter((item) => item.key !== key)));
  }, []);
  const finishClose = useCallback((key: MessageKeyType) => {
    onCloseCallbacks.current.get(key)?.();
    onCloseCallbacks.current.delete(key);
    resolvers.current.get(key)?.forEach((resolve) => resolve(true));
    resolvers.current.delete(key);
  }, []);
  const open = useCallback(
    (input: MessageArgsProps) => {
      const key = input.key ?? `message-${Date.now()}-${Math.random()}`;
      let resolvePromise: (value: boolean) => void = () => undefined;
      const promise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve;
      });
      resolvers.current.set(key, [...(resolvers.current.get(key) ?? []), resolvePromise]);
      onCloseCallbacks.current.set(key, input.onClose);
      setItems((current) => {
        const nextItem = {
          ...input,
          key,
          duration: input.duration ?? (input.type === "loading" ? 0 : MESSAGE_DURATION),
          resolve: resolvePromise,
        };
        const exists = current.some((item) => item.key === key);
        const next = exists
          ? current.map((item) => (item.key === key ? nextItem : item))
          : [...current, nextItem];
        return next;
      });
      const result = (() => close(key)) as MessageType;
      // oxlint-disable-next-line unicorn/no-thenable -- Ant Design-compatible awaitable message API.
      result.then = promise.then.bind(promise);
      return result;
    },
    [close],
  );
  const api = useMemo<MessageInstance>(
    () => ({
      open,
      success: (config) => open({ ...config, type: "success" }),
      error: (config) => open({ ...config, type: "error" }),
      info: (config) => open({ ...config, type: "info" }),
      warning: (config) => open({ ...config, type: "warning" }),
      loading: (config) => open({ ...config, type: "loading" }),
      destroy: close,
    }),
    [close, open],
  );
  const holder = <MessageHolder items={items} onClose={close} onAfterClose={finishClose} />;
  return [api, holder];
}

function MessageHolder({
  items,
  onClose,
  onAfterClose,
}: {
  items: MessageItem[];
  onClose: (key?: MessageKeyType) => void;
  onAfterClose: (key: MessageKeyType) => void;
}) {
  const { positions, totalHeight, setNodeSize } = useMessageLayout(items);
  const previousHeightRef = useRef(totalHeight);
  const decreasing = totalHeight < previousHeightRef.current;
  previousHeightRef.current = totalHeight;
  const positionCacheRef = useRef(new Map<MessageKeyType, number>());
  const keys = items.map((item) => {
    positionCacheRef.current.set(item.key, positions.get(item.key) ?? 0);
    return { key: item.key, item };
  });
  const content = (
    <div
      className="pointer-events-none fixed left-0 px-4 font-pretendard"
      style={{ top: MESSAGE_TOP, right: "var(--wizard-scrollbar-compensation, 0px)", zIndex: 2010 }}
    >
      <div
        className={twMerge(
          "wizard-message-list-content relative w-full",
          decreasing && "wizard-message-list-content-decrease",
        )}
        style={{ height: totalHeight }}
      >
        <CSSMotionList
          component={false}
          keys={keys}
          motionAppear
          motionName="wizard-message-motion"
          motionDeadline={MOTION_DURATION_MID + 50}
          onVisibleChanged={(visible, info) => {
            if (!visible) onAfterClose(info.key as MessageKeyType);
          }}
        >
          {({ item, visible, className: motionClassName, style: motionStyle }, motionRef) => (
            <MessageCard
              key={item.key}
              item={item}
              visible={visible}
              offset={positions.get(item.key) ?? positionCacheRef.current.get(item.key) ?? 0}
              motionClassName={motionClassName}
              motionStyle={motionStyle}
              motionRef={motionRef as Ref<HTMLDivElement>}
              onMeasure={setNodeSize}
              onClose={() => onClose(item.key)}
            />
          )}
        </CSSMotionList>
      </div>
    </div>
  );
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

function useMessageLayout(items: MessageItem[]) {
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const observersRef = useRef(new Map<string, ResizeObserver>());

  const setNodeSize = useCallback((key: MessageKeyType, node: HTMLDivElement | null) => {
    const stringKey = String(key);
    observersRef.current.get(stringKey)?.disconnect();
    observersRef.current.delete(stringKey);
    if (!node) return;

    const measure = () => {
      const height = node.offsetHeight || node.getBoundingClientRect().height;
      if (!height) return;
      setSizes((current) =>
        current[stringKey] === height ? current : { ...current, [stringKey]: height },
      );
    };

    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      observersRef.current.set(stringKey, observer);
    }
  }, []);

  useEffect(() => {
    const activeKeys = new Set(items.map((item) => String(item.key)));
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
    const positions = new Map<MessageKeyType, number>();
    let offset = 0;
    let totalHeight = 0;

    items.forEach((item) => {
      const height = sizes[String(item.key)] ?? 0;
      positions.set(item.key, offset);
      totalHeight = Math.max(totalHeight, offset + height);
      offset += height + 8;
    });

    return { positions, totalHeight, setNodeSize };
  }, [items, setNodeSize, sizes]);
}

function MessageCard({
  item,
  visible,
  offset,
  motionClassName,
  motionStyle,
  motionRef,
  onMeasure,
  onClose,
}: {
  item: MessageItem;
  visible?: boolean;
  offset: number;
  motionClassName?: string;
  motionStyle?: CSSProperties;
  motionRef: Ref<HTMLDivElement>;
  onMeasure: (key: MessageKeyType, node: HTMLDivElement | null) => void;
  onClose: () => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const onCloseRef = useRef(onClose);
  const remainingRef = useRef(0);
  const startedAtRef = useRef(0);
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof motionRef === "function") motionRef(node);
      else if (motionRef) motionRef.current = node;
      onMeasure(item.key, node);
    },
    [item.key, motionRef, onMeasure],
  );
  onCloseRef.current = onClose;
  const resumeTimer = useCallback(() => {
    window.clearTimeout(timer.current);
    if (visible === false) return;
    if (remainingRef.current <= 0) return;
    startedAtRef.current = Date.now();
    timer.current = window.setTimeout(() => onCloseRef.current(), remainingRef.current);
  }, [visible]);
  useEffect(() => {
    remainingRef.current = item.duration && item.duration > 0 ? item.duration * 1000 : 0;
    resumeTimer();
    return () => window.clearTimeout(timer.current);
  }, [item.duration, item.key, resumeTimer]);
  const icon = item.icon ?? <TypeIcon type={item.type ?? "info"} />;
  return (
    <div
      ref={combinedRef}
      className={twMerge(
        "wizard-message-card pointer-events-auto absolute left-1/2 flex min-h-10 max-w-[calc(100vw-32px)] items-start gap-1.5 rounded-lg bg-white px-3 py-2.5 text-sm text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]",
        motionClassName,
        visible === false && "pointer-events-none",
      )}
      style={
        {
          "--wizard-message-hidden-transform": "translate3d(-50%, -64px, 0)",
          "--wizard-message-visible-transform": "translate3d(-50%, 0, 0)",
          top: offset,
          transformOrigin: "center top",
          ...motionStyle,
        } as CSSProperties
      }
      onClick={item.onClick}
      onMouseEnter={() => {
        if (item.pauseOnHover === false || !timer.current) return;
        remainingRef.current = Math.max(
          0,
          remainingRef.current - (Date.now() - startedAtRef.current),
        );
        window.clearTimeout(timer.current);
      }}
      onMouseLeave={() => item.pauseOnHover !== false && resumeTimer()}
    >
      <span className="inline-flex shrink-0">{icon}</span>
      <span className="min-w-0 leading-5 [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
        {item.content}
      </span>
    </div>
  );
}

function TypeIcon({ type }: { type: MessageStatusType }) {
  if (type === "loading") return <Icon icon="loading" color="#0062df" size={20} />;
  if (type === "success") return <Icon icon="check-circle-filled" color="#52c41a" size={20} />;
  if (type === "error") return <Icon icon="close-circle-filled" color="#ff4d4f" size={20} />;
  if (type === "warning") return <Icon icon="warning-circle-filled" color="#faad14" size={20} />;
  return <Icon icon="info-circle-filled" color="#0062df" size={20} />;
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

function invoke(method: keyof Omit<MessageInstance, "destroy">, config: MessageArgsProps) {
  ensureHost();
  if (staticInstance) return staticInstance[method](config);

  let result: MessageType | undefined;
  let closeRequested = false;
  let resolvePending: (value: boolean) => void = () => undefined;
  const pending = new Promise<boolean>((resolve) => {
    resolvePending = resolve;
  });
  const handle = (() => {
    if (result) result();
    else closeRequested = true;
  }) as MessageType;
  // oxlint-disable-next-line unicorn/no-thenable -- Ant Design-compatible awaitable message API.
  handle.then = pending.then.bind(pending);
  queue.push((api) => {
    result = api[method](config);
    result.then(resolvePending);
    if (closeRequested) result();
  });
  return handle;
}

export const message: MessageApi = {
  open: (config) => invoke("open", config),
  success: (config) => invoke("success", config),
  error: (config) => invoke("error", config),
  info: (config) => invoke("info", config),
  warning: (config) => invoke("warning", config),
  loading: (config) => invoke("loading", config),
  destroy: (key) => staticInstance?.destroy(key),
};
