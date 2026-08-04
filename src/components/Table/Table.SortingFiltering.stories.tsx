import { useState, type ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { columns, members, type Member } from '../../playground/data'
import { Table } from './Table'
import type { ColumnsType, FilterKey, TableProps } from './Table.types'

const meta: Meta<TableProps<Member>> = {
  title: 'Design System/Table/Sorting & Filtering',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  args: { dataSource: members, columns, rowKey: 'key', pagination: { defaultPageSize: 8 }, bordered: true },
}

export default meta
type Story = StoryObj<TableProps<Member>>

export const LocalSorter: Story = { args: { columns: columns.map((column) => ({ ...column, filters: undefined })) } }
export const MultipleSorter: Story = { args: { columns: columns.map((column) => ({ ...column, filters: undefined })) } }
export const ServerSorter: Story = { args: { columns: columns.map((column) => column.key === 'name' ? { ...column, sorter: true } : { ...column, sorter: undefined, filters: undefined }) } }
export const ServerFilter: Story = { args: { columns: columns.map((column) => column.key === 'status' ? { ...column, onFilter: undefined, sorter: undefined } : { ...column, sorter: undefined, filters: undefined }) }, parameters: { docs: { description: { story: '`filters`만 두고 `onFilter`를 생략하면 UI 상태와 `onChange`만 변경되고 dataSource는 로컬에서 줄어들지 않습니다.' } } } }
export const MenuFilter: Story = { args: { columns: columns.map((column) => ({ ...column, sorter: undefined })) } }

const treeFilterColumns: ColumnsType<Member> = columns.map((column) => column.key === 'team' ? { ...column, filterMode: 'tree', filterSearch: true, filters: [{ text: '제품 조직', value: 'product-group', children: [{ text: 'Design', value: 'Design' }, { text: 'Product', value: 'Product' }] }, { text: '기술 조직', value: 'engineering-group', children: [{ text: 'Platform', value: 'Platform' }, { text: 'Mobile', value: 'Mobile' }] }] } : column)
export const TreeFilterAndSearch: Story = { args: { columns: treeFilterColumns } }

export const ControlledFilter: Story = { render: (args) => <ControlledFilterStory {...args} /> }

function ControlledFilterStory(args: TableProps<Member>) {
  const [teams, setTeams] = useState<FilterKey[]>(['Design'])
  const controlledColumns = columns.map((column) => column.key === 'team' ? { ...column, filteredValue: teams } : column)
  return <><div className="story-toolbar"><button onClick={() => setTeams(teams.length ? [] : ['Design'])}>{teams.length ? '필터 해제' : 'Design 필터'}</button></div><Table<Member> {...args} columns={controlledColumns} onChange={(_pagination, filters) => setTeams(filters.team ?? [])} /></>
}

export const CustomFilterDropdown: Story = { args: { columns: columns.map((column) => column.key === 'name' ? { ...column, filters: undefined, filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => <div className="story-filter-panel"><input aria-label="이름 검색" value={String(selectedKeys[0] ?? '')} onChange={(event) => setSelectedKeys(event.target.value ? [event.target.value] : [])} /><button type="button" onClick={() => confirm()}>검색</button><button type="button" onClick={() => clearFilters?.()}>초기화</button></div>, onFilter: (value, record) => record.name.includes(String(value)) } : column) } }

export const CustomSortCycleAndIcon: Story = { args: { columns: columns.map((column) => column.key === 'projects' ? { ...column, filters: undefined, sortDirections: ['descend', 'ascend', null], sortIcon: ({ sortOrder }) => <span className={`story-custom-sort-icon ${sortOrder ? 'is-active' : ''}`} aria-hidden>{sortOrder === 'descend' ? '↓' : sortOrder === 'ascend' ? '↑' : '↕'}</span> } : { ...column, sorter: undefined, filters: undefined }) } }

export const SingleSelectFilter: Story = { args: { columns: columns.map((column) => column.key === 'status' ? { ...column, filterMultiple: false, sorter: undefined } : { ...column, sorter: undefined, filters: undefined }) } }

export const DefaultFilterAndReset: Story = { args: { columns: columns.map((column) => column.key === 'team' ? { ...column, defaultFilteredValue: ['Design'], filterResetToDefaultFilteredValue: true, sorter: undefined } : { ...column, sorter: undefined, filters: undefined }) } }

export const ConfirmOnlyFilter: Story = { args: { columns: columns.map((column) => column.key === 'status' ? { ...column, filterOnClose: false, sorter: undefined } : { ...column, sorter: undefined, filters: undefined }) } }

export const ControlledFilterPopupAndPortal: Story = { render: (args) => <ControlledFilterPopupStory {...args} /> }

function ControlledFilterPopupStory(args: TableProps<Member>) {
  const [open, setOpen] = useState(false)
  const controlledColumns = columns.map((column) => column.key === 'team' ? { ...column, filterDropdownProps: { open, onOpenChange: setOpen, className: 'story-controlled-filter-popup' } } : { ...column, filters: undefined })
  return <><div className="story-toolbar"><button type="button" onClick={() => setOpen((current) => !current)}>{open ? '필터 닫기' : '필터 열기'}</button></div><Table<Member> {...args} columns={controlledColumns} getPopupContainer={() => document.body} /></>
}
