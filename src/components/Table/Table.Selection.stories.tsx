import { useState, type ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { columns, members, type Member } from '../../playground/data'
import { Table } from './Table'
import type { Key, TableProps } from './Table.types'

const meta: Meta<TableProps<Member>> = {
  title: 'Design System/Table/Selection',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  args: { dataSource: members.slice(0, 8), columns, rowKey: 'key', pagination: false },
}

export default meta
type Story = StoryObj<TableProps<Member>>

export const Checkbox: Story = { args: { rowSelection: {} } }
export const Radio: Story = { args: { rowSelection: { type: 'radio' } } }
export const DisabledRows: Story = { args: { rowSelection: { getCheckboxProps: (record) => ({ disabled: record.status === '대기', title: record.status === '대기' ? '대기 구성원은 선택할 수 없습니다.' : undefined }) } } }
export const FixedSelectionColumn: Story = { args: { rowSelection: { fixed: true }, scroll: { x: 1000 } } }
export const CustomSelectionCell: Story = { args: { rowSelection: { renderCell: (checked, record, _index, node) => <span title={`${record.name}: ${checked ? '선택됨' : '선택 안 됨'}`}>{node}</span> } } }
export const SelectionMenu: Story = { args: { rowSelection: { selections: true } } }
export const SelectionConstants: Story = { args: { rowSelection: { selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE] } } }
export const ShiftRangeSelection: Story = { args: { rowSelection: {} }, parameters: { docs: { description: { story: '첫 체크박스를 선택한 뒤 Shift를 누른 채 다른 행을 선택하면 범위가 선택됩니다.' } } } }
export const ControlledSelection: Story = { render: (args) => <ControlledSelectionStory {...args} /> }

function ControlledSelectionStory(args: TableProps<Member>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  return <><div className="story-toolbar"><button disabled={!selectedRowKeys.length} onClick={() => setSelectedRowKeys([])}>선택 해제 ({selectedRowKeys.length})</button></div><Table<Member> {...args} rowSelection={{ selectedRowKeys, selections: true, onChange: setSelectedRowKeys }} /></>
}
