import type { CSSProperties, ImgHTMLAttributes, ReactNode } from "react";

export interface ImagePreviewConfig {
  open?: boolean;
  src?: string;
  mask?: boolean | { enabled?: boolean; closable?: boolean };
  cover?: ReactNode;
  closeIcon?: ReactNode;
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  zIndex?: number;
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  movable?: boolean;
  toolbarRender?: (
    node: ReactNode,
    info: { transform: ImageTransform; actions: ImageActions },
  ) => ReactNode;
  onOpenChange?: (open: boolean, previousOpen: boolean) => void;
  onTransform?: (info: { transform: ImageTransform; action: string }) => void;
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
  "placeholder" | "src" | "width" | "height"
> {
  src?: string;
  fallback?: string;
  width?: string | number;
  height?: string | number;
  placeholder?:
    | ReactNode
    | {
        progress?:
          boolean | { percent?: number; render?: (node: ReactNode, percent: number) => ReactNode };
      };
  preview?: boolean | ImagePreviewConfig;
  rootStyle?: CSSProperties;
}

export interface ImagePreviewGroupProps {
  children?: ReactNode;
  preview?: boolean | ImagePreviewConfig;
}

export interface ImageComponent {
  (props: ImageProps): ReactNode;
  PreviewGroup: (props: ImagePreviewGroupProps) => ReactNode;
}
