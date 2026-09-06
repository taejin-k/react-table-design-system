import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { ColorTokenType } from "../../color-tokens";

export type TooltipPlacementType =
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

export type TooltipTriggerType = "hover" | "focus" | "click" | "contextMenu";

export interface TooltipProps {
  /** Tooltip에 표시할 내용이에요. */
  title?: ReactNode;
  /** Tooltip을 연결할 하나의 요소예요. */
  children: ReactElement;
  placement?: TooltipPlacementType;
  trigger?: TooltipTriggerType | TooltipTriggerType[];
  arrow?: boolean;
  color?: ColorTokenType | CSSProperties["backgroundColor"];
  open?: boolean;
  defaultOpen?: boolean;
  zIndex?: number;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}
