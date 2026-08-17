import type { ReactElement, ReactNode } from "react";

export type TooltipPlacement =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "left"
  | "leftTop"
  | "leftBottom"
  | "right"
  | "rightTop"
  | "rightBottom";

export type TooltipTrigger = "hover" | "focus" | "click" | "contextMenu";

export interface TooltipProps {
  /** Tooltip 안에 표시할 내용이에요. 비어 있으면 Tooltip을 표시하지 않아요. */
  title?: ReactNode | (() => ReactNode);
  /** Tooltip을 연결할 하나의 요소예요. */
  children: ReactElement;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger | TooltipTrigger[];
  arrow?: boolean;
  color?: string;
  open?: boolean;
  defaultOpen?: boolean;
  autoAdjustOverflow?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  zIndex?: number;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}
