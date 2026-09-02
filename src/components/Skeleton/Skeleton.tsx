import { twMerge } from "tailwind-merge";
import type { SkeletonComponent, SkeletonElementProps, SkeletonSizeType } from "./Skeleton.types";

function sizeValue(size: SkeletonSizeType = "md") {
  return typeof size === "number" ? size : { sm: 24, md: 32, lg: 40 }[size];
}
function base(active?: boolean) {
  return twMerge("bg-[#f0f0f0]", active && "wizard-skeleton-active");
}

function AvatarSkeleton({
  active,
  fullWidth = false,
  width,
  height,
  size = "md",
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
  size = "md",
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
  size = "md",
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
  shape = "default",
  children,
  className,
}: SkeletonElementProps & { children?: React.ReactNode }) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center justify-center",
        base(active),
        shape === "circle" || shape === "round"
          ? "rounded-full"
          : shape === "square"
            ? "rounded-none"
            : "rounded-md",
        className,
      )}
      style={{ width: fullWidth ? "100%" : (width ?? 96), height: height ?? 96 }}
    >
      {children}
    </span>
  );
}

export const Skeleton: SkeletonComponent = {
  Avatar: AvatarSkeleton,
  Button: ButtonSkeleton,
  Input: InputSkeleton,
  Image: ImageSkeleton,
  Node: NodeSkeleton,
};
