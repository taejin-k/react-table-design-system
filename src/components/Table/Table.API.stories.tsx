import { useRef, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { Illustrations } from "../Illustrations";
import { withStoryImports } from "../../storybook/story-source";
import { formatTableStorySource } from "../../storybook/table-story-source";
import { Button } from "../Button/Button";
import { columns, largeData, members, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { ColumnsType, TableProps, TableRef } from "./Table.types";

const meta: Meta<TableProps<Member>> = {
  id: "components-table-api-compatibility",
  title: "Components/Table",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["!autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      source: { transform: formatTableStorySource },
      description: {
        component:
          "Ant Design과 같은 방식으로 Table API를 사용할 수 있어요.  \n선언 방식·ref·semantic 스타일·locale과 네이티브 속성을 확인할 수 있어요.",
      },
    },
  },
  args: { dataSource: members.slice(0, 5), pagination: false },
};

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

export default meta;
type Story = StoryObj<TableProps<Member>>;

const groupedColumns = [
  {
    title: "구성원",
    children: [
      { key: "name", dataIndex: "name", title: "이름", width: 150 },
      { key: "role", dataIndex: "role", title: "직무", minWidth: 190 },
    ],
  },
  {
    title: "업무 정보",
    children: [
      { key: "team", dataIndex: "team", title: "팀", width: 120 },
      { key: "projects", dataIndex: "projects", title: "프로젝트", width: 110 },
    ],
  },
];

const fixedColumns: ColumnsType<Member> = [
  { key: "name", dataIndex: "name", title: "이름", width: 220, fixed: "left" },
  { key: "role", dataIndex: "role", title: "직무", minWidth: 190 },
  { key: "team", dataIndex: "team", title: "팀", width: 220 },
  { key: "status", dataIndex: "status", title: "상태", width: 180 },
  { key: "joinedAt", dataIndex: "joinedAt", title: "합류일", width: 200 },
  { key: "memberKey", dataIndex: "key", title: "구성원 ID", width: 180 },
  {
    key: "projects",
    dataIndex: "projects",
    title: "프로젝트",
    width: 220,
    fixed: "right",
  },
];

export const GroupedHeaders: Story = {
  args: { columns: groupedColumns },
  parameters: storyDescription("components-table-api-compatibility--grouped-headers"),
};

export const Headerless: Story = {
  parameters: storyDescription("components-table-api-compatibility--headerless"),
  args: { columns, showHeader: false },
};

export const FixedHeader: Story = {
  parameters: {
    ...storyDescription("components-table-api-compatibility--fixed-header"),
    tableScrollYComment: "테이블 본문의 세로 높이를 정하면 헤더가 자동으로 고정돼요.",
  },
  args: { dataSource: members, columns, pagination: false, scroll: { y: 280 } },
};

export const FixedColumns: Story = {
  parameters: {
    ...storyDescription("components-table-api-compatibility--fixed-columns"),
    tableColumnsComment:
      "고정 열의 위치를 정확하게 계산하려면 fixed를 설정한 column.width가 필요해요.",
    tableScrollXComment: "컬럼 너비와 콘텐츠에 필요한 만큼 가로 스크롤 영역을 만들어요.",
  },
  args: {
    columns: fixedColumns,
    scroll: { x: "max-content" },
  },
};

export const StickyScrollbar: Story = {
  name: "Sticky Scrollbar",
  parameters: {
    ...storyDescription("components-table-api-compatibility--sticky-scrollbar"),
    tableColumnsComment: "가로 스크롤을 확인할 수 있도록 컬럼 너비를 지정해요.",
    tableScrollXComment: "컬럼 너비와 콘텐츠에 필요한 만큼 가로 스크롤 영역을 만들어요.",
  },
  args: {
    dataSource: largeData.slice(0, 20),
    columns: fixedColumns,
    stickyScrollBar: true,
    scroll: { x: "max-content" },
  },
};

export const Loading: Story = {
  parameters: storyDescription("components-table-api-compatibility--loading"),
  args: { columns, loading: { tip: "구성원을 불러오는 중" } },
};
export const Empty: Story = {
  parameters: storyDescription("components-table-api-compatibility--empty"),
  args: {
    columns,
    dataSource: [],
    locale: {
      emptyText: <Illustrations description="아직 구성원이 없어요" />,
    },
  },
};

export const ImperativeScrollTo: Story = {
  name: "Scroll To",
  parameters: {
    ...storyDescription("components-table-api-compatibility--imperative-scroll-to"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-api-compatibility--imperative-scroll-to").docs,
      source: {
        code: withStoryImports(`const columns = [
  { key: 'name', dataIndex: 'name', title: '이름', width: 150 },
  { key: 'role', dataIndex: 'role', title: '직무', minWidth: 190 },
  { key: 'team', dataIndex: 'team', title: '팀', width: 120 },
  { key: 'projects', dataIndex: 'projects', title: '프로젝트', width: 110 },
];

const members = Array.from({ length: 100 }, (_, index) => ({
  key: \`M-\${index + 1}\`,
  name: \`구성원 \${String(index + 1).padStart(3, '0')}\`,
  role: 'Product Designer',
  team: 'Design',
  projects: index,
}));

function ImperativeScrollTable() {
  const tableRef = useRef(null);

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Button type="secondary" onClick={() => tableRef.current?.scrollTo({ index: 0, align: 'start' })}>
          첫 행
        </Button>
        <Button type="secondary" onClick={() => tableRef.current?.scrollTo({ key: 'M-75', align: 'center' })}>
          75번째 행
        </Button>
        <Button type="secondary" onClick={() => tableRef.current?.scrollTo({ index: 99, align: 'end' })}>
          마지막 행
        </Button>
      </div>
      <Table
        ref={tableRef}
        dataSource={members}
        columns={columns}
        pagination={false}
        virtual
        scroll={{ y: 300 }}
      />
    </>
  );
}`),
      },
    },
  },
  render: (args) => <ImperativeScrollStory {...args} />,
};

function ImperativeScrollStory(args: TableProps<Member>) {
  const ref = useRef<TableRef>(null);
  return (
    <>
      <div className="mb-4 flex gap-2">
        <Button
          type="secondary"
          onClick={() => ref.current?.scrollTo({ index: 0, align: "start" })}
        >
          첫 행
        </Button>
        <Button
          type="secondary"
          onClick={() => ref.current?.scrollTo({ key: "V-75", align: "center" })}
        >
          75번째 행
        </Button>
        <Button type="secondary" onClick={() => ref.current?.scrollTo({ index: 99, align: "end" })}>
          마지막 행
        </Button>
      </div>
      <Table<Member>
        {...args}
        ref={ref}
        dataSource={largeData.slice(0, 100)}
        columns={columns}
        virtual
        scroll={{ y: 300 }}
      />
    </>
  );
}
