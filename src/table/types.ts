import type { CSSProperties, HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

export type Key = string | number
export type SortOrder = 'ascend' | 'descend' | null
export type FilterValue = Key[] | null
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type DataIndex = string | number | readonly (string | number)[]

export type FilterItem = {
  text: ReactNode
  value: Key
  children?: FilterItem[]
}

export type ColumnType<T> = {
  key?: Key
  title?: ReactNode
  dataIndex?: DataIndex
  width?: string | number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  className?: string
  hidden?: boolean
  fixed?: boolean | 'left' | 'right' | 'start' | 'end'
  ellipsis?: boolean | { showTitle?: boolean }
  responsive?: Breakpoint[]
  colSpan?: number
  rowScope?: 'row' | 'rowgroup'
  render?: (value: unknown, record: T, index: number) => ReactNode
  sorter?: boolean | ((a: T, b: T) => number) | { compare?: (a: T, b: T) => number; multiple?: number }
  sortOrder?: SortOrder
  defaultSortOrder?: SortOrder
  sortDirections?: Exclude<SortOrder, null>[]
  filters?: FilterItem[]
  filterMultiple?: boolean
  filteredValue?: Key[] | null
  defaultFilteredValue?: Key[]
  onFilter?: (value: Key, record: T) => boolean
  filterSearch?: boolean | ((input: string, item: FilterItem) => boolean)
  onCell?: (record: T, rowIndex: number) => TdHTMLAttributes<HTMLTableCellElement>
  onHeaderCell?: (column: ColumnType<T>) => ThHTMLAttributes<HTMLTableCellElement>
  shouldCellUpdate?: (record: T, previous: T) => boolean
  children?: ColumnType<T>[]
}

export type ColumnsType<T> = ColumnType<T>[]

export type PaginationConfig = {
  current?: number
  defaultCurrent?: number
  pageSize?: number
  defaultPageSize?: number
  total?: number
  placement?: Array<'topStart' | 'topCenter' | 'topEnd' | 'bottomStart' | 'bottomCenter' | 'bottomEnd' | 'none'>
  hideOnSinglePage?: boolean
  showSizeChanger?: boolean
  pageSizeOptions?: number[]
  showTotal?: (total: number, range: [number, number]) => ReactNode
  onChange?: (page: number, pageSize: number) => void
}

export type RowSelection<T> = {
  type?: 'checkbox' | 'radio'
  checkStrictly?: boolean
  selectedRowKeys?: Key[]
  defaultSelectedRowKeys?: Key[]
  preserveSelectedRowKeys?: boolean
  columnTitle?: ReactNode
  columnWidth?: string | number
  fixed?: boolean
  hideSelectAll?: boolean
  getCheckboxProps?: (record: T) => { disabled?: boolean; name?: string }
  renderCell?: (checked: boolean, record: T, index: number, originNode: ReactNode) => ReactNode
  onChange?: (selectedRowKeys: Key[], selectedRows: T[], info: { type: string }) => void
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void
}

export type ExpandableConfig<T> = {
  childrenColumnName?: string
  columnTitle?: ReactNode
  columnWidth?: string | number
  defaultExpandAllRows?: boolean
  defaultExpandedRowKeys?: Key[]
  expandedRowKeys?: Key[]
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => ReactNode
  expandRowByClick?: boolean
  fixed?: boolean | 'left' | 'right'
  indentSize?: number
  rowExpandable?: (record: T) => boolean
  showExpandColumn?: boolean
  onExpand?: (expanded: boolean, record: T) => void
  onExpandedRowsChange?: (expandedKeys: Key[]) => void
}

export type TableChangeExtra<T> = {
  currentDataSource: T[]
  action: 'paginate' | 'sort' | 'filter'
}

export type TableProps<T extends object> = {
  dataSource?: T[]
  columns?: ColumnsType<T>
  rowKey?: keyof T | ((record: T) => Key)
  pagination?: false | PaginationConfig
  rowSelection?: RowSelection<T>
  expandable?: ExpandableConfig<T>
  bordered?: boolean
  loading?: boolean | ReactNode
  size?: 'large' | 'medium' | 'small'
  title?: (currentPageData: T[]) => ReactNode
  footer?: (currentPageData: T[]) => ReactNode
  summary?: (currentPageData: T[]) => ReactNode
  locale?: { emptyText?: ReactNode }
  showHeader?: boolean
  tableLayout?: 'auto' | 'fixed'
  rowHoverable?: boolean
  sticky?: boolean | { offsetHeader?: number }
  virtual?: boolean
  scroll?: { x?: string | number | true; y?: string | number; scrollToFirstRowOnChange?: boolean }
  sortDirections?: Exclude<SortOrder, null>[]
  className?: string
  classNames?: Partial<Record<'root' | 'wrapper' | 'table' | 'header' | 'body' | 'row' | 'cell' | 'pagination', string>>
  styles?: Partial<Record<'root' | 'wrapper' | 'table' | 'header' | 'body' | 'row' | 'cell' | 'pagination', CSSProperties>>
  onChange?: (pagination: PaginationConfig, filters: Record<string, FilterValue>, sorter: { columnKey?: Key; order?: SortOrder } | Array<{ columnKey?: Key; order?: SortOrder }>, extra: TableChangeExtra<T>) => void
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>
  onHeaderRow?: (columns: ColumnsType<T>, index: number) => HTMLAttributes<HTMLTableRowElement>
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
}

export type TableRef = {
  nativeElement: HTMLDivElement | null
  scrollTo: (config: { index?: number; key?: Key; top?: number; offset?: number; align?: ScrollLogicalPosition }) => void
}
