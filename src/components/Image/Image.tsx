import CSSMotion from "@rc-component/motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { lockBodyScroll } from "../_internal/body-scroll-lock";
import { MOTION_DURATION_MID } from "../_internal/motion";
import type {
  ImageActions,
  ImageComponent,
  ImagePreviewConfig,
  ImagePreviewGroupProps,
  ImageProps,
  ImageTransform,
} from "./Image.types";

interface GroupContextValue {
  sources: string[];
  register: (src: string) => () => void;
  open: (src: string, config?: ImagePreviewConfig) => void;
}
const GroupContext = createContext<GroupContextValue | null>(null);
const initialTransform: ImageTransform = {
  x: 0,
  y: 0,
  rotate: 0,
  scale: 1,
  flipX: false,
  flipY: false,
};

function Preview({
  src,
  sources = [src],
  config = {},
  open,
  onClose,
}: {
  src: string;
  sources?: string[];
  config?: ImagePreviewConfig;
  open: boolean;
  onClose: () => void;
}) {
  const [active, setActive] = useState(Math.max(0, sources.indexOf(src)));
  const [transform, setTransform] = useState(initialTransform);
  const unlockScrollRef = useRef<(() => void) | null>(null);
  const dragRef = useRef<{ clientX: number; clientY: number; x: number; y: number } | undefined>(
    undefined,
  );
  const current = sources[active] ?? src;
  const minScale = config.minScale ?? 1,
    maxScale = config.maxScale ?? 50,
    step = config.scaleStep ?? 0.5;
  const apply = (patch: Partial<ImageTransform>, action: string) => {
    setTransform((currentTransform) => {
      const next = { ...currentTransform, ...patch };
      config.onTransform?.({ transform: next, action });
      return next;
    });
  };
  const actions: ImageActions = {
    onActive: (index) => {
      setActive(index);
      setTransform(initialTransform);
    },
    onFlipX: () => apply({ flipX: !transform.flipX }, "flipX"),
    onFlipY: () => apply({ flipY: !transform.flipY }, "flipY"),
    onRotateLeft: () => apply({ rotate: transform.rotate - 90 }, "rotateLeft"),
    onRotateRight: () => apply({ rotate: transform.rotate + 90 }, "rotateRight"),
    onZoomIn: () => apply({ scale: Math.min(maxScale, transform.scale * (1 + step)) }, "zoomIn"),
    onZoomOut: () => apply({ scale: Math.max(minScale, transform.scale / (1 + step)) }, "zoomOut"),
    onReset: () => {
      setTransform(initialTransform);
      config.onTransform?.({ transform: initialTransform, action: "reset" });
    },
  };
  useEffect(() => {
    if (open) setTransform(initialTransform);
  }, [open, current]);
  useEffect(() => {
    setActive(Math.max(0, sources.indexOf(src)));
  }, [sources, src]);
  const releaseBodyScroll = useCallback(() => {
    unlockScrollRef.current?.();
    unlockScrollRef.current = null;
  }, []);
  useEffect(() => {
    if (open && !unlockScrollRef.current) unlockScrollRef.current = lockBodyScroll();
  }, [open]);
  useEffect(() => releaseBodyScroll, [releaseBodyScroll]);
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && active > 0) actions.onActive(active - 1);
      if (event.key === "ArrowRight" && active < sources.length - 1) actions.onActive(active + 1);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  });
  if (typeof document === "undefined") return null;
  const toolbar = (
    <div className="flex h-11 items-center rounded-full bg-black/65 px-2 text-white">
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/10"
        onClick={actions.onZoomOut}
      >
        <Icon icon="remove" size={20} />
      </button>
      <span className="min-w-14 text-center text-sm">{Math.round(transform.scale * 100)}%</span>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/10"
        onClick={actions.onZoomIn}
      >
        <Icon icon="add" size={20} />
      </button>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/10"
        onClick={actions.onRotateLeft}
      >
        <Icon icon="refresh" size={20} />
      </button>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/10"
        onClick={actions.onRotateRight}
      >
        <Icon icon="refresh" size={20} className="-scale-x-100" />
      </button>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full text-xl hover:bg-white/10"
        onClick={actions.onFlipX}
      >
        ↔
      </button>
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full text-xl hover:bg-white/10"
        onClick={actions.onFlipY}
      >
        ↕
      </button>
      <button
        type="button"
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-full px-1 text-xs hover:bg-white/10"
        onClick={actions.onReset}
      >
        1:1
      </button>
    </div>
  );
  const maskConfig =
    typeof config.mask === "object"
      ? config.mask
      : { enabled: config.mask !== false, closable: true };
  const container =
    config.getContainer === false
      ? null
      : typeof config.getContainer === "function"
        ? config.getContainer()
        : typeof config.getContainer === "string"
          ? document.querySelector<HTMLElement>(config.getContainer)
          : (config.getContainer ?? document.body);
  const content = (
    <CSSMotion
      visible={open}
      motionName="wizard-image-preview-motion"
      motionDeadline={MOTION_DURATION_MID + 50}
      removeOnLeave
      onVisibleChanged={(visible) => {
        if (!visible) releaseBodyScroll();
      }}
    >
      {({ className, style }, motionRef) => (
        <div
          ref={motionRef}
          data-image-preview-root
          className={twMerge(
            "fixed inset-0 flex items-center justify-center font-pretendard",
            className,
          )}
          style={{ zIndex: config.zIndex ?? 1080, ...style }}
        >
          {maskConfig.enabled !== false ? (
            <div
              className="wizard-image-preview-mask absolute inset-0 bg-black/45"
              onClick={() => maskConfig.closable !== false && onClose()}
            />
          ) : null}
          <button
            type="button"
            data-image-preview-close
            className="absolute top-5 right-5 z-[2] inline-flex size-10 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
            onClick={onClose}
          >
            {config.closeIcon ?? <Icon icon="close" size={20} />}
          </button>
          {sources.length > 1 ? (
            <>
              <button
                type="button"
                data-image-preview-previous
                disabled={active === 0}
                className="absolute left-5 z-[2] inline-flex size-12 items-center justify-center rounded-full bg-black/45 text-white disabled:opacity-30"
                onClick={() => actions.onActive(active - 1)}
              >
                <Icon icon="chevron-left" size={24} />
              </button>
              <button
                type="button"
                data-image-preview-next
                disabled={active === sources.length - 1}
                className="absolute right-5 z-[2] inline-flex size-12 items-center justify-center rounded-full bg-black/45 text-white disabled:opacity-30"
                onClick={() => actions.onActive(active + 1)}
              >
                <Icon icon="chevron-right" size={24} />
              </button>
            </>
          ) : null}
          <img
            src={current}
            alt=""
            draggable={false}
            className={twMerge(
              "wizard-image-preview-image relative z-[1] max-h-[calc(100vh-140px)] max-w-[calc(100vw-120px)] object-contain transition-transform duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] select-none motion-reduce:transition-none",
              config.movable !== false && "cursor-grab active:cursor-grabbing",
            )}
            style={{
              transform: `translate3d(${transform.x}px,${transform.y}px,0) rotate(${transform.rotate}deg) scale(${transform.scale * (transform.flipX ? -1 : 1)}, ${transform.scale * (transform.flipY ? -1 : 1)})`,
            }}
            onPointerDown={(event) => {
              if (config.movable === false) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = {
                clientX: event.clientX,
                clientY: event.clientY,
                x: transform.x,
                y: transform.y,
              };
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              if (!drag) return;
              apply(
                {
                  x: drag.x + event.clientX - drag.clientX,
                  y: drag.y + event.clientY - drag.clientY,
                },
                "move",
              );
            }}
            onPointerUp={() => {
              dragRef.current = undefined;
            }}
            onPointerCancel={() => {
              dragRef.current = undefined;
            }}
            onWheel={(event) => {
              event.preventDefault();
              if (event.deltaY < 0) actions.onZoomIn();
              else actions.onZoomOut();
            }}
          />
          <div className="absolute bottom-6 z-[2]">
            {config.toolbarRender?.(toolbar, { transform, actions }) ?? toolbar}
          </div>
        </div>
      )}
    </CSSMotion>
  );
  return container ? createPortal(content, container) : content;
}

function ImageBase({
  src,
  fallback,
  width,
  height,
  placeholder,
  preview = true,
  rootStyle,
  className,
  style,
  alt = "",
  onLoad,
  onError,
  ...rest
}: ImageProps) {
  const group = useContext(GroupContext);
  const registerInGroup = group?.register;
  const config = useMemo(() => (typeof preview === "object" ? preview : {}), [preview]);
  const controlledOpen = typeof preview === "object" ? preview.open : undefined;
  const [innerOpen, setInnerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const actualSrc = failed && fallback ? fallback : src;
  useEffect(() => {
    if (!actualSrc || !registerInGroup) return;
    return registerInGroup(actualSrc);
  }, [actualSrc, registerInGroup]);
  useEffect(() => {
    setLoading(Boolean(src));
    setFailed(false);
  }, [src]);
  const changeOpen = (next: boolean) => {
    const previous = controlledOpen ?? innerOpen;
    if (controlledOpen === undefined) setInnerOpen(next);
    config.onOpenChange?.(next, previous);
  };
  const openPreview = () => {
    if (!actualSrc || preview === false) return;
    if (group) group.open(actualSrc, config);
    else changeOpen(true);
  };
  const progressConfig =
    typeof placeholder === "object" && placeholder && "progress" in placeholder
      ? placeholder.progress
      : undefined;
  const progressPercent = typeof progressConfig === "object" ? (progressConfig.percent ?? 0) : 0;
  const progressNode = <span className="text-xs text-[#999]">{progressPercent}%</span>;
  return (
    <span
      className={twMerge("group relative inline-block overflow-hidden align-middle", className)}
      style={{ width, height, ...rootStyle }}
    >
      {loading && placeholder ? (
        <span className="absolute inset-0 flex items-center justify-center bg-[#f5f5f5]">
          {typeof placeholder === "object"
            ? typeof progressConfig === "object" && progressConfig.render
              ? progressConfig.render(progressNode, progressPercent)
              : progressNode
            : placeholder}
        </span>
      ) : null}
      <img
        {...rest}
        src={actualSrc}
        alt={alt}
        className={twMerge(
          "block size-full object-cover",
          preview !== false && "cursor-zoom-in",
          loading && "invisible",
        )}
        style={style}
        onLoad={(event) => {
          setLoading(false);
          onLoad?.(event);
        }}
        onError={(event) => {
          if (fallback && actualSrc !== fallback) {
            setLoading(true);
            setFailed(true);
          } else {
            setLoading(false);
          }
          onError?.(event);
        }}
        onClick={openPreview}
      />
      {preview !== false && !loading ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-[background-color,opacity] duration-300 group-hover:bg-black/45 group-hover:opacity-100">
          {config.cover ?? (
            <>
              <Icon icon="eye" size={20} />
              <span className="ml-2 text-sm">미리보기</span>
            </>
          )}
        </span>
      ) : null}
      {!group && actualSrc ? (
        <Preview
          src={config.src ?? actualSrc}
          config={config}
          open={controlledOpen ?? innerOpen}
          onClose={() => changeOpen(false)}
        />
      ) : null}
    </span>
  );
}

function PreviewGroup({ children, preview = true }: ImagePreviewGroupProps) {
  const config = useMemo(() => (typeof preview === "object" ? preview : {}), [preview]);
  const [sources, setSources] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>();
  const [open, setOpen] = useState(false);
  const register = useCallback((src: string) => {
    setSources((items) => (items.includes(src) ? items : [...items, src]));
    return () => setSources((items) => items.filter((item) => item !== src));
  }, []);
  const openGroup = useCallback(
    (src: string) => {
      if (preview === false) return;
      setCurrent(src);
      setOpen(true);
      config.onOpenChange?.(true, false);
    },
    [preview, config],
  );
  const context = useMemo<GroupContextValue>(
    () => ({
      sources,
      register,
      open: openGroup,
    }),
    [sources, register, openGroup],
  );
  const controlledOpen = typeof preview === "object" ? preview.open : undefined;
  return (
    <GroupContext.Provider value={context}>
      {children}
      {current ? (
        <Preview
          src={current}
          sources={sources}
          config={config}
          open={controlledOpen ?? open}
          onClose={() => {
            setOpen(false);
            config.onOpenChange?.(false, true);
          }}
        />
      ) : null}
    </GroupContext.Provider>
  );
}

export const Image = Object.assign(ImageBase, { PreviewGroup }) as ImageComponent;
