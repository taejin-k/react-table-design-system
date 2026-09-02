import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "../Checkbox";
import { Icon } from "../Icon";
import type { TreeDataNode, TreeDropInfo, TreeProps } from "./Tree.types";

type TreeDropPosition = -1 | 0 | 1;

type TreeDragOverState = {
  key: string;
  dropNode: TreeDataNode;
  relatedDropNodes: TreeDataNode[];
  position: TreeDropPosition;
  indicatorPosition: -1 | 1;
  level: number;
};

type VisibleTreeNode = { key: string; node: TreeDataNode; level: number };

function id(value: React.Key) {
  return String(value);
}
function descendants(node: TreeDataNode): string[] {
  return [id(node.key), ...(node.children ?? []).flatMap(descendants)];
}
function findTreeNodeParent(
  nodes: TreeDataNode[],
  key: React.Key,
  parent?: TreeDataNode,
): TreeDataNode | undefined {
  for (const node of nodes) {
    if (Object.is(node.key, key)) return parent;
    const found = findTreeNodeParent(node.children ?? [], key, node);
    if (found) return found;
  }

  return undefined;
}

function moveTreeNode(
  treeData: TreeDataNode[],
  dragNode: TreeDataNode,
  dropNode: TreeDataNode,
  dropPosition: TreeDropPosition,
) {
  const cloneTree = (nodes: TreeDataNode[]): TreeDataNode[] =>
    nodes.map((node) => ({
      ...node,
      children: node.children ? cloneTree(node.children) : undefined,
    }));
  const next = cloneTree(treeData);
  let dragged: TreeDataNode | undefined;
  let parentKey: React.Key | null = null;
  let destinationIndex = -1;
  const find = (
    nodes: TreeDataNode[],
    key: React.Key,
    callback: (
      node: TreeDataNode,
      index: number,
      siblings: TreeDataNode[],
      parent: TreeDataNode | null,
    ) => void,
    parent: TreeDataNode | null = null,
  ): boolean => {
    for (const [index, node] of nodes.entries()) {
      if (Object.is(node.key, key)) {
        callback(node, index, nodes, parent);
        return true;
      }
      if (node.children && find(node.children, key, callback, node)) return true;
    }
    return false;
  };

  find(next, dragNode.key, (_node, index, siblings) => {
    [dragged] = siblings.splice(index, 1);
  });
  if (!dragged) return { treeData, parentKey, index: destinationIndex };

  const inserted = find(next, dropNode.key, (node, index, siblings, parent) => {
    if (dropPosition !== 0) {
      destinationIndex = dropPosition === -1 ? index : index + 1;
      parentKey = parent?.key ?? null;
      siblings.splice(destinationIndex, 0, dragged!);
    } else {
      destinationIndex = 0;
      parentKey = node.key;
      node.children = [dragged!, ...(node.children ?? [])];
    }
  });
  return {
    treeData: inserted ? next : treeData,
    parentKey: inserted ? parentKey : null,
    index: inserted ? destinationIndex : -1,
  };
}
export function getTreeDropPosition(
  pointerY: number,
  rect: Pick<DOMRect, "top" | "height">,
  canDropInside: boolean,
  isExpanded: boolean,
): TreeDropPosition {
  if (!rect.height) return canDropInside ? 0 : 1;
  const ratio = (pointerY - rect.top) / rect.height;
  if (!canDropInside) return ratio < 0.5 ? -1 : 1;
  if (isExpanded) return ratio < 0.25 ? -1 : 0;
  if (ratio < 0.25) return -1;
  if (ratio > 0.75) return 1;
  return 0;
}

export function canDropTreeNode(
  dragNode: TreeDataNode,
  dropNode: TreeDataNode,
  position: TreeDropPosition,
  options: {
    disabled?: boolean;
    allowDrop?: TreeProps["allowDrop"];
    allowChildren?: TreeProps["allowChildren"];
    treeData?: TreeDataNode[];
    relatedDropNodes?: TreeDataNode[];
  } = {},
) {
  if (options.disabled || dropNode.disabled) return false;
  if (descendants(dragNode).includes(id(dropNode.key))) return false;
  const relatedDropNodes = options.relatedDropNodes ?? [dropNode];
  if (options.allowDrop && relatedDropNodes.some((node) => !options.allowDrop!(node))) {
    return false;
  }
  if (!options.treeData) return true;

  const currentParent = findTreeNodeParent(options.treeData, dragNode.key);
  const nextParent = position === 0 ? dropNode : findTreeNodeParent(options.treeData, dropNode.key);
  if (Object.is(currentParent?.key, nextParent?.key)) return true;
  if (options.allowChildren === false) return false;
  if (!nextParent) return true;
  if (nextParent.isLeaf === true) return false;
  if (typeof options.allowChildren === "function") return options.allowChildren(nextParent);
  return true;
}

function setTreeDragImage(event: DragEvent<HTMLDivElement>, grabOffsetX: number) {
  if (typeof event.dataTransfer.setDragImage !== "function") return;

  const source = event.currentTarget;
  const rect = source.getBoundingClientRect();
  const dragImage = source.cloneNode(true) as HTMLElement;
  const dragTitle = dragImage.querySelector<HTMLElement>("[data-tree-title]");
  dragImage.dataset.treeDragPreview = "true";
  dragImage.removeAttribute("data-tree-dragging");
  dragImage.style.position = "fixed";
  dragImage.style.inset = "-10000px auto auto -10000px";
  dragImage.style.width = "max-content";
  dragImage.style.maxWidth = "none";
  dragImage.style.opacity = "0.35";
  dragImage.style.pointerEvents = "none";
  if (dragTitle) dragTitle.style.whiteSpace = "pre";
  document.body.append(dragImage);
  event.dataTransfer.setDragImage(dragImage, grabOffsetX, Math.max(0, event.clientY - rect.top));
  globalThis.setTimeout(() => dragImage.remove(), 0);
}

export function Tree({
  treeData,
  defaultTreeData = [],
  fullWidth = false,
  checkable = false,
  checkStrictly = false,
  selectable = true,
  multiple = false,
  disabled = false,
  draggable = false,
  allowDrop,
  allowChildren,
  titleRender,
  expandedKeys,
  defaultExpandedKeys = [],
  defaultExpandAll = false,
  selectedKeys,
  defaultSelectedKeys = [],
  checkedKeys,
  defaultCheckedKeys = [],
  className,
  loadData,
  onExpand,
  onSelect,
  onCheck,
  onDragStart,
  onDragEnd,
  onDrop,
  onTreeDataChange,
}: TreeProps) {
  const [innerTreeData, setInnerTreeData] = useState(defaultTreeData);
  const currentTreeData = treeData ?? innerTreeData;
  const normalized = currentTreeData;
  const allKeys = useMemo(() => normalized.flatMap(descendants), [normalized]);
  const keyMap = useMemo(() => {
    const map = new Map<string, React.Key>();
    const walk = (nodes: TreeDataNode[]) =>
      nodes.forEach((node) => {
        map.set(id(node.key), node.key);
        walk(node.children ?? []);
      });
    walk(normalized);
    return map;
  }, [normalized]);
  const restoreKeys = (keys: string[]) => keys.map((key) => keyMap.get(key) ?? key);
  const [innerExpanded, setInnerExpanded] = useState<string[]>(
    defaultExpandAll ? allKeys : defaultExpandedKeys.map(id),
  );
  const [innerSelected, setInnerSelected] = useState(defaultSelectedKeys.map(id));
  const initialChecked = checkedKeys ?? defaultCheckedKeys;
  const [innerChecked, setInnerChecked] = useState(initialChecked.map(id));
  const [loaded, setLoaded] = useState<string[]>([]);
  const [loading, setLoading] = useState<string[]>([]);
  const loadingKeysRef = useRef(new Set<string>());
  const [draggingKey, setDraggingKey] = useState<string>();
  const [dragOverState, setDragOverState] = useState<TreeDragOverState>();
  const dragNodeRef = useRef<TreeDataNode | undefined>(undefined);
  const nodeElementsRef = useRef(new Map<string, HTMLDivElement>());
  const dragLeaveFrameRef = useRef<number | undefined>(undefined);
  const dragMetricsRef = useRef<
    | {
        grabOffsetX: number;
        grabOffsetY: number;
        height: number;
        startLeftX: number;
        level: number;
      }
    | undefined
  >(undefined);
  const dragOverRef = useRef<TreeDragOverState | undefined>(undefined);
  const expanded = expandedKeys ? expandedKeys.map(id) : innerExpanded;
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  const selected = selectedKeys ? selectedKeys.map(id) : innerSelected;
  const checked = checkedKeys ? checkedKeys.map(id) : innerChecked;
  const visibleNodes: VisibleTreeNode[] = [];
  const collectVisibleNodes = (nodes: TreeDataNode[], level = 0) => {
    nodes.forEach((node) => {
      const key = id(node.key);
      visibleNodes.push({ key, node, level });
      if (expanded.includes(key)) collectVisibleNodes(node.children ?? [], level + 1);
    });
  };
  collectVisibleNodes(normalized);
  const parentMap = useMemo(() => {
    const map = new Map<string, TreeDataNode>();
    const walk = (nodes: TreeDataNode[]) =>
      nodes.forEach((node) => {
        node.children?.forEach((child) => map.set(id(child.key), node));
        walk(node.children ?? []);
      });
    walk(normalized);
    return map;
  }, [normalized]);
  const halfChecked = useMemo(() => {
    if (checkStrictly) return [];
    const result = new Set<string>();
    checked.forEach((key) => {
      let parent = parentMap.get(key);
      while (parent) {
        if (!checked.includes(id(parent.key))) result.add(id(parent.key));
        parent = parentMap.get(id(parent.key));
      }
    });
    return [...result];
  }, [checked, checkStrictly, parentMap]);
  const changeExpanded = async (node: TreeDataNode, nextOpen: boolean) => {
    const key = id(node.key);
    if (nextOpen && loadData && !node.isLeaf && !node.children?.length && !loaded.includes(key)) {
      if (loadingKeysRef.current.has(key)) return;
      loadingKeysRef.current.add(key);
      setLoading((keys) => [...keys, key]);
      try {
        await loadData(node);
        setLoaded((keys) => (keys.includes(key) ? keys : [...keys, key]));
      } catch {
        return;
      } finally {
        loadingKeysRef.current.delete(key);
        setLoading((keys) => keys.filter((value) => value !== key));
      }
    }
    const current = expandedRef.current;
    const next = nextOpen
      ? current.includes(key)
        ? current
        : [...current, key]
      : current.filter((value) => value !== key);
    expandedRef.current = next;
    if (expandedKeys === undefined) setInnerExpanded(next);
    onExpand?.(restoreKeys(next));
  };
  const toggleExpand = async (node: TreeDataNode) => {
    await changeExpanded(node, !expandedRef.current.includes(id(node.key)));
  };
  const select = (node: TreeDataNode) => {
    if (!selectable || node.selectable === false || disabled || node.disabled) return;
    const key = id(node.key),
      already = selected.includes(key);
    const next = multiple
      ? already
        ? selected.filter((value) => value !== key)
        : [...selected, key]
      : already
        ? []
        : [key];
    if (!selectedKeys) setInnerSelected(next);
    onSelect?.(restoreKeys(next));
  };
  const check = (node: TreeDataNode) => {
    if (disabled || node.disabled || node.disableCheckbox) return;
    const key = id(node.key),
      nextChecked = !checked.includes(key);
    let next = checkStrictly
      ? nextChecked
        ? [...checked, key]
        : checked.filter((value) => value !== key)
      : nextChecked
        ? Array.from(new Set([...checked, ...descendants(node)]))
        : checked.filter((value) => !descendants(node).includes(value));
    if (!checkStrictly) {
      let parent = parentMap.get(key);
      while (parent) {
        const childKeys = parent.children?.flatMap(descendants) ?? [];
        const parentKey = id(parent.key);
        if (childKeys.every((child) => next.includes(child)))
          next = Array.from(new Set([...next, parentKey]));
        else next = next.filter((value) => value !== parentKey);
        parent = parentMap.get(parentKey);
      }
    }
    if (!checkedKeys) setInnerChecked(next);
    onCheck?.(restoreKeys(next));
  };
  const nodeDraggable = (node: TreeDataNode) => {
    if (!draggable || disabled || node.disabled) return false;
    if (typeof draggable === "function") return draggable(node);
    return true;
  };
  const cancelPendingDragLeave = () => {
    if (dragLeaveFrameRef.current === undefined) return;
    globalThis.cancelAnimationFrame(dragLeaveFrameRef.current);
    dragLeaveFrameRef.current = undefined;
  };
  useEffect(
    () => () => {
      if (dragLeaveFrameRef.current !== undefined) {
        globalThis.cancelAnimationFrame(dragLeaveFrameRef.current);
      }
    },
    [],
  );
  const clearDragOver = () => {
    cancelPendingDragLeave();
    dragOverRef.current = undefined;
    setDragOverState(undefined);
  };
  const scheduleDragOverClear = () => {
    cancelPendingDragLeave();
    dragLeaveFrameRef.current = globalThis.requestAnimationFrame(() => {
      dragLeaveFrameRef.current = undefined;
      dragOverRef.current = undefined;
      setDragOverState(undefined);
    });
  };
  const canDrop = (
    dragNode: TreeDataNode,
    dropNode: TreeDataNode,
    position: TreeDropPosition,
    relatedDropNodes?: TreeDataNode[],
  ) =>
    canDropTreeNode(dragNode, dropNode, position, {
      disabled,
      allowDrop,
      allowChildren,
      treeData: currentTreeData,
      relatedDropNodes,
    });
  const canReceiveChildren = (node: TreeDataNode) => node.isLeaf !== true;
  const getDropState = (event: DragEvent<HTMLDivElement>): TreeDragOverState | undefined => {
    const dragMetrics = dragMetricsRef.current;
    const dragNode = dragNodeRef.current;
    if (!dragMetrics || !dragNode) return undefined;
    const dragCenterY = dragMetrics
      ? event.clientY - dragMetrics.grabOffsetY + dragMetrics.height / 2
      : event.clientY;
    const draggedKeys = new Set(descendants(dragNode));
    const availableNodes = visibleNodes.filter((item) => !draggedKeys.has(item.key));
    let target: VisibleTreeNode | undefined;
    let targetRect: DOMRect | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;
    availableNodes.forEach((item) => {
      const rect = nodeElementsRef.current.get(item.key)?.getBoundingClientRect();
      if (!rect) return;
      const distance = Math.abs(dragCenterY - (rect.top + rect.height / 2));
      if (distance < closestDistance) {
        target = item;
        targetRect = rect;
        closestDistance = distance;
      }
    });
    if (!target || !targetRect) return undefined;

    const targetSide: -1 | 1 = dragCenterY < targetRect.top + targetRect.height / 2 ? -1 : 1;
    const targetIndex = availableNodes.findIndex((item) => item.key === target!.key);

    const boundaryIndex = targetIndex + (targetSide === 1 ? 1 : 0);
    const previous = availableNodes[boundaryIndex - 1];
    const next = availableNodes[boundaryIndex];
    const indicatorNode = next ?? previous;
    if (!indicatorNode) return undefined;
    let indicatorKey = indicatorNode.key;
    let indicatorPosition: -1 | 1 = next ? -1 : 1;
    const boundaryStartsChildList = Boolean(previous && next && next.level > previous.level);
    if (previous && boundaryStartsChildList) {
      indicatorKey = previous.key;
      indicatorPosition = 1;
    }
    const draggedElement = nodeElementsRef.current.get(id(dragNode.key));
    const previousElement = previous ? nodeElementsRef.current.get(previous.key) : undefined;
    const nextElement = next ? nodeElementsRef.current.get(next.key) : undefined;
    const draggedFollowsPrevious = Boolean(
      draggedElement &&
      (!previousElement ||
        previousElement.compareDocumentPosition(draggedElement) & Node.DOCUMENT_POSITION_FOLLOWING),
    );
    const draggedPrecedesNext = Boolean(
      draggedElement &&
      (!nextElement ||
        draggedElement.compareDocumentPosition(nextElement) & Node.DOCUMENT_POSITION_FOLLOWING),
    );
    const isOriginalBoundary = Boolean(
      draggedElement && draggedFollowsPrevious && draggedPrecedesNext && !boundaryStartsChildList,
    );
    const minimumLevel = next?.level ?? 0;
    const maximumLevel = previous
      ? previous.level + (canReceiveChildren(previous.node) ? 1 : 0)
      : minimumLevel;
    const currentX = Number.isFinite(event.clientX)
      ? event.clientX
      : dragMetrics.startLeftX + dragMetrics.grabOffsetX;
    const draggedLeftX = currentX - dragMetrics.grabOffsetX;
    const requestedLevel =
      dragMetrics.level + Math.round((draggedLeftX - dragMetrics.startLeftX) / 24);
    const level = Math.min(Math.max(requestedLevel, minimumLevel), maximumLevel);
    const boundaryNodes = [previous?.node, next?.node].filter(
      (node): node is TreeDataNode => node !== undefined,
    );
    if (isOriginalBoundary && level === dragMetrics.level) {
      indicatorKey = id(dragNode.key);
      indicatorPosition = -1;
    }

    if (next?.level === level) {
      return {
        key: indicatorKey,
        dropNode: next.node,
        relatedDropNodes: boundaryNodes,
        position: -1,
        indicatorPosition,
        level,
      };
    }
    if (previous?.level === level) {
      return {
        key: indicatorKey,
        dropNode: previous.node,
        relatedDropNodes: boundaryNodes,
        position: 1,
        indicatorPosition,
        level,
      };
    }
    if (previous && previous.level + 1 === level && canReceiveChildren(previous.node)) {
      return {
        key: previous.key,
        dropNode: previous.node,
        relatedDropNodes: [previous.node],
        position: 0,
        indicatorPosition: 1,
        level,
      };
    }
    return undefined;
  };
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    cancelPendingDragLeave();
    const dragNode = dragNodeRef.current;
    if (!dragNode) return;
    const dropState = getDropState(event);
    if (!dropState) return;
    const { dropNode, position, relatedDropNodes } = dropState;
    if (!canDrop(dragNode, dropNode, position, relatedDropNodes)) {
      clearDragOver();
      event.dataTransfer.dropEffect = "none";
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    const next = dropState;
    const previous = dragOverRef.current;
    if (
      previous?.key !== next.key ||
      id(previous.dropNode.key) !== id(next.dropNode.key) ||
      previous.position !== next.position ||
      previous.indicatorPosition !== next.indicatorPosition ||
      previous.level !== next.level
    ) {
      dragOverRef.current = next;
      setDragOverState(next);
    }
  };
  const renderNodes = (nodes: TreeDataNode[], level = 0) => (
    <ul className={twMerge("m-0 flex list-none flex-col gap-1 p-0", level > 0 && "relative")}>
      {nodes.map((node, nodeIndex) => {
        const key = id(node.key),
          hasChildren = Boolean(node.children?.length) || Boolean(!node.isLeaf && loadData),
          canDropInside = canReceiveChildren(node),
          open = expanded.includes(key),
          isSelected = selected.includes(key),
          isChecked = checked.includes(key),
          half = halfChecked.includes(key),
          nodeDisabled = disabled || node.disabled,
          canDragNode = nodeDraggable(node),
          nodeDropState = dragOverState?.key === key ? dragOverState : undefined,
          dragOverPosition = nodeDropState?.position,
          dragOverIndicatorPosition = nodeDropState?.indicatorPosition,
          dragOverLevel = nodeDropState?.level;
        const switcher = loading.includes(key) ? (
          <Icon icon="loading" loading size={12} />
        ) : hasChildren ? (
          <Icon icon="chevron-right" size={12} />
        ) : null;
        return (
          <li key={key} className="relative">
            <div
              ref={(element) => {
                if (element) nodeElementsRef.current.set(key, element);
                else nodeElementsRef.current.delete(key);
              }}
              data-tree-node={key}
              data-tree-draggable={canDragNode || undefined}
              data-tree-can-drop-inside={canDropInside || undefined}
              data-tree-dragging={draggingKey === key || undefined}
              data-tree-drop-position={
                dragOverPosition === -1
                  ? "before"
                  : dragOverPosition === 0
                    ? "inside"
                    : dragOverPosition === 1
                      ? "after"
                      : undefined
              }
              draggable={canDragNode}
              className={twMerge(
                "relative flex min-h-6 w-fit max-w-full items-start rounded-md text-sm select-none",
                draggable && "w-full",
                fullWidth && "w-full",
                nodeDisabled && "cursor-not-allowed text-[#bbb]",
                canDragNode && "cursor-grab active:cursor-grabbing",
              )}
              style={{ paddingInlineStart: level * 24 }}
              onDragStart={(event) => {
                if (!canDragNode) {
                  event.preventDefault();
                  return;
                }
                event.stopPropagation();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", key);
                const rect = event.currentTarget.getBoundingClientRect();
                const titleRect = event.currentTarget
                  .querySelector<HTMLElement>("[data-tree-title]")
                  ?.getBoundingClientRect();
                const pointerX = Number.isFinite(event.clientX) ? event.clientX : rect.left;
                const rawGrabOffsetX = Math.min(Math.max(pointerX - rect.left, 0), rect.width);
                const contentRightOffset = titleRect?.width
                  ? Math.min(Math.max(titleRect.right - rect.left, 0), rect.width)
                  : rawGrabOffsetX;
                const grabOffsetX = Math.min(rawGrabOffsetX, contentRightOffset);
                dragMetricsRef.current = {
                  grabOffsetX,
                  grabOffsetY: Math.min(Math.max(event.clientY - rect.top, 0), rect.height),
                  height: rect.height,
                  startLeftX: rect.left,
                  level,
                };
                setTreeDragImage(event, grabOffsetX);
                dragNodeRef.current = node;
                setDraggingKey(key);
                onDragStart?.({ event, dragNode: node });
              }}
              onDragOver={handleDragOver}
              onDrop={(event) => {
                const dragNode = dragNodeRef.current;
                if (!dragNode) return;
                event.preventDefault();
                event.stopPropagation();
                const dropState = getDropState(event);
                if (!dropState) return;
                const { dropNode, position, relatedDropNodes } = dropState;
                if (!canDrop(dragNode, dropNode, position, relatedDropNodes)) return;
                clearDragOver();
                const result = moveTreeNode(currentTreeData, dragNode, dropNode, position);
                const info: TreeDropInfo = {
                  event,
                  dragNode,
                  treeData: result.treeData,
                  parentKey: result.parentKey,
                  index: result.index,
                };
                if (treeData === undefined) setInnerTreeData(result.treeData);
                onTreeDataChange?.(info);
                onDrop?.(info);
              }}
              onDragEnd={(event) => {
                const dragNode = dragNodeRef.current;
                clearDragOver();
                setDraggingKey(undefined);
                dragNodeRef.current = undefined;
                dragMetricsRef.current = undefined;
                if (dragNode) onDragEnd?.({ event, dragNode });
              }}
            >
              {draggingKey ? (
                <span
                  data-tree-drop-hit-area={key}
                  className="absolute top-full right-0 left-0 h-1"
                />
              ) : null}
              {dragOverIndicatorPosition !== undefined ? (
                <span
                  data-tree-drop-indicator={dragOverIndicatorPosition === -1 ? "top" : "bottom"}
                  className="pointer-events-none absolute right-0 z-10 h-0.5 bg-[#0062df]"
                  style={{
                    top:
                      dragOverIndicatorPosition === -1
                        ? level === 0 && nodeIndex === 0
                          ? 0
                          : -3
                        : "calc(100% + 1px)",
                    left: (dragOverLevel ?? level) * 24,
                  }}
                >
                  <span className="absolute top-1/2 left-0 size-1.5 -translate-y-1/2 rounded-full bg-[#0062df]" />
                </span>
              ) : null}
              {hasChildren ? (
                <button
                  type="button"
                  data-tree-switcher={key}
                  tabIndex={-1}
                  disabled={nodeDisabled}
                  className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded transition-transform duration-200 disabled:cursor-not-allowed"
                  style={{
                    transform: open && !loading.includes(key) ? "rotate(90deg)" : undefined,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    void toggleExpand(node);
                  }}
                >
                  {switcher}
                </button>
              ) : (
                <span className="size-6 shrink-0" />
              )}
              {checkable || node.checkable ? (
                <span
                  className="mr-1 inline-flex size-6 shrink-0 items-center justify-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={isChecked}
                    partiallyChecked={half}
                    disabled={nodeDisabled || node.disableCheckbox}
                    onChange={() => check(node)}
                  />
                </span>
              ) : null}
              <span
                data-tree-selection-content={key}
                className={twMerge(
                  "inline-flex min-h-6 min-w-0 cursor-pointer items-center rounded-md transition-colors hover:bg-[#f5f5f5]",
                  fullWidth && "flex-1",
                  isSelected && "bg-[#e6f4ff] text-[#0062df] hover:bg-[#e6f4ff]",
                  nodeDisabled && "cursor-not-allowed hover:bg-transparent",
                )}
                onClick={() => select(node)}
              >
                {node.icon ? (
                  <span
                    data-tree-icon={key}
                    className="inline-flex h-6 w-4 shrink-0 items-center justify-center"
                  >
                    {node.icon}
                  </span>
                ) : null}
                <span
                  data-tree-title={key}
                  className="relative -top-px flex min-h-6 min-w-0 items-center px-1 leading-6 whitespace-pre-line"
                >
                  {titleRender?.(node) ?? node.title}
                </span>
              </span>
            </div>
            {hasChildren ? (
              <div
                data-tree-children={key}
                className="grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div
                  className={twMerge(
                    "overflow-hidden pt-0 transition-[padding-top] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none",
                    open && "pt-1",
                    draggingKey && open && "overflow-visible",
                  )}
                >
                  {renderNodes(node.children ?? [], level + 1)}
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
  return (
    <div
      data-tree-root
      className={twMerge("font-pretendard text-[#111]", className)}
      onDragEnter={cancelPendingDragLeave}
      onDragLeave={(event) => {
        const related = event.relatedTarget;
        if (related instanceof Node && event.currentTarget.contains(related)) return;
        scheduleDragOverClear();
      }}
    >
      {renderNodes(normalized)}
    </div>
  );
}
