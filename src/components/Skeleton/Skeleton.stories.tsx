import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Skeleton } from "./Skeleton";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: { active: true, avatar: true, paragraph: { rows: 3 } },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "콘텐츠를 불러오는 동안 실제 레이아웃과 비슷한 자리 표시자를 보여줘요.  \n아바타·제목·문단 조합과 버튼·입력창·이미지·사용자 정의 노드를 지원해요.",
      },
      page: () => (
        <div className="skeleton-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Skeleton

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`active\` | 자리 표시자에 흐르는 애니메이션을 적용해요. | \`boolean\` | \`false\` |
| \`loading\` | 자리 표시자와 실제 콘텐츠 중 표시할 대상을 정해요. | \`boolean\` | \`true\` |
| \`avatar\` | 아바타 자리 표시자를 표시하고 세부 모양을 정해요. | \`boolean \\| SkeletonElementProps\` | \`false\` |
| \`title\` | 제목 자리 표시자를 표시하고 너비를 정해요. | \`boolean \\| { width?: string \\| number }\` | \`true\` |
| \`paragraph\` | 문단의 행 수와 각 행 너비를 정해요. | \`boolean \\| { rows?: number; width?: string \\| number \\| Array }\` | \`true\` |
| \`round\` | 제목과 문단 모서리를 더 둥글게 표시해요. | \`boolean\` | \`false\` |

### Skeleton Element

\`Skeleton.Avatar\`, \`Skeleton.Button\`, \`Skeleton.Input\`, \`Skeleton.Image\`, \`Skeleton.Node\`가 같은 공통 API를 사용해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`active\` | 흐르는 애니메이션을 적용해요. | \`boolean\` | \`false\` |
| \`block\` | 부모 너비를 모두 채워요. | \`boolean\` | \`false\` |
| \`size\` | 요소 크기를 정해요. | \`number \\| 'large' \\| 'medium' \\| 'small'\` | \`'medium'\` |
| \`shape\` | 요소 모양을 정해요. | \`'circle' \\| 'round' \\| 'square' \\| 'default'\` | 요소별 기본값 |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-skeleton--basic"),
    docs: {
      ...storyDescription("components-skeleton--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Skeleton active avatar paragraph={{ rows: 3 }} />`),
      },
    },
  },
};
export const Elements: Story = {
  parameters: {
    ...storyDescription("components-skeleton--elements"),
    docs: {
      ...storyDescription("components-skeleton--elements").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex items-center gap-3">\n  <Skeleton.Avatar active />\n  <Skeleton.Button active />\n  <Skeleton.Input active style={{ width: 180 }} />\n  <Skeleton.Image active />\n</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton.Avatar active />
      <Skeleton.Button active />
      <Skeleton.Input active style={{ width: 180 }} />
      <Skeleton.Image active />
    </div>
  ),
};
export const Loaded: Story = {
  args: { loading: false, children: <div>불러온 콘텐츠</div> },
  parameters: {
    ...storyDescription("components-skeleton--loaded"),
    docs: {
      ...storyDescription("components-skeleton--loaded").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Skeleton loading={false} active>\n  <div>불러온 콘텐츠</div>\n</Skeleton>`,
        ),
      },
    },
  },
};
