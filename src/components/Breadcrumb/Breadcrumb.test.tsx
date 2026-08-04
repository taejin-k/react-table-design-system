import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createRef, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Breadcrumb } from './Breadcrumb'
import type { BreadcrumbItemType } from './Breadcrumb.types'

const basicItems: BreadcrumbItemType[] = [
  { title: '홈', href: '/' },
  { title: '컴포넌트', href: '/components' },
  { title: 'Breadcrumb' },
]

afterEach(cleanup)

describe('Breadcrumb', () => {
  it('renders an accessible ordered navigation trail from items', () => {
    render(<Breadcrumb items={basicItems} />)
    const navigation = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(navigation).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Breadcrumb')).toHaveAttribute('aria-current', 'page')
  })

  it('concatenates paths, substitutes params, and calls itemRender with Ant Design arguments', () => {
    const itemRender = vi.fn((route: BreadcrumbItemType, _params: { id: number }, _routes: BreadcrumbItemType[], paths: string[]) => <a href={`#/${paths.join('/')}`}>{'title' in route ? route.title : ''}:{paths.join('|')}</a>)
    render(<Breadcrumb items={[{ path: 'projects', title: '프로젝트' }, { path: ':id', title: '프로젝트 :id' }]} params={{ id: 42 }} itemRender={itemRender} />)
    expect(screen.getByText('프로젝트:projects')).toBeInTheDocument()
    expect(screen.getByText('프로젝트 :id:projects|42')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /프로젝트 :id/ })).toHaveAttribute('href', '#/projects/42')
    expect(screen.getByRole('link', { name: /프로젝트 :id/ }).querySelector('a')).not.toBeInTheDocument()
    expect(itemRender).toHaveBeenLastCalledWith(expect.objectContaining({ path: ':id' }), { id: 42 }, expect.any(Array), ['projects', '42'])
  })

  it('supports global and explicit separators without rendering duplicates', () => {
    render(<Breadcrumb separator="›" items={[{ title: '홈' }, { type: 'separator', separator: ':' }, { title: '상세' }]} />)
    expect(screen.getAllByText(':')).toHaveLength(1)
    expect(screen.queryByText('›')).not.toBeInTheDocument()
  })

  it('opens menu breadcrumbs and closes on action, outside pointer, and Escape', () => {
    render(<Breadcrumb items={[{ title: '컴포넌트', menu: { items: [{ key: 'table', label: 'Table' }, { key: 'breadcrumb', label: 'Breadcrumb' }] }, dropdownProps: { trigger: ['click'] } }, { title: 'Breadcrumb' }]} />)
    const trigger = screen.getByRole('button', { name: '컴포넌트' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Table' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    fireEvent.click(trigger)
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('opens on hover by default and closes after leaving the popup region', () => {
    vi.useFakeTimers()
    render(<Breadcrumb items={[{ title: 'Hover menu', menu: { items: [{ key: 'one', label: 'One' }] } }]} />)
    const dropdown = screen.getByRole('button', { name: 'Hover menu' }).closest('.orbit-breadcrumb__dropdown')!
    fireEvent.pointerEnter(dropdown)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.pointerLeave(dropdown)
    act(() => vi.advanceTimersByTime(121))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('supports keyboard opening and focuses the first enabled menu item', () => {
    render(<Breadcrumb items={[{ title: '제품', menu: { items: [{ key: 'disabled', label: '비활성', disabled: true }, { key: 'active', label: '활성' }, { key: 'next', label: '다음' }] } }]} />)
    const trigger = screen.getByRole('button', { name: '제품' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: '활성' })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: '다음' })).toHaveFocus()
  })

  it('emits menu item, menu, and dropdown callbacks', () => {
    const onItem = vi.fn()
    const onMenu = vi.fn()
    const onOpenChange = vi.fn()
    render(<Breadcrumb items={[{ title: '메뉴', menu: { onClick: onMenu, items: [{ key: 'target', label: '대상', onClick: onItem }] }, dropdownProps: { trigger: ['click'], onOpenChange } }]} />)
    fireEvent.click(screen.getByRole('button', { name: '메뉴' }))
    fireEvent.click(screen.getByRole('menuitem', { name: '대상' }))
    expect(onOpenChange).toHaveBeenNthCalledWith(1, true, { source: 'trigger' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { source: 'menu' })
    expect(onItem).toHaveBeenCalledWith(expect.objectContaining({ key: 'target' }))
    expect(onMenu).toHaveBeenCalledWith(expect.objectContaining({ key: 'target' }))
  })

  it('supports a controlled dropdown', () => {
    function Controlled() {
      const [open, setOpen] = useState(false)
      return <Breadcrumb items={[{ title: '제어 메뉴', menu: { items: [{ key: 'one', label: '첫 항목' }] }, dropdownProps: { open, trigger: ['click'], onOpenChange: setOpen } }]} />
    }
    render(<Controlled />)
    const trigger = screen.getByRole('button', { name: '제어 메뉴' })
    fireEvent.click(trigger)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.click(trigger)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('portals dropdown menus into the requested container', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    render(<Breadcrumb items={[{ title: '포털', menu: { items: [{ key: 'one', label: '항목' }] }, dropdownProps: { defaultOpen: true, getPopupContainer: () => host } }]} />)
    expect(host).toContainElement(screen.getByRole('menu'))
    host.remove()
  })

  it('supports semantic class/style functions, native props, and refs', () => {
    const ref = createRef<HTMLElement>()
    render(<Breadcrumb ref={ref} items={basicItems} data-testid="trail" aria-label="현재 위치" classNames={() => ({ root: 'custom-root', item: 'custom-item', separator: 'custom-separator' })} styles={() => ({ root: { marginTop: 8 }, item: { fontWeight: 500 } })} />)
    const root = screen.getByRole('navigation', { name: '현재 위치' })
    expect(root).toBe(ref.current)
    expect(root).toHaveClass('custom-root')
    expect(root).toHaveStyle({ marginTop: '8px' })
    expect(root.querySelector('.custom-item')).toHaveStyle({ fontWeight: '500' })
    expect(root.querySelector('.custom-separator')).toBeInTheDocument()
  })

  it('keeps the legacy Breadcrumb.Item and Separator composition API', () => {
    render(<Breadcrumb><Breadcrumb.Item href="/">홈</Breadcrumb.Item><Breadcrumb.Separator>:</Breadcrumb.Separator><Breadcrumb.Item>상세</Breadcrumb.Item></Breadcrumb>)
    expect(screen.getByRole('link', { name: '홈' })).toHaveAttribute('href', '/')
    expect(screen.getByText(':')).toBeInTheDocument()
    expect(screen.getByText('상세')).toHaveAttribute('aria-current', 'page')
  })
})
