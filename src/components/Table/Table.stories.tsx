import { useState, type ComponentType, type HTMLAttributes } from 'react';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Meta, StoryObj } from '@storybook/react';
import { columns, largeData, members, type Member } from './Table.playground-data';
import { Table } from './Table';
import type { ColumnsType, Key, TableProps } from './Table.types';

const meta: Meta<TableProps<Member>> = {
  title: 'Components/Table',
  component: Table as ComponentType<TableProps<Member>>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Ant Design Table과 동일한 핵심 사용 패턴을 제공하는 독립 React 테이블입니다. `dataSource`, `columns`, `rowKey`, `pagination`, `rowSelection`, `expandable`, `scroll`, `onChange`를 사용합니다.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['large', 'medium', 'small'] },
    bordered: { control: 'boolean' },
    loading: { control: 'boolean' },
    sticky: { control: 'boolean' },
    virtual: { control: 'boolean' },
  },
  args: { dataSource: members, columns, rowKey: 'key', size: 'large', bordered: false, loading: false, pagination: { defaultPageSize: 6 } },
};

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const FeatureGuide: Story = {
  render: () => (
    <section className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border border-[#f0f0f0] bg-white p-4">
        <h2 className="mb-1.5 text-[16px] font-semibold">데이터와 열</h2>
        <p className="text-[#999] leading-relaxed">columns/JSX Column, 공통 column 설정, 렌더링, 병합, 숨김, 반응형, 정렬과 필터</p>
      </div>
      <div className="rounded-lg border border-[#f0f0f0] bg-white p-4">
        <h2 className="mb-1.5 text-[16px] font-semibold">사용자 조작</h2>
        <p className="text-[#999] leading-relaxed">페이지네이션, 체크박스·라디오 선택, 선택 작업, 확장 행, 행·열 드래그</p>
      </div>
      <div className="rounded-lg border border-[#f0f0f0] bg-white p-4">
        <h2 className="mb-1.5 text-[16px] font-semibold">레이아웃</h2>
        <p className="text-[#999] leading-relaxed">fixed/sticky, 가상 스크롤, summary, title/footer, 크기와 테두리</p>
      </div>
      <div className="rounded-lg border border-[#f0f0f0] bg-white p-4">
        <h2 className="mb-1.5 text-[16px] font-semibold">확장 API</h2>
        <p className="text-[#999] leading-relaxed">semantic class/style, components 교체, DOM 훅, locale, ref scrollTo</p>
      </div>
    </section>
  ),
};

export const Basic: Story = {};

export const SelectionAndOperations: Story = {
  render: (args) => <SelectionStory {...args} />,
};

function SelectionStory(args: TableProps<Member>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className="h-8 rounded border border-[#0062df] bg-[#0062df] px-3.5 text-white transition-colors hover:opacity-90 disabled:border-[#ddd] disabled:bg-black/5 disabled:text-[#999]"
          disabled={!selectedRowKeys.length}
          onClick={() => setSelectedRowKeys([])}
        >
          선택 해제 ({selectedRowKeys.length})
        </button>
      </div>
      <Table<Member> {...args} rowSelection={{ selectedRowKeys, selections: true, onChange: setSelectedRowKeys }} />
    </div>
  );
}

export const FilterAndMultipleSorter: Story = { args: { bordered: true, pagination: { defaultPageSize: 8, showSizeChanger: true, pageSizeOptions: [4, 8, 12] } } };

export const ProductionPagination: Story = {
  args: {
    dataSource: largeData.slice(0, 185),
    pagination: {
      defaultPageSize: 6,
      pageSizeOptions: [6, 12, 24],
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}명`,
    },
    bordered: true,
  },
};

export const ExpandableAndTree: Story = {
  args: {
    dataSource: [{ ...members[0], children: [{ ...members[5], key: 'M-1001-1', name: '한지우 (하위)' }] }, ...members.slice(1, 6)],
    expandable: { defaultExpandAllRows: true },
    rowSelection: {},
    pagination: false,
  },
};

export const GroupedHeaderAndMergedCells: Story = {
  args: {
    columns: [
      { title: '구성원', children: [{ title: '이름', dataIndex: 'name', key: 'name', width: 160 }, { title: '직무', dataIndex: 'role', key: 'role', width: 190 }] },
      { title: '조직 정보', children: [{ title: '팀', dataIndex: 'team', key: 'team' }, { title: '상태', dataIndex: 'status', key: 'status' }] },
      {
        title: '프로젝트',
        dataIndex: 'projects',
        key: 'projects',
        align: 'right',
        onCell: (_record: Member, index: number) => (index === 0 ? { rowSpan: 2 } : index === 1 ? { rowSpan: 0 } : {}),
      },
    ] as ColumnsType<Member>,
    pagination: false,
    bordered: true,
  },
};

export const FixedAndResponsive: Story = {
  args: {
    columns: columns.map((column) => (column.key === 'joinedAt' ? { ...column, fixed: 'right', responsive: undefined } : { ...column, responsive: undefined })),
    scroll: { x: 1600, y: 342 },
    sticky: true,
    pagination: false,
    bordered: true,
  },
};

export const VirtualThousandRows: Story = { args: { dataSource: largeData, virtual: true, scroll: { x: 900, y: 420 }, pagination: false, sticky: true, size: 'small' } };

export const TitleFooterSummaryAndEmpty: Story = {
  args: {
    title: () => '구성원 현황',
    footer: (data) => `현재 ${data.length}개 행 표시`,
    summary: (data) => (
      <div className="flex justify-end gap-10">
        <strong>프로젝트 합계</strong>
        <span>{data.reduce((sum, row) => sum + row.projects, 0)}</span>
      </div>
    ),
    pagination: { defaultPageSize: 6 },
    bordered: true,
  },
};

export const LoadingAndEmpty: Story = {
  render: () => (
    <div className="grid min-w-0 gap-8 [&>*]:min-w-0">
      <Table<Member> dataSource={members.slice(0, 3)} columns={columns} rowKey="key" loading scroll={{ x: 900 }} pagination={false} />
      <Table<Member> dataSource={[]} columns={columns} rowKey="key" scroll={{ x: 900 }} locale={{ emptyText: <div>📭 아직 구성원이 없습니다.</div> }} pagination={false} />
    </div>
  ),
};

export const EditableCells: Story = { render: () => <EditableStory /> };

function EditableStory() {
  const [rows, setRows] = useState(members.slice(0, 6));
  const editableColumns: ColumnsType<Member> = columns.map((column) =>
    column.key === 'role'
      ? {
          ...column,
          render: (value, record) => (
            <input
              className="h-8 w-full rounded border border-[#ddd] bg-white px-[11px] text-[#111] outline-none transition-colors focus:border-[#0062df]"
              aria-label={`${record.name} 직무 편집`}
              value={String(value)}
              onChange={(event) => setRows((current) => current.map((row) => (row.key === record.key ? { ...row, role: event.target.value } : row)))}
            />
          ),
        }
      : column,
  );
  return <Table<Member> dataSource={rows} columns={editableColumns} rowKey="key" pagination={false} bordered />;
}

export const DragRowSorting: Story = { render: () => <DragStory /> };
export const DragColumnSorting: Story = { render: () => <DragColumnStory /> };

function DragStory() {
  const [rows, setRows] = useState(members.slice(0, 6));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setRows((current) => arrayMove(current, current.findIndex((row) => row.key === active.id), current.findIndex((row) => row.key === over.id)));
  };
  const dragColumns: ColumnsType<Member> = [
    { key: 'drag', title: <span className="sr-only">행 이동</span>, width: 48, render: () => <span className="cursor-grab select-none text-[#999]" aria-hidden>⠿</span> },
    ...columns,
  ];
  return (
    <>
      <p className="mb-4 text-[#999]">행을 잡아 원하는 위치로 드래그하세요. 주변 행이 이동 경로에 맞춰 부드럽게 재배치됩니다.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((row) => row.key)} strategy={verticalListSortingStrategy}>
          <Table<Member> dataSource={rows} columns={dragColumns} rowKey="key" pagination={false} components={{ body: { row: SortableRow } }} />
        </SortableContext>
      </DndContext>
    </>
  );
}

type SortableRowProps = HTMLAttributes<HTMLTableRowElement> & { 'data-row-key'?: Key; record?: Member; index?: number };

function SortableRow({ record: _record, index: _index, style, className = '', ...props }: SortableRowProps) {
  const id = String(props['data-row-key']);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <tr
      ref={setNodeRef}
      {...props}
      {...attributes}
      {...listeners}
      role="row"
      className={`${className} relative cursor-grab active:cursor-grabbing ${isDragging ? 'z-10 opacity-90 drop-shadow-lg' : ''}`}
      style={{ ...style, transform: CSS.Transform.toString(transform), transition: transition ?? 'transform 220ms cubic-bezier(.2,.8,.2,1)' }}
    />
  );
}

function DragColumnStory() {
  const [dragColumns, setDragColumns] = useState<ColumnsType<Member>>(() => columns.map((column) => ({ ...column, sorter: undefined, filters: undefined })));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const keys = dragColumns.map((column, index) => String(column.key ?? column.dataIndex ?? index));
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setDragColumns((current) => {
      const currentKeys = current.map((column, index) => String(column.key ?? column.dataIndex ?? index));
      return arrayMove([...current], currentKeys.indexOf(String(active.id)), currentKeys.indexOf(String(over.id)));
    });
  };
  return (
    <>
      <p className="mb-4 text-[#999]">열 헤더를 잡아 좌우로 이동하세요. 다른 열이 자연스럽게 자리를 비웁니다.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={keys} strategy={horizontalListSortingStrategy}>
          <Table<Member> dataSource={members.slice(0, 6)} columns={dragColumns} rowKey="key" pagination={false} components={{ header: { cell: SortableHeaderCell } }} />
        </SortableContext>
      </DndContext>
    </>
  );
}

type SortableHeaderCellProps = HTMLAttributes<HTMLTableCellElement> & { column?: ColumnsType<Member>[number]; index?: number };

function SortableHeaderCell({ column, index = 0, style, className = '', ...props }: SortableHeaderCellProps) {
  const id = String(column?.key ?? column?.dataIndex ?? index);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const horizontalTransform = transform ? { ...transform, y: 0 } : null;
  return (
    <th
      ref={setNodeRef}
      {...props}
      {...attributes}
      {...listeners}
      role="columnheader"
      className={`${className} cursor-grab active:cursor-grabbing ${isDragging ? 'z-10' : ''}`}
      style={{ ...style, transform: CSS.Transform.toString(horizontalTransform), transition: transition ?? 'transform 220ms cubic-bezier(.2,.8,.2,1)' }}
    />
  );
}
