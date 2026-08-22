import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
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
  const current = sources[active] ?? src;
  const minScale = config.minScale ?? 0.5,
    maxScale = config.maxScale ?? 8,
    step = config.scaleStep ?? 0.5;
  const apply = (patch: Partial<ImageTransform>, action: string) => {
    const next = { ...transform, ...patch };
    setTransform(next);
    config.onTransform?.({ transform: next, action });
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
    onZoomIn: () => apply({ scale: Math.min(maxScale, transform.scale + step) }, "zoomIn"),
    onZoomOut: () => apply({ scale: Math.max(minScale, transform.scale - step) }, "zoomOut"),
    onReset: () => {
      setTransform(initialTransform);
      config.onTransform?.({ transform: initialTransform, action: "reset" });
    },
  };
  useEffect(() => {
    if (open) setTransform(initialTransform);
  }, [open, current]);
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
  if (!open || typeof document === "undefined") return null;
  const toolbar = (
    <div className="flex items-center gap-1 rounded-full bg-black/65 p-1 text-white">
      <button aria-label="축소" onClick={actions.onZoomOut}>
        <Icon icon="remove" />
      </button>
      <span className="min-w-12 text-center text-xs">{Math.round(transform.scale * 100)}%</span>
      <button aria-label="확대" onClick={actions.onZoomIn}>
        <Icon icon="add" />
      </button>
      <button aria-label="왼쪽 회전" onClick={actions.onRotateLeft}>
        <Icon icon="refresh" />
      </button>
      <button aria-label="좌우 반전" onClick={actions.onFlipX}>
        <span className="text-xs">↔</span>
      </button>
      <button aria-label="초기화" onClick={actions.onReset}>
        <span className="text-xs">1:1</span>
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="이미지 미리보기"
      className="fixed inset-0 flex items-center justify-center font-pretendard"
      style={{ zIndex: config.zIndex ?? 1080 }}
    >
      {maskConfig.enabled !== false ? (
        <div
          className="wizard-fade-enter absolute inset-0 bg-black/45"
          onClick={() => maskConfig.closable !== false && onClose()}
        />
      ) : null}
      <button
        type="button"
        aria-label="미리보기 닫기"
        className="absolute top-5 right-5 z-[2] inline-flex size-10 items-center justify-center rounded-full bg-black/45 text-white hover:bg-black/65"
        onClick={onClose}
      >
        {config.closeIcon ?? <Icon icon="close" size={20} />}
      </button>
      {sources.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="이전 이미지"
            disabled={active === 0}
            className="absolute left-5 z-[2] inline-flex size-12 items-center justify-center rounded-full bg-black/45 text-white disabled:opacity-30"
            onClick={() => actions.onActive(active - 1)}
          >
            <Icon icon="chevron-left" size={24} />
          </button>
          <button
            type="button"
            aria-label="다음 이미지"
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
        className="relative z-[1] max-h-[calc(100vh-140px)] max-w-[calc(100vw-120px)] object-contain transition-transform duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] select-none motion-reduce:transition-none"
        style={{
          transform: `translate3d(${transform.x}px,${transform.y}px,0) rotate(${transform.rotate}deg) scale(${transform.scale * (transform.flipX ? -1 : 1)}, ${transform.scale * (transform.flipY ? -1 : 1)})`,
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
  rootClassName,
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
      className={twMerge("relative inline-block overflow-hidden align-middle", rootClassName)}
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
          className,
        )}
        style={style}
        onLoad={(event) => {
          setLoading(false);
          setFailed(false);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoading(false);
          if (fallback && actualSrc !== fallback) setFailed(true);
          onError?.(event);
        }}
        onClick={openPreview}
      />
      {preview !== false && !loading ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-[background-color,opacity] duration-300 hover:bg-black/45 hover:opacity-100">
          <Icon icon="eye" size={20} />
          <span className="ml-2 text-sm">미리보기</span>
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
