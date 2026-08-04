import type {
  ComponentType,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react'

export type Key = string | number | bigint
export type SortOrder = 'ascend' | 'descend' | null
export type FilterKey = Key | boolean
export type FilterValue = FilterKey[] | null
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type DataIndex = string | number | readonly (string | number)[]
export type FixedType = boolean | 'left' | 'right' | 'start' | 'end'
export type AlignType = 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent'

export type FilterItem = {
  text: ReactNode
  value: FilterKey
  children?: FilterItem[]
}

export type ColumnTitleProps<T> = {
  sortColumns: Array<{ column: ColumnType<T>; order: SortOrder }>
  filters: Record<string, FilterValue>
  /** @deprecated Use sortColumns. */
  sortOrder?: SortOrder
  /** @deprecated Use sortColumns. */
  sortColumn?: ColumnType<T>
}

export type FilterDropdownProps = {
  setSelectedKeys: (keys: FilterKey[]) => void
  selectedKeys: FilterKey[]
  confirm: (options?: { closeDropdown?: boolean }) => void
  clearFilters?: (options?: { confirm?: boolean; closeDropdown?: boolean }) => void
  close: () => void
  filters?: FilterItem[]
  visible: boolean
}

export type RenderedCell<T> = {
  children?: ReactNode
  props?: TdHTMLAttributes<HTMLTableCellElement> & { record?: T }
}

export type ColumnType<T> = {
  key?: Key
  title?: ReactNode | ((props: ColumnTitleProps<T>) => ReactNode)
  dataIndex?: DataIndex
  width?: string | number
  minWidth?: number
  align?: AlignType
  className?: string
  hidden?: boolean
  fixed?: FixedType
  ellipsis?: boolean | { showTitle?: boolean }
  responsive?: Breakpoint[]
  colSpan?: number
  rowSpan?: number
  rowScope?: 'row' | 'rowgroup'
  render?: (value: unknown, record: T, index: number) => ReactNode | RenderedCell<T>
  sorter?: boolean | ((a: T, b: T, sortOrder?: SortOrder) => number) | { compare?: (a: T, b: T, sortOrder?: SortOrder) => number; multiple?: number }
  sortOrder?: SortOrder
  defaultSortOrder?: SortOrder
  sortDirections?: SortOrder[]
  sortIcon?: (props: { sortOrder: SortOrder }) => ReactNode
  showSorterTooltip?: boolean | { title?: ReactNode; target?: 'full-header' | 'sorter-icon' }
  filtered?: boolean
  filters?: FilterItem[]
  filterDropdown?: ReactNode | ((props: FilterDropdownProps) => ReactNode)
  filterOnClose?: boolean
  filterMultiple?: boolean
  filteredValue?: FilterValue
  defaultFilteredValue?: FilterValue
  filterIcon?: ReactNode | ((filtered: boolean) => ReactNode)
  filterMode?: 'menu' | 'tree'
  filterSearch?: boolean | ((input: string, item: FilterItem) => boolean)
  filterDropdownProps?: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    className?: string
  }
  filterResetToDefaultFilteredValue?: boolean
  onFilter?: (value: FilterKey, record: T) => boolean
  onCell?: (record: T, rowIndex?: number) => TdHTMLAttributes<HTMLTableCellElement>
  onHeaderCell?: (column: ColumnType<T>, index?: number) => ThHTMLAttributes<HTMLTableCellElement>
  shouldCellUpdate?: (record: T, previous: T) => boolean
  children?: ColumnsType<T>
}

export type ColumnsType<T> = readonly ColumnType<T>[]

export type TableColumnProps<T> = Omit<ColumnType<T>, 'children'>

export type TableColumnGroupProps<T> = Omit<ColumnType<T>, 'children' | 'dataIndex' | 'render'> & {
  children?: ReactNode
}

export type TableSummaryProps = {
  children?: ReactNode
}

export type TableSummaryRowProps = HTMLAttributes<HTMLTableRowElement>

export type TableSummaryCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  index?: number
}

export type PaginationItemType = 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next'
export type PaginationPlacement = 'topStart' | 'topCenter' | 'topEnd' | 'bottomStart' | 'bottomCenter' | 'bottomEnd' | 'none'

export type PaginationConfig = {
  current?: number
  defaultCurrent?: number
  pageSize?: number
  defaultPageSize?: number
  total?: number
  placement?: PaginationPlacement[]
  /** @deprecated Use placement. */
  position?: Array<'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'none'>
  align?: 'start' | 'center' | 'end'
  disabled?: boolean
  hideOnSinglePage?: boolean
  itemRender?: (page: number, type: PaginationItemType, originalElement: ReactNode) => ReactNode
  pageSizeOptions?: Array<string | number>
  responsive?: boolean
  showLessItems?: boolean
  showPrevNextJumpers?: boolean
  showQuickJumper?: boolean | { goButton?: ReactNode }
  showSizeChanger?: boolean | { disabled?: boolean }
  showTitle?: boolean
  showTotal?: (total: number, range: [number, number]) => ReactNode
  simple?: boolean | { readOnly?: boolean }
  size?: 'large' | 'medium' | 'small'
  totalBoundaryShowSizeChanger?: number
  locale?: {
    items_per_page?: string
    jump_to?: string
    page?: string
    prev_page?: string
    next_page?: string
    prev_5?: string
    next_5?: string
  }
  classNames?: { root?: string; item?: string } | ((info: { current: number; pageSize: number; total: number }) => { root?: string; item?: string })
  styles?: { root?: CSSProperties; item?: CSSProperties } | ((info: { current: number; pageSize: number; total: number }) => { root?: CSSProperties; item?: CSSProperties })
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}

export type SelectionItem = {
  key: string
  text: ReactNode
  onSelect?: (changeableRowKeys: Key[]) => void
}

export type RowSelectMethod = 'all' | 'none' | 'invert' | 'single' | 'multiple'
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'type'>

export type RowSelection<T> = {
  type?: 'checkbox' | 'radio'
  checkStrictly?: boolean
  selectedRowKeys?: Key[]
  defaultSelectedRowKeys?: Key[]
  preserveSelectedRowKeys?: boolean
  columnTitle?: ReactNode | ((originalNode: ReactNode) => ReactNode)
  columnWidth?: string | number
  fixed?: FixedType
  align?: 'left' | 'center' | 'right'
  hideSelectAll?: boolean
  selections?: boolean | SelectionItem[]
  getCheckboxProps?: (record: T) => CheckboxProps
  getTitleCheckboxProps?: () => CheckboxProps
  renderCell?: (checked: boolean, record: T, index: number, originNode: ReactNode) => ReactNode | RenderedCell<T>
  onCell?: (record: T, rowIndex?: number) => TdHTMLAttributes<HTMLTableCellElement>
  onChange?: (selectedRowKeys: Key[], selectedRows: T[], info: { type: RowSelectMethod }) => void
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void
  /** @deprecated Use onChange. */
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void
  /** @deprecated Use onChange. */
  onSelectInvert?: (selectedRowKeys: Key[]) => void
  /** @deprecated Use onChange. */
  onSelectNone?: () => void
  /** @deprecated Use onChange. */
  onSelectMultiple?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void
}

export type ExpandIconProps<T> = {
  expanded: boolean
  record: T
  expandable: boolean
  onExpand: (record: T, event: React.MouseEvent<HTMLElement>) => void
}

export type ExpandableConfig<T> = {
  childrenColumnName?: string
  columnTitle?: ReactNode
  columnWidth?: string | number
  defaultExpandAllRows?: boolean
  defaultExpandedRowKeys?: readonly Key[]
  expandedRowKeys?: readonly Key[]
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => ReactNode
  expandedRowClassName?: string | ((record: T, index: number, indent: number) => string)
  expandIcon?: (props: ExpandIconProps<T>) => ReactNode
  expandRowByClick?: boolean
  fixed?: FixedType
  indentSize?: number
  rowExpandable?: (record: T) => boolean
  showExpandColumn?: boolean
  onExpand?: (expanded: boolean, record: T) => void
  onExpandedRowsChange?: (expandedKeys: readonly Key[]) => void
}

export type TableLocale = {
  filterTitle?: string
  filterConfirm?: ReactNode
  filterReset?: ReactNode
  filterEmptyText?: ReactNode
  filterCheckAll?: ReactNode
  filterSearchPlaceholder?: string
  emptyText?: ReactNode | (() => ReactNode)
  selectAll?: ReactNode
  selectNone?: ReactNode
  selectInvert?: ReactNode
  selectionAll?: ReactNode
  sortTitle?: string
  expand?: string
  collapse?: string
  triggerDesc?: string
  triggerAsc?: string
  cancelSort?: string
}

export type TableChangeExtra<T> = {
  currentDataSource: T[]
  action: 'paginate' | 'sort' | 'filter'
}

export type TableComponents<T> = {
  table?: ElementType
  header?: {
    wrapper?: ElementType
    row?: ElementType
    cell?: ElementType
  }
  body?: {
    wrapper?: ElementType
    row?: ComponentType<HTMLAttributes<HTMLTableRowElement> & { 'data-row-key'?: Key; record?: T; index?: number }>
    cell?: ElementType
  }
}

export type TableSemanticClassNames = {
  root?: string
  section?: string
  title?: string
  footer?: string
  content?: string
  wrapper?: string
  table?: string
  header?: string | { wrapper?: string; row?: string; cell?: string }
  body?: string | { wrapper?: string; row?: string; cell?: string }
  row?: string
  cell?: string
  pagination?: string | { root?: string; item?: string }
}

export type TableSemanticStyles = {
  root?: CSSProperties
  section?: CSSProperties
  title?: CSSProperties
  footer?: CSSProperties
  content?: CSSProperties
  wrapper?: CSSProperties
  table?: CSSProperties
  header?: CSSProperties | { wrapper?: CSSProperties; row?: CSSProperties; cell?: CSSProperties }
  body?: CSSProperties | { wrapper?: CSSProperties; row?: CSSProperties; cell?: CSSProperties }
  row?: CSSProperties
  cell?: CSSProperties
  pagination?: CSSProperties | { root?: CSSProperties; item?: CSSProperties }
}

export type TableLoadingConfig = {
  spinning?: boolean
  indicator?: ReactNode
  tip?: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
}

export type TableProps<T extends object> = {
  children?: ReactNode
  dataSource?: T[]
  column?: Partial<ColumnType<T>>
  columns?: ColumnsType<T>
  rowKey?: keyof T | ((record: T, index?: number) => Key)
  pagination?: false | PaginationConfig
  rowSelection?: RowSelection<T>
  expandable?: ExpandableConfig<T>
  bordered?: boolean
  loading?: boolean | TableLoadingConfig
  size?: 'large' | 'medium' | 'small'
  title?: (currentPageData: T[]) => ReactNode
  footer?: (currentPageData: T[]) => ReactNode
  summary?: (currentPageData: T[]) => ReactNode
  locale?: TableLocale
  showHeader?: boolean
  showSorterTooltip?: boolean | { title?: ReactNode; target?: 'full-header' | 'sorter-icon' }
  tableLayout?: 'auto' | 'fixed'
  rowClassName?: (record: T, index: number, indent: number) => string
  rowHoverable?: boolean
  sticky?: boolean | { offsetHeader?: number; offsetSummary?: number; offsetScroll?: number; getContainer?: () => Window | HTMLElement }
  virtual?: boolean
  scroll?: { x?: string | number | true; y?: string | number; scrollToFirstRowOnChange?: boolean }
  sortDirections?: SortOrder[]
  rootClassName?: string
  className?: string
  classNames?: TableSemanticClassNames | ((info: { props: TableProps<T> }) => TableSemanticClassNames)
  styles?: TableSemanticStyles | ((info: { props: TableProps<T> }) => TableSemanticStyles)
  components?: TableComponents<T>
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement
  onChange?: (pagination: PaginationConfig, filters: Record<string, FilterValue>, sorter: SorterResult<T> | SorterResult<T>[], extra: TableChangeExtra<T>) => void
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>
  onHeaderRow?: (columns: ColumnsType<T>, index: number) => HTMLAttributes<HTMLTableRowElement>
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
}

export type SorterResult<T> = {
  column?: ColumnType<T>
  order?: SortOrder
  field?: Key | readonly Key[]
  columnKey?: Key
}

export type TableRef = {
  nativeElement: HTMLDivElement | null
  scrollTo: (config: { index?: number; key?: Key; top?: number; offset?: number; align?: 'start' | 'center' | 'end' | 'nearest' }) => void
}
