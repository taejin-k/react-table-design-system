import type { ReactElement, ReactNode } from "react";
import type { FloatingPlacement } from "../_internal/floating-position";
import type { FloatingTrigger } from "../_internal/use-floating-layer";

export type DropdownPlacement = FloatingPlacement;
export type DropdownTrigger = FloatingTrigger | "contextMenu";

export interface DropdownClickInfo {
  value: string;
  valuePath: string[];
  domEvent: React.MouseEvent<HTMLElement>;
}

export interface DropdownItem {
  value: string;
  label?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  type?: "item" | "divider" | "group";
  children?: DropdownItem[];
  onClick?: (info: DropdownClickInfo) => void;
}

export interface DropdownMenu {
  items: DropdownItem[];
  selectable?: boolean;
  multiple?: boolean;
  selectedValues?: string[];
  defaultSelectedValues?: string[];
  onClick?: (info: DropdownClickInfo) => void;
  onSelect?: (info: { value: string; selectedValues: string[] }) => void;
}

export interface DropdownProps {
  /** Dropdown을 연결할 하나의 요소예요. */
  children: ReactElement;
  /** 메뉴 항목과 선택 동작을 설정해요. */
  menu: DropdownMenu;
  placement?: DropdownPlacement;
  trigger?: DropdownTrigger | DropdownTrigger[];
  arrow?: boolean;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  autoAdjustOverflow?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  zIndex?: number;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}
