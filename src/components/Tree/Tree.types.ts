import type { CSSProperties, Key, ReactNode } from "react";

export interface TreeDataNode {
  key: Key;
  title?: ReactNode;
  icon?: ReactNode;
  children?: TreeDataNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  isLeaf?: boolean;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

export interface TreeEventInfo {
  event: "select" | "check" | "expand";
  selected?: boolean;
  checked?: boolean;
  expanded?: boolean;
  node: TreeDataNode;
  nativeEvent: Event;
}

export interface TreeProps {
  treeData?: TreeDataNode[];
  fieldNames?: { title?: string; key?: string; children?: string };
  blockNode?: boolean;
  checkable?: boolean;
  checkStrictly?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  showIcon?: boolean;
  showLine?: boolean | { showLeafIcon?: boolean | ReactNode };
  switcherIcon?: ReactNode | ((props: { expanded: boolean; node: TreeDataNode }) => ReactNode);
  titleRender?: (node: TreeDataNode) => ReactNode;
  expandedKeys?: Key[];
  defaultExpandedKeys?: Key[];
  defaultExpandAll?: boolean;
  selectedKeys?: Key[];
  defaultSelectedKeys?: Key[];
  checkedKeys?: Key[] | { checked: Key[]; halfChecked: Key[] };
  defaultCheckedKeys?: Key[];
  height?: number;
  loadData?: (node: TreeDataNode) => Promise<void>;
  loadedKeys?: Key[];
  className?: string;
  style?: CSSProperties;
  onExpand?: (expandedKeys: Key[], info: TreeEventInfo) => void;
  onSelect?: (selectedKeys: Key[], info: TreeEventInfo) => void;
  onCheck?: (
    checkedKeys: Key[] | { checked: Key[]; halfChecked: Key[] },
    info: TreeEventInfo,
  ) => void;
  onLoad?: (loadedKeys: Key[], info: { event: "load"; node: TreeDataNode }) => void;
}
