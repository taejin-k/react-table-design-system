import type { ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { formatTableStorySource } from "../../storybook/table-story-source";
import { largeData, columns, members, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { TableProps } from "./Table.types";

const meta: Meta<TableProps<Member>> = {
  id: "components-table-pagination",
  title: "Components/Table",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["!autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      source: { transform: formatTableStorySource },
      description: {
        component:
          "많은 데이터를 여러 페이지로 나눠서 보여줘요.  \n페이지 크기·빠른 이동·위치와 표시 방식을 설정할 수 있어요.",
      },
    },
  },
  args: { dataSource: largeData.slice(0, 185), columns },
};

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const Pagination: Story = {
  parameters: storyDescription("components-table-pagination--pagination"),
};

export const PaginationPageControls: Story = {
  parameters: storyDescription("components-table-pagination--pagination-page-controls"),
  args: {
    pagination: {
      showSizeChanger: true, // 기본값: 전체 데이터가 50개를 초과하면 true
      pageSizeOptions: [10, 20, 50], // 기본값: [10, 20, 50, 100]
      showQuickJumper: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}명`,
    },
  },
};

export const PaginationPlacement: Story = {
  parameters: storyDescription("components-table-pagination--pagination-placement"),
  args: { pagination: { placement: ["topStart", "bottomEnd"] } },
};

export const PaginationSimple: Story = {
  args: { pagination: { simple: true } },
  parameters: storyDescription("components-table-pagination--pagination-simple"),
};

export const PaginationDisabled: Story = {
  parameters: storyDescription("components-table-pagination--pagination-disabled"),
  args: { pagination: { disabled: true } },
};

export const PaginationHideOnSinglePage: Story = {
  parameters: storyDescription("components-table-pagination--pagination-hide-on-single-page"),
  args: { dataSource: members.slice(0, 4), pagination: { hideOnSinglePage: true } },
};
