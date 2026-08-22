import { useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { formatTableStorySource } from "../../storybook/table-story-source";
import { columns, members, statusFilters, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { ColumnsType, TableProps } from "./Table.types";

const meta: Meta<TableProps<Member>> = {
  id: "components-table-sorting-filtering",
  title: "Components/Table",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["!autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      source: { transform: formatTableStorySource },
      description: {
        component:
          "열의 데이터를 정렬하거나 원하는 조건으로 필터링해요.  \n변경된 정렬·필터 조건을 서버 요청에 전달할 수 있어요.",
      },
    },
  },
  args: {
    dataSource: members.slice(0, 5),
    columns,
    pagination: false,
  },
};

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

export default meta;
type Story = StoryObj<TableProps<Member>>;

const filteringColumns: ColumnsType<Member> = [
  { key: "name", dataIndex: "name", title: "이름", minWidth: 150 },
  { key: "team", dataIndex: "team", title: "팀", width: 120 },
  { key: "status", dataIndex: "status", title: "상태", width: 100 },
  { key: "projects", dataIndex: "projects", title: "프로젝트", width: 110 },
];

const serverColumns: ColumnsType<Member> = filteringColumns.map((column) =>
  column.key === "name"
    ? { ...column, sorter: true }
    : column.key === "status"
      ? { ...column, filters: statusFilters }
      : column,
);

export const ServerTable: Story = {
  parameters: {
    ...storyDescription("components-table-sorting-filtering--server-table"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-sorting-filtering--server-table").docs,
      source: {
        code: withStoryImports(`const members = [
  { id: 'M-1001', name: '김민준', team: 'Design', status: '활성', projects: 8 },
  // ...나머지 4개 항목
];

const statusFilters = [
  { text: '활성', value: '활성' },
  { text: '휴가', value: '휴가' },
  { text: '대기', value: '대기' },
];

const columns = [
  { key: 'name', dataIndex: 'name', title: '이름', minWidth: 150, sorter: true },
  { key: 'team', dataIndex: 'team', title: '팀', width: 120 },
  { key: 'status', dataIndex: 'status', title: '상태', width: 100, filters: statusFilters },
  { key: 'projects', dataIndex: 'projects', title: '프로젝트', width: 110 },
];

type RequestParams = {
  page: number;
  perPage: number;
  sort: {
    column: string | null;
    order: 'ascend' | 'descend' | null;
  };
  filter: Record<string, string[]>;
};

function ServerTable() {
  const [requestParams, setRequestParams] = useState<RequestParams>({
    page: 1,
    perPage: 2,
    sort: {
      column: null,
      order: null,
    },
    filter: {
      status: [],
    },
  });

  return (
    <>
      <pre>{JSON.stringify(requestParams, null, 2)}</pre>
      <Table
        dataSource={members}
        columns={columns}
        pagination={{
          defaultPageSize: 2,
          pageSizeOptions: [2, 5, 10],
          showSizeChanger: true,
        }}
        onChange={(pagination, filters, sorter) => {
          const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
          const nextParams = {
            page: pagination.current ?? 1,
            perPage: pagination.pageSize ?? 2,
            sort: {
              column: currentSorter.field ? String(currentSorter.field) : null,
              order: currentSorter.order ?? null,
            },
            filter: Object.fromEntries(
              Object.entries(filters).map(([column, values]) => [
                column,
                (values ?? []).map(String),
              ]),
            ),
          };

          setRequestParams(nextParams);

          // 여기서 nextParams를 서버 API 요청에 전달해요.
        }}
      />
    </>
  );
}`),
      },
    },
  },
  args: {
    columns: serverColumns,
    pagination: {
      defaultPageSize: 2,
      pageSizeOptions: [2, 5, 10],
      showSizeChanger: true,
    },
  },
  render: (args) => <ServerTableStory {...args} />,
};

function ServerTableStory(args: TableProps<Member>) {
  const [requestParams, setRequestParams] = useState({
    page: 1,
    perPage: 2,
    sort: {
      column: null as string | null,
      order: null as string | null,
    },
    filter: {
      status: [] as string[],
    } as Record<string, string[]>,
  });

  return (
    <>
      <pre className="mb-4 overflow-x-auto rounded-lg bg-[#f5f5f5] p-4 text-[13px] text-[#333]">
        {JSON.stringify(requestParams, null, 2)}
      </pre>
      <Table<Member>
        {...args}
        onChange={(pagination, filters, sorter) => {
          const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
          const nextParams = {
            page: pagination.current ?? 1,
            perPage: pagination.pageSize ?? 2,
            sort: {
              column: currentSorter.field ? String(currentSorter.field) : null,
              order: currentSorter.order ?? null,
            },
            filter: Object.fromEntries(
              Object.entries(filters).map(([column, values]) => [
                column,
                (values ?? []).map(String),
              ]),
            ),
          };

          setRequestParams(nextParams);

          // 여기서 nextParams를 서버 API 요청에 전달해요.
        }}
      />
    </>
  );
}
