import { useMemo, useRef, useState, type DragEvent } from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "../Checkbox";
import { Icon } from "../Icon";
import type { TreeDataNode, TreeDropPositionType, TreeEventInfo, TreeProps } from "./Tree.types";

type TreeDragOverState = {
  key: string;
  dropNode: TreeDataNode;
  position: TreeDropPositionType;
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
function descendantKeys(node: TreeDataNode): React.Key[] {
  return [node.key, ...(node.children ?? []).flatMap(descendantKeys)];
}
export function getTreeDropPosition(
  pointerY: number,
  rect: Pick<DOMRect, "top" | "height">,
  canDropInside: boolean,
  isExpanded: boolean,
): TreeDropPositionType {
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
  position: TreeDropPositionType,
  options: {
    disabled?: boolean;
    allowDrop?: TreeProps["allowDrop"];
  } = {},
) {
  if (options.disabled || dropNode.disabled) return false;
  if (descendants(dragNode).includes(id(dropNode.key))) return false;
  return options.allowDrop?.({ dropNode, dropPosition: position }) ?? true;
}

function setTreeDragImage(event: DragEvent<HTMLDivElement>) {
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
  event.dataTransfer.setDragImage(
    dragImage,
    Math.max(0, event.clientX - rect.left),
    Math.max(0, event.clientY - rect.top),
  );
  globalThis.setTimeout(() => dragImage.remove(), 0);
}

export function Tree({
  treeData = [],
  fieldNames,
  blockNode = false,
  checkable = false,
  checkStrictly = false,
  selectable = true,
  multiple = false,
  disabled = false,
  draggable = false,
  allowDrop,
  switcherIcon,
  titleRender,
  expandedKeys,
  defaultExpandedKeys = [],
  defaultExpandAll = false,
  selectedKeys,
  defaultSelectedKeys = [],
  checkedKeys,
  defaultCheckedKeys = [],
  height,
  className,
  style,
  loadData,
  loadedKeys,
  onExpand,
  onSelect,
  onCheck,
  onLoad,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
}: TreeProps) {
  const normalized = useMemo(() => {
    const normalize = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => ({
        ...node,
        key: (node[fieldNames?.key ?? "key"] as React.Key) ?? node.key,
        title: (node[fieldNames?.title ?? "title"] as React.ReactNode) ?? node.title,
        children: node[fieldNames?.children ?? "children"]
          ? normalize(node[fieldNames?.children ?? "children"] as TreeDataNode[])
          : node.children,
      }));
    return normalize(treeData);
  }, [treeData, fieldNames]);
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
  const initialChecked = Array.isArray(checkedKeys)
    ? checkedKeys
    : (checkedKeys?.checked ?? defaultCheckedKeys);
  const [innerChecked, setInnerChecked] = useState(initialChecked.map(id));
  const [innerLoaded, setInnerLoaded] = useState((loadedKeys ?? []).map(id));
  const [loading, setLoading] = useState<string[]>([]);
  const [draggingKey, setDraggingKey] = useState<string>();
  const [dragOverState, setDragOverState] = useState<TreeDragOverState>();
  const dragNodeRef = useRef<TreeDataNode | undefined>(undefined);
  const dragMetricsRef = useRef<
    { grabOffsetY: number; height: number; startX: number; level: number } | undefined
  >(undefined);
  const dragOverRef = useRef<TreeDragOverState | undefined>(undefined);
  const expanded = expandedKeys ? expandedKeys.map(id) : innerExpanded;
  const selected = selectedKeys ? selectedKeys.map(id) : innerSelected;
  const checked = checkedKeys
    ? (Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked).map(id)
    : innerChecked;
  const loaded = loadedKeys ? loadedKeys.map(id) : innerLoaded;
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
    if (checkStrictly)
      return !Array.isArray(checkedKeys) ? (checkedKeys?.halfChecked.map(id) ?? []) : [];
    const result = new Set<string>();
    checked.forEach((key) => {
      let parent = parentMap.get(key);
      while (parent) {
        if (!checked.includes(id(parent.key))) result.add(id(parent.key));
        parent = parentMap.get(id(parent.key));
      }
    });
    return [...result];
  }, [checked, checkStrictly, checkedKeys, parentMap]);
  const eventInfo = (
    event: TreeEventInfo["event"],
    node: TreeDataNode,
    nativeEvent: Event,
    extras: Partial<TreeEventInfo> = {},
  ): TreeEventInfo => ({ event, node, nativeEvent, ...extras });
  const changeExpanded = async (node: TreeDataNode, nextOpen: boolean, nativeEvent: Event) => {
    const key = id(node.key);
    if (nextOpen && loadData && !node.isLeaf && !node.children?.length && !loaded.includes(key)) {
      setLoading((keys) => [...keys, key]);
      try {
        await loadData(node);
        const nextLoaded = [...loaded, key];
        if (!loadedKeys) setInnerLoaded(nextLoaded);
        onLoad?.(restoreKeys(nextLoaded), { event: "load", node });
      } finally {
        setLoading((keys) => keys.filter((value) => value !== key));
      }
    }
    const next = nextOpen ? [...expanded, key] : expanded.filter((value) => value !== key);
    if (!expandedKeys) setInnerExpanded(next);
    onExpand?.(restoreKeys(next), eventInfo("expand", node, nativeEvent, { expanded: nextOpen }));
  };
  const toggleExpand = async (node: TreeDataNode, event: React.MouseEvent) => {
    await changeExpanded(node, !expanded.includes(id(node.key)), event.nativeEvent);
  };
  const select = (node: TreeDataNode, event: React.MouseEvent) => {
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
    onSelect?.(
      restoreKeys(next),
      eventInfo("select", node, event.nativeEvent, { selected: !already }),
    );
  };
  const check = (node: TreeDataNode, event: React.ChangeEvent<HTMLInputElement>) => {
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
    const output = checkStrictly
      ? { checked: restoreKeys(next), halfChecked: restoreKeys(halfChecked) }
      : restoreKeys(next);
    onCheck?.(output, eventInfo("check", node, event.nativeEvent, { checked: nextChecked }));
  };
  const nodeDraggable = (node: TreeDataNode) => {
    if (!draggable || disabled || node.disabled) return false;
    if (typeof draggable === "function") return draggable(node);
    if (typeof draggable === "object" && draggable.nodeDraggable)
      return draggable.nodeDraggable(node);
    return true;
  };
  const clearDragOver = () => {
    dragOverRef.current = undefined;
    setDragOverState(undefined);
  };
  const canDrop = (
    dragNode: TreeDataNode,
    dropNode: TreeDataNode,
    position: TreeDropPositionType,
  ) => canDropTreeNode(dragNode, dropNode, position, { disabled, allowDrop });
  const getDropState = (
    event: DragEvent<HTMLDivElement>,
    hoveredNode: TreeDataNode,
  ): Omit<TreeDragOverState, "key"> | undefined => {
    const dragMetrics = dragMetricsRef.current;
    const dragNode = dragNodeRef.current;
    if (!dragMetrics || !dragNode) return undefined;
    const dragCenterY = dragMetrics
      ? event.clientY - dragMetrics.grabOffsetY + dragMetrics.height / 2
      : event.clientY;
    const targetRect = event.currentTarget.getBoundingClientRect();
    const indicatorPosition: -1 | 1 = dragCenterY < targetRect.top + targetRect.height / 2 ? -1 : 1;
    const draggedKeys = new Set(descendants(dragNode));
    const availableNodes = visibleNodes.filter((item) => !draggedKeys.has(item.key));
    const hoveredIndex = availableNodes.findIndex((item) => item.key === id(hoveredNode.key));
    if (hoveredIndex < 0) return undefined;

    const boundaryIndex = hoveredIndex + (indicatorPosition === 1 ? 1 : 0);
    const previous = availableNodes[boundaryIndex - 1];
    const next = availableNodes[boundaryIndex];
    const minimumLevel = next?.level ?? 0;
    const maximumLevel = previous
      ? previous.level + (previous.node.isLeaf === true ? 0 : 1)
      : minimumLevel;
    const currentX = Number.isFinite(event.clientX) ? event.clientX : dragMetrics.startX;
    const requestedLevel = dragMetrics.level + Math.round((currentX - dragMetrics.startX) / 24);
    const level = Math.min(Math.max(requestedLevel, minimumLevel), maximumLevel);

    if (next?.level === level) {
      return { dropNode: next.node, position: -1, indicatorPosition, level };
    }
    if (previous?.level === level) {
      return { dropNode: previous.node, position: 1, indicatorPosition, level };
    }
    if (previous && previous.level + 1 === level && previous.node.isLeaf !== true) {
      return { dropNode: previous.node, position: 0, indicatorPosition, level };
    }
    return undefined;
  };
  const handleDragOver = (event: DragEvent<HTMLDivElement>, node: TreeDataNode) => {
    const dragNode = dragNodeRef.current;
    if (!dragNode || dragNode === node) return;
    const dropState = getDropState(event, node);
    if (!dropState) return;
    const { dropNode, position } = dropState;
    onDragOver?.({ event, node });
    if (!canDrop(dragNode, dropNode, position)) {
      if (dragOverRef.current?.key === id(node.key)) clearDragOver();
      event.dataTransfer.dropEffect = "none";
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    const next = { key: id(node.key), ...dropState };
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
      onDragEnter?.({ event, node, expandedKeys: restoreKeys(expanded) });
    }
  };
  const renderNodes = (nodes: TreeDataNode[], level = 0) => (
    <ul className={twMerge("m-0 list-none p-0", level > 0 && "relative")}>
      {nodes.map((node, nodeIndex) => {
        const key = id(node.key),
          hasChildren = Boolean(node.children?.length) || Boolean(!node.isLeaf && loadData),
          canDropInside = hasChildren || node.isLeaf !== true,
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
        const switcher =
          typeof switcherIcon === "function"
            ? switcherIcon({ expanded: open, node })
            : (switcherIcon ??
              (loading.includes(key) ? (
                <Icon icon="loading" loading size={12} />
              ) : hasChildren ? (
                <Icon icon="chevron-right" size={12} />
              ) : null));
        return (
          <li
            key={key}
            className={twMerge("relative", hasChildren && open ? "pb-0" : "pb-1", node.className)}
            style={node.style}
          >
            <div
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
                blockNode && !canDragNode && "w-full",
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
                dragMetricsRef.current = {
                  grabOffsetY: Math.min(Math.max(event.clientY - rect.top, 0), rect.height),
                  height: rect.height,
                  startX: Number.isFinite(event.clientX) ? event.clientX : 0,
                  level,
                };
                setTreeDragImage(event);
                dragNodeRef.current = node;
                setDraggingKey(key);
                onDragStart?.({ event, node });
              }}
              onDragOver={(event) => handleDragOver(event, node)}
              onDragLeave={(event) => {
                const related = event.relatedTarget;
                if (related instanceof Node && event.currentTarget.contains(related)) return;
                if (dragOverRef.current?.key === key) clearDragOver();
                onDragLeave?.({ event, node });
              }}
              onDrop={(event) => {
                const dragNode = dragNodeRef.current;
                if (!dragNode || dragNode === node) return;
                event.preventDefault();
                event.stopPropagation();
                const dropState = getDropState(event, node);
                if (!dropState) return;
                const { dropNode, position } = dropState;
                if (!canDrop(dragNode, dropNode, position)) return;
                clearDragOver();
                onDrop?.({
                  event,
                  node: dropNode,
                  dragNode,
                  dragNodesKeys: descendantKeys(dragNode),
                  dropPosition: position,
                  dropToGap: position !== 0,
                });
              }}
              onDragEnd={(event) => {
                const dragNode = dragNodeRef.current;
                clearDragOver();
                setDraggingKey(undefined);
                dragNodeRef.current = undefined;
                dragMetricsRef.current = undefined;
                if (dragNode) onDragEnd?.({ event, node: dragNode });
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
                />
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
                    void toggleExpand(node, event);
                  }}
                >
                  {switcher}
                </button>
              ) : (
                <span className="size-6 shrink-0" />
              )}
              {checkable || node.checkable ? (
                <span
                  className="mr-2 inline-flex size-6 shrink-0 items-center justify-center"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={isChecked}
                    partiallyChecked={half}
                    disabled={nodeDisabled || node.disableCheckbox}
                    onChange={(event) => check(node, event)}
                  />
                </span>
              ) : null}
              <span
                data-tree-selection-content={key}
                className={twMerge(
                  "inline-flex min-h-6 min-w-0 cursor-pointer items-center rounded-md transition-colors hover:bg-[#f5f5f5]",
                  blockNode && !canDragNode && "flex-1",
                  isSelected && "bg-[#e6f4ff] text-[#0062df] hover:bg-[#e6f4ff]",
                  nodeDisabled && "cursor-not-allowed hover:bg-transparent",
                )}
                onClick={(event) => select(node, event)}
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
                <div className={twMerge("overflow-hidden", open && "pt-1")}>
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
      className={twMerge("overflow-auto font-pretendard text-[#111]", className)}
      style={{ maxHeight: height, ...style }}
    >
      {renderNodes(normalized)}
    </div>
  );
}
