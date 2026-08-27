import { useState, type ComponentType } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { formatTableStorySource } from "../../storybook/table-story-source";
import { columns, members, statusFilters, type Member } from "./Table.playground-data";
import { Table } from "./Table";
import type { ColumnsType, Key, TableProps } from "./Table.types";

const meta: Meta<TableProps<Member>> = {
  title: "Components/Table",
  component: Table as ComponentType<TableProps<Member>>,
  tags: ["!autodocs"],
  argTypes: {
    size: { name: "크기", control: "select", options: ["lg", "md", "sm"] },
    bordered: { name: "테두리", control: "boolean" },
    loading: { name: "로딩", control: "boolean" },
    showHeader: { name: "헤더 표시", control: "boolean" },
    rowHoverable: { name: "행 Hover", control: "boolean" },
    dataSource: { control: false, table: { disable: true } },
    columns: { control: false, table: { disable: true } },
    pagination: { control: false, table: { disable: true } },
    rowSelection: { control: false, table: { disable: true } },
    expandable: { control: false, table: { disable: true } },
    scroll: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      source: { transform: formatTableStorySource },
      description: {
        component:
          "행과 열로 구성된 데이터를 정리해서 보여줘요.  \n정렬·필터·선택·확장·페이지네이션과 스크롤 등 데이터 탐색 기능을 설정할 수 있어요.",
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

const tableStoryDataSource = `const members = [
  {
    id: 'M-1001',
    name: '김민준',
    role: 'Product Designer',
    team: 'Design',
    projects: 8,
  },
  // ...나머지 4개 항목
];

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
];`;

const dragColumnStoryDataSource = `const members = [
  {
    id: 'M-1001',
    name: '김민준',
    role: 'Product Designer',
    team: 'Design',
    projects: 8,
  },
  // ...나머지 4개 항목
];

// width가 있는 컬럼은 고정하고, 직무 컬럼은 남은 공간을 사용해요.
const columns = [
  { key: 'name', dataIndex: 'name', title: '이름', width: 150 },
  { key: 'role', dataIndex: 'role', title: '직무', minWidth: 190 },
  { key: 'team', dataIndex: 'team', title: '팀', width: 120 },
  { key: 'projects', dataIndex: 'projects', title: '프로젝트', width: 110 },
];`;

const sorterColumns: ColumnsType<Member> = columns.map((column) =>
  column.key === "name"
    ? { ...column, sorter: (a, b) => a.name.localeCompare(b.name) }
    : column.key === "team"
      ? { ...column, sorter: { compare: (a, b) => a.team.localeCompare(b.team), multiple: 1 } }
      : column.key === "projects"
        ? { ...column, sorter: { compare: (a, b) => a.projects - b.projects, multiple: 2 } }
        : column,
);

const checkboxFixedColumns: ColumnsType<Member> = [
  ...columns.map((column) => (column.key === "role" ? column : { ...column, width: 220 })),
  {
    key: "status",
    dataIndex: "status",
    title: "상태",
    width: 180,
  },
  {
    key: "joinedAt",
    dataIndex: "joinedAt",
    title: "합류일",
    width: 200,
  },
  {
    key: "memberKey",
    dataIndex: "id",
    title: "구성원 ID",
    width: 180,
  },
];

const filterColumns: ColumnsType<Member> = [
  columns[0],
  {
    key: "team",
    dataIndex: "team",
    title: "팀",
    width: 160,
    filterMode: "tree", // 필터 항목을 트리로 표시해요.
    filterSearch: true, // 필터 목록 위에 검색창을 표시해요.
    filters: [
      {
        text: "제품 조직",
        value: "product-group",
        children: [
          { text: "Design", value: "Design" },
          { text: "Product", value: "Product" },
        ],
      },
      {
        text: "기술 조직",
        value: "engineering-group",
        children: [
          { text: "Platform", value: "Platform" },
          { text: "Mobile", value: "Mobile" },
        ],
      },
    ],
    onFilter: (value, record) => record.team === value,
  },
  {
    key: "status",
    dataIndex: "status",
    title: "상태",
    width: 120,
    filters: statusFilters,
    onFilter: (value, record) => record.status === value,
  },
  {
    key: "role",
    dataIndex: "role",
    title: "직무",
    minWidth: 190,
    filters: [
      { text: "디자인", value: "design" },
      { text: "개발", value: "engineering" },
      { text: "기획", value: "product" },
      { text: "데이터", value: "data" },
    ],
    filterMultiple: false, // 라디오로 하나의 값만 선택해요.
    onFilter: (value, record) => {
      if (value === "design") return record.role.includes("Designer");
      if (value === "engineering") return record.role.includes("Engineer");
      if (value === "product") return record.role.includes("Manager");
      return record.role.includes("Analyst");
    },
  },
  {
    key: "projects",
    dataIndex: "projects",
    title: "프로젝트",
    width: 120,
    filters: [
      { text: "5개 이하", value: "low" },
      { text: "6~9개", value: "middle" },
      { text: "10개 이상", value: "high" },
    ],
    filterOnClose: false, // 선택한 뒤 확인을 눌러야 필터를 적용해요.
    onFilter: (value, record) => {
      if (value === "low") return record.projects <= 5;
      if (value === "middle") return record.projects >= 6 && record.projects <= 9;
      return record.projects >= 10;
    },
  },
  {
    key: "joinedAt",
    dataIndex: "joinedAt",
    title: "합류일",
    width: 140,
    filters: [
      { text: "전체 기간", value: "all" },
      { text: "2024년", value: "2024" },
    ],
    defaultFilteredValue: ["all"], // 처음 적용할 필터 값이에요.
    filterResetToDefault: true, // 초기화하면 기본값으로 돌아가요.
    onFilter: (value, record) => value === "all" || record.joinedAt.startsWith(String(value)),
  },
];

export default meta;
type Story = StoryObj<TableProps<Member>>;

export const Basic: Story = {
  args: {
    size: "md",
    bordered: false,
    loading: false,
    showHeader: true,
    rowHoverable: true,
  },
  parameters: {
    ...storyDescription("components-table--basic"),
    controls: {
      disable: false,
      include: ["크기", "테두리", "로딩", "헤더 표시", "행 Hover"],
    },
  },
};

export const Size: Story = {
  args: { size: "sm" },
  parameters: storyDescription("components-table--size"),
};

export const Bordered: Story = {
  args: { bordered: true },
  parameters: storyDescription("components-table--bordered"),
};

export const Alignment: Story = {
  parameters: storyDescription("components-table--alignment"),
  args: {
    bordered: true,
    columns: [
      { key: "name", dataIndex: "name", title: "왼쪽 정렬", width: 150, align: "left" },
      { key: "team", dataIndex: "team", title: "가운데 정렬", minWidth: 190, align: "center" },
      {
        key: "projects",
        dataIndex: "projects",
        title: "오른쪽 정렬",
        width: 110,
        align: "right",
      },
    ],
  },
};

export const Ellipsis: Story = {
  parameters: storyDescription("components-table--ellipsis"),
  args: {
    dataSource: members.slice(0, 5).map((member, index) =>
      index === 0
        ? {
            ...member,
            role: "Global Product Design System, User Experience Research Strategy, Cross-platform Interaction Architecture, Accessibility, and Visual Language Principal Designer",
          }
        : member,
    ),
    columns: columns.map((column) =>
      column.key === "role" ? { ...column, ellipsis: true } : column,
    ),
  },
};

export const Sorter: Story = {
  parameters: {
    ...storyDescription("components-table--sorter"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table--sorter").docs,
      source: {
        code: withStoryImports(`const members = [
  { id: 'M-1001', name: '김민준', role: 'Product Designer', team: 'Design', projects: 8 },
  // ...나머지 4개 항목
];

const columns = [
  {
    key: 'name',
    dataIndex: 'name',
    title: '이름',
    // 하나의 컬럼만 정렬할 때는 비교 함수를 바로 전달해요.
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    key: 'role',
    dataIndex: 'role',
    title: '직무',
  },
  {
    key: 'team',
    dataIndex: 'team',
    title: '팀',
    sorter: {
      compare: (a, b) => a.team.localeCompare(b.team),
      // 여러 컬럼을 함께 정렬할 때 multiple을 사용해요.
      // 생략하면 한 번에 하나의 컬럼만 정렬돼요.
      multiple: 1,
    },
  },
  {
    key: 'projects',
    dataIndex: 'projects',
    title: '프로젝트',
    sorter: {
      compare: (a, b) => a.projects - b.projects,
      // multiple 숫자가 클수록 먼저 정렬해요.
      multiple: 2,
    },
  },
];

function SorterTable() {
  return (
    <Table
      dataSource={members}
      columns={columns}
      pagination={false}
    />
  );
}`),
      },
    },
  },
  args: { columns: sorterColumns },
};

export const Filter: Story = {
  parameters: {
    ...storyDescription("components-table--filter"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table--filter").docs,
      source: {
        code: withStoryImports(`const members = [
  {
    id: 'M-1001',
    name: '김민준',
    role: 'Product Designer',
    team: 'Design',
    status: '활성',
    projects: 8,
    joinedAt: '2023-02-14',
  },
  // ...나머지 4개 항목
];

const teamFilters = [
  {
    text: '제품 조직',
    value: 'product-group',
    children: [
      { text: 'Design', value: 'Design' },
      { text: 'Product', value: 'Product' },
    ],
  },
  {
    text: '기술 조직',
    value: 'engineering-group',
    children: [
      { text: 'Platform', value: 'Platform' },
      { text: 'Mobile', value: 'Mobile' },
    ],
  },
];

const statusFilters = [
  { text: '활성', value: '활성' },
  { text: '휴가', value: '휴가' },
  { text: '대기', value: '대기' },
];

const roleFilters = [
  { text: '디자인', value: 'design' },
  { text: '개발', value: 'engineering' },
  { text: '기획', value: 'product' },
  { text: '데이터', value: 'data' },
];

const projectFilters = [
  { text: '5개 이하', value: 'low' },
  { text: '6~9개', value: 'middle' },
  { text: '10개 이상', value: 'high' },
];

const joinedAtFilters = [
  { text: '전체 기간', value: 'all' },
  { text: '2024년', value: '2024' },
];

const columns = [
  { key: 'name', dataIndex: 'name', title: '이름' },
  {
    key: 'team',
    dataIndex: 'team',
    title: '팀',
    filters: teamFilters,
    filterMode: 'tree', // 필터 항목을 트리로 표시해요.
    filterSearch: true, // 필터 목록 위에 검색창을 표시해요.
    onFilter: (value, record) => record.team === value,
  },
  {
    key: 'status',
    dataIndex: 'status',
    title: '상태',
    filters: statusFilters, // 기본값이 다중 선택이라 일반 체크박스를 표시해요.
    onFilter: (value, record) => record.status === value,
  },
  {
    key: 'role',
    dataIndex: 'role',
    title: '직무',
    filters: roleFilters,
    filterMultiple: false, // 라디오로 하나의 값만 선택해요.
    onFilter: (value, record) => {
      if (value === 'design') return record.role.includes('Designer');
      if (value === 'engineering') return record.role.includes('Engineer');
      if (value === 'product') return record.role.includes('Manager');
      return record.role.includes('Analyst');
    },
  },
  {
    key: 'projects',
    dataIndex: 'projects',
    title: '프로젝트',
    filters: projectFilters,
    filterOnClose: false, // 선택한 뒤 확인을 눌러야 필터를 적용해요.
    onFilter: (value, record) => {
      if (value === 'low') return record.projects <= 5;
      if (value === 'middle') return record.projects >= 6 && record.projects <= 9;
      return record.projects >= 10;
    },
  },
  {
    key: 'joinedAt',
    dataIndex: 'joinedAt',
    title: '합류일',
    filters: joinedAtFilters,
    defaultFilteredValue: ['all'], // 처음 적용할 필터 값이에요.
    filterResetToDefault: true, // 초기화하면 기본값으로 돌아가요.
    onFilter: (value, record) =>
      value === 'all' || record.joinedAt.startsWith(String(value)),
  },
];

function FilterTable() {
  return (
    <Table
      dataSource={members}
      columns={columns}
      pagination={false}
    />
  );
}`),
      },
    },
  },
  args: { columns: filterColumns },
};

export const Checkbox: Story = {
  parameters: {
    ...storyDescription("components-table--checkbox"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table--checkbox").docs,
      source: {
        code: withStoryImports(`${tableStoryDataSource}

function CheckboxTable() {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  return (
    <Table
      dataSource={members}
      columns={columns}
      pagination={false}
      rowSelection={{
        type: 'checkbox',
        selectedKeys,
        onChange: setSelectedKeys,
      }}
    />
  );
}`),
      },
    },
  },
  render: (args) => <CheckboxStory {...args} />,
};

export const CheckboxWidth: Story = {
  parameters: storyDescription("components-table--checkbox-width"),
  args: {
    rowSelection: {
      type: "checkbox",
      columnWidth: 80,
    },
  },
};

export const CheckboxDisabled: Story = {
  parameters: storyDescription("components-table--checkbox-disabled"),
  args: {
    rowSelection: {
      type: "checkbox",
      getCheckboxProps: (record) => ({
        disabled: record.status === "대기",
      }),
    },
  },
};

export const CheckboxFixed: Story = {
  parameters: storyDescription("components-table--checkbox-fixed"),
  args: {
    columns: checkboxFixedColumns,
    rowSelection: { type: "checkbox", fixed: true },
  },
};

export const AllCheckboxHidden: Story = {
  parameters: storyDescription("components-table--all-checkbox-hidden"),
  args: { rowSelection: { type: "checkbox", hideSelectAll: true } },
};

export const CheckboxDefault: Story = {
  parameters: storyDescription("components-table--checkbox-default"),
  args: {
    rowSelection: {
      type: "checkbox",
      defaultSelectedKeys: ["M-1001", "M-1002"],
    },
  },
};

export const Radio: Story = {
  parameters: {
    ...storyDescription("components-table--radio"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table--radio").docs,
      source: {
        code: withStoryImports(`${tableStoryDataSource}

function RadioTable() {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  return (
    <Table
      dataSource={members}
      columns={columns}
      pagination={false}
      rowSelection={{
        type: 'radio',
        selectedKeys,
        onChange: setSelectedKeys,
      }}
    />
  );
}`),
      },
    },
  },
  render: (args) => <RadioStory {...args} />,
};

function CheckboxStory(args: TableProps<Member>) {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  return (
    <Table<Member>
      {...args}
      rowSelection={{
        type: "checkbox",
        selectedKeys,
        onChange: setSelectedKeys,
      }}
    />
  );
}

function RadioStory(args: TableProps<Member>) {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  return (
    <Table<Member>
      {...args}
      rowSelection={{
        type: "radio",
        selectedKeys,
        onChange: setSelectedKeys,
      }}
    />
  );
}

export const DragRowSorting: Story = {
  name: "Drag Row",
  parameters: {
    ...storyDescription("components-table--drag-row-sorting"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table--drag-row-sorting").docs,
      source: {
        code: withStoryImports(`${tableStoryDataSource}

function DragRowTable() {
  const [rows, setRows] = useState(members);

  return (
    <Table
      dataSource={rows}
      columns={columns}
      pagination={false}
      rowDrag={{
        onChange: (nextRows) => {
          setRows(nextRows);

          // 필요하면 여기서 변경된 순서를 API로 저장해요.
        },
      }}
    />
  );
}`),
      },
    },
  },
  render: () => <DragStory />,
};
export const DragColumnSorting: Story = {
  name: "Drag Column",
  parameters: {
    ...storyDescription("components-table--drag-column-sorting"),
    tableSource: false,
    docs: {
      ...storyDescription("components-table--drag-column-sorting").docs,
      source: {
        code: withStoryImports(`${dragColumnStoryDataSource}

function DragColumnTable() {
  const [currentColumns, setCurrentColumns] = useState(columns);

  return (
    <Table
      dataSource={members}
      columns={currentColumns}
      pagination={false}
      columnDrag={{
        onChange: (nextColumns) => {
          setCurrentColumns(nextColumns);

          // 필요하면 여기서 변경된 열 순서를 API로 저장해요.
        },
      }}
    />
  );
}`),
      },
    },
  },
  render: () => <DragColumnStory />,
};

function DragStory() {
  const [rows, setRows] = useState(members.slice(0, 5));

  return (
    <Table<Member>
      dataSource={rows}
      columns={columns}
      pagination={false}
      rowDrag={{ onChange: setRows }}
    />
  );
}

function DragColumnStory() {
  const [currentColumns, setCurrentColumns] = useState(columns);

  return (
    <Table<Member>
      dataSource={members.slice(0, 5)}
      columns={currentColumns}
      pagination={false}
      columnDrag={{ onChange: setCurrentColumns }}
    />
  );
}
