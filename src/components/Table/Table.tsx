/* oxlint-disable react/only-export-components -- The generic compound Table API is exported as one library component. */
import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type UIEvent as ReactUIEvent,
} from "react";
import { createPortal } from "react-dom";
import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Icon } from "../Icon/Icon";
import { Illustrations } from "../Illustrations/Illustrations";
import { Input } from "../Input/Input";
import { Radio } from "../Radio/Radio";
import { Tooltip } from "../Tooltip/Tooltip";
import { getPopupMotionStyle, useMotionPresence } from "../_internal/motion";
import {
  breakpointWidths,
  columnKey,
  flattenColumns,
  getValue,
  leafCount,
  maxDepth,
} from "./Table.utils";
import { Pagination } from "./Pagination";
import {
  ColumnSortableContext,
  RowDragHandle,
  RowSortableContext,
  SortableTableHeaderCell,
  SortableTableRow,
  TableDragProvider,
} from "./Table.row-drag";
import type {
  ColumnFixedType,
  ColumnType,
  ColumnsType,
  FilterItem,
  FilterKey,
  FilterValueType,
  Key,
  PaginationConfig,
  PaginationPlacementType,
  SortOrderType,
  SorterResult,
  TableProps,
  TableRef,
} from "./Table.types";

type SortState<T> = { column: ColumnType<T>; key: string; order: SortOrderType; priority: number };
type FlatRow<T> = { record: T; depth: number; parent?: Key };
type VerticalScrollbarState = {
  visible: boolean;
  top: number;
  height: number;
  viewportHeight: number;
};
type HorizontalScrollbarState = {
  visible: boolean;
  left: number;
  width: number;
  viewportWidth: number;
};
type StickyScrollbarState = {
  visible: boolean;
  left: number;
  top: number;
  width: number;
  thumbLeft: number;
  thumbWidth: number;
};
const EMPTY_DATA_SOURCE: never[] = [];
const EMPTY_COLUMNS: never[] = [];
const HIDDEN_VERTICAL_SCROLLBAR: VerticalScrollbarState = {
  visible: false,
  top: 0,
  height: 0,
  viewportHeight: 0,
};
const HIDDEN_HORIZONTAL_SCROLLBAR: HorizontalScrollbarState = {
  visible: false,
  left: 0,
  width: 0,
  viewportWidth: 0,
};
const HIDDEN_STICKY_SCROLLBAR: StickyScrollbarState = {
  visible: false,
  left: 0,
  top: 0,
  width: 0,
  thumbLeft: 0,
  thumbWidth: 0,
};
const HORIZONTAL_SCROLLBAR_HEIGHT = 8;
const STICKY_SCROLLBAR_BOTTOM_GAP = 6;
const SORT_DIRECTIONS: readonly SortOrderType[] = ["ascend", "descend", null];

// ---- 스타일 상수 (wizard-design cva/Tailwind 컨벤션, GROO 색상) ----

const cellSizePad: Record<NonNullable<TableProps<object>["size"]>, string> = {
  lg: "p-4",
  md: "px-2 py-3",
  sm: "p-2",
};

const cellBaseClass =
  "relative z-0 border-b border-[#f0f0f0] bg-white align-middle transition-colors";
const headerCellBaseClass = "bg-[#f5f5f5] text-left text-[14px] font-semibold text-[#111]";
const nestedHeaderBorderClass = "border-r border-r-[#f0f0f0]";
const headerCellSortedClass = "bg-[#eee]";
const cellLastNoRightBorder = "border-r-0";
const gridBorderLayoutClass =
  "[&>thead>tr>th:not(:last-child)]:border-r [&>thead>tr>th:not(:last-child)]:border-r-transparent [&>tbody>tr>td:not(:last-child)]:border-r [&>tbody>tr>td:not(:last-child)]:border-r-transparent [&>tfoot>tr>td:not(:last-child)]:border-r [&>tfoot>tr>td:not(:last-child)]:border-r-transparent";
const borderedGridClass =
  "[&>thead>tr>th:not(:last-child)]:border-r-[#f0f0f0] [&>tbody>tr>td:not(:last-child)]:border-r-[#f0f0f0] [&>tfoot>tr>td:not(:last-child)]:border-r-[#f0f0f0]";

const headerContentClass = "inline-flex min-w-0 items-center gap-0.5";
const dragCellClass = "!px-2 text-center";
const selectionCellClass = "!px-4 text-center";
const expandCellClass = "!px-4 text-center";
const expandCellBodyClass = "!px-0 text-start";
const expandIndentClass = "flex min-h-[17px] items-center";
const selectionHeadClass = "relative inline-flex -translate-y-px items-center align-middle";

const iconButtonClass =
  "inline-grid size-6 cursor-pointer place-items-center rounded border-0 bg-transparent p-0 text-[#999] transition-colors hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df]";
const iconButtonActiveClass = "text-[#0062df]";
const expandButtonClass =
  "inline-grid size-[17px] cursor-pointer place-items-center rounded-sm border border-[#ddd] bg-white text-[#999]";
const expandPlaceholderClass = "inline-block size-[17px]";
const filterWrapClass = "relative";

const menuShadow =
  "shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]";

const filterMenuClass = `absolute z-[1050] top-7 left-[-12px] min-w-[196px] rounded-lg border border-[#eee] bg-white p-2 font-pretendard text-[14px] text-[#111] ${menuShadow}`;
const filterOptionsClass = "max-h-[264px] overflow-auto";
const filterOptionLabelClass =
  "flex min-h-9 items-center gap-2 rounded px-2 py-[7px] cursor-pointer hover:bg-[#f5f5f5]";
const filterGroupClass = "py-2 pb-1 text-[12px] font-semibold text-[#999]";
const filterEmptyClass = "px-2 py-4 text-center text-[#999]";
const filterSearchClass = "mb-1.5";
const filterActionsClass =
  "mt-1.5 flex items-center justify-between gap-2 border-t border-[#f0f0f0] pt-2";

const ellipsisClass = "block w-full overflow-hidden text-ellipsis whitespace-nowrap";
const ellipsisTooltipTriggerClass = "block w-full min-w-0 overflow-hidden";
const emptyClass = "h-[184px] text-center text-[#999]";

const loadingOverlayClass =
  "absolute inset-0 z-10 grid place-items-center rounded-[inherit] bg-white/75 backdrop-blur-[1px]";
const loadingContentClass = "inline-flex items-center gap-2.5 text-[#0062df]";
const fixedLeftLastShadowBaseClass =
  "after:pointer-events-none after:absolute after:right-0 after:top-0 after:bottom-[-1px] after:z-[1] after:w-[30px] after:translate-x-full after:content-[''] after:shadow-[inset_10px_0_8px_-8px_rgba(5,5,5,0)] after:transition-shadow";
const fixedLeftLastShadowVisibleClass = "after:shadow-[inset_10px_0_8px_-8px_rgba(5,5,5,0.12)]";
const fixedRightFirstShadowBaseClass =
  "before:pointer-events-none before:absolute before:left-0 before:top-0 before:bottom-[-1px] before:z-[1] before:w-[30px] before:-translate-x-full before:content-[''] before:shadow-[inset_-10px_0_8px_-8px_rgba(5,5,5,0)] before:transition-shadow";
const fixedRightFirstShadowVisibleClass = "before:shadow-[inset_-10px_0_8px_-8px_rgba(5,5,5,0.12)]";

function fixedSide(fixed?: ColumnFixedType) {
  if (fixed === "left") return "left";
  if (fixed === "right") return "right";
  return null;
}

function resolvedColumnWidth<T extends object>(item: ColumnType<T>): number | undefined {
  if (item.width != null && item.minWidth != null) {
    return Math.max(item.width, item.minWidth);
  }
  return item.width;
}

type ColumnOffset = number;

function fixedOffsetWidth<T extends object>(item: ColumnType<T>): ColumnOffset {
  return resolvedColumnWidth(item) ?? item.minWidth ?? 120;
}

function addColumnOffset(offset: ColumnOffset, width: ColumnOffset): ColumnOffset {
  return offset + width;
}

function normalizePlacement(config: PaginationConfig): PaginationPlacementType[] {
  return config.placement?.length ? config.placement : ["bottomEnd"];
}

function InnerTable<T extends object>(props: TableProps<T>, ref: React.ForwardedRef<TableRef>) {
  const {
    dataSource: sourceDataSource = EMPTY_DATA_SOURCE,
    columns: sourceColumns,
    rowKey = "id" as keyof T,
    pagination = {},
    rowSelection,
    rowDrag,
    columnDrag,
    expandable,
    bordered = false,
    loading = false,
    size = "lg",
    locale = {},
    showHeader = true,
    showSorterTooltip = true,
    rowHoverable = true,
    textSelectable = true,
    stickyHeader = false,
    stickyHeaderOffset = 0,
    virtual = false,
    stickyScrollBar = false,
    stickyScrollBarOffset = 0,
    scroll,
    className = "",
    style: rootStyle,
    onChange,
    onRow,
    onHeaderRow,
    onScroll,
    ...rootProps
  } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const filterTriggers = useRef(new Map<string, HTMLButtonElement>());
  const selectionCache = useRef(new Map<Key, T>());
  const selectionName = `wizard-table-selection-${useId().replace(/:/g, "")}`;
  const rowDragEnabled = Boolean(rowDrag);
  const rowDragConfig = typeof rowDrag === "object" ? rowDrag : undefined;
  const columnDragEnabled = Boolean(columnDrag);
  const columnDragConfig = typeof columnDrag === "object" ? columnDrag : undefined;
  const [dragDataSource, setDragDataSource] = useState<T[]>(sourceDataSource);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [verticalScrollbarWidth, setVerticalScrollbarWidth] = useState(0);
  const [overlayScrollbarSupported, setOverlayScrollbarSupported] = useState(false);
  const [verticalScrollbar, setVerticalScrollbar] =
    useState<VerticalScrollbarState>(HIDDEN_VERTICAL_SCROLLBAR);
  const [horizontalScrollbar, setHorizontalScrollbar] = useState<HorizontalScrollbarState>(
    HIDDEN_HORIZONTAL_SCROLLBAR,
  );
  const [tableViewportWidth, setTableViewportWidth] = useState(0);
  const [stickyScrollbar, setStickyScrollbar] =
    useState<StickyScrollbarState>(HIDDEN_STICKY_SCROLLBAR);
  const scrollbarDragRef = useRef<{
    pointerId: number;
    startY: number;
    startScrollTop: number;
  } | null>(null);
  const horizontalScrollbarDragRef = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
  } | null>(null);
  const stickyScrollbarDragRef = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
  } | null>(null);
  const stickyScrollBarEnabled = stickyScrollBar;
  const normalizedStickyHeaderOffset = Math.max(0, stickyHeaderOffset);
  const normalizedStickyScrollBarOffset = Math.max(0, stickyScrollBarOffset);

  useEffect(() => {
    setOverlayScrollbarSupported(
      typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("selector(::-webkit-scrollbar)"),
    );
  }, []);

  useEffect(() => {
    if (rowDragEnabled) setDragDataSource(sourceDataSource);
  }, [rowDragEnabled, sourceDataSource]);

  const dataSource = rowDragEnabled ? dragDataSource : sourceDataSource;

  const sourceColumnsResolved = sourceColumns ?? EMPTY_COLUMNS;
  const [dragColumns, setDragColumns] = useState<ColumnsType<T>>(sourceColumnsResolved);

  useEffect(() => {
    if (columnDragEnabled) setDragColumns(sourceColumnsResolved);
  }, [columnDragEnabled, sourceColumnsResolved]);

  const columns = columnDragEnabled ? dragColumns : sourceColumnsResolved;
  const [internalPage, setInternalPage] = useState(
    typeof pagination === "object" ? (pagination.defaultPage ?? 1) : 1,
  );
  const [internalPageSize, setInternalPageSize] = useState(
    typeof pagination === "object" ? (pagination.defaultPageSize ?? pagination.pageSize ?? 10) : 10,
  );
  const [sortStates, setSortStates] = useState<SortState<T>[]>(() =>
    flattenColumns(columns).flatMap((item, index) =>
      item.defaultSortOrder
        ? [
            {
              column: item,
              key: columnKey(item, index),
              order: item.defaultSortOrder,
              priority: typeof item.sorter === "object" ? (item.sorter.multiple ?? 0) : 0,
            },
          ]
        : [],
    ),
  );
  const [filters, setFilters] = useState<Record<string, FilterKey[]>>(() =>
    Object.fromEntries(
      flattenColumns(columns).map((item, index) => [
        columnKey(item, index),
        item.defaultFilteredValue ?? [],
      ]),
    ),
  );
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const [filterDraft, setFilterDraft] = useState<Record<string, FilterKey[]>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(
    () => new Set(rowSelection?.defaultSelectedKeys ?? []),
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(
    () => new Set(expandable?.defaultExpandedKeys ?? []),
  );
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const [loadingVisible, setLoadingVisible] = useState(
    typeof loading === "boolean" ? loading : (loading.spinning ?? true),
  );
  const [scrollBoundary, setScrollBoundary] = useState({ left: false, right: false });
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
  const measureScrollBoundary = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      setHasHorizontalOverflow(false);
      return;
    }
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    const nextHasHorizontalOverflow = maxScrollLeft > 2;
    setHasHorizontalOverflow((current) =>
      current === nextHasHorizontalOverflow ? current : nextHasHorizontalOverflow,
    );
    const next = { left: node.scrollLeft > 1, right: node.scrollLeft < maxScrollLeft - 1 };
    setScrollBoundary((current) =>
      current.left === next.left && current.right === next.right ? current : next,
    );
  }, []);
  const handleScrollKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const node = event.currentTarget;
      const horizontalStep = Math.max(48, Math.round(node.clientWidth * 0.15));
      const verticalStep = Math.max(48, Math.round(node.clientHeight * 0.8));
      const canScrollHorizontally =
        Boolean(scroll?.x) || scrollBoundary.left || scrollBoundary.right;
      const movement =
        event.key === "ArrowLeft" && canScrollHorizontally
          ? { left: -horizontalStep }
          : event.key === "ArrowRight" && canScrollHorizontally
            ? { left: horizontalStep }
            : event.key === "PageUp" && scroll?.y
              ? { top: -verticalStep }
              : event.key === "PageDown" && scroll?.y
                ? { top: verticalStep }
                : null;
      if (!movement) return;
      event.preventDefault();
      node.scrollBy({ ...movement, behavior: "smooth" });
    },
    [scroll?.x, scroll?.y, scrollBoundary.left, scrollBoundary.right],
  );

  useEffect(() => {
    const listener = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  useEffect(() => {
    const spinning = typeof loading === "boolean" ? loading : (loading.spinning ?? true);
    if (!spinning) {
      setLoadingVisible(false);
      return;
    }
    const delay = typeof loading === "object" ? (loading.delay ?? 0) : 0;
    if (!delay) {
      setLoadingVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setLoadingVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const keyOf = useCallback((record: T): Key => record[rowKey] as Key, [rowKey]);
  const childrenName = expandable?.childrenColumnName ?? "children";
  const controlledExpanded = expandable?.expandedKeys
    ? new Set(expandable.expandedKeys)
    : expandedKeys;
  const controlledSelected = rowSelection?.selectedKeys
    ? new Set(rowSelection.selectedKeys)
    : selectedKeys;
  const allDataRows = useMemo(() => {
    const result: T[] = [];
    const walk = (items: T[]) =>
      items.forEach((item) => {
        result.push(item);
        const children = (item as Record<string, unknown>)[childrenName] as T[] | undefined;
        if (children?.length) walk(children);
      });
    walk(dataSource);
    return result;
  }, [childrenName, dataSource]);

  useEffect(() => {
    allDataRows.forEach((record) => selectionCache.current.set(keyOf(record), record));
    if (!rowSelection?.preserveSelectedKeys && !rowSelection?.selectedKeys) {
      const available = new Set(allDataRows.map((record) => keyOf(record)));
      setSelectedKeys((current) => new Set([...current].filter((key) => available.has(key))));
    }
    // keyOf intentionally follows the current rowKey prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataRows, rowSelection?.preserveSelectedKeys, rowSelection?.selectedKeys]);

  useEffect(() => {
    if (!expandable?.defaultExpandAllRows) return;
    const keys: Key[] = [];
    const walk = (items: T[]) =>
      items.forEach((item) => {
        const children = (item as Record<string, unknown>)[childrenName] as T[] | undefined;
        if (
          (children?.length || expandable.expandedRowRender) &&
          (expandable.rowExpandable?.(item) ?? true)
        )
          keys.push(keyOf(item));
        if (children?.length) walk(children);
      });
    walk(dataSource);
    setExpandedKeys(new Set(keys));
    // This is an initial default, matching defaultExpandAllRows semantics.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const responsiveColumns = useMemo(() => {
    const visible = (item: ColumnType<T>) =>
      !item.hidden &&
      (!item.responsive?.length ||
        item.responsive.some((point) => viewportWidth >= breakpointWidths[point]));
    const visit = (items: ColumnsType<T>): ColumnsType<T> =>
      items
        .filter(visible)
        .map((item) => ({ ...item, children: item.children ? visit(item.children) : undefined }))
        .filter((item) => !item.children || item.children.length > 0);
    return visit(columns);
  }, [columns, viewportWidth]);
  const leafColumns = useMemo(() => flattenColumns(responsiveColumns), [responsiveColumns]);
  const isNestedHeader = useMemo(() => maxDepth(responsiveColumns) > 1, [responsiveColumns]);
  const groupBoundaryLeafIndices = useMemo(() => {
    const set = new Set<number>();
    if (!isNestedHeader) return set;
    responsiveColumns.forEach((item, index) => {
      if (index === responsiveColumns.length - 1) return;
      const leaves = item.children?.length ? flattenColumns(item.children) : [item];
      const leafIndex = leafColumns.indexOf(leaves[leaves.length - 1]);
      if (leafIndex >= 0) set.add(leafIndex);
    });
    return set;
  }, [responsiveColumns, leafColumns, isNestedHeader]);
  const activeFilters = useMemo(
    () =>
      Object.fromEntries(
        leafColumns.map((item, index) => {
          const key = columnKey(item, index);
          return [
            key,
            item.filteredValue !== undefined ? (item.filteredValue ?? []) : (filters[key] ?? []),
          ];
        }),
      ),
    [filters, leafColumns],
  );
  const activeSorts = useMemo(
    () =>
      leafColumns.flatMap((item, index) =>
        item.sortOrder !== undefined
          ? [
              {
                column: item,
                key: columnKey(item, index),
                order: item.sortOrder,
                priority: typeof item.sorter === "object" ? (item.sorter.multiple ?? 0) : 0,
              },
            ]
          : sortStates.filter((state) => state.key === columnKey(item, index)),
      ),
    [leafColumns, sortStates],
  );

  const processData = useCallback(
    (items: T[], filterState: Record<string, FilterKey[]>, sortState: SortState<T>[]): T[] => {
      const ordered = [...sortState]
        .filter(
          (state) =>
            state.order &&
            (typeof state.column.sorter === "function" ||
              (typeof state.column.sorter === "object" && state.column.sorter.compare)),
        )
        .sort((a, b) => b.priority - a.priority);
      const filtered = items
        .filter((record) =>
          leafColumns.every((item, index) => {
            const values = filterState[columnKey(item, index)];
            return (
              !values?.length ||
              !item.onFilter ||
              values.some((value) => item.onFilter?.(value, record))
            );
          }),
        )
        .map((record) => {
          const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
          return children?.length
            ? { ...record, [childrenName]: processData(children, filterState, sortState) }
            : record;
        });
      return ordered.length
        ? [...filtered].sort((left, right) => {
            for (const state of ordered) {
              const sorter = state.column.sorter;
              const compare =
                typeof sorter === "function"
                  ? sorter
                  : typeof sorter === "object"
                    ? sorter.compare
                    : undefined;
              const result = compare?.(left, right, state.order) ?? 0;
              if (result) return state.order === "ascend" ? result : -result;
            }
            return 0;
          })
        : filtered;
    },
    [childrenName, leafColumns],
  );
  const processed = useMemo(
    () => processData(dataSource, activeFilters, activeSorts),
    [activeFilters, activeSorts, dataSource, processData],
  );

  const pageConfig = pagination === false ? null : pagination;
  const page = pageConfig?.page ?? internalPage;
  const pageSize = pageConfig?.pageSize ?? internalPageSize;
  const total = pageConfig?.total ?? processed.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const serverPaginated = Boolean(
    pageConfig?.total !== undefined && pageConfig.total > processed.length,
  );
  const pageData = pageConfig
    ? serverPaginated
      ? processed
      : processed.slice((safePage - 1) * pageSize, safePage * pageSize)
    : processed;

  const selectionEntities = useMemo(() => {
    const entities = new Map<Key, { record: T; parent?: Key; children: Key[] }>();
    const walk = (items: T[], parent?: Key) =>
      items.forEach((record) => {
        const key = keyOf(record);
        const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
        const childKeys = children?.map((child) => keyOf(child)) ?? [];
        entities.set(key, { record, parent, children: childKeys });
        if (children?.length) walk(children, key);
      });
    walk(dataSource);
    return entities;
  }, [childrenName, dataSource, keyOf]);

  const pageSelectionRows = useMemo(() => {
    const rows: T[] = [];
    const walk = (items: T[]) =>
      items.forEach((record) => {
        rows.push(record);
        const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
        if (children?.length) walk(children);
      });
    walk(pageData);
    return rows;
  }, [childrenName, pageData]);

  const flattenRows = (items: T[], depth = 0, parent?: Key): FlatRow<T>[] =>
    items.flatMap((record) => {
      const key = keyOf(record);
      const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
      return [
        { record, depth, parent },
        ...(children?.length && controlledExpanded.has(key)
          ? flattenRows(children, depth + 1, key)
          : []),
      ];
    });
  const allFlatRows = flattenRows(pageData);
  const rowHeight = size === "sm" ? 39 : size === "md" ? 47 : 55;
  const viewportHeight = typeof scroll?.y === "number" ? scroll.y : 400;
  const virtualStart = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - 3) : 0;
  const virtualCount = virtual ? Math.ceil(viewportHeight / rowHeight) + 6 : allFlatRows.length;
  const renderedRows = virtual
    ? allFlatRows.slice(virtualStart, virtualStart + virtualCount)
    : allFlatRows;
  const topPad = virtual ? virtualStart * rowHeight : 0;
  const bottomPad = virtual
    ? Math.max(0, (allFlatRows.length - virtualStart - renderedRows.length) * rowHeight)
    : 0;

  const handleRowDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;

      const activeIndex = dataSource.findIndex(
        (record) => `row:${String(keyOf(record))}` === String(active.id),
      );
      const overIndex = dataSource.findIndex(
        (record) => `row:${String(keyOf(record))}` === String(over.id),
      );
      if (activeIndex < 0 || overIndex < 0) return;

      const nextDataSource = arrayMove(dataSource, activeIndex, overIndex);
      setDragDataSource(nextDataSource);
      rowDragConfig?.onChange?.(nextDataSource, {
        activeKey: keyOf(dataSource[activeIndex]),
        overKey: keyOf(dataSource[overIndex]),
        activeIndex,
        overIndex,
      });
    },
    [dataSource, keyOf, rowDragConfig],
  );

  const handleColumnDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;

      const activeIndex = columns.findIndex(
        (item, index) => `column:${columnKey(item, index)}` === String(active.id),
      );
      const overIndex = columns.findIndex(
        (item, index) => `column:${columnKey(item, index)}` === String(over.id),
      );
      if (activeIndex < 0 || overIndex < 0) return;

      const nextColumns = arrayMove([...columns], activeIndex, overIndex);
      setDragColumns(nextColumns);
      columnDragConfig?.onChange?.(nextColumns, {
        activeKey: columnKey(columns[activeIndex], activeIndex),
        overKey: columnKey(columns[overIndex], overIndex),
        activeIndex,
        overIndex,
      });
    },
    [columnDragConfig, columns],
  );

  const handleTableDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.active.data.current?.dragType === "column") handleColumnDragEnd(event);
      else if (event.active.data.current?.dragType === "row") handleRowDragEnd(event);
    },
    [handleColumnDragEnd, handleRowDragEnd],
  );

  const emitChange = (
    nextPage = safePage,
    nextPageSize = pageSize,
    nextFilters = activeFilters,
    nextSorts = activeSorts,
  ) => {
    const sorterInfo: SorterResult<T>[] = nextSorts.flatMap((item) =>
      item.order
        ? [
            {
              column: item.column,
              columnKey: item.key,
              field: item.column.dataIndex as Key | readonly Key[] | undefined,
              order: item.order,
            },
          ]
        : [],
    );
    const reportedFilters = Object.fromEntries(
      leafColumns.flatMap((item, index) => {
        const key = columnKey(item, index);
        return item.filters?.length ||
          item.filteredValue !== undefined ||
          item.defaultFilteredValue !== undefined
          ? [[key, nextFilters[key]?.length ? nextFilters[key] : null]]
          : [];
      }),
    ) as Record<string, FilterValueType>;
    onChange?.(
      { ...pageConfig, page: nextPage, pageSize: nextPageSize, total },
      reportedFilters,
      sorterInfo,
    );
  };

  const changePage = (next: number, nextSize = pageSize) => {
    const bounded = Math.max(1, Math.min(Math.max(1, Math.ceil(total / nextSize)), next));
    setInternalPage(bounded);
    setInternalPageSize(nextSize);
    pageConfig?.onChange?.(bounded, nextSize);
    emitChange(bounded, nextSize);
    if (typeof scrollRef.current?.scrollTo === "function") scrollRef.current.scrollTo({ top: 0 });
  };

  const toggleSort = (item: ColumnType<T>, index: number) => {
    if (!item.sorter || item.sortOrder !== undefined) return;
    const key = columnKey(item, index);
    const current = sortStates.find((state) => state.key === key)?.order ?? null;
    const nextOrder =
      SORT_DIRECTIONS[(SORT_DIRECTIONS.indexOf(current) + 1) % SORT_DIRECTIONS.length];
    const priority = typeof item.sorter === "object" ? (item.sorter.multiple ?? 0) : 0;
    const next = priority
      ? [
          ...sortStates.filter((state) => state.key !== key),
          { column: item, key, order: nextOrder, priority },
        ]
      : [{ column: item, key, order: nextOrder, priority }];
    setSortStates(next.filter((state) => state.order));
    emitChange(safePage, pageSize, activeFilters, next);
    if (typeof scrollRef.current?.scrollTo === "function") scrollRef.current.scrollTo({ top: 0 });
  };

  const applyFilter = (
    item: ColumnType<T>,
    index: number,
    values = filterDraft[columnKey(item, index)] ?? [],
    closeDropdown = true,
  ) => {
    const key = columnKey(item, index);
    const next = { ...activeFilters, [key]: values };
    setFilters((current) => ({ ...current, [key]: values }));
    if (closeDropdown) {
      setFilterOpen(null);
    }
    setInternalPage(1);
    pageConfig?.onChange?.(1, pageSize);
    emitChange(1, pageSize, next);
    if (typeof scrollRef.current?.scrollTo === "function") scrollRef.current.scrollTo({ top: 0 });
  };

  const closeFilter = (item: ColumnType<T>, index: number) => {
    const key = columnKey(item, index);
    if (item.filterOnClose !== false)
      applyFilter(item, index, filterDraft[key] ?? activeFilters[key] ?? []);
    else {
      setFilterOpen(null);
    }
  };

  const updateSelection = (next: Set<Key>) => {
    if (!rowSelection?.selectedKeys) setSelectedKeys(next);
    const source = rowSelection?.preserveSelectedKeys
      ? [...selectionCache.current.values()]
      : allDataRows;
    const selectedRows = source.filter((row) => next.has(keyOf(row)));
    rowSelection?.onChange?.([...next], selectedRows);
    return selectedRows;
  };

  const changeableRows = pageSelectionRows.filter(
    (record) => !rowSelection?.getCheckboxProps?.(record).disabled,
  );
  const changeableKeys = changeableRows.map((record) => keyOf(record));
  const selectedChangeableCount = changeableKeys.filter((key) =>
    controlledSelected.has(key),
  ).length;
  const allChangeableSelected =
    changeableKeys.length > 0 && selectedChangeableCount === changeableKeys.length;
  const someChangeableSelected = selectedChangeableCount > 0 && !allChangeableSelected;
  const selectAll = (selected: boolean) => {
    const next = new Set(controlledSelected);
    changeableKeys.forEach((key) => (selected ? next.add(key) : next.delete(key)));
    updateSelection(next);
  };
  const conductTreeSelection = (next: Set<Key>, record: T, selected: boolean) => {
    const key = keyOf(record);
    const visit = (currentKey: Key) => {
      const entity = selectionEntities.get(currentKey);
      if (!entity) return;
      if (!rowSelection?.getCheckboxProps?.(entity.record).disabled) {
        if (selected) next.add(currentKey);
        else next.delete(currentKey);
      }
      entity.children.forEach(visit);
    };
    visit(key);
    let parentKey = selectionEntities.get(key)?.parent;
    while (parentKey !== undefined) {
      const parent = selectionEntities.get(parentKey);
      if (!parent) break;
      if (!rowSelection?.getCheckboxProps?.(parent.record).disabled) {
        const selectableChildren = parent.children.filter((childKey) => {
          const child = selectionEntities.get(childKey);
          return child && !rowSelection?.getCheckboxProps?.(child.record).disabled;
        });
        if (selectableChildren.length && selectableChildren.every((childKey) => next.has(childKey)))
          next.add(parentKey);
        else next.delete(parentKey);
      }
      parentKey = parent.parent;
    }
  };

  const treeSelectionIndeterminate = (key: Key): boolean => {
    if (rowSelection?.checkStrictly !== false || controlledSelected.has(key)) return false;
    const entity = selectionEntities.get(key);
    return Boolean(
      entity?.children.some(
        (childKey) => controlledSelected.has(childKey) || treeSelectionIndeterminate(childKey),
      ),
    );
  };

  const toggleExpand = (record: T) => {
    const key = keyOf(record);
    const next = new Set(controlledExpanded);
    const expanded = !next.has(key);
    if (expanded) next.add(key);
    else next.delete(key);
    if (!expandable?.expandedKeys) setExpandedKeys(next);
    expandable?.onExpand?.(expanded, record);
    expandable?.onExpandedRowsChange?.([...next]);
  };

  const dragWidth = rowDragEnabled ? Number(rowDragConfig?.columnWidth ?? 48) : 0;
  const selectionWidth = rowSelection ? Number(rowSelection.columnWidth ?? 48) : 0;
  const expandWidth =
    expandable && expandable.showExpandColumn !== false ? Number(expandable.columnWidth ?? 48) : 0;
  const selectionFixed = rowSelection?.fixed === true;
  const expandFixed = expandable?.fixed === true;
  const selectionColumnWidth = rowSelection?.columnWidth ?? 48;
  const selectionColumnWidthStyle: CSSProperties = {
    width: selectionColumnWidth,
    minWidth: selectionColumnWidth,
    maxWidth: selectionColumnWidth,
  };
  const dragColumnWidthStyle: CSSProperties = {
    width: rowDragConfig?.columnWidth ?? 48,
    minWidth: rowDragConfig?.columnWidth ?? 48,
    maxWidth: rowDragConfig?.columnWidth ?? 48,
  };
  const expandColumnWidthStyle: CSSProperties = {
    width: expandable?.columnWidth ?? 48,
    minWidth: expandable?.columnWidth ?? 48,
    maxWidth: expandable?.columnWidth ?? 48,
  };
  const flexibleColumnCount = leafColumns.filter((item) => item.width == null).length;
  const hasNumericColumnSizing = leafColumns.every(
    (item) => item.width == null || typeof item.width === "number",
  );
  const canDistributeFixedWidth = flexibleColumnCount > 0 && hasNumericColumnSizing;
  const fixedPixelWidth = hasNumericColumnSizing
    ? dragWidth +
      selectionWidth +
      expandWidth +
      leafColumns.reduce((total, item) => {
        const width = resolvedColumnWidth(item);
        return total + (typeof width === "number" ? width : 0);
      }, 0)
    : 0;
  const flexibleMinimumWidth = hasNumericColumnSizing
    ? leafColumns.reduce(
        (total, item) => total + (item.width == null ? (item.minWidth ?? 0) : 0),
        0,
      )
    : 0;
  const minimumFixedTableWidth = hasNumericColumnSizing
    ? fixedPixelWidth + flexibleMinimumWidth
    : 0;
  const flexibleColumns = leafColumns
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.width == null);
  const canResolveFlexibleWidths =
    canDistributeFixedWidth &&
    (flexibleColumns.length === 1 || flexibleColumns.every(({ item }) => item.minWidth != null));
  const growingColumnIndex = canResolveFlexibleWidths ? flexibleColumns[0]?.index : undefined;
  const flexibleColumnWidth = (item: ColumnType<T>, index: number): CSSProperties["width"] => {
    const width = resolvedColumnWidth(item);
    if (!canDistributeFixedWidth || width != null) return width ?? item.minWidth;
    if (!canResolveFlexibleWidths) return item.minWidth;
    if (index !== growingColumnIndex) return item.minWidth;

    const otherMinimumWidth = flexibleMinimumWidth - (item.minWidth ?? 0);
    const occupiedWidth = fixedPixelWidth + otherMinimumWidth;
    const configuredPixelWidth = typeof scroll?.x === "number" ? scroll.x : 0;
    const availableWidth = Math.max(tableViewportWidth, configuredPixelWidth);
    if (availableWidth > 0) {
      return Math.max(item.minWidth ?? 0, availableWidth - occupiedWidth);
    }
    return occupiedWidth > 0 ? `calc(100% - ${occupiedWidth}px)` : "100%";
  };
  const leftOffsets = useMemo(() => {
    let offset: ColumnOffset =
      dragWidth + (selectionFixed ? selectionWidth : 0) + (expandFixed ? expandWidth : 0);
    const map: Record<string, ColumnOffset> = {};
    leafColumns.forEach((item, index) => {
      if (fixedSide(item.fixed) === "left") {
        map[columnKey(item, index)] = offset;
        offset = addColumnOffset(offset, fixedOffsetWidth(item));
      }
    });
    return map;
  }, [dragWidth, expandFixed, expandWidth, leafColumns, selectionFixed, selectionWidth]);
  const rightOffsets = useMemo(() => {
    let offset: ColumnOffset = 0;
    const map: Record<string, ColumnOffset> = {};
    [...leafColumns].reverse().forEach((item, reverseIndex) => {
      const index = leafColumns.length - reverseIndex - 1;
      if (fixedSide(item.fixed) === "right") {
        map[columnKey(item, index)] = offset;
        offset = addColumnOffset(offset, fixedOffsetWidth(item));
      }
    });
    return map;
  }, [leafColumns]);
  const fixedStyle = (item: ColumnType<T>, index: number): CSSProperties => {
    const key = columnKey(item, index);
    if (key in leftOffsets) return { position: "sticky", left: leftOffsets[key], zIndex: 2 };
    if (key in rightOffsets) return { position: "sticky", right: rightOffsets[key], zIndex: 2 };
    return {};
  };
  const headerFixedStyle = (item: ColumnType<T>, index: number): CSSProperties => {
    const style = fixedStyle(item, index);
    return style.position ? { ...style, zIndex: 6 } : style;
  };
  const selectionFixedStyle: CSSProperties = selectionFixed
    ? { position: "sticky", left: dragWidth, zIndex: 3 }
    : {};
  const selectionHeaderFixedStyle: CSSProperties = selectionFixedStyle.position
    ? { ...selectionFixedStyle, zIndex: 7 }
    : selectionFixedStyle;
  const expandFixedStyle: CSSProperties = expandFixed
    ? {
        position: "sticky",
        left: dragWidth + (selectionFixed ? selectionWidth : 0),
        zIndex: 3,
      }
    : {};
  const expandHeaderFixedStyle: CSSProperties = expandFixedStyle.position
    ? { ...expandFixedStyle, zIndex: 7 }
    : expandFixedStyle;
  const dragFixedStyle: CSSProperties = rowDragEnabled
    ? { position: "sticky", left: 0, zIndex: 3 }
    : {};
  const dragHeaderFixedStyle: CSSProperties = { ...dragFixedStyle, zIndex: 7 };
  const extraColumnCount =
    (rowDragEnabled ? 1 : 0) +
    (rowSelection ? 1 : 0) +
    (expandable && expandable.showExpandColumn !== false ? 1 : 0);
  const fullColSpan = leafColumns.length + extraColumnCount;
  const lastLeftFixedIndex = leafColumns.reduce(
    (last, item, index) =>
      fixedSide(item.fixed as ColumnType<object>["fixed"]) === "left" ? index : last,
    -1,
  );
  const firstRightFixedIndex = leafColumns.findIndex(
    (item) => fixedSide(item.fixed as ColumnType<object>["fixed"]) === "right",
  );
  const fixedClass = (item: ColumnType<T>, index: number) => {
    const side = fixedSide(item.fixed as ColumnType<object>["fixed"]);
    if (side === "left")
      return twMerge(
        "sticky",
        index === lastLeftFixedIndex &&
          twMerge(
            fixedLeftLastShadowBaseClass,
            scrollBoundary.left && fixedLeftLastShadowVisibleClass,
          ),
      );
    if (side === "right")
      return twMerge(
        "sticky",
        index === firstRightFixedIndex &&
          twMerge(
            fixedRightFirstShadowBaseClass,
            scrollBoundary.right && fixedRightFirstShadowVisibleClass,
          ),
      );
    return "";
  };
  const selectionBoundaryClass =
    selectionFixed && !expandFixed && lastLeftFixedIndex < 0
      ? twMerge(
          fixedLeftLastShadowBaseClass,
          scrollBoundary.left && fixedLeftLastShadowVisibleClass,
          "sticky",
        )
      : selectionFixed
        ? "sticky"
        : "";
  const expandBoundaryClass =
    expandFixed && lastLeftFixedIndex < 0
      ? twMerge(
          fixedLeftLastShadowBaseClass,
          scrollBoundary.left && fixedLeftLastShadowVisibleClass,
          "sticky",
        )
      : expandFixed
        ? "sticky"
        : "";

  useImperativeHandle(
    ref,
    () => ({
      nativeElement: rootRef.current,
      scrollTo: ({ index, key, top, offset = 0, align = "nearest" }) => {
        if (top !== undefined) scrollRef.current?.scrollTo({ top });
        else if (virtual && (index !== undefined || key !== undefined)) {
          const targetIndex =
            key !== undefined
              ? allFlatRows.findIndex((item) => keyOf(item.record) === key)
              : (index ?? -1);
          if (targetIndex < 0) return;
          const targetStart = targetIndex * rowHeight;
          const targetEnd = targetStart + rowHeight;
          const currentTop = scrollRef.current?.scrollTop ?? 0;
          const currentEnd = currentTop + viewportHeight;
          const aligned =
            align === "start"
              ? targetStart
              : align === "center"
                ? targetStart - (viewportHeight - rowHeight) / 2
                : align === "end"
                  ? targetEnd - viewportHeight
                  : targetStart < currentTop
                    ? targetStart
                    : targetEnd > currentEnd
                      ? targetEnd - viewportHeight
                      : currentTop;
          scrollRef.current?.scrollTo({ top: Math.max(0, aligned + offset) });
        } else {
          const target =
            key !== undefined
              ? rootRef.current?.querySelector(`[data-row-key="${CSS.escape(String(key))}"]`)
              : index !== undefined
                ? rootRef.current?.querySelectorAll("[data-row-key]")[index]
                : null;
          target?.scrollIntoView({ block: align });
          if (offset && typeof scrollRef.current?.scrollBy === "function")
            scrollRef.current.scrollBy({ top: offset });
        }
      },
    }),
    [allFlatRows, keyOf, rowHeight, viewportHeight, virtual],
  );

  const nextSortLabel = (order: SortOrderType) => {
    const next = SORT_DIRECTIONS[(SORT_DIRECTIONS.indexOf(order) + 1) % SORT_DIRECTIONS.length];
    return next === "ascend"
      ? (locale.triggerAsc ?? "오름차순 정렬")
      : next === "descend"
        ? (locale.triggerDesc ?? "내림차순 정렬")
        : (locale.cancelSort ?? "정렬 해제");
  };

  const renderHeaderRows = () => {
    const depth = maxDepth(responsiveColumns);
    return Array.from({ length: depth }, (_, level) => {
      const cells: ReactNode[] = [];
      const visit = (items: ColumnsType<T>, current: number, parentPath = "root") =>
        items.forEach((item, itemIndex) => {
          const headerPath = `${parentPath}-${itemIndex}`;
          if (current === level) {
            const leafIndex = leafColumns.indexOf(item);
            const key = columnKey(item, leafIndex);
            const order = activeSorts.find((state) => state.key === key)?.order ?? null;
            const sorterTooltipVisible = item.showSorterTooltip ?? showSorterTooltip;
            const tooltipTitle = nextSortLabel(order);
            const headerProps = item.onHeaderCell?.(item, leafIndex) ?? {};
            const itemLeaves = item.children?.length ? flattenColumns(item.children) : [item];
            const isLeafColumn = !item.children?.length;
            const visualLastIndex = leafColumns.indexOf(itemLeaves[itemLeaves.length - 1]);
            const resolvedColSpan = item.children?.length ? leafCount(item) : undefined;
            const filterIsOpen = filterOpen === key;
            const draggableColumn = columnDragEnabled && depth === 1 && !item.children;
            const RenderedHeaderCell: React.ElementType = draggableColumn
              ? SortableTableHeaderCell
              : "th";
            const sorterButton = item.sorter && !item.children && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                prefixIcon={
                  <Icon
                    icon="sorter"
                    size={12}
                    color="#ccc"
                    className={
                      order === "ascend"
                        ? "[&>path:first-child]:fill-[#0062df]"
                        : order === "descend"
                          ? "[&>path:last-child]:fill-[#0062df]"
                          : undefined
                    }
                  />
                }
                className={iconButtonClass}
                data-table-sorter
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSort(item, leafIndex);
                }}
              />
            );
            const sorterControl =
              sorterButton && sorterTooltipVisible ? (
                <Tooltip title={tooltipTitle}>{sorterButton}</Tooltip>
              ) : (
                sorterButton
              );
            const headerContent = (
              <span
                className={twMerge(headerContentClass, item.sorter && "cursor-pointer select-none")}
                onClick={item.sorter ? () => toggleSort(item, leafIndex) : undefined}
              >
                <span>{item.title}</span>
                {sorterControl}
                {item.filters?.length && !item.children ? (
                  <span className={filterWrapClass}>
                    <Button
                      ref={(node) => {
                        if (node) filterTriggers.current.set(key, node);
                        else filterTriggers.current.delete(key);
                      }}
                      variant="ghost"
                      size="sm"
                      iconOnly
                      prefixIcon={<Icon icon="filter-filled" size={14} />}
                      className={twMerge(
                        iconButtonClass,
                        activeFilters[key]?.length && iconButtonActiveClass,
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        const open = !filterIsOpen;
                        setFilterDraft((draft) => ({
                          ...draft,
                          [key]: activeFilters[key] ?? [],
                        }));
                        setFilterOpen(open ? key : null);
                      }}
                      data-table-filter
                    />
                    <FilterMenu
                      open={filterIsOpen}
                      item={item}
                      values={filterDraft[key] ?? []}
                      locale={locale}
                      trigger={filterTriggers.current.get(key)}
                      onValues={(values) =>
                        setFilterDraft((draft) => ({ ...draft, [key]: values }))
                      }
                      onApply={(values) => applyFilter(item, leafIndex, values)}
                      onClose={() => closeFilter(item, leafIndex)}
                    />
                  </span>
                ) : null}
              </span>
            );
            const renderedHeaderContent = headerContent;
            cells.push(
              <RenderedHeaderCell
                key={`${headerPath}-${key}-${level}`}
                {...(draggableColumn ? { component: "th", dragId: `column:${key}` } : {})}
                colSpan={resolvedColSpan}
                rowSpan={item.children?.length ? 1 : depth - level}
                {...headerProps}
                title={headerProps.title}
                style={{
                  width: isLeafColumn ? flexibleColumnWidth(item, leafIndex) : undefined,
                  minWidth: isLeafColumn ? item.minWidth : undefined,
                  textAlign: item.align,
                  ...(isLeafColumn ? headerFixedStyle(item, leafIndex) : {}),
                  ...headerProps.style,
                }}
                className={twMerge(
                  cellBaseClass,
                  cellSizePad[size],
                  headerCellBaseClass,
                  order && headerCellSortedClass,
                  !item.children && fixedClass(item, leafIndex),
                  isNestedHeader && nestedHeaderBorderClass,
                  visualLastIndex === leafColumns.length - 1 && cellLastNoRightBorder,
                  item.className,
                  headerProps.className,
                )}
              >
                {renderedHeaderContent}
              </RenderedHeaderCell>,
            );
          } else if (item.children?.length) visit(item.children, current + 1, headerPath);
        });
      visit(responsiveColumns, 0);

      const selectionTitle =
        rowSelection && rowSelection.type !== "radio" && !rowSelection.hideSelectAll ? (
          <Checkbox
            checked={allChangeableSelected}
            disabled={changeableKeys.length === 0}
            partiallyChecked={someChangeableSelected}
            onChange={(event) => selectAll(event.target.checked)}
          />
        ) : null;
      const headerRowProps = onHeaderRow?.(responsiveColumns, level) ?? {};
      return (
        <tr
          key={level}
          {...headerRowProps}
          className={headerRowProps.className}
          style={headerRowProps.style}
        >
          {level === 0 && rowDragEnabled && (
            <th
              rowSpan={depth}
              className={twMerge(
                cellBaseClass,
                cellSizePad[size],
                headerCellBaseClass,
                isNestedHeader && nestedHeaderBorderClass,
                dragCellClass,
              )}
              style={{
                ...dragColumnWidthStyle,
                ...dragHeaderFixedStyle,
              }}
            />
          )}
          {level === 0 && rowSelection && (
            <th
              rowSpan={depth}
              className={twMerge(
                cellBaseClass,
                cellSizePad[size],
                headerCellBaseClass,
                isNestedHeader && nestedHeaderBorderClass,
                selectionCellClass,
                selectionBoundaryClass,
              )}
              style={{
                ...selectionColumnWidthStyle,
                ...selectionHeaderFixedStyle,
              }}
            >
              <span className={selectionHeadClass}>{selectionTitle}</span>
            </th>
          )}
          {level === 0 && expandable && expandable.showExpandColumn !== false && (
            <th
              rowSpan={depth}
              className={twMerge(
                cellBaseClass,
                cellSizePad[size],
                headerCellBaseClass,
                isNestedHeader && nestedHeaderBorderClass,
                expandCellClass,
                expandBoundaryClass,
              )}
              style={{ ...expandColumnWidthStyle, ...expandHeaderFixedStyle }}
            >
              {expandable.columnTitle}
            </th>
          )}
          {cells}
        </tr>
      );
    });
  };

  const RenderedRowComponent: React.ElementType = rowDragEnabled ? SortableTableRow : "tr";
  const renderRow = ({ record, depth }: FlatRow<T>, visibleIndex: number) => {
    const actualIndex = virtualStart + visibleIndex;
    const key = keyOf(record);
    const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
    const canExpand =
      Boolean(children?.length || expandable?.expandedRowRender) &&
      (expandable?.rowExpandable?.(record) ?? true);
    const expanded = controlledExpanded.has(key);
    const rowProps = onRow?.(record, actualIndex) ?? {};
    const rowClass = twMerge(
      depth > 0 && "[&>td]:bg-[#fafafa]",
      rowHoverable && "hover:[&>td]:bg-[#f5f5f5]",
      expandable?.expandRowByClick && canExpand && "cursor-pointer",
      controlledSelected.has(key) && "[&>td]:bg-[#eef0f8] hover:[&>td]:bg-[#e3e7f5]",
      rowProps.className,
    );
    const checkboxProps = rowSelection?.getCheckboxProps?.(record) ?? {};
    const checked = controlledSelected.has(key);
    const selection = rowSelection;
    const selectionInputProps = selection
      ? {
          ...checkboxProps,
          name: selection.type === "radio" ? selectionName : checkboxProps.name,
          checked,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            const next = selection.type === "radio" ? new Set<Key>() : new Set(controlledSelected);
            if (selection.checkStrictly === false && selection.type !== "radio")
              conductTreeSelection(next, record, event.target.checked);
            else if (event.target.checked) next.add(key);
            else next.delete(key);
            updateSelection(next);
          },
        }
      : null;
    const originSelectionNode =
      selection && selectionInputProps ? (
        selection.type === "radio" ? (
          <Radio {...selectionInputProps} />
        ) : (
          <Checkbox {...selectionInputProps} partiallyChecked={treeSelectionIndeterminate(key)} />
        )
      ) : null;
    return (
      <Fragment key={key}>
        <RenderedRowComponent
          {...(rowDragEnabled ? { component: "tr", dragId: `row:${String(key)}` } : {})}
          data-row-key={key}
          data-row-depth={depth}
          {...rowProps}
          className={rowClass}
          style={{
            height: virtual ? rowHeight : undefined,
            ...rowProps.style,
          }}
          onClick={(event: React.MouseEvent<HTMLTableRowElement>) => {
            rowProps.onClick?.(event);
            const target = event.target as HTMLElement;
            if (
              expandable?.expandRowByClick &&
              canExpand &&
              !event.defaultPrevented &&
              !target.closest?.(
                'button, input, select, textarea, a, [role="button"], [role="link"]',
              )
            )
              toggleExpand(record);
          }}
          onMouseEnter={(event: React.MouseEvent<HTMLTableRowElement>) => {
            rowProps.onMouseEnter?.(event);
            if (rowHoverable) setHoveredRowIndex(actualIndex);
          }}
          onMouseLeave={(event: React.MouseEvent<HTMLTableRowElement>) => {
            rowProps.onMouseLeave?.(event);
            if (rowHoverable)
              setHoveredRowIndex((current) => (current === actualIndex ? null : current));
          }}
        >
          {rowDragEnabled && (
            <td
              className={twMerge(cellBaseClass, cellSizePad[size], dragCellClass)}
              style={{
                ...dragColumnWidthStyle,
                ...dragFixedStyle,
              }}
            >
              <RowDragHandle />
            </td>
          )}
          {rowSelection && (
            <td
              className={twMerge(
                cellBaseClass,
                cellSizePad[size],
                selectionCellClass,
                selectionBoundaryClass,
              )}
              style={{
                ...selectionColumnWidthStyle,
                ...selectionFixedStyle,
              }}
            >
              <span className="flex items-center justify-center">{originSelectionNode}</span>
            </td>
          )}
          {expandable && expandable.showExpandColumn !== false && (
            <td
              className={twMerge(
                cellBaseClass,
                cellSizePad[size],
                expandCellBodyClass,
                expandBoundaryClass,
              )}
              style={{ ...expandColumnWidthStyle, ...expandFixedStyle }}
            >
              <span className={expandIndentClass} style={{ paddingInlineStart: 15 }}>
                {canExpand ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    prefixIcon={<Icon icon={expanded ? "remove" : "add"} size={12} />}
                    className={expandButtonClass}
                    data-table-expand
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleExpand(record);
                    }}
                  />
                ) : (
                  <span className={expandPlaceholderClass} />
                )}
              </span>
            </td>
          )}
          {leafColumns.map((item, columnIndex) => (
            <BodyCell
              key={columnKey(item, columnIndex)}
              item={item}
              record={record}
              rowIndex={actualIndex}
              hoveredRowIndex={hoveredRowIndex}
              rowHoverable={rowHoverable}
              fixedStyle={fixedStyle(item, columnIndex)}
              width={flexibleColumnWidth(item, columnIndex)}
              minWidth={item.minWidth}
              className={twMerge(
                cellBaseClass,
                cellSizePad[size],
                fixedClass(item, columnIndex),
                groupBoundaryLeafIndices.has(columnIndex) && nestedHeaderBorderClass,
                columnIndex === leafColumns.length - 1 && cellLastNoRightBorder,
              )}
            />
          ))}
        </RenderedRowComponent>
        {expandable?.expandedRowRender && expanded && (
          <tr className="bg-[#fafafa]">
            <td
              className={twMerge(
                cellBaseClass,
                cellSizePad[size],
                cellLastNoRightBorder,
                "!bg-[#fafafa]",
              )}
              colSpan={fullColSpan}
            >
              {expandable.expandedRowRender(record, actualIndex)}
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  const placements = pageConfig
    ? normalizePlacement(pageConfig).filter((item) => item !== "none")
    : [];
  const renderPagination = (placement: PaginationPlacementType) =>
    pageConfig && total > 0 && !(pageConfig.hideOnSinglePage && pageCount <= 1) ? (
      <Pagination
        key={placement}
        config={pageConfig}
        page={safePage}
        pageSize={pageSize}
        total={total}
        pageCount={pageCount}
        placement={placement}
        onChange={changePage}
        className={placement.startsWith("top") ? "pb-4" : "pt-4"}
      />
    ) : null;
  const topPagination = placements.filter((item) => item.startsWith("top")).map(renderPagination);
  const bottomPagination = placements
    .filter((item) => item.startsWith("bottom"))
    .map(renderPagination);
  const emptyText = locale.emptyText ?? <DefaultEmpty />;
  const loadingConfig = typeof loading === "object" ? loading : undefined;
  const wrapperMaxHeight = scroll?.y ?? (virtual ? viewportHeight : undefined);
  const hasVerticalViewport = Boolean(scroll?.y || virtual);
  const separateHeader = Boolean(hasVerticalViewport || stickyHeader);
  const measureVerticalScrollbar = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !hasVerticalViewport || !overlayScrollbarSupported) {
        setVerticalScrollbar((current) => (current.visible ? HIDDEN_VERTICAL_SCROLLBAR : current));
        return;
      }

      const viewportHeight = node.clientHeight;
      const contentHeight = node.scrollHeight;
      const maxScrollTop = Math.max(0, contentHeight - viewportHeight);
      if (maxScrollTop <= 1 || viewportHeight <= 0) {
        setVerticalScrollbar((current) => (current.visible ? HIDDEN_VERTICAL_SCROLLBAR : current));
        return;
      }

      const height = Math.max(32, (viewportHeight * viewportHeight) / contentHeight);
      const maxThumbTop = Math.max(0, viewportHeight - height);
      const top = maxScrollTop ? (node.scrollTop / maxScrollTop) * maxThumbTop : 0;
      const next = { visible: true, top, height, viewportHeight };
      setVerticalScrollbar((current) =>
        current.visible === next.visible &&
        Math.abs(current.top - next.top) < 0.5 &&
        Math.abs(current.height - next.height) < 0.5 &&
        current.viewportHeight === next.viewportHeight
          ? current
          : next,
      );
    },
    [hasVerticalViewport, overlayScrollbarSupported],
  );

  const measureHorizontalScrollbar = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !overlayScrollbarSupported) {
        setHorizontalScrollbar((current) =>
          current.visible ? HIDDEN_HORIZONTAL_SCROLLBAR : current,
        );
        return;
      }

      const viewportWidth = node.clientWidth;
      const contentWidth = node.scrollWidth;
      const maxScrollLeft = Math.max(0, contentWidth - viewportWidth);
      if (maxScrollLeft <= 2 || viewportWidth <= 0) {
        setHorizontalScrollbar((current) =>
          current.visible ? HIDDEN_HORIZONTAL_SCROLLBAR : current,
        );
        return;
      }

      const width = Math.min(
        viewportWidth,
        Math.max(32, (viewportWidth * viewportWidth) / contentWidth),
      );
      const maxThumbLeft = Math.max(0, viewportWidth - width);
      const left = maxScrollLeft ? (node.scrollLeft / maxScrollLeft) * maxThumbLeft : 0;
      const next = { visible: true, left, width, viewportWidth };
      setHorizontalScrollbar((current) =>
        current.visible === next.visible &&
        Math.abs(current.left - next.left) < 0.5 &&
        Math.abs(current.width - next.width) < 0.5 &&
        current.viewportWidth === next.viewportWidth
          ? current
          : next,
      );
    },
    [overlayScrollbarSupported],
  );

  const measureStickyScrollbar = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !stickyScrollBarEnabled || typeof window === "undefined") {
        setStickyScrollbar((current) =>
          current.visible ? { ...current, visible: false } : current,
        );
        return;
      }

      const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
      const bounds = node.getBoundingClientRect();
      const viewportBottom = window.innerHeight;
      const stickyTop =
        viewportBottom -
        HORIZONTAL_SCROLLBAR_HEIGHT -
        STICKY_SCROLLBAR_BOTTOM_GAP -
        normalizedStickyScrollBarOffset;
      const regularScrollbarTop = bounds.bottom - HORIZONTAL_SCROLLBAR_HEIGHT;
      const left = Math.max(0, bounds.left);
      const hiddenLeft = Math.max(0, -bounds.left);
      const width = Math.max(0, Math.min(node.clientWidth - hiddenLeft, window.innerWidth - left));
      const visible =
        maxScrollLeft > 1 && width > 0 && bounds.top < stickyTop && regularScrollbarTop > stickyTop;

      if (!visible) {
        setStickyScrollbar((current) =>
          current.visible ? { ...current, visible: false } : current,
        );
        return;
      }

      const top = stickyTop;
      const thumbWidth = Math.min(
        width,
        Math.max(32, (width * node.clientWidth) / node.scrollWidth),
      );
      const maxThumbLeft = Math.max(0, width - thumbWidth);
      const thumbLeft = maxScrollLeft ? (node.scrollLeft / maxScrollLeft) * maxThumbLeft : 0;
      const next = { visible: true, left, top, width, thumbLeft, thumbWidth };
      setStickyScrollbar((current) =>
        current.visible === next.visible &&
        Math.abs(current.left - next.left) < 0.5 &&
        Math.abs(current.top - next.top) < 0.5 &&
        Math.abs(current.width - next.width) < 0.5 &&
        Math.abs(current.thumbLeft - next.thumbLeft) < 0.5 &&
        Math.abs(current.thumbWidth - next.thumbWidth) < 0.5
          ? current
          : next,
      );
    },
    [normalizedStickyScrollBarOffset, stickyScrollBarEnabled],
  );

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      setScrollBoundary({ left: false, right: false });
      setHasHorizontalOverflow(false);
      setVerticalScrollbarWidth(0);
      setTableViewportWidth(0);
      setHorizontalScrollbar(HIDDEN_HORIZONTAL_SCROLLBAR);
      return;
    }
    let frame = 0;
    const measure = () => {
      const nextViewportWidth = node.clientWidth;
      if (Math.abs(tableViewportWidth - nextViewportWidth) >= 0.5) {
        setTableViewportWidth(nextViewportWidth);
        return;
      }
      measureScrollBoundary(node);
      setVerticalScrollbarWidth(hasVerticalViewport ? node.offsetWidth - node.clientWidth : 0);
      measureVerticalScrollbar(node);
      measureHorizontalScrollbar(node);
      measureStickyScrollbar(node);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(node);
    const table = node.querySelector("table");
    if (table) observer.observe(table);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [
    leafColumns,
    measureHorizontalScrollbar,
    measureScrollBoundary,
    measureStickyScrollbar,
    measureVerticalScrollbar,
    pageData.length,
    scroll?.x,
    tableViewportWidth,
    hasVerticalViewport,
  ]);

  useLayoutEffect(() => {
    if (!stickyScrollBarEnabled) {
      setStickyScrollbar(HIDDEN_STICKY_SCROLLBAR);
      return;
    }

    const measure = () => measureStickyScrollbar(scrollRef.current);
    measure();
    window.addEventListener("scroll", measure, { capture: true, passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [measureStickyScrollbar, stickyScrollBarEnabled]);

  const configuredMinimumWidth =
    typeof scroll?.x === "number"
      ? Math.max(scroll.x, minimumFixedTableWidth)
      : scroll?.x === "max-content"
        ? minimumFixedTableWidth || "max-content"
        : typeof scroll?.x === "string"
          ? minimumFixedTableWidth
            ? `max(${scroll.x}, ${minimumFixedTableWidth}px)`
            : scroll.x
          : minimumFixedTableWidth || undefined;
  const tableStyle: CSSProperties = {
    tableLayout: "fixed",
    minWidth: configuredMinimumWidth,
  };
  const verticallyScrolledTableStyle = tableStyle;
  const renderColumnGroup = () => (
    <colgroup>
      {rowDragEnabled && <col style={dragColumnWidthStyle} />}
      {rowSelection && <col style={selectionColumnWidthStyle} />}
      {expandable && expandable.showExpandColumn !== false && (
        <col style={expandColumnWidthStyle} />
      )}
      {leafColumns.map((item, index) => (
        <col
          key={columnKey(item, index)}
          style={{
            width: flexibleColumnWidth(item, index),
            minWidth: item.minWidth,
          }}
        />
      ))}
    </colgroup>
  );
  const tableHeader = showHeader ? (
    <ColumnSortableContext
      enabled={columnDragEnabled}
      items={leafColumns.map((item, index) => `column:${columnKey(item, index)}`)}
    >
      <thead>{renderHeaderRows()}</thead>
    </ColumnSortableContext>
  ) : null;
  const tableBody = (
    <>
      <RowSortableContext
        enabled={rowDragEnabled}
        items={allFlatRows.map(({ record }) => `row:${String(keyOf(record))}`)}
      >
        <tbody
          className={twMerge(bordered && "[&>tr:last-child>td]:border-b-transparent")}
        >
          {topPad > 0 && (
            <tr>
              <td
                className={cellLastNoRightBorder}
                colSpan={fullColSpan}
                style={{ height: topPad, padding: 0 }}
              />
            </tr>
          )}
          {renderedRows.map(renderRow)}
          {bottomPad > 0 && (
            <tr>
              <td
                className={cellLastNoRightBorder}
                colSpan={fullColSpan}
                style={{ height: bottomPad, padding: 0 }}
              />
            </tr>
          )}
          {!loadingVisible && allFlatRows.length === 0 && (
            <tr>
              <td
                className={twMerge(
                  emptyClass,
                  cellLastNoRightBorder,
                  "border-b",
                  bordered ? "border-transparent" : "border-[#f0f0f0]",
                )}
                colSpan={fullColSpan}
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </RowSortableContext>
    </>
  );
  const loadingElement = loadingVisible ? (
    <div className={loadingOverlayClass}>
      <div className={loadingContentClass}>
        <Icon icon="loading" size={24} />
        {loadingConfig?.text && <span>{loadingConfig.text}</span>}
      </div>
    </div>
  ) : null;
  const handleTableScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current)
      headerScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    if (virtual) setScrollTop(event.currentTarget.scrollTop);
    measureScrollBoundary(event.currentTarget);
    measureVerticalScrollbar(event.currentTarget);
    measureHorizontalScrollbar(event.currentTarget);
    measureStickyScrollbar(event.currentTarget);
    onScroll?.(event);
  };
  const scrollFromOverlayPosition = (top: number) => {
    const node = scrollRef.current;
    if (!node || !verticalScrollbar.visible) return;
    const maxThumbTop = Math.max(0, node.clientHeight - verticalScrollbar.height);
    const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
    node.scrollTop = maxThumbTop
      ? (Math.min(Math.max(top, 0), maxThumbTop) / maxThumbTop) * maxScrollTop
      : 0;
  };
  const handleScrollbarTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    scrollFromOverlayPosition(event.clientY - bounds.top - verticalScrollbar.height / 2);
  };
  const handleScrollbarThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    if (!node) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollbarDragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: node.scrollTop,
    };
  };
  const handleScrollbarThumbPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    const drag = scrollbarDragRef.current;
    if (!node || !drag || drag.pointerId !== event.pointerId) return;
    const maxThumbTop = Math.max(0, node.clientHeight - verticalScrollbar.height);
    const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
    if (!maxThumbTop || !maxScrollTop) return;
    node.scrollTop =
      drag.startScrollTop + ((event.clientY - drag.startY) / maxThumbTop) * maxScrollTop;
  };
  const handleScrollbarThumbPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (scrollbarDragRef.current?.pointerId !== event.pointerId) return;
    scrollbarDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const scrollFromHorizontalPosition = (left: number) => {
    const node = scrollRef.current;
    if (!node || !horizontalScrollbar.visible) return;
    const maxThumbLeft = Math.max(0, node.clientWidth - horizontalScrollbar.width);
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    node.scrollLeft = maxThumbLeft
      ? (Math.min(Math.max(left, 0), maxThumbLeft) / maxThumbLeft) * maxScrollLeft
      : 0;
    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = node.scrollLeft;
    measureScrollBoundary(node);
    measureHorizontalScrollbar(node);
    measureStickyScrollbar(node);
  };
  const handleHorizontalTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    scrollFromHorizontalPosition(event.clientX - bounds.left - horizontalScrollbar.width / 2);
  };
  const handleHorizontalThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    if (!node) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    horizontalScrollbarDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: node.scrollLeft,
    };
  };
  const handleHorizontalThumbPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    const drag = horizontalScrollbarDragRef.current;
    if (!node || !drag || drag.pointerId !== event.pointerId) return;
    const maxThumbLeft = Math.max(0, node.clientWidth - horizontalScrollbar.width);
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    if (!maxThumbLeft || !maxScrollLeft) return;
    node.scrollLeft =
      drag.startScrollLeft + ((event.clientX - drag.startX) / maxThumbLeft) * maxScrollLeft;
    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = node.scrollLeft;
    measureScrollBoundary(node);
    measureHorizontalScrollbar(node);
    measureStickyScrollbar(node);
  };
  const handleHorizontalThumbPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (horizontalScrollbarDragRef.current?.pointerId !== event.pointerId) return;
    horizontalScrollbarDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const scrollFromStickyPosition = (left: number) => {
    const node = scrollRef.current;
    if (!node || !stickyScrollbar.visible) return;
    const maxThumbLeft = Math.max(0, stickyScrollbar.width - stickyScrollbar.thumbWidth);
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    node.scrollLeft = maxThumbLeft
      ? (Math.min(Math.max(left, 0), maxThumbLeft) / maxThumbLeft) * maxScrollLeft
      : 0;
    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = node.scrollLeft;
    measureScrollBoundary(node);
    measureStickyScrollbar(node);
  };
  const handleStickyTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    scrollFromStickyPosition(event.clientX - bounds.left - stickyScrollbar.thumbWidth / 2);
  };
  const handleStickyThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    if (!node) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    stickyScrollbarDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: node.scrollLeft,
    };
  };
  const handleStickyThumbPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    const drag = stickyScrollbarDragRef.current;
    if (!node || !drag || drag.pointerId !== event.pointerId) return;
    const maxThumbLeft = Math.max(0, stickyScrollbar.width - stickyScrollbar.thumbWidth);
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    if (!maxThumbLeft || !maxScrollLeft) return;
    node.scrollLeft =
      drag.startScrollLeft + ((event.clientX - drag.startX) / maxThumbLeft) * maxScrollLeft;
    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = node.scrollLeft;
    measureScrollBoundary(node);
    measureStickyScrollbar(node);
  };
  const handleStickyThumbPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (stickyScrollbarDragRef.current?.pointerId !== event.pointerId) return;
    stickyScrollbarDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const horizontalScrollbarElement = horizontalScrollbar.visible ? (
    <div
      data-table-horizontal-scrollbar-track
      className="absolute bottom-0 left-0 z-20 h-2 cursor-pointer touch-none bg-transparent"
      style={{ width: horizontalScrollbar.viewportWidth }}
      onPointerDown={handleHorizontalTrackPointerDown}
    >
      <div
        data-table-horizontal-scrollbar-thumb
        className="absolute inset-y-0 h-2 cursor-grab touch-none rounded-full border border-transparent bg-[#a8a8a8] bg-clip-padding transition-colors hover:bg-[#8f8f8f] active:cursor-grabbing"
        style={{
          width: horizontalScrollbar.width,
          transform: `translateX(${horizontalScrollbar.left}px)`,
        }}
        onPointerDown={handleHorizontalThumbPointerDown}
        onPointerMove={handleHorizontalThumbPointerMove}
        onPointerUp={handleHorizontalThumbPointerEnd}
        onPointerCancel={handleHorizontalThumbPointerEnd}
      />
    </div>
  ) : null;
  const stickyScrollbarElement =
    stickyScrollBarEnabled && typeof document !== "undefined"
      ? createPortal(
          <div
            data-table-sticky-scrollbar
            className="fixed z-[1060] h-2 cursor-pointer touch-none bg-transparent"
            style={{
              left: stickyScrollbar.left,
              top: stickyScrollbar.top,
              width: stickyScrollbar.width,
              opacity: stickyScrollbar.visible ? 1 : 0,
              pointerEvents: stickyScrollbar.visible ? "auto" : "none",
            }}
            onPointerDown={handleStickyTrackPointerDown}
          >
            <div
              data-table-sticky-scrollbar-thumb
              className="absolute inset-y-0 h-2 cursor-grab touch-none rounded-full border border-transparent bg-[#a8a8a8] bg-clip-padding transition-colors hover:bg-[#8f8f8f] active:cursor-grabbing"
              style={{
                width: stickyScrollbar.thumbWidth,
                transform: `translateX(${stickyScrollbar.thumbLeft}px)`,
              }}
              onPointerDown={handleStickyThumbPointerDown}
              onPointerMove={handleStickyThumbPointerMove}
              onPointerUp={handleStickyThumbPointerEnd}
              onPointerCancel={handleStickyThumbPointerEnd}
            />
          </div>,
          document.body,
        )
      : null;
  const separatedHeaderElement = (
    <div
      ref={headerScrollRef}
      data-table-header-scroll
      data-table-sticky-header={stickyHeader ? "" : undefined}
      className="box-border w-full overflow-hidden rounded-t-[inherit] bg-white font-pretendard text-[14px] leading-[1.5715] text-[#111]"
      style={{
        paddingRight: verticalScrollbarWidth,
        position: stickyHeader ? "sticky" : undefined,
        top: stickyHeader ? normalizedStickyHeaderOffset : undefined,
        zIndex: stickyHeader ? 40 : undefined,
      }}
    >
      <table
        className={twMerge(
          "w-full border-separate border-spacing-0",
          gridBorderLayoutClass,
          bordered && borderedGridClass,
        )}
        style={verticallyScrolledTableStyle}
      >
        {renderColumnGroup()}
        {tableHeader}
      </table>
    </div>
  );

  return (
    <div
      {...rootProps}
      ref={rootRef}
      className={twMerge(
        "relative w-full min-w-0 font-pretendard text-[14px] leading-[1.5715] text-[#111] [overflow-anchor:none]",
        className,
        !textSelectable && "select-none",
      )}
      style={rootStyle}
    >
      {topPagination}
      <div
        className={twMerge(
          "w-full min-w-0 rounded-lg border border-transparent bg-white",
          bordered && "border-[#f0f0f0]",
        )}
      >
        <TableDragProvider
          enabled={rowDragEnabled || columnDragEnabled}
          onDragEnd={handleTableDragEnd}
        >
          {separateHeader ? (
            <div className="relative rounded-[inherit]">
              {showHeader && separatedHeaderElement}
              <div className="relative rounded-b-[inherit]">
                <div
                  ref={scrollRef}
                  data-table-scroll-container
                  data-table-overlay-scrollbar={overlayScrollbarSupported ? "" : undefined}
                  className={twMerge(
                    "relative w-full overflow-x-auto rounded-b-[inherit] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0062df]",
                    hasVerticalViewport ? "overflow-y-auto" : "overflow-y-hidden",
                    !showHeader && "rounded-t-[inherit]",
                  )}
                  tabIndex={0}
                  style={{ maxHeight: wrapperMaxHeight }}
                  onKeyDown={handleScrollKeyDown}
                  onScroll={handleTableScroll}
                >
                  <table
                    className={twMerge(
                      "w-full border-separate border-spacing-0",
                      gridBorderLayoutClass,
                      bordered && borderedGridClass,
                    )}
                    style={verticallyScrolledTableStyle}
                  >
                    {renderColumnGroup()}
                    {tableBody}
                  </table>
                  {loadingElement}
                </div>
                {horizontalScrollbarElement}
                {verticalScrollbar.visible && (
                  <div
                    data-table-overlay-scrollbar-track
                    className="absolute top-0 right-0 z-20 w-2 cursor-pointer touch-none"
                    style={{ height: verticalScrollbar.viewportHeight }}
                    onPointerDown={handleScrollbarTrackPointerDown}
                  >
                    <div
                      data-table-overlay-scrollbar-thumb
                      className="absolute right-px w-1.5 cursor-grab touch-none rounded-full bg-[#a8a8a8] hover:bg-[#8f8f8f] active:cursor-grabbing"
                      style={{
                        height: verticalScrollbar.height,
                        transform: `translateY(${verticalScrollbar.top}px)`,
                      }}
                      onPointerDown={handleScrollbarThumbPointerDown}
                      onPointerMove={handleScrollbarThumbPointerMove}
                      onPointerUp={handleScrollbarThumbPointerEnd}
                      onPointerCancel={handleScrollbarThumbPointerEnd}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative rounded-[inherit]">
              <div
                ref={scrollRef}
                data-table-scroll-container
                data-table-overlay-scrollbar={overlayScrollbarSupported ? "" : undefined}
                className="relative w-full overflow-x-auto overflow-y-hidden rounded-[inherit] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0062df]"
                tabIndex={hasHorizontalOverflow ? 0 : undefined}
                onKeyDown={handleScrollKeyDown}
                onScroll={handleTableScroll}
              >
                <table
                  className={twMerge(
                    "w-full border-separate border-spacing-0",
                    gridBorderLayoutClass,
                    bordered && borderedGridClass,
                  )}
                  style={tableStyle}
                >
                  {renderColumnGroup()}
                  {tableHeader}
                  {tableBody}
                </table>
                {loadingElement}
              </div>
              {horizontalScrollbarElement}
            </div>
          )}
        </TableDragProvider>
      </div>
      {stickyScrollbarElement}
      {bottomPagination}
    </div>
  );
}

type BodyCellProps<T extends object> = {
  item: ColumnType<T>;
  record: T;
  rowIndex: number;
  hoveredRowIndex: number | null;
  rowHoverable: boolean;
  fixedStyle: CSSProperties;
  width: CSSProperties["width"];
  minWidth: CSSProperties["minWidth"];
  className: string;
};

function BodyCell<T extends object>({
  item,
  record,
  rowIndex,
  hoveredRowIndex,
  rowHoverable,
  fixedStyle,
  width,
  minWidth,
  className,
}: BodyCellProps<T>) {
  const value = getValue(record, item.dataIndex);
  const cellProps = item.onCell?.(record, rowIndex) ?? {};
  const rendered = item.render ? item.render(value, record, rowIndex) : String(value ?? "");
  const mergedProps = cellProps;
  if (mergedProps.colSpan === 0 || mergedProps.rowSpan === 0) return null;
  const rowSpan = Number(mergedProps.rowSpan ?? 1);
  const mergedCellHovered =
    rowHoverable &&
    rowSpan > 1 &&
    hoveredRowIndex !== null &&
    hoveredRowIndex >= rowIndex &&
    hoveredRowIndex < rowIndex + rowSpan;
  return (
    <td
      {...mergedProps}
      title={mergedProps.title}
      className={twMerge(
        className,
        mergedCellHovered && "bg-[#f5f5f5]",
        item.ellipsis && "overflow-hidden",
        item.className,
        mergedProps.className,
      )}
      style={{
        width,
        minWidth,
        textAlign: item.align,
        ...fixedStyle,
        ...mergedProps.style,
      }}
    >
      {item.ellipsis ? (
        <Tooltip title={String(value ?? "")} className={ellipsisTooltipTriggerClass}>
          <span className={ellipsisClass}>{rendered}</span>
        </Tooltip>
      ) : (
        rendered
      )}
    </td>
  );
}

function FilterMenu<T extends object>({
  open,
  item,
  values,
  locale,
  trigger,
  className = "",
  onValues,
  onApply,
  onClose,
}: {
  open: boolean;
  item: ColumnType<T>;
  values: FilterKey[];
  locale: NonNullable<TableProps<T>["locale"]>;
  trigger?: HTMLElement;
  className?: string;
  onValues: (values: FilterKey[]) => void;
  onApply: (values: FilterKey[], closeDropdown?: boolean) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const radioName = `wizard-table-filter-${useId().replace(/:/g, "")}`;
  const motion = useMotionPresence(open);
  useEffect(() => {
    if (!open) return;
    const pointer = (event: PointerEvent) => {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !trigger?.contains(event.target as Node)
      )
        onClose();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        trigger?.focus();
        onClose();
      }
    };
    const scroll = (event: Event) => {
      const target = event.target;
      if (
        target instanceof Node &&
        (menuRef.current?.contains(target) || trigger?.contains(target))
      )
        return;
      onClose();
    };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", keyboard);
    window.addEventListener("scroll", scroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", keyboard);
      window.removeEventListener("scroll", scroll, true);
    };
  }, [onClose, open, trigger]);

  const confirm = () => onApply(values, true);
  const clearFilters = () => {
    const next = item.filterResetToDefault ? (item.defaultFilteredValue ?? []) : [];
    onValues(next);
  };
  const hasVisibleFilters = Boolean(
    item.filters?.some((filter) => matchesFilterSearch(filter, search)),
  );
  const content = (
    <>
      {item.filterSearch && (
        <Input
          autoFocus
          className={filterSearchClass}
          placeholder={locale.filterPlaceholder ?? "키워드를 입력해요"}
          value={search}
          onChange={setSearch}
        />
      )}
      <div className={filterOptionsClass}>
        {hasVisibleFilters ? (
          <FilterOptions
            items={item.filters ?? []}
            values={values}
            search={search}
            multiple={item.filterMultiple !== false}
            radioName={radioName}
            mode={item.filterMode ?? "menu"}
            onValues={onValues}
          />
        ) : (
          <div className={filterEmptyClass}>{locale.filterEmptyText ?? "검색결과가 없어요"}</div>
        )}
      </div>
      <div className={filterActionsClass}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 bg-transparent px-2 text-[#0062df] hover:bg-transparent"
          onClick={clearFilters}
        >
          {locale.filterReset ?? "초기화"}
        </Button>
        <Button size="md" onClick={() => confirm()}>
          {locale.filterConfirm ?? "확인"}
        </Button>
      </div>
    </>
  );
  const portalStyle = trigger
    ? (() => {
        const triggerRect = trigger.getBoundingClientRect();
        return {
          position: "fixed" as const,
          top: triggerRect.bottom + 4,
          left: triggerRect.left - 12,
        };
      })()
    : undefined;
  const menu = (
    <div
      ref={menuRef}
      className={twMerge(filterMenuClass, className)}
      style={{
        ...portalStyle,
        ...getPopupMotionStyle("bottomLeft", motion.motionVisible),
        pointerEvents: open ? undefined : "none",
      }}
      data-table-filter-motion
      onClick={(event) => event.stopPropagation()}
    >
      {content}
    </div>
  );
  if (!motion.rendered) return null;
  return typeof document === "undefined" ? menu : createPortal(menu, document.body);
}

function matchesFilterSearch(item: FilterItem, search: string): boolean {
  if (!search) return true;
  const matchesCurrent = String(item.text).toLowerCase().includes(search.toLowerCase());
  return (
    matchesCurrent || Boolean(item.children?.some((child) => matchesFilterSearch(child, search)))
  );
}

function FilterOptions({
  items,
  values,
  search,
  multiple,
  radioName,
  mode,
  onValues,
  depth = 0,
}: {
  items: FilterItem[];
  values: FilterKey[];
  search: string;
  multiple: boolean;
  radioName: string;
  mode: NonNullable<ColumnType<object>["filterMode"]>;
  onValues: (values: FilterKey[]) => void;
  depth?: number;
}) {
  const visible = items.filter((item) => matchesFilterSearch(item, search));
  return (
    <>
      {visible.map((item) => (
        <div key={String(item.value)}>
          {item.children?.length ? (
            <>
              <div
                className={filterGroupClass}
                style={{ paddingInlineStart: mode === "tree" ? depth * 12 : 8 }}
              >
                {item.text}
              </div>
              <FilterOptions
                items={item.children}
                values={values}
                search={search}
                multiple={multiple}
                radioName={radioName}
                mode={mode}
                onValues={onValues}
                depth={depth + 1}
              />
            </>
          ) : (
            <div
              className={filterOptionLabelClass}
              style={{ paddingInlineStart: 8 + (mode === "tree" ? depth * 12 : 0) }}
            >
              {multiple ? (
                <Checkbox
                  className="w-full"
                  label={item.text}
                  checked={values.includes(item.value)}
                  onChange={(event) =>
                    onValues(
                      event.target.checked
                        ? [...values, item.value]
                        : values.filter((value) => value !== item.value),
                    )
                  }
                />
              ) : (
                <Radio
                  className="w-full"
                  label={item.text}
                  name={radioName}
                  checked={values.includes(item.value)}
                  onChange={(event) => onValues(event.target.checked ? [item.value] : [])}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function DefaultEmpty() {
  return <Illustrations description="검색결과가 없어요" />;
}

type TableComponent = {
  <T extends object>(props: TableProps<T> & { ref?: React.Ref<TableRef> }): ReactElement;
  displayName?: string;
};

export const Table = forwardRef(InnerTable) as TableComponent;
Table.displayName = "Table";
