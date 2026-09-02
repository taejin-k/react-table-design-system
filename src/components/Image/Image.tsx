import CSSMotion from "@rc-component/motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { Skeleton } from "../Skeleton";
import { lockBodyScroll } from "../_internal/body-scroll-lock";
import { MOTION_DURATION_SLOW } from "../_internal/motion";
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
  open: (src: string, origin: PreviewOrigin, config: ImagePreviewConfig) => void;
}
interface PreviewOrigin {
  x: number;
  y: number;
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
  origin,
  onClose,
}: {
  src: string;
  sources?: string[];
  config?: ImagePreviewConfig;
  open: boolean;
  origin?: PreviewOrigin;
  onClose: () => void;
}) {
  const [active, setActive] = useState(Math.max(0, sources.indexOf(src)));
  const [transform, setTransform] = useState(initialTransform);
  const [dragging, setDragging] = useState(false);
  const unlockScrollRef = useRef<(() => void) | null>(null);
  const dragRef = useRef<{ clientX: number; clientY: number; x: number; y: number } | undefined>(
    undefined,
  );
  const dragFrameRef = useRef<number | undefined>(undefined);
  const pendingDragRef = useRef<{ x: number; y: number } | undefined>(undefined);
  const current = sources[active] ?? src;
  const maskEnabled = config.mask !== false;
  const minScale = 0.25;
  const maxScale = 50;
  const step = 0.5;
  const updateTransform = (updater: (currentTransform: ImageTransform) => ImageTransform) => {
    setTransform(updater);
  };
  const actions: ImageActions = {
    onActive: (index) => {
      setActive(index);
      setTransform(initialTransform);
    },
    onFlipX: () =>
      updateTransform((currentTransform) => ({
        ...currentTransform,
        flipX: !currentTransform.flipX,
      })),
    onFlipY: () =>
      updateTransform((currentTransform) => ({
        ...currentTransform,
        flipY: !currentTransform.flipY,
      })),
    onRotateLeft: () =>
      updateTransform((currentTransform) => ({
        ...currentTransform,
        rotate: currentTransform.rotate - 90,
      })),
    onRotateRight: () =>
      updateTransform((currentTransform) => ({
        ...currentTransform,
        rotate: currentTransform.rotate + 90,
      })),
    onZoomIn: () =>
      updateTransform((currentTransform) => ({
        ...currentTransform,
        scale: Math.min(
          maxScale,
          currentTransform.scale < 1
            ? Number((currentTransform.scale + step / 2).toFixed(4))
            : currentTransform.scale * (1 + step),
        ),
      })),
    onZoomOut: () =>
      updateTransform((currentTransform) => ({
        ...currentTransform,
        scale: Math.max(
          minScale,
          currentTransform.scale <= 1
            ? Number((currentTransform.scale - step / 2).toFixed(4))
            : currentTransform.scale / (1 + step),
        ),
      })),
    onReset: () => {
      setTransform(initialTransform);
    },
  };
  const zoomOutDisabled = transform.scale <= minScale;
  const zoomInDisabled = transform.scale >= maxScale;
  useEffect(() => {
    if (open) setTransform(initialTransform);
  }, [open, current]);
  useEffect(
    () => () => {
      if (dragFrameRef.current !== undefined) cancelAnimationFrame(dragFrameRef.current);
    },
    [],
  );
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
  const actionClassName =
    "pointer-events-auto inline-flex size-[42px] cursor-pointer items-center justify-center border-0 bg-transparent p-3 text-[rgba(255,255,255,0.65)] transition-colors hover:text-[rgba(255,255,255,0.85)] disabled:cursor-not-allowed disabled:text-[rgba(255,255,255,0.25)] motion-reduce:transition-none";
  const toolbar = (
    <div
      data-image-preview-actions
      className="flex h-[42px] items-center gap-3 rounded-full bg-black/10 px-6"
    >
      <button
        type="button"
        data-image-preview-action="flip-vertical"
        className={actionClassName}
        onClick={actions.onFlipY}
      >
        <Icon icon="flip-vertical" size={18} />
      </button>
      <button
        type="button"
        data-image-preview-action="flip-horizontal"
        className={actionClassName}
        onClick={actions.onFlipX}
      >
        <Icon icon="flip-horizontal" size={18} />
      </button>
      <button
        type="button"
        data-image-preview-action="rotate-left"
        className={actionClassName}
        onClick={actions.onRotateLeft}
      >
        <Icon icon="rotate-left" size={18} />
      </button>
      <button
        type="button"
        data-image-preview-action="rotate-right"
        className={actionClassName}
        onClick={actions.onRotateRight}
      >
        <Icon icon="rotate-right" size={18} />
      </button>
      <button
        type="button"
        data-image-preview-action="zoom-out"
        className={actionClassName}
        disabled={zoomOutDisabled}
        onClick={actions.onZoomOut}
      >
        <Icon icon="zoom-out" size={18} />
      </button>
      <button
        type="button"
        data-image-preview-action="zoom-in"
        className={actionClassName}
        disabled={zoomInDisabled}
        onClick={actions.onZoomIn}
      >
        <Icon icon="zoom-in" size={18} />
      </button>
    </div>
  );
  const content = (
    <CSSMotion
      visible={open}
      motionName="wizard-image-preview-motion"
      motionDeadline={MOTION_DURATION_SLOW + 50}
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
            "pointer-events-none fixed inset-0 flex items-center justify-center font-pretendard",
            className,
          )}
          style={{ zIndex: config.zIndex ?? 1080, ...style }}
        >
          {maskEnabled ? (
            <div
              className={twMerge(
                "wizard-image-preview-mask pointer-events-auto absolute inset-0 cursor-pointer bg-black/45",
              )}
              onClick={onClose}
            />
          ) : null}
          <button
            type="button"
            data-image-preview-close
            className="pointer-events-auto absolute top-3 right-3 z-[2] inline-flex size-[42px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/10 p-3 text-white transition-colors hover:bg-black/20 motion-reduce:transition-none"
            onClick={onClose}
          >
            <Icon icon="close" size={18} />
          </button>
          {sources.length > 1 ? (
            <>
              <button
                type="button"
                data-image-preview-previous
                disabled={active === 0}
                className="pointer-events-auto absolute left-3 z-[2] inline-flex size-[42px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/10 p-3 text-white transition-colors hover:bg-black/20 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[rgba(255,255,255,0.25)] motion-reduce:transition-none"
                onClick={() => actions.onActive(active - 1)}
              >
                <Icon icon="chevron-left" size={18} />
              </button>
              <button
                type="button"
                data-image-preview-next
                disabled={active === sources.length - 1}
                className="pointer-events-auto absolute right-3 z-[2] inline-flex size-[42px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/10 p-3 text-white transition-colors hover:bg-black/20 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[rgba(255,255,255,0.25)] motion-reduce:transition-none"
                onClick={() => actions.onActive(active + 1)}
              >
                <Icon icon="chevron-right" size={18} />
              </button>
            </>
          ) : null}
          <div
            data-image-preview-body
            className="wizard-image-preview-body pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ transformOrigin: origin ? `${origin.x}px ${origin.y}px` : "center center" }}
          >
            <img
              src={current}
              alt=""
              draggable={false}
              className={twMerge(
                "wizard-image-preview-image pointer-events-auto relative z-[1] max-h-[calc(100vh-140px)] max-w-[calc(100vw-120px)] touch-none object-contain will-change-transform select-none",
                !dragging &&
                  "transition-transform duration-300 ease-[cubic-bezier(0,0,0.25,1)] motion-reduce:transition-none",
                dragging ? "cursor-grabbing" : "cursor-grab",
              )}
              style={{
                transform: `translate3d(${transform.x}px,${transform.y}px,0) rotate(${transform.rotate}deg) scale(${transform.scale * (transform.flipX ? -1 : 1)}, ${transform.scale * (transform.flipY ? -1 : 1)})`,
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture?.(event.pointerId);
                setDragging(true);
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
                pendingDragRef.current = {
                  x: drag.x + event.clientX - drag.clientX,
                  y: drag.y + event.clientY - drag.clientY,
                };
                if (dragFrameRef.current !== undefined) return;
                dragFrameRef.current = requestAnimationFrame(() => {
                  dragFrameRef.current = undefined;
                  const pendingDrag = pendingDragRef.current;
                  if (!pendingDrag) return;
                  updateTransform((currentTransform) => ({
                    ...currentTransform,
                    ...pendingDrag,
                  }));
                });
              }}
              onPointerUp={() => {
                dragRef.current = undefined;
                pendingDragRef.current = undefined;
                setDragging(false);
              }}
              onPointerCancel={() => {
                dragRef.current = undefined;
                pendingDragRef.current = undefined;
                setDragging(false);
              }}
              onWheel={(event) => {
                event.preventDefault();
                if (event.deltaY < 0) actions.onZoomIn();
                else actions.onZoomOut();
              }}
            />
          </div>
          <div className="absolute bottom-8 z-[2] flex flex-col items-center gap-3">
            {sources.length > 1 ? (
              <span data-image-preview-count className="text-sm text-[rgba(255,255,255,0.65)]">
                {active + 1} / {sources.length}
              </span>
            ) : null}
            {toolbar}
          </div>
        </div>
      )}
    </CSSMotion>
  );
  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}

function ImageBase({
  src,
  fallback,
  width,
  height,
  placeholder,
  preview = true,
  className,
  alt = "",
  onLoad,
  onError,
  ...rest
}: ImageProps) {
  const group = useContext(GroupContext);
  const registerInGroup = group?.register;
  const config = useMemo(() => (typeof preview === "object" ? preview : {}), [preview]);
  const controlledOpen = typeof preview === "object" ? preview.open : undefined;
  const imageRef = useRef<HTMLImageElement>(null);
  const [innerOpen, setInnerOpen] = useState(false);
  const [previewOrigin, setPreviewOrigin] = useState<PreviewOrigin>();
  const [loading, setLoading] = useState(Boolean(src));
  const [failed, setFailed] = useState(false);
  const actualSrc = failed && fallback ? fallback : src;
  useEffect(() => {
    if (!actualSrc || !registerInGroup) return;
    return registerInGroup(actualSrc);
  }, [actualSrc, registerInGroup]);
  useEffect(() => {
    setFailed(false);
  }, [src]);
  useLayoutEffect(() => {
    const image = imageRef.current;
    if (!actualSrc) {
      setLoading(false);
      return;
    }
    if (!image?.complete) {
      setLoading(true);
      return;
    }
    if (image.naturalWidth > 0) {
      setLoading(false);
      return;
    }
    if (fallback && actualSrc !== fallback) {
      setLoading(true);
      setFailed(true);
      return;
    }
    setLoading(false);
  }, [actualSrc, fallback]);
  const changeOpen = (next: boolean) => {
    const previous = controlledOpen ?? innerOpen;
    if (controlledOpen === undefined) setInnerOpen(next);
    config.onOpenChange?.(next, previous);
  };
  const openPreview: ImageProps["onClick"] = (event) => {
    if (!actualSrc || preview === false) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setPreviewOrigin(origin);
    if (group) group.open(actualSrc, origin, config);
    else changeOpen(true);
  };
  return (
    <span
      className={twMerge("group relative inline-block overflow-hidden align-middle", className)}
      style={{ width, height }}
    >
      {loading && placeholder ? (
        <Skeleton.Image
          active
          width="100%"
          height="100%"
          className="absolute inset-0 size-full rounded-none"
        />
      ) : null}
      <img
        {...rest}
        ref={imageRef}
        src={actualSrc}
        alt={alt}
        className={twMerge(
          "block size-full object-cover",
          preview !== false && "cursor-zoom-in",
          loading && "invisible",
        )}
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
      {preview !== false && !loading && config.cover !== false ? (
        <span
          data-image-preview-cover
          className="pointer-events-none absolute inset-0 flex min-w-0 items-center justify-center overflow-hidden bg-black/0 px-2 text-center text-white opacity-0 transition-[background-color,opacity] duration-300 group-hover:bg-black/45 group-hover:opacity-100"
        >
          <span className="inline-flex max-w-full min-w-0 items-center">
            <Icon icon="eye" size={20} className="shrink-0" />
            <span className="ml-2 min-w-0 text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
              미리보기
            </span>
          </span>
        </span>
      ) : null}
      {!group && actualSrc ? (
        <Preview
          src={config.src ?? actualSrc}
          config={config}
          open={controlledOpen ?? innerOpen}
          origin={previewOrigin}
          onClose={() => changeOpen(false)}
        />
      ) : null}
    </span>
  );
}

function PreviewGroup({ children }: ImagePreviewGroupProps) {
  const [sources, setSources] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>();
  const [open, setOpen] = useState(false);
  const [previewOrigin, setPreviewOrigin] = useState<PreviewOrigin>();
  const [previewConfig, setPreviewConfig] = useState<ImagePreviewConfig>({});
  const register = useCallback((src: string) => {
    setSources((items) => (items.includes(src) ? items : [...items, src]));
    return () => setSources((items) => items.filter((item) => item !== src));
  }, []);
  const openGroup = useCallback(
    (src: string, origin: PreviewOrigin, config: ImagePreviewConfig) => {
      setCurrent(src);
      setPreviewOrigin(origin);
      setPreviewConfig(config);
      setOpen(true);
      config.onOpenChange?.(true, false);
    },
    [],
  );
  const context = useMemo<GroupContextValue>(
    () => ({
      sources,
      register,
      open: openGroup,
    }),
    [sources, register, openGroup],
  );
  return (
    <GroupContext.Provider value={context}>
      {children}
      {current ? (
        <Preview
          src={current}
          sources={sources}
          config={previewConfig}
          open={open}
          origin={previewOrigin}
          onClose={() => {
            setOpen(false);
            previewConfig.onOpenChange?.(false, true);
          }}
        />
      ) : null}
    </GroupContext.Provider>
  );
}

export const Image = Object.assign(ImageBase, { PreviewGroup }) as ImageComponent;
