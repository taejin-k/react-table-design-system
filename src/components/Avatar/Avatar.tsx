import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import type { AvatarComponent, AvatarGroupProps, AvatarProps, AvatarSize } from "./Avatar.types";

function resolveSize(size: AvatarSize = "medium") {
  if (typeof size === "number") return size;
  if (typeof size === "string") return { small: 24, medium: 32, large: 40 }[size];
  if (typeof window === "undefined") return size.md ?? size.sm ?? size.xs ?? 32;
  const width = window.innerWidth;
  const key =
    width >= 1600
      ? "xxl"
      : width >= 1200
        ? "xl"
        : width >= 992
          ? "lg"
          : width >= 768
            ? "md"
            : width >= 576
              ? "sm"
              : "xs";
  return size[key] ?? size.md ?? size.sm ?? size.xs ?? 32;
}

function AvatarBase({
  src,
  icon,
  size = "medium",
  shape = "circle",
  gap = 4,
  children,
  className,
  style,
  alt,
  onError,
  ...imageProps
}: AvatarProps) {
  const [pixelSize, setPixelSize] = useState(() => resolveSize(size));
  const [imageFailed, setImageFailed] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const update = () => setPixelSize(resolveSize(size));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [size]);

  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text) return;
    const available = pixelSize - gap * 2;
    setTextScale(text.offsetWidth > available ? available / text.offsetWidth : 1);
  }, [children, gap, pixelSize]);

  const imageSource = typeof src === "string" ? src : null;
  const content =
    imageSource && !imageFailed ? (
      <img
        {...imageProps}
        src={imageSource}
        alt={alt ?? ""}
        className="size-full object-cover"
        onError={() => {
          if (onError?.() !== false) setImageFailed(true);
        }}
      />
    ) : isValidElement(src) && !imageFailed ? (
      src
    ) : icon ? (
      <span className="inline-flex" style={{ fontSize: pixelSize * 0.56 }}>
        {icon}
      </span>
    ) : children ? (
      <span
        ref={textRef}
        className="absolute left-1/2 whitespace-nowrap"
        style={{ transform: `translateX(-50%) scale(${textScale})` }}
      >
        {children}
      </span>
    ) : (
      <Icon icon="user-outlined" size={pixelSize * 0.56} />
    );

  return (
    <span
      ref={rootRef}
      className={twMerge(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-[#bfbfbf] align-middle font-pretendard text-white",
        shape === "circle" ? "rounded-full" : "rounded-md",
        className,
      )}
      style={{ width: pixelSize, height: pixelSize, lineHeight: `${pixelSize}px`, ...style }}
    >
      {content}
    </span>
  );
}

function AvatarGroup({
  children,
  max,
  maxCount,
  maxStyle,
  size = "medium",
  shape = "circle",
  className,
  style,
}: AvatarGroupProps) {
  const nodes = Children.toArray(children);
  const count = max?.count ?? maxCount;
  const visible = count && nodes.length > count ? nodes.slice(0, count) : nodes;
  const omitted = nodes.length - visible.length;
  return (
    <div
      className={twMerge(
        "inline-flex items-center [&>*]:-ml-2 [&>*]:ring-2 [&>*]:ring-white [&>*:first-child]:ml-0",
        className,
      )}
      style={style}
    >
      {visible.map((node, index) =>
        isValidElement<AvatarProps>(node)
          ? cloneElement(node, {
              key: node.key ?? index,
              size: node.props.size ?? size,
              shape: node.props.shape ?? shape,
            })
          : node,
      )}
      {omitted > 0 ? (
        <AvatarBase
          size={size}
          shape={shape}
          style={{ background: "#f0f0f0", color: "#666", ...maxStyle, ...max?.style }}
        >
          +{omitted}
        </AvatarBase>
      ) : null}
    </div>
  );
}

export const Avatar = Object.assign(AvatarBase, { Group: AvatarGroup }) as AvatarComponent;
