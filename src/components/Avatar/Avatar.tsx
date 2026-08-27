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
import { Image } from "../Image";
import type {
  AvatarComponent,
  AvatarGroupProps,
  AvatarProps,
  AvatarSizeType,
} from "./Avatar.types";

function resolveSize(size: AvatarSizeType = "md") {
  return { md: 30, lg: 40 }[size];
}

function AvatarBase({
  src,
  icon,
  color,
  label = false,
  labelWidth,
  size = "md",
  shape = "circle",
  children,
  className,
  style,
  alt,
  preview = false,
  ...imageProps
}: AvatarProps) {
  const pixelSize = resolveSize(size);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setImageFailed(false);
    setImageLoaded(false);
  }, [src]);

  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text) return;
    const available = pixelSize - 8;
    setTextScale(text.offsetWidth > available ? available / text.offsetWidth : 1);
  }, [children, pixelSize]);

  const imageElement = isValidElement<{ src?: unknown; alt?: string }>(src) ? src : null;
  const imageSource =
    typeof src === "string"
      ? src
      : imageElement && typeof imageElement.props.src === "string"
        ? imageElement.props.src
        : null;
  const displayedChildren =
    typeof children === "string" || typeof children === "number"
      ? (Array.from(String(children))[0] ?? "")
      : children;
  const fallbackIconSize = { md: 18, lg: 24 }[size];
  const fallbackContent = icon ? (
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
    <Icon icon="user-outlined" size={imageSource ? fallbackIconSize : pixelSize * 0.56} />
  );
  const content =
    imageSource && !imageFailed ? (
      <>
        {fallbackContent}
        {preview ? (
          <Image
            {...imageProps}
            src={imageSource}
            alt={alt ?? imageElement?.props.alt ?? ""}
            width="100%"
            height="100%"
            preview
            className={twMerge(
              "absolute inset-0 size-full [&>img]:transition-opacity [&>img]:duration-200 [&>span]:hidden",
              imageLoaded ? "[&>img]:opacity-100" : "[&>img]:opacity-0",
            )}
            onLoad={(event) => {
              setImageLoaded(true);
              imageProps.onLoad?.(event);
            }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <img
            {...imageProps}
            src={imageSource}
            alt={alt ?? imageElement?.props.alt ?? ""}
            className={twMerge(
              "absolute inset-0 size-full object-cover transition-opacity duration-200",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={(event) => {
              setImageLoaded(true);
              imageProps.onLoad?.(event);
            }}
            onError={() => setImageFailed(true)}
          />
        )}
      </>
    ) : isValidElement(src) && !imageFailed ? (
      src
    ) : (
      fallbackContent
    );

  const avatar = (
    <span
      ref={!label ? rootRef : undefined}
      className={twMerge(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-[#bfbfbf] align-middle font-pretendard text-white",
        shape === "circle" ? "rounded-full" : "rounded-md",
        pixelSize >= 40 && "text-xl",
        !label && className,
      )}
      style={{
        width: pixelSize,
        height: pixelSize,
        lineHeight: `${pixelSize}px`,
        ...(!label ? style : undefined),
        backgroundColor: color,
      }}
    >
      {content}
    </span>
  );

  if (label) {
    return (
      <span
        ref={rootRef}
        className={twMerge(
          "inline-flex w-fit items-center bg-[#f5f5f5] font-pretendard text-[#111]",
          shape === "circle" ? "rounded-full" : "rounded-lg",
          size === "md" && "gap-2 p-1 pr-3 text-base",
          size === "lg" && "gap-2.5 p-1 pr-4 text-lg",
          className,
        )}
        style={{ ...style, width: labelWidth ?? style?.width }}
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
  size = "md",
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
