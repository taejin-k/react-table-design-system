import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { FloatingPlacement } from "../_internal/floating-position";
import type { FloatingTrigger } from "../_internal/use-floating-layer";

export type PopoverPlacementType = FloatingPlacement;
export type PopoverTriggerType = FloatingTrigger | "contextMenu";

export interface PopoverProps {
  /** Popover를 연결할 하나의 요소예요. */
  children: ReactElement;
  /** 카드의 제목이에요. */
  title?: ReactNode;
  /** 카드에 표시할 내용이에요. */
  content: ReactNode;
  placement?: PopoverPlacementType;
  trigger?: PopoverTriggerType | PopoverTriggerType[];
  arrow?: boolean;
  color?: CSSProperties["backgroundColor"];
  open?: boolean;
  defaultOpen?: boolean;
  autoAdjustOverflow?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  zIndex?: number;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}
