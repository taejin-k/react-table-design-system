import {
  forwardRef,
  Fragment,
  isValidElement,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
  SortOrder,
  SorterResult,
  TableProps,
  TableRef,
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
  if (config.placement) return config.placement
  if (!config.position) return ['bottomEnd']
  const map = { topLeft: 'topStart', topCenter: 'topCenter', topRight: 'topEnd', bottomLeft: 'bottomStart', bottomCenter: 'bottomCenter', bottomRight: 'bottomEnd', none: 'none' } as const
  return config.position.map((item) => map[item])
}

function InnerTable<T extends object>(props: TableProps<T>, ref: React.ForwardedRef<TableRef>) {
  const {
    dataSource = [], column: sharedColumn, columns: sourceColumns = [], rowKey = 'key' as keyof T, pagination = {}, rowSelection, expandable,
    bordered = false, loading = false, size = 'large', title, footer, summary, locale = {}, showHeader = true, showSorterTooltip = true,
    tableLayout = 'auto', rowClassName, rowHoverable = true, sticky = false, virtual = false, scroll, sortDirections = ['ascend', 'descend'],
    rootClassName = '', className = '', components, getPopupContainer, onChange, onRow, onHeaderRow, onScroll,
  } = props
  const classNames = (typeof props.classNames === 'function' ? props.classNames({ props }) : props.classNames) ?? EMPTY_CLASS_NAMES
  const styles = (typeof props.styles === 'function' ? props.styles({ props }) : props.styles) ?? EMPTY_STYLES
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

  const columns = useMemo(() => {
    const merge = (items: ColumnsType<T>): ColumnsType<T> => items.map((item) => ({ ...sharedColumn, ...item, children: item.children ? merge(item.children) : undefined }))
    return merge(sourceColumns)
  }, [sharedColumn, sourceColumns])
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

  const keyOf = (record: T, index?: number): Key => typeof rowKey === 'function' ? rowKey(record, index) : (record[rowKey] as Key)
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
    const walk = (items: T[]) => items.forEach((item) => { const children = (item as Record<string, unknown>)[childrenName] as T[] | undefined; if (children?.length) { keys.push(keyOf(item)); walk(children) } })
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
  const activeFilters = useMemo(() => Object.fromEntries(leafColumns.map((item, index) => [columnKey(item, index), item.filteredValue ?? filters[columnKey(item, index)] ?? []])), [filters, leafColumns])
  const activeSorts = useMemo(() => leafColumns.flatMap((item, index) => item.sortOrder !== undefined ? [{ column: item, key: columnKey(item, index), order: item.sortOrder, priority: typeof item.sorter === 'object' ? item.sorter.multiple ?? 0 : 0 }] : sortStates.filter((state) => state.key === columnKey(item, index))), [leafColumns, sortStates])

  const processed = useMemo(() => {
    const filtered = dataSource.filter((record) => leafColumns.every((item, index) => {
      const values = activeFilters[columnKey(item, index)]
      if (!values?.length) return true
      return values.some((value) => item.onFilter ? item.onFilter(value, record) : String(getValue(record, item.dataIndex)) === String(value))
    }))
    const ordered = [...activeSorts].filter((state) => state.order && (typeof state.column.sorter === 'function' || (typeof state.column.sorter === 'object' && state.column.sorter.compare))).sort((a, b) => b.priority - a.priority)
    return ordered.length ? [...filtered].sort((left, right) => {
      for (const state of ordered) {
        const sorter = state.column.sorter
        const compare = typeof sorter === 'function' ? sorter : typeof sorter === 'object' ? sorter.compare : undefined
        const result = compare?.(left, right, state.order) ?? 0
        if (result) return state.order === 'ascend' ? result : -result
      }
      return 0
    }) : filtered
  }, [activeFilters, activeSorts, dataSource, leafColumns])

  const pageConfig = pagination === false ? null : pagination
  const page = pageConfig?.current ?? internalPage
  const pageSize = pageConfig?.pageSize ?? internalPageSize
  const total = pageConfig?.total ?? processed.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const serverPaginated = Boolean(pageConfig?.total !== undefined && pageConfig.total > processed.length)
  const pageData = pageConfig ? serverPaginated ? processed : processed.slice((safePage - 1) * pageSize, safePage * pageSize) : processed

  const flattenRows = (items: T[], depth = 0, parent?: Key): FlatRow<T>[] => items.flatMap((record) => {
    const key = keyOf(record)
    const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined
    return [{ record, depth, parent }, ...(children?.length && controlledExpanded.has(key) ? flattenRows(children, depth + 1, key) : [])]
  })
  const allFlatRows = flattenRows(pageData)
  const rowHeight = size === 'small' ? 36 : size === 'medium' ? 46 : 54
  const viewportHeight = typeof scroll?.y === 'number' ? scroll.y : 400
  const virtualStart = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - 3) : 0
  const virtualCount = virtual ? Math.ceil(viewportHeight / rowHeight) + 6 : allFlatRows.length
  const renderedRows = virtual ? allFlatRows.slice(virtualStart, virtualStart + virtualCount) : allFlatRows
  const topPad = virtual ? virtualStart * rowHeight : 0
  const bottomPad = virtual ? Math.max(0, (allFlatRows.length - virtualStart - renderedRows.length) * rowHeight) : 0

  const emitChange = (action: 'paginate' | 'sort' | 'filter', nextPage = safePage, nextPageSize = pageSize, nextFilters = activeFilters, nextSorts = activeSorts) => {
    const sorterInfo: SorterResult<T>[] = nextSorts.filter((item) => item.order).map((item) => ({ column: item.column, columnKey: item.key, field: item.column.dataIndex as Key | readonly Key[] | undefined, order: item.order }))
    onChange?.({ ...pageConfig, current: nextPage, pageSize: nextPageSize, total }, nextFilters as Record<string, FilterValue>, sorterInfo.length > 1 ? sorterInfo : sorterInfo[0] ?? {}, { currentDataSource: processed, action })
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
    setInternalPage(1)
    emitChange('sort', 1, pageSize, activeFilters, next)
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

  const changeableRows = allFlatRows.map((item) => item.record).filter((record) => !rowSelection?.getCheckboxProps?.(record).disabled)
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

  useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
    scrollTo: ({ index, key, top, offset = 0, align = 'nearest' }) => {
      if (top !== undefined) scrollRef.current?.scrollTo({ top })
      else if (virtual && index !== undefined) scrollRef.current?.scrollTo({ top: index * rowHeight + offset })
      else {
        const target = key !== undefined ? rootRef.current?.querySelector(`[data-row-key="${CSS.escape(String(key))}"]`) : index !== undefined ? rootRef.current?.querySelectorAll('[data-row-key]')[index] : null
        target?.scrollIntoView({ block: align })
        if (offset && typeof scrollRef.current?.scrollBy === 'function') scrollRef.current.scrollBy({ top: offset })
      }
    },
  }), [rowHeight, virtual])

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
          cells.push(<HeaderCell
            key={`${key}-${level}`}
            colSpan={item.children?.length ? leafCount(item) : item.colSpan}
            rowSpan={item.children?.length ? 1 : depth - level}
            {...customProps}
            {...headerProps}
            title={tooltip && item.sorter && (typeof tooltip !== 'object' || tooltip.target !== 'sorter-icon') ? tooltipTitle : headerProps.title}
            style={{ width: item.width, minWidth: tableLayout === 'auto' ? item.minWidth : undefined, textAlign: item.align, ...(!item.children ? fixedStyle(item, leafIndex) : {}), ...headerStyles?.cell, ...styles.cell, ...headerProps.style }}
            className={`${headerClasses?.cell ?? ''} ${classNames.cell ?? ''} ${item.className ?? ''} ${order ? 'is-sorted' : ''} ${headerProps.className ?? ''}`}
          >
            <span className={`orbit-table__header-content ${item.sorter ? 'is-sortable' : ''}`} onClick={item.sorter ? () => toggleSort(item, leafIndex) : undefined}>
              <span>{renderTitle(item)}</span>
              {item.sorter && !item.children && <button type="button" className="orbit-table__icon-button" onClick={(event) => { event.stopPropagation(); toggleSort(item, leafIndex) }} aria-label={`${String(renderTitle(item))} 정렬`} title={tooltip && typeof tooltip === 'object' && tooltip.target === 'sorter-icon' ? tooltipTitle : undefined}>{item.sortIcon?.({ sortOrder: order }) ?? <SortGlyph order={order} />}</button>}
              {(item.filters?.length || item.filterDropdown) && !item.children ? <span className="orbit-table__filter-wrap"><button ref={(node) => { if (node) filterTriggers.current.set(key, node); else filterTriggers.current.delete(key) }} type="button" className={`orbit-table__icon-button ${item.filtered || activeFilters[key]?.length ? 'is-active' : ''}`} onClick={(event) => { event.stopPropagation(); const open = !(item.filterDropdownProps?.open ?? filterOpen === key); setFilterDraft((draft) => ({ ...draft, [key]: activeFilters[key] ?? [] })); setFilterOpen(open ? key : null); item.filterDropdownProps?.onOpenChange?.(open) }} aria-label={`${String(renderTitle(item))} 필터`}>{typeof item.filterIcon === 'function' ? item.filterIcon(Boolean(item.filtered || activeFilters[key]?.length)) : item.filterIcon ?? <FilterGlyph />}</button>{(item.filterDropdownProps?.open ?? filterOpen === key) && <FilterMenu item={item} values={filterDraft[key] ?? []} locale={locale} trigger={filterTriggers.current.get(key)} popupContainer={filterTriggers.current.get(key) && getPopupContainer?.(filterTriggers.current.get(key)!)} className={item.filterDropdownProps?.className} onValues={(values) => setFilterDraft((draft) => ({ ...draft, [key]: values }))} onApply={(values) => applyFilter(item, leafIndex, values)} onClose={() => closeFilter(item, leafIndex)} />}</span> : null}
            </span>
          </HeaderCell>)
        } else if (item.children?.length) visit(item.children, current + 1)
      })
      visit(responsiveColumns, 0)

      const titleCheckbox = rowSelection && rowSelection.type !== 'radio' && !rowSelection.hideSelectAll ? <SelectionCheckbox aria-label="모든 행 선택" {...rowSelection.getTitleCheckboxProps?.()} checked={allChecked} indeterminate={partlyChecked} onChange={(event) => selectAll(event.target.checked)} /> : null
      const selectionTitle = rowSelection ? typeof rowSelection.columnTitle === 'function' ? rowSelection.columnTitle(titleCheckbox) : rowSelection.columnTitle ?? titleCheckbox : null
      const headerRowProps = onHeaderRow?.(responsiveColumns, level) ?? {}
      return <HeaderRow key={level} {...(components?.header?.row ? { columns: responsiveColumns, index: level } : {})} {...headerRowProps} className={`${headerClasses?.row ?? ''} ${headerRowProps.className ?? ''}`} style={{ ...headerStyles?.row, ...headerRowProps.style }}>
        {level === 0 && rowSelection && <HeaderCell rowSpan={depth} className="orbit-table__selection-cell" style={{ width: rowSelection.columnWidth ?? 48, textAlign: rowSelection.align, ...selectionFixedStyle }}><span className="orbit-table__selection-head">{selectionTitle}{rowSelection.selections && !rowSelection.hideSelectAll && <SelectionMenu rowSelection={rowSelection} changeableKeys={changeableKeys} onAll={() => selectAll(true)} onInvert={invertSelection} onNone={() => selectAll(false)} locale={locale} />}</span></HeaderCell>}
        {level === 0 && expandable && expandable.showExpandColumn !== false && <HeaderCell rowSpan={depth} className="orbit-table__expand-cell" style={{ width: expandable.columnWidth ?? 48, ...expandFixedStyle }}>{expandable.columnTitle}</HeaderCell>}
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
    const originSelectionNode = rowSelection ? <input {...checkboxProps} type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'} name={rowSelection.type === 'radio' ? 'orbit-table-selection' : checkboxProps.name} checked={checked} aria-label={checkboxProps['aria-label'] ?? `${String(key)} 행 선택`} onChange={(event) => {
      const next = rowSelection.type === 'radio' ? new Set<Key>() : new Set(controlledSelected)
      const related: Key[] = [key]
      if (rowSelection.checkStrictly === false) {
        const collect = (item: T) => ((item as Record<string, unknown>)[childrenName] as T[] | undefined)?.forEach((child) => { related.push(keyOf(child)); collect(child) })
        collect(record)
      }
      const native = event.nativeEvent as MouseEvent
      if (native.shiftKey && lastSelectedIndex.current !== null && rowSelection.type !== 'radio') {
        const start = Math.min(lastSelectedIndex.current, actualIndex)
        const end = Math.max(lastSelectedIndex.current, actualIndex)
        const changed = allFlatRows.slice(start, end + 1).map((item) => item.record).filter((item) => !rowSelection.getCheckboxProps?.(item).disabled)
        changed.forEach((item) => event.target.checked ? next.add(keyOf(item)) : next.delete(keyOf(item)))
        const selectedRows = updateSelection(next, 'multiple')
        rowSelection.onSelectMultiple?.(event.target.checked, selectedRows, changed)
      } else {
        related.forEach((relatedKey) => event.target.checked ? next.add(relatedKey) : next.delete(relatedKey))
        updateSelection(next, rowSelection.type === 'radio' ? 'single' : 'multiple', record, event.target.checked, event.nativeEvent)
      }
      lastSelectedIndex.current = actualIndex
    }} /> : null
    const renderedSelection = rowSelection?.renderCell?.(checked, record, actualIndex, originSelectionNode)
    const selectionRenderedCell = renderedSelection && isRenderedCell(renderedSelection) ? renderedSelection : null

    return <Fragment key={key}><RowComponent
      data-row-key={key}
      {...customRowProps}
      {...rowProps}
      className={rowClass}
      style={{ height: virtual ? rowHeight : undefined, ...bodyStyles?.row, ...styles.row, ...rowProps.style }}
      onClick={(event) => { rowProps.onClick?.(event); if (expandable?.expandRowByClick && canExpand) toggleExpand(record) }}
    >
      {rowSelection && <Cell {...(components?.body?.cell ? { record, index: actualIndex, column: 'selection' } : {})} {...selectionCellProps} {...selectionRenderedCell?.props} className={`orbit-table__selection-cell ${selectionCellProps.className ?? ''} ${selectionRenderedCell?.props?.className ?? ''}`} style={{ width: rowSelection.columnWidth ?? 48, textAlign: rowSelection.align, ...selectionFixedStyle, ...selectionCellProps.style, ...selectionRenderedCell?.props?.style }}>{selectionRenderedCell?.children ?? renderedSelection ?? originSelectionNode}</Cell>}
      {expandable && expandable.showExpandColumn !== false && <Cell {...(components?.body?.cell ? { record, index: actualIndex, column: 'expand' } : {})} className="orbit-table__expand-cell" style={{ width: expandable.columnWidth ?? 48, ...expandFixedStyle }}><span style={{ marginInlineStart: depth * (expandable.indentSize ?? 15) }}>{expandable.expandIcon?.({ expanded, record, expandable: canExpand, onExpand: (item, event) => { event.stopPropagation(); toggleExpand(item) } }) ?? <button type="button" disabled={!canExpand} className="orbit-table__expand" aria-label={expanded ? locale.collapse ?? '행 접기' : locale.expand ?? '행 펼치기'} onClick={(event) => { event.stopPropagation(); toggleExpand(record) }}>{canExpand ? expanded ? '−' : '+' : ''}</button>}</span></Cell>}
      {leafColumns.map((item, columnIndex) => <BodyCell key={columnKey(item, columnIndex)} component={Cell} custom={Boolean(components?.body?.cell)} item={item} record={record} rowIndex={actualIndex} fixedStyle={fixedStyle(item, columnIndex)} className={`${bodyClasses?.cell ?? ''} ${classNames.cell ?? ''}`} style={{ ...bodyStyles?.cell, ...styles.cell }} />)}
    </RowComponent>{expandable?.expandedRowRender && expanded && <tr className={`orbit-table__expanded ${typeof expandable.expandedRowClassName === 'function' ? expandable.expandedRowClassName(record, actualIndex, depth) : expandable.expandedRowClassName ?? ''}`}><td colSpan={fullColSpan}>{expandable.expandedRowRender(record, actualIndex, depth, expanded)}</td></tr>}</Fragment>
  }

  const placements = pageConfig ? normalizePlacement(pageConfig).filter((item) => item !== 'none') : []
  const renderPagination = (placement: PaginationPlacement) => pageConfig && !(pageConfig.hideOnSinglePage && pageCount <= 1) ? <Pagination key={placement} config={pageConfig} page={safePage} pageSize={pageSize} total={total} pageCount={pageCount} placement={placement} onChange={changePage} className={`${typeof classNames.pagination === 'string' ? classNames.pagination : paginationClasses?.root ?? ''}`} style={(typeof styles.pagination === 'object' && !paginationStyles ? styles.pagination : paginationStyles?.root) as CSSProperties | undefined} /> : null
  const topPagination = placements.filter((item) => item.startsWith('top')).map(renderPagination)
  const bottomPagination = placements.filter((item) => item.startsWith('bottom')).map(renderPagination)
  const TableElement = components?.table ?? 'table'
  const HeaderWrapper = components?.header?.wrapper ?? 'thead'
  const BodyWrapper = components?.body?.wrapper ?? 'tbody'
  const effectiveLayout = tableLayout === 'fixed' || scroll?.x || leafColumns.some((item) => item.ellipsis || item.fixed) ? 'fixed' : 'auto'
  const emptyText = typeof locale.emptyText === 'function' ? locale.emptyText() : locale.emptyText ?? <DefaultEmpty />
  const loadingConfig = typeof loading === 'object' ? loading : undefined

  return <div ref={rootRef} className={`orbit-table ${bordered ? 'orbit-table--bordered' : ''} orbit-table--${size} ${rowHoverable ? 'orbit-table--hoverable' : ''} ${rootClassName} ${className} ${classNames.root ?? ''}`} style={styles.root} aria-busy={loadingVisible}>
    {topPagination}
    {title && <div className={`orbit-table__title ${classNames.title ?? ''}`} style={styles.title}>{title(pageData)}</div>}
    <div ref={scrollRef} className={`orbit-table__wrapper ${classNames.section ?? ''} ${classNames.wrapper ?? ''} ${classNames.content ?? ''}`} style={{ overflowX: scroll?.x ? 'auto' : undefined, overflowY: scroll?.y ? 'auto' : undefined, maxHeight: scroll?.y, ...styles.section, ...styles.content, ...styles.wrapper }} onScroll={(event) => { setScrollTop(event.currentTarget.scrollTop); onScroll?.(event) }}>
      <TableElement className={classNames.table} style={{ tableLayout: effectiveLayout, minWidth: typeof scroll?.x === 'number' ? scroll.x : scroll?.x === 'max-content' ? 'max-content' : undefined, ...styles.table }}>
        <colgroup>{rowSelection && <col style={{ width: rowSelection.columnWidth ?? 48 }} />}{expandable && expandable.showExpandColumn !== false && <col style={{ width: expandable.columnWidth ?? 48 }} />}{leafColumns.map((item, index) => <col key={columnKey(item, index)} style={{ width: item.width, minWidth: item.minWidth }} />)}</colgroup>
        {showHeader && <HeaderWrapper className={`${sticky ? 'is-sticky' : ''} ${typeof classNames.header === 'string' ? classNames.header : headerClasses?.wrapper ?? ''}`} style={{ top: typeof sticky === 'object' ? sticky.offsetHeader ?? 0 : 0, ...headerStyles?.wrapper }}>{renderHeaderRows()}</HeaderWrapper>}
        <BodyWrapper className={`${typeof classNames.body === 'string' ? classNames.body : bodyClasses?.wrapper ?? ''}`} style={bodyStyles?.wrapper}>{topPad > 0 && <tr aria-hidden><td colSpan={fullColSpan} style={{ height: topPad, padding: 0 }} /></tr>}{renderedRows.map(renderRow)}{bottomPad > 0 && <tr aria-hidden><td colSpan={fullColSpan} style={{ height: bottomPad, padding: 0 }} /></tr>}{!loadingVisible && allFlatRows.length === 0 && <tr><td className="orbit-table__empty" colSpan={fullColSpan}>{emptyText}</td></tr>}</BodyWrapper>
        {summary && <tfoot className={sticky && typeof sticky === 'object' && sticky.offsetSummary !== undefined ? 'is-sticky-summary' : undefined} style={{ bottom: typeof sticky === 'object' ? sticky.offsetSummary : undefined }}><tr><td colSpan={fullColSpan}>{summary(pageData)}</td></tr></tfoot>}
      </TableElement>
      {loadingVisible && <div className={`orbit-table__loading ${loadingConfig?.className ?? ''}`} style={loadingConfig?.style}><div className="orbit-table__loading-content">{loadingConfig?.indicator ?? <span className="orbit-table__spinner" aria-hidden />}{loadingConfig?.tip && <span>{loadingConfig.tip}</span>}<span className="orbit-sr-only">로딩 중</span></div></div>}
    </div>
    {footer && <div className={`orbit-table__footer ${classNames.footer ?? ''}`} style={styles.footer}>{footer(pageData)}</div>}
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
  >{renderedCell?.children ?? rendered}</Cell>
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
  const items = rowSelection.selections === true ? [
    { key: 'all', text: locale.selectionAll ?? '전체 데이터 선택', action: onAll },
    { key: 'invert', text: locale.selectInvert ?? '현재 페이지 선택 반전', action: onInvert },
    { key: 'none', text: locale.selectNone ?? '선택 해제', action: onNone },
  ] : (rowSelection.selections || []).map((item) => ({ key: item.key, text: item.text, action: () => item.onSelect?.(changeableKeys) }))
  return <details className="orbit-table__selection-menu"><summary aria-label="선택 작업"><svg viewBox="0 0 10 10" aria-hidden><path d="m2 3.5 3 3 3-3" /></svg></summary><div>{items.map((item) => <button type="button" key={item.key} onClick={(event) => { item.action(); event.currentTarget.closest('details')?.removeAttribute('open') }}>{item.text}</button>)}</div></details>
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
  useEffect(() => {
    const pointer = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node) && !trigger?.contains(event.target as Node)) onClose() }
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
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
  const defaultContent = <>{item.filterSearch && <input autoFocus className="orbit-table__filter-search" placeholder={locale.filterSearchPlaceholder ?? '필터 검색'} value={search} onChange={(event) => setSearch(event.target.value)} />}<div className={`orbit-table__filter-options ${item.filterMode === 'tree' ? 'is-tree' : ''}`}>{item.filters?.length ? <FilterOptions items={item.filters} values={values} search={search} multiple={item.filterMultiple !== false} filterSearch={item.filterSearch} onValues={onValues} /> : <div className="orbit-table__filter-empty">{locale.filterEmptyText ?? '필터 없음'}</div>}</div><div className="orbit-table__filter-actions"><button type="button" onClick={() => clearFilters({ confirm: false })}>{locale.filterReset ?? '초기화'}</button><button type="button" className="is-primary" onClick={() => confirm()}>{locale.filterConfirm ?? '확인'}</button></div></>
  const portalStyle = popupContainer && trigger ? (() => { const triggerRect = trigger.getBoundingClientRect(); const containerRect = popupContainer === document.body ? { top: 0, left: 0 } : popupContainer.getBoundingClientRect(); return { position: popupContainer === document.body ? 'fixed' as const : 'absolute' as const, top: triggerRect.bottom - containerRect.top + 4, left: triggerRect.left - containerRect.left - 12 } })() : undefined
  const menu = <div ref={menuRef} className={`orbit-table__filter-menu ${className}`} style={portalStyle} role="dialog" aria-label={locale.filterTitle ?? '필터 메뉴'} onClick={(event) => event.stopPropagation()}>{content ?? defaultContent}</div>
  return popupContainer ? createPortal(menu, popupContainer) : menu
}

function FilterOptions({ items, values, search, multiple, filterSearch, onValues, depth = 0 }: { items: FilterItem[]; values: FilterKey[]; search: string; multiple: boolean; filterSearch?: ColumnType<object>['filterSearch']; onValues: (values: FilterKey[]) => void; depth?: number }) {
  const visible = items.filter((item) => !search || (typeof filterSearch === 'function' ? filterSearch(search, item) : String(item.text).toLowerCase().includes(search.toLowerCase()) || item.children?.some((child) => String(child.text).toLowerCase().includes(search.toLowerCase()))))
  return <>{visible.map((item) => <div key={String(item.value)}>{item.children?.length ? <><div className="orbit-table__filter-group" style={{ paddingInlineStart: depth * 12 }}>{item.text}</div><FilterOptions items={item.children} values={values} search={search} multiple={multiple} filterSearch={filterSearch} onValues={onValues} depth={depth + 1} /></> : <label style={{ paddingInlineStart: 8 + depth * 12 }}><input type={multiple ? 'checkbox' : 'radio'} name={multiple ? undefined : 'table-filter'} checked={values.includes(item.value)} onChange={(event) => onValues(multiple ? event.target.checked ? [...values, item.value] : values.filter((value) => value !== item.value) : event.target.checked ? [item.value] : [])} />{item.text}</label>}</div>)}</>
}

function DefaultEmpty() {
  return <div className="orbit-table__empty-state"><svg viewBox="0 0 64 41" aria-hidden><path d="M8 10h48l-6 24H14L8 10Z" /><path d="M20 10 25 3h14l5 7" /><path d="M14 34c4-5 8-7 13-7h10c5 0 9 2 13 7" /></svg><span>데이터가 없습니다.</span></div>
}

export const Table = forwardRef(InnerTable) as <T extends object>(props: TableProps<T> & { ref?: React.Ref<TableRef> }) => React.ReactElement
