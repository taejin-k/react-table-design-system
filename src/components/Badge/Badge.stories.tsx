import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Badge } from "./Badge";
import type { BadgeStatusType } from "./Badge.types";

const badgeStatuses: BadgeStatusType[] = ["success", "processing", "default", "error", "warning"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: "콘텐츠의 상태를 작은 점과 텍스트로 전달해요.",
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
| \`status\` | 상태 점의 의미와 색상을 정해요. | [\`BadgeStatusType\`](#badge-status-type) | - |
| \`process\` | 상태 점이 퍼지는 애니메이션을 적용해요. | \`boolean\` | \`false\` |
| \`text\` | 상태 점 오른쪽에 설명을 표시해요. | \`ReactNode\` | - |
| \`color\` | 상태 점에 사용자 정의 색상을 적용해요. | \`string\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="badge-status-type">BadgeStatusType</h3>
          <p>상태 점의 의미를 선택해요.</p>
          <TypeTokens values={badgeStatuses} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Statuses: Story = {
  args: { status: "success" },
  parameters: {
    ...storyDescription("components-badge--statuses"),
    docs: {
      ...storyDescription("components-badge--statuses").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex gap-5">\n  <Badge status="success" text="정상" />\n  <Badge status="processing" text="처리 중" />\n  <Badge status="default" text="기본" />\n  <Badge status="error" text="오류" />\n  <Badge status="warning" text="주의" />\n</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex gap-5">
      <Badge status="success" text="정상" />
      <Badge status="processing" text="처리 중" />
      <Badge status="default" text="기본" />
      <Badge status="error" text="오류" />
      <Badge status="warning" text="주의" />
    </div>
  ),
};

export const Process: Story = {
  args: { status: "success" },
  parameters: {
    ...storyDescription("components-badge--process"),
    docs: {
      ...storyDescription("components-badge--process").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex gap-5">\n  <Badge status="success" process text="정상" />\n  <Badge status="processing" process text="처리 중" />\n  <Badge status="default" process text="기본" />\n  <Badge status="error" process text="오류" />\n  <Badge status="warning" process text="주의" />\n</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex gap-5">
      <Badge status="success" process text="정상" />
      <Badge status="processing" process text="처리 중" />
      <Badge status="default" process text="기본" />
      <Badge status="error" process text="오류" />
      <Badge status="warning" process text="주의" />
    </div>
  ),
};
