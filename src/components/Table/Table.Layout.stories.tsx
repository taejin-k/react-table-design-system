import { useState, type ComponentType } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { columns, largeData, members, type Member } from './Table.playground-data';
import { Table } from './Table';
import type { ColumnsType, TableProps } from './Table.types';

const meta: Meta<TableProps<Member>> = {
  title: 'Components/Table/Layout',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '고정 열·헤더·요약, 스크롤, 가상화, 그룹 헤더와 병합 셀 등 Table 레이아웃 기능입니다.' } } },
  args: { dataSource: members.slice(0, 8), columns, rowKey: 'key', pagination: false },
};

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const Bordered: Story = { args: { bordered: true } };
export const Compact: Story = { args: { size: 'small', bordered: true } };
export const FixedHeader: Story = { args: { dataSource: members, scroll: { y: 280 }, sticky: true, bordered: true } };
export const FixedColumns: Story = {
  args: { columns: columns.map((column) => (column.key === 'joinedAt' ? { ...column, fixed: 'right', responsive: undefined } : { ...column, responsive: undefined })), scroll: { x: 1600 }, bordered: true },
};
export const ResponsiveColumns: Story = { args: { bordered: true }, parameters: { viewport: { defaultViewport: 'mobile1' } } };
export const VirtualThousandRows: Story = { args: { dataSource: largeData, virtual: true, scroll: { x: 900, y: 420 }, sticky: true, size: 'small' } };

const groupedColumns: ColumnsType<Member> = [
  { title: '구성원', children: [{ title: '이름', dataIndex: 'name', key: 'name', width: 160 }, { title: '직무', dataIndex: 'role', key: 'role', width: 190 }] },
  { title: '조직 정보', children: [{ title: '팀', dataIndex: 'team', key: 'team' }, { title: '상태', dataIndex: 'status', key: 'status' }] },
  { title: '프로젝트', dataIndex: 'projects', key: 'projects', align: 'right' },
];

export const GroupedHeaders: Story = { args: { columns: groupedColumns, bordered: true } };
export const MergedRows: Story = {
  args: {
    columns: groupedColumns.map((column) => (column.key === 'projects' ? { ...column, onCell: (_record: Member, index?: number) => (index === 0 ? { rowSpan: 2 } : index === 1 ? { rowSpan: 0 } : {}) } : column)),
    bordered: true,
  },
};
export const Summary: Story = {
  args: {
    bordered: true,
    summary: (data) => (
      <Table.Summary>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={5}>
            <strong>프로젝트 합계</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} className="text-right [font-variant-numeric:tabular-nums]">
            {data.reduce((sum, row) => sum + row.projects, 0)}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    ),
  },
};
export const FixedTopSummary: Story = {
  args: {
    columns: columns.map((column) => ({ ...column, responsive: undefined })),
    dataSource: largeData.slice(0, 30),
    scroll: { x: 1000, y: 342 },
    sticky: true,
    bordered: true,
    pagination: false,
    summary: (data) => (
      <Table.Summary fixed="top">
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={5}>
            <strong>현재 데이터 합계</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} className="text-right [font-variant-numeric:tabular-nums]">
            {data.reduce((sum, row) => sum + row.projects, 0)}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    ),
  },
};
export const TitleAndFooter: Story = { args: { title: () => '구성원 현황', footer: (data) => `현재 ${data.length}개 행 표시`, bordered: true } };
export const Headerless: Story = { args: { showHeader: false, bordered: true, title: () => '헤더 없이 데이터만 표시' } };
export const FixedBottomSummary: Story = {
  args: {
    columns: columns.map((column) => ({ ...column, responsive: undefined })),
    dataSource: largeData.slice(0, 30),
    scroll: { x: 1000, y: 300 },
    sticky: true,
    bordered: true,
    summary: (data) => (
      <Table.Summary fixed="bottom">
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={5}>
            <strong>현재 데이터 합계</strong>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={5} className="text-right [font-variant-numeric:tabular-nums]">
            {data.reduce((sum, row) => sum + row.projects, 0)}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    ),
  },
};
export const ScrollEventsAndStickyOffsets: Story = { render: (args) => <ScrollEventsStory {...args} /> };

function ScrollEventsStory(args: TableProps<Member>) {
  const [position, setPosition] = useState({ left: 0, top: 0 });
  return (
    <>
      <p className="mb-4 text-[#999]">
        현재 스크롤: left {position.left}px / top {position.top}px
      </p>
      <Table<Member>
        {...args}
        dataSource={largeData.slice(0, 60)}
        columns={columns.map((column) => ({ ...column, responsive: undefined }))}
        pagination={false}
        sticky={{ offsetHeader: 8 }}
        scroll={{ x: 1200, y: 280 }}
        onScroll={(event) => setPosition({ left: Math.round(event.currentTarget.scrollLeft), top: Math.round(event.currentTarget.scrollTop) })}
      />
    </>
  );
}
