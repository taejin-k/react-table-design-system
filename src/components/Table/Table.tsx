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
} from 'react'
import { createPortal } from 'react-dom'
import { breakpointWidths, columnKey, flattenColumns, getValue, leafCount, maxDepth } from './Table.utils'
import { Pagination } from './Pagination'
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
} from './Table.types'
import '../../styles/tokens.css'
import './Table.css'

type SortState<T> = { column: ColumnType<T>; key: string; order: SortOrder; priority: number }
type FlatRow<T> = { record: T; depth: number; parent?: Key }
type CellComponent = React.ElementType

const EMPTY_CLASS_NAMES: TableSemanticClassNames = {}
const EMPTY_STYLES: TableSemanticStyles = {}
const SELECTION_ALL: SelectionItem = { key: 'all', text: 'Select all data' }
const SELECTION_INVERT: SelectionItem = { key: 'invert', text: 'Invert current page' }
const SELECTION_NONE: SelectionItem = { key: 'none', text: 'Select none' }

function Column<T extends object>(_props: TableColumnProps<T>) {
  return null
}

function ColumnGroup<T extends object>(_props: TableColumnGroupProps<T>) {
  return null
}

function columnsFromChildren<T extends object>(children: ReactNode): ColumnsType<T> {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || (child.type !== Column && child.type !== ColumnGroup)) return []
    const element = child as ReactElement<TableColumnProps<T> & { children?: ReactNode }>
    const { children: nested, ...columnProps } = element.props
    const nestedColumns = columnsFromChildren<T>(nested)
    return [{ ...columnProps, ...(nestedColumns.length ? { children: nestedColumns } : {}) } as ColumnType<T>]
  })
}

function SummaryBase({ children }: TableSummaryProps) {
  return <>{children}</>
}

function SummaryRow(props: TableSummaryRowProps) {
  return <tr {...props} />
}

function SummaryCell({ index, ...props }: TableSummaryCellProps) {
  return <td data-column-index={index} {...props} />
}

const Summary = Object.assign(SummaryBase, { Row: SummaryRow, Cell: SummaryCell })

function asClassGroup(value: TableSemanticClassNames['header']) {
  return typeof value === 'object' ? value : undefined
}

function asStyleGroup(value: TableSemanticStyles['header']) {
  return value && ('wrapper' in value || 'row' in value || 'cell' in value) ? value as { wrapper?: CSSProperties; row?: CSSProperties; cell?: CSSProperties } : undefined
}

function asPaginationClassGroup(value: TableSemanticClassNames['pagination']) {
  return typeof value === 'object' ? value : undefined
}

function asPaginationStyleGroup(value: TableSemanticStyles['pagination']) {
  return value && ('root' in value || 'item' in value) ? value as { root?: CSSProperties; item?: CSSProperties } : undefined
}

function fixedSide(fixed?: ColumnType<object>['fixed']) {
  if (fixed === true || fixed === 'left' || fixed === 'start') return 'left'
  if (fixed === 'right' || fixed === 'end') return 'right'
  return null
}

function isRenderedCell<T>(value: ReactNode | RenderedCell<T>): value is RenderedCell<T> {
  return value !== null && !isValidElement(value) && typeof value === 'object' && ('children' in value || 'props' in value)
}

function normalizePlacement(config: PaginationConfig): PaginationPlacement[] {
  if (config.placement?.length) return config.placement
  if (!config.position?.length) return ['bottomEnd']
  const map = { topLeft: 'topStart', topCenter: 'topCenter', topRight: 'topEnd', bottomLeft: 'bottomStart', bottomCenter: 'bottomCenter', bottomRight: 'bottomEnd', none: 'none' } as const
  return config.position.map((item) => map[item])
}

function InnerTable<T extends object>(props: TableProps<T>, ref: React.ForwardedRef<TableRef>) {
  const {
    children, dataSource = [], column: sharedColumn, columns: sourceColumns, rowKey = 'key' as keyof T, pagination = {}, rowSelection, expandable,
    bordered = false, loading = false, size = 'large', title, footer, summary, locale = {}, showHeader = true, showSorterTooltip = true,
    tableLayout = 'auto', rowClassName, rowHoverable = true, sticky = false, virtual = false, scroll, sortDirections = ['ascend', 'descend'],
    rootClassName = '', className = '', classNames: classNamesProp, styles: stylesProp, style: rootStyle, components, getPopupContainer, onChange, onRow, onHeaderRow, onScroll,
    ...rootProps
  } = props
  const classNames = (typeof classNamesProp === 'function' ? classNamesProp({ props }) : classNamesProp) ?? EMPTY_CLASS_NAMES
  const styles = (typeof stylesProp === 'function' ? stylesProp({ props }) : stylesProp) ?? EMPTY_STYLES
  const headerClasses = asClassGroup(classNames.header)
  const bodyClasses = asClassGroup(classNames.body)
  const paginationClasses = asPaginationClassGroup(classNames.pagination)
  const headerStyles = asStyleGroup(styles.header)
  const bodyStyles = asStyleGroup(styles.body)
  const paginationStyles = asPaginationStyleGroup(styles.pagination)
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const filterTriggers = useRef(new Map<string, HTMLButtonElement>())
  const selectionCache = useRef(new Map<Key, T>())
  const lastSelectedIndex = useRef<number | null>(null)
  const selectionName = `orbit-table-selection-${useId().replace(/:/g, '')}`

  const columns = useMemo(() => {
    const merge = (items: ColumnsType<T>): ColumnsType<T> => items.map((item) => ({ ...sharedColumn, ...item, children: item.children ? merge(item.children) : undefined }))
    return merge(sourceColumns ?? columnsFromChildren<T>(children))
  }, [children, sharedColumn, sourceColumns])
  const [internalPage, setInternalPage] = useState(typeof pagination === 'object' ? pagination.defaultCurrent ?? 1 : 1)
  const [internalPageSize, setInternalPageSize] = useState(typeof pagination === 'object' ? pagination.defaultPageSize ?? pagination.pageSize ?? 10 : 10)
  const [sortStates, setSortStates] = useState<SortState<T>[]>(() => flattenColumns(columns).flatMap((item, index) => item.defaultSortOrder ? [{ column: item, key: columnKey(item, index), order: item.defaultSortOrder, priority: typeof item.sorter === 'object' ? item.sorter.multiple ?? 0 : 0 }] : []))
  const [filters, setFilters] = useState<Record<string, FilterKey[]>>(() => Object.fromEntries(flattenColumns(columns).map((item, index) => [columnKey(item, index), item.defaultFilteredValue ?? []])))
  const [filterOpen, setFilterOpen] = useState<string | null>(null)
  const [filterDraft, setFilterDraft] = useState<Record<string, FilterKey[]>>({})
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(() => new Set(rowSelection?.defaultSelectedRowKeys ?? []))
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(() => new Set(expandable?.defaultExpandedRowKeys ?? []))
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1440 : window.innerWidth)
  const [loadingVisible, setLoadingVisible] = useState(typeof loading === 'boolean' ? loading : loading.spinning ?? true)
  const [scrollBoundary, setScrollBoundary] = useState({ left: false, right: false })
  const measureScrollBoundary = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const maxScrollLeft = Math.max(0, node.scrollWidth - node.clientWidth)
    const next = { left: node.scrollLeft > 1, right: node.scrollLeft < maxScrollLeft - 1 }
    setScrollBoundary((current) => current.left === next.left && current.right === next.right ? current : next)
  }, [])
  const handleScrollKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const node = event.currentTarget
    const horizontalStep = Math.max(48, Math.round(node.clientWidth * 0.15))
    const verticalStep = Math.max(48, Math.round(node.clientHeight * 0.8))
    const movement = event.key === 'ArrowLeft' && scroll?.x ? { left: -horizontalStep }
      : event.key === 'ArrowRight' && scroll?.x ? { left: horizontalStep }
        : event.key === 'PageUp' && scroll?.y ? { top: -verticalStep }
          : event.key === 'PageDown' && scroll?.y ? { top: verticalStep }
            : null
    if (!movement) return
    event.preventDefault()
    node.scrollBy({ ...movement, behavior: 'smooth' })
  }, [scroll?.x, scroll?.y])

  useEffect(() => {
    const listener = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [])

  useEffect(() => {
    const spinning = typeof loading === 'boolean' ? loading : loading.spinning ?? true
    if (!spinning) { setLoadingVisible(false); return }
    const delay = typeof loading === 'object' ? loading.delay ?? 0 : 0
    if (!delay) { setLoadingVisible(true); return }
    const timer = window.setTimeout(() => setLoadingVisible(true), delay)
    return () => window.clearTimeout(timer)
  }, [loading])

  const keyOf = useCallback((record: T, index?: number): Key => typeof rowKey === 'function' ? rowKey(record, index) : (record[rowKey] as Key), [rowKey])
  const childrenName = expandable?.childrenColumnName ?? 'children'
  const controlledExpanded = expandable?.expandedRowKeys ? new Set(expandable.expandedRowKeys) : expandedKeys
  const controlledSelected = rowSelection?.selectedRowKeys ? new Set(rowSelection.selectedRowKeys) : selectedKeys
  const allDataRows = useMemo(() => {
    const result: T[] = []
    const walk = (items: T[]) => items.forEach((item) => { result.push(item); const children = (item as Record<string, unknown>)[childrenName] as T[] | undefined; if (children?.length) walk(children) })
    walk(dataSource)
    return result
  }, [childrenName, dataSource])

  useEffect(() => {
    allDataRows.forEach((record, index) => selectionCache.current.set(keyOf(record, index), record))
    if (!rowSelection?.preserveSelectedRowKeys && !rowSelection?.selectedRowKeys) {
      const available = new Set(allDataRows.map((record, index) => keyOf(record, index)))
      setSelectedKeys((current) => new Set([...current].filter((key) => available.has(key))))
    }
  // keyOf intentionally follows the current rowKey prop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDataRows, rowSelection?.preserveSelectedRowKeys, rowSelection?.selectedRowKeys])

  useEffect(() => {
    if (!expandable?.defaultExpandAllRows) return
    const keys: Key[] = []
    const walk = (items: T[]) => items.forEach((item) => {
      const children = (item as Record<string, unknown>)[childrenName] as T[] | undefined
      if ((children?.length || expandable.expandedRowRender) && (expandable.rowExpandable?.(item) ?? true)) keys.push(keyOf(item))
      if (children?.length) walk(children)
    })
    walk(dataSource)
    setExpandedKeys(new Set(keys))
  // This is an initial default, matching defaultExpandAllRows semantics.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const responsiveColumns = useMemo(() => {
    const visible = (item: ColumnType<T>) => !item.hidden && (!item.responsive?.length || item.responsive.some((point) => viewportWidth >= breakpointWidths[point]))
    const visit = (items: ColumnsType<T>): ColumnsType<T> => items.filter(visible).map((item) => ({ ...item, children: item.children ? visit(item.children) : undefined })).filter((item) => !item.children || item.children.length > 0)
    return visit(columns)
  }, [columns, viewportWidth])
  const leafColumns = useMemo(() => flattenColumns(responsiveColumns), [responsiveColumns])
  const activeFilters = useMemo(() => Object.fromEntries(leafColumns.map((item, index) => {
    const key = columnKey(item, index)
    return [key, item.filteredValue !== undefined ? item.filteredValue ?? [] : filters[key] ?? []]
  })), [filters, leafColumns])
  const activeSorts = useMemo(() => leafColumns.flatMap((item, index) => item.sortOrder !== undefined ? [{ column: item, key: columnKey(item, index), order: item.sortOrder, priority: typeof item.sorter === 'object' ? item.sorter.multiple ?? 0 : 0 }] : sortStates.filter((state) => state.key === columnKey(item, index))), [leafColumns, sortStates])

  const processData = useCallback((items: T[], filterState: Record<string, FilterKey[]>, sortState: SortState<T>[]): T[] => {
    const ordered = [...sortState].filter((state) => state.order && (typeof state.column.sorter === 'function' || (typeof state.column.sorter === 'object' && state.column.sorter.compare))).sort((a, b) => b.priority - a.priority)
    const filtered = items.filter((record) => leafColumns.every((item, index) => {
      const values = filterState[columnKey(item, index)]
      return !values?.length || !item.onFilter || values.some((value) => item.onFilter?.(value, record))
    })).map((record) => {
      const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined
      return children?.length ? { ...record, [childrenName]: processData(children, filterState, sortState) } : record
    })
    return ordered.length ? [...filtered].sort((left, right) => {
      for (const state of ordered) {
        const sorter = state.column.sorter
        const compare = typeof sorter === 'function' ? sorter : typeof sorter === 'object' ? sorter.compare : undefined
        const result = compare?.(left, right, state.order) ?? 0
        if (result) return state.order === 'ascend' ? result : -result
      }
      return 0
    }) : filtered
  }, [childrenName, leafColumns])
  const processed = useMemo(() => processData(dataSource, activeFilters, activeSorts), [activeFilters, activeSorts, dataSource, processData])

  const pageConfig = pagination === false ? null : pagination
  const page = pageConfig?.current ?? internalPage
  const pageSize = pageConfig?.pageSize ?? internalPageSize
  const total = pageConfig?.total ?? processed.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const serverPaginated = Boolean(pageConfig?.total !== undefined && pageConfig.total > processed.length)
  const pageData = pageConfig ? serverPaginated ? processed : processed.slice((safePage - 1) * pageSize, safePage * pageSize) : processed

  const selectionEntities = useMemo(() => {
    const entities = new Map<Key, { record: T; parent?: Key; children: Key[] }>()
    const walk = (items: T[], parent?: Key) => items.forEach((record, index) => {
      const key = keyOf(record, index)
      const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined
      const childKeys = children?.map((child, childIndex) => keyOf(child, childIndex)) ?? []
      entities.set(key, { record, parent, children: childKeys })
      if (children?.length) walk(children, key)
    })
    walk(dataSource)
    return entities
  }, [childrenName, dataSource, keyOf])

  const pageSelectionRows = useMemo(() => {
    const rows: T[] = []
    const walk = (items: T[]) => items.forEach((record) => {
      rows.push(record)
      const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined
      if (children?.length) walk(children)
    })
    walk(pageData)
    return rows
  }, [childrenName, pageData])

  const flattenRows = (items: T[], depth = 0, parent?: Key): FlatRow<T>[] => items.flatMap((record) => {
    const key = keyOf(record)
    const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined
    return [{ record, depth, parent }, ...(children?.length && controlledExpanded.has(key) ? flattenRows(children, depth + 1, key) : [])]
  })
  const allFlatRows = flattenRows(pageData)
  const rowHeight = size === 'small' ? 39 : size === 'medium' ? 47 : 55
  const viewportHeight = typeof scroll?.y === 'number' ? scroll.y : 400
  const virtualStart = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - 3) : 0
  const virtualCount = virtual ? Math.ceil(viewportHeight / rowHeight) + 6 : allFlatRows.length
  const renderedRows = virtual ? allFlatRows.slice(virtualStart, virtualStart + virtualCount) : allFlatRows
  const topPad = virtual ? virtualStart * rowHeight : 0
  const bottomPad = virtual ? Math.max(0, (allFlatRows.length - virtualStart - renderedRows.length) * rowHeight) : 0

  const emitChange = (action: 'paginate' | 'sort' | 'filter', nextPage = safePage, nextPageSize = pageSize, nextFilters = activeFilters, nextSorts = activeSorts) => {
    const sorterInfo: SorterResult<T>[] = nextSorts.filter((item) => item.order).map((item) => ({ column: item.column, columnKey: item.key, field: item.column.dataIndex as Key | readonly Key[] | undefined, order: item.order }))
    const reportedFilters = Object.fromEntries(leafColumns.flatMap((item, index) => {
      const key = columnKey(item, index)
      return item.filters?.length || item.filterDropdown || item.filteredValue !== undefined || item.defaultFilteredValue !== undefined ? [[key, nextFilters[key]?.length ? nextFilters[key] : null]] : []
    })) as Record<string, FilterValue>
    onChange?.({ ...pageConfig, current: nextPage, pageSize: nextPageSize, total }, reportedFilters, sorterInfo.length > 1 ? sorterInfo : sorterInfo[0] ?? {}, { currentDataSource: processData(dataSource, nextFilters, nextSorts), action })
  }

  const changePage = (next: number, nextSize = pageSize) => {
    const bounded = Math.max(1, Math.min(Math.max(1, Math.ceil(total / nextSize)), next))
    setInternalPage(bounded)
    setInternalPageSize(nextSize)
    pageConfig?.onChange?.(bounded, nextSize)
    emitChange('paginate', bounded, nextSize)
    if (scroll?.scrollToFirstRowOnChange !== false && typeof scrollRef.current?.scrollTo === 'function') scrollRef.current.scrollTo({ top: 0 })
  }

  const toggleSort = (item: ColumnType<T>, index: number) => {
    if (!item.sorter || item.sortOrder !== undefined) return
    const key = columnKey(item, index)
    const current = sortStates.find((state) => state.key === key)?.order ?? null
    const directions = item.sortDirections ?? sortDirections
    const cycle = directions.includes(null) ? directions : [...directions, null]
    const nextOrder = cycle[(cycle.indexOf(current) + 1) % cycle.length]
    const priority = typeof item.sorter === 'object' ? item.sorter.multiple ?? 0 : 0
    const next = priority ? [...sortStates.filter((state) => state.key !== key), { column: item, key, order: nextOrder, priority }] : [{ column: item, key, order: nextOrder, priority }]
    setSortStates(next.filter((state) => state.order))
    emitChange('sort', safePage, pageSize, activeFilters, next)
    if (scroll?.scrollToFirstRowOnChange !== false && typeof scrollRef.current?.scrollTo === 'function') scrollRef.current.scrollTo({ top: 0 })
  }

  const applyFilter = (item: ColumnType<T>, index: number, values = filterDraft[columnKey(item, index)] ?? [], closeDropdown = true) => {
    const key = columnKey(item, index)
    const next = { ...activeFilters, [key]: values }
    setFilters((current) => ({ ...current, [key]: values }))
    if (closeDropdown) {
      setFilterOpen(null)
      item.filterDropdownProps?.onOpenChange?.(false)
    }
    setInternalPage(1)
    pageConfig?.onChange?.(1, pageSize)
    emitChange('filter', 1, pageSize, next)
    if (scroll?.scrollToFirstRowOnChange !== false && typeof scrollRef.current?.scrollTo === 'function') scrollRef.current.scrollTo({ top: 0 })
  }

  const closeFilter = (item: ColumnType<T>, index: number) => {
    const key = columnKey(item, index)
    if (item.filterOnClose !== false) applyFilter(item, index, filterDraft[key] ?? activeFilters[key] ?? [])
    else { setFilterOpen(null); item.filterDropdownProps?.onOpenChange?.(false) }
  }

  const updateSelection = (next: Set<Key>, type: RowSelectMethod, record?: T, selected?: boolean, event?: Event) => {
    if (!rowSelection?.selectedRowKeys) setSelectedKeys(next)
    const source = rowSelection?.preserveSelectedRowKeys ? [...selectionCache.current.values()] : allDataRows
    const selectedRows = source.filter((row) => next.has(keyOf(row)))
    rowSelection?.onChange?.([...next], selectedRows, { type })
    if (record && event) rowSelection?.onSelect?.(record, Boolean(selected), selectedRows, event)
    return selectedRows
  }

  const changeableRows = pageSelectionRows.filter((record) => !rowSelection?.getCheckboxProps?.(record).disabled)
  const changeableKeys = changeableRows.map((record) => keyOf(record))
  const allChecked = changeableKeys.length > 0 && changeableKeys.every((key) => controlledSelected.has(key))
  const partlyChecked = !allChecked && changeableKeys.some((key) => controlledSelected.has(key))
  const selectAll = (selected: boolean) => {
    const next = new Set(controlledSelected)
    const changed = changeableRows.filter((record) => selected !== next.has(keyOf(record)))
    changeableKeys.forEach((key) => selected ? next.add(key) : next.delete(key))
    const selectedRows = updateSelection(next, selected ? 'all' : 'none')
    rowSelection?.onSelectAll?.(selected, selectedRows, changed)
    if (!selected) rowSelection?.onSelectNone?.()
  }
  const invertSelection = () => {
    const next = new Set(controlledSelected)
    changeableKeys.forEach((key) => next.has(key) ? next.delete(key) : next.add(key))
    updateSelection(next, 'invert')
    rowSelection?.onSelectInvert?.([...next])
  }

  const conductTreeSelection = (next: Set<Key>, record: T, selected: boolean) => {
    const key = keyOf(record)
    const visit = (currentKey: Key) => {
      const entity = selectionEntities.get(currentKey)
      if (!entity) return
      if (!rowSelection?.getCheckboxProps?.(entity.record).disabled) {
        if (selected) next.add(currentKey)
        else next.delete(currentKey)
      }
      entity.children.forEach(visit)
    }
    visit(key)
    let parentKey = selectionEntities.get(key)?.parent
    while (parentKey !== undefined) {
      const parent = selectionEntities.get(parentKey)
      if (!parent) break
      if (!rowSelection?.getCheckboxProps?.(parent.record).disabled) {
        const selectableChildren = parent.children.filter((childKey) => {
          const child = selectionEntities.get(childKey)
          return child && !rowSelection?.getCheckboxProps?.(child.record).disabled
        })
        if (selectableChildren.length && selectableChildren.every((childKey) => next.has(childKey))) next.add(parentKey)
        else next.delete(parentKey)
      }
      parentKey = parent.parent
    }
  }

  const treeSelectionIndeterminate = (key: Key): boolean => {
    if (rowSelection?.checkStrictly !== false || controlledSelected.has(key)) return false
    const entity = selectionEntities.get(key)
    return Boolean(entity?.children.some((childKey) => controlledSelected.has(childKey) || treeSelectionIndeterminate(childKey)))
  }

  const toggleExpand = (record: T) => {
    const key = keyOf(record)
    const next = new Set(controlledExpanded)
    const expanded = !next.has(key)
    if (expanded) next.add(key); else next.delete(key)
    if (!expandable?.expandedRowKeys) setExpandedKeys(next)
    expandable?.onExpand?.(expanded, record)
    expandable?.onExpandedRowsChange?.([...next])
  }

  const selectionWidth = rowSelection ? Number(rowSelection.columnWidth ?? 48) : 0
  const expandWidth = expandable && expandable.showExpandColumn !== false ? Number(expandable.columnWidth ?? 48) : 0
  const leftOffsets = useMemo(() => {
    let offset = selectionWidth + expandWidth
    const map: Record<string, number> = {}
    leafColumns.forEach((item, index) => { if (fixedSide(item.fixed as ColumnType<object>['fixed']) === 'left') { map[columnKey(item, index)] = offset; offset += Number(item.width ?? 120) } })
    return map
  }, [expandWidth, leafColumns, selectionWidth])
  const rightOffsets = useMemo(() => {
    let offset = fixedSide(expandable?.fixed as ColumnType<object>['fixed']) === 'right' ? expandWidth : 0
    const map: Record<string, number> = {}
    ;[...leafColumns].reverse().forEach((item, reverseIndex) => { const index = leafColumns.length - reverseIndex - 1; if (fixedSide(item.fixed as ColumnType<object>['fixed']) === 'right') { map[columnKey(item, index)] = offset; offset += Number(item.width ?? 120) } })
    return map
  }, [expandWidth, expandable?.fixed, leafColumns])
  const fixedStyle = (item: ColumnType<T>, index: number): CSSProperties => { const key = columnKey(item, index); if (key in leftOffsets) return { position: 'sticky', left: leftOffsets[key], zIndex: 2 }; if (key in rightOffsets) return { position: 'sticky', right: rightOffsets[key], zIndex: 2 }; return {} }
  const selectionFixedStyle: CSSProperties = fixedSide(rowSelection?.fixed as ColumnType<object>['fixed']) === 'left' ? { position: 'sticky', left: 0, zIndex: 3 } : {}
  const expandSide = fixedSide(expandable?.fixed as ColumnType<object>['fixed'])
  const expandFixedStyle: CSSProperties = expandSide === 'left' ? { position: 'sticky', left: selectionWidth, zIndex: 3 } : expandSide === 'right' ? { position: 'sticky', right: 0, zIndex: 3 } : {}
  const extraColumnCount = (rowSelection ? 1 : 0) + (expandable && expandable.showExpandColumn !== false ? 1 : 0)
  const fullColSpan = leafColumns.length + extraColumnCount
  const lastLeftFixedIndex = leafColumns.reduce((last, item, index) => fixedSide(item.fixed as ColumnType<object>['fixed']) === 'left' ? index : last, -1)
  const firstRightFixedIndex = leafColumns.findIndex((item) => fixedSide(item.fixed as ColumnType<object>['fixed']) === 'right')
  const fixedClass = (item: ColumnType<T>, index: number) => {
    const side = fixedSide(item.fixed as ColumnType<object>['fixed'])
    if (side === 'left') return `orbit-table__fixed-left ${index === lastLeftFixedIndex ? 'orbit-table__fixed-left-last' : ''}`
    if (side === 'right') return `orbit-table__fixed-right ${index === firstRightFixedIndex ? 'orbit-table__fixed-right-first' : ''}`
    return ''
  }
  const selectionSide = fixedSide(rowSelection?.fixed as ColumnType<object>['fixed'])
  const selectionBoundaryClass = selectionSide === 'left' && expandSide !== 'left' && lastLeftFixedIndex < 0 ? 'orbit-table__fixed-left orbit-table__fixed-left-last' : selectionSide === 'right' && expandSide !== 'right' && firstRightFixedIndex < 0 ? 'orbit-table__fixed-right orbit-table__fixed-right-first' : selectionSide ? `orbit-table__fixed-${selectionSide}` : ''
  const expandBoundaryClass = expandSide === 'left' && lastLeftFixedIndex < 0 ? 'orbit-table__fixed-left orbit-table__fixed-left-last' : expandSide === 'right' && firstRightFixedIndex < 0 ? 'orbit-table__fixed-right orbit-table__fixed-right-first' : expandSide ? `orbit-table__fixed-${expandSide}` : ''

  useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
    scrollTo: ({ index, key, top, offset = 0, align = 'nearest' }) => {
      if (top !== undefined) scrollRef.current?.scrollTo({ top })
      else if (virtual && (index !== undefined || key !== undefined)) {
        const targetIndex = key !== undefined ? allFlatRows.findIndex((item, itemIndex) => keyOf(item.record, itemIndex) === key) : index ?? -1
        if (targetIndex < 0) return
        const targetStart = targetIndex * rowHeight
        const targetEnd = targetStart + rowHeight
        const currentTop = scrollRef.current?.scrollTop ?? 0
        const currentEnd = currentTop + viewportHeight
        const aligned = align === 'start' ? targetStart : align === 'center' ? targetStart - (viewportHeight - rowHeight) / 2 : align === 'end' ? targetEnd - viewportHeight : targetStart < currentTop ? targetStart : targetEnd > currentEnd ? targetEnd - viewportHeight : currentTop
        scrollRef.current?.scrollTo({ top: Math.max(0, aligned + offset) })
      }
      else {
        const target = key !== undefined ? rootRef.current?.querySelector(`[data-row-key="${CSS.escape(String(key))}"]`) : index !== undefined ? rootRef.current?.querySelectorAll('[data-row-key]')[index] : null
        target?.scrollIntoView({ block: align })
        if (offset && typeof scrollRef.current?.scrollBy === 'function') scrollRef.current.scrollBy({ top: offset })
      }
    },
  }), [allFlatRows, keyOf, rowHeight, viewportHeight, virtual])

  const columnTitleProps: ColumnTitleProps<T> = {
    sortColumns: activeSorts.filter((state) => state.order).map((state) => ({ column: state.column, order: state.order })),
    filters: activeFilters as Record<string, FilterValue>,
  }
  columnTitleProps.sortOrder = columnTitleProps.sortColumns[0]?.order
  columnTitleProps.sortColumn = columnTitleProps.sortColumns[0]?.column
  const renderTitle = (item: ColumnType<T>) => typeof item.title === 'function' ? item.title(columnTitleProps) : item.title
  const nextSortLabel = (item: ColumnType<T>, order: SortOrder) => {
    const directions = item.sortDirections ?? sortDirections
    const cycle = directions.includes(null) ? directions : [...directions, null]
    const next = cycle[(cycle.indexOf(order) + 1) % cycle.length]
    return next === 'ascend' ? locale.triggerAsc ?? '오름차순 정렬' : next === 'descend' ? locale.triggerDesc ?? '내림차순 정렬' : locale.cancelSort ?? '정렬 해제'
  }

  const HeaderRow = components?.header?.row ?? 'tr'
  const HeaderCell = components?.header?.cell ?? 'th'
  const renderHeaderRows = () => {
    const depth = maxDepth(responsiveColumns)
    return Array.from({ length: depth }, (_, level) => {
      const cells: ReactNode[] = []
      const visit = (items: ColumnsType<T>, current: number) => items.forEach((item) => {
        if (current === level) {
          const leafIndex = leafColumns.indexOf(item)
          const key = columnKey(item, leafIndex)
          const order = activeSorts.find((state) => state.key === key)?.order ?? null
          const tooltip = item.showSorterTooltip ?? showSorterTooltip
          const tooltipTitle = typeof tooltip === 'object' && tooltip.title ? String(tooltip.title) : nextSortLabel(item, order)
          const headerProps = item.onHeaderCell?.(item, leafIndex) ?? {}
          const customProps = components?.header?.cell ? { column: item, index: leafIndex } : {}
          const itemLeaves = item.children?.length ? flattenColumns(item.children) : [item]
          const visualLastIndex = leafColumns.indexOf(itemLeaves[itemLeaves.length - 1])
          const resolvedColSpan = item.children?.length ? leafCount(item) : item.colSpan
          const filterIsOpen = item.filterDropdownProps?.open ?? filterOpen === key
          if (resolvedColSpan === 0 || item.rowSpan === 0) return
          cells.push(<HeaderCell
            key={`${key}-${level}`}
            colSpan={resolvedColSpan}
            rowSpan={item.children?.length ? 1 : item.rowSpan ?? depth - level}
            {...customProps}
            {...headerProps}
            title={tooltip && item.sorter && (typeof tooltip !== 'object' || tooltip.target !== 'sorter-icon') ? tooltipTitle : headerProps.title}
            style={{ width: item.width, minWidth: tableLayout === 'auto' ? item.minWidth : undefined, textAlign: item.align, ...(!item.children ? fixedStyle(item, leafIndex) : {}), ...headerStyles?.cell, ...styles.cell, ...headerProps.style }}
            className={`${headerClasses?.cell ?? ''} ${classNames.cell ?? ''} ${item.className ?? ''} ${!item.children ? fixedClass(item, leafIndex) : ''} ${visualLastIndex === leafColumns.length - 1 ? 'orbit-table__cell--last' : ''} ${order ? 'is-sorted' : ''} ${headerProps.className ?? ''}`}
          >
            <span className={`orbit-table__header-content ${item.sorter ? 'is-sortable' : ''}`} onClick={item.sorter ? () => toggleSort(item, leafIndex) : undefined}>
              <span>{renderTitle(item)}</span>
              {item.sorter && !item.children && <button type="button" className="orbit-table__icon-button" onClick={(event) => { event.stopPropagation(); toggleSort(item, leafIndex) }} aria-label={`${String(renderTitle(item))} 정렬`} title={tooltip && typeof tooltip === 'object' && tooltip.target === 'sorter-icon' ? tooltipTitle : undefined}>{item.sortIcon?.({ sortOrder: order }) ?? <SortGlyph order={order} />}</button>}
              {(item.filters?.length || item.filterDropdown) && !item.children ? <span className="orbit-table__filter-wrap"><button ref={(node) => { if (node) filterTriggers.current.set(key, node); else filterTriggers.current.delete(key) }} type="button" className={`orbit-table__icon-button ${item.filtered || activeFilters[key]?.length ? 'is-active' : ''}`} onClick={(event) => { event.stopPropagation(); const open = !filterIsOpen; setFilterDraft((draft) => ({ ...draft, [key]: activeFilters[key] ?? [] })); setFilterOpen(open ? key : null); item.filterDropdownProps?.onOpenChange?.(open) }} aria-label={`${String(renderTitle(item))} 필터`} aria-haspopup="dialog" aria-expanded={filterIsOpen}>{typeof item.filterIcon === 'function' ? item.filterIcon(Boolean(item.filtered || activeFilters[key]?.length)) : item.filterIcon ?? <FilterGlyph />}</button>{filterIsOpen && <FilterMenu item={item} values={filterDraft[key] ?? []} locale={locale} trigger={filterTriggers.current.get(key)} popupContainer={filterTriggers.current.get(key) && getPopupContainer?.(filterTriggers.current.get(key)!)} className={item.filterDropdownProps?.className} onValues={(values) => setFilterDraft((draft) => ({ ...draft, [key]: values }))} onApply={(values) => applyFilter(item, leafIndex, values)} onClose={() => closeFilter(item, leafIndex)} />}</span> : null}
            </span>
          </HeaderCell>)
        } else if (item.children?.length) visit(item.children, current + 1)
      })
      visit(responsiveColumns, 0)

      const titleCheckbox = rowSelection && rowSelection.type !== 'radio' && !rowSelection.hideSelectAll ? <SelectionCheckbox aria-label="모든 행 선택" {...rowSelection.getTitleCheckboxProps?.()} checked={allChecked} indeterminate={partlyChecked} onChange={(event) => selectAll(event.target.checked)} /> : null
      const selectionTitle = rowSelection ? typeof rowSelection.columnTitle === 'function' ? rowSelection.columnTitle(titleCheckbox) : rowSelection.columnTitle ?? titleCheckbox : null
      const headerRowProps = onHeaderRow?.(responsiveColumns, level) ?? {}
      return <HeaderRow key={level} {...(components?.header?.row ? { columns: responsiveColumns, index: level } : {})} {...headerRowProps} className={`${headerClasses?.row ?? ''} ${headerRowProps.className ?? ''}`} style={{ ...headerStyles?.row, ...headerRowProps.style }}>
        {level === 0 && rowSelection && <HeaderCell rowSpan={depth} className={`orbit-table__selection-cell ${selectionBoundaryClass}`} style={{ width: rowSelection.columnWidth ?? 48, textAlign: rowSelection.align, ...selectionFixedStyle }}><span className="orbit-table__selection-head">{selectionTitle}{rowSelection.selections && !rowSelection.hideSelectAll && <SelectionMenu rowSelection={rowSelection} changeableKeys={changeableKeys} onAll={() => selectAll(true)} onInvert={invertSelection} onNone={() => selectAll(false)} locale={locale} />}</span></HeaderCell>}
        {level === 0 && expandable && expandable.showExpandColumn !== false && <HeaderCell rowSpan={depth} className={`orbit-table__expand-cell ${expandBoundaryClass}`} style={{ width: expandable.columnWidth ?? 48, ...expandFixedStyle }}>{expandable.columnTitle ?? <span className="orbit-sr-only">{locale.expand ?? '행 펼치기'}</span>}</HeaderCell>}
        {cells}
      </HeaderRow>
    })
  }

  const RowComponent = components?.body?.row ?? 'tr'
  const Cell = components?.body?.cell ?? 'td'
  const renderRow = ({ record, depth }: FlatRow<T>, visibleIndex: number) => {
    const actualIndex = virtualStart + visibleIndex
    const key = keyOf(record, actualIndex)
    const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined
    const canExpand = Boolean(children?.length || expandable?.expandedRowRender) && (expandable?.rowExpandable?.(record) ?? true)
    const expanded = controlledExpanded.has(key)
    const rowProps = onRow?.(record, actualIndex) ?? {}
    const customRowProps = components?.body?.row ? { record, index: actualIndex } : {}
    const customClass = rowClassName?.(record, actualIndex, depth) ?? ''
    const rowClass = `${bodyClasses?.row ?? ''} ${classNames.row ?? ''} ${customClass} ${controlledSelected.has(key) ? 'is-selected' : ''} ${rowProps.className ?? ''}`
    const checkboxProps = rowSelection?.getCheckboxProps?.(record) ?? {}
    const selectionCellProps = rowSelection?.onCell?.(record, actualIndex) ?? {}
    const checked = controlledSelected.has(key)
    const selection = rowSelection
    const selectionInputProps = selection ? { ...checkboxProps, name: selection.type === 'radio' ? selectionName : checkboxProps.name, checked, 'aria-label': checkboxProps['aria-label'] ?? `${String(key)} 행 선택`, onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = selection.type === 'radio' ? new Set<Key>() : new Set(controlledSelected)
      const native = event.nativeEvent as MouseEvent
      if (native.shiftKey && lastSelectedIndex.current !== null && selection.type !== 'radio') {
        const start = Math.min(lastSelectedIndex.current, actualIndex)
        const end = Math.max(lastSelectedIndex.current, actualIndex)
        const changed = allFlatRows.slice(start, end + 1).map((item) => item.record).filter((item) => !selection.getCheckboxProps?.(item).disabled)
        changed.forEach((item) => event.target.checked ? next.add(keyOf(item)) : next.delete(keyOf(item)))
        const selectedRows = updateSelection(next, 'multiple')
        selection.onSelectMultiple?.(event.target.checked, selectedRows, changed)
      } else {
        if (selection.checkStrictly === false && selection.type !== 'radio') conductTreeSelection(next, record, event.target.checked)
        else if (event.target.checked) next.add(key)
        else next.delete(key)
        updateSelection(next, selection.type === 'radio' ? 'single' : 'multiple', record, event.target.checked, event.nativeEvent)
      }
      lastSelectedIndex.current = actualIndex
    } } : null
    const originSelectionNode = selection && selectionInputProps ? selection.type === 'radio' ? <input {...selectionInputProps} type="radio" /> : <SelectionCheckbox {...selectionInputProps} indeterminate={treeSelectionIndeterminate(key)} /> : null
    const renderedSelection = rowSelection?.renderCell?.(checked, record, actualIndex, originSelectionNode)
    const selectionRenderedCell = renderedSelection && isRenderedCell(renderedSelection) ? renderedSelection : null

    return <Fragment key={key}><RowComponent
      data-row-key={key}
      data-row-depth={depth}
      {...customRowProps}
      {...rowProps}
      className={rowClass}
      style={{ height: virtual ? rowHeight : undefined, ...bodyStyles?.row, ...styles.row, ...rowProps.style }}
      onClick={(event) => { rowProps.onClick?.(event); const target = event.target as HTMLElement; if (expandable?.expandRowByClick && canExpand && !event.defaultPrevented && !target.closest?.('button, input, select, textarea, a, [role="button"], [role="link"]')) toggleExpand(record) }}
    >
      {rowSelection && <Cell {...(components?.body?.cell ? { record, index: actualIndex, column: 'selection' } : {})} {...selectionCellProps} {...selectionRenderedCell?.props} className={`orbit-table__selection-cell ${selectionBoundaryClass} ${selectionCellProps.className ?? ''} ${selectionRenderedCell?.props?.className ?? ''}`} style={{ width: rowSelection.columnWidth ?? 48, textAlign: rowSelection.align, ...selectionFixedStyle, ...selectionCellProps.style, ...selectionRenderedCell?.props?.style }}>{selectionRenderedCell ? selectionRenderedCell.children : renderedSelection ?? originSelectionNode}</Cell>}
      {expandable && expandable.showExpandColumn !== false && <Cell {...(components?.body?.cell ? { record, index: actualIndex, column: 'expand' } : {})} className={`orbit-table__expand-cell orbit-table__expand-cell--body ${expandBoundaryClass}`} style={{ width: expandable.columnWidth ?? 48, ...expandFixedStyle }}><span className="orbit-table__expand-indent" style={{ paddingInlineStart: 15 + depth * (expandable.indentSize ?? 15) }}>{expandable.expandIcon?.({ expanded, record, expandable: canExpand, onExpand: (item, event) => { event.stopPropagation(); toggleExpand(item) } }) ?? (canExpand ? <button type="button" className="orbit-table__expand" aria-expanded={expanded} aria-label={expanded ? locale.collapse ?? '행 접기' : locale.expand ?? '행 펼치기'} onClick={(event) => { event.stopPropagation(); toggleExpand(record) }}>{expanded ? '−' : '+'}</button> : <span className="orbit-table__expand-placeholder" aria-hidden />)}</span></Cell>}
      {leafColumns.map((item, columnIndex) => <BodyCell key={columnKey(item, columnIndex)} component={Cell} custom={Boolean(components?.body?.cell)} item={item} record={record} rowIndex={actualIndex} fixedStyle={fixedStyle(item, columnIndex)} className={`${bodyClasses?.cell ?? ''} ${classNames.cell ?? ''} ${fixedClass(item, columnIndex)} ${columnIndex === leafColumns.length - 1 ? 'orbit-table__cell--last' : ''}`} style={{ ...bodyStyles?.cell, ...styles.cell }} />)}
    </RowComponent>{expandable?.expandedRowRender && expanded && <tr className={`orbit-table__expanded ${typeof expandable.expandedRowClassName === 'function' ? expandable.expandedRowClassName(record, actualIndex, depth) : expandable.expandedRowClassName ?? ''}`}><td className="orbit-table__cell--last" colSpan={fullColSpan}>{expandable.expandedRowRender(record, actualIndex, depth, expanded)}</td></tr>}</Fragment>
  }

  const placements = pageConfig ? normalizePlacement(pageConfig).filter((item) => item !== 'none') : []
  const renderPagination = (placement: PaginationPlacement) => pageConfig && total > 0 && !(pageConfig.hideOnSinglePage && pageCount <= 1) ? <Pagination key={placement} config={pageConfig} page={safePage} pageSize={pageSize} total={total} pageCount={pageCount} placement={placement} onChange={changePage} className={`${typeof classNames.pagination === 'string' ? classNames.pagination : paginationClasses?.root ?? ''}`} style={(typeof styles.pagination === 'object' && !paginationStyles ? styles.pagination : paginationStyles?.root) as CSSProperties | undefined} /> : null
  const topPagination = placements.filter((item) => item.startsWith('top')).map(renderPagination)
  const bottomPagination = placements.filter((item) => item.startsWith('bottom')).map(renderPagination)
  const TableElement = components?.table ?? 'table'
  const HeaderWrapper = components?.header?.wrapper ?? 'thead'
  const BodyWrapper = components?.body?.wrapper ?? 'tbody'
  const effectiveLayout = tableLayout === 'fixed' || scroll?.x || leafColumns.some((item) => item.ellipsis || item.fixed) ? 'fixed' : 'auto'
  const emptyText = typeof locale.emptyText === 'function' ? locale.emptyText() : locale.emptyText ?? <DefaultEmpty />
  const loadingConfig = typeof loading === 'object' ? loading : undefined
  const summaryContent = summary?.(pageData)
  const compoundSummary = isValidElement(summaryContent) && summaryContent.type === SummaryBase
  const summaryFixed = compoundSummary ? (summaryContent as ReactElement<TableSummaryProps>).props.fixed : false
  const summaryPosition = summaryFixed === 'top' ? 'top' : summaryFixed ? 'bottom' : null
  const SummaryWrapper = summaryPosition === 'top' ? 'tbody' : 'tfoot'
  const summaryElement = summary ? <SummaryWrapper className={summaryPosition ? `is-sticky-summary is-sticky-summary--${summaryPosition}` : sticky && typeof sticky === 'object' && sticky.offsetSummary !== undefined ? 'is-sticky-summary is-sticky-summary--bottom' : undefined} style={summaryPosition === 'top' ? { top: (typeof sticky === 'object' ? sticky.offsetHeader ?? 0 : 0) + (showHeader ? maxDepth(responsiveColumns) * rowHeight : 0) } : summaryPosition === 'bottom' || sticky && typeof sticky === 'object' && sticky.offsetSummary !== undefined ? { bottom: typeof sticky === 'object' ? sticky.offsetSummary : 0 } : undefined}>{compoundSummary ? summaryContent : <tr><td className="orbit-table__cell--last" colSpan={fullColSpan}>{summaryContent}</td></tr>}</SummaryWrapper> : null
  const summaryRowCount = summary ? compoundSummary ? Children.count((summaryContent as ReactElement<TableSummaryProps>).props.children) : 1 : 0
  const wrapperMaxHeight = typeof scroll?.y === 'number' ? scroll.y + (showHeader ? maxDepth(responsiveColumns) * rowHeight : 0) + summaryRowCount * rowHeight : scroll?.y

  useLayoutEffect(() => {
    const node = scrollRef.current
    if (!scroll?.x || !node) { setScrollBoundary({ left: false, right: false }); return }
    measureScrollBoundary(node)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => measureScrollBoundary(node))
    observer.observe(node)
    const table = node.querySelector('table')
    if (table) observer.observe(table)
    return () => observer.disconnect()
  }, [leafColumns, measureScrollBoundary, pageData.length, scroll?.x])

  return <div {...rootProps} ref={rootRef} className={`orbit-table ${bordered ? 'orbit-table--bordered' : ''} orbit-table--${size} ${rowHoverable ? 'orbit-table--hoverable' : ''} ${rootClassName} ${className} ${classNames.root ?? ''}`} style={{ ...rootStyle, ...styles.root }} aria-busy={loadingVisible}>
    {topPagination}
    <div className={`orbit-table__section ${classNames.section ?? ''}`} style={styles.section}>
    {title && <div className={`orbit-table__title ${classNames.title ?? ''}`} style={styles.title}>{title(pageData)}</div>}
    <div ref={scrollRef} className={`orbit-table__wrapper ${scroll?.x ? 'is-scrollable-x' : ''} ${scrollBoundary.left ? 'has-scroll-left' : ''} ${scrollBoundary.right ? 'has-scroll-right' : ''} ${classNames.wrapper ?? ''} ${classNames.content ?? ''}`} role={scroll?.x || scroll?.y ? 'region' : undefined} aria-label={scroll?.x || scroll?.y ? '테이블 스크롤 영역' : undefined} tabIndex={scroll?.x || scroll?.y ? 0 : undefined} style={{ overflowX: scroll?.x ? 'auto' : undefined, overflowY: scroll?.y ? 'auto' : undefined, maxHeight: wrapperMaxHeight, ...styles.content, ...styles.wrapper }} onKeyDown={handleScrollKeyDown} onScroll={(event) => { if (virtual) setScrollTop(event.currentTarget.scrollTop); if (scroll?.x) measureScrollBoundary(event.currentTarget); onScroll?.(event) }}>
      <TableElement className={classNames.table} style={{ tableLayout: effectiveLayout, minWidth: typeof scroll?.x === 'number' ? scroll.x : scroll?.x === 'max-content' ? 'max-content' : undefined, ...styles.table }}>
        <colgroup>{rowSelection && <col style={{ width: rowSelection.columnWidth ?? 48 }} />}{expandable && expandable.showExpandColumn !== false && <col style={{ width: expandable.columnWidth ?? 48 }} />}{leafColumns.map((item, index) => <col key={columnKey(item, index)} style={{ width: item.width, minWidth: item.minWidth }} />)}</colgroup>
        {showHeader && <HeaderWrapper className={`${sticky ? 'is-sticky' : ''} ${typeof classNames.header === 'string' ? classNames.header : headerClasses?.wrapper ?? ''}`} style={{ top: typeof sticky === 'object' ? sticky.offsetHeader ?? 0 : 0, ...headerStyles?.wrapper }}>{renderHeaderRows()}</HeaderWrapper>}
        {summaryPosition === 'top' && summaryElement}
        <BodyWrapper className={`${typeof classNames.body === 'string' ? classNames.body : bodyClasses?.wrapper ?? ''}`} style={bodyStyles?.wrapper}>{topPad > 0 && <tr aria-hidden><td className="orbit-table__cell--last" colSpan={fullColSpan} style={{ height: topPad, padding: 0 }} /></tr>}{renderedRows.map(renderRow)}{bottomPad > 0 && <tr aria-hidden><td className="orbit-table__cell--last" colSpan={fullColSpan} style={{ height: bottomPad, padding: 0 }} /></tr>}{!loadingVisible && allFlatRows.length === 0 && <tr><td className="orbit-table__empty orbit-table__cell--last" colSpan={fullColSpan}>{emptyText}</td></tr>}</BodyWrapper>
        {summaryPosition !== 'top' && summaryElement}
      </TableElement>
      {loadingVisible && <div className={`orbit-table__loading ${loadingConfig?.className ?? ''}`} style={loadingConfig?.style}><div className="orbit-table__loading-content">{loadingConfig?.indicator ?? <span className="orbit-table__spinner" aria-hidden />}{loadingConfig?.tip && <span>{loadingConfig.tip}</span>}<span className="orbit-sr-only">로딩 중</span></div></div>}
    </div>
    {footer && <div className={`orbit-table__footer ${classNames.footer ?? ''}`} style={styles.footer}>{footer(pageData)}</div>}
    </div>
    {bottomPagination}
  </div>
}

type BodyCellProps<T extends object> = {
  component: CellComponent
  custom: boolean
  item: ColumnType<T>
  record: T
  rowIndex: number
  fixedStyle: CSSProperties
  className: string
  style: CSSProperties
}

function BodyCellInner<T extends object>({ component: Cell, custom, item, record, rowIndex, fixedStyle, className, style }: BodyCellProps<T>) {
  const value = getValue(record, item.dataIndex)
  const cellProps = item.onCell?.(record, rowIndex) ?? {}
  const rendered = item.render ? item.render(value, record, rowIndex) : String(value ?? '')
  const renderedCell = isRenderedCell(rendered) ? rendered : null
  const mergedProps = { ...cellProps, ...renderedCell?.props }
  if (mergedProps.colSpan === 0 || mergedProps.rowSpan === 0) return null
  return <Cell
    {...(custom ? { record, index: rowIndex, column: item } : {})}
    {...mergedProps}
    scope={item.rowScope}
    title={item.ellipsis && (typeof item.ellipsis === 'boolean' || item.ellipsis.showTitle !== false) ? String(value ?? '') : mergedProps.title}
    className={`${className} ${item.className ?? ''} ${item.ellipsis ? 'orbit-table__ellipsis' : ''} ${mergedProps.className ?? ''}`}
    style={{ width: item.width, minWidth: item.minWidth, textAlign: item.align, ...fixedStyle, ...style, ...mergedProps.style }}
  >{renderedCell ? renderedCell.children : rendered}</Cell>
}

const BodyCell = memo(BodyCellInner, (previous, next) => {
  if (previous.item !== next.item || previous.rowIndex !== next.rowIndex || previous.component !== next.component || previous.className !== next.className) return false
  return next.item.shouldCellUpdate ? !next.item.shouldCellUpdate(next.record, previous.record) : false
}) as typeof BodyCellInner

function SelectionCheckbox({ indeterminate, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (ref.current) ref.current.indeterminate = Boolean(indeterminate) }, [indeterminate])
  return <input ref={ref} type="checkbox" {...props} />
}

function SelectionMenu<T extends object>({ rowSelection, changeableKeys, onAll, onInvert, onNone, locale }: { rowSelection: NonNullable<TableProps<T>['rowSelection']>; changeableKeys: Key[]; onAll: () => void; onInvert: () => void; onNone: () => void; locale: NonNullable<TableProps<T>['locale']> }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupId = `orbit-table-selection-menu-${useId().replace(/:/g, '')}`
  const items = rowSelection.selections === true ? [
    { key: 'all', text: locale.selectionAll ?? '전체 데이터 선택', action: onAll },
    { key: 'invert', text: locale.selectInvert ?? '현재 페이지 선택 반전', action: onInvert },
    { key: 'none', text: locale.selectNone ?? '선택 해제', action: onNone },
  ] : (rowSelection.selections || []).map((item) => item === SELECTION_ALL
    ? { key: item.key, text: locale.selectionAll ?? item.text, action: onAll }
    : item === SELECTION_INVERT
      ? { key: item.key, text: locale.selectInvert ?? item.text, action: onInvert }
      : item === SELECTION_NONE
      ? { key: item.key, text: locale.selectNone ?? item.text, action: onNone }
      : { key: item.key, text: item.text, action: () => item.onSelect?.(changeableKeys) })
  useEffect(() => {
    if (!open) return
    const pointer = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false) }
    const keyboard = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', pointer)
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('pointerdown', pointer); document.removeEventListener('keydown', keyboard) }
  }, [open])
  const choose = (action: () => void) => {
    action()
    setOpen(false)
    triggerRef.current?.focus()
  }
  return <div ref={rootRef} className="orbit-table__selection-menu"><button ref={triggerRef} type="button" className="orbit-table__selection-menu-trigger" aria-label="선택 작업" aria-expanded={open} aria-controls={popupId} onClick={() => setOpen((current) => !current)}><svg viewBox="0 0 10 10" aria-hidden><path d="m2 3.5 3 3 3-3" /></svg></button>{open && <div id={popupId} role="group" aria-label="선택 작업 메뉴">{items.map((item) => <button type="button" key={item.key} onClick={() => choose(item.action)}>{item.text}</button>)}</div>}</div>
}

function SortGlyph({ order }: { order: SortOrder }) {
  return <svg className="orbit-table__sort-icon" viewBox="0 0 12 14" aria-hidden><path className={order === 'ascend' ? 'is-active' : ''} d="M6 2 2.5 6h7L6 2Z" /><path className={order === 'descend' ? 'is-active' : ''} d="m6 12 3.5-4h-7L6 12Z" /></svg>
}

function FilterGlyph() {
  return <svg className="orbit-table__filter-icon" viewBox="0 0 16 16" aria-hidden><path d="M2.7 3.25a.75.75 0 0 1 .63-.35h9.34a.75.75 0 0 1 .57 1.24L9.5 8.5v3.35a.75.75 0 0 1-.37.65l-1.5.87A.75.75 0 0 1 6.5 12.7V8.5L2.76 4.14a.75.75 0 0 1-.06-.89Z" /></svg>
}

function FilterMenu<T extends object>({ item, values, locale, trigger, popupContainer, className = '', onValues, onApply, onClose }: { item: ColumnType<T>; values: FilterKey[]; locale: NonNullable<TableProps<T>['locale']>; trigger?: HTMLElement; popupContainer?: HTMLElement; className?: string; onValues: (values: FilterKey[]) => void; onApply: (values: FilterKey[], closeDropdown?: boolean) => void; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const radioName = `orbit-table-filter-${useId().replace(/:/g, '')}`
  useEffect(() => {
    const pointer = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node) && !trigger?.contains(event.target as Node)) onClose() }
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); trigger?.focus(); onClose() } }
    document.addEventListener('pointerdown', pointer)
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('pointerdown', pointer); document.removeEventListener('keydown', keyboard) }
  }, [onClose, trigger])

  const close = () => onClose()
  const confirm: FilterDropdownProps['confirm'] = (options) => onApply(values, options?.closeDropdown !== false)
  const clearFilters: NonNullable<FilterDropdownProps['clearFilters']> = (options) => {
    const next = item.filterResetToDefaultFilteredValue ? item.defaultFilteredValue ?? [] : []
    onValues(next)
    if (options?.confirm !== false) onApply(next, options?.closeDropdown !== false)
    else if (options?.closeDropdown) close()
  }
  const customProps: FilterDropdownProps = { setSelectedKeys: onValues, selectedKeys: values, confirm, clearFilters, close, filters: item.filters, visible: true }
  const content = typeof item.filterDropdown === 'function' ? item.filterDropdown(customProps) : item.filterDropdown
  const defaultContent = <>{item.filterSearch && <input autoFocus className="orbit-table__filter-search" placeholder={locale.filterSearchPlaceholder ?? '필터 검색'} value={search} onChange={(event) => setSearch(event.target.value)} />}<div className={`orbit-table__filter-options ${item.filterMode === 'tree' ? 'is-tree' : ''}`}>{item.filters?.length ? <FilterOptions items={item.filters} values={values} search={search} multiple={item.filterMultiple !== false} radioName={radioName} filterSearch={item.filterSearch} onValues={onValues} /> : <div className="orbit-table__filter-empty">{locale.filterEmptyText ?? '필터 없음'}</div>}</div><div className="orbit-table__filter-actions"><button type="button" onClick={() => clearFilters({ confirm: false })}>{locale.filterReset ?? '초기화'}</button><button type="button" className="is-primary" onClick={() => confirm()}>{locale.filterConfirm ?? '확인'}</button></div></>
  const portalStyle = popupContainer && trigger ? (() => { const triggerRect = trigger.getBoundingClientRect(); const containerRect = popupContainer === document.body ? { top: 0, left: 0 } : popupContainer.getBoundingClientRect(); return { position: popupContainer === document.body ? 'fixed' as const : 'absolute' as const, top: triggerRect.bottom - containerRect.top + 4, left: triggerRect.left - containerRect.left - 12 } })() : undefined
  const menu = <div ref={menuRef} className={`orbit-table__filter-menu ${className}`} style={portalStyle} role="dialog" aria-label={locale.filterTitle ?? '필터 메뉴'} onClick={(event) => event.stopPropagation()}>{content ?? defaultContent}</div>
  return popupContainer ? createPortal(menu, popupContainer) : menu
}

function FilterOptions({ items, values, search, multiple, radioName, filterSearch, onValues, depth = 0 }: { items: FilterItem[]; values: FilterKey[]; search: string; multiple: boolean; radioName: string; filterSearch?: ColumnType<object>['filterSearch']; onValues: (values: FilterKey[]) => void; depth?: number }) {
  const visible = items.filter((item) => !search || (typeof filterSearch === 'function' ? filterSearch(search, item) : String(item.text).toLowerCase().includes(search.toLowerCase()) || item.children?.some((child) => String(child.text).toLowerCase().includes(search.toLowerCase()))))
  return <>{visible.map((item) => <div key={String(item.value)}>{item.children?.length ? <><div className="orbit-table__filter-group" style={{ paddingInlineStart: depth * 12 }}>{item.text}</div><FilterOptions items={item.children} values={values} search={search} multiple={multiple} radioName={radioName} filterSearch={filterSearch} onValues={onValues} depth={depth + 1} /></> : <label style={{ paddingInlineStart: 8 + depth * 12 }}><input type={multiple ? 'checkbox' : 'radio'} name={multiple ? undefined : radioName} checked={values.includes(item.value)} onChange={(event) => onValues(multiple ? event.target.checked ? [...values, item.value] : values.filter((value) => value !== item.value) : event.target.checked ? [item.value] : [])} />{item.text}</label>}</div>)}</>
}

function DefaultEmpty() {
  return <div className="orbit-table__empty-state"><svg viewBox="0 0 64 41" aria-hidden><path d="M8 10h48l-6 24H14L8 10Z" /><path d="M20 10 25 3h14l5 7" /><path d="M14 34c4-5 8-7 13-7h10c5 0 9 2 13 7" /></svg><span>데이터가 없습니다.</span></div>
}

type TableComponent = {
  <T extends object>(props: TableProps<T> & { ref?: React.Ref<TableRef> }): ReactElement
  Column: typeof Column
  ColumnGroup: typeof ColumnGroup
  Summary: typeof Summary
  SELECTION_ALL: SelectionItem
  SELECTION_INVERT: SelectionItem
  SELECTION_NONE: SelectionItem
}

export const Table = Object.assign(forwardRef(InnerTable), {
  Column,
  ColumnGroup,
  Summary,
  SELECTION_ALL,
  SELECTION_INVERT,
  SELECTION_NONE,
}) as TableComponent
