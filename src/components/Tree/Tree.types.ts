import type { CSSProperties, DragEvent, Key, ReactNode } from "react";

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

export interface TreeFieldNames {
  title?: string;
  key?: string;
  children?: string;
}

export type TreeCheckedKeys = Key[] | { checked: Key[]; halfChecked: Key[] };

export interface TreeEventInfo {
  event: "select" | "check" | "expand";
  selected?: boolean;
  checked?: boolean;
  expanded?: boolean;
  node: TreeDataNode;
  nativeEvent: Event;
}

export type TreeDropPositionType = -1 | 0 | 1;

export interface TreeAllowDropInfo {
  dropNode: TreeDataNode;
  dropPosition: TreeDropPositionType;
}

export interface TreeSwitcherIconInfo {
  expanded: boolean;
  node: TreeDataNode;
}

export interface TreeLoadInfo {
  event: "load";
  node: TreeDataNode;
}

export interface TreeDraggableConfig {
  nodeDraggable?: (node: TreeDataNode) => boolean;
}

export type TreeDraggableType = boolean | ((node: TreeDataNode) => boolean) | TreeDraggableConfig;

export interface TreeDragInfo {
  event: DragEvent<HTMLDivElement>;
  node: TreeDataNode;
}

export interface TreeDragEnterInfo extends TreeDragInfo {
  expandedKeys: Key[];
}

export interface TreeDropInfo extends TreeDragInfo {
  dragNode: TreeDataNode;
  dragNodesKeys: Key[];
  dropPosition: TreeDropPositionType;
  dropToGap: boolean;
}

export interface TreeProps {
  treeData?: TreeDataNode[];
  fieldNames?: TreeFieldNames;
  blockNode?: boolean;
  checkable?: boolean;
  checkStrictly?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  draggable?: TreeDraggableType;
  allowDrop?: (info: TreeAllowDropInfo) => boolean;
  switcherIcon?: ReactNode | ((info: TreeSwitcherIconInfo) => ReactNode);
  titleRender?: (node: TreeDataNode) => ReactNode;
  expandedKeys?: Key[];
  defaultExpandedKeys?: Key[];
  defaultExpandAll?: boolean;
  selectedKeys?: Key[];
  defaultSelectedKeys?: Key[];
  checkedKeys?: TreeCheckedKeys;
  defaultCheckedKeys?: Key[];
  height?: number;
  loadData?: (node: TreeDataNode) => Promise<void>;
  loadedKeys?: Key[];
  className?: string;
  style?: CSSProperties;
  onExpand?: (expandedKeys: Key[], info: TreeEventInfo) => void;
  onSelect?: (selectedKeys: Key[], info: TreeEventInfo) => void;
  onCheck?: (
    checkedKeys: TreeCheckedKeys,
    info: TreeEventInfo,
  ) => void;
  onLoad?: (loadedKeys: Key[], info: TreeLoadInfo) => void;
  onDragStart?: (info: TreeDragInfo) => void;
  onDragEnter?: (info: TreeDragEnterInfo) => void;
  onDragOver?: (info: TreeDragInfo) => void;
  onDragLeave?: (info: TreeDragInfo) => void;
  onDragEnd?: (info: TreeDragInfo) => void;
  onDrop?: (info: TreeDropInfo) => void;
}
