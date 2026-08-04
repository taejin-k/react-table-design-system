import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createRef, type HTMLAttributes } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Table } from './Table'
import type { ColumnsType, TableRef } from './Table.types'

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

  it('updates parent checked and indeterminate state when tree selection is associated', () => {
    const tree: Row[] = [{ key: 'parent', name: 'Parent', team: 'Design', score: 0, children: [
      { key: 'child-1', name: 'Child 1', team: 'Design', score: 1 },
      { key: 'child-2', name: 'Child 2', team: 'Design', score: 2 },
    ] }]
    render(<Table<Row> dataSource={tree} columns={columns} pagination={false} expandable={{ defaultExpandAllRows: true }} rowSelection={{ checkStrictly: false }} />)
    const parent = screen.getByLabelText('parent 행 선택') as HTMLInputElement
    fireEvent.click(screen.getByLabelText('child-1 행 선택'))
    expect(parent).not.toBeChecked()
    expect(parent.indeterminate).toBe(true)
    fireEvent.click(screen.getByLabelText('child-2 행 선택'))
    expect(parent).toBeChecked()
    expect(parent.indeterminate).toBe(false)
  })

  it('expands tree rows and custom detail rows', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} expandable={{ expandedRowRender: (row) => <span>Detail {row.name}</span> }} />)
    const expandButtons = screen.getAllByRole('button', { name: '행 펼치기' })
    fireEvent.click(expandButtons[0])
    expect(screen.getByText('Child')).toBeInTheDocument()
    expect(screen.getByText('Detail Bravo')).toBeInTheDocument()
  })

  it('paginates and preserves the current page when page size changes', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={{ defaultPageSize: 1, showSizeChanger: true, pageSizeOptions: [1, 2] }} />)
    expect(screen.getByText('Bravo')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '다음 페이지' }))
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('페이지 크기'), { target: { value: '2' } })
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('keeps a custom current page size visible in the automatic size changer', () => {
    const rows = Array.from({ length: 60 }, (_, index) => ({ key: String(index), name: `Row ${index + 1}`, team: 'Design', score: index }))
    render(<Table<Row> dataSource={rows} columns={columns} pagination={{ pageSize: 6 }} />)
    expect(screen.getByLabelText('페이지 크기')).toHaveValue('6')
    expect(within(screen.getByLabelText('페이지 크기')).getByRole('option', { name: '6 / 페이지' })).toBeInTheDocument()
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
    expect(onSelectionChange).toHaveBeenLastCalledWith(['1', '1-1', '2', '3'], [data[0], data[0].children![0], data[1], data[2]], { type: 'all' })
  })

  it('supports the antd selection constants on the Table namespace', () => {
    const onSelectionChange = vi.fn()
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} rowSelection={{ selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE], onChange: onSelectionChange }} />)
    fireEvent.click(screen.getByLabelText('선택 작업'))
    fireEvent.click(screen.getByRole('button', { name: 'Select all data' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.arrayContaining(['1', '2', '3']), expect.anything(), { type: 'all' })
  })

  it('supports functional semantic classNames and custom expand icons', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} classNames={() => ({ body: { row: 'semantic-row' } })} expandable={{ expandedRowRender: (row) => row.name, expandIcon: ({ expanded, onExpand, record }) => <button aria-label="custom-expand" onClick={(event) => onExpand(record, event)}>{expanded ? 'close' : 'open'}</button> }} />)
    expect(screen.getByText('Bravo').closest('tr')).toHaveClass('semantic-row')
    fireEvent.click(screen.getAllByRole('button', { name: 'custom-expand' })[0])
    expect(screen.getAllByText('Bravo')).toHaveLength(2)
  })

  it('keeps tree indentation deterministic across expanded states', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} expandable={{ defaultExpandAllRows: true }} />)
    const rootRow = screen.getByText('Bravo').closest('tr')!
    const childRow = screen.getByText('Child').closest('tr')!
    expect(rootRow).toHaveAttribute('data-row-depth', '0')
    expect(childRow).toHaveAttribute('data-row-depth', '1')
    expect(rootRow.querySelector('.orbit-table__expand-indent')).toHaveStyle({ paddingInlineStart: '15px' })
    expect(childRow.querySelector('.orbit-table__expand-indent')).toHaveStyle({ paddingInlineStart: '30px' })
    fireEvent.click(within(rootRow).getByRole('button', { name: '행 접기' }))
    expect(screen.queryByText('Child')).not.toBeInTheDocument()
    expect(screen.getByText('Bravo').closest('tr')!.querySelector('.orbit-table__expand-indent')).toHaveStyle({ paddingInlineStart: '15px' })
  })

  it('marks the visual last column instead of the DOM last child for merged rows', () => {
    const mergedColumns: ColumnsType<Row> = [
      columns[0],
      columns[1],
      { ...columns[2], onCell: (_record, index) => index === 0 ? { rowSpan: 2 } : index === 1 ? { rowSpan: 0 } : {} },
    ]
    render(<Table<Row> dataSource={data} columns={mergedColumns} pagination={false} bordered />)
    const secondRowCells = screen.getByText('Alpha').closest('tr')!.querySelectorAll('td')
    expect(secondRowCells).toHaveLength(2)
    expect(secondRowCells[1]).not.toHaveClass('orbit-table__cell--last')
    expect(screen.getByText('Platform').closest('td')).not.toHaveClass('orbit-table__cell--last')
    expect(screen.getByText('3').closest('td')).toHaveClass('orbit-table__cell--last')
  })

  it('supports antd-style Table.Column and Table.ColumnGroup JSX syntax', () => {
    render(<Table<Row> dataSource={data} pagination={false}>
      <Table.ColumnGroup<Row> title="Member">
        <Table.Column<Row> title="Name" dataIndex="name" key="name" />
        <Table.Column<Row> title="Team" dataIndex="team" key="team" />
      </Table.ColumnGroup>
      <Table.Column<Row> title="Score" dataIndex="score" key="score" />
    </Table>)
    expect(screen.getByRole('columnheader', { name: 'Member' })).toHaveAttribute('colspan', '2')
    expect(screen.getByText('Bravo')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('supports the Table.Summary compound API without an extra wrapper row', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} summary={(rows) => <Table.Summary><Table.Summary.Row><Table.Summary.Cell index={0} colSpan={3}>Total {rows.reduce((sum, row) => sum + row.score, 0)}</Table.Summary.Cell></Table.Summary.Row></Table.Summary>} />)
    const summaryCell = screen.getByText('Total 6').closest('td')!
    expect(summaryCell).toHaveAttribute('data-column-index', '0')
    expect(summaryCell.closest('tfoot')?.querySelectorAll('tr')).toHaveLength(1)
  })

  it('supports fixed Table.Summary placement', () => {
    render(<Table<Row> dataSource={data} columns={columns} pagination={false} summary={() => <Table.Summary fixed="top"><Table.Summary.Row><Table.Summary.Cell index={0}>Pinned</Table.Summary.Cell></Table.Summary.Row></Table.Summary>} />)
    expect(screen.getByText('Pinned').closest('tbody')).toHaveClass('is-sticky-summary--top')
  })

  it('commits multi-digit simple pagination only on Enter or blur', () => {
    const rows = Array.from({ length: 20 }, (_, index) => ({ key: String(index), name: `Row ${index + 1}`, team: 'Design', score: index }))
    render(<Table<Row> dataSource={rows} columns={columns} pagination={{ defaultPageSize: 1, simple: true }} />)
    const input = screen.getByLabelText('현재 페이지')
    fireEvent.change(input, { target: { value: '12' } })
    expect(screen.getByText('Row 1')).toBeInTheDocument()
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Row 12')).toBeInTheDocument()
  })

  it('keeps page size callbacks aligned with rc-pagination semantics', () => {
    const rows = Array.from({ length: 40 }, (_, index) => ({ key: String(index), name: `Row ${index + 1}`, team: 'Design', score: index }))
    const onChange = vi.fn()
    const onShowSizeChange = vi.fn()
    render(<Table<Row> dataSource={rows} columns={columns} pagination={{ defaultCurrent: 3, defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: [5, 10], onChange, onShowSizeChange }} />)
    fireEvent.change(screen.getByLabelText('페이지 크기'), { target: { value: '10' } })
    expect(screen.getByText('Row 21')).toBeInTheDocument()
    expect(onShowSizeChange).toHaveBeenLastCalledWith(3, 10)
    expect(onChange).toHaveBeenLastCalledWith(3, 10)
  })

  it('hides quick jump on one page and hides pagination for zero records', () => {
    const { rerender } = render(<Table<Row> dataSource={data} columns={columns} pagination={{ pageSize: 10, showQuickJumper: true }} />)
    expect(screen.queryByLabelText('이동할 페이지')).not.toBeInTheDocument()
    rerender(<Table<Row> dataSource={[]} columns={columns} pagination={{ pageSize: 10 }} />)
    expect(screen.queryByRole('navigation', { name: '페이지네이션' })).not.toBeInTheDocument()
  })

  it('treats filteredValue null as a controlled cleared filter', () => {
    const controlledColumns: ColumnsType<Row> = [{ ...columns[1], defaultFilteredValue: ['Design'], filteredValue: null }]
    render(<Table<Row> dataSource={data} columns={controlledColumns} pagination={false} />)
    expect(screen.getByText('Platform')).toBeInTheDocument()
  })

  it('emits server-side filters without filtering locally when onFilter is absent', () => {
    const onChange = vi.fn()
    const serverColumns: ColumnsType<Row> = [{ title: 'Team', dataIndex: 'team', key: 'team', filters: [{ text: 'Design', value: 'Design' }] }]
    render(<Table<Row> dataSource={data} columns={serverColumns} pagination={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Team 필터' }))
    fireEvent.click(screen.getByLabelText('Design'))
    fireEvent.click(screen.getByRole('button', { name: '확인' }))
    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), { team: ['Design'] }, expect.anything(), expect.objectContaining({ action: 'filter' }))
  })

  it('sorts nested tree levels recursively', () => {
    const tree: Row[] = [{ key: 'root', name: 'Root', team: 'Design', score: 0, children: [
      { key: 'child-z', name: 'Zulu', team: 'Design', score: 2 },
      { key: 'child-a', name: 'Alpha child', team: 'Design', score: 1 },
    ] }]
    render(<Table<Row> dataSource={tree} columns={columns} pagination={false} expandable={{ defaultExpandAllRows: true }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Name 정렬' }))
    const bodyRows = screen.getAllByRole('row').slice(1)
    expect(bodyRows[1]).toHaveTextContent('Alpha child')
    expect(bodyRows[2]).toHaveTextContent('Zulu')
  })

  it('supports RenderedCell props without attempting to render the wrapper object', () => {
    const renderedColumns: ColumnsType<Row> = [{ title: 'Name', render: () => ({ props: { className: 'props-only-cell' } }) }]
    render(<Table<Row> dataSource={[data[0]]} columns={renderedColumns} pagination={false} rowSelection={{ renderCell: () => ({ props: { className: 'props-only-selection' } }) }} />)
    expect(document.querySelector('.props-only-cell')).toBeEmptyDOMElement()
    expect(document.querySelector('.props-only-selection')).toBeEmptyDOMElement()
  })

  it('forwards native root attributes and merges root styles', () => {
    render(<Table<Row> data-testid="table-root" aria-label="Members" style={{ marginTop: 7 }} dataSource={data} columns={columns} pagination={false} />)
    expect(screen.getByTestId('table-root')).toHaveAttribute('aria-label', 'Members')
    expect(screen.getByTestId('table-root')).toHaveStyle({ marginTop: '7px' })
  })

  it('expands every eligible detail row for defaultExpandAllRows', () => {
    render(<Table<Row> dataSource={data.slice(1)} columns={columns} pagination={false} expandable={{ defaultExpandAllRows: true, expandedRowRender: (row) => `Detail ${row.name}` }} />)
    expect(screen.getByText('Detail Alpha')).toBeInTheDocument()
    expect(screen.getByText('Detail Charlie')).toBeInTheDocument()
  })

  it('isolates radio groups across multiple tables', () => {
    render(<><Table<Row> dataSource={data} columns={columns} pagination={false} rowSelection={{ type: 'radio' }} /><Table<Row> dataSource={data} columns={columns} pagination={false} rowSelection={{ type: 'radio' }} /></>)
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).not.toHaveAttribute('name', radios[3].getAttribute('name'))
  })

  it('does not render a header cell whose colSpan is zero', () => {
    render(<Table<Row> dataSource={data} columns={[{ title: 'Hidden header', dataIndex: 'name', colSpan: 0 }, columns[1]]} pagination={false} />)
    expect(screen.queryByRole('columnheader', { name: 'Hidden header' })).not.toBeInTheDocument()
  })

  it('resets pagination on filter but keeps it on sort', () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({ key: String(index), name: `Row ${String(index + 1).padStart(2, '0')}`, team: index % 2 ? 'Design' : 'Platform', score: index }))
    const paginationChange = vi.fn()
    const onChange = vi.fn()
    render(<Table<Row> dataSource={rows} columns={columns} pagination={{ defaultCurrent: 2, pageSize: 5, onChange: paginationChange }} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Name 정렬' }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ current: 2 }), expect.anything(), expect.anything(), expect.objectContaining({ action: 'sort' }))
    fireEvent.click(screen.getByRole('button', { name: 'Team 필터' }))
    fireEvent.click(screen.getByLabelText('Design'))
    fireEvent.click(screen.getByRole('button', { name: '확인' }))
    expect(paginationChange).toHaveBeenLastCalledWith(1, 5)
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ current: 1 }), expect.anything(), expect.anything(), expect.objectContaining({ action: 'filter' }))
  })

  it('scrolls virtual off-screen keys with alignment and offset', () => {
    const rows = Array.from({ length: 100 }, (_, index) => ({ key: String(index), name: `Row ${index + 1}`, team: 'Design', score: index }))
    const ref = createRef<TableRef>()
    render(<Table<Row> ref={ref} dataSource={rows} columns={columns} pagination={false} virtual scroll={{ y: 220 }} />)
    const wrapper = document.querySelector('.orbit-table__wrapper') as HTMLDivElement
    const scrollTo = vi.fn()
    wrapper.scrollTo = scrollTo
    ref.current?.scrollTo({ key: '50', align: 'center', offset: 10 })
    expect(scrollTo).toHaveBeenCalledWith({ top: 2677.5 })
  })
})
