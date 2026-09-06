import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItem, BreadcrumbProps } from "./Breadcrumb.types";

const colorTokenTypeHref = `${typeof window === "undefined" ? "" : window.location.origin}/iframe.html?id=components-color--documentation&viewMode=docs#color-token-type`;

interface BreadcrumbStoryArgs extends BreadcrumbProps {
  showIcons?: boolean;
  firstColor?: BreadcrumbItem["color"];
  secondColor?: BreadcrumbItem["color"];
  currentColor?: BreadcrumbItem["color"];
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
    controls: { disable: false, include: ["아이콘 표시"] },
    docs: {
      description: {
        component:
          "Breadcrumb는 홈부터 현재 페이지까지의 이동 경로를 표시해요.  \n각 경로에 이름·아이콘·링크·클릭 동작과 색상을 지정할 수 있어요.",
      },
      page: () => (
        <div className="breadcrumb-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Breadcrumb

Breadcrumb는 현재 페이지까지 이어지는 이동 경로를 표시해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 왼쪽의 상위 경로부터 현재 위치까지 순서대로 전달해요. | [\`BreadcrumbItem[]\`](#breadcrumb-item) | \`[]\` |
| \`className\` | 외부에서 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h3 id="breadcrumb-item">BreadcrumbItem</h3>
          <p>BreadcrumbItem은 이동 경로 하나에 표시할 내용과 동작을 정의해요.</p>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`title\` | 화면에 표시할 경로 이름이에요. 아이콘만 표시할 때는 생략해요. | \`ReactNode\` | - |
| \`href\` | 이동할 주소예요. 값이 있으면 링크와 호버 디자인을 적용해요. | \`string\` | - |
| \`icon\` | 경로 이름 앞에 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`color\` | 이 경로 항목의 글자와 아이콘 색상을 지정해요. | [\`ColorTokenType\`](${colorTokenTypeHref}) \\| \`CSSProperties['color']\` | - |
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
  parameters: {
    ...storyDescription("components-breadcrumb--items"),
    controls: { disable: true },
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
  render: () => (
    <div className="grid gap-5">
      {itemExamples.map((items) => (
        <Breadcrumb key={items.length} items={items} />
      ))}
    </div>
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
    controls: { disable: false, include: ["아이콘 표시"] },
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
    controls: { disable: true },
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
  args: { firstColor: "#0062df", secondColor: "#4f19c4", currentColor: "danger" },
  argTypes: {
    firstColor: { name: "첫 번째 항목 색상", control: "text" },
    secondColor: { name: "두 번째 항목 색상", control: "text" },
    currentColor: { name: "현재 위치 색상", control: "text" },
  },
  parameters: {
    ...storyDescription("components-breadcrumb--item-colors"),
    controls: {
      disable: false,
      include: ["첫 번째 항목 색상", "두 번째 항목 색상", "현재 위치 색상"],
    },
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
        { title: '현재 위치', icon: <Icon icon="edit" />, color: 'danger' },
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
