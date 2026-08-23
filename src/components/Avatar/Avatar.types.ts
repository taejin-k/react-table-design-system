import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react";

export type AvatarSizeType = "large" | "medium" | "small";
export type AvatarShapeType = "circle" | "square";
export type AvatarTypeType = "default" | "label";

export interface AvatarProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "size" | "src" | "onError"
> {
  src?: ReactNode;
  icon?: ReactNode;
  color?: CSSProperties["backgroundColor"];
  type?: AvatarTypeType;
  size?: AvatarSizeType;
  shape?: AvatarShapeType;
  children?: ReactNode;
}

export interface AvatarGroupProps {
  children?: ReactNode;
  maxCount?: number;
  size?: AvatarSizeType;
  shape?: AvatarShapeType;
  className?: string;
  style?: CSSProperties;
}

export interface AvatarComponent {
  (props: AvatarProps): ReactNode;
  Group: (props: AvatarGroupProps) => ReactNode;
}
