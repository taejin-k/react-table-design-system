import { useState, type ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { largeData, columns, members, type Member } from '../../playground/data'
import { Table } from './Table'
import type { TableProps } from './Table.types'

const meta: Meta<TableProps<Member>> = {
  title: 'Design System/Table/Pagination',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  args: { dataSource: largeData.slice(0, 185), columns, rowKey: 'key', bordered: true },
}

export default meta
type Story = StoryObj<TableProps<Member>>

export const Basic: Story = { args: { pagination: { pageSize: 6 } } }

export const SizeChanger: Story = { args: { pagination: { pageSize: 6, showSizeChanger: true, pageSizeOptions: [6, 12, 24] } } }

export const QuickJumperAndTotal: Story = { args: { pagination: { pageSize: 6, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}명` } } }

export const Placement: Story = { args: { pagination: { pageSize: 6, placement: ['topStart', 'bottomEnd'] } } }

export const CenterAligned: Story = { args: { pagination: { pageSize: 6, align: 'center' } } }

export const Simple: Story = { args: { pagination: { pageSize: 6, simple: true } } }

export const PageSizePreservesCurrent: Story = { args: { pagination: { defaultCurrent: 3, defaultPageSize: 6, showSizeChanger: true, pageSizeOptions: [6, 12, 24], showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}` } } }

export const Small: Story = { args: { pagination: { pageSize: 6, size: 'small', showLessItems: true } } }

export const Disabled: Story = { args: { pagination: { pageSize: 6, showSizeChanger: true, showQuickJumper: true, disabled: true } } }

export const HideOnSinglePage: Story = { args: { dataSource: members.slice(0, 4), pagination: { pageSize: 10, hideOnSinglePage: true } } }

export const EmptyHidesPagination: Story = { args: { dataSource: [], pagination: { pageSize: 10 } } }

export const Controlled: Story = { render: (args) => <ControlledPagination {...args} /> }

function ControlledPagination(args: TableProps<Member>) {
  const [current, setCurrent] = useState(2)
  return <Table<Member> {...args} pagination={{ pageSize: 6, current, onChange: setCurrent }} />
}
