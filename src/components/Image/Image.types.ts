import type { ImgHTMLAttributes, ReactNode } from "react";

export interface ImageMaskConfig {
  enabled?: boolean;
  blur?: boolean;
  closable?: boolean;
}

export interface ImagePreviewConfig {
  open?: boolean;
  src?: string;
  cover?: boolean;
  mask?: boolean | ImageMaskConfig;
  zIndex?: number;
  onOpenChange?: (open: boolean, previousOpen: boolean) => void;
}

export interface ImageTransform {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
}
export interface ImageActions {
  onActive: (index: number) => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "placeholder" | "src" | "width" | "height" | "style"
> {
  src?: string;
  fallback?: string;
  width?: string | number;
  height?: string | number;
  placeholder?: boolean;
  preview?: boolean | ImagePreviewConfig;
}

export interface ImagePreviewGroupProps {
  children?: ReactNode;
}

export interface ImageComponent {
  (props: ImageProps): ReactNode;
  PreviewGroup: (props: ImagePreviewGroupProps) => ReactNode;
}
