import { useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import {
  formatTableDataSourceDeclaration,
  formatTableStorySource,
} from "../../storybook/table-story-source";
import { Button } from "../Button";
import { largeData, columns, members, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { TableProps } from "./Table.types";

const paginationDataSource = largeData.slice(0, 185);
const singlePageDataSource = members.slice(0, 4);

const meta: Meta<TableProps<Member>> = {
  id: "components-table-pagination",
  title: "Components/Table",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["!autodocs"],
  parameters: {
    controls: { disable: false },
    docs: {
      source: { transform: formatTableStorySource },
      description: {
        component:
          "많은 데이터를 여러 페이지로 나눠서 보여줘요.  \n페이지 크기·빠른 이동·위치와 표시 방식을 설정할 수 있어요.",
      },
    },
  },
  args: { dataSource: paginationDataSource, columns },
};

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const Pagination: Story = {
  name: "Pagination Basic",
  parameters: storyDescription("components-table-pagination--pagination"),
};

export const PaginationPageControls: Story = {
  name: "Pagination Controls",
  parameters: storyDescription("components-table-pagination--pagination-page-controls"),
  args: {
    pagination: {
      showSizeChanger: true, // 기본값: 전체 데이터가 50개 이상이면 true
      pageSizeOptions: [10, 20, 50], // 기본값: [10, 20, 50]
      showQuickJumper: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}명`,
    },
  },
};

export const ControlledPagination: Story = {
  name: "Pagination Controlled Page And Size",
  parameters: {
    ...storyDescription("components-table-pagination--controlled-pagination"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-pagination--controlled-pagination").docs,
      source: {
        code: withStoryImports(`${formatTableDataSourceDeclaration(paginationDataSource)}

const columns = [
  {
    key: 'name',
    dataIndex: 'name',
    title: '이름',
    width: 150,
  },
  {
    key: 'role',
    dataIndex: 'role',
    title: '직무',
    minWidth: 190,
  },
  {
    key: 'team',
    dataIndex: 'team',
    title: '팀',
    width: 120,
  },
  {
    key: 'projects',
    dataIndex: 'projects',
    title: '프로젝트',
    width: 110,
  },
];

function ControlledPaginationTable() {
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(20);

  return (
    <Table
      dataSource={members}
      columns={columns}
      pagination={{
        page,
        pageSize,
        showSizeChanger: true,
        onChange: (nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        },
      }}
    />
  );
}`),
      },
    },
  },
  render: (args) => <ControlledPaginationTable {...args} />,
};

export const PaginationPlacement: Story = {
  name: "Pagination Placement",
  parameters: storyDescription("components-table-pagination--pagination-placement"),
  args: { pagination: { placement: ["topStart", "bottomEnd"] } },
};

export const PaginationSimple: Story = {
  name: "Pagination Simple",
  args: { pagination: { simple: true } },
  parameters: storyDescription("components-table-pagination--pagination-simple"),
};

export const PaginationDisabled: Story = {
  name: "Pagination Disabled",
  parameters: storyDescription("components-table-pagination--pagination-disabled"),
  args: { pagination: { disabled: true } },
};

export const PaginationHideOnSinglePage: Story = {
  name: "Pagination Hide On Single Page",
  parameters: {
    ...storyDescription("components-table-pagination--pagination-hide-on-single-page"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-pagination--pagination-hide-on-single-page").docs,
      source: {
        code: withStoryImports(`${formatTableDataSourceDeclaration(singlePageDataSource)}

const columns = [
  {
    key: 'name',
    dataIndex: 'name',
    title: '이름',
    width: 150,
  },
  {
    key: 'role',
    dataIndex: 'role',
    title: '직무',
    minWidth: 190,
  },
  {
    key: 'team',
    dataIndex: 'team',
    title: '팀',
    width: 120,
  },
  {
    key: 'projects',
    dataIndex: 'projects',
    title: '프로젝트',
    width: 110,
  },
];

function PaginationHideOnSinglePageTable() {
  const [hideOnSinglePage, setHideOnSinglePage] = useState(true);

  return (
    <div className="grid gap-4">
      <Button
        className="justify-self-start"
        onClick={() => setHideOnSinglePage((current) => !current)}
      >
        hideOnSinglePage: {String(hideOnSinglePage)}
      </Button>
      <Table
        dataSource={singlePageDataSource}
        columns={columns}
        pagination={{ hideOnSinglePage }}
      />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <PaginationHideOnSinglePageTable {...args} />,
};

function PaginationHideOnSinglePageTable(args: Partial<TableProps<Member>>) {
  const [hideOnSinglePage, setHideOnSinglePage] = useState(true);

  return (
    <div className="grid gap-4">
      <Button
        className="justify-self-start"
        onClick={() => setHideOnSinglePage((current) => !current)}
      >
        hideOnSinglePage: {String(hideOnSinglePage)}
      </Button>
      <Table
        {...args}
        dataSource={members.slice(0, 4)}
        columns={columns}
        pagination={{ hideOnSinglePage }}
      />
    </div>
  );
}

function ControlledPaginationTable(args: Partial<TableProps<Member>>) {
  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(20);

  return (
    <Table
      {...args}
      dataSource={paginationDataSource}
      columns={columns}
      pagination={{
        page,
        pageSize,
        showSizeChanger: true,
        onChange: (nextPage, nextPageSize) => {
          setPage(nextPage);
          setPageSize(nextPageSize);
        },
      }}
    />
  );
}
