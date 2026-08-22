import { twMerge } from "tailwind-merge";
import type {
  SkeletonComponent,
  SkeletonElementProps,
  SkeletonProps,
  SkeletonSize,
} from "./Skeleton.types";

function sizeValue(size: SkeletonSize = "medium") {
  return typeof size === "number" ? size : { small: 24, medium: 32, large: 40 }[size];
}
function base(active?: boolean) {
  return twMerge("bg-[#f0f0f0]", active && "wizard-skeleton-active");
}

function AvatarSkeleton({
  active,
  size = "medium",
  shape = "circle",
  className,
  style,
}: SkeletonElementProps) {
  const value = sizeValue(size);
  return (
    <span
      aria-hidden
      className={twMerge(
        "inline-block shrink-0",
        base(active),
        shape === "circle" ? "rounded-full" : "rounded-md",
        className,
      )}
      style={{ width: value, height: value, ...style }}
    />
  );
}
function ButtonSkeleton({
  active,
  block,
  size = "medium",
  shape = "default",
  className,
  style,
}: SkeletonElementProps) {
  const height = sizeValue(size);
  return (
    <span
      aria-hidden
      className={twMerge(
        "inline-block",
        base(active),
        block ? "w-full" : "w-16",
        shape === "circle" ? "rounded-full" : shape === "round" ? "rounded-full" : "rounded-md",
        className,
      )}
      style={{ height, width: shape === "circle" ? height : undefined, ...style }}
    />
  );
}
function InputSkeleton(props: SkeletonElementProps) {
  return <ButtonSkeleton {...props} block={props.block ?? true} />;
}
function ImageSkeleton({ active, className, style }: SkeletonElementProps) {
  return (
    <span
      aria-hidden
      className={twMerge(
        "inline-flex size-24 items-center justify-center rounded-md text-[#bfbfbf]",
        base(active),
        className,
      )}
      style={style}
    >
      <svg viewBox="0 0 32 32" className="size-8" fill="currentColor">
        <path d="M5 6h22v20H5V6Zm2 2v12l5-5 4 4 3-3 6 6V8H7Zm4 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      </svg>
    </span>
  );
}
function NodeSkeleton({
  active,
  children,
  className,
  style,
}: SkeletonElementProps & { children?: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className={twMerge(
        "inline-flex min-h-12 min-w-12 items-center justify-center rounded-md",
        base(active),
        className,
      )}
      style={style}
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
    <div
      aria-busy="true"
      aria-label="불러오는 중"
      className={twMerge("flex w-full gap-4 font-pretendard", className)}
      style={style}
    >
      {avatar ? (
        <AvatarSkeleton active={active} {...(typeof avatar === "object" ? avatar : {})} />
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? (
          <div
            className={twMerge("mb-7 h-4", base(active), round ? "rounded-full" : "rounded")}
            style={{ width: typeof title === "object" ? title.width : avatar ? "38%" : "38%" }}
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
