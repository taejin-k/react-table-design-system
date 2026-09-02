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
export interface SkeletonComponent {
  Avatar: (props: SkeletonElementProps) => ReactNode;
  Button: (props: SkeletonElementProps) => ReactNode;
  Input: (props: SkeletonElementProps) => ReactNode;
  Image: (props: SkeletonElementProps) => ReactNode;
  Node: (props: SkeletonElementProps & { children?: ReactNode }) => ReactNode;
}
