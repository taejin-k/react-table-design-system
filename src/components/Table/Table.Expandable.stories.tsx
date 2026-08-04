import { useState, type ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { columns, members, type Member } from '../../playground/data'
import { Table } from './Table'
import type { Key, TableProps } from './Table.types'

const treeData: Member[] = [
  { ...members[0], children: [{ ...members[5], key: 'M-1001-1', name: '한지우 (하위)' }, { ...members[7], key: 'M-1001-2', name: '송채원 (하위)' }] },
  ...members.slice(1, 6),
]

const meta: Meta<TableProps<Member>> = {
  title: 'Design System/Table/Expandable',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  args: { dataSource: members.slice(0, 6), columns, rowKey: 'key', pagination: false },
}

export default meta
type Story = StoryObj<TableProps<Member>>

export const ExpandedRow: Story = {
  args: { expandable: { expandedRowRender: (record) => <div className="detail-panel"><strong>{record.name}</strong><span>{record.role} · {record.joinedAt}</span></div> } },
}

export const TreeData: Story = {
  args: { dataSource: treeData, expandable: { defaultExpandAllRows: true, indentSize: 15 }, rowSelection: {} },
}

export const Controlled: Story = { render: (args) => <ControlledExpand {...args} dataSource={treeData} /> }

function ControlledExpand(args: TableProps<Member>) {
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>(['M-1001'])
  return <Table<Member> {...args} expandable={{ expandedRowKeys, onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]) }} />
}

export const ExpandByRowClick: Story = {
  args: { expandable: { expandRowByClick: true, expandedRowRender: (record) => <div className="detail-panel">{record.name} 상세 정보</div> } },
}

export const CustomExpandIcon: Story = {
  args: { expandable: { expandedRowRender: (record) => <div className="detail-panel">{record.name} 상세 정보</div>, expandIcon: ({ expanded, expandable, record, onExpand }) => <button type="button" className={`story-expand-icon ${expanded ? 'is-expanded' : ''}`} disabled={!expandable} aria-expanded={expanded} aria-label={expanded ? '상세 닫기' : '상세 열기'} onClick={(event) => onExpand(record, event)}><svg viewBox="0 0 12 12" aria-hidden><path d="m4.25 2.25 3.5 3.75-3.5 3.75" /></svg></button> } },
}

export const HideExpandColumn: Story = {
  args: { expandable: { showExpandColumn: false, expandRowByClick: true, expandedRowRender: (record) => <div className="detail-panel">{record.name} 상세 정보</div> } },
}
