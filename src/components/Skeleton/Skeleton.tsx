import { twMerge } from "tailwind-merge";
import type { SkeletonComponent, SkeletonElementProps } from "./Skeleton.types";

const DEFAULT_ELEMENT_SIZE = 32;
function base(active?: boolean) {
  return twMerge("bg-[#f0f0f0]", active && "wizard-skeleton-active");
}
function shapeClass(shape: SkeletonElementProps["shape"]) {
  return shape === "circle" || shape === "round"
    ? "rounded-full"
    : shape === "square"
      ? "rounded-none"
      : "rounded-md";
}

function AvatarSkeleton({
  active,
  width,
  height,
  shape = "circle",
  className,
}: SkeletonElementProps) {
  return (
    <span
      className={twMerge("inline-block shrink-0", base(active), shapeClass(shape), className)}
      style={{ width: width ?? DEFAULT_ELEMENT_SIZE, height: height ?? DEFAULT_ELEMENT_SIZE }}
    />
  );
}
function ButtonSkeleton({
  active,
  width,
  height: heightProp,
  shape = "default",
  className,
}: SkeletonElementProps) {
  const height = heightProp ?? DEFAULT_ELEMENT_SIZE;
  return (
    <span
      className={twMerge("inline-block", base(active), shapeClass(shape), className)}
      style={{
        width: width ?? (shape === "circle" ? height : 64),
        height,
      }}
    />
  );
}
function InputSkeleton({
  active,
  width,
  height: heightProp,
  shape = "default",
  className,
}: SkeletonElementProps) {
  const height = heightProp ?? DEFAULT_ELEMENT_SIZE;
  const defaultWidth = typeof height === "number" ? height * 5 : DEFAULT_ELEMENT_SIZE * 5;
  return (
    <span
      className={twMerge("inline-block", base(active), shapeClass(shape), className)}
      style={{ width: width ?? defaultWidth, height }}
    />
  );
}
function ImageSkeleton({
  active,
  width,
  height,
  shape = "default",
  className,
}: SkeletonElementProps) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center justify-center text-[#bfbfbf]",
        base(active),
        shapeClass(shape),
        className,
      )}
      style={{ width: width ?? 96, height: height ?? 96 }}
    >
      <svg viewBox="0 0 32 32" className="size-8" fill="currentColor">
        <path d="M5 6h22v20H5V6Zm2 2v12l5-5 4 4 3-3 6 6V8H7Zm4 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    </span>
  );
}
function NodeSkeleton({
  active,
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
        shapeClass(shape),
        className,
      )}
      style={{ width: width ?? 96, height: height ?? 96 }}
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
