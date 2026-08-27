import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { formatTableStorySource } from "../../storybook/table-story-source";
import { columns, members, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { TableProps } from "./Table.types";

const meta: Meta<TableProps<Member>> = {
  id: "components-table-selection",
  title: "Components/Table",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["!autodocs"],
  parameters: {
    controls: { disable: false },
    docs: {
      source: { transform: formatTableStorySource },
      description: {
        component:
          "체크박스나 라디오로 원하는 행을 선택해요.  \n트리 데이터의 부모와 자식 선택 관계를 설정할 수 있어요.",
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

const associatedTreeData: Member[] = [
  {
    ...members[0],
    children: [
      { ...members[5], id: "M-1001-1", name: "한지우 (하위)" },
      { ...members[7], id: "M-1001-2", name: "송채원 (하위)" },
    ],
  },
  ...members.slice(1, 4),
];
export const AssociatedTreeSelection: Story = {
  name: "Tree Checkbox",
  parameters: storyDescription("components-table-selection--associated-tree-selection"),
  args: {
    dataSource: associatedTreeData,
    expandable: { defaultExpandAllRows: true },
    rowSelection: { type: "checkbox", checkStrictly: false },
  },
};
