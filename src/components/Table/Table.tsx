/* oxlint-disable react/only-export-components -- The generic compound Table API is exported as one library component. */
import {
  forwardRef,
  Fragment,
  isValidElement,
  memo,
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
import { Radio } from "../Radio/Radio";
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
  ColumnTitleProps,
  ColumnType,
  ColumnsType,
  FilterItem,
  FilterKey,
  FilterValue,
  Key,
  PaginationConfig,
  PaginationPlacement,
  RenderedCell,
  RowSelectMethod,
  SortOrder,
  SorterResult,
  TableProps,
  TableRef,
} from "./Table.types";

type SortState<T> = { column: ColumnType<T>; key: string; order: SortOrder; priority: number };
type FlatRow<T> = { record: T; depth: number; parent?: Key };
const EMPTY_DATA_SOURCE: never[] = [];
const EMPTY_COLUMNS: never[] = [];

// ---- 스타일 상수 (wizard-design cva/Tailwind 컨벤션, GROO 색상) ----

const cellSizePad: Record<NonNullable<TableProps<object>["size"]>, string> = {
  large: "p-4",
  medium: "px-2 py-3",
  small: "p-2",
};

const cellBaseClass =
  "relative z-0 border-b border-[#f0f0f0] bg-white align-middle transition-colors";
const headerCellBaseClass = "bg-[#f5f5f5] text-left text-[14px] font-semibold text-[#111]";
const nestedHeaderBorderClass = "border-r border-[#e5e5e5]";
const headerCellSortedClass = "bg-[#eee]";
const cellLastNoRightBorder = "border-r-0";
const borderedGridClass =
  "[&>thead>tr>th:not(:last-child)]:border-r [&>thead>tr>th:not(:last-child)]:border-[#f0f0f0] [&>tbody>tr>td:not(:last-child)]:border-r [&>tbody>tr>td:not(:last-child)]:border-[#f0f0f0] [&>tfoot>tr>td:not(:last-child)]:border-r [&>tfoot>tr>td:not(:last-child)]:border-[#f0f0f0]";

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
const filterSearchClass =
  "mb-1.5 h-8 w-full rounded border border-[#ddd] bg-white px-[11px] text-[#111] outline-none transition-colors focus:border-[#0062df]";
const filterActionsClass =
  "mt-1.5 flex items-center justify-between gap-2 border-t border-[#f0f0f0] pt-2";

const ellipsisClass = "block w-full overflow-hidden text-ellipsis whitespace-nowrap";
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

function fixedSide(fixed?: ColumnType<object>["fixed"]) {
  if (fixed === true || fixed === "left" || fixed === "start") return "left";
  if (fixed === "right" || fixed === "end") return "right";
  return null;
}

function isRenderedCell<T>(value: ReactNode | RenderedCell<T>): value is RenderedCell<T> {
  return (
    value !== null &&
    !isValidElement(value) &&
    typeof value === "object" &&
    ("children" in value || "props" in value)
  );
}

function normalizePlacement(config: PaginationConfig): PaginationPlacement[] {
  if (config.placement?.length) return config.placement;
  if (!config.position?.length) return ["bottomEnd"];
  const map = {
    topLeft: "topStart",
    topCenter: "topCenter",
    topRight: "topEnd",
    bottomLeft: "bottomStart",
    bottomCenter: "bottomCenter",
    bottomRight: "bottomEnd",
    none: "none",
  } as const;
  return config.position.map((item) => map[item]);
}

function InnerTable<T extends object>(props: TableProps<T>, ref: React.ForwardedRef<TableRef>) {
  const {
    dataSource: sourceDataSource = EMPTY_DATA_SOURCE,
    columns: sourceColumns,
    rowKey = "key" as keyof T,
    pagination = {},
    rowSelection,
    rowDrag,
    columnDrag,
    expandable,
    bordered = false,
    loading = false,
    size = "large",
    locale = {},
    showHeader = true,
    showSorterTooltip = true,
    tableLayout = "fixed",
    rowClassName,
    rowHoverable = true,
    virtual = false,
    scroll,
    sortDirections = ["ascend", "descend"],
    className = "",
    style: rootStyle,
    getPopupContainer = () => document.body,
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
  const [verticalScrollbarWidth, setVerticalScrollbarWidth] = useState(0);

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
    typeof pagination === "object" ? (pagination.defaultCurrent ?? 1) : 1,
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
    () => new Set(rowSelection?.defaultSelectedRowKeys ?? []),
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(
    () => new Set(expandable?.defaultExpandedRowKeys ?? []),
  );
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollViewportWidth, setScrollViewportWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const [loadingVisible, setLoadingVisible] = useState(
    typeof loading === "boolean" ? loading : (loading.spinning ?? true),
  );
  const [scrollBoundary, setScrollBoundary] = useState({ left: false, right: false });
  const measureScrollBoundary = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    setScrollViewportWidth((current) =>
      current === node.clientWidth ? current : node.clientWidth,
    );
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
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

  const keyOf = useCallback(
    (record: T, index?: number): Key =>
      typeof rowKey === "function" ? rowKey(record, index) : (record[rowKey] as Key),
    [rowKey],
  );
  const childrenName = expandable?.childrenColumnName ?? "children";
  const controlledExpanded = expandable?.expandedRowKeys
    ? new Set(expandable.expandedRowKeys)
    : expandedKeys;
  const controlledSelected = rowSelection?.selectedRowKeys
    ? new Set(rowSelection.selectedRowKeys)
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
    allDataRows.forEach((record, index) =>
      selectionCache.current.set(keyOf(record, index), record),
    );
    if (!rowSelection?.preserveSelectedRowKeys && !rowSelection?.selectedRowKeys) {
      const available = new Set(allDataRows.map((record, index) => keyOf(record, index)));
      setSelectedKeys((current) => new Set([...current].filter((key) => available.has(key))));
    }
    // keyOf intentionally follows the current rowKey prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataRows, rowSelection?.preserveSelectedRowKeys, rowSelection?.selectedRowKeys]);

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
  const page = pageConfig?.current ?? internalPage;
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
      items.forEach((record, index) => {
        const key = keyOf(record, index);
        const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
        const childKeys = children?.map((child, childIndex) => keyOf(child, childIndex)) ?? [];
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
  const rowHeight = size === "small" ? 39 : size === "medium" ? 47 : 55;
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
        (record, index) => `row:${String(keyOf(record, index))}` === String(active.id),
      );
      const overIndex = dataSource.findIndex(
        (record, index) => `row:${String(keyOf(record, index))}` === String(over.id),
      );
      if (activeIndex < 0 || overIndex < 0) return;

      const nextDataSource = arrayMove(dataSource, activeIndex, overIndex);
      setDragDataSource(nextDataSource);
      rowDragConfig?.onChange?.(nextDataSource, {
        activeKey: keyOf(dataSource[activeIndex], activeIndex),
        overKey: keyOf(dataSource[overIndex], overIndex),
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
    action: "paginate" | "sort" | "filter",
    nextPage = safePage,
    nextPageSize = pageSize,
    nextFilters = activeFilters,
    nextSorts = activeSorts,
  ) => {
    const sorterInfo: SorterResult<T>[] = nextSorts
      .filter((item) => item.order)
      .map((item) => ({
        column: item.column,
        columnKey: item.key,
        field: item.column.dataIndex as Key | readonly Key[] | undefined,
        order: item.order,
      }));
    const reportedFilters = Object.fromEntries(
      leafColumns.flatMap((item, index) => {
        const key = columnKey(item, index);
        return item.filters?.length ||
          item.filteredValue !== undefined ||
          item.defaultFilteredValue !== undefined
          ? [[key, nextFilters[key]?.length ? nextFilters[key] : null]]
          : [];
      }),
    ) as Record<string, FilterValue>;
    onChange?.(
      { ...pageConfig, current: nextPage, pageSize: nextPageSize, total },
      reportedFilters,
      sorterInfo.length > 1 ? sorterInfo : (sorterInfo[0] ?? {}),
      { currentDataSource: processData(dataSource, nextFilters, nextSorts), action },
    );
  };

  const changePage = (next: number, nextSize = pageSize) => {
    const bounded = Math.max(1, Math.min(Math.max(1, Math.ceil(total / nextSize)), next));
    setInternalPage(bounded);
    setInternalPageSize(nextSize);
    pageConfig?.onChange?.(bounded, nextSize);
    emitChange("paginate", bounded, nextSize);
    if (
      scroll?.scrollToFirstRowOnChange !== false &&
      typeof scrollRef.current?.scrollTo === "function"
    )
      scrollRef.current.scrollTo({ top: 0 });
  };

  const toggleSort = (item: ColumnType<T>, index: number) => {
    if (!item.sorter || item.sortOrder !== undefined) return;
    const key = columnKey(item, index);
    const current = sortStates.find((state) => state.key === key)?.order ?? null;
    const directions = item.sortDirections ?? sortDirections;
    const cycle = directions.includes(null) ? directions : [...directions, null];
    const nextOrder = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    const priority = typeof item.sorter === "object" ? (item.sorter.multiple ?? 0) : 0;
    const next = priority
      ? [
          ...sortStates.filter((state) => state.key !== key),
          { column: item, key, order: nextOrder, priority },
        ]
      : [{ column: item, key, order: nextOrder, priority }];
    setSortStates(next.filter((state) => state.order));
    emitChange("sort", safePage, pageSize, activeFilters, next);
    if (
      scroll?.scrollToFirstRowOnChange !== false &&
      typeof scrollRef.current?.scrollTo === "function"
    )
      scrollRef.current.scrollTo({ top: 0 });
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
    emitChange("filter", 1, pageSize, next);
    if (
      scroll?.scrollToFirstRowOnChange !== false &&
      typeof scrollRef.current?.scrollTo === "function"
    )
      scrollRef.current.scrollTo({ top: 0 });
  };

  const closeFilter = (item: ColumnType<T>, index: number) => {
    const key = columnKey(item, index);
    if (item.filterOnClose !== false)
      applyFilter(item, index, filterDraft[key] ?? activeFilters[key] ?? []);
    else {
      setFilterOpen(null);
    }
  };

  const updateSelection = (next: Set<Key>, type: RowSelectMethod) => {
    if (!rowSelection?.selectedRowKeys) setSelectedKeys(next);
    const source = rowSelection?.preserveSelectedRowKeys
      ? [...selectionCache.current.values()]
      : allDataRows;
    const selectedRows = source.filter((row) => next.has(keyOf(row)));
    rowSelection?.onChange?.([...next], selectedRows, { type });
    return selectedRows;
  };

  const changeableRows = pageSelectionRows.filter(
    (record) => !rowSelection?.getCheckboxProps?.(record).disabled,
  );
  const changeableKeys = changeableRows.map((record) => keyOf(record));
  const allChecked =
    changeableKeys.length > 0 && changeableKeys.every((key) => controlledSelected.has(key));
  const partlyChecked = !allChecked && changeableKeys.some((key) => controlledSelected.has(key));
  const selectAll = (selected: boolean) => {
    const next = new Set(controlledSelected);
    changeableKeys.forEach((key) => (selected ? next.add(key) : next.delete(key)));
    updateSelection(next, selected ? "all" : "none");
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
    if (!expandable?.expandedRowKeys) setExpandedKeys(next);
    expandable?.onExpand?.(expanded, record);
    expandable?.onExpandedRowsChange?.([...next]);
  };

  const dragWidth = rowDragEnabled ? Number(rowDragConfig?.columnWidth ?? 48) : 0;
  const selectionWidth = rowSelection ? Number(rowSelection.columnWidth ?? 48) : 0;
  const expandWidth =
    expandable && expandable.showExpandColumn !== false ? Number(expandable.columnWidth ?? 48) : 0;
  const leftOffsets = useMemo(() => {
    let offset = dragWidth + selectionWidth + expandWidth;
    const map: Record<string, number> = {};
    leafColumns.forEach((item, index) => {
      if (fixedSide(item.fixed as ColumnType<object>["fixed"]) === "left") {
        map[columnKey(item, index)] = offset;
        offset += Number(item.width ?? 120);
      }
    });
    return map;
  }, [dragWidth, expandWidth, leafColumns, selectionWidth]);
  const rightOffsets = useMemo(() => {
    let offset =
      fixedSide(expandable?.fixed as ColumnType<object>["fixed"]) === "right" ? expandWidth : 0;
    const map: Record<string, number> = {};
    [...leafColumns].reverse().forEach((item, reverseIndex) => {
      const index = leafColumns.length - reverseIndex - 1;
      if (fixedSide(item.fixed as ColumnType<object>["fixed"]) === "right") {
        map[columnKey(item, index)] = offset;
        offset += Number(item.width ?? 120);
      }
    });
    return map;
  }, [expandWidth, expandable?.fixed, leafColumns]);
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
  const selectionFixedStyle: CSSProperties =
    fixedSide(rowSelection?.fixed as ColumnType<object>["fixed"]) === "left"
      ? { position: "sticky", left: dragWidth, zIndex: 3 }
      : {};
  const selectionHeaderFixedStyle: CSSProperties = selectionFixedStyle.position
    ? { ...selectionFixedStyle, zIndex: 7 }
    : selectionFixedStyle;
  const expandSide = fixedSide(expandable?.fixed as ColumnType<object>["fixed"]);
  const expandFixedStyle: CSSProperties =
    expandSide === "left"
      ? { position: "sticky", left: dragWidth + selectionWidth, zIndex: 3 }
      : expandSide === "right"
        ? { position: "sticky", right: 0, zIndex: 3 }
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
  const selectionSide = fixedSide(rowSelection?.fixed as ColumnType<object>["fixed"]);
  const selectionBoundaryClass =
    selectionSide === "left" && expandSide !== "left" && lastLeftFixedIndex < 0
      ? twMerge(
          fixedLeftLastShadowBaseClass,
          scrollBoundary.left && fixedLeftLastShadowVisibleClass,
          "sticky",
        )
      : selectionSide === "right" && expandSide !== "right" && firstRightFixedIndex < 0
        ? twMerge(
            fixedRightFirstShadowBaseClass,
            scrollBoundary.right && fixedRightFirstShadowVisibleClass,
            "sticky",
          )
        : selectionSide
          ? "sticky"
          : "";
  const expandBoundaryClass =
    expandSide === "left" && lastLeftFixedIndex < 0
      ? twMerge(
          fixedLeftLastShadowBaseClass,
          scrollBoundary.left && fixedLeftLastShadowVisibleClass,
          "sticky",
        )
      : expandSide === "right" && firstRightFixedIndex < 0
        ? twMerge(
            fixedRightFirstShadowBaseClass,
            scrollBoundary.right && fixedRightFirstShadowVisibleClass,
            "sticky",
          )
        : expandSide
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
              ? allFlatRows.findIndex((item, itemIndex) => keyOf(item.record, itemIndex) === key)
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

  const columnTitleProps: ColumnTitleProps<T> = {
    sortColumns: activeSorts
      .filter((state) => state.order)
      .map((state) => ({ column: state.column, order: state.order })),
    filters: activeFilters as Record<string, FilterValue>,
  };
  columnTitleProps.sortOrder = columnTitleProps.sortColumns[0]?.order;
  columnTitleProps.sortColumn = columnTitleProps.sortColumns[0]?.column;
  const renderTitle = (item: ColumnType<T>) =>
    typeof item.title === "function" ? item.title(columnTitleProps) : item.title;
  const nextSortLabel = (item: ColumnType<T>, order: SortOrder) => {
    const directions = item.sortDirections ?? sortDirections;
    const cycle = directions.includes(null) ? directions : [...directions, null];
    const next = cycle[(cycle.indexOf(order) + 1) % cycle.length];
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
            const tooltip = item.showSorterTooltip ?? showSorterTooltip;
            const tooltipTitle =
              typeof tooltip === "object" && tooltip.title
                ? String(tooltip.title)
                : (locale.sortTitle ?? nextSortLabel(item, order));
            const headerProps = item.onHeaderCell?.(item, leafIndex) ?? {};
            const itemLeaves = item.children?.length ? flattenColumns(item.children) : [item];
            const visualLastIndex = leafColumns.indexOf(itemLeaves[itemLeaves.length - 1]);
            const resolvedColSpan = item.children?.length ? leafCount(item) : item.colSpan;
            const filterIsOpen = filterOpen === key;
            if (resolvedColSpan === 0 || item.rowSpan === 0) return;
            const draggableColumn = columnDragEnabled && depth === 1 && !item.children;
            const RenderedHeaderCell: React.ElementType = draggableColumn
              ? SortableTableHeaderCell
              : "th";
            cells.push(
              <RenderedHeaderCell
                key={`${headerPath}-${key}-${level}`}
                {...(draggableColumn ? { component: "th", dragId: `column:${key}` } : {})}
                colSpan={resolvedColSpan}
                rowSpan={item.children?.length ? 1 : (item.rowSpan ?? depth - level)}
                {...headerProps}
                title={
                  tooltip &&
                  item.sorter &&
                  (typeof tooltip !== "object" || tooltip.target !== "sorter-icon")
                    ? tooltipTitle
                    : headerProps.title
                }
                style={{
                  width: item.width,
                  minWidth: tableLayout === "auto" ? item.minWidth : undefined,
                  textAlign: item.align,
                  ...(!item.children ? headerFixedStyle(item, leafIndex) : {}),
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
                <span
                  className={twMerge(
                    headerContentClass,
                    item.sorter && "cursor-pointer select-none",
                  )}
                  onClick={item.sorter ? () => toggleSort(item, leafIndex) : undefined}
                >
                  <span>{renderTitle(item)}</span>
                  {item.sorter && !item.children && (
                    <button
                      type="button"
                      className={iconButtonClass}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSort(item, leafIndex);
                      }}
                      aria-label={`${String(renderTitle(item))} 정렬`}
                      title={
                        tooltip && typeof tooltip === "object" && tooltip.target === "sorter-icon"
                          ? tooltipTitle
                          : undefined
                      }
                    >
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
                    </button>
                  )}
                  {item.filters?.length && !item.children ? (
                    <span className={filterWrapClass}>
                      <button
                        ref={(node) => {
                          if (node) filterTriggers.current.set(key, node);
                          else filterTriggers.current.delete(key);
                        }}
                        type="button"
                        className={twMerge(
                          iconButtonClass,
                          (item.filtered || activeFilters[key]?.length) && iconButtonActiveClass,
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
                        aria-label={`${String(renderTitle(item))} 필터`}
                        aria-haspopup="dialog"
                        aria-expanded={filterIsOpen}
                      >
                        <Icon icon="filter" size={14} />
                      </button>
                      {filterIsOpen && (
                        <FilterMenu
                          item={item}
                          values={filterDraft[key] ?? []}
                          locale={locale}
                          trigger={filterTriggers.current.get(key)}
                          popupContainer={
                            filterTriggers.current.get(key) &&
                            getPopupContainer?.(filterTriggers.current.get(key)!)
                          }
                          onValues={(values) =>
                            setFilterDraft((draft) => ({ ...draft, [key]: values }))
                          }
                          onApply={(values) => applyFilter(item, leafIndex, values)}
                          onClose={() => closeFilter(item, leafIndex)}
                        />
                      )}
                    </span>
                  ) : null}
                </span>
              </RenderedHeaderCell>,
            );
          } else if (item.children?.length) visit(item.children, current + 1, headerPath);
        });
      visit(responsiveColumns, 0);

      const selectionTitle =
        rowSelection && rowSelection.type !== "radio" && !rowSelection.hideSelectAll ? (
          <Checkbox
            aria-label="모든 행 선택"
            checked={allChecked}
            indeterminate={partlyChecked}
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
                width: rowDragConfig?.columnWidth ?? 48,
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
                width: rowSelection.columnWidth ?? 48,
                textAlign: rowSelection.align,
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
              style={{ width: expandable.columnWidth ?? 48, ...expandHeaderFixedStyle }}
            >
              {expandable.columnTitle ?? (
                <span className="sr-only">{locale.expand ?? "행 펼치기"}</span>
              )}
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
    const key = keyOf(record, actualIndex);
    const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
    const canExpand =
      Boolean(children?.length || expandable?.expandedRowRender) &&
      (expandable?.rowExpandable?.(record) ?? true);
    const expanded = controlledExpanded.has(key);
    const rowProps = onRow?.(record, actualIndex) ?? {};
    const customClass = rowClassName?.(record, actualIndex, depth) ?? "";
    const rowClass = twMerge(
      depth > 0 && "[&>td]:bg-[#fafafa]",
      rowHoverable && "hover:[&>td]:bg-[#f5f5f5]",
      controlledSelected.has(key) && "[&>td]:bg-[#eef0f8] hover:[&>td]:bg-[#e3e7f5]",
      customClass,
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
          "aria-label": checkboxProps["aria-label"] ?? `${String(key)} 행 선택`,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            const next = selection.type === "radio" ? new Set<Key>() : new Set(controlledSelected);
            if (selection.checkStrictly === false && selection.type !== "radio")
              conductTreeSelection(next, record, event.target.checked);
            else if (event.target.checked) next.add(key);
            else next.delete(key);
            updateSelection(next, selection.type === "radio" ? "single" : "multiple");
          },
        }
      : null;
    const originSelectionNode =
      selection && selectionInputProps ? (
        selection.type === "radio" ? (
          <Radio {...selectionInputProps} />
        ) : (
          <Checkbox {...selectionInputProps} indeterminate={treeSelectionIndeterminate(key)} />
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
        >
          {rowDragEnabled && (
            <td
              className={twMerge(cellBaseClass, cellSizePad[size], dragCellClass)}
              style={{
                width: rowDragConfig?.columnWidth ?? 48,
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
                width: rowSelection.columnWidth ?? 48,
                textAlign: rowSelection.align,
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
              style={{ width: expandable.columnWidth ?? 48, ...expandFixedStyle }}
            >
              <span
                className={expandIndentClass}
                style={{ paddingInlineStart: 15 + depth * (expandable.indentSize ?? 15) }}
              >
                {canExpand ? (
                  <button
                    type="button"
                    className={expandButtonClass}
                    aria-expanded={expanded}
                    aria-label={
                      expanded ? (locale.collapse ?? "행 접기") : (locale.expand ?? "행 펼치기")
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleExpand(record);
                    }}
                  >
                    <Icon icon={expanded ? "remove" : "add"} size={12} />
                  </button>
                ) : (
                  <span className={expandPlaceholderClass} aria-hidden />
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
              fixedStyle={fixedStyle(item, columnIndex)}
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
              {expandable.expandedRowRender(record, actualIndex, depth, expanded)}
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  const placements = pageConfig
    ? normalizePlacement(pageConfig).filter((item) => item !== "none")
    : [];
  const renderPagination = (placement: PaginationPlacement) =>
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
  const effectiveLayout =
    tableLayout === "fixed" || scroll?.x || leafColumns.some((item) => item.ellipsis || item.fixed)
      ? "fixed"
      : "auto";
  const flexibleColumnCount = leafColumns.filter((item) => item.width == null).length;
  const canDistributeFixedWidth =
    effectiveLayout === "fixed" &&
    flexibleColumnCount > 0 &&
    leafColumns.every((item) => item.width == null || typeof item.width === "number") &&
    [dragWidth, selectionWidth, expandWidth].every(Number.isFinite);
  const fixedPixelWidth = canDistributeFixedWidth
    ? dragWidth +
      selectionWidth +
      expandWidth +
      leafColumns.reduce(
        (total, item) => total + (typeof item.width === "number" ? item.width : 0),
        0,
      )
    : 0;
  const flexibleMinimumWidth = canDistributeFixedWidth
    ? leafColumns.reduce(
        (total, item) => total + (item.width == null ? (item.minWidth ?? 0) : 0),
        0,
      )
    : 0;
  const minimumFixedTableWidth = fixedPixelWidth + flexibleMinimumWidth;
  const requestedFixedLayoutWidth =
    typeof scroll?.x === "number"
      ? Math.max(scroll.x, scrollViewportWidth)
      : scroll?.x
        ? 0
        : scrollViewportWidth;
  const fixedLayoutWidth = Math.max(requestedFixedLayoutWidth, minimumFixedTableWidth);
  const flexibleExtraWidth =
    canDistributeFixedWidth && fixedLayoutWidth > minimumFixedTableWidth
      ? (fixedLayoutWidth - minimumFixedTableWidth) / flexibleColumnCount
      : undefined;
  const emptyText =
    typeof locale.emptyText === "function"
      ? locale.emptyText()
      : (locale.emptyText ?? <DefaultEmpty />);
  const loadingConfig = typeof loading === "object" ? loading : undefined;
  const wrapperMaxHeight = scroll?.y;

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      setScrollBoundary({ left: false, right: false });
      setVerticalScrollbarWidth(0);
      return;
    }
    const measure = () => {
      measureScrollBoundary(node);
      setVerticalScrollbarWidth(scroll?.y ? node.offsetWidth - node.clientWidth : 0);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    const table = node.querySelector("table");
    if (table) observer.observe(table);
    return () => observer.disconnect();
  }, [leafColumns, measureScrollBoundary, pageData.length, scroll?.x, scroll?.y]);

  const hasHorizontalOverflow = scrollBoundary.left || scrollBoundary.right;
  const tableStyle: CSSProperties = {
    tableLayout: effectiveLayout,
    minWidth:
      typeof scroll?.x === "number"
        ? Math.max(scroll.x, minimumFixedTableWidth)
        : scroll?.x === "max-content"
          ? "max-content"
          : minimumFixedTableWidth || undefined,
  };
  const renderColumnGroup = () => (
    <colgroup>
      {rowDragEnabled && <col style={{ width: rowDragConfig?.columnWidth ?? 48 }} />}
      {rowSelection && <col style={{ width: rowSelection.columnWidth ?? 48 }} />}
      {expandable && expandable.showExpandColumn !== false && (
        <col style={{ width: expandable.columnWidth ?? 48 }} />
      )}
      {leafColumns.map((item, index) => (
        <col
          key={columnKey(item, index)}
          style={{
            width:
              item.width ??
              (flexibleExtraWidth == null
                ? item.minWidth
                : (item.minWidth ?? 0) + flexibleExtraWidth),
            minWidth: effectiveLayout === "auto" ? item.minWidth : undefined,
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
        items={allFlatRows.map(({ record }, index) => `row:${String(keyOf(record, index))}`)}
      >
        <tbody className={twMerge(bordered && "[&>tr:last-child>td]:border-b-0")}>
          {topPad > 0 && (
            <tr aria-hidden>
              <td
                className={cellLastNoRightBorder}
                colSpan={fullColSpan}
                style={{ height: topPad, padding: 0 }}
              />
            </tr>
          )}
          {renderedRows.map(renderRow)}
          {bottomPad > 0 && (
            <tr aria-hidden>
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
                  !bordered && "border-b border-[#f0f0f0]",
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
    <div
      className={twMerge(loadingOverlayClass, loadingConfig?.className)}
      style={loadingConfig?.style}
    >
      <div className={loadingContentClass}>
        {loadingConfig?.indicator ?? <Icon icon="loading" size={24} />}
        {loadingConfig?.tip && <span>{loadingConfig.tip}</span>}
        <span className="sr-only">로딩 중</span>
      </div>
    </div>
  ) : null;
  const handleTableScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    if (headerScrollRef.current)
      headerScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
    if (virtual) setScrollTop(event.currentTarget.scrollTop);
    measureScrollBoundary(event.currentTarget);
    onScroll?.(event);
  };

  return (
    <div
      {...rootProps}
      ref={rootRef}
      className={twMerge(
        "relative w-full font-pretendard text-[14px] leading-[1.5715] text-[#111]",
        className,
      )}
      style={rootStyle}
      aria-busy={loadingVisible}
    >
      {topPagination}
      <div className={twMerge("w-full rounded-lg bg-white", bordered && "border border-[#f0f0f0]")}>
        <TableDragProvider
          enabled={rowDragEnabled || columnDragEnabled}
          onDragEnd={handleTableDragEnd}
        >
          {scroll?.y ? (
            <div className="relative rounded-[inherit]">
              {showHeader && (
                <div
                  ref={headerScrollRef}
                  data-table-header-scroll
                  className="w-full overflow-hidden rounded-t-[inherit] bg-white"
                  style={{ paddingRight: verticalScrollbarWidth }}
                >
                  <table
                    className={twMerge(
                      "w-full border-separate border-spacing-0",
                      bordered && borderedGridClass,
                    )}
                    style={tableStyle}
                  >
                    {renderColumnGroup()}
                    {tableHeader}
                  </table>
                </div>
              )}
              <div
                ref={scrollRef}
                data-table-scroll-container
                className={twMerge(
                  "relative w-full overflow-auto rounded-b-[inherit] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0062df]",
                  !showHeader && "rounded-t-[inherit]",
                )}
                role="region"
                aria-label="테이블 스크롤 영역"
                tabIndex={0}
                style={{ maxHeight: wrapperMaxHeight }}
                onKeyDown={handleScrollKeyDown}
                onScroll={handleTableScroll}
              >
                <table
                  className={twMerge(
                    "w-full border-separate border-spacing-0",
                    bordered && borderedGridClass,
                  )}
                  style={tableStyle}
                >
                  {renderColumnGroup()}
                  {tableBody}
                </table>
                {loadingElement}
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              data-table-scroll-container
              className="relative w-full overflow-x-auto overflow-y-hidden rounded-[inherit] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0062df]"
              role={scroll?.x || hasHorizontalOverflow ? "region" : undefined}
              aria-label={scroll?.x || hasHorizontalOverflow ? "테이블 스크롤 영역" : undefined}
              tabIndex={scroll?.x || hasHorizontalOverflow ? 0 : undefined}
              onKeyDown={handleScrollKeyDown}
              onScroll={handleTableScroll}
            >
              <table
                className={twMerge(
                  "w-full border-separate border-spacing-0",
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
          )}
        </TableDragProvider>
      </div>
      {bottomPagination}
    </div>
  );
}

type BodyCellProps<T extends object> = {
  item: ColumnType<T>;
  record: T;
  rowIndex: number;
  fixedStyle: CSSProperties;
  className: string;
};

function BodyCellInner<T extends object>({
  item,
  record,
  rowIndex,
  fixedStyle,
  className,
}: BodyCellProps<T>) {
  const value = getValue(record, item.dataIndex);
  const cellProps = item.onCell?.(record, rowIndex) ?? {};
  const rendered = item.render ? item.render(value, record, rowIndex) : String(value ?? "");
  const renderedCell = isRenderedCell(rendered) ? rendered : null;
  const mergedProps = { ...cellProps, ...renderedCell?.props };
  if (mergedProps.colSpan === 0 || mergedProps.rowSpan === 0) return null;
  return (
    <td
      {...mergedProps}
      scope={item.rowScope}
      title={
        item.ellipsis && (typeof item.ellipsis === "boolean" || item.ellipsis.showTitle !== false)
          ? String(value ?? "")
          : mergedProps.title
      }
      className={twMerge(className, item.className, mergedProps.className)}
      style={{
        width: item.width,
        minWidth: item.minWidth,
        textAlign: item.align,
        ...fixedStyle,
        ...mergedProps.style,
      }}
    >
      {item.ellipsis ? (
        <span className={ellipsisClass}>
          {renderedCell ? renderedCell.children : (rendered as ReactNode)}
        </span>
      ) : renderedCell ? (
        renderedCell.children
      ) : (
        (rendered as ReactNode)
      )}
    </td>
  );
}

const BodyCell = memo(BodyCellInner, (previous, next) => {
  if (
    previous.item !== next.item ||
    previous.rowIndex !== next.rowIndex ||
    previous.className !== next.className
  )
    return false;
  return next.item.shouldCellUpdate
    ? !next.item.shouldCellUpdate(next.record, previous.record)
    : false;
}) as typeof BodyCellInner;

function FilterMenu<T extends object>({
  item,
  values,
  locale,
  trigger,
  popupContainer,
  className = "",
  onValues,
  onApply,
  onClose,
}: {
  item: ColumnType<T>;
  values: FilterKey[];
  locale: NonNullable<TableProps<T>["locale"]>;
  trigger?: HTMLElement;
  popupContainer?: HTMLElement;
  className?: string;
  onValues: (values: FilterKey[]) => void;
  onApply: (values: FilterKey[], closeDropdown?: boolean) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const radioName = `wizard-table-filter-${useId().replace(/:/g, "")}`;
  useEffect(() => {
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
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", keyboard);
    };
  }, [onClose, trigger]);

  const confirm = () => onApply(values, true);
  const clearFilters = () => {
    const next = item.filterResetToDefaultFilteredValue ? (item.defaultFilteredValue ?? []) : [];
    onValues(next);
  };
  const content = (
    <>
      {item.filterSearch && (
        <input
          autoFocus
          className={filterSearchClass}
          placeholder={locale.filterSearchPlaceholder ?? "필터 검색"}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}
      <div className={filterOptionsClass}>
        {item.filters?.length ? (
          <FilterOptions
            items={item.filters}
            values={values}
            search={search}
            multiple={item.filterMultiple !== false}
            radioName={radioName}
            filterSearch={item.filterSearch}
            onValues={onValues}
          />
        ) : (
          <div className={filterEmptyClass}>{locale.filterEmptyText ?? "필터 없음"}</div>
        )}
      </div>
      <div className={filterActionsClass}>
        <button
          type="button"
          className="h-6 cursor-pointer border-0 bg-transparent px-2 text-[#0062df]"
          onClick={clearFilters}
        >
          {locale.filterReset ?? "초기화"}
        </button>
        <Button size="md" onClick={() => confirm()}>
          {locale.filterConfirm ?? "확인"}
        </Button>
      </div>
    </>
  );
  const portalStyle =
    popupContainer && trigger
      ? (() => {
          const triggerRect = trigger.getBoundingClientRect();
          const containerRect =
            popupContainer === document.body
              ? { top: 0, left: 0 }
              : popupContainer.getBoundingClientRect();
          return {
            position: popupContainer === document.body ? ("fixed" as const) : ("absolute" as const),
            top: triggerRect.bottom - containerRect.top + 4,
            left: triggerRect.left - containerRect.left - 12,
          };
        })()
      : undefined;
  const menu = (
    <div
      ref={menuRef}
      className={twMerge(filterMenuClass, className)}
      style={portalStyle}
      role="dialog"
      aria-label={locale.filterTitle ?? "필터 메뉴"}
      onClick={(event) => event.stopPropagation()}
    >
      {content}
    </div>
  );
  return popupContainer ? createPortal(menu, popupContainer) : menu;
}

function FilterOptions({
  items,
  values,
  search,
  multiple,
  radioName,
  filterSearch,
  onValues,
  depth = 0,
}: {
  items: FilterItem[];
  values: FilterKey[];
  search: string;
  multiple: boolean;
  radioName: string;
  filterSearch?: ColumnType<object>["filterSearch"];
  onValues: (values: FilterKey[]) => void;
  depth?: number;
}) {
  const visible = items.filter(
    (item) =>
      !search ||
      (typeof filterSearch === "function"
        ? filterSearch(search, item)
        : String(item.text).toLowerCase().includes(search.toLowerCase()) ||
          item.children?.some((child) =>
            String(child.text).toLowerCase().includes(search.toLowerCase()),
          )),
  );
  return (
    <>
      {visible.map((item) => (
        <div key={String(item.value)}>
          {item.children?.length ? (
            <>
              <div className={filterGroupClass} style={{ paddingInlineStart: depth * 12 }}>
                {item.text}
              </div>
              <FilterOptions
                items={item.children}
                values={values}
                search={search}
                multiple={multiple}
                radioName={radioName}
                filterSearch={filterSearch}
                onValues={onValues}
                depth={depth + 1}
              />
            </>
          ) : (
            <div className={filterOptionLabelClass} style={{ paddingInlineStart: 8 + depth * 12 }}>
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
  return <Illustrations description="데이터가 없어요" />;
}

type TableComponent = {
  <T extends object>(props: TableProps<T> & { ref?: React.Ref<TableRef> }): ReactElement;
  displayName?: string;
};

export const Table = forwardRef(InnerTable) as TableComponent;
Table.displayName = "Table";
