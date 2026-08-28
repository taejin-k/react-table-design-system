import type {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

export type Key = string | number | bigint;
export type SortOrderType = "ascend" | "descend" | null;
export type FilterKey = Key | boolean;
export type FilterValueType = FilterKey[] | null;
export type BreakpointType = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type DataIndex = string | number | readonly (string | number)[];
export type TableSizeType = "lg" | "md" | "sm";
export type ColumnAlignType = "left" | "center" | "right";
export type ColumnFixedType = "left" | "right";
export type RowSelectionType = "checkbox" | "radio";
export type ColumnFilterModeType = "menu" | "tree";
export type TableScrollAlignType = "start" | "center" | "end" | "nearest";

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
  sorter?: boolean | ((a: T, b: T, sortOrder?: SortOrderType) => number) | SorterConfig<T>;
  sortOrder?: SortOrderType;
  defaultSortOrder?: SortOrderType;
  showSorterTooltip?: boolean;
  filters?: FilterItem[];
  filterOnClose?: boolean;
  filterMultiple?: boolean;
  filteredValue?: FilterValueType;
  defaultFilteredValue?: FilterValueType;
  filterMode?: ColumnFilterModeType;
  filterSearch?: boolean;
  filterResetToDefault?: boolean;
  children?: ColumnsType<T>;
  onFilter?: (value: FilterKey, record: T) => boolean;
  onCell?: (record: T, rowIndex?: number) => TdHTMLAttributes<HTMLTableCellElement>;
  onHeaderCell?: (column: ColumnType<T>, index?: number) => ThHTMLAttributes<HTMLTableCellElement>;
};

export type ColumnsType<T> = readonly ColumnType<T>[];

export type PaginationPlacementType =
  "topStart" | "topCenter" | "topEnd" | "bottomStart" | "bottomCenter" | "bottomEnd" | "none";

export type PaginationConfig = {
  page?: number;
  defaultPage?: number;
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

export type TableChangePagination = PaginationConfig & {
  page: number;
  pageSize: number;
  total: number;
};

export type TableRowCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "type"
>;

export type RowSelection<T> = {
  type?: RowSelectionType;
  checkStrictly?: boolean;
  selectedKeys?: Key[];
  defaultSelectedKeys?: Key[];
  preserveSelectedKeys?: boolean;
  columnWidth?: number;
  fixed?: boolean;
  hideSelectAll?: boolean;
  getCheckboxProps?: (record: T) => TableRowCheckboxProps;
  onChange?: (selectedKeys: Key[], selectedRows: T[]) => void;
};

export type ExpandableConfig<T> = {
  childrenColumnName?: string;
  columnTitle?: ReactNode;
  columnWidth?: number;
  defaultExpandAllRows?: boolean;
  defaultExpandedKeys?: readonly Key[];
  expandedKeys?: readonly Key[];
  expandedRowRender?: (record: T, index: number) => ReactNode;
  expandRowByClick?: boolean;
  fixed?: boolean;
  rowExpandable?: (record: T) => boolean;
  showExpandColumn?: boolean;
  onExpand?: (expanded: boolean, record: T) => void;
  onExpandedRowsChange?: (keys: Key[]) => void;
};

export type TableLocale = {
  filterConfirm?: ReactNode;
  filterReset?: ReactNode;
  filterEmptyText?: ReactNode;
  filterPlaceholder?: string;
  emptyText?: ReactNode;
  triggerDesc?: string;
  triggerAsc?: string;
  cancelSort?: string;
};

export type TableLoadingConfig = {
  spinning?: boolean;
  text?: ReactNode;
  delay?: number;
};

export type RowDrag = {
  activeKey: Key;
  overKey: Key;
  activeIndex: number;
  overIndex: number;
};

export type RowDragConfig<T> = {
  columnWidth?: number;
  onChange?: (records: T[], info: RowDrag) => void;
};

export type ColumnDrag = {
  activeKey: Key;
  overKey: Key;
  activeIndex: number;
  overIndex: number;
};

export type ColumnDragConfig<T> = {
  onChange?: (columns: ColumnsType<T>, info: ColumnDrag) => void;
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
  showSorterTooltip?: boolean;
  rowHoverable?: boolean;
  textSelectable?: boolean;
  stickyHeader?: boolean;
  stickyHeaderOffset?: number;
  virtual?: boolean;
  stickyScrollBar?: boolean;
  stickyScrollBarOffset?: number;
  scroll?: { x?: string | number | true; y?: string | number };
  className?: string;
  onChange?: (
    pagination: TableChangePagination,
    filters: Record<string, FilterValueType>,
    sorter: SorterResult<T>[],
  ) => void;
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  onHeaderRow?: (columns: ColumnsType<T>, index: number) => HTMLAttributes<HTMLTableRowElement>;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
};

export type SorterResult<T> = {
  column?: ColumnType<T>;
  order: Exclude<SortOrderType, null>;
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
