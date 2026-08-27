import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { formatTableStorySource } from "../../storybook/table-story-source";
import { columns, members, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { TableProps } from "./Table.types";

const treeData: Member[] = [
  {
    ...members[0],
    children: [
      { ...members[5], id: "M-1001-1", name: "한지우 (하위)" },
      { ...members[7], id: "M-1001-2", name: "송채원 (하위)" },
    ],
  },
  ...members.slice(1, 5),
];

const meta: Meta<TableProps<Member>> = {
  id: "components-table-expandable",
  title: "Components/Table",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["!autodocs"],
  parameters: {
    controls: { disable: false },
    docs: {
      source: { transform: formatTableStorySource },
      description: {
        component:
          "행을 펼쳐 상세 내용이나 하위 데이터를 보여줘요.  \n상세 행·트리 데이터·행 클릭과 펼침 조건을 설정할 수 있어요.",
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

export const ExpandedRow: Story = {
  name: "Expand",
  parameters: storyDescription("components-table-expandable--expanded-row"),
  args: {
    expandable: {
      expandedRowRender: (record) => `${record.name} · ${record.role} · ${record.joinedAt}`,
    },
  },
};

export const ExpandByRowClick: Story = {
  parameters: storyDescription("components-table-expandable--expand-by-row-click"),
  args: {
    expandable: {
      expandRowByClick: true,
      expandedRowRender: (record) => `${record.name} 상세 정보`,
    },
  },
};

export const TreeData: Story = {
  name: "Expand Tree Data",
  parameters: storyDescription("components-table-expandable--tree-data"),
  args: {
    dataSource: treeData,
    expandable: { defaultExpandAllRows: true },
  },
};

export const EligibleRows: Story = {
  name: "Expandable Rows",
  parameters: storyDescription("components-table-expandable--eligible-rows"),
  args: {
    expandable: {
      rowExpandable: (record) => record.status === "활성",
      expandedRowRender: (record) => `${record.name} 활성 구성원 상세`,
    },
  },
};
