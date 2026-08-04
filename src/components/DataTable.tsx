import { Fragment, type ReactNode, useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

export type Column<T> = {
  key: keyof T & string
  title: string
  width?: number
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  fixed?: 'left' | 'right'
  render?: (value: T[keyof T], row: T) => ReactNode
}

export type DataTableProps<T extends { id: string }> = {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  loading?: boolean
  error?: string
  emptyText?: string
  selectable?: boolean
  expandable?: (row: T) => ReactNode
  onRowsChange?: (rows: T[]) => void
}

const iconButton = 'inline-grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'

export function DataTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 6,
  loading = false,
  error,
  emptyText = '표시할 데이터가 없습니다.',
  selectable = true,
  expandable,
  onRowsChange,
}: DataTableProps<T>) {
  const [rows, setRows] = useState(data)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: keyof T & string; direction: SortDirection } | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const visibleColumns = columns.filter((column) => !hidden.has(column.key))
  const processedRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    const result = rows.filter((row) => {
      const matchesQuery = !normalizedQuery || Object.values(row).some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery))
      const matchesFilters = Object.entries(filters).every(([key, value]) => !value || String(row[key as keyof T]).toLocaleLowerCase().includes(value.toLocaleLowerCase()))
      return matchesQuery && matchesFilters
    })
    if (!sort) return result
    return [...result].sort((a, b) => {
      const left = a[sort.key]
      const right = b[sort.key]
      const comparison = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'ko', { numeric: true })
      return sort.direction === 'asc' ? comparison : -comparison
    })
  }, [filters, query, rows, sort])

  const pageCount = Math.max(1, Math.ceil(processedRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageRows = processedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((row) => selected.has(row.id))

  const updateCell = (id: string, key: keyof T, value: string) => {
    const nextRows = rows.map((row) => {
      if (row.id !== id) return row
      const original = row[key]
      return { ...row, [key]: typeof original === 'number' ? Number(value) : value }
    })
    setRows(nextRows)
    onRowsChange?.(nextRows)
  }

  const toggleSort = (key: keyof T & string) => {
    setPage(1)
    setSort((current) => current?.key === key
      ? current.direction === 'asc' ? { key, direction: 'desc' } : null
      : { key, direction: 'asc' })
  }

  const stickyClass = (fixed?: 'left' | 'right') => fixed === 'left' ? 'sticky left-0 z-10 bg-inherit' : fixed === 'right' ? 'sticky right-0 z-10 bg-inherit' : ''

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-24px_rgba(15,23,42,.35)]" aria-label="데이터 테이블">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <label className="relative min-w-60 flex-1 sm:max-w-sm">
          <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-slate-400">⌕</span>
          <span className="sr-only">전체 검색</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="전체 데이터 검색..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
        </label>
        <div className="relative">
          <button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" onClick={() => setSettingsOpen((value) => !value)} aria-expanded={settingsOpen}>⚙ 열 설정</button>
          {settingsOpen && <div className="absolute right-0 top-12 z-30 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400">표시할 열</p>
            {columns.map((column) => <label key={column.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50"><input type="checkbox" checked={!hidden.has(column.key)} onChange={() => setHidden((current) => { const next = new Set(current); if (next.has(column.key)) next.delete(column.key); else next.add(column.key); return next })} className="accent-indigo-600" />{column.title}</label>)}
          </div>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-200 border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              {expandable && <th className="w-11 px-3 py-3"><span className="sr-only">행 펼치기</span></th>}
              {selectable && <th className="w-11 px-3 py-3"><input aria-label="현재 페이지 전체 선택" type="checkbox" checked={allOnPageSelected} onChange={() => setSelected((current) => { const next = new Set(current); pageRows.forEach((row) => allOnPageSelected ? next.delete(row.id) : next.add(row.id)); return next })} className="size-4 accent-indigo-600" /></th>}
              {visibleColumns.map((column) => <th key={column.key} style={{ width: column.width }} className={`${stickyClass(column.fixed)} px-4 py-3`}>
                <button disabled={!column.sortable} onClick={() => toggleSort(column.key)} className="flex items-center gap-1.5 disabled:cursor-default" aria-label={`${column.title} 정렬`}>
                  {column.title}<span className={sort?.key === column.key ? 'text-indigo-600' : 'text-slate-300'}>{sort?.key === column.key ? sort.direction === 'asc' ? '↑' : '↓' : '↕'}</span>
                </button>
                {column.filterable && <input aria-label={`${column.title} 필터`} value={filters[column.key] ?? ''} onChange={(event) => { setFilters((current) => ({ ...current, [column.key]: event.target.value })); setPage(1) }} placeholder="필터" className="mt-2 h-7 w-full min-w-20 rounded-md border border-slate-200 bg-white px-2 text-xs font-normal normal-case tracking-normal outline-none focus:border-indigo-400" />}
              </th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? Array.from({ length: pageSize }).map((_, index) => <tr key={index}><td colSpan={visibleColumns.length + 2} className="px-4 py-4"><div className="h-5 animate-pulse rounded bg-slate-100" /></td></tr>) : error ? <tr><td colSpan={visibleColumns.length + 2} className="px-6 py-16 text-center text-rose-600">{error}</td></tr> : pageRows.length === 0 ? <tr><td colSpan={visibleColumns.length + 2} className="px-6 py-16 text-center text-slate-400">{emptyText}</td></tr> : pageRows.map((row) => <Fragment key={row.id}>
              <tr className={`group bg-white transition hover:bg-indigo-50/40 ${selected.has(row.id) ? 'bg-indigo-50/70' : ''}`}>
                {expandable && <td className="px-3 py-3"><button className={iconButton} onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(row.id)) next.delete(row.id); else next.add(row.id); return next })} aria-label={expanded.has(row.id) ? '행 접기' : '행 펼치기'} aria-expanded={expanded.has(row.id)}>{expanded.has(row.id) ? '−' : '+'}</button></td>}
                {selectable && <td className="px-3 py-3"><input aria-label={`${row.id} 행 선택`} type="checkbox" checked={selected.has(row.id)} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(row.id)) next.delete(row.id); else next.add(row.id); return next })} className="size-4 accent-indigo-600" /></td>}
                {visibleColumns.map((column) => <td key={column.key} className={`${stickyClass(column.fixed)} px-4 py-3 text-slate-700`}>
                  {column.editable ? <input aria-label={`${column.title} 편집`} value={String(row[column.key])} onChange={(event) => updateCell(row.id, column.key, event.target.value)} className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 outline-none hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100" /> : column.render ? column.render(row[column.key], row) : String(row[column.key])}
                </td>)}
              </tr>
              {expandable && expanded.has(row.id) && <tr className="bg-slate-50"><td colSpan={visibleColumns.length + 2} className="px-6 py-5">{expandable(row)}</td></tr>}
            </Fragment>)}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
        <span>{selected.size > 0 ? `${selected.size}개 선택 · ` : ''}총 {processedRows.length}개</span>
        <div className="flex items-center gap-1">
          <button className={iconButton} disabled={currentPage === 1} onClick={() => setPage(1)} aria-label="첫 페이지">«</button>
          <button className={iconButton} disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="이전 페이지">‹</button>
          <span className="px-3 font-semibold text-slate-700">{currentPage} / {pageCount}</span>
          <button className={iconButton} disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} aria-label="다음 페이지">›</button>
          <button className={iconButton} disabled={currentPage === pageCount} onClick={() => setPage(pageCount)} aria-label="마지막 페이지">»</button>
        </div>
      </footer>
    </section>
  )
}
