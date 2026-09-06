import type { Key, MouseEvent, ReactElement, ReactNode } from "react";
import type { FloatingPlacement } from "../_internal/floating-position";
import type { FloatingTrigger } from "../_internal/use-floating-layer";

export type DropdownPlacementType = FloatingPlacement;
export type DropdownTriggerType = FloatingTrigger | "contextMenu";
export type DropdownItemType = "item" | "divider" | "group";

export interface DropdownClickInfo {
  value: Key;
  event: MouseEvent<HTMLElement>;
}

export interface DropdownSelectInfo {
  value: Key;
  selectedValues: Key[];
}

export interface DropdownItem {
  value: Key;
  label?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
  type?: DropdownItemType;
  children?: DropdownItem[];
  onClick?: (info: DropdownClickInfo) => void;
}

export interface DropdownMenu {
  items: DropdownItem[];
  selectable?: boolean;
  multiple?: boolean;
  selectedValues?: Key[];
  defaultSelectedValues?: Key[];
  onClick?: (info: DropdownClickInfo) => void;
  onSelect?: (info: DropdownSelectInfo) => void;
}

export interface DropdownProps {
  /** Dropdown을 연결할 하나의 요소예요. */
  children: ReactElement;
  /** 메뉴 항목과 선택 동작을 설정해요. */
  menu: DropdownMenu;
  placement?: DropdownPlacementType;
  trigger?: DropdownTriggerType | DropdownTriggerType[];
  arrow?: boolean;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  zIndex?: number;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}
