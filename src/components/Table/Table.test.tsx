import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { HTMLAttributes } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Table } from './Table'
import type { ColumnsType } from './Table.types'

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

function CustomRow({ record, ...props }: HTMLAttributes<HTMLTableRowElement> & { record?: Row }) {
  return <tr {...props} data-record-name={record?.name} />
}

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
    const menu = screen.getByRole('dialog', { name: '필터 메뉴' })
    fireEvent.click(within(menu).getByLabelText('Design'))
    fireEvent.click(within(menu).getByRole('button', { name: '확인' }))
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

  it('supports antd-style custom body row components', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} components={{ body: { row: CustomRow } }} />)
    expect(screen.getByText('Bravo').closest('tr')).toHaveAttribute('data-record-name', 'Bravo')
  })

  it('treats sorter true as server-side sorting and only emits the sorter state', () => {
    const onChange = vi.fn()
    render(<Table<Row> dataSource={data} columns={[{ title: 'Name', dataIndex: 'name', key: 'name', sorter: true }]} pagination={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Name 정렬' }))
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Bravo')
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), expect.anything(), expect.objectContaining({ columnKey: 'name', order: 'ascend' }), expect.objectContaining({ action: 'sort' }))
  })

  it('does not slice an already server-paginated dataSource again', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={{ current: 2, pageSize: 10, total: 30 }} />)
    expect(screen.getByText('Bravo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2 페이지' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders numbered pagination and supports quick page jumping', () => {
    const rows = Array.from({ length: 25 }, (_, index) => ({ key: String(index), name: `Row ${index + 1}`, team: 'Design', score: index }))
    render(<Table<Row> dataSource={rows} columns={columns} pagination={{ pageSize: 5, showQuickJumper: true }} />)
    fireEvent.click(screen.getByRole('button', { name: '3 페이지' }))
    expect(screen.getByText('Row 11')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('이동할 페이지'), { target: { value: '5' } })
    fireEvent.submit(screen.getByLabelText('이동할 페이지').closest('form')!)
    expect(screen.getByText('Row 21')).toBeInTheDocument()
  })

  it('supports shared column props and default selection actions', () => {
    const onSelectionChange = vi.fn()
    render(<Table<Row> dataSource={data} columns={columns} column={{ align: 'right' }} pagination={false} rowSelection={{ selections: true, onChange: onSelectionChange }} />)
    expect(screen.getByText('Bravo')).toHaveStyle({ textAlign: 'right' })
    fireEvent.click(screen.getByLabelText('선택 작업'))
    fireEvent.click(screen.getByRole('button', { name: '전체 데이터 선택' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '2', '3'], data, { type: 'all' })
  })

  it('supports functional semantic classNames and custom expand icons', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} classNames={() => ({ body: { row: 'semantic-row' } })} expandable={{ expandedRowRender: (row) => row.name, expandIcon: ({ expanded, onExpand, record }) => <button aria-label="custom-expand" onClick={(event) => onExpand(record, event)}>{expanded ? 'close' : 'open'}</button> }} />)
    expect(screen.getByText('Bravo').closest('tr')).toHaveClass('semantic-row')
    fireEvent.click(screen.getAllByRole('button', { name: 'custom-expand' })[0])
    expect(screen.getAllByText('Bravo')).toHaveLength(2)
  })
})
