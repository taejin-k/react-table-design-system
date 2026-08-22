import type { CSSProperties, ReactNode } from "react";

export type SkeletonSize = number | "large" | "medium" | "small";
export interface SkeletonElementProps {
  active?: boolean;
  block?: boolean;
  size?: SkeletonSize;
  shape?: "circle" | "round" | "square" | "default";
  className?: string;
  style?: CSSProperties;
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
  style?: CSSProperties;
}
export interface SkeletonComponent {
  (props: SkeletonProps): ReactNode;
  Avatar: (props: SkeletonElementProps) => ReactNode;
  Button: (props: SkeletonElementProps) => ReactNode;
  Input: (props: SkeletonElementProps) => ReactNode;
  Image: (props: SkeletonElementProps) => ReactNode;
  Node: (props: SkeletonElementProps & { children?: ReactNode }) => ReactNode;
}
