import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Checkbox } from "../Checkbox";
import { Icon } from "../Icon";
import type { TreeDataNode, TreeEventInfo, TreeProps } from "./Tree.types";

function id(value: React.Key) {
  return String(value);
}
function descendants(node: TreeDataNode): string[] {
  return [id(node.key), ...(node.children ?? []).flatMap(descendants)];
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
  const expanded = expandedKeys ? expandedKeys.map(id) : innerExpanded;
  const selected = selectedKeys ? selectedKeys.map(id) : innerSelected;
  const checked = checkedKeys
    ? (Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked).map(id)
    : innerChecked;
  const loaded = loadedKeys ? loadedKeys.map(id) : innerLoaded;
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
          ? ({ "--wizard-tree-line-left": `${16 + (level - 1) * 24}px` } as React.CSSProperties)
          : undefined
      }
    >
      {nodes.map((node) => {
        const key = id(node.key),
          hasChildren = Boolean(node.children?.length) || (!node.isLeaf && loadData),
          open = expanded.includes(key),
          isSelected = selected.includes(key),
          isChecked = checked.includes(key),
          half = halfChecked.includes(key),
          nodeDisabled = disabled || node.disabled;
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
          <li key={key} className={twMerge("relative", node.className)} style={node.style}>
            <div
              className={twMerge(
                "relative flex min-h-8 items-center gap-1 rounded-md px-1 text-sm transition-colors hover:bg-[#f5f5f5]",
                blockNode && "w-full",
                isSelected && "bg-[#e6f4ff] text-[#0062df]",
                nodeDisabled && "cursor-not-allowed text-[#bbb] hover:bg-transparent",
              )}
              style={{ paddingInlineStart: 4 + level * 24 }}
              onClick={(event) => select(node, event)}
            >
              {hasChildren ? (
                <button
                  type="button"
                  data-tree-switcher={key}
                  tabIndex={-1}
                  disabled={nodeDisabled}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded transition-transform duration-200"
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
                  className="inline-flex shrink-0 items-center"
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
                <span className="inline-flex shrink-0">{node.icon}</span>
              ) : null}
              <span
                className={twMerge(
                  "flex min-h-6 min-w-0 cursor-pointer items-center leading-6",
                  blockNode && "flex-1",
                )}
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
