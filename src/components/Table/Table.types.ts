import type {
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

export type Key = string | number | bigint;
export type SortOrderType = "ascend" | "descend" | null;
export type FilterKey = Key | boolean;
export type FilterValue = FilterKey[] | null;
export type BreakpointType = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type DataIndex = string | number | readonly (string | number)[];
export type TableSizeType = "lg" | "md" | "sm";
export type TableLayoutType = "auto" | "fixed";
export type ColumnAlignType = "left" | "center" | "right";
export type ColumnFixedType = "left" | "right";
export type RowSelectionType = "checkbox" | "radio";
export type ColumnFilterModeType = "menu" | "tree";
export type SorterTooltipTargetType = "full-header" | "sorter-icon";
export type TableChangeActionType = "paginate" | "sort" | "filter";
export type TableScrollAlignType = "start" | "center" | "end" | "nearest";

export type SorterTooltipConfig = {
  title?: ReactNode;
  target?: SorterTooltipTargetType;
};

export type FilterItem = {
  text: ReactNode;
  value: FilterKey;
  children?: FilterItem[];
};

export type SorterConfig<T> = {
  compare?: (a: T, b: T, sortOrder?: SortOrderType) => number;
  multiple?: number;
};

export type ColumnType<T> = {
  key?: Key;
  title?: ReactNode;
  dataIndex?: DataIndex;
  width?: number;
  minWidth?: number;
  align?: ColumnAlignType;
  className?: string;
  hidden?: boolean;
  fixed?: ColumnFixedType;
  ellipsis?: boolean;
  responsive?: BreakpointType[];
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sorter?:
    | boolean
    | ((a: T, b: T, sortOrder?: SortOrderType) => number)
    | SorterConfig<T>;
  sortOrder?: SortOrderType;
  defaultSortOrder?: SortOrderType;
  sortDirections?: SortOrderType[];
  showSorterTooltip?: boolean | SorterTooltipConfig;
  filters?: FilterItem[];
  filterOnClose?: boolean;
  filterMultiple?: boolean;
  filteredValue?: FilterValue;
  defaultFilteredValue?: FilterValue;
  filterMode?: ColumnFilterModeType;
  filterSearch?: boolean | ((input: string, item: FilterItem) => boolean);
  filterResetToDefaultFilteredValue?: boolean;
  onFilter?: (value: FilterKey, record: T) => boolean;
  onCell?: (record: T, rowIndex?: number) => TdHTMLAttributes<HTMLTableCellElement>;
  onHeaderCell?: (column: ColumnType<T>, index?: number) => ThHTMLAttributes<HTMLTableCellElement>;
  children?: ColumnsType<T>;
};

export type ColumnsType<T> = readonly ColumnType<T>[];

export type PaginationPlacementType =
  "topStart" | "topCenter" | "topEnd" | "bottomStart" | "bottomCenter" | "bottomEnd" | "none";

export type PaginationConfig = {
  className?: string;
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  placement?: PaginationPlacementType[];
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  pageSizeOptions?: Array<string | number>;
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  simple?: boolean;
  size?: TableSizeType;
  onChange?: (page: number, pageSize: number) => void;
};

export type RowSelectMethodType = "all" | "none" | "single" | "multiple";
export type TableRowCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "type"
>;

export type RowSelection<T> = {
  type?: RowSelectionType;
  checkStrictly?: boolean;
  selectedRowKeys?: Key[];
  defaultSelectedRowKeys?: Key[];
  preserveSelectedRowKeys?: boolean;
  columnWidth?: number;
  fixed?: "left" | "right";
  align?: "left" | "center" | "right";
  hideSelectAll?: boolean;
  getCheckboxProps?: (record: T) => TableRowCheckboxProps;
  onChange?: (
    selectedRowKeys: Key[],
    selectedRows: T[],
    info: { type: RowSelectMethodType },
  ) => void;
};

export type ExpandableConfig<T> = {
  childrenColumnName?: string;
  columnTitle?: ReactNode;
  columnWidth?: number;
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: readonly Key[];
  expandedRowKeys?: readonly Key[];
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => ReactNode;
  expandRowByClick?: boolean;
  fixed?: "left" | "right";
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
  action: TableChangeActionType;
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
  columnWidth?: number;
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
  rowKey?: keyof T;
  pagination?: false | PaginationConfig;
  rowSelection?: RowSelection<T>;
  rowDrag?: boolean | RowDragConfig<T>;
  columnDrag?: boolean | ColumnDragConfig<T>;
  expandable?: ExpandableConfig<T>;
  bordered?: boolean;
  loading?: boolean | TableLoadingConfig;
  size?: TableSizeType;
  locale?: TableLocale;
  showHeader?: boolean;
  showSorterTooltip?: boolean | SorterTooltipConfig;
  tableLayout?: TableLayoutType;
  rowHoverable?: boolean;
  stickyHeader?: boolean;
  virtual?: boolean;
  stickyScrollBar?: boolean | TableStickyScrollBarConfig;
  scroll?: { x?: string | number | true; y?: string | number; scrollToFirstRowOnChange?: boolean };
  sortDirections?: SortOrderType[];
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
  order?: SortOrderType;
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
    align?: TableScrollAlignType;
  }) => void;
};
