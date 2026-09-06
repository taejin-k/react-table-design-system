import { useRef, useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { Illustrations } from "../Illustrations";
import { Flex } from "../Flex";
import { Input } from "../Input";
import { Toggle } from "../Toggle";
import { withStoryImports } from "../../storybook/story-source";
import {
  formatTableDataSourceDeclaration,
  formatTableVirtualDataSourceDeclaration,
  formatTableStorySource,
} from "../../storybook/table-story-source";
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
          "Wizard 디자인 시스템 컨벤션으로 Table API를 사용할 수 있어요.  \n열 너비·ref·locale과 네이티브 속성을 확인할 수 있어요.",
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
  { key: "memberId", dataIndex: "id", title: "구성원 ID", width: 180 },
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

export const FixedTableHeight: Story = {
  parameters: {
    ...storyDescription("components-table-api-compatibility--fixed-table-height"),
    tableScrollYComment: "테이블 본문의 최대 세로 높이를 설정해요.",
  },
  args: { dataSource: members, columns, pagination: false, scroll: { y: 280 } },
};

export const FixedColumns: Story = {
  parameters: {
    ...storyDescription("components-table-api-compatibility--fixed-columns"),
    tableColumnsComment:
      "고정 열의 위치를 정확하게 계산하려면 fixed를 설정한 column.width가 필요해요.",
  },
  args: {
    columns: fixedColumns,
  },
};

function scrollbarHeightSource(sticky: boolean) {
  return withStoryImports(`${formatTableDataSourceDeclaration(sticky ? largeData.slice(0, 20) : members.slice(0, 5))}

const columns: ColumnsType<(typeof members)[number]> = [
  { key: 'name', dataIndex: 'name', title: '이름', width: 220, fixed: 'left' },
  { key: 'role', dataIndex: 'role', title: '직무', minWidth: 190 },
  { key: 'team', dataIndex: 'team', title: '팀', width: 220 },
  { key: 'status', dataIndex: 'status', title: '상태', width: 180 },
  { key: 'joinedAt', dataIndex: 'joinedAt', title: '합류일', width: 200 },
  { key: 'memberId', dataIndex: 'id', title: '구성원 ID', width: 180 },
  { key: 'projects', dataIndex: 'projects', title: '프로젝트', width: 220, fixed: 'right' },
];

function ${sticky ? "StickyScrollbar" : "ScrollbarHeight"}Table() {
  const [height, setHeight] = useState('${sticky ? 8 : 12}');

  return (
    <>
      <Input
        type="number"
        min={8}
        max={16}
        step={1}
        label="Scrollbar height (px)"
        value={height}
        width={180}
        onChange={setHeight}
      />
      <Table
        className="mt-4"
        dataSource={members}
        columns={columns}
        pagination={false}
        scrollBarHeight={Number(height)}${sticky ? "\n        stickyScrollBar" : ""}
      />
    </>
  );
}`);
}

function ScrollbarHeightTable(args: TableProps<Member>) {
  const [height, setHeight] = useState(String(args.scrollBarHeight ?? 8));

  return (
    <>
      <Input
        type="number"
        min={8}
        max={16}
        step={1}
        label="Scrollbar height (px)"
        value={height}
        width={180}
        onChange={setHeight}
      />
      <Table {...args} className="mt-4" scrollBarHeight={Number(height)} />
    </>
  );
}

export const ScrollbarHeight: Story = {
  name: "Scrollbar Height",
  parameters: {
    ...storyDescription("components-table-api-compatibility--scrollbar-height"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-api-compatibility--scrollbar-height").docs,
      source: { code: scrollbarHeightSource(false) },
    },
  },
  args: { columns: fixedColumns, scrollBarHeight: 12 },
  render: (args) => <ScrollbarHeightTable {...args} />,
};

export const StickyScrollbar: Story = {
  name: "Sticky Scrollbar",
  parameters: {
    ...storyDescription("components-table-api-compatibility--sticky-scrollbar"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-api-compatibility--sticky-scrollbar").docs,
      source: { code: scrollbarHeightSource(true) },
    },
  },
  args: {
    dataSource: largeData.slice(0, 20),
    columns: fixedColumns,
    stickyScrollBar: true,
  },
  render: (args) => <ScrollbarHeightTable {...args} />,
};

export const StickyHeader: Story = {
  name: "Sticky Header",
  parameters: storyDescription("components-table-api-compatibility--sticky-header"),
  args: { dataSource: members, columns, pagination: false, stickyHeader: true },
};

export const StickyOffsets: Story = {
  name: "Sticky Offsets",
  parameters: {
    ...storyDescription("components-table-api-compatibility--sticky-offsets"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-api-compatibility--sticky-offsets").docs,
      source: {
        code: withStoryImports(`${formatTableDataSourceDeclaration(largeData.slice(0, 20))}

const columns: ColumnsType<(typeof members)[number]> = [
  { key: 'name', dataIndex: 'name', title: '이름', width: 220, fixed: 'left' },
  { key: 'role', dataIndex: 'role', title: '직무', minWidth: 190 },
  { key: 'team', dataIndex: 'team', title: '팀', width: 220 },
  { key: 'status', dataIndex: 'status', title: '상태', width: 180 },
  { key: 'joinedAt', dataIndex: 'joinedAt', title: '합류일', width: 200 },
  { key: 'memberId', dataIndex: 'id', title: '구성원 ID', width: 180 },
  {
    key: 'projects',
    dataIndex: 'projects',
    title: '프로젝트',
    width: 220,
    fixed: 'right',
  },
];

function StickyOffsetsTable() {
  const [headerOffset, setHeaderOffset] = useState('64');
  const [scrollBarOffset, setScrollBarOffset] = useState('32');

  return (
    <>
      <Flex gap={12} wrap>
        <Input
          type="number"
          min={0}
          label="Header offset"
          value={headerOffset}
          width={180}
          onChange={setHeaderOffset}
        />
        <Input
          type="number"
          min={0}
          label="Scrollbar offset"
          value={scrollBarOffset}
          width={180}
          onChange={setScrollBarOffset}
        />
      </Flex>
      <Table
        className="mt-4"
        dataSource={members}
        columns={columns}
        pagination={false}
        stickyHeader
        stickyHeaderOffset={Number(headerOffset) || 0}
        stickyScrollBar
        stickyScrollBarOffset={Number(scrollBarOffset) || 0}
      />
    </>
  );
}`),
      },
    },
  },
  render: (args) => <StickyOffsetsTable {...args} />,
};

function StickyOffsetsTable(args: Partial<TableProps<Member>>) {
  const [headerOffset, setHeaderOffset] = useState("64");
  const [scrollBarOffset, setScrollBarOffset] = useState("32");

  return (
    <>
      <Flex gap={12} wrap>
        <Input
          type="number"
          min={0}
          label="Header offset"
          value={headerOffset}
          width={180}
          onChange={setHeaderOffset}
        />
        <Input
          type="number"
          min={0}
          label="Scrollbar offset"
          value={scrollBarOffset}
          width={180}
          onChange={setScrollBarOffset}
        />
      </Flex>
      <Table
        {...args}
        className="mt-4"
        dataSource={largeData.slice(0, 20)}
        columns={fixedColumns}
        pagination={false}
        stickyHeader
        stickyHeaderOffset={Number(headerOffset) || 0}
        stickyScrollBar
        stickyScrollBarOffset={Number(scrollBarOffset) || 0}
      />
    </>
  );
}

export const Loading: Story = {
  parameters: {
    ...storyDescription("components-table-api-compatibility--loading"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table-api-compatibility--loading").docs,
      source: {
        code: withStoryImports(`${formatTableDataSourceDeclaration(members.slice(0, 5))}

const columns: ColumnsType<(typeof members)[number]> = [
  { key: 'name', dataIndex: 'name', title: '이름', width: 150 },
  { key: 'role', dataIndex: 'role', title: '직무', minWidth: 190 },
  { key: 'team', dataIndex: 'team', title: '팀', width: 120 },
  { key: 'projects', dataIndex: 'projects', title: '프로젝트', width: 110 },
];

function LoadingTable() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Flex align="center" gap={8}>
        <Toggle checked={loading} onChange={setLoading} />
        <span>loading: {String(loading)}</span>
      </Flex>
      <Table
        className="mt-4"
        dataSource={members}
        columns={columns}
        pagination={false}
        loading={{ spinning: loading, text: '구성원을 불러오는 중' }}
      />
    </>
  );
}`),
      },
    },
  },
  args: { columns },
  render: (args) => <LoadingTable {...args} />,
};

function LoadingTable(args: TableProps<Member>) {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Flex align="center" gap={8}>
        <Toggle checked={loading} onChange={setLoading} />
        <span>loading: {String(loading)}</span>
      </Flex>
      <Table
        {...args}
        className="mt-4"
        loading={{ spinning: loading, text: "구성원을 불러오는 중" }}
      />
    </>
  );
}

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
        code: withStoryImports(`const columns: ColumnsType<(typeof members)[number]> = [
  { key: 'name', dataIndex: 'name', title: '이름', width: 150 },
  { key: 'role', dataIndex: 'role', title: '직무', minWidth: 190 },
  { key: 'team', dataIndex: 'team', title: '팀', width: 120 },
  { key: 'projects', dataIndex: 'projects', title: '프로젝트', width: 110 },
];

${formatTableVirtualDataSourceDeclaration(100)}

function ImperativeScrollTable() {
  const tableRef = useRef<TableRef>(null);

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => tableRef.current?.scrollTo({ index: 0, align: 'start' })}
        >
          첫 행
        </Button>
        <Button
          variant="secondary"
          onClick={() => tableRef.current?.scrollTo({ key: 'V-75', align: 'center' })}
        >
          75번째 행
        </Button>
        <Button
          variant="secondary"
          onClick={() => tableRef.current?.scrollTo({ index: 99, align: 'end' })}
        >
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
          variant="secondary"
          onClick={() => ref.current?.scrollTo({ index: 0, align: "start" })}
        >
          첫 행
        </Button>
        <Button
          variant="secondary"
          onClick={() => ref.current?.scrollTo({ key: "V-75", align: "center" })}
        >
          75번째 행
        </Button>
        <Button
          variant="secondary"
          onClick={() => ref.current?.scrollTo({ index: 99, align: "end" })}
        >
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
