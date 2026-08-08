import { useRef, type ComponentType, type HTMLAttributes } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { columns, largeData, members, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { TableProps, TableRef } from "./Table.types";

const meta: Meta<TableProps<Member>> = {
  title: "Components/Table/API Compatibility",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Table의 Ant Design 호환 선언 방식, ref, semantic 스타일, locale와 네이티브 속성을 검증합니다.",
      },
    },
  },
  args: { dataSource: members.slice(0, 6), rowKey: "key", pagination: false },
};

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const ColumnsProp: Story = { args: { columns } };

export const ColumnJSX: Story = {
  render: (args) => (
    <Table<Member> {...args}>
      <Table.ColumnGroup<Member> title="구성원">
        <Table.Column<Member> title="이름" dataIndex="name" key="name" />
        <Table.Column<Member> title="직무" dataIndex="role" key="role" />
      </Table.ColumnGroup>
      <Table.Column<Member> title="팀" dataIndex="team" key="team" />
      <Table.Column<Member> title="프로젝트" dataIndex="projects" key="projects" align="right" />
    </Table>
  ),
};

export const SemanticClassNamesAndStyles: Story = {
  args: {
    columns,
    classNames: { header: { cell: "text-[#0062df]" }, body: { row: "even:[&>td]:bg-[#fafafa]" } },
    styles: { cell: { fontVariantNumeric: "tabular-nums" } },
  },
};
export const NativeRootProps: Story = {
  args: { columns, "aria-label": "구성원 테이블", role: "region", style: { marginBlock: 12 } },
};
export const LoadingBoolean: Story = { args: { columns, loading: true } };
export const LoadingConfig: Story = {
  args: { columns, loading: { spinning: true, tip: "구성원을 불러오는 중", delay: 0 } },
};
export const Empty: Story = {
  args: { columns, dataSource: [], locale: { emptyText: <div>아직 구성원이 없습니다.</div> } },
};

export const SharedColumnDefaults: Story = {
  args: { columns, column: { align: "center", className: "text-[#0062df]" } },
};

export const RowAndHeaderHooks: Story = {
  args: {
    columns,
    rowClassName: (record) => (record.status === "휴가" ? "[&>td]:bg-[#fffbe6]" : ""),
    onRow: (record) => ({
      title: `${record.name} 데이터 행`,
      "aria-label": `${record.name} 데이터 행`,
    }),
    onHeaderRow: () => ({ className: "bg-[#e6f4ff]" }),
    rowHoverable: false,
  },
};

function StoryBodyRow({
  record,
  index: _index,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { record?: Member; index?: number }) {
  return <tr {...props} data-member-key={record?.key} />;
}

export const CustomTableComponents: Story = {
  args: {
    columns,
    components: { body: { row: StoryBodyRow } },
    rowClassName: (_record, index) => (index % 2 ? "[&>td]:bg-[#fafafa]" : ""),
  },
};

export const ImperativeScrollTo: Story = { render: (args) => <ImperativeScrollStory {...args} /> };

function ImperativeScrollStory(args: TableProps<Member>) {
  const ref = useRef<TableRef>(null);
  return (
    <>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className="h-8 rounded border border-[#ddd] px-3 text-[#111] hover:bg-[#f5f5f5]"
          onClick={() => ref.current?.scrollTo({ index: 0, align: "start" })}
        >
          첫 행
        </button>
        <button
          type="button"
          className="h-8 rounded border border-[#ddd] px-3 text-[#111] hover:bg-[#f5f5f5]"
          onClick={() => ref.current?.scrollTo({ key: "V-75", align: "center" })}
        >
          75번째 행
        </button>
        <button
          type="button"
          className="h-8 rounded border border-[#ddd] px-3 text-[#111] hover:bg-[#f5f5f5]"
          onClick={() => ref.current?.scrollTo({ index: 99, align: "end" })}
        >
          마지막 행
        </button>
      </div>
      <Table<Member>
        {...args}
        ref={ref}
        dataSource={largeData.slice(0, 100)}
        columns={columns}
        virtual
        scroll={{ x: 900, y: 300 }}
      />
    </>
  );
}

export const LocalizedInterface: Story = {
  args: {
    columns,
    dataSource: members.slice(0, 4),
    rowSelection: { selections: true },
    expandable: { expandedRowRender: (record) => <div>{record.name} profile</div> },
    locale: {
      filterTitle: "Filter options",
      filterConfirm: "Apply",
      filterReset: "Reset",
      filterSearchPlaceholder: "Search options",
      emptyText: "No members",
      selectionAll: "Select every row",
      selectInvert: "Invert this page",
      selectNone: "Clear selection",
      expand: "Open row",
      collapse: "Close row",
      triggerAsc: "Sort ascending",
      triggerDesc: "Sort descending",
      cancelSort: "Clear sorting",
    },
  },
};

export const ColumnPresentationProps: Story = {
  args: {
    columns: columns.map((column) =>
      column.key === "role"
        ? { ...column, hidden: true }
        : column.key === "name"
          ? {
              ...column,
              ellipsis: { showTitle: false },
              minWidth: 180,
              onHeaderCell: () => ({ className: "bg-[#e6f4ff]" }),
            }
          : column.key === "team"
            ? {
                ...column,
                onCell: (record: Member) => ({
                  title: `${record.team} 팀`,
                  className:
                    record.team === "Design"
                      ? "bg-[#f6ffed] font-semibold text-[#237804]"
                      : undefined,
                }),
              }
            : column,
    ),
  },
};

export const ColumnAlignment: Story = {
  args: {
    columns: [
      { title: "왼쪽 정렬", dataIndex: "name", key: "name", align: "left" },
      { title: "가운데 정렬", dataIndex: "team", key: "team", align: "center" },
      { title: "오른쪽 정렬", dataIndex: "projects", key: "projects", align: "right" },
    ],
    bordered: true,
  },
};
