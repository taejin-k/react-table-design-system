import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItem, BreadcrumbProps } from "./Breadcrumb.types";

interface BreadcrumbStoryArgs extends BreadcrumbProps {
  itemCount?: number;
  showIcons?: boolean;
  firstColor?: string;
  secondColor?: string;
  currentColor?: string;
}

const handleItemClick = () => alert("Breadcrumb 항목을 클릭했어요.");

const itemExamples = [
  [{ title: "홈" }],
  [{ title: "홈", href: "#" }, { title: "프로젝트" }],
  [
    { title: "홈", href: "#" },
    { title: "프로젝트", onClick: handleItemClick },
    { title: "디자인 시스템" },
  ],
  [
    { title: "홈", href: "#" },
    { title: "프로젝트", onClick: handleItemClick },
    { title: "디자인 시스템", href: "#design-system" },
    { title: "컴포넌트" },
  ],
  [
    { title: "홈", href: "#" },
    { title: "프로젝트", onClick: handleItemClick },
    { title: "디자인 시스템", href: "#design-system" },
    { title: "컴포넌트", onClick: handleItemClick },
    { title: "Breadcrumb" },
  ],
] satisfies BreadcrumbItem[][];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb as ComponentType<BreadcrumbStoryArgs>,
  tags: ["autodocs"],
  argTypes: {
    items: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "페이지 내 현재 위치와 이동 경로를 한눈에 보여줘요.  \n1단계부터 4단계 이상의 경로를 표시할 수 있고, 각 항목에 아이콘·링크·클릭 동작·색상을 설정할 수 있어요.",
      },
      page: () => (
        <div className="breadcrumb-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Breadcrumb

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 왼쪽의 상위 경로부터 현재 위치까지 순서대로 전달해요. | [\`BreadcrumbItem[]\`](#breadcrumb-item) | \`[]\` |
| \`className\` | 외부에서 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h3 id="breadcrumb-item">BreadcrumbItem</h3>
          <p>items 배열의 각 경로 항목에 사용할 속성을 설정해요.</p>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`title\` | 화면에 표시할 경로 이름이에요. 아이콘만 표시할 때는 생략해요. | \`ReactNode\` | - |
| \`href\` | 이동할 주소예요. 값이 있으면 링크와 호버 디자인을 적용해요. | \`string\` | - |
| \`icon\` | 경로 이름 앞에 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`color\` | 해당 항목의 글자와 아이콘 색상이에요. | \`CSSProperties['color']\` | - |
| \`onClick\` | 클릭할 때 실행할 함수예요. 값이 있으면 호버 디자인을 적용해요. | \`MouseEventHandler<HTMLElement>\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<BreadcrumbStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Items: Story = {
  args: { itemCount: 3 },
  argTypes: {
    itemCount: {
      name: "항목 개수",
      control: "select",
      options: [1, 2, 3, 4, 5],
      description: "표시할 경로 항목의 개수를 선택해요.",
    },
  },
  parameters: {
    ...storyDescription("components-breadcrumb--items"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-breadcrumb--items").docs,
      source: {
        type: "code",
        code: withStoryImports(`function BreadcrumbItems() {
  return (
    <div className="grid gap-5">
      <Breadcrumb items={[{ title: '홈' }]} />
      <Breadcrumb items={[{ title: '홈', href: '#' }, { title: '프로젝트' }]} />
      <Breadcrumb
        items={[
          { title: '홈', href: '#' },
          { title: '프로젝트', onClick: () => alert('Breadcrumb 항목을 클릭했어요.') },
          { title: '디자인 시스템' },
        ]}
      />
      <Breadcrumb
        items={[
          { title: '홈', href: '#' },
          { title: '프로젝트', onClick: () => alert('Breadcrumb 항목을 클릭했어요.') },
          { title: '디자인 시스템', href: '#design-system' },
          { title: '컴포넌트' },
        ]}
      />
      <Breadcrumb
        items={[
          { title: '홈', href: '#' },
          { title: '프로젝트', onClick: () => alert('Breadcrumb 항목을 클릭했어요.') },
          { title: '디자인 시스템', href: '#design-system' },
          { title: '컴포넌트', onClick: () => alert('Breadcrumb 항목을 클릭했어요.') },
          { title: 'Breadcrumb' },
        ]}
      />
    </div>
  );
}`),
      },
    },
  },
  render: ({ itemCount = 3 }, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid gap-5">
        {itemExamples.map((items) => (
          <Breadcrumb key={items.length} items={items} />
        ))}
      </div>
    ) : (
      <Breadcrumb items={itemExamples[Math.min(Math.max(itemCount, 1), itemExamples.length) - 1]} />
    ),
};

export const WithIcons: Story = {
  args: { showIcons: true },
  argTypes: {
    showIcons: {
      name: "아이콘 표시",
      control: "boolean",
      description: "각 경로 앞의 아이콘을 표시하거나 숨겨요.",
    },
  },
  parameters: {
    ...storyDescription("components-breadcrumb--with-icons"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-breadcrumb--with-icons").docs,
      source: {
        type: "code",
        code: withStoryImports(`function BreadcrumbWithIcons() {
  return (
    <Breadcrumb
      items={[
        { title: '홈', href: '#', icon: <Icon icon="home-outlined" /> },
        { title: '설정', href: '#settings', icon: <Icon icon="setting" /> },
        { title: '내 정보', icon: <Icon icon="edit" /> },
      ]}
    />
  );
}`),
      },
    },
  },
  render: ({ showIcons }) => (
    <Breadcrumb
      items={[
        { title: "홈", href: "#", icon: showIcons ? <Icon icon="home-outlined" /> : undefined },
        { title: "설정", href: "#settings", icon: showIcons ? <Icon icon="setting" /> : undefined },
        { title: "내 정보", icon: showIcons ? <Icon icon="edit" /> : undefined },
      ]}
    />
  ),
};

export const SingleIcon: Story = {
  parameters: {
    ...storyDescription("components-breadcrumb--single-icon"),
    docs: {
      ...storyDescription("components-breadcrumb--single-icon").docs,
      source: {
        type: "code",
        code: withStoryImports(`function BreadcrumbSingleIcon() {
  return (
    <Breadcrumb
      items={[
        { icon: <Icon icon="home-outlined" />, href: '#' },
        { title: '프로젝트', href: '#projects' },
        { title: '디자인 시스템' },
      ]}
    />
  );
}`),
      },
    },
  },
  render: () => (
    <Breadcrumb
      items={[
        { icon: <Icon icon="home-outlined" />, href: "#" },
        { title: "프로젝트", href: "#projects" },
        { title: "디자인 시스템" },
      ]}
    />
  ),
};

export const ItemColors: Story = {
  args: { firstColor: "#0062df", secondColor: "#4f19c4", currentColor: "#d92626" },
  argTypes: {
    firstColor: { name: "첫 번째 항목 색상", control: "color" },
    secondColor: { name: "두 번째 항목 색상", control: "color" },
    currentColor: { name: "현재 위치 색상", control: "color" },
  },
  parameters: {
    ...storyDescription("components-breadcrumb--item-colors"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-breadcrumb--item-colors").docs,
      source: {
        type: "code",
        code: withStoryImports(`function BreadcrumbItemColors() {
  return (
    <Breadcrumb
      items={[
        {
          title: '홈',
          href: '#',
          icon: <Icon icon="home-outlined" />,
          color: '#0062df',
        },
        {
          title: '프로젝트',
          href: '#projects',
          icon: <Icon icon="folder-outlined" />,
          color: '#4f19c4',
        },
        { title: '현재 위치', icon: <Icon icon="edit" />, color: '#d92626' },
      ]}
    />
  );
}`),
      },
    },
  },
  render: ({ firstColor, secondColor, currentColor }) => (
    <Breadcrumb
      items={[
        { title: "홈", href: "#", icon: <Icon icon="home-outlined" />, color: firstColor },
        {
          title: "프로젝트",
          href: "#projects",
          icon: <Icon icon="folder-outlined" />,
          color: secondColor,
        },
        { title: "현재 위치", icon: <Icon icon="edit" />, color: currentColor },
      ]}
    />
  ),
};
