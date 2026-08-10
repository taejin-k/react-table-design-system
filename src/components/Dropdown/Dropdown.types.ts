import type { ReactElement, ReactNode } from "react";
import type { FloatingPlacement } from "../_internal/floating-position";
import type { FloatingTrigger } from "../_internal/use-floating-layer";

export type DropdownPlacement = FloatingPlacement;
export type DropdownTrigger = FloatingTrigger;
export type DropdownOpenSource = "trigger" | "menu";

export interface DropdownClickInfo {
  key: string;
  keyPath: string[];
  domEvent: React.MouseEvent<HTMLElement>;
}

export interface DropdownItem {
  key: string;
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
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onClick?: (info: DropdownClickInfo) => void;
  onSelect?: (info: { key: string; selectedKeys: string[] }) => void;
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
  onOpenChange?: (open: boolean, info: { source: DropdownOpenSource }) => void;
}
