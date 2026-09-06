import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react";
import type { ColorTokenType } from "../../color-tokens";

export type AvatarSizeType = "md" | "lg";
export type AvatarShapeType = "circle" | "square";

export interface AvatarProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "size" | "src" | "onError" | "width"
> {
  src?: ReactNode;
  icon?: ReactNode;
  color?: ColorTokenType;
  showLabel?: boolean;
  labelWidth?: number;
  size?: AvatarSizeType;
  shape?: AvatarShapeType;
  preview?: boolean;
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
