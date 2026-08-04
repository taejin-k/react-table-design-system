import { useState, type ComponentType, type HTMLAttributes } from 'react'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { columns, largeData, members, type Member } from '../../playground/data'
import { Table } from './Table'
import type { ColumnsType, Key, TableProps } from './Table.types'

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
  return <div><div className="story-toolbar"><button disabled={!selectedRowKeys.length} onClick={() => setSelectedRowKeys([])}>선택 해제 ({selectedRowKeys.length})</button></div><Table<Member> {...args} rowSelection={{ selectedRowKeys, selections: true, onChange: setSelectedRowKeys }} /></div>
}

export const FilterAndMultipleSorter: Story = { args: { bordered: true, pagination: { pageSize: 8, showSizeChanger: true, pageSizeOptions: [4, 8, 12] } } }

export const ProductionPagination: Story = { args: { dataSource: largeData.slice(0, 185), pagination: { pageSize: 6, pageSizeOptions: [6, 12, 24], showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}명` }, bordered: true } }

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
export const DragColumnSorting: Story = { render: () => <DragColumnStory /> }

function DragStory() {
  const [rows, setRows] = useState(members.slice(0, 6))
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    setRows((current) => arrayMove(current, current.findIndex((row) => row.key === active.id), current.findIndex((row) => row.key === over.id)))
  }
  const dragColumns: ColumnsType<Member> = [{ key: 'drag', title: <span className="story-sr-only">행 이동</span>, width: 48, render: () => <span className="story-drag-handle" aria-hidden>⠿</span> }, ...columns]
  return <><p className="story-hint">행을 잡아 원하는 위치로 드래그하세요. 주변 행이 이동 경로에 맞춰 부드럽게 재배치됩니다.</p><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={rows.map((row) => row.key)} strategy={verticalListSortingStrategy}><Table<Member> dataSource={rows} columns={dragColumns} pagination={false} components={{ body: { row: SortableRow } }} /></SortableContext></DndContext></>
}

type SortableRowProps = HTMLAttributes<HTMLTableRowElement> & { 'data-row-key'?: Key; record?: Member; index?: number }

function SortableRow({ record: _record, index: _index, style, className = '', ...props }: SortableRowProps) {
  const id = String(props['data-row-key'])
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return <tr ref={setNodeRef} {...props} {...attributes} {...listeners} role="row" className={`${className} story-sortable-row ${isDragging ? 'is-dragging' : ''}`} style={{ ...style, transform: CSS.Transform.toString(transform), transition: transition ?? 'transform 220ms cubic-bezier(.2,.8,.2,1)', zIndex: isDragging ? 10 : undefined, position: 'relative' }} />
}

function DragColumnStory() {
  const [dragColumns, setDragColumns] = useState<ColumnsType<Member>>(() => columns.map((column) => ({ ...column, sorter: undefined, filters: undefined })))
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const keys = dragColumns.map((column, index) => String(column.key ?? column.dataIndex ?? index))
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    setDragColumns((current) => {
      const currentKeys = current.map((column, index) => String(column.key ?? column.dataIndex ?? index))
      return arrayMove([...current], currentKeys.indexOf(String(active.id)), currentKeys.indexOf(String(over.id)))
    })
  }
  return <><p className="story-hint">열 헤더를 잡아 좌우로 이동하세요. 다른 열이 자연스럽게 자리를 비웁니다.</p><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={keys} strategy={horizontalListSortingStrategy}><Table<Member> dataSource={members.slice(0, 6)} columns={dragColumns} pagination={false} components={{ header: { cell: SortableHeaderCell } }} /></SortableContext></DndContext></>
}

type SortableHeaderCellProps = HTMLAttributes<HTMLTableCellElement> & { column?: ColumnsType<Member>[number]; index?: number }

function SortableHeaderCell({ column, index = 0, style, className = '', ...props }: SortableHeaderCellProps) {
  const id = String(column?.key ?? column?.dataIndex ?? index)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const horizontalTransform = transform ? { ...transform, y: 0 } : null
  return <th ref={setNodeRef} {...props} {...attributes} {...listeners} role="columnheader" className={`${className} story-sortable-header ${isDragging ? 'is-dragging' : ''}`} style={{ ...style, transform: CSS.Transform.toString(horizontalTransform), transition: transition ?? 'transform 220ms cubic-bezier(.2,.8,.2,1)', zIndex: isDragging ? 10 : undefined }} />
}
