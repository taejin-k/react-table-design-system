import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Avatar } from "./Avatar";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "사용자나 대상을 이미지, 아이콘 또는 짧은 문자로 표현해요.  \n크기·모양·반응형 크기를 설정하고 여러 아바타를 그룹으로 묶을 수 있어요.",
      },
      page: () => (
        <div className="avatar-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Avatar

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`src\` | 아바타 이미지 주소 또는 이미지 노드를 전달해요. | \`string \\| ReactNode\` | - |
| \`icon\` | 이미지 대신 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`size\` | 아바타 크기 또는 반응형 크기를 정해요. | \`number \\| 'large' \\| 'medium' \\| 'small' \\| ResponsiveSize\` | \`'medium'\` |
| \`shape\` | 원형 또는 사각형 모양을 정해요. | \`'circle' \\| 'square'\` | \`'circle'\` |
| \`gap\` | 문자와 가장자리 사이의 최소 간격이에요. | \`number\` | \`4\` |
| \`onError\` | 이미지 로드에 실패했을 때 대체 표시 여부를 정해요. | \`() => boolean\` | - |

### Avatar.Group

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`max\` | 표시할 최대 개수와 초과 표시 스타일을 정해요. | \`{ count?: number; style?: CSSProperties }\` | - |
| \`size\` | 그룹 안 아바타의 공통 크기를 정해요. | \`AvatarSize\` | \`'medium'\` |
| \`shape\` | 그룹 안 아바타의 공통 모양을 정해요. | \`'circle' \\| 'square'\` | \`'circle'\` |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-avatar--basic"),
    docs: {
      ...storyDescription("components-avatar--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex items-center gap-3">\n  <Avatar size="small">S</Avatar>\n  <Avatar>M</Avatar>\n  <Avatar size="large" icon={<Icon icon="user-outlined" />} />\n  <Avatar shape="square">KT</Avatar>\n</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar size="small">S</Avatar>
      <Avatar>M</Avatar>
      <Avatar size="large" icon={<Icon icon="user-outlined" />} />
      <Avatar shape="square">KT</Avatar>
    </div>
  ),
};
export const Group: Story = {
  parameters: {
    ...storyDescription("components-avatar--group"),
    docs: {
      ...storyDescription("components-avatar--group").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Avatar.Group max={{ count: 3 }}>\n  <Avatar>A</Avatar>\n  <Avatar style={{ background: '#0062df' }}>B</Avatar>\n  <Avatar style={{ background: '#52c41a' }}>C</Avatar>\n  <Avatar style={{ background: '#722ed1' }}>D</Avatar>\n</Avatar.Group>`,
        ),
      },
    },
  },
  render: () => (
    <Avatar.Group max={{ count: 3 }}>
      <Avatar>A</Avatar>
      <Avatar style={{ background: "#0062df" }}>B</Avatar>
      <Avatar style={{ background: "#52c41a" }}>C</Avatar>
      <Avatar style={{ background: "#722ed1" }}>D</Avatar>
    </Avatar.Group>
  ),
};
