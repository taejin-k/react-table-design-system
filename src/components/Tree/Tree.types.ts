import type { DragEvent, Key, ReactNode } from "react";

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
  [key: string]: unknown;
}

export interface TreeDragInfo {
  event: DragEvent<HTMLDivElement>;
  dragNode: TreeDataNode;
}

export interface TreeDropInfo {
  event: DragEvent<HTMLDivElement>;
  dragNode: TreeDataNode;
  treeData: TreeDataNode[];
  parentKey: Key | null;
  index: number;
}

export interface TreeProps {
  treeData?: TreeDataNode[];
  defaultTreeData?: TreeDataNode[];
  fullWidth?: boolean;
  checkable?: boolean;
  checkStrictly?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  draggable?: boolean | ((node: TreeDataNode) => boolean);
  allowDrop?: (node: TreeDataNode) => boolean;
  allowChildren?: boolean | ((node: TreeDataNode) => boolean);
  titleRender?: (node: TreeDataNode) => ReactNode;
  expandedKeys?: Key[];
  defaultExpandedKeys?: Key[];
  defaultExpandAll?: boolean;
  selectedKeys?: Key[];
  defaultSelectedKeys?: Key[];
  checkedKeys?: Key[];
  defaultCheckedKeys?: Key[];
  loadData?: (node: TreeDataNode) => Promise<void>;
  className?: string;
  onExpand?: (expandedKeys: Key[], node: TreeDataNode) => void;
  onSelect?: (selectedKeys: Key[], node: TreeDataNode) => void;
  onCheck?: (checkedKeys: Key[], node: TreeDataNode) => void;
  onDragStart?: (info: TreeDragInfo) => void;
  onDragEnd?: (info: TreeDragInfo) => void;
  onDrop?: (info: TreeDropInfo) => void;
  onTreeDataChange?: (info: TreeDropInfo) => void;
}
