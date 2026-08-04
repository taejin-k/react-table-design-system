import type { ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { columns, members, type Member } from '../../playground/data'
import { Table } from './Table'
import type { TableProps } from './Table.types'

const meta: Meta<TableProps<Member>> = {
  title: 'Design System/Table/API Compatibility',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  args: { dataSource: members.slice(0, 6), rowKey: 'key', pagination: false },
}

export default meta
type Story = StoryObj<TableProps<Member>>

export const ColumnsProp: Story = { args: { columns } }

export const ColumnJSX: Story = { render: (args) => <Table<Member> {...args}>
  <Table.ColumnGroup<Member> title="구성원">
    <Table.Column<Member> title="이름" dataIndex="name" key="name" />
    <Table.Column<Member> title="직무" dataIndex="role" key="role" />
  </Table.ColumnGroup>
  <Table.Column<Member> title="팀" dataIndex="team" key="team" />
  <Table.Column<Member> title="프로젝트" dataIndex="projects" key="projects" align="right" />
</Table> }

export const SemanticClassNamesAndStyles: Story = { args: { columns, classNames: { header: { cell: 'story-semantic-header' }, body: { row: 'story-semantic-row' } }, styles: { cell: { fontVariantNumeric: 'tabular-nums' } } } }
export const NativeRootProps: Story = { args: { columns, 'aria-label': '구성원 테이블', role: 'region', style: { marginBlock: 12 } } }
export const LoadingBoolean: Story = { args: { columns, loading: true } }
export const LoadingConfig: Story = { args: { columns, loading: { spinning: true, tip: '구성원을 불러오는 중', delay: 0 } } }
export const Empty: Story = { args: { columns, dataSource: [], locale: { emptyText: <div>아직 구성원이 없습니다.</div> } } }
