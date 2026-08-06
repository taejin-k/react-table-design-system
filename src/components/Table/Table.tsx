/* oxlint-disable react/only-export-components -- The generic compound Table API is exported as one library component. */
import {
  Children,
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
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { breakpointWidths, columnKey, flattenColumns, getValue, leafCount, maxDepth } from "./Table.utils";
import { Pagination } from "./Pagination";
import type {
  ColumnTitleProps,
  ColumnType,
  ColumnsType,
  FilterDropdownProps,
  FilterItem,
  FilterKey,
  FilterValue,
  Key,
  PaginationConfig,
  PaginationPlacement,
  RenderedCell,
  RowSelectMethod,
  SelectionItem,
  SortOrder,
  SorterResult,
  TableProps,
  TableRef,
  TableColumnGroupProps,
  TableColumnProps,
  TableSummaryCellProps,
  TableSummaryProps,
  TableSummaryRowProps,
  TableSemanticClassNames,
  TableSemanticStyles,
} from "./Table.types";

type SortState<T> = { column: ColumnType<T>; key: string; order: SortOrder; priority: number };
type FlatRow<T> = { record: T; depth: number; parent?: Key };
type CellComponent = React.ElementType;

const EMPTY_CLASS_NAMES: TableSemanticClassNames = {};
const EMPTY_STYLES: TableSemanticStyles = {};
const SELECTION_ALL: SelectionItem = { key: "all", text: "Select all data" };
const SELECTION_INVERT: SelectionItem = { key: "invert", text: "Invert current page" };
const SELECTION_NONE: SelectionItem = { key: "none", text: "Select none" };

// ---- 스타일 상수 (wizard-design cva/Tailwind 컨벤션, GROO 색상) ----

const cellSizePad: Record<NonNullable<TableProps<object>["size"]>, string> = {
  large: "p-4",
  medium: "px-2 py-3",
  small: "p-2",
};

const cellBaseClass = "relative z-0 border-b border-[#f0f0f0] bg-white align-middle transition-colors";
const headerCellBaseClass = "bg-[#f5f5f5] text-left text-[14px] font-semibold text-[#111]";
const nestedHeaderBorderClass = "border-r border-[#e5e5e5]";
const headerCellSortedClass = "bg-[#eee]";
const lastCellClass = "table-cell";
const cellLastNoRightBorder = "border-r-0";

const checkboxClass =
  "relative m-0 size-4 shrink-0 cursor-pointer appearance-none rounded border border-[#ddd] bg-white bg-[length:12px_12px] bg-center bg-no-repeat transition-colors hover:border-[#0062df] checked:border-[#0062df] checked:bg-[#0062df] checked:bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221.7%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m2.2%206.1%202.3%202.3%205.3-5.2%22%2F%3E%3C%2Fsvg%3E')] indeterminate:border-[#0062df] indeterminate:bg-[#0062df] indeterminate:bg-[image:url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221.7%22%20stroke-linecap%3D%22round%22%20d%3D%22M3%206h6%22%2F%3E%3C%2Fsvg%3E')] disabled:cursor-not-allowed disabled:border-[#ddd] disabled:bg-[#f5f5f5] disabled:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df]";
const radioClass =
  "relative m-0 size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-[#ddd] bg-white transition-colors hover:border-[#0062df] checked:border-[#0062df] checked:bg-[#0062df] checked:shadow-[inset_0_0_0_4px_white] disabled:cursor-not-allowed disabled:border-[#ddd] disabled:bg-[#f5f5f5] disabled:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df]";

const headerContentClass = "inline-flex min-w-0 items-center gap-0.5";
const selectionCellClass = "!px-4 text-center";
const expandCellClass = "!px-4 text-center";
const expandCellBodyClass = "!px-0 text-start";
const expandIndentClass = "flex min-h-[17px] items-center";
const selectionHeadClass = "relative inline-flex items-center";

const iconButtonClass =
  "inline-grid size-6 cursor-pointer place-items-center rounded border-0 bg-transparent p-0 text-[#999] transition-colors hover:text-[#111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0062df]";
const iconButtonActiveClass = "text-[#0062df]";
const sortIconClass = "size-[12px] fill-[#ccc]";
const sortIconPathActiveClass = "fill-[#0062df]";
const filterIconClass = "size-[14px] fill-current";
const expandButtonClass =
  "inline-grid size-[17px] cursor-pointer place-items-center rounded-sm border border-[#ddd] bg-white text-[14px] leading-none text-[#999]";
const expandPlaceholderClass = "inline-block size-[17px]";
const filterWrapClass = "relative";

const menuShadow = "shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]";

const filterMenuClass = `absolute z-[1050] top-7 left-[-12px] min-w-[196px] rounded-lg border border-[#eee] bg-white p-2 font-pretendard text-[14px] text-[#111] ${menuShadow}`;
const filterOptionsClass = "max-h-[264px] overflow-auto";
const filterOptionLabelClass = "flex min-h-9 items-center gap-2 rounded px-2 py-[7px] cursor-pointer hover:bg-[#f5f5f5]";
const filterGroupClass = "py-2 pb-1 text-[12px] font-semibold text-[#999]";
const filterEmptyClass = "px-2 py-4 text-center text-[#999]";
const filterSearchClass =
  "mb-1.5 h-8 w-full rounded border border-[#ddd] bg-white px-[11px] text-[#111] outline-none transition-colors focus:border-[#0062df]";
const filterActionsClass = "mt-1.5 flex items-center justify-between gap-2 border-t border-[#f0f0f0] pt-2";
const filterActionButtonClass = "h-6 cursor-pointer rounded border-0 bg-transparent px-2 text-[#0062df] hover:bg-[#f5f5f5]";
const filterActionPrimaryClass = "bg-[#0062df] text-white hover:bg-[#0062df] hover:opacity-90";

const selectionMenuTriggerClass =
  "grid h-6 w-[18px] cursor-pointer place-items-center rounded border-0 bg-transparent p-0 text-[#999] transition-colors hover:bg-[#f5f5f5] hover:text-[#111] aria-expanded:bg-[#f5f5f5] aria-expanded:text-[#111]";
const selectionMenuTriggerSvgClass = "w-2.5 stroke-current transition-transform group-aria-expanded:rotate-180";
const selectionMenuPopupClass = `absolute z-[1050] top-7 left-[-8px] grid min-w-[180px] gap-0.5 rounded-lg border border-[#eee] bg-white p-1 ${menuShadow}`;
const selectionMenuItemClass = "min-h-8 cursor-pointer whitespace-nowrap rounded border-0 bg-transparent px-3 py-[5px] text-left text-[#111] hover:bg-[#f5f5f5]";

const ellipsisClass = "block w-full overflow-hidden text-ellipsis whitespace-nowrap";
const emptyClass = "h-[184px] text-center text-[#999]";
const emptyStateClass = "inline-grid justify-items-center gap-3";
const emptyStateSvgClass = "w-16 fill-[#fafafa] stroke-[#ddd]";

const loadingOverlayClass = "absolute inset-0 z-10 grid place-items-center rounded-[inherit] bg-white/75 backdrop-blur-[1px]";
const loadingContentClass = "inline-flex items-center gap-2.5 text-[#0062df]";
const spinnerClass = "size-6 animate-spin rounded-full border-2 border-[#0062df]/20 border-t-[#0062df]";

const fixedLeftLastShadowBaseClass =
  "after:pointer-events-none after:absolute after:right-0 after:top-0 after:bottom-[-1px] after:z-[1] after:w-[30px] after:translate-x-full after:content-[''] after:shadow-[inset_10px_0_8px_-8px_rgba(5,5,5,0)] after:transition-shadow";
const fixedLeftLastShadowVisibleClass = "after:shadow-[inset_10px_0_8px_-8px_rgba(5,5,5,0.12)]";
const fixedRightFirstShadowBaseClass =
  "before:pointer-events-none before:absolute before:left-0 before:top-0 before:bottom-[-1px] before:z-[1] before:w-[30px] before:-translate-x-full before:content-[''] before:shadow-[inset_-10px_0_8px_-8px_rgba(5,5,5,0)] before:transition-shadow";
const fixedRightFirstShadowVisibleClass = "before:shadow-[inset_-10px_0_8px_-8px_rgba(5,5,5,0.12)]";

function Column<T extends object>(_props: TableColumnProps<T>) {
  return null;
}

function ColumnGroup<T extends object>(_props: TableColumnGroupProps<T>) {
  return null;
}

function columnsFromChildren<T extends object>(children: ReactNode): ColumnsType<T> {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || (child.type !== Column && child.type !== ColumnGroup)) return [];
    const element = child as ReactElement<TableColumnProps<T> & { children?: ReactNode }>;
    const { children: nested, ...columnProps } = element.props;
    const nestedColumns = columnsFromChildren<T>(nested);
    return [{ ...columnProps, ...(nestedColumns.length ? { children: nestedColumns } : {}) } as ColumnType<T>];
  });
}

function SummaryBase({ children }: TableSummaryProps) {
  return <>{children}</>;
}

function SummaryRow(props: TableSummaryRowProps) {
  return <tr {...props} />;
}

function SummaryCell({ index, ...props }: TableSummaryCellProps) {
  return <td data-column-index={index} {...props} />;
}

const Summary = Object.assign(SummaryBase, { Row: SummaryRow, Cell: SummaryCell });

function asClassGroup(value: TableSemanticClassNames["header"]) {
  return typeof value === "object" ? value : undefined;
}

function asStyleGroup(value: TableSemanticStyles["header"]) {
  return value && ("wrapper" in value || "row" in value || "cell" in value)
    ? (value as { wrapper?: CSSProperties; row?: CSSProperties; cell?: CSSProperties })
    : undefined;
}

function asPaginationClassGroup(value: TableSemanticClassNames["pagination"]) {
  return typeof value === "object" ? value : undefined;
}

function asPaginationStyleGroup(value: TableSemanticStyles["pagination"]) {
  return value && ("root" in value || "item" in value) ? (value as { root?: CSSProperties; item?: CSSProperties }) : undefined;
}

function fixedSide(fixed?: ColumnType<object>["fixed"]) {
  if (fixed === true || fixed === "left" || fixed === "start") return "left";
  if (fixed === "right" || fixed === "end") return "right";
  return null;
}

function isRenderedCell<T>(value: ReactNode | RenderedCell<T>): value is RenderedCell<T> {
  return value !== null && !isValidElement(value) && typeof value === "object" && ("children" in value || "props" in value);
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
    children,
    dataSource = [],
    column: sharedColumn,
    columns: sourceColumns,
    rowKey = "key" as keyof T,
    pagination = {},
    rowSelection,
    expandable,
    bordered = false,
    loading = false,
    size = "large",
    title,
    footer,
    summary,
    locale = {},
    showHeader = true,
    showSorterTooltip = true,
    tableLayout = "auto",
    rowClassName,
    rowHoverable = true,
    sticky = false,
    virtual = false,
    scroll,
    sortDirections = ["ascend", "descend"],
    rootClassName = "",
    className = "",
    classNames: classNamesProp,
    styles: stylesProp,
    style: rootStyle,
    components,
    getPopupContainer = () => document.body,
    onChange,
    onRow,
    onHeaderRow,
    onScroll,
    ...rootProps
  } = props;
  const classNames = (typeof classNamesProp === "function" ? classNamesProp({ props }) : classNamesProp) ?? EMPTY_CLASS_NAMES;
  const styles = (typeof stylesProp === "function" ? stylesProp({ props }) : stylesProp) ?? EMPTY_STYLES;
  const headerClasses = asClassGroup(classNames.header);
  const bodyClasses = asClassGroup(classNames.body);
  const paginationClasses = asPaginationClassGroup(classNames.pagination);
  const headerStyles = asStyleGroup(styles.header);
  const bodyStyles = asStyleGroup(styles.body);
  const paginationStyles = asPaginationStyleGroup(styles.pagination);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const filterTriggers = useRef(new Map<string, HTMLButtonElement>());
  const selectionCache = useRef(new Map<Key, T>());
  const lastSelectedIndex = useRef<number | null>(null);
  const selectionName = `wizard-table-selection-${useId().replace(/:/g, "")}`;

  const columns = useMemo(() => {
    const merge = (items: ColumnsType<T>): ColumnsType<T> =>
      items.map((item) => ({ ...sharedColumn, ...item, children: item.children ? merge(item.children) : undefined }));
    return merge(sourceColumns ?? columnsFromChildren<T>(children));
  }, [children, sharedColumn, sourceColumns]);
  const [internalPage, setInternalPage] = useState(typeof pagination === "object" ? (pagination.defaultCurrent ?? 1) : 1);
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
    Object.fromEntries(flattenColumns(columns).map((item, index) => [columnKey(item, index), item.defaultFilteredValue ?? []])),
  );
  const [filterOpen, setFilterOpen] = useState<string | null>(null);
  const [filterDraft, setFilterDraft] = useState<Record<string, FilterKey[]>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(() => new Set(rowSelection?.defaultSelectedRowKeys ?? []));
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(() => new Set(expandable?.defaultExpandedRowKeys ?? []));
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth));
  const [loadingVisible, setLoadingVisible] = useState(typeof loading === "boolean" ? loading : (loading.spinning ?? true));
  const [scrollBoundary, setScrollBoundary] = useState({ left: false, right: false });
  const measureScrollBoundary = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth);
    const next = { left: node.scrollLeft > 1, right: node.scrollLeft < maxScrollLeft - 1 };
    setScrollBoundary((current) => (current.left === next.left && current.right === next.right ? current : next));
  }, []);
  const handleScrollKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const node = event.currentTarget;
      const horizontalStep = Math.max(48, Math.round(node.clientWidth * 0.15));
      const verticalStep = Math.max(48, Math.round(node.clientHeight * 0.8));
      const movement =
        event.key === "ArrowLeft" && scroll?.x
          ? { left: -horizontalStep }
          : event.key === "ArrowRight" && scroll?.x
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
    [scroll?.x, scroll?.y],
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
    (record: T, index?: number): Key => (typeof rowKey === "function" ? rowKey(record, index) : (record[rowKey] as Key)),
    [rowKey],
  );
  const childrenName = expandable?.childrenColumnName ?? "children";
  const controlledExpanded = expandable?.expandedRowKeys ? new Set(expandable.expandedRowKeys) : expandedKeys;
  const controlledSelected = rowSelection?.selectedRowKeys ? new Set(rowSelection.selectedRowKeys) : selectedKeys;
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
    allDataRows.forEach((record, index) => selectionCache.current.set(keyOf(record, index), record));
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
        if ((children?.length || expandable.expandedRowRender) && (expandable.rowExpandable?.(item) ?? true)) keys.push(keyOf(item));
        if (children?.length) walk(children);
      });
    walk(dataSource);
    setExpandedKeys(new Set(keys));
    // This is an initial default, matching defaultExpandAllRows semantics.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const responsiveColumns = useMemo(() => {
    const visible = (item: ColumnType<T>) =>
      !item.hidden && (!item.responsive?.length || item.responsive.some((point) => viewportWidth >= breakpointWidths[point]));
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
          return [key, item.filteredValue !== undefined ? (item.filteredValue ?? []) : (filters[key] ?? [])];
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
            state.order && (typeof state.column.sorter === "function" || (typeof state.column.sorter === "object" && state.column.sorter.compare)),
        )
        .sort((a, b) => b.priority - a.priority);
      const filtered = items
        .filter((record) =>
          leafColumns.every((item, index) => {
            const values = filterState[columnKey(item, index)];
            return !values?.length || !item.onFilter || values.some((value) => item.onFilter?.(value, record));
          }),
        )
        .map((record) => {
          const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
          return children?.length ? { ...record, [childrenName]: processData(children, filterState, sortState) } : record;
        });
      return ordered.length
        ? [...filtered].sort((left, right) => {
            for (const state of ordered) {
              const sorter = state.column.sorter;
              const compare = typeof sorter === "function" ? sorter : typeof sorter === "object" ? sorter.compare : undefined;
              const result = compare?.(left, right, state.order) ?? 0;
              if (result) return state.order === "ascend" ? result : -result;
            }
            return 0;
          })
        : filtered;
    },
    [childrenName, leafColumns],
  );
  const processed = useMemo(() => processData(dataSource, activeFilters, activeSorts), [activeFilters, activeSorts, dataSource, processData]);

  const pageConfig = pagination === false ? null : pagination;
  const page = pageConfig?.current ?? internalPage;
  const pageSize = pageConfig?.pageSize ?? internalPageSize;
  const total = pageConfig?.total ?? processed.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const serverPaginated = Boolean(pageConfig?.total !== undefined && pageConfig.total > processed.length);
  const pageData = pageConfig ? (serverPaginated ? processed : processed.slice((safePage - 1) * pageSize, safePage * pageSize)) : processed;

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
      return [{ record, depth, parent }, ...(children?.length && controlledExpanded.has(key) ? flattenRows(children, depth + 1, key) : [])];
    });
  const allFlatRows = flattenRows(pageData);
  const rowHeight = size === "small" ? 39 : size === "medium" ? 47 : 55;
  const viewportHeight = typeof scroll?.y === "number" ? scroll.y : 400;
  const virtualStart = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - 3) : 0;
  const virtualCount = virtual ? Math.ceil(viewportHeight / rowHeight) + 6 : allFlatRows.length;
  const renderedRows = virtual ? allFlatRows.slice(virtualStart, virtualStart + virtualCount) : allFlatRows;
  const topPad = virtual ? virtualStart * rowHeight : 0;
  const bottomPad = virtual ? Math.max(0, (allFlatRows.length - virtualStart - renderedRows.length) * rowHeight) : 0;

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
        return item.filters?.length || item.filterDropdown || item.filteredValue !== undefined || item.defaultFilteredValue !== undefined
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
    if (scroll?.scrollToFirstRowOnChange !== false && typeof scrollRef.current?.scrollTo === "function") scrollRef.current.scrollTo({ top: 0 });
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
      ? [...sortStates.filter((state) => state.key !== key), { column: item, key, order: nextOrder, priority }]
      : [{ column: item, key, order: nextOrder, priority }];
    setSortStates(next.filter((state) => state.order));
    emitChange("sort", safePage, pageSize, activeFilters, next);
    if (scroll?.scrollToFirstRowOnChange !== false && typeof scrollRef.current?.scrollTo === "function") scrollRef.current.scrollTo({ top: 0 });
  };

  const applyFilter = (item: ColumnType<T>, index: number, values = filterDraft[columnKey(item, index)] ?? [], closeDropdown = true) => {
    const key = columnKey(item, index);
    const next = { ...activeFilters, [key]: values };
    setFilters((current) => ({ ...current, [key]: values }));
    if (closeDropdown) {
      setFilterOpen(null);
      item.filterDropdownProps?.onOpenChange?.(false);
    }
    setInternalPage(1);
    pageConfig?.onChange?.(1, pageSize);
    emitChange("filter", 1, pageSize, next);
    if (scroll?.scrollToFirstRowOnChange !== false && typeof scrollRef.current?.scrollTo === "function") scrollRef.current.scrollTo({ top: 0 });
  };

  const closeFilter = (item: ColumnType<T>, index: number) => {
    const key = columnKey(item, index);
    if (item.filterOnClose !== false) applyFilter(item, index, filterDraft[key] ?? activeFilters[key] ?? []);
    else {
      setFilterOpen(null);
      item.filterDropdownProps?.onOpenChange?.(false);
    }
  };

  const updateSelection = (next: Set<Key>, type: RowSelectMethod, record?: T, selected?: boolean, event?: Event) => {
    if (!rowSelection?.selectedRowKeys) setSelectedKeys(next);
    const source = rowSelection?.preserveSelectedRowKeys ? [...selectionCache.current.values()] : allDataRows;
    const selectedRows = source.filter((row) => next.has(keyOf(row)));
    rowSelection?.onChange?.([...next], selectedRows, { type });
    if (record && event) rowSelection?.onSelect?.(record, Boolean(selected), selectedRows, event);
    return selectedRows;
  };

  const changeableRows = pageSelectionRows.filter((record) => !rowSelection?.getCheckboxProps?.(record).disabled);
  const changeableKeys = changeableRows.map((record) => keyOf(record));
  const allChecked = changeableKeys.length > 0 && changeableKeys.every((key) => controlledSelected.has(key));
  const partlyChecked = !allChecked && changeableKeys.some((key) => controlledSelected.has(key));
  const selectAll = (selected: boolean) => {
    const next = new Set(controlledSelected);
    const changed = changeableRows.filter((record) => selected !== next.has(keyOf(record)));
    changeableKeys.forEach((key) => (selected ? next.add(key) : next.delete(key)));
    const selectedRows = updateSelection(next, selected ? "all" : "none");
    rowSelection?.onSelectAll?.(selected, selectedRows, changed);
    if (!selected) rowSelection?.onSelectNone?.();
  };
  const invertSelection = () => {
    const next = new Set(controlledSelected);
    changeableKeys.forEach((key) => (next.has(key) ? next.delete(key) : next.add(key)));
    updateSelection(next, "invert");
    rowSelection?.onSelectInvert?.([...next]);
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
        if (selectableChildren.length && selectableChildren.every((childKey) => next.has(childKey))) next.add(parentKey);
        else next.delete(parentKey);
      }
      parentKey = parent.parent;
    }
  };

  const treeSelectionIndeterminate = (key: Key): boolean => {
    if (rowSelection?.checkStrictly !== false || controlledSelected.has(key)) return false;
    const entity = selectionEntities.get(key);
    return Boolean(entity?.children.some((childKey) => controlledSelected.has(childKey) || treeSelectionIndeterminate(childKey)));
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

  const selectionWidth = rowSelection ? Number(rowSelection.columnWidth ?? 48) : 0;
  const expandWidth = expandable && expandable.showExpandColumn !== false ? Number(expandable.columnWidth ?? 48) : 0;
  const leftOffsets = useMemo(() => {
    let offset = selectionWidth + expandWidth;
    const map: Record<string, number> = {};
    leafColumns.forEach((item, index) => {
      if (fixedSide(item.fixed as ColumnType<object>["fixed"]) === "left") {
        map[columnKey(item, index)] = offset;
        offset += Number(item.width ?? 120);
      }
    });
    return map;
  }, [expandWidth, leafColumns, selectionWidth]);
  const rightOffsets = useMemo(() => {
    let offset = fixedSide(expandable?.fixed as ColumnType<object>["fixed"]) === "right" ? expandWidth : 0;
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
    fixedSide(rowSelection?.fixed as ColumnType<object>["fixed"]) === "left" ? { position: "sticky", left: 0, zIndex: 3 } : {};
  const selectionHeaderFixedStyle: CSSProperties = selectionFixedStyle.position ? { ...selectionFixedStyle, zIndex: 7 } : selectionFixedStyle;
  const expandSide = fixedSide(expandable?.fixed as ColumnType<object>["fixed"]);
  const expandFixedStyle: CSSProperties =
    expandSide === "left"
      ? { position: "sticky", left: selectionWidth, zIndex: 3 }
      : expandSide === "right"
        ? { position: "sticky", right: 0, zIndex: 3 }
        : {};
  const expandHeaderFixedStyle: CSSProperties = expandFixedStyle.position ? { ...expandFixedStyle, zIndex: 7 } : expandFixedStyle;
  const extraColumnCount = (rowSelection ? 1 : 0) + (expandable && expandable.showExpandColumn !== false ? 1 : 0);
  const fullColSpan = leafColumns.length + extraColumnCount;
  const lastLeftFixedIndex = leafColumns.reduce(
    (last, item, index) => (fixedSide(item.fixed as ColumnType<object>["fixed"]) === "left" ? index : last),
    -1,
  );
  const firstRightFixedIndex = leafColumns.findIndex((item) => fixedSide(item.fixed as ColumnType<object>["fixed"]) === "right");
  const fixedClass = (item: ColumnType<T>, index: number) => {
    const side = fixedSide(item.fixed as ColumnType<object>["fixed"]);
    if (side === "left")
      return twMerge(
        "sticky",
        index === lastLeftFixedIndex && twMerge(fixedLeftLastShadowBaseClass, scrollBoundary.left && fixedLeftLastShadowVisibleClass),
      );
    if (side === "right")
      return twMerge(
        "sticky",
        index === firstRightFixedIndex && twMerge(fixedRightFirstShadowBaseClass, scrollBoundary.right && fixedRightFirstShadowVisibleClass),
      );
    return "";
  };
  const selectionSide = fixedSide(rowSelection?.fixed as ColumnType<object>["fixed"]);
  const selectionBoundaryClass =
    selectionSide === "left" && expandSide !== "left" && lastLeftFixedIndex < 0
      ? twMerge(fixedLeftLastShadowBaseClass, scrollBoundary.left && fixedLeftLastShadowVisibleClass, "sticky")
      : selectionSide === "right" && expandSide !== "right" && firstRightFixedIndex < 0
        ? twMerge(fixedRightFirstShadowBaseClass, scrollBoundary.right && fixedRightFirstShadowVisibleClass, "sticky")
        : selectionSide
          ? "sticky"
          : "";
  const expandBoundaryClass =
    expandSide === "left" && lastLeftFixedIndex < 0
      ? twMerge(fixedLeftLastShadowBaseClass, scrollBoundary.left && fixedLeftLastShadowVisibleClass, "sticky")
      : expandSide === "right" && firstRightFixedIndex < 0
        ? twMerge(fixedRightFirstShadowBaseClass, scrollBoundary.right && fixedRightFirstShadowVisibleClass, "sticky")
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
            key !== undefined ? allFlatRows.findIndex((item, itemIndex) => keyOf(item.record, itemIndex) === key) : (index ?? -1);
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
          if (offset && typeof scrollRef.current?.scrollBy === "function") scrollRef.current.scrollBy({ top: offset });
        }
      },
    }),
    [allFlatRows, keyOf, rowHeight, viewportHeight, virtual],
  );

  const columnTitleProps: ColumnTitleProps<T> = {
    sortColumns: activeSorts.filter((state) => state.order).map((state) => ({ column: state.column, order: state.order })),
    filters: activeFilters as Record<string, FilterValue>,
  };
  columnTitleProps.sortOrder = columnTitleProps.sortColumns[0]?.order;
  columnTitleProps.sortColumn = columnTitleProps.sortColumns[0]?.column;
  const renderTitle = (item: ColumnType<T>) => (typeof item.title === "function" ? item.title(columnTitleProps) : item.title);
  const nextSortLabel = (item: ColumnType<T>, order: SortOrder) => {
    const directions = item.sortDirections ?? sortDirections;
    const cycle = directions.includes(null) ? directions : [...directions, null];
    const next = cycle[(cycle.indexOf(order) + 1) % cycle.length];
    return next === "ascend" ? (locale.triggerAsc ?? "오름차순 정렬") : next === "descend" ? (locale.triggerDesc ?? "내림차순 정렬") : (locale.cancelSort ?? "정렬 해제");
  };

  const HeaderRow = components?.header?.row ?? "tr";
  const HeaderCell = components?.header?.cell ?? "th";
  const renderHeaderRows = () => {
    const depth = maxDepth(responsiveColumns);
    return Array.from({ length: depth }, (_, level) => {
      const cells: ReactNode[] = [];
      const visit = (items: ColumnsType<T>, current: number) =>
        items.forEach((item) => {
          if (current === level) {
            const leafIndex = leafColumns.indexOf(item);
            const key = columnKey(item, leafIndex);
            const order = activeSorts.find((state) => state.key === key)?.order ?? null;
            const tooltip = item.showSorterTooltip ?? showSorterTooltip;
            const tooltipTitle = typeof tooltip === "object" && tooltip.title ? String(tooltip.title) : nextSortLabel(item, order);
            const headerProps = item.onHeaderCell?.(item, leafIndex) ?? {};
            const customProps = components?.header?.cell ? { column: item, index: leafIndex } : {};
            const itemLeaves = item.children?.length ? flattenColumns(item.children) : [item];
            const visualLastIndex = leafColumns.indexOf(itemLeaves[itemLeaves.length - 1]);
            const resolvedColSpan = item.children?.length ? leafCount(item) : item.colSpan;
            const filterIsOpen = item.filterDropdownProps?.open ?? filterOpen === key;
            if (resolvedColSpan === 0 || item.rowSpan === 0) return;
            cells.push(
              <HeaderCell
                key={`${key}-${level}`}
                colSpan={resolvedColSpan}
                rowSpan={item.children?.length ? 1 : (item.rowSpan ?? depth - level)}
                {...customProps}
                {...headerProps}
                title={tooltip && item.sorter && (typeof tooltip !== "object" || tooltip.target !== "sorter-icon") ? tooltipTitle : headerProps.title}
                style={{
                  width: item.width,
                  minWidth: tableLayout === "auto" ? item.minWidth : undefined,
                  textAlign: item.align,
                  ...(!item.children ? headerFixedStyle(item, leafIndex) : {}),
                  ...headerStyles?.cell,
                  ...styles.cell,
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
                  headerClasses?.cell,
                  classNames.cell,
                  item.className,
                  headerProps.className,
                )}
              >
                <span
                  className={twMerge(headerContentClass, item.sorter && "cursor-pointer select-none")}
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
                      title={tooltip && typeof tooltip === "object" && tooltip.target === "sorter-icon" ? tooltipTitle : undefined}
                    >
                      {item.sortIcon?.({ sortOrder: order }) ?? <SortGlyph order={order} />}
                    </button>
                  )}
                  {(item.filters?.length || item.filterDropdown) && !item.children ? (
                    <span className={filterWrapClass}>
                      <button
                        ref={(node) => {
                          if (node) filterTriggers.current.set(key, node);
                          else filterTriggers.current.delete(key);
                        }}
                        type="button"
                        className={twMerge(iconButtonClass, (item.filtered || activeFilters[key]?.length) && iconButtonActiveClass)}
                        onClick={(event) => {
                          event.stopPropagation();
                          const open = !filterIsOpen;
                          setFilterDraft((draft) => ({ ...draft, [key]: activeFilters[key] ?? [] }));
                          setFilterOpen(open ? key : null);
                          item.filterDropdownProps?.onOpenChange?.(open);
                        }}
                        aria-label={`${String(renderTitle(item))} 필터`}
                        aria-haspopup="dialog"
                        aria-expanded={filterIsOpen}
                      >
                        {typeof item.filterIcon === "function" ? item.filterIcon(Boolean(item.filtered || activeFilters[key]?.length)) : (item.filterIcon ?? <FilterGlyph />)}
                      </button>
                      {filterIsOpen && (
                        <FilterMenu
                          item={item}
                          values={filterDraft[key] ?? []}
                          locale={locale}
                          trigger={filterTriggers.current.get(key)}
                          popupContainer={filterTriggers.current.get(key) && getPopupContainer?.(filterTriggers.current.get(key)!)}
                          className={item.filterDropdownProps?.className}
                          onValues={(values) => setFilterDraft((draft) => ({ ...draft, [key]: values }))}
                          onApply={(values) => applyFilter(item, leafIndex, values)}
                          onClose={() => closeFilter(item, leafIndex)}
                        />
                      )}
                    </span>
                  ) : null}
                </span>
              </HeaderCell>,
            );
          } else if (item.children?.length) visit(item.children, current + 1);
        });
      visit(responsiveColumns, 0);

      const titleCheckbox =
        rowSelection && rowSelection.type !== "radio" && !rowSelection.hideSelectAll ? (
          <SelectionCheckbox
            aria-label="모든 행 선택"
            {...rowSelection.getTitleCheckboxProps?.()}
            checked={allChecked}
            indeterminate={partlyChecked}
            onChange={(event) => selectAll(event.target.checked)}
          />
        ) : null;
      const selectionTitle = rowSelection
        ? typeof rowSelection.columnTitle === "function"
          ? rowSelection.columnTitle(titleCheckbox)
          : (rowSelection.columnTitle ?? titleCheckbox)
        : null;
      const headerRowProps = onHeaderRow?.(responsiveColumns, level) ?? {};
      return (
        <HeaderRow
          key={level}
          {...(components?.header?.row ? { columns: responsiveColumns, index: level } : {})}
          {...headerRowProps}
          className={twMerge(headerClasses?.row, headerRowProps.className)}
          style={{ ...headerStyles?.row, ...headerRowProps.style }}
        >
          {level === 0 && rowSelection && (
            <HeaderCell
              rowSpan={depth}
              className={twMerge(cellBaseClass, cellSizePad[size], headerCellBaseClass, isNestedHeader && nestedHeaderBorderClass, selectionCellClass, selectionBoundaryClass)}
              style={{ width: rowSelection.columnWidth ?? 48, textAlign: rowSelection.align, ...selectionHeaderFixedStyle }}
            >
              <span className={selectionHeadClass}>
                {selectionTitle}
                {rowSelection.selections && !rowSelection.hideSelectAll && (
                  <SelectionMenu
                    rowSelection={rowSelection}
                    changeableKeys={changeableKeys}
                    onAll={() => selectAll(true)}
                    onInvert={invertSelection}
                    onNone={() => selectAll(false)}
                    locale={locale}
                    getPopupContainer={getPopupContainer}
                  />
                )}
              </span>
            </HeaderCell>
          )}
          {level === 0 && expandable && expandable.showExpandColumn !== false && (
            <HeaderCell
              rowSpan={depth}
              className={twMerge(cellBaseClass, cellSizePad[size], headerCellBaseClass, isNestedHeader && nestedHeaderBorderClass, expandCellClass, expandBoundaryClass)}
              style={{ width: expandable.columnWidth ?? 48, ...expandHeaderFixedStyle }}
            >
              {expandable.columnTitle ?? <span className="sr-only">{locale.expand ?? "행 펼치기"}</span>}
            </HeaderCell>
          )}
          {cells}
        </HeaderRow>
      );
    });
  };

  const RowComponent = components?.body?.row ?? "tr";
  const Cell = components?.body?.cell ?? "td";
  const renderRow = ({ record, depth }: FlatRow<T>, visibleIndex: number) => {
    const actualIndex = virtualStart + visibleIndex;
    const key = keyOf(record, actualIndex);
    const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined;
    const canExpand = Boolean(children?.length || expandable?.expandedRowRender) && (expandable?.rowExpandable?.(record) ?? true);
    const expanded = controlledExpanded.has(key);
    const rowProps = onRow?.(record, actualIndex) ?? {};
    const customRowProps = components?.body?.row ? { record, index: actualIndex } : {};
    const customClass = rowClassName?.(record, actualIndex, depth) ?? "";
    const rowClass = twMerge(
      rowHoverable && "hover:[&>td]:bg-[#f5f5f5]",
      controlledSelected.has(key) && "[&>td]:bg-[#eef0f8] hover:[&>td]:bg-[#e3e7f5]",
      bodyClasses?.row,
      classNames.row,
      customClass,
      rowProps.className,
    );
    const checkboxProps = rowSelection?.getCheckboxProps?.(record) ?? {};
    const selectionCellProps = rowSelection?.onCell?.(record, actualIndex) ?? {};
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
            const native = event.nativeEvent as MouseEvent;
            if (native.shiftKey && lastSelectedIndex.current !== null && selection.type !== "radio") {
              const start = Math.min(lastSelectedIndex.current, actualIndex);
              const end = Math.max(lastSelectedIndex.current, actualIndex);
              const changed = allFlatRows
                .slice(start, end + 1)
                .map((item) => item.record)
                .filter((item) => !selection.getCheckboxProps?.(item).disabled);
              changed.forEach((item) => (event.target.checked ? next.add(keyOf(item)) : next.delete(keyOf(item))));
              const selectedRows = updateSelection(next, "multiple");
              selection.onSelectMultiple?.(event.target.checked, selectedRows, changed);
            } else {
              if (selection.checkStrictly === false && selection.type !== "radio") conductTreeSelection(next, record, event.target.checked);
              else if (event.target.checked) next.add(key);
              else next.delete(key);
              updateSelection(next, selection.type === "radio" ? "single" : "multiple", record, event.target.checked, event.nativeEvent);
            }
            lastSelectedIndex.current = actualIndex;
          },
        }
      : null;
    const originSelectionNode =
      selection && selectionInputProps ? (
        selection.type === "radio" ? (
          <input {...selectionInputProps} type="radio" className={radioClass} />
        ) : (
          <SelectionCheckbox {...selectionInputProps} indeterminate={treeSelectionIndeterminate(key)} />
        )
      ) : null;
    const renderedSelection = rowSelection?.renderCell?.(checked, record, actualIndex, originSelectionNode);
    const selectionRenderedCell = renderedSelection && isRenderedCell(renderedSelection) ? renderedSelection : null;

    return (
      <Fragment key={key}>
        <RowComponent
          data-row-key={key}
          data-row-depth={depth}
          {...customRowProps}
          {...rowProps}
          className={rowClass}
          style={{ height: virtual ? rowHeight : undefined, ...bodyStyles?.row, ...styles.row, ...rowProps.style }}
          onClick={(event: React.MouseEvent<HTMLTableRowElement>) => {
            rowProps.onClick?.(event);
            const target = event.target as HTMLElement;
            if (
              expandable?.expandRowByClick &&
              canExpand &&
              !event.defaultPrevented &&
              !target.closest?.('button, input, select, textarea, a, [role="button"], [role="link"]')
            )
              toggleExpand(record);
          }}
        >
          {rowSelection && (
            <Cell
              {...(components?.body?.cell ? { record, index: actualIndex, column: "selection" } : {})}
              {...selectionCellProps}
              {...selectionRenderedCell?.props}
              className={twMerge(
                cellBaseClass,
                cellSizePad[size],
                selectionCellClass,
                selectionBoundaryClass,
                selectionCellProps.className,
                selectionRenderedCell?.props?.className,
              )}
              style={{
                width: rowSelection.columnWidth ?? 48,
                textAlign: rowSelection.align,
                ...selectionFixedStyle,
                ...selectionCellProps.style,
                ...selectionRenderedCell?.props?.style,
              }}
            >
              {selectionRenderedCell ? (
                selectionRenderedCell.children
              ) : (
                <span className="flex items-center justify-center">{(renderedSelection as ReactNode) ?? originSelectionNode}</span>
              )}
            </Cell>
          )}
          {expandable && expandable.showExpandColumn !== false && (
            <Cell
              {...(components?.body?.cell ? { record, index: actualIndex, column: "expand" } : {})}
              className={twMerge(cellBaseClass, cellSizePad[size], expandCellBodyClass, expandBoundaryClass)}
              style={{ width: expandable.columnWidth ?? 48, ...expandFixedStyle }}
            >
              <span className={expandIndentClass} style={{ paddingInlineStart: 15 + depth * (expandable.indentSize ?? 15) }}>
                {expandable.expandIcon?.({
                  expanded,
                  record,
                  expandable: canExpand,
                  onExpand: (item, event) => {
                    event.stopPropagation();
                    toggleExpand(item);
                  },
                }) ??
                  (canExpand ? (
                    <button
                      type="button"
                      className={expandButtonClass}
                      aria-expanded={expanded}
                      aria-label={expanded ? (locale.collapse ?? "행 접기") : (locale.expand ?? "행 펼치기")}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleExpand(record);
                      }}
                    >
                      {expanded ? "−" : "+"}
                    </button>
                  ) : (
                    <span className={expandPlaceholderClass} aria-hidden />
                  ))}
              </span>
            </Cell>
          )}
          {leafColumns.map((item, columnIndex) => (
            <BodyCell
              key={columnKey(item, columnIndex)}
              component={Cell}
              custom={Boolean(components?.body?.cell)}
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
                bodyClasses?.cell,
                classNames.cell,
              )}
              style={{ ...bodyStyles?.cell, ...styles.cell }}
            />
          ))}
        </RowComponent>
        {expandable?.expandedRowRender && expanded && (
          <tr
            className={twMerge(
              "bg-[#f5f5f5]",
              typeof expandable.expandedRowClassName === "function"
                ? expandable.expandedRowClassName(record, actualIndex, depth)
                : expandable.expandedRowClassName,
            )}
          >
            <td className={twMerge(cellBaseClass, cellSizePad[size], cellLastNoRightBorder)} colSpan={fullColSpan}>
              {expandable.expandedRowRender(record, actualIndex, depth, expanded)}
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  const placements = pageConfig ? normalizePlacement(pageConfig).filter((item) => item !== "none") : [];
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
        className={twMerge(typeof classNames.pagination === "string" ? classNames.pagination : paginationClasses?.root, placement.startsWith("top") ? "pb-4" : "pt-4")}
        style={(typeof styles.pagination === "object" && !paginationStyles ? styles.pagination : paginationStyles?.root) as CSSProperties | undefined}
      />
    ) : null;
  const topPagination = placements.filter((item) => item.startsWith("top")).map(renderPagination);
  const bottomPagination = placements.filter((item) => item.startsWith("bottom")).map(renderPagination);
  const TableElement = components?.table ?? "table";
  const HeaderWrapper = components?.header?.wrapper ?? "thead";
  const BodyWrapper = components?.body?.wrapper ?? "tbody";
  const effectiveLayout = tableLayout === "fixed" || scroll?.x || leafColumns.some((item) => item.ellipsis || item.fixed) ? "fixed" : "auto";
  const emptyText = typeof locale.emptyText === "function" ? locale.emptyText() : (locale.emptyText ?? <DefaultEmpty />);
  const loadingConfig = typeof loading === "object" ? loading : undefined;
  const summaryContent = summary?.(pageData);
  const compoundSummary = isValidElement(summaryContent) && summaryContent.type === SummaryBase;
  const summaryFixed = compoundSummary ? (summaryContent as ReactElement<TableSummaryProps>).props.fixed : false;
  const summaryPosition = summaryFixed === "top" ? "top" : summaryFixed ? "bottom" : null;
  const SummaryWrapper = summaryPosition === "top" ? "tbody" : "tfoot";
  const summaryElement = summary ? (
    <SummaryWrapper
      className={twMerge(
        "[&>tr>td]:border-t [&>tr>td]:border-[#f0f0f0] [&>tr>td]:bg-white [&>tr>td]:p-4",
        summaryPosition && "sticky z-[4]",
        summaryPosition === "top" && "top-0",
        summaryPosition === "bottom" && "bottom-0",
        !summaryPosition && sticky && typeof sticky === "object" && sticky.offsetSummary !== undefined && "sticky bottom-0 z-[4]",
      )}
      style={
        summaryPosition === "top"
          ? { top: (typeof sticky === "object" ? (sticky.offsetHeader ?? 0) : 0) + (showHeader ? maxDepth(responsiveColumns) * rowHeight : 0) }
          : summaryPosition === "bottom" || (sticky && typeof sticky === "object" && sticky.offsetSummary !== undefined)
            ? { bottom: typeof sticky === "object" ? sticky.offsetSummary : 0 }
            : undefined
      }
    >
      {compoundSummary ? (
        summaryContent
      ) : (
        <tr>
          <td className={twMerge(cellBaseClass, cellSizePad[size], cellLastNoRightBorder)} colSpan={fullColSpan}>
            {summaryContent}
          </td>
        </tr>
      )}
    </SummaryWrapper>
  ) : null;
  const summaryRowCount = summary ? (compoundSummary ? Children.count((summaryContent as ReactElement<TableSummaryProps>).props.children) : 1) : 0;
  const wrapperMaxHeight =
    typeof scroll?.y === "number" ? scroll.y + (showHeader ? maxDepth(responsiveColumns) * rowHeight : 0) + summaryRowCount * rowHeight : scroll?.y;

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!scroll?.x || !node) {
      setScrollBoundary({ left: false, right: false });
      return;
    }
    measureScrollBoundary(node);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measureScrollBoundary(node));
    observer.observe(node);
    const table = node.querySelector("table");
    if (table) observer.observe(table);
    return () => observer.disconnect();
  }, [leafColumns, measureScrollBoundary, pageData.length, scroll?.x]);

  return (
    <div
      {...rootProps}
      ref={rootRef}
      className={twMerge(
        "relative w-full font-pretendard text-[14px] leading-[1.5715] text-[#111]",
        rootClassName,
        className,
        classNames.root,
      )}
      style={{ ...rootStyle, ...styles.root }}
      aria-busy={loadingVisible}
    >
      {topPagination}
      <div
        className={twMerge("w-full rounded-lg bg-white", bordered && "border border-[#f0f0f0]", classNames.section)}
        style={styles.section}
      >
        {title && (
          <div className={twMerge("rounded-t-lg border-b border-[#f0f0f0] bg-white p-4 font-semibold", classNames.title)} style={styles.title}>
            {title(pageData)}
          </div>
        )}
        <div
          ref={scrollRef}
          className={twMerge(
            "relative w-full overflow-hidden rounded-[inherit] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0062df]",
            scroll?.x && "overflow-x-auto",
            classNames.wrapper,
            classNames.content,
          )}
          role={scroll?.x || scroll?.y ? "region" : undefined}
          aria-label={scroll?.x || scroll?.y ? "테이블 스크롤 영역" : undefined}
          tabIndex={scroll?.x || scroll?.y ? 0 : undefined}
          style={{
            overflowX: scroll?.x ? "auto" : undefined,
            overflowY: scroll?.y ? "auto" : undefined,
            maxHeight: wrapperMaxHeight,
            ...styles.content,
            ...styles.wrapper,
          }}
          onKeyDown={handleScrollKeyDown}
          onScroll={(event) => {
            if (virtual) setScrollTop(event.currentTarget.scrollTop);
            if (scroll?.x) measureScrollBoundary(event.currentTarget);
            onScroll?.(event);
          }}
        >
          <TableElement
            className={twMerge("w-full border-separate border-spacing-0", classNames.table)}
            style={{
              tableLayout: effectiveLayout,
              minWidth: typeof scroll?.x === "number" ? scroll.x : scroll?.x === "max-content" ? "max-content" : undefined,
              ...styles.table,
            }}
          >
            <colgroup>
              {rowSelection && <col style={{ width: rowSelection.columnWidth ?? 48 }} />}
              {expandable && expandable.showExpandColumn !== false && <col style={{ width: expandable.columnWidth ?? 48 }} />}
              {leafColumns.map((item, index) => (
                <col key={columnKey(item, index)} style={{ width: item.width, minWidth: item.minWidth }} />
              ))}
            </colgroup>
            {showHeader && (
              <HeaderWrapper
                className={twMerge(
                  sticky && "sticky z-[5] [&>tr>th]:sticky [&>tr>th]:z-[4]",
                  typeof classNames.header === "string" ? classNames.header : headerClasses?.wrapper,
                )}
                style={{ top: typeof sticky === "object" ? (sticky.offsetHeader ?? 0) : 0, ...headerStyles?.wrapper }}
              >
                {renderHeaderRows()}
              </HeaderWrapper>
            )}
            {summaryPosition === "top" && summaryElement}
            <BodyWrapper
              className={twMerge(bordered && "[&>tr:last-child>td]:border-b-0", typeof classNames.body === "string" ? classNames.body : bodyClasses?.wrapper)}
              style={bodyStyles?.wrapper}
            >
              {topPad > 0 && (
                <tr aria-hidden>
                  <td className={cellLastNoRightBorder} colSpan={fullColSpan} style={{ height: topPad, padding: 0 }} />
                </tr>
              )}
              {renderedRows.map(renderRow)}
              {bottomPad > 0 && (
                <tr aria-hidden>
                  <td className={cellLastNoRightBorder} colSpan={fullColSpan} style={{ height: bottomPad, padding: 0 }} />
                </tr>
              )}
              {!loadingVisible && allFlatRows.length === 0 && (
                <tr>
                  <td className={twMerge(emptyClass, cellLastNoRightBorder)} colSpan={fullColSpan}>
                    {emptyText}
                  </td>
                </tr>
              )}
            </BodyWrapper>
            {summaryPosition !== "top" && summaryElement}
          </TableElement>
          {loadingVisible && (
            <div className={twMerge(loadingOverlayClass, loadingConfig?.className)} style={loadingConfig?.style}>
              <div className={loadingContentClass}>
                {loadingConfig?.indicator ?? <span className={spinnerClass} aria-hidden />}
                {loadingConfig?.tip && <span>{loadingConfig.tip}</span>}
                <span className="sr-only">로딩 중</span>
              </div>
            </div>
          )}
        </div>
        {footer && (
          <div
            className={twMerge("rounded-b-lg border-t border-[#f0f0f0] bg-white p-4 text-[#999]", classNames.footer)}
            style={styles.footer}
          >
            {footer(pageData)}
          </div>
        )}
      </div>
      {bottomPagination}
    </div>
  );
}

type BodyCellProps<T extends object> = {
  component: CellComponent;
  custom: boolean;
  item: ColumnType<T>;
  record: T;
  rowIndex: number;
  fixedStyle: CSSProperties;
  className: string;
  style: CSSProperties;
};

function BodyCellInner<T extends object>({ component: Cell, custom, item, record, rowIndex, fixedStyle, className, style }: BodyCellProps<T>) {
  const value = getValue(record, item.dataIndex);
  const cellProps = item.onCell?.(record, rowIndex) ?? {};
  const rendered = item.render ? item.render(value, record, rowIndex) : String(value ?? "");
  const renderedCell = isRenderedCell(rendered) ? rendered : null;
  const mergedProps = { ...cellProps, ...renderedCell?.props };
  if (mergedProps.colSpan === 0 || mergedProps.rowSpan === 0) return null;
  return (
    <Cell
      {...(custom ? { record, index: rowIndex, column: item } : {})}
      {...mergedProps}
      scope={item.rowScope}
      title={item.ellipsis && (typeof item.ellipsis === "boolean" || item.ellipsis.showTitle !== false) ? String(value ?? "") : mergedProps.title}
      className={twMerge(className, item.className, mergedProps.className)}
      style={{ width: item.width, minWidth: item.minWidth, textAlign: item.align, ...fixedStyle, ...style, ...mergedProps.style }}
    >
      {item.ellipsis ? (
        <span className={ellipsisClass}>{renderedCell ? renderedCell.children : (rendered as ReactNode)}</span>
      ) : renderedCell ? (
        renderedCell.children
      ) : (
        rendered
      )}
    </Cell>
  );
}

const BodyCell = memo(BodyCellInner, (previous, next) => {
  if (previous.item !== next.item || previous.rowIndex !== next.rowIndex || previous.component !== next.component || previous.className !== next.className)
    return false;
  return next.item.shouldCellUpdate ? !next.item.shouldCellUpdate(next.record, previous.record) : false;
}) as typeof BodyCellInner;

function SelectionCheckbox({ indeterminate, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" className={twMerge(checkboxClass, className)} {...props} />;
}

function SelectionMenu<T extends object>({
  rowSelection,
  changeableKeys,
  onAll,
  onInvert,
  onNone,
  locale,
  getPopupContainer,
}: {
  rowSelection: NonNullable<TableProps<T>["rowSelection"]>;
  changeableKeys: Key[];
  onAll: () => void;
  onInvert: () => void;
  onNone: () => void;
  locale: NonNullable<TableProps<T>["locale"]>;
  getPopupContainer: (triggerNode: HTMLElement) => HTMLElement;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupId = `wizard-table-selection-menu-${useId().replace(/:/g, "")}`;
  const items =
    rowSelection.selections === true
      ? [
          { key: "all", text: locale.selectionAll ?? "전체 데이터 선택", action: onAll },
          { key: "invert", text: locale.selectInvert ?? "현재 페이지 선택 반전", action: onInvert },
          { key: "none", text: locale.selectNone ?? "선택 해제", action: onNone },
        ]
      : (rowSelection.selections || []).map((item) =>
          item === SELECTION_ALL
            ? { key: item.key, text: locale.selectionAll ?? item.text, action: onAll }
            : item === SELECTION_INVERT
              ? { key: item.key, text: locale.selectInvert ?? item.text, action: onInvert }
              : item === SELECTION_NONE
                ? { key: item.key, text: locale.selectNone ?? item.text, action: onNone }
                : { key: item.key, text: item.text, action: () => item.onSelect?.(changeableKeys) },
        );
  useEffect(() => {
    if (!open) return;
    const pointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !popupRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", keyboard);
    };
  }, [open]);
  const choose = (action: () => void) => {
    action();
    setOpen(false);
    triggerRef.current?.focus();
  };
  const popupContainer = open && triggerRef.current ? getPopupContainer(triggerRef.current) : undefined;
  const portalStyle =
    popupContainer && triggerRef.current
      ? (() => {
          const triggerRect = triggerRef.current!.getBoundingClientRect();
          const containerRect = popupContainer === document.body ? { top: 0, left: 0 } : popupContainer.getBoundingClientRect();
          return {
            position: popupContainer === document.body ? ("fixed" as const) : ("absolute" as const),
            top: triggerRect.bottom - containerRect.top + 4,
            left: triggerRect.left - containerRect.left - 8,
          };
        })()
      : undefined;
  const popup = open && (
    <div ref={popupRef} id={popupId} role="group" aria-label="선택 작업 메뉴" className={selectionMenuPopupClass} style={portalStyle}>
      {items.map((item) => (
        <button type="button" key={item.key} className={selectionMenuItemClass} onClick={() => choose(item.action)}>
          {item.text}
        </button>
      ))}
    </div>
  );
  return (
    <div ref={rootRef} className="group absolute left-full top-1/2 ml-0.5 -translate-y-1/2">
      <button
        ref={triggerRef}
        type="button"
        className={selectionMenuTriggerClass}
        aria-label="선택 작업"
        aria-expanded={open}
        aria-controls={popupId}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 10 10" aria-hidden className={selectionMenuTriggerSvgClass} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4}>
          <path d="m2 3.5 3 3 3-3" />
        </svg>
      </button>
      {popup && popupContainer ? createPortal(popup, popupContainer) : popup}
    </div>
  );
}

function SortGlyph({ order }: { order: SortOrder }) {
  return (
    <svg className={sortIconClass} viewBox="0 0 12 14" aria-hidden>
      <path className={order === "ascend" ? sortIconPathActiveClass : ""} d="M6 2 2.5 6h7L6 2Z" />
      <path className={order === "descend" ? sortIconPathActiveClass : ""} d="m6 12 3.5-4h-7L6 12Z" />
    </svg>
  );
}

function FilterGlyph() {
  return (
    <svg className={filterIconClass} viewBox="0 0 16 16" aria-hidden>
      <path d="M2.7 3.25a.75.75 0 0 1 .63-.35h9.34a.75.75 0 0 1 .57 1.24L9.5 8.5v3.35a.75.75 0 0 1-.37.65l-1.5.87A.75.75 0 0 1 6.5 12.7V8.5L2.76 4.14a.75.75 0 0 1-.06-.89Z" />
    </svg>
  );
}

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
      if (!menuRef.current?.contains(event.target as Node) && !trigger?.contains(event.target as Node)) onClose();
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

  const close = () => onClose();
  const confirm: FilterDropdownProps["confirm"] = (options) => onApply(values, options?.closeDropdown !== false);
  const clearFilters: NonNullable<FilterDropdownProps["clearFilters"]> = (options) => {
    const next = item.filterResetToDefaultFilteredValue ? (item.defaultFilteredValue ?? []) : [];
    onValues(next);
    if (options?.confirm !== false) onApply(next, options?.closeDropdown !== false);
    else if (options?.closeDropdown) close();
  };
  const customProps: FilterDropdownProps = { setSelectedKeys: onValues, selectedKeys: values, confirm, clearFilters, close, filters: item.filters, visible: true };
  const content = typeof item.filterDropdown === "function" ? item.filterDropdown(customProps) : item.filterDropdown;
  const defaultContent = (
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
        <button type="button" className={filterActionButtonClass} onClick={() => clearFilters({ confirm: false })}>
          {locale.filterReset ?? "초기화"}
        </button>
        <button type="button" className={twMerge(filterActionButtonClass, filterActionPrimaryClass)} onClick={() => confirm()}>
          {locale.filterConfirm ?? "확인"}
        </button>
      </div>
    </>
  );
  const portalStyle =
    popupContainer && trigger
      ? (() => {
          const triggerRect = trigger.getBoundingClientRect();
          const containerRect = popupContainer === document.body ? { top: 0, left: 0 } : popupContainer.getBoundingClientRect();
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
      {content ?? defaultContent}
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
          item.children?.some((child) => String(child.text).toLowerCase().includes(search.toLowerCase()))),
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
            <label className={filterOptionLabelClass} style={{ paddingInlineStart: 8 + depth * 12 }}>
              <input
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : radioName}
                className={multiple ? checkboxClass : radioClass}
                checked={values.includes(item.value)}
                onChange={(event) =>
                  onValues(
                    multiple
                      ? event.target.checked
                        ? [...values, item.value]
                        : values.filter((value) => value !== item.value)
                      : event.target.checked
                        ? [item.value]
                        : [],
                  )
                }
              />
              {item.text}
            </label>
          )}
        </div>
      ))}
    </>
  );
}

function DefaultEmpty() {
  return (
    <div className={emptyStateClass}>
      <svg viewBox="0 0 64 41" aria-hidden className={emptyStateSvgClass} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10h48l-6 24H14L8 10Z" />
        <path d="M20 10 25 3h14l5 7" />
        <path d="M14 34c4-5 8-7 13-7h10c5 0 9 2 13 7" />
      </svg>
      <span>데이터가 없습니다.</span>
    </div>
  );
}

type TableComponent = {
  <T extends object>(props: TableProps<T> & { ref?: React.Ref<TableRef> }): ReactElement;
  Column: typeof Column;
  ColumnGroup: typeof ColumnGroup;
  Summary: typeof Summary;
  SELECTION_ALL: SelectionItem;
  SELECTION_INVERT: SelectionItem;
  SELECTION_NONE: SelectionItem;
};

export const Table = Object.assign(forwardRef(InnerTable), {
  Column,
  ColumnGroup,
  Summary,
  SELECTION_ALL,
  SELECTION_INVERT,
  SELECTION_NONE,
}) as TableComponent;
