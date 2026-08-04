import type { ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { columns, largeData, members, type Member } from '../../playground/data'
import { Table } from './Table'
import type { ColumnsType, TableProps } from './Table.types'

const meta: Meta<TableProps<Member>> = {
  title: 'Design System/Table/Layout',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  args: { dataSource: members.slice(0, 8), columns, rowKey: 'key', pagination: false },
}

export default meta
type Story = StoryObj<TableProps<Member>>

export const Bordered: Story = { args: { bordered: true } }
export const Compact: Story = { args: { size: 'small', bordered: true } }
export const FixedHeader: Story = { args: { dataSource: members, scroll: { y: 280 }, sticky: true, bordered: true } }
export const FixedColumns: Story = { args: { scroll: { x: 1000 }, bordered: true } }
export const ResponsiveColumns: Story = { args: { bordered: true }, parameters: { viewport: { defaultViewport: 'mobile1' } } }
export const VirtualThousandRows: Story = { args: { dataSource: largeData, virtual: true, scroll: { x: 900, y: 420 }, sticky: true, size: 'small' } }

const groupedColumns: ColumnsType<Member> = [
  { title: '구성원', children: [{ title: '이름', dataIndex: 'name', key: 'name', width: 160 }, { title: '직무', dataIndex: 'role', key: 'role', width: 190 }] },
  { title: '조직 정보', children: [{ title: '팀', dataIndex: 'team', key: 'team' }, { title: '상태', dataIndex: 'status', key: 'status' }] },
  { title: '프로젝트', dataIndex: 'projects', key: 'projects', align: 'right' },
]

export const GroupedHeaders: Story = { args: { columns: groupedColumns, bordered: true } }
export const MergedRows: Story = { args: { columns: groupedColumns.map((column) => column.key === 'projects' ? { ...column, onCell: (_record, index) => index === 0 ? { rowSpan: 2 } : index === 1 ? { rowSpan: 0 } : {} } : column), bordered: true } }
export const Summary: Story = { args: { bordered: true, summary: (data) => <Table.Summary><Table.Summary.Row><Table.Summary.Cell index={0} colSpan={5}><strong>프로젝트 합계</strong></Table.Summary.Cell><Table.Summary.Cell index={5} className="story-summary-value">{data.reduce((sum, row) => sum + row.projects, 0)}</Table.Summary.Cell></Table.Summary.Row></Table.Summary> } }
export const FixedTopSummary: Story = { args: { dataSource: largeData.slice(0, 30), scroll: { y: 320 }, sticky: true, bordered: true, pagination: false, summary: (data) => <Table.Summary fixed="top"><Table.Summary.Row><Table.Summary.Cell index={0} colSpan={5}><strong>현재 데이터 합계</strong></Table.Summary.Cell><Table.Summary.Cell index={5} className="story-summary-value">{data.reduce((sum, row) => sum + row.projects, 0)}</Table.Summary.Cell></Table.Summary.Row></Table.Summary> } }
export const TitleAndFooter: Story = { args: { title: () => '구성원 현황', footer: (data) => `현재 ${data.length}개 행 표시`, bordered: true } }
