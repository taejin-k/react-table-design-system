import { forwardRef, Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState, type ReactNode } from 'react'
import { breakpointWidths, columnKey, flatFilterItems, flattenColumns, getValue, leafCount, maxDepth } from './Table.utils'
import type { ColumnType, ColumnsType, FilterValue, Key, PaginationConfig, SortOrder, TableProps, TableRef } from './Table.types'
import '../../styles/tokens.css'
import './Table.css'

type SortState<T> = { column: ColumnType<T>; key: string; order: SortOrder; priority: number }
type FlatRow<T> = { record: T; depth: number; parent?: Key }

function InnerTable<T extends object>(props: TableProps<T>, ref: React.ForwardedRef<TableRef>) {
  const {
    dataSource = [], columns = [], rowKey = 'key' as keyof T, pagination = {}, rowSelection, expandable,
    bordered = false, loading = false, size = 'large', title, footer, summary, locale, showHeader = true,
    tableLayout = 'auto', rowHoverable = true, sticky = false, virtual = false, scroll, sortDirections = ['ascend', 'descend'],
    className = '', classNames = {}, styles = {}, components, onChange, onRow, onHeaderRow, onScroll,
  } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [internalPage, setInternalPage] = useState(typeof pagination === 'object' ? pagination.defaultCurrent ?? 1 : 1)
  const [internalPageSize, setInternalPageSize] = useState(typeof pagination === 'object' ? pagination.defaultPageSize ?? pagination.pageSize ?? 10 : 10)
  const [sortStates, setSortStates] = useState<SortState<T>[]>(() => flattenColumns(columns).flatMap((column, index) => column.defaultSortOrder ? [{ column, key: columnKey(column, index), order: column.defaultSortOrder, priority: typeof column.sorter === 'object' ? column.sorter.multiple ?? 0 : 0 }] : []))
  const [filters, setFilters] = useState<Record<string, Key[]>>(() => Object.fromEntries(flattenColumns(columns).map((column, index) => [columnKey(column, index), column.defaultFilteredValue ?? []])))
  const [filterOpen, setFilterOpen] = useState<string | null>(null)
  const [filterDraft, setFilterDraft] = useState<Record<string, Key[]>>({})
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(() => new Set(rowSelection?.defaultSelectedRowKeys ?? []))
  const [expandedKeys, setExpandedKeys] = useState<Set<Key>>(() => new Set(expandable?.defaultExpandedRowKeys ?? []))
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1440 : window.innerWidth)

  useEffect(() => {
    const listener = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [])

  const keyOf = (record: T): Key => typeof rowKey === 'function' ? rowKey(record) : (record[rowKey] as Key)
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
    if (!expandable?.defaultExpandAllRows) return
    const keys: Key[] = []
    const walk = (items: T[]) => items.forEach((item) => { const children = (item as Record<string, unknown>)[childrenName] as T[] | undefined; if (children?.length) { keys.push(keyOf(item)); walk(children) } })
    walk(dataSource)
    setExpandedKeys(new Set(keys))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const responsiveColumns = useMemo(() => {
    const visible = (column: ColumnType<T>): boolean => !column.hidden && (!column.responsive?.length || column.responsive.some((point) => viewportWidth >= breakpointWidths[point]))
    const visit = (items: ColumnsType<T>): ColumnsType<T> => items.filter(visible).map((column) => ({ ...column, children: column.children ? visit(column.children) : undefined })).filter((column) => !column.children || column.children.length > 0)
    return visit(columns)
  }, [columns, viewportWidth])
  const leafColumns = useMemo(() => flattenColumns(responsiveColumns), [responsiveColumns])

  const activeFilters = useMemo(() => Object.fromEntries(leafColumns.map((column, index) => [columnKey(column, index), column.filteredValue ?? filters[columnKey(column, index)] ?? []])), [filters, leafColumns])
  const activeSorts = useMemo(() => leafColumns.flatMap((column, index) => column.sortOrder !== undefined ? [{ column, key: columnKey(column, index), order: column.sortOrder, priority: typeof column.sorter === 'object' ? column.sorter.multiple ?? 0 : 0 }] : sortStates.filter((state) => state.key === columnKey(column, index))), [leafColumns, sortStates])

  const processed = useMemo(() => {
    const filtered = dataSource.filter((record) => leafColumns.every((column, index) => {
      const values = activeFilters[columnKey(column, index)]
      if (!values?.length) return true
      return values.some((value) => column.onFilter ? column.onFilter(value, record) : String(getValue(record, column.dataIndex)) === String(value))
    }))
    const ordered = [...activeSorts].filter((state) => state.order).sort((a, b) => b.priority - a.priority)
    return ordered.length ? [...filtered].sort((a, b) => {
      for (const state of ordered) {
        const sorter = state.column.sorter
        const compare = typeof sorter === 'function' ? sorter : typeof sorter === 'object' && sorter.compare ? sorter.compare : (left: T, right: T) => String(getValue(left, state.column.dataIndex)).localeCompare(String(getValue(right, state.column.dataIndex)), undefined, { numeric: true })
        const result = compare(a, b)
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
  const safePage = Math.min(page, pageCount)
  const pageData = pageConfig ? processed.slice((safePage - 1) * pageSize, safePage * pageSize) : processed

  const flattenRows = (items: T[], depth = 0, parent?: Key): FlatRow<T>[] => items.flatMap((record) => {
    const key = keyOf(record)
    const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined
    return [{ record, depth, parent }, ...(children?.length && controlledExpanded.has(key) ? flattenRows(children, depth + 1, key) : [])]
  })
  const allFlatRows = flattenRows(pageData)
  const rowHeight = size === 'small' ? 36 : size === 'medium' ? 44 : 52
  const viewportHeight = typeof scroll?.y === 'number' ? scroll.y : 400
  const virtualStart = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - 3) : 0
  const virtualCount = virtual ? Math.ceil(viewportHeight / rowHeight) + 6 : allFlatRows.length
  const renderedRows = virtual ? allFlatRows.slice(virtualStart, virtualStart + virtualCount) : allFlatRows
  const topPad = virtual ? virtualStart * rowHeight : 0
  const bottomPad = virtual ? Math.max(0, (allFlatRows.length - virtualStart - renderedRows.length) * rowHeight) : 0

  const emitChange = (action: 'paginate' | 'sort' | 'filter', nextPage = safePage, nextPageSize = pageSize, nextFilters = activeFilters, nextSorts = activeSorts) => {
    const sorterInfo = nextSorts.filter((item) => item.order).map((item) => ({ columnKey: item.key, order: item.order }))
    onChange?.({ current: nextPage, pageSize: nextPageSize, total }, nextFilters as Record<string, FilterValue>, sorterInfo.length > 1 ? sorterInfo : sorterInfo[0] ?? {}, { currentDataSource: processed, action })
  }

  const changePage = (next: number, nextSize = pageSize) => {
    setInternalPage(next); setInternalPageSize(nextSize); pageConfig?.onChange?.(next, nextSize); emitChange('paginate', next, nextSize)
    if (scroll?.scrollToFirstRowOnChange !== false && typeof scrollRef.current?.scrollTo === 'function') scrollRef.current.scrollTo({ top: 0 })
  }

  const toggleSort = (column: ColumnType<T>, index: number) => {
    if (!column.sorter || column.sortOrder !== undefined) return
    const key = columnKey(column, index)
    const current = sortStates.find((state) => state.key === key)?.order ?? null
    const directions = column.sortDirections ?? sortDirections
    const cycle: SortOrder[] = [...directions, null]
    const nextOrder = cycle[(cycle.indexOf(current) + 1) % cycle.length]
    const priority = typeof column.sorter === 'object' ? column.sorter.multiple ?? 0 : 0
    const next = priority ? [...sortStates.filter((state) => state.key !== key), { column, key, order: nextOrder, priority }] : [{ column, key, order: nextOrder, priority }]
    setSortStates(next.filter((state) => state.order)); setInternalPage(1); emitChange('sort', 1, pageSize, activeFilters, next)
  }

  const applyFilter = (column: ColumnType<T>, index: number) => {
    const key = columnKey(column, index)
    const next = { ...activeFilters, [key]: filterDraft[key] ?? [] }
    setFilters((current) => ({ ...current, [key]: filterDraft[key] ?? [] })); setFilterOpen(null); setInternalPage(1); emitChange('filter', 1, pageSize, next)
  }

  const updateSelection = (next: Set<Key>, type: string, record?: T, selected?: boolean, event?: Event) => {
    if (!rowSelection?.selectedRowKeys) setSelectedKeys(next)
    const selectedRows = allDataRows.filter((row) => next.has(keyOf(row)))
    rowSelection?.onChange?.([...next], selectedRows, { type })
    if (record && event) rowSelection?.onSelect?.(record, Boolean(selected), selectedRows, event)
  }

  const toggleExpand = (record: T) => {
    const key = keyOf(record); const next = new Set(controlledExpanded); const expanded = !next.has(key)
    if (expanded) next.add(key); else next.delete(key)
    if (!expandable?.expandedRowKeys) setExpandedKeys(next)
    expandable?.onExpand?.(expanded, record); expandable?.onExpandedRowsChange?.([...next])
  }

  const leftOffsets = useMemo(() => { let offset = rowSelection ? Number(rowSelection.columnWidth ?? 44) : 0; if (expandable && expandable.showExpandColumn !== false) offset += Number(expandable.columnWidth ?? 44); const map: Record<string, number> = {}; leafColumns.forEach((column, index) => { if (column.fixed === true || column.fixed === 'left' || column.fixed === 'start') { map[columnKey(column, index)] = offset; offset += Number(column.width ?? 120) } }); return map }, [expandable, leafColumns, rowSelection])
  const rightOffsets = useMemo(() => { let offset = 0; const map: Record<string, number> = {}; [...leafColumns].reverse().forEach((column, reverseIndex) => { const index = leafColumns.length - reverseIndex - 1; if (column.fixed === 'right' || column.fixed === 'end') { map[columnKey(column, index)] = offset; offset += Number(column.width ?? 120) } }); return map }, [leafColumns])
  const fixedStyle = (column: ColumnType<T>, index: number) => { const key = columnKey(column, index); if (key in leftOffsets) return { position: 'sticky' as const, left: leftOffsets[key], zIndex: 2 }; if (key in rightOffsets) return { position: 'sticky' as const, right: rightOffsets[key], zIndex: 2 }; return {} }

  useImperativeHandle(ref, () => ({
    nativeElement: rootRef.current,
    scrollTo: ({ index, key, top, offset = 0, align = 'nearest' }) => {
      if (top !== undefined) scrollRef.current?.scrollTo({ top })
      else if (virtual && index !== undefined) scrollRef.current?.scrollTo({ top: index * rowHeight - offset })
      else { const target = key !== undefined ? rootRef.current?.querySelector(`[data-row-key="${CSS.escape(String(key))}"]`) : index !== undefined ? rootRef.current?.querySelectorAll('[data-row-key]')[index] : null; target?.scrollIntoView({ block: align }) }
    },
  }), [rowHeight, virtual])

  const renderHeaderRows = () => {
    const depth = maxDepth(responsiveColumns)
    return Array.from({ length: depth }, (_, level) => {
      const cells: ReactNode[] = []
      const visit = (items: ColumnsType<T>, current: number) => items.forEach((column, index) => {
        if (current === level) cells.push(<th key={`${columnKey(column, index)}-${level}`} colSpan={column.children?.length ? leafCount(column) : column.colSpan} rowSpan={column.children?.length ? 1 : depth - level} style={{ width: column.width, minWidth: column.minWidth, textAlign: column.align, ...(!column.children ? fixedStyle(column, leafColumns.indexOf(column)) : {}) }} className={`${classNames.cell ?? ''} ${column.className ?? ''}`} {...column.onHeaderCell?.(column)}>
          <span className="orbit-table__header-content">{column.title}
            {column.sorter && !column.children && <button className="orbit-table__icon-button" onClick={() => toggleSort(column, leafColumns.indexOf(column))} aria-label={`${String(column.title)} 정렬`}><SortGlyph order={activeSorts.find((state) => state.key === columnKey(column, leafColumns.indexOf(column)))?.order ?? null} /></button>}
            {column.filters?.length && !column.children ? <span className="orbit-table__filter-wrap"><button className={`orbit-table__icon-button ${activeFilters[columnKey(column, leafColumns.indexOf(column))]?.length ? 'is-active' : ''}`} onClick={() => { const key = columnKey(column, leafColumns.indexOf(column)); setFilterDraft((draft) => ({ ...draft, [key]: activeFilters[key] ?? [] })); setFilterOpen(filterOpen === key ? null : key) }} aria-label={`${String(column.title)} 필터`}><FilterGlyph /></button>{filterOpen === columnKey(column, leafColumns.indexOf(column)) && <FilterMenu column={column} values={filterDraft[columnKey(column, leafColumns.indexOf(column))] ?? []} onValues={(values) => setFilterDraft((draft) => ({ ...draft, [columnKey(column, leafColumns.indexOf(column))]: values }))} onApply={() => applyFilter(column, leafColumns.indexOf(column))} />}</span> : null}
          </span>
        </th>)
        else if (column.children?.length) visit(column.children, current + 1)
      })
      visit(responsiveColumns, 0)
      return <tr key={level} {...onHeaderRow?.(responsiveColumns, level)}>{level === 0 && expandable && expandable.showExpandColumn !== false && <th rowSpan={depth} style={{ width: expandable.columnWidth }}>{expandable.columnTitle}</th>}{level === 0 && rowSelection && <th rowSpan={depth} style={{ width: rowSelection.columnWidth }}>{rowSelection.hideSelectAll || rowSelection.type === 'radio' ? rowSelection.columnTitle : <input type="checkbox" aria-label="모든 행 선택" checked={pageData.length > 0 && pageData.every((row) => controlledSelected.has(keyOf(row)))} onChange={(event) => { const next = new Set(controlledSelected); pageData.forEach((row) => event.target.checked ? next.add(keyOf(row)) : next.delete(keyOf(row))); updateSelection(next, 'all') }} />}</th>}{cells}</tr>
    })
  }

  const renderRow = ({ record, depth }: FlatRow<T>, visibleIndex: number) => {
    const actualIndex = virtualStart + visibleIndex
    const key = keyOf(record)
    const children = (record as Record<string, unknown>)[childrenName] as T[] | undefined
    const canExpand = Boolean(children?.length || expandable?.expandedRowRender) && (expandable?.rowExpandable?.(record) ?? true)
    const expanded = controlledExpanded.has(key)
    const rowProps = onRow?.(record, actualIndex) ?? {}
    const RowComponent = components?.body?.row ?? 'tr'
    const customRowProps = components?.body?.row ? { record, index: actualIndex } : {}
    return <Fragment key={key}><RowComponent data-row-key={key} {...customRowProps} className={`${classNames.row ?? ''} ${controlledSelected.has(key) ? 'is-selected' : ''}`} style={{ height: virtual ? rowHeight : undefined, ...styles.row, ...rowProps.style }} {...rowProps} onClick={(event) => { rowProps.onClick?.(event); if (expandable?.expandRowByClick && canExpand) toggleExpand(record) }}>
      {expandable && expandable.showExpandColumn !== false && <td><button disabled={!canExpand} className="orbit-table__expand" aria-label={expanded ? '행 접기' : '행 펼치기'} onClick={(event) => { event.stopPropagation(); toggleExpand(record) }} style={{ marginLeft: depth * (expandable.indentSize ?? 15) }}>{canExpand ? expanded ? '−' : '+' : ''}</button></td>}
      {rowSelection && <td>{(() => { const disabled = rowSelection.getCheckboxProps?.(record).disabled; const input = <input type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'} name={rowSelection.type === 'radio' ? 'orbit-table-selection' : undefined} disabled={disabled} checked={controlledSelected.has(key)} aria-label={`${key} 행 선택`} onChange={(event) => { const next = rowSelection.type === 'radio' ? new Set<Key>() : new Set(controlledSelected); const related: Key[] = [key]; if (rowSelection.checkStrictly === false) { const collect = (item: T) => ((item as Record<string, unknown>)[childrenName] as T[] | undefined)?.forEach((child) => { related.push(keyOf(child)); collect(child) }); collect(record) } related.forEach((relatedKey) => event.target.checked ? next.add(relatedKey) : next.delete(relatedKey)); updateSelection(next, rowSelection.type === 'radio' ? 'single' : 'multiple', record, event.target.checked, event.nativeEvent) }} />; return rowSelection.renderCell?.(controlledSelected.has(key), record, actualIndex, input) ?? input })()}</td>}
      {leafColumns.map((column, columnIndex) => { const value = getValue(record, column.dataIndex); const cellProps = column.onCell?.(record, actualIndex) ?? {}; if (cellProps.colSpan === 0 || cellProps.rowSpan === 0) return null; const content = column.render ? column.render(value, record, actualIndex) : String(value ?? ''); return <td key={columnKey(column, columnIndex)} scope={column.rowScope} title={column.ellipsis && (typeof column.ellipsis === 'boolean' || column.ellipsis.showTitle !== false) ? String(value ?? '') : undefined} className={`${classNames.cell ?? ''} ${column.className ?? ''} ${column.ellipsis ? 'orbit-table__ellipsis' : ''}`} style={{ width: column.width, minWidth: column.minWidth, textAlign: column.align, ...fixedStyle(column, columnIndex), ...styles.cell, ...cellProps.style }} {...cellProps}>{content}</td> })}
    </RowComponent>{expandable?.expandedRowRender && expanded && <tr className="orbit-table__expanded"><td colSpan={leafColumns.length + (rowSelection ? 1 : 0) + 1}>{expandable.expandedRowRender(record, actualIndex, depth, expanded)}</td></tr>}</Fragment>
  }

  const paginationNode = pageConfig && !(pageConfig.hideOnSinglePage && pageCount <= 1) ? <Pagination config={pageConfig} page={safePage} pageSize={pageSize} total={total} pageCount={pageCount} onChange={changePage} className={classNames.pagination} style={styles.pagination} /> : null
  const topPagination = pageConfig?.placement?.some((item) => item.startsWith('top')) ? paginationNode : null
  const bottomPagination = !pageConfig?.placement || pageConfig.placement.some((item) => item.startsWith('bottom')) ? paginationNode : null

  return <div ref={rootRef} className={`orbit-table ${bordered ? 'orbit-table--bordered' : ''} orbit-table--${size} ${rowHoverable ? 'orbit-table--hoverable' : ''} ${className} ${classNames.root ?? ''}`} style={styles.root}>
    {topPagination}
    {title && <div className="orbit-table__title">{title(pageData)}</div>}
    <div ref={scrollRef} className={`orbit-table__wrapper ${classNames.wrapper ?? ''}`} style={{ overflowX: scroll?.x ? 'auto' : undefined, overflowY: scroll?.y ? 'auto' : undefined, maxHeight: scroll?.y, ...styles.wrapper }} onScroll={(event) => { setScrollTop(event.currentTarget.scrollTop); onScroll?.(event) }}>
      <table className={classNames.table} style={{ tableLayout: tableLayout === 'fixed' || scroll?.x ? 'fixed' : 'auto', minWidth: typeof scroll?.x === 'number' ? scroll.x : scroll?.x === 'max-content' ? 'max-content' : undefined, ...styles.table }}>
        {showHeader && <thead className={`${sticky ? 'is-sticky' : ''} ${classNames.header ?? ''}`} style={{ top: typeof sticky === 'object' ? sticky.offsetHeader : 0, ...styles.header }}>{renderHeaderRows()}</thead>}
        <tbody className={classNames.body} style={styles.body}>{topPad > 0 && <tr aria-hidden><td colSpan={leafColumns.length + 2} style={{ height: topPad, padding: 0 }} /></tr>}{renderedRows.map(renderRow)}{bottomPad > 0 && <tr aria-hidden><td colSpan={leafColumns.length + 2} style={{ height: bottomPad, padding: 0 }} /></tr>}{!loading && allFlatRows.length === 0 && <tr><td className="orbit-table__empty" colSpan={leafColumns.length + 2}>{locale?.emptyText ?? '데이터가 없습니다.'}</td></tr>}</tbody>
        {summary && <tfoot><tr><td colSpan={leafColumns.length + 2}>{summary(pageData)}</td></tr></tfoot>}
      </table>
      {loading && <div className="orbit-table__loading">{typeof loading === 'boolean' ? <span className="orbit-table__spinner" aria-label="로딩 중" /> : loading}</div>}
    </div>
    {footer && <div className="orbit-table__footer">{footer(pageData)}</div>}
    {bottomPagination}
  </div>
}

function SortGlyph({ order }: { order: SortOrder }) {
  return <svg className="orbit-table__sort-icon" viewBox="0 0 12 14" aria-hidden><path className={order === 'ascend' ? 'is-active' : ''} d="M6 2 2.5 6h7L6 2Z" /><path className={order === 'descend' ? 'is-active' : ''} d="m6 12 3.5-4h-7L6 12Z" /></svg>
}

function FilterGlyph() {
  return <svg className="orbit-table__filter-icon" viewBox="0 0 16 16" aria-hidden><path d="M2.7 3.25a.75.75 0 0 1 .63-.35h9.34a.75.75 0 0 1 .57 1.24L9.5 8.5v3.35a.75.75 0 0 1-.37.65l-1.5.87A.75.75 0 0 1 6.5 12.7V8.5L2.76 4.14a.75.75 0 0 1-.06-.89Z" /></svg>
}

function FilterMenu<T extends object>({ column, values, onValues, onApply }: { column: ColumnType<T>; values: Key[]; onValues: (values: Key[]) => void; onApply: () => void }) {
  const [search, setSearch] = useState('')
  const items = flatFilterItems(column.filters).filter((item) => !search || (typeof column.filterSearch === 'function' ? column.filterSearch(search, item) : String(item.text).toLowerCase().includes(search.toLowerCase())))
  return <div className="orbit-table__filter-menu" onClick={(event) => event.stopPropagation()}>{column.filterSearch && <input className="orbit-table__filter-search" placeholder="필터 검색" value={search} onChange={(event) => setSearch(event.target.value)} />}{items.map((item) => <label key={item.value}><input type={column.filterMultiple === false ? 'radio' : 'checkbox'} name={column.filterMultiple === false ? 'table-filter' : undefined} checked={values.includes(item.value)} onChange={(event) => onValues(column.filterMultiple === false ? event.target.checked ? [item.value] : [] : event.target.checked ? [...values, item.value] : values.filter((value) => value !== item.value))} />{item.text}</label>)}<div className="orbit-table__filter-actions"><button onClick={() => onValues([])}>초기화</button><button className="is-primary" onClick={onApply}>확인</button></div></div>
}

function Pagination({ config, page, pageSize, total, pageCount, onChange, className = '', style }: { config: PaginationConfig; page: number; pageSize: number; total: number; pageCount: number; onChange: (page: number, size?: number) => void; className?: string; style?: React.CSSProperties }) {
  const start = total ? (page - 1) * pageSize + 1 : 0
  const end = Math.min(total, page * pageSize)
  return <nav className={`orbit-table__pagination ${className}`} style={style} aria-label="페이지네이션"><span>{config.showTotal?.(total, [start, end]) ?? `총 ${total}개`}</span>{config.showSizeChanger && <select aria-label="페이지 크기" value={pageSize} onChange={(event) => onChange(1, Number(event.target.value))}>{(config.pageSizeOptions ?? [10, 20, 50, 100]).map((size) => <option key={size} value={size}>{size} / 페이지</option>)}</select>}<div><button aria-label="이전 페이지" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</button><span>{page} / {pageCount}</span><button aria-label="다음 페이지" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>›</button></div></nav>
}

export const Table = forwardRef(InnerTable) as <T extends object>(props: TableProps<T> & { ref?: React.Ref<TableRef> }) => React.ReactElement
