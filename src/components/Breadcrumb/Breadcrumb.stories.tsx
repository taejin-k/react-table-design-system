import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { Icon } from "../Icon";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbProps, Item } from "./Breadcrumb.types";

interface BreadcrumbStoryArgs extends BreadcrumbProps {
  itemCount?: number;
  showIcons?: boolean;
  firstColor?: string;
  secondColor?: string;
  currentColor?: string;
}

const itemExamples = [
  [{ title: "홈" }],
  [{ title: "홈", href: "#" }, { title: "프로젝트" }],
  [
    { title: "홈", href: "#" },
    { title: "프로젝트", href: "#projects" },
    { title: "디자인 시스템" },
  ],
  [
    { title: "홈", href: "#" },
    { title: "프로젝트", href: "#projects" },
    { title: "디자인 시스템", href: "#design-system" },
    { title: "컴포넌트" },
  ],
  [
    { title: "홈", href: "#" },
    { title: "프로젝트", href: "#projects" },
    { title: "디자인 시스템", href: "#design-system" },
    { title: "컴포넌트", href: "#components" },
    { title: "Breadcrumb" },
  ],
] satisfies Item[][];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb as ComponentType<BreadcrumbStoryArgs>,
  tags: ["autodocs"],
  argTypes: {
    items: { control: false, table: { disable: true } },
    "aria-label": { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "페이지 내 현재 위치와 이동 경로를 한눈에 보여줘요. 1단계부터 4단계 이상의 경로를 표시할 수 있고, 각 항목에 아이콘·링크·색상을 설정할 수 있어요.",
      },
      page: () => (
        <div className="breadcrumb-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Breadcrumb

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 왼쪽의 상위 경로부터 현재 위치까지 순서대로 전달해요. | \`Item[]\` | \`[]\` |

### Item

\`items\` 배열의 각 항목에 아래 속성을 설정할 수 있어요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 항목을 구분하는 고유한 값이에요. | \`string \\| number\` | - |
| \`title\` | 화면에 표시할 경로 이름이에요. | \`ReactNode\` | - |
| \`href\` | 이동할 주소예요. 값이 있으면 링크와 호버 디자인을 적용해요. | \`string\` | - |
| \`icon\` | 경로 이름 앞에 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`color\` | 해당 항목의 글자와 아이콘 색상이에요. | \`CSSProperties['color']\` | - |
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
  },
  render: ({ showIcons }) => (
    <Breadcrumb
      items={[
        { title: "홈", href: "#", icon: showIcons ? <Icon icon="home" /> : undefined },
        { title: "설정", href: "#settings", icon: showIcons ? <Icon icon="setting" /> : undefined },
        { title: "내 정보", icon: showIcons ? <Icon icon="edit" /> : undefined },
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
  },
  render: ({ firstColor, secondColor, currentColor }) => (
    <Breadcrumb
      items={[
        { title: "홈", href: "#", color: firstColor },
        { title: "프로젝트", href: "#projects", color: secondColor },
        { title: "현재 위치", color: currentColor },
      ]}
    />
  ),
};
