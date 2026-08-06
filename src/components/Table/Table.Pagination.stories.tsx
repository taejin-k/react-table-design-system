import { useState, type ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { largeData, columns, members, type Member } from './Table.playground-data';
import { Table } from './Table';
import type { TableProps } from './Table.types';

const meta: Meta<TableProps<Member>> = {
  title: 'Components/Table/Pagination',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  args: { dataSource: largeData.slice(0, 185), columns, rowKey: 'key', bordered: true },
};

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const Basic: Story = { args: { pagination: { defaultPageSize: 6 } } };

export const SizeChanger: Story = { args: { pagination: { defaultPageSize: 6, showSizeChanger: true, pageSizeOptions: [6, 12, 24] } } };

export const QuickJumperAndTotal: Story = { args: { pagination: { defaultPageSize: 6, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}명` } } };

export const Placement: Story = { args: { pagination: { defaultPageSize: 6, placement: ['topStart', 'bottomEnd'] } } };

export const CenterAligned: Story = { args: { pagination: { defaultPageSize: 6, align: 'center' } } };

export const Simple: Story = { args: { pagination: { defaultPageSize: 6, simple: true } } };

export const PageSizePreservesCurrent: Story = {
  args: { pagination: { defaultCurrent: 3, defaultPageSize: 6, showSizeChanger: true, pageSizeOptions: [6, 12, 24], showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}` } },
};

export const Small: Story = { args: { pagination: { defaultPageSize: 6, size: 'small', showLessItems: true } } };

export const Disabled: Story = { args: { pagination: { pageSize: 6, showSizeChanger: true, showQuickJumper: true, disabled: true } } };

export const HideOnSinglePage: Story = { args: { dataSource: members.slice(0, 4), pagination: { pageSize: 10, hideOnSinglePage: true } } };

export const EmptyHidesPagination: Story = { args: { dataSource: [], pagination: { pageSize: 10 } } };

export const Controlled: Story = { render: (args) => <ControlledPagination {...args} /> };

function ControlledPagination(args: TableProps<Member>) {
  const [pagination, setPagination] = useState({ current: 2, pageSize: 6 });
  return <Table<Member> {...args} pagination={{ ...pagination, onChange: (current, pageSize) => setPagination({ current, pageSize }) }} />;
}

export const CustomItemRender: Story = {
  args: {
    pagination: {
      defaultCurrent: 8,
      defaultPageSize: 6,
      itemRender: (page, type, element) => (type === 'page' ? <span title={`${page}번 페이지`}>{element}</span> : element),
    },
  },
};

export const GoButtonAndLocale: Story = {
  args: {
    pagination: {
      defaultPageSize: 6,
      showQuickJumper: { goButton: '이동' },
      showSizeChanger: true,
      pageSizeOptions: [6, 12, 24],
      locale: { jump_to: '페이지 이동', page: '쪽', page_size: '페이지당 행 수', items_per_page: '개씩', prev_page: '이전 쪽', next_page: '다음 쪽' },
    },
  },
};

export const SemanticAndResponsive: Story = {
  args: {
    pagination: {
      defaultPageSize: 6,
      responsive: true,
      showTitle: false,
      classNames: { root: 'rounded-md bg-[#f7fbff] px-2', item: 'font-medium' },
      styles: { root: { borderTop: '1px dashed #91caff' }, item: { fontVariantNumeric: 'tabular-nums' } },
    },
  },
};

export const HiddenJumpControls: Story = { args: { pagination: { defaultCurrent: 12, defaultPageSize: 6, showLessItems: true, showPrevNextJumpers: false } } };

export const ReadOnlySimple: Story = { args: { pagination: { defaultCurrent: 4, defaultPageSize: 6, simple: { readOnly: true } } } };

export const CallbackContract: Story = { render: (args) => <PaginationCallbackStory {...args} /> };

function PaginationCallbackStory(args: TableProps<Member>) {
  const [events, setEvents] = useState({ change: '아직 없음', size: '아직 없음' });
  return (
    <>
      <p className="mb-4 text-[#999]">
        onChange: {events.change} · onShowSizeChange: {events.size}
      </p>
      <Table<Member>
        {...args}
        pagination={{
          defaultPageSize: 6,
          showSizeChanger: true,
          pageSizeOptions: [6, 12, 24],
          onChange: (page, pageSize) => setEvents((current) => ({ ...current, change: `${page}페이지 / ${pageSize}개` })),
          onShowSizeChange: (page, pageSize) => setEvents((current) => ({ ...current, size: `${page}페이지 / ${pageSize}개` })),
        }}
      />
    </>
  );
}
