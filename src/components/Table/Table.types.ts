import type {
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

export type Key = string | number | bigint;
export type SortOrder = "ascend" | "descend" | null;
export type FilterKey = Key | boolean;
export type FilterValue = FilterKey[] | null;
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type DataIndex = string | number | readonly (string | number)[];
export type FixedType = boolean | "left" | "right" | "start" | "end";
export type AlignType = "start" | "end" | "left" | "right" | "center" | "justify" | "match-parent";

export type FilterItem = {
  text: ReactNode;
  value: FilterKey;
  children?: FilterItem[];
};

export type ColumnTitleProps<T> = {
  sortColumns: Array<{ column: ColumnType<T>; order: SortOrder }>;
  filters: Record<string, FilterValue>;
  /** @deprecated sortColumns를 쓴다. */
  sortOrder?: SortOrder;
  /** @deprecated sortColumns를 쓴다. */
  sortColumn?: ColumnType<T>;
};

export type RenderedCell<T> = {
  children?: ReactNode;
  props?: TdHTMLAttributes<HTMLTableCellElement> & { record?: T };
};

export type ColumnType<T> = {
  key?: Key;
  title?: ReactNode | ((props: ColumnTitleProps<T>) => ReactNode);
  dataIndex?: DataIndex;
  width?: string | number;
  minWidth?: number;
  align?: AlignType;
  className?: string;
  hidden?: boolean;
  fixed?: FixedType;
  ellipsis?: boolean;
  responsive?: Breakpoint[];
  colSpan?: number;
  rowSpan?: number;
  rowScope?: "row" | "rowgroup";
  render?: (value: unknown, record: T, index: number) => ReactNode | RenderedCell<T>;
  sorter?:
    | boolean
    | ((a: T, b: T, sortOrder?: SortOrder) => number)
    | { compare?: (a: T, b: T, sortOrder?: SortOrder) => number; multiple?: number };
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;
  sortDirections?: SortOrder[];
  showSorterTooltip?: boolean | { title?: ReactNode; target?: "full-header" | "sorter-icon" };
  filtered?: boolean;
  filters?: FilterItem[];
  filterOnClose?: boolean;
  filterMultiple?: boolean;
  filteredValue?: FilterValue;
  defaultFilteredValue?: FilterValue;
  filterMode?: "menu" | "tree";
  filterSearch?: boolean | ((input: string, item: FilterItem) => boolean);
  filterResetToDefaultFilteredValue?: boolean;
  onFilter?: (value: FilterKey, record: T) => boolean;
  onCell?: (record: T, rowIndex?: number) => TdHTMLAttributes<HTMLTableCellElement>;
  onHeaderCell?: (column: ColumnType<T>, index?: number) => ThHTMLAttributes<HTMLTableCellElement>;
  shouldCellUpdate?: (record: T, previous: T) => boolean;
  children?: ColumnsType<T>;
};

export type ColumnsType<T> = readonly ColumnType<T>[];

export type PaginationPlacement =
  "topStart" | "topCenter" | "topEnd" | "bottomStart" | "bottomCenter" | "bottomEnd" | "none";

export type PaginationConfig = {
  "aria-label"?: string;
  className?: string;
  style?: CSSProperties;
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  placement?: PaginationPlacement[];
  /** @deprecated placement을 쓴다. */
  position?: Array<
    "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight" | "none"
  >;
  align?: "start" | "center" | "end";
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  pageSizeOptions?: Array<string | number>;
  showLessItems?: boolean;
  showPrevNextJumpers?: boolean;
  showQuickJumper?: boolean | { goButton?: ReactNode };
  showSizeChanger?: boolean | { disabled?: boolean };
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  simple?: boolean | { readOnly?: boolean };
  size?: "large" | "medium" | "small";
  totalBoundaryShowSizeChanger?: number;
  locale?: {
    items_per_page?: string;
    jump_to?: string;
    page?: string;
    prev_page?: string;
    next_page?: string;
    prev_5?: string;
    next_5?: string;
    prev_3?: string;
    next_3?: string;
    page_size?: string;
  };
  classNames?:
    | { root?: string; item?: string }
    | ((info: { current: number; pageSize: number; total: number }) => {
        root?: string;
        item?: string;
      });
  styles?:
    | { root?: CSSProperties; item?: CSSProperties }
    | ((info: { current: number; pageSize: number; total: number }) => {
        root?: CSSProperties;
        item?: CSSProperties;
      });
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
};

export type RowSelectMethod = "all" | "none" | "single" | "multiple";
export type TableRowCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "type"
>;

export type RowSelection<T> = {
  type?: "checkbox" | "radio";
  checkStrictly?: boolean;
  selectedRowKeys?: Key[];
  defaultSelectedRowKeys?: Key[];
  preserveSelectedRowKeys?: boolean;
  columnWidth?: string | number;
  fixed?: FixedType;
  align?: "left" | "center" | "right";
  hideSelectAll?: boolean;
  getCheckboxProps?: (record: T) => TableRowCheckboxProps;
  onChange?: (selectedRowKeys: Key[], selectedRows: T[], info: { type: RowSelectMethod }) => void;
};

export type ExpandableConfig<T> = {
  childrenColumnName?: string;
  columnTitle?: ReactNode;
  columnWidth?: string | number;
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: readonly Key[];
  expandedRowKeys?: readonly Key[];
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => ReactNode;
  expandRowByClick?: boolean;
  fixed?: FixedType;
  indentSize?: number;
  rowExpandable?: (record: T) => boolean;
  showExpandColumn?: boolean;
  onExpand?: (expanded: boolean, record: T) => void;
  onExpandedRowsChange?: (expandedKeys: readonly Key[]) => void;
};

export type TableLocale = {
  filterTitle?: string;
  filterConfirm?: ReactNode;
  filterReset?: ReactNode;
  filterEmptyText?: ReactNode;
  filterCheckAll?: ReactNode;
  filterSearchPlaceholder?: string;
  emptyText?: ReactNode | (() => ReactNode);
  sortTitle?: string;
  expand?: string;
  collapse?: string;
  triggerDesc?: string;
  triggerAsc?: string;
  cancelSort?: string;
};

export type TableChangeExtra<T> = {
  currentDataSource: T[];
  action: "paginate" | "sort" | "filter";
};

export type TableLoadingConfig = {
  spinning?: boolean;
  indicator?: ReactNode;
  tip?: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export type TableStickyScrollBarConfig = {
  offsetScroll?: number;
};

export type RowDragInfo = {
  activeKey: Key;
  overKey: Key;
  activeIndex: number;
  overIndex: number;
};

export type RowDragConfig<T> = {
  columnWidth?: string | number;
  onChange?: (dataSource: T[], info: RowDragInfo) => void;
};

export type ColumnDragInfo = {
  activeKey: Key;
  overKey: Key;
  activeIndex: number;
  overIndex: number;
};

export type ColumnDragConfig<T> = {
  onChange?: (columns: ColumnsType<T>, info: ColumnDragInfo) => void;
};

export type TableProps<T extends object> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "title" | "onChange" | "onScroll"
> & {
  dataSource?: T[];
  columns?: ColumnsType<T>;
  rowKey?: keyof T | ((record: T, index?: number) => Key);
  pagination?: false | PaginationConfig;
  rowSelection?: RowSelection<T>;
  rowDrag?: boolean | RowDragConfig<T>;
  columnDrag?: boolean | ColumnDragConfig<T>;
  expandable?: ExpandableConfig<T>;
  bordered?: boolean;
  loading?: boolean | TableLoadingConfig;
  size?: "large" | "medium" | "small";
  locale?: TableLocale;
  showHeader?: boolean;
  showSorterTooltip?: boolean | { title?: ReactNode; target?: "full-header" | "sorter-icon" };
  tableLayout?: "auto" | "fixed";
  rowClassName?: (record: T, index: number, indent: number) => string;
  rowHoverable?: boolean;
  sticky?: boolean;
  virtual?: boolean;
  stickyScrollBar?: boolean | TableStickyScrollBarConfig;
  scroll?: { x?: string | number | true; y?: string | number; scrollToFirstRowOnChange?: boolean };
  sortDirections?: SortOrder[];
  className?: string;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  onChange?: (
    pagination: PaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<T> | SorterResult<T>[],
    extra: TableChangeExtra<T>,
  ) => void;
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  onHeaderRow?: (columns: ColumnsType<T>, index: number) => HTMLAttributes<HTMLTableRowElement>;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
};

export type SorterResult<T> = {
  column?: ColumnType<T>;
  order?: SortOrder;
  field?: Key | readonly Key[];
  columnKey?: Key;
};

export type TableRef = {
  nativeElement: HTMLDivElement | null;
  scrollTo: (config: {
    index?: number;
    key?: Key;
    top?: number;
    offset?: number;
    align?: "start" | "center" | "end" | "nearest";
  }) => void;
};
