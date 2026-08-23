import { twMerge } from "tailwind-merge";
import type {
  SkeletonComponent,
  SkeletonElementProps,
  SkeletonProps,
  SkeletonSizeType,
} from "./Skeleton.types";

function sizeValue(size: SkeletonSizeType = "medium") {
  return typeof size === "number" ? size : { small: 24, medium: 32, large: 40 }[size];
}
function base(active?: boolean) {
  return twMerge("bg-[#f0f0f0]", active && "wizard-skeleton-active");
}

function AvatarSkeleton({
  active,
  fullWidth = false,
  width,
  height,
  size = "medium",
  shape = "circle",
  className,
}: SkeletonElementProps) {
  const value = sizeValue(size);
  return (
    <span
      className={twMerge(
        "inline-block shrink-0",
        base(active),
        shape === "circle" ? "rounded-full" : "rounded-md",
        className,
      )}
      style={{ width: fullWidth ? "100%" : (width ?? value), height: height ?? value }}
    />
  );
}
function ButtonSkeleton({
  active,
  fullWidth = false,
  width,
  height: heightProp,
  size = "medium",
  shape = "default",
  className,
}: SkeletonElementProps) {
  const height = heightProp ?? sizeValue(size);
  return (
    <span
      className={twMerge(
        "inline-block",
        base(active),
        shape === "circle" ? "rounded-full" : shape === "round" ? "rounded-full" : "rounded-md",
        className,
      )}
      style={{
        width: fullWidth ? "100%" : (width ?? (shape === "circle" ? height : 64)),
        height,
      }}
    />
  );
}
function InputSkeleton({
  active,
  fullWidth = false,
  width,
  height: heightProp,
  size = "medium",
  className,
}: SkeletonElementProps) {
  const height = heightProp ?? sizeValue(size);
  const defaultWidth = typeof height === "number" ? height * 5 : sizeValue(size) * 5;
  return (
    <span
      className={twMerge("inline-block rounded-md", base(active), className)}
      style={{ width: fullWidth ? "100%" : (width ?? defaultWidth), height }}
    />
  );
}
function ImageSkeleton({
  active,
  fullWidth = false,
  width,
  height,
  className,
}: SkeletonElementProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center justify-center rounded-md text-[#bfbfbf]",
        base(active),
        className,
      )}
      style={{ width: fullWidth ? "100%" : (width ?? 96), height: height ?? 96 }}
    >
      <svg viewBox="0 0 32 32" className="size-8" fill="currentColor">
        <path d="M5 6h22v20H5V6Zm2 2v12l5-5 4 4 3-3 6 6V8H7Zm4 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    </span>
  );
}
function NodeSkeleton({
  active,
  fullWidth = false,
  width,
  height,
  children,
  className,
}: SkeletonElementProps & { children?: React.ReactNode }) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center justify-center rounded-md",
        base(active),
        className,
      )}
      style={{ width: fullWidth ? "100%" : (width ?? 96), height: height ?? 96 }}
    >
      {children}
    </span>
  );
}

function SkeletonBase({
  active = false,
  avatar = false,
  loading,
  paragraph = true,
  round = false,
  title = true,
  children,
  className,
  style,
}: SkeletonProps) {
  if (loading === false) return <>{children}</>;
  const paragraphConfig = typeof paragraph === "object" ? paragraph : {};
  const rows = paragraphConfig.rows ?? (avatar ? 2 : 3);
  const widths = paragraphConfig.width;
  return (
    <div className={twMerge("flex w-full gap-4 font-pretendard", className)} style={style}>
      {avatar ? (
        <AvatarSkeleton active={active} {...(typeof avatar === "object" ? avatar : {})} />
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? (
          <div
            className={twMerge(
              "h-4",
              avatar ? "mt-2 mb-7" : "mb-6",
              base(active),
              round ? "rounded-full" : "rounded",
            )}
            style={{ width: typeof title === "object" ? title.width : avatar ? "38%" : "100%" }}
          />
        ) : null}
        {paragraph ? (
          <div className="grid gap-4">
            {Array.from({ length: rows }, (_, index) => {
              const rowWidth = Array.isArray(widths)
                ? widths[index]
                : index === rows - 1
                  ? (widths ?? "61%")
                  : "100%";
              return (
                <div
                  key={index}
                  className={twMerge("h-4", base(active), round ? "rounded-full" : "rounded")}
                  style={{ width: rowWidth }}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const Skeleton = Object.assign(SkeletonBase, {
  Avatar: AvatarSkeleton,
  Button: ButtonSkeleton,
  Input: InputSkeleton,
  Image: ImageSkeleton,
  Node: NodeSkeleton,
}) as SkeletonComponent;
