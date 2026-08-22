import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Avatar } from "../Avatar";
import { Badge } from "./Badge";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { count: 12, children: <Avatar>KT</Avatar> },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "콘텐츠의 알림 개수나 상태를 작고 눈에 띄는 표시로 전달해요.  \n숫자·점·상태 표시와 카드 모서리의 리본을 지원해요.",
      },
      page: () => (
        <div className="badge-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Badge

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`count\` | 배지 안에 표시할 숫자나 내용을 전달해요. | \`ReactNode\` | - |
| \`dot\` | 숫자 대신 작은 점을 표시해요. | \`boolean\` | \`false\` |
| \`overflowCount\` | 이 값을 넘는 숫자를 \`+\`로 축약해요. | \`number\` | \`99\` |
| \`showZero\` | count가 0일 때도 배지를 표시해요. | \`boolean\` | \`false\` |
| \`offset\` | 기본 위치에서 x·y축으로 배지를 이동해요. | \`[number, number]\` | - |
| \`status\` | 상태 점의 의미와 색상을 정해요. | \`'success' \\| 'processing' \\| 'default' \\| 'error' \\| 'warning'\` | - |
| \`text\` | 상태 점 오른쪽에 설명을 표시해요. | \`ReactNode\` | - |
| \`color\` | 배지에 사용자 정의 색상을 적용해요. | \`string\` | - |

### Badge.Ribbon

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`text\` | 리본에 표시할 내용이에요. | \`ReactNode\` | - |
| \`color\` | 리본 배경색을 정해요. | \`string\` | 브랜드 색상 |
| \`placement\` | 리본을 시작 또는 끝 모서리에 배치해요. | \`'start' \\| 'end'\` | \`'end'\` |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Count: Story = {
  parameters: {
    ...storyDescription("components-badge--count"),
    docs: {
      ...storyDescription("components-badge--count").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Badge count={120} overflowCount={99}>\n  <Avatar>KT</Avatar>\n</Badge>`,
        ),
      },
    },
  },
  args: { count: 120, overflowCount: 99 },
};
export const Dot: Story = {
  parameters: {
    ...storyDescription("components-badge--dot"),
    docs: {
      ...storyDescription("components-badge--dot").docs,
      source: { type: "code", code: withStoryImports(`<Badge dot><Avatar>KT</Avatar></Badge>`) },
    },
  },
  args: { dot: true },
};
export const Statuses: Story = {
  parameters: {
    ...storyDescription("components-badge--statuses"),
    docs: {
      ...storyDescription("components-badge--statuses").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex gap-5">\n  <Badge status="success" text="정상" />\n  <Badge status="processing" text="처리 중" />\n  <Badge status="error" text="오류" />\n  <Badge status="warning" text="주의" />\n</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex gap-5">
      <Badge status="success" text="정상" />
      <Badge status="processing" text="처리 중" />
      <Badge status="error" text="오류" />
      <Badge status="warning" text="주의" />
    </div>
  ),
};
export const Ribbon: Story = {
  parameters: {
    ...storyDescription("components-badge--ribbon"),
    docs: {
      ...storyDescription("components-badge--ribbon").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Badge.Ribbon text="NEW">\n  <div className="h-28 w-64 rounded-lg border p-5">리본이 있는 카드</div>\n</Badge.Ribbon>`,
        ),
      },
    },
  },
  render: () => (
    <Badge.Ribbon text="NEW">
      <div className="h-28 w-64 rounded-lg border border-[#f0f0f0] p-5">리본이 있는 카드</div>
    </Badge.Ribbon>
  ),
};
