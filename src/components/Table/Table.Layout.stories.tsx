import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { formatTableStorySource } from "../../storybook/table-story-source";
import { columns, largeData, members, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { TableProps } from "./Table.types";

const meta: Meta<TableProps<Member>> = {
  id: "components-table-layout",
  title: "Components/Table",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["!autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      source: { transform: formatTableStorySource },
      description: {
        component:
          "열과 헤더를 고정하고 필요한 영역만 스크롤해요.  \n요약·가상화·그룹 헤더와 병합 셀 등 레이아웃 기능을 설정할 수 있어요.",
      },
    },
  },
  args: { dataSource: members.slice(0, 5), columns, pagination: false },
};

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const ResponsiveColumns: Story = {
  args: {
    columns: [
      { key: "name", dataIndex: "name", title: "이름", width: 150 },
      { key: "role", dataIndex: "role", title: "직무", minWidth: 190, responsive: ["sm"] },
      { key: "team", dataIndex: "team", title: "팀", width: 120 },
      {
        key: "projects",
        dataIndex: "projects",
        title: "프로젝트",
        width: 110,
        responsive: ["md"],
      },
    ],
  },
  parameters: {
    ...storyDescription("components-table-layout--responsive-columns"),
    viewport: { defaultViewport: "mobile1" },
  },
};
export const VirtualThousandRows: Story = {
  name: "Virtual Scroll",
  parameters: {
    ...storyDescription("components-table-layout--virtual-thousand-rows"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-layout--virtual-thousand-rows").docs,
      source: {
        code: withStoryImports(`const members = Array.from({ length: 1000 }, (_, index) => ({
  key: \`M-\${index + 1}\`,
  name: \`구성원 \${index + 1}\`,
  role: 'Product Designer',
  team: 'Design',
  projects: index,
}));

const columns = [
  { key: 'name', dataIndex: 'name', title: '이름', width: 150 },
  { key: 'role', dataIndex: 'role', title: '직무', minWidth: 190 },
  { key: 'team', dataIndex: 'team', title: '팀', width: 120 },
  { key: 'projects', dataIndex: 'projects', title: '프로젝트', width: 110 },
];

function VirtualTable() {
  return (
    <Table
      dataSource={members}
      columns={columns}
      pagination={false}
      virtual
      scroll={{
        // Table body의 세로 높이만큼 y를 지정해요.
        y: 420,
      }}
    />
  );
}`),
      },
    },
  },
  args: {
    dataSource: largeData,
    virtual: true,
    scroll: { y: 420 },
  },
};

export const MergedRows: Story = {
  parameters: storyDescription("components-table-layout--merged-rows"),
  args: {
    bordered: true,
    columns: columns.map((column) =>
      column.key === "team"
        ? {
            ...column,
            onCell: (_record: Member, index?: number) =>
              index === 0 ? { rowSpan: 2 } : index === 1 ? { rowSpan: 0 } : {},
          }
        : column,
    ),
  },
};
