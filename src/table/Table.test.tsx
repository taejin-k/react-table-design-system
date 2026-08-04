import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Table } from './Table'
import type { ColumnsType } from './types'

type Row = { key: string; name: string; team: string; score: number; children?: Row[] }
const data: Row[] = [
  { key: '1', name: 'Bravo', team: 'Design', score: 2, children: [{ key: '1-1', name: 'Child', team: 'Design', score: 0 }] },
  { key: '2', name: 'Alpha', team: 'Platform', score: 1 },
  { key: '3', name: 'Charlie', team: 'Design', score: 3 },
]
const columns: ColumnsType<Row> = [
  { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: 'Team', dataIndex: 'team', key: 'team', filters: [{ text: 'Design', value: 'Design' }, { text: 'Platform', value: 'Platform' }], onFilter: (value, row) => row.team === value },
  { title: 'Score', dataIndex: 'score', key: 'score' },
]

afterEach(cleanup)

describe('Table', () => {
  it('uses antd-style dataSource and columns and sorts locally', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Name 정렬' }))
    const bodyRows = screen.getAllByRole('row').slice(1)
    expect(bodyRows[0]).toHaveTextContent('Alpha')
  })

  it('filters through the column menu and emits onChange', () => {
    const onChange = vi.fn()
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Team 필터' }))
    const menu = screen.getByLabelText('Design').closest('label')?.parentElement
    expect(menu).not.toBeNull()
    fireEvent.click(within(menu!).getByLabelText('Design'))
    fireEvent.click(within(menu!).getByRole('button', { name: '확인' }))
    expect(screen.getByText('Bravo')).toBeInTheDocument()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), expect.anything(), expect.objectContaining({ action: 'filter' }))
  })

  it('supports controlled row selection callbacks', () => {
    const onSelectionChange = vi.fn()
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} rowSelection={{ onChange: onSelectionChange }} />)
    fireEvent.click(screen.getByLabelText('1 행 선택'))
    expect(onSelectionChange).toHaveBeenCalledWith(['1'], [data[0]], { type: 'multiple' })
  })

  it('cascades tree selection when checkStrictly is false', () => {
    const onSelectionChange = vi.fn()
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} expandable={{ defaultExpandAllRows: true }} rowSelection={{ checkStrictly: false, onChange: onSelectionChange }} />)
    fireEvent.click(screen.getByLabelText('1 행 선택'))
    expect(onSelectionChange).toHaveBeenCalledWith(['1', '1-1'], [data[0], data[0].children![0]], { type: 'multiple' })
  })

  it('expands tree rows and custom detail rows', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} expandable={{ expandedRowRender: (row) => <span>Detail {row.name}</span> }} />)
    const expandButtons = screen.getAllByRole('button', { name: '행 펼치기' })
    fireEvent.click(expandButtons[0])
    expect(screen.getByText('Child')).toBeInTheDocument()
    expect(screen.getByText('Detail Bravo')).toBeInTheDocument()
  })

  it('paginates and changes page size', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={{ pageSize: 1, showSizeChanger: true, pageSizeOptions: [1, 2] }} />)
    expect(screen.getByText('Bravo')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }))
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('페이지 크기'), { target: { value: '2' } })
    expect(screen.getByText('Bravo')).toBeInTheDocument()
  })
})
