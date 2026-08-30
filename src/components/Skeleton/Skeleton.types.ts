import type { CSSProperties, ReactNode } from "react";

export type SkeletonSizeType = number | "lg" | "md" | "sm";
export type SkeletonShapeType = "circle" | "round" | "square" | "default";
export interface SkeletonElementProps {
  active?: boolean;
  fullWidth?: boolean;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  size?: SkeletonSizeType;
  shape?: SkeletonShapeType;
  className?: string;
}
export interface SkeletonProps {
  active?: boolean;
  avatar?: boolean | SkeletonElementProps;
  loading?: boolean;
  paragraph?: boolean | { rows?: number; width?: string | number | Array<string | number> };
  round?: boolean;
  title?: boolean | { width?: string | number };
  children?: ReactNode;
  className?: string;
}
export interface SkeletonComponent {
  (props: SkeletonProps): ReactNode;
  Avatar: (props: SkeletonElementProps) => ReactNode;
  Button: (props: SkeletonElementProps) => ReactNode;
  Input: (props: SkeletonElementProps) => ReactNode;
  Image: (props: SkeletonElementProps) => ReactNode;
  Node: (props: SkeletonElementProps & { children?: ReactNode }) => ReactNode;
}
