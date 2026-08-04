import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import type { PaginationConfig, PaginationItemType, PaginationPlacement } from './Table.types'

type PaginationProps = {
  config: PaginationConfig
  page: number
  pageSize: number
  total: number
  pageCount: number
  placement: PaginationPlacement
  onChange: (page: number, size?: number) => void
  className?: string
  style?: CSSProperties
}

type PageItem = number | 'jump-prev' | 'jump-next'

function pageItems(current: number, total: number, less: boolean): PageItem[] {
  const buffer = less ? 1 : 2
  if (total <= buffer * 2 + 5) return Array.from({ length: total }, (_, index) => index + 1)
  const left = Math.max(2, current - buffer)
  const right = Math.min(total - 1, current + buffer)
  const items: PageItem[] = [1]
  if (left > 2) items.push('jump-prev')
  for (let page = left; page <= right; page += 1) items.push(page)
  if (right < total - 1) items.push('jump-next')
  items.push(total)
  return items
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return <svg viewBox="0 0 12 12" aria-hidden><path d={direction === 'left' ? 'M7.8 2 3.8 6l4 4' : 'M4.2 2l4 4-4 4'} /></svg>
}

function renderItem(config: PaginationConfig, page: number, type: PaginationItemType, originalElement: ReactNode) {
  return config.itemRender?.(page, type, originalElement) ?? originalElement
}

export function Pagination({ config, page, pageSize, total, pageCount, placement, onChange, className = '', style }: PaginationProps) {
  const [jumpValue, setJumpValue] = useState('')
  const locale = config.locale ?? {}
  const start = total ? (page - 1) * pageSize + 1 : 0
  const end = Math.min(total, page * pageSize)
  const sizeChanger = config.showSizeChanger ?? total > (config.totalBoundaryShowSizeChanger ?? 50)
  const pageSizeOptions = [...new Set([pageSize, ...(config.pageSizeOptions ?? [10, 20, 50, 100]).map(Number)])].sort((left, right) => left - right)
  const disabled = config.disabled ?? false
  const size = config.size ?? 'medium'
  const semanticClassNames = typeof config.classNames === 'function' ? config.classNames({ current: page, pageSize, total }) : config.classNames
  const semanticStyles = typeof config.styles === 'function' ? config.styles({ current: page, pageSize, total }) : config.styles
  const placementAlign = placement.endsWith('Start') ? 'start' : placement.endsWith('Center') ? 'center' : 'end'
  const align = config.align ?? placementAlign
  const itemClassName = semanticClassNames?.item ?? ''
  const itemStyle = semanticStyles?.item

  const jump = (next: number) => onChange(Math.max(1, Math.min(pageCount, next)))
  const submitJump = (event: FormEvent) => {
    event.preventDefault()
    const next = Number(jumpValue)
    if (Number.isFinite(next)) jump(next)
    setJumpValue('')
  }

  const prev = <button type="button" className={itemClassName} style={itemStyle} title={config.showTitle === false ? undefined : locale.prev_page ?? '이전 페이지'} aria-label={locale.prev_page ?? '이전 페이지'} disabled={disabled || page <= 1} onClick={() => jump(page - 1)}><Chevron direction="left" /></button>
  const next = <button type="button" className={itemClassName} style={itemStyle} title={config.showTitle === false ? undefined : locale.next_page ?? '다음 페이지'} aria-label={locale.next_page ?? '다음 페이지'} disabled={disabled || page >= pageCount} onClick={() => jump(page + 1)}><Chevron direction="right" /></button>

  return <nav
    className={`orbit-table__pagination orbit-table__pagination--${size} orbit-table__pagination--${align} orbit-table__pagination--${placement.startsWith('top') ? 'top' : 'bottom'} ${config.responsive ? 'is-responsive' : ''} ${className} ${semanticClassNames?.root ?? ''}`}
    style={{ ...style, ...semanticStyles?.root }}
    aria-label="페이지네이션"
  >
    {config.showTotal && <span className="orbit-table__pagination-total">{config.showTotal(total, [start, end])}</span>}
    <div className="orbit-table__pagination-controls">
      {renderItem(config, page - 1, 'prev', prev)}
      {config.simple ? <span className="orbit-table__pagination-simple"><input aria-label="현재 페이지" inputMode="numeric" readOnly={typeof config.simple === 'object' && config.simple.readOnly} value={page} onChange={(event) => jump(Number(event.target.value))} /><span>/</span><span>{pageCount}</span></span> : pageItems(page, pageCount, config.showLessItems ?? false).map((item) => {
        if (item === 'jump-prev' || item === 'jump-next') {
          const delta = config.showLessItems ? 3 : 5
          const target = item === 'jump-prev' ? page - delta : page + delta
          const label = item === 'jump-prev' ? locale.prev_5 ?? `이전 ${delta}페이지` : locale.next_5 ?? `다음 ${delta}페이지`
          const element = <button type="button" className={`${itemClassName} orbit-table__pagination-jump`} style={itemStyle} title={config.showTitle === false ? undefined : label} aria-label={label} disabled={disabled} onClick={() => jump(target)}>•••</button>
          return <span key={item}>{config.showPrevNextJumpers === false ? null : renderItem(config, target, item, element)}</span>
        }
        const element = <button type="button" className={`${itemClassName} ${item === page ? 'is-active' : ''}`} style={itemStyle} title={config.showTitle === false ? undefined : `${item} ${locale.page ?? '페이지'}`} aria-label={`${item} ${locale.page ?? '페이지'}`} aria-current={item === page ? 'page' : undefined} disabled={disabled} onClick={() => jump(item)}>{item}</button>
        return <span key={item}>{renderItem(config, item, 'page', element)}</span>
      })}
      {renderItem(config, page + 1, 'next', next)}
    </div>
    {sizeChanger && <select aria-label="페이지 크기" disabled={disabled || (typeof config.showSizeChanger === 'object' && config.showSizeChanger.disabled)} value={pageSize} onChange={(event) => { const nextSize = Number(event.target.value); config.onShowSizeChange?.(page, nextSize); onChange(1, nextSize) }}>{pageSizeOptions.map((value) => <option key={value} value={value}>{value} {locale.items_per_page ?? '/ 페이지'}</option>)}</select>}
    {config.showQuickJumper && <form className="orbit-table__pagination-jumper" onSubmit={submitJump}><label>{locale.jump_to ?? '이동'}<input aria-label="이동할 페이지" inputMode="numeric" value={jumpValue} onChange={(event) => setJumpValue(event.target.value)} /></label>{typeof config.showQuickJumper === 'object' && config.showQuickJumper.goButton ? <button type="submit" disabled={disabled}>{config.showQuickJumper.goButton}</button> : <span>{locale.page ?? '페이지'}</span>}</form>}
  </nav>
}
