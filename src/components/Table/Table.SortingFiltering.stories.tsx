import { useState, type ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { columns, members, type Member } from './Table.playground-data';
import { Table } from './Table';
import type { ColumnsType, FilterKey, TableProps } from './Table.types';

const meta: Meta<TableProps<Member>> = {
  title: 'Components/Table/Sorting & Filtering',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '로컬·서버 정렬, 다중 우선순위, 기본·사용자 정의 필터를 포함한 Table 열 조작 API 예제입니다.' } } },
  args: { dataSource: members, columns, rowKey: 'key', pagination: { defaultPageSize: 8 }, bordered: true },
};

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const LocalSorter: Story = { args: { columns: columns.map((column) => ({ ...column, filters: undefined })) } };
export const MultipleSorter: Story = { args: { columns: columns.map((column) => ({ ...column, filters: undefined })) } };
export const ServerSorter: Story = { args: { columns: columns.map((column) => (column.key === 'name' ? { ...column, sorter: true } : { ...column, sorter: undefined, filters: undefined })) } };
export const ServerFilter: Story = {
  args: { columns: columns.map((column) => (column.key === 'status' ? { ...column, onFilter: undefined, sorter: undefined } : { ...column, sorter: undefined, filters: undefined })) },
  parameters: { docs: { description: { story: '`filters`만 두고 `onFilter`를 생략하면 UI 상태와 `onChange`만 변경되고 dataSource는 로컬에서 줄어들지 않습니다.' } } },
};
export const MenuFilter: Story = { args: { columns: columns.map((column) => ({ ...column, sorter: undefined })) } };

const treeFilterColumns: ColumnsType<Member> = columns.map((column) =>
  column.key === 'team'
    ? {
        ...column,
        filterMode: 'tree',
        filterSearch: true,
        filters: [
          { text: '제품 조직', value: 'product-group', children: [{ text: 'Design', value: 'Design' }, { text: 'Product', value: 'Product' }] },
          { text: '기술 조직', value: 'engineering-group', children: [{ text: 'Platform', value: 'Platform' }, { text: 'Mobile', value: 'Mobile' }] },
        ],
      }
    : column,
);
export const TreeFilterAndSearch: Story = { args: { columns: treeFilterColumns } };

export const ControlledFilter: Story = { render: (args) => <ControlledFilterStory {...args} /> };

function ControlledFilterStory(args: TableProps<Member>) {
  const [teams, setTeams] = useState<FilterKey[]>(['Design']);
  const controlledColumns = columns.map((column) => (column.key === 'team' ? { ...column, filteredValue: teams } : column));
  return (
    <>
      <div className="mb-4 flex gap-2">
        <button type="button" className="h-8 rounded border border-[#ddd] px-3 text-[#111] hover:bg-[#f5f5f5]" onClick={() => setTeams(teams.length ? [] : ['Design'])}>
          {teams.length ? '필터 해제' : 'Design 필터'}
        </button>
      </div>
      <Table<Member> {...args} columns={controlledColumns} onChange={(_pagination, filters) => setTeams(filters.team ?? [])} />
    </>
  );
}

export const CustomFilterDropdown: Story = {
  args: {
    columns: columns.map((column) =>
      column.key === 'name'
        ? {
            ...column,
            filters: undefined,
            filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => (
              <div className="flex gap-2 p-2">
                <input
                  className="h-8 min-w-[180px] rounded border border-[#ddd] px-[11px] text-[#111] outline-none focus:border-[#0062df]"
                  aria-label="이름 검색"
                  value={String(selectedKeys[0] ?? '')}
                  onChange={(event) => setSelectedKeys(event.target.value ? [event.target.value] : [])}
                />
                <button type="button" className="h-8 rounded bg-[#0062df] px-3 text-white hover:opacity-90" onClick={() => confirm()}>
                  검색
                </button>
                <button type="button" className="h-8 rounded border border-[#ddd] px-3 text-[#111] hover:bg-[#f5f5f5]" onClick={() => clearFilters?.()}>
                  초기화
                </button>
              </div>
            ),
            onFilter: (value, record) => record.name.includes(String(value)),
          }
        : column,
    ),
  },
};

export const CustomSortCycleAndIcon: Story = {
  args: {
    columns: columns.map((column) =>
      column.key === 'projects'
        ? {
            ...column,
            filters: undefined,
            sortDirections: ['descend', 'ascend', null],
            sortIcon: ({ sortOrder }) => (
              <span className={`inline-grid w-3.5 place-items-center text-[13px] ${sortOrder ? 'text-[#0062df]' : 'text-[#ccc]'}`} aria-hidden>
                {sortOrder === 'descend' ? '↓' : sortOrder === 'ascend' ? '↑' : '↕'}
              </span>
            ),
          }
        : { ...column, sorter: undefined, filters: undefined },
    ),
  },
};

export const SingleSelectFilter: Story = {
  args: { columns: columns.map((column) => (column.key === 'status' ? { ...column, filterMultiple: false, sorter: undefined } : { ...column, sorter: undefined, filters: undefined })) },
};

export const DefaultFilterAndReset: Story = {
  args: {
    columns: columns.map((column) =>
      column.key === 'team' ? { ...column, defaultFilteredValue: ['Design'], filterResetToDefaultFilteredValue: true, sorter: undefined } : { ...column, sorter: undefined, filters: undefined },
    ),
  },
};

export const ConfirmOnlyFilter: Story = {
  args: { columns: columns.map((column) => (column.key === 'status' ? { ...column, filterOnClose: false, sorter: undefined } : { ...column, sorter: undefined, filters: undefined })) },
};

export const ControlledFilterPopupAndPortal: Story = { render: (args) => <ControlledFilterPopupStory {...args} /> };

function ControlledFilterPopupStory(args: TableProps<Member>) {
  const [open, setOpen] = useState(false);
  const controlledColumns = columns.map((column) => (column.key === 'team' ? { ...column, filterDropdownProps: { open, onOpenChange: setOpen } } : { ...column, filters: undefined }));
  return (
    <>
      <div className="mb-4 flex gap-2">
        <button type="button" className="h-8 rounded border border-[#ddd] px-3 text-[#111] hover:bg-[#f5f5f5]" onClick={() => setOpen((current) => !current)}>
          {open ? '필터 닫기' : '필터 열기'}
        </button>
      </div>
      <Table<Member> {...args} columns={controlledColumns} getPopupContainer={() => document.body} />
    </>
  );
}
