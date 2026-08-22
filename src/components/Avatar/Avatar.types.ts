import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react";

export type AvatarSize =
  | number
  | "large"
  | "medium"
  | "small"
  | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number>>;
export type AvatarShape = "circle" | "square";

export interface AvatarProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "size" | "src" | "onError"
> {
  src?: string | ReactNode;
  icon?: ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  gap?: number;
  children?: ReactNode;
  onError?: () => boolean;
}

export interface AvatarGroupProps {
  children?: ReactNode;
  max?: { count?: number; style?: CSSProperties };
  maxCount?: number;
  maxStyle?: CSSProperties;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
  style?: CSSProperties;
}

export interface AvatarComponent {
  (props: AvatarProps): ReactNode;
  Group: (props: AvatarGroupProps) => ReactNode;
}
