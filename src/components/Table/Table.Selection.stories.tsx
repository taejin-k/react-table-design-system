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
export const FixedSelectionColumn: Story = { args: { rowSelection: { fixed: true }, scroll: { x: 1600 } } }
export const CustomSelectionCell: Story = { args: { rowSelection: { renderCell: (checked, record, _index, node) => <span title={`${record.name}: ${checked ? '선택됨' : '선택 안 됨'}`}>{node}</span> } } }
export const SelectionMenu: Story = { args: { rowSelection: { selections: true } } }
export const SelectionConstants: Story = { args: { rowSelection: { selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE] } } }
export const ShiftRangeSelection: Story = { args: { rowSelection: {} }, parameters: { docs: { description: { story: '첫 체크박스를 선택한 뒤 Shift를 누른 채 다른 행을 선택하면 범위가 선택됩니다.' } } } }
export const ControlledSelection: Story = { render: (args) => <ControlledSelectionStory {...args} /> }

function ControlledSelectionStory(args: TableProps<Member>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  return <><div className="story-toolbar"><button disabled={!selectedRowKeys.length} onClick={() => setSelectedRowKeys([])}>선택 해제 ({selectedRowKeys.length})</button></div><Table<Member> {...args} rowSelection={{ selectedRowKeys, selections: true, onChange: setSelectedRowKeys }} /></>
}

export const SelectionColumnConfiguration: Story = { args: { rowSelection: { align: 'right', columnWidth: 72, columnTitle: (checkbox) => <span className="story-selection-title">선택 {checkbox}</span>, getTitleCheckboxProps: () => ({ title: '현재 페이지 전체 선택' }), onCell: (record) => ({ title: `${record.name} 선택 셀` }) } } }

export const CustomSelectionAction: Story = { render: (args) => <CustomSelectionActionStory {...args} /> }

function CustomSelectionActionStory(args: TableProps<Member>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const activeKeys = members.filter((member) => member.status === '활성').map((member) => member.key)
  return <><p className="story-hint">선택 메뉴의 “활성 구성원 선택”으로 사용자 정의 일괄 작업을 실행합니다.</p><Table<Member> {...args} rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys, selections: [{ key: 'active', text: '활성 구성원 선택', onSelect: (changeableKeys) => setSelectedRowKeys(changeableKeys.filter((key) => activeKeys.includes(String(key)))) }] }} /></>
}

const associatedTreeData: Member[] = [{ ...members[0], children: [{ ...members[5], key: 'M-1001-1', name: '한지우 (하위)' }, { ...members[7], key: 'M-1001-2', name: '송채원 (하위)' }] }, ...members.slice(1, 4)]
export const AssociatedTreeSelection: Story = { args: { dataSource: associatedTreeData, expandable: { defaultExpandAllRows: true }, rowSelection: { checkStrictly: false } } }

export const PreserveSelectionAcrossDataChanges: Story = { render: (args) => <PreserveSelectionStory {...args} /> }

function PreserveSelectionStory(args: TableProps<Member>) {
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Key[]>([])
  const pageData = members.slice(page * 4, page * 4 + 4)
  return <><div className="story-toolbar"><button type="button" onClick={() => setPage((current) => current ? 0 : 1)}>데이터 교체 (현재 {page + 1})</button><span>보존된 선택 {selected.length}개</span></div><Table<Member> {...args} dataSource={pageData} rowSelection={{ preserveSelectedRowKeys: true, onChange: (keys) => setSelected(keys) }} /></>
}

export const HiddenSelectAllAndDefaults: Story = { args: { rowSelection: { hideSelectAll: true, defaultSelectedRowKeys: ['M-1001', 'M-1002'] } } }

export const SelectionCallbacks: Story = { render: (args) => <SelectionCallbacksStory {...args} /> }

function SelectionCallbacksStory(args: TableProps<Member>) {
  const [message, setMessage] = useState('행을 선택해 콜백을 확인하세요.')
  return <><p className="story-hint">{message}</p><Table<Member> {...args} rowSelection={{ onChange: (keys, _rows, info) => setMessage(`onChange: ${info.type} / ${keys.length}개`), onSelect: (record, selected) => setMessage(`onSelect: ${record.name} ${selected ? '선택' : '해제'}`) }} /></>
}
