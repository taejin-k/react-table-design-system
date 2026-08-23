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
import type {
  AvatarComponent,
  AvatarGroupProps,
  AvatarProps,
  AvatarSizeType,
} from "./Avatar.types";

function resolveSize(size: AvatarSizeType = "medium") {
  return { small: 24, medium: 32, large: 40 }[size];
}

function AvatarBase({
  src,
  icon,
  color,
  type = "default",
  size = "medium",
  shape = "circle",
  children,
  className,
  style,
  alt,
  ...imageProps
}: AvatarProps) {
  const pixelSize = resolveSize(size);
  const [imageFailed, setImageFailed] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => setImageFailed(false), [src]);

  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text) return;
    const available = pixelSize - 8;
    setTextScale(text.offsetWidth > available ? available / text.offsetWidth : 1);
  }, [children, pixelSize]);

  const imageSource = typeof src === "string" ? src : null;
  const displayedChildren =
    typeof children === "string" || typeof children === "number"
      ? (Array.from(String(children))[0] ?? "")
      : children;
  const fallbackIconSize = { small: 14, medium: 18, large: 20 }[size];
  const content =
    imageSource && !imageFailed ? (
      <img
        {...imageProps}
        src={imageSource}
        alt={alt ?? ""}
        className="size-full object-cover"
        onError={() => setImageFailed(true)}
      />
    ) : isValidElement(src) && !imageFailed ? (
      src
    ) : icon ? (
      <span className="inline-flex" style={{ fontSize: pixelSize * 0.56 }}>
        {icon}
      </span>
    ) : displayedChildren !== undefined && displayedChildren !== null ? (
      <span
        ref={textRef}
        className="absolute left-1/2 whitespace-nowrap"
        style={{ transform: `translateX(-50%) scale(${textScale})` }}
      >
        {displayedChildren}
      </span>
    ) : (
      <Icon icon="user-outlined" size={imageFailed ? fallbackIconSize : pixelSize * 0.56} />
    );

  const avatar = (
    <span
      ref={type === "default" ? rootRef : undefined}
      className={twMerge(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-[#bfbfbf] align-middle font-pretendard text-white",
        shape === "circle" ? "rounded-full" : "rounded-md",
        pixelSize >= 40 && "text-xl",
        type === "default" && className,
      )}
      style={{
        width: pixelSize,
        height: pixelSize,
        lineHeight: `${pixelSize}px`,
        ...(type === "default" ? style : undefined),
        backgroundColor: color,
      }}
    >
      {content}
    </span>
  );

  if (type === "label") {
    return (
      <span
        ref={rootRef}
        className={twMerge(
          "inline-flex w-fit items-center bg-[#f5f5f5] font-pretendard text-[#111]",
          shape === "circle" ? "rounded-full" : "rounded-lg",
          size === "small" && "gap-1.5 p-1 pr-2 text-sm",
          size === "medium" && "gap-2 p-1 pr-3 text-base",
          size === "large" && "gap-2.5 p-1 pr-4 text-lg",
          className,
        )}
        style={style}
      >
        {avatar}
        {children !== undefined && children !== null ? (
          <span className="min-w-0 truncate leading-normal">{children}</span>
        ) : null}
      </span>
    );
  }

  return avatar;
}

function AvatarGroup({
  children,
  maxCount,
  size = "medium",
  shape = "circle",
  className,
  style,
}: AvatarGroupProps) {
  const nodes = Children.toArray(children);
  const visible =
    maxCount !== undefined && nodes.length > maxCount ? nodes.slice(0, maxCount) : nodes;
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
        <AvatarBase size={size} shape={shape} color="#f0f0f0" className="text-[#666]">
          +{omitted}
        </AvatarBase>
      ) : null}
    </div>
  );
}

export const Avatar = Object.assign(AvatarBase, { Group: AvatarGroup }) as AvatarComponent;
