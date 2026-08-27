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

export interface TreeEventInfo {
  event: "select" | "check" | "expand";
  selected?: boolean;
  checked?: boolean;
  expanded?: boolean;
  node: TreeDataNode;
  nativeEvent: Event;
}

export type TreeDropPositionType = -1 | 0 | 1;

export interface TreeDraggableConfig {
  icon?: ReactNode | false;
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
  fieldNames?: { title?: string; key?: string; children?: string };
  blockNode?: boolean;
  checkable?: boolean;
  checkStrictly?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  draggable?: TreeDraggableType;
  allowDrop?: (info: { dropNode: TreeDataNode; dropPosition: TreeDropPositionType }) => boolean;
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
  onDragStart?: (info: TreeDragInfo) => void;
  onDragEnter?: (info: TreeDragEnterInfo) => void;
  onDragOver?: (info: TreeDragInfo) => void;
  onDragLeave?: (info: TreeDragInfo) => void;
  onDragEnd?: (info: TreeDragInfo) => void;
  onDrop?: (info: TreeDropInfo) => void;
}
