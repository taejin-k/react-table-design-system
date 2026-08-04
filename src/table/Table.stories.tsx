import { useRef, useState, type ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { columns, largeData, members, type Member } from '../demoData'
import { Table } from './Table'
import type { ColumnsType, Key, TableProps } from './types'

const meta: Meta<TableProps<Member>> = {
  title: 'Design System/Table',
  component: Table as ComponentType<TableProps<Member>>,
  parameters: { docs: { description: { component: 'Ant Design Table과 동일한 핵심 사용 패턴을 제공하는 독립 React 테이블입니다. `dataSource`, `columns`, `rowKey`, `pagination`, `rowSelection`, `expandable`, `scroll`, `onChange`를 사용합니다.' } } },
  tags: ['autodocs'],
  argTypes: { size: { control: 'inline-radio', options: ['large', 'medium', 'small'] }, bordered: { control: 'boolean' }, loading: { control: 'boolean' }, sticky: { control: 'boolean' }, virtual: { control: 'boolean' } },
  args: { dataSource: members, columns, rowKey: 'key', size: 'large', bordered: false, loading: false, pagination: { pageSize: 6 } },
}

export default meta
type Story = StoryObj<TableProps<Member>>

export const Basic: Story = {}

export const SelectionAndOperations: Story = {
  render: (args) => <SelectionStory {...args} />,
}

function SelectionStory(args: TableProps<Member>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  return <div><div className="story-toolbar"><button disabled={!selectedRowKeys.length} onClick={() => setSelectedRowKeys([])}>선택 해제 ({selectedRowKeys.length})</button></div><Table<Member> {...args} rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }} /></div>
}

export const FilterAndMultipleSorter: Story = { args: { bordered: true, pagination: { pageSize: 8, showSizeChanger: true, pageSizeOptions: [4, 8, 12] } } }

export const ExpandableAndTree: Story = {
  args: { dataSource: [{ ...members[0], children: [{ ...members[5], key: 'M-1001-1', name: '한지우 (하위)' }] }, ...members.slice(1, 6)], expandable: { defaultExpandAllRows: true, expandedRowRender: (record) => <div className="detail-panel"><strong>{record.name}</strong><span>{record.role} · {record.joinedAt}</span></div> }, rowSelection: {}, pagination: false },
}

export const GroupedHeaderAndMergedCells: Story = {
  args: { columns: [{ title: '구성원', children: [{ title: '이름', dataIndex: 'name', key: 'name', width: 160 }, { title: '직무', dataIndex: 'role', key: 'role', width: 190 }] }, { title: '조직 정보', children: [{ title: '팀', dataIndex: 'team', key: 'team' }, { title: '상태', dataIndex: 'status', key: 'status' }] }, { title: '프로젝트', dataIndex: 'projects', key: 'projects', align: 'right', onCell: (_record: Member, index: number) => index === 0 ? { rowSpan: 2 } : index === 1 ? { rowSpan: 0 } : {} }] as ColumnsType<Member>, pagination: false, bordered: true },
}

export const FixedAndResponsive: Story = { args: { scroll: { x: 1000, y: 320 }, sticky: true, pagination: false, bordered: true } }
export const VirtualThousandRows: Story = { args: { dataSource: largeData, virtual: true, scroll: { x: 900, y: 420 }, pagination: false, sticky: true, size: 'small' } }
export const TitleFooterSummaryAndEmpty: Story = { args: { title: () => '구성원 현황', footer: (data) => `현재 ${data.length}개 행 표시`, summary: (data) => <div className="summary"><strong>프로젝트 합계</strong><span>{data.reduce((sum, row) => sum + row.projects, 0)}</span></div>, pagination: { pageSize: 6 }, bordered: true } }
export const LoadingAndEmpty: Story = { render: () => <div className="story-stack"><Table<Member> dataSource={members.slice(0, 3)} columns={columns} loading pagination={false} /><Table<Member> dataSource={[]} columns={columns} locale={{ emptyText: <div>📭<br />아직 구성원이 없습니다.</div> }} pagination={false} /></div> }

export const EditableCells: Story = { render: () => <EditableStory /> }

function EditableStory() {
  const [rows, setRows] = useState(members.slice(0, 6))
  const editableColumns: ColumnsType<Member> = columns.map((column) => column.key === 'role' ? { ...column, render: (value, record) => <input className="story-input" aria-label={`${record.name} 직무 편집`} value={String(value)} onChange={(event) => setRows((current) => current.map((row) => row.key === record.key ? { ...row, role: event.target.value } : row))} /> } : column)
  return <Table<Member> dataSource={rows} columns={editableColumns} pagination={false} bordered />
}

export const DragRowSorting: Story = { render: () => <DragStory /> }

function DragStory() {
  const [rows, setRows] = useState(members.slice(0, 6))
  const draggingKey = useRef<Key | null>(null)
  return <><p className="story-hint">행을 잡아 원하는 위치로 드래그하세요.</p><Table<Member> dataSource={rows} columns={columns} pagination={false} onRow={(record) => ({ draggable: true, onDragStart: () => { draggingKey.current = record.key }, onDragOver: (event) => event.preventDefault(), onDrop: () => { const source = rows.findIndex((row) => row.key === draggingKey.current); const target = rows.findIndex((row) => row.key === record.key); if (source < 0 || source === target) return; setRows((current) => { const next = [...current]; const [moved] = next.splice(source, 1); next.splice(target, 0, moved); return next }) } })} /></>
}
