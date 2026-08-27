import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "../Checkbox";
import { Icon } from "../Icon";
import type { TreeDataNode, TreeDropPositionType, TreeEventInfo, TreeProps } from "./Tree.types";

function id(value: React.Key) {
  return String(value);
}
function descendants(node: TreeDataNode): string[] {
  return [id(node.key), ...(node.children ?? []).flatMap(descendants)];
}
function descendantKeys(node: TreeDataNode): React.Key[] {
  return [node.key, ...(node.children ?? []).flatMap(descendantKeys)];
}
function dropPosition(event: DragEvent<HTMLDivElement>): TreeDropPositionType {
  const rect = event.currentTarget.getBoundingClientRect();
  if (!rect.height) return 0;
  const ratio = (event.clientY - rect.top) / rect.height;
  if (ratio < 0.25) return -1;
  if (ratio > 0.75) return 1;
  return 0;
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
  showIcon = false,
  showLine = false,
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
  const [dragOverState, setDragOverState] = useState<{
    key: string;
    position: TreeDropPositionType;
  }>();
  const dragNodeRef = useRef<TreeDataNode | undefined>(undefined);
  const dragOverRef = useRef<{ key: string; position: TreeDropPositionType } | undefined>(
    undefined,
  );
  const expandTimerRef = useRef<number | undefined>(undefined);
  const expanded = expandedKeys ? expandedKeys.map(id) : innerExpanded;
  const selected = selectedKeys ? selectedKeys.map(id) : innerSelected;
  const checked = checkedKeys
    ? (Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked).map(id)
    : innerChecked;
  const loaded = loadedKeys ? loadedKeys.map(id) : innerLoaded;
  useEffect(
    () => () => {
      window.clearTimeout(expandTimerRef.current);
    },
    [],
  );
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
    nativeEvent: React.SyntheticEvent,
    extras: Partial<TreeEventInfo> = {},
  ): TreeEventInfo => ({ event, node, nativeEvent: nativeEvent.nativeEvent, ...extras });
  const toggleExpand = async (node: TreeDataNode, event: React.MouseEvent) => {
    const key = id(node.key),
      nextOpen = !expanded.includes(key);
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
    onExpand?.(restoreKeys(next), eventInfo("expand", node, event, { expanded: nextOpen }));
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
    onSelect?.(restoreKeys(next), eventInfo("select", node, event, { selected: !already }));
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
    onCheck?.(output, eventInfo("check", node, event, { checked: nextChecked }));
  };
  const nodeDraggable = (node: TreeDataNode) => {
    if (!draggable || disabled || node.disabled) return false;
    if (typeof draggable === "function") return draggable(node);
    if (typeof draggable === "object" && draggable.nodeDraggable)
      return draggable.nodeDraggable(node);
    return true;
  };
  const dragIcon =
    typeof draggable === "object" && "icon" in draggable ? (
      draggable.icon
    ) : (
      <Icon icon="drag-handle" size={12} />
    );
  const clearDragOver = () => {
    window.clearTimeout(expandTimerRef.current);
    dragOverRef.current = undefined;
    setDragOverState(undefined);
  };
  const canDrop = (
    dragNode: TreeDataNode,
    dropNode: TreeDataNode,
    position: TreeDropPositionType,
  ) => {
    if (disabled || dropNode.disabled) return false;
    if (descendants(dragNode).includes(id(dropNode.key))) return false;
    return allowDrop?.({ dropNode, dropPosition: position }) ?? true;
  };
  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    node: TreeDataNode,
    hasChildren: boolean,
    open: boolean,
  ) => {
    const dragNode = dragNodeRef.current;
    if (!dragNode) return;
    const position = dropPosition(event);
    onDragOver?.({ event, node });
    if (!canDrop(dragNode, node, position)) {
      if (dragOverRef.current?.key === id(node.key)) clearDragOver();
      event.dataTransfer.dropEffect = "none";
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    const next = { key: id(node.key), position };
    const previous = dragOverRef.current;
    if (previous?.key !== next.key || previous.position !== next.position) {
      window.clearTimeout(expandTimerRef.current);
      dragOverRef.current = next;
      setDragOverState(next);
      onDragEnter?.({ event, node, expandedKeys: restoreKeys(expanded) });
      if (position === 0 && hasChildren && !open) {
        expandTimerRef.current = window.setTimeout(() => {
          const nextExpanded = [...expanded, id(node.key)];
          if (!expandedKeys) setInnerExpanded(nextExpanded);
          onExpand?.(
            restoreKeys(nextExpanded),
            eventInfo("expand", node, event, { expanded: true }),
          );
        }, 400);
      }
    }
  };
  const renderNodes = (nodes: TreeDataNode[], level = 0) => (
    <ul
      className={twMerge(
        "m-0 list-none p-0",
        level > 0 && "relative overflow-hidden",
        showLine &&
          level > 0 &&
          "before:pointer-events-none before:absolute before:top-0 before:bottom-0 before:left-[var(--wizard-tree-line-left)] before:border-l before:border-solid before:border-[#d9d9d9]",
      )}
      style={
        showLine && level > 0
          ? ({ "--wizard-tree-line-left": `${12 + (level - 1) * 24}px` } as React.CSSProperties)
          : undefined
      }
    >
      {nodes.map((node) => {
        const key = id(node.key),
          hasChildren = Boolean(node.children?.length) || Boolean(!node.isLeaf && loadData),
          open = expanded.includes(key),
          isSelected = selected.includes(key),
          isChecked = checked.includes(key),
          half = halfChecked.includes(key),
          nodeDisabled = disabled || node.disabled,
          canDragNode = nodeDraggable(node),
          dragOverPosition = dragOverState?.key === key ? dragOverState.position : undefined;
        const switcher =
          typeof switcherIcon === "function"
            ? switcherIcon({ expanded: open, node })
            : (switcherIcon ??
              (loading.includes(key) ? (
                <Icon icon="loading" loading size={12} />
              ) : hasChildren ? (
                <Icon icon="chevron-right" size={12} />
              ) : showLine && typeof showLine === "object" && showLine.showLeafIcon ? (
                typeof showLine.showLeafIcon === "boolean" ? (
                  <Icon icon="file-outlined" size={12} />
                ) : (
                  showLine.showLeafIcon
                )
              ) : null));
        return (
          <li key={key} className={twMerge("relative pb-1", node.className)} style={node.style}>
            <div
              data-tree-node={key}
              draggable={canDragNode}
              className={twMerge(
                "relative flex min-h-6 items-start text-sm",
                blockNode && "w-full",
                nodeDisabled && "cursor-not-allowed text-[#bbb]",
                canDragNode && "cursor-grab active:cursor-grabbing",
                draggingKey === key && "opacity-50",
              )}
              style={{ paddingInlineStart: level * 24 }}
              onDragStart={(event) => {
                if (!canDragNode) {
                  event.preventDefault();
                  return;
                }
                dragNodeRef.current = node;
                setDraggingKey(key);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData?.("text/plain", key);
                onDragStart?.({ event, node });
              }}
              onDragOver={(event) => handleDragOver(event, node, hasChildren, open)}
              onDragLeave={(event) => {
                const nextTarget = event.relatedTarget;
                if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
                if (dragOverRef.current?.key === key) clearDragOver();
                onDragLeave?.({ event, node });
              }}
              onDrop={(event) => {
                const dragNode = dragNodeRef.current;
                const position = dropPosition(event);
                if (!dragNode) return;
                event.preventDefault();
                event.stopPropagation();
                if (!canDrop(dragNode, node, position)) return;
                clearDragOver();
                onDrop?.({
                  event,
                  node,
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
                if (dragNode) onDragEnd?.({ event, node: dragNode });
              }}
            >
              {dragOverPosition !== undefined && dragOverPosition !== 0 ? (
                <span
                  data-tree-drop-indicator={dragOverPosition === -1 ? "top" : "bottom"}
                  className="pointer-events-none absolute right-0 z-10 h-0 border-t-2 border-[#0062df]"
                  style={{
                    top: dragOverPosition === -1 ? 0 : "100%",
                    left: level * 24,
                  }}
                >
                  <span className="absolute top-[-4px] left-[-4px] size-2 rounded-full border-2 border-[#0062df] bg-white" />
                </span>
              ) : null}
              {showLine && level > 0 ? (
                <span
                  className="pointer-events-none absolute top-3 h-px border-t border-solid border-[#d9d9d9]"
                  style={{ left: 12 + (level - 1) * 24, width: 12 }}
                />
              ) : null}
              {canDragNode && dragIcon !== false ? (
                <span
                  data-tree-drag-handle={key}
                  className="inline-flex size-6 shrink-0 cursor-grab items-center justify-center text-[#999] active:cursor-grabbing"
                >
                  {dragIcon}
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
              {showIcon && node.icon ? (
                <span className="mr-1 inline-flex size-6 shrink-0 items-center justify-center">
                  {node.icon}
                </span>
              ) : null}
              <span
                className={twMerge(
                  "flex min-h-6 min-w-0 cursor-pointer items-center rounded-md px-1 leading-6 transition-colors hover:bg-[#f5f5f5]",
                  blockNode && "flex-1",
                  isSelected && "bg-[#e6f4ff] text-[#0062df] hover:bg-[#e6f4ff]",
                  dragOverPosition === 0 && "bg-[#e6f4ff] outline-1 outline-[#0062df]",
                  nodeDisabled && "cursor-not-allowed hover:bg-transparent",
                )}
                onClick={(event) => select(node, event)}
              >
                {titleRender?.(node) ?? node.title}
              </span>
            </div>
            {hasChildren ? (
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">{renderNodes(node.children ?? [], level + 1)}</div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
  return (
    <div
      className={twMerge("overflow-auto font-pretendard text-[#111]", className)}
      style={{ maxHeight: height, ...style }}
    >
      {renderNodes(normalized)}
    </div>
  );
}
