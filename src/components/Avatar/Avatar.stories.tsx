import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Icon } from "../Icon";
import { Input } from "../Input";
import { Avatar } from "./Avatar";
import type { AvatarShapeType, AvatarSizeType, AvatarTypeType } from "./Avatar.types";

const avatarSizes: AvatarSizeType[] = ["large", "medium", "small"];
const avatarShapes: AvatarShapeType[] = ["circle", "square"];
const avatarTypes: AvatarTypeType[] = ["default", "label"];

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
          "사용자나 대상을 이미지, 아이콘 또는 짧은 문자로 표현해요.  \n크기와 모양을 설정하고 여러 아바타를 그룹으로 묶을 수 있어요.",
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
| \`src\` | 아바타 이미지 주소 또는 이미지 노드를 전달해요. | \`ReactNode\` | - |
| \`icon\` | 이미지 대신 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`color\` | 아바타 배경색을 설정해요. | \`CSSProperties['backgroundColor']\` | \`#bfbfbf\` |
| \`type\` | 기본형 또는 라벨형을 정해요. | [\`AvatarTypeType\`](#avatar-type-type) | \`default\` |
| \`size\` | 아바타 크기를 정해요. | [\`AvatarSizeType\`](#avatar-size-type) | \`medium\` |
| \`shape\` | 원형 또는 사각형 모양을 정해요. | [\`AvatarShapeType\`](#avatar-shape-type) | \`circle\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |

### Avatar.Group

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`maxCount\` | 표시할 최대 개수를 정해요. | \`number\` | - |
| \`size\` | 그룹 안 아바타의 공통 크기를 정해요. | [\`AvatarSizeType\`](#avatar-size-type) | \`medium\` |
| \`shape\` | 그룹 안 아바타의 공통 모양을 정해요. | [\`AvatarShapeType\`](#avatar-shape-type) | \`circle\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="avatar-type-type">AvatarTypeType</h3>
          <p>기본 아바타 또는 텍스트가 함께 표시되는 라벨형을 선택해요.</p>
          <TypeTokens values={avatarTypes} />
          <h3 id="avatar-size-type">AvatarSizeType</h3>
          <p>미리 정한 아바타 크기를 사용해요.</p>
          <TypeTokens values={avatarSizes} />
          <h3 id="avatar-shape-type">AvatarShapeType</h3>
          <p>아바타 모양을 선택해요.</p>
          <TypeTokens values={avatarShapes} />
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

export const Text: Story = {
  parameters: {
    ...storyDescription("components-avatar--text"),
    docs: {
      ...storyDescription("components-avatar--text").docs,
      source: {
        type: "code",
        code: withStoryImports(`function AvatarText() {
  const [text, setText] = useState('김');

  return (
    <div className="flex flex-col items-start gap-3">
      <Input
        label="아바타 글자"
        value={text}
        width={160}
        onChange={setText}
      />
      <div className="flex items-center gap-3">
        <Avatar size="small">{text}</Avatar>
        <Avatar size="medium">{text}</Avatar>
        <Avatar size="large">{text}</Avatar>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: () => <AvatarTextExample />,
};

function AvatarTextExample() {
  const [text, setText] = useState("김");

  return (
    <div className="flex flex-col items-start gap-3">
      <Input label="아바타 글자" value={text} width={160} onChange={setText} />
      <div className="flex items-center gap-3">
        <Avatar size="small">{text}</Avatar>
        <Avatar size="medium">{text}</Avatar>
        <Avatar size="large">{text}</Avatar>
      </div>
    </div>
  );
}

export const Image: Story = {
  parameters: {
    ...storyDescription("components-avatar--image"),
    docs: {
      ...storyDescription("components-avatar--image").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Avatar src="https://api.dicebear.com/9.x/miniavs/svg?seed=1" />`),
      },
    },
  },
  render: () => <Avatar src="https://api.dicebear.com/9.x/miniavs/svg?seed=1" />,
};

export const ImageError: Story = {
  parameters: {
    ...storyDescription("components-avatar--image-error"),
    docs: {
      ...storyDescription("components-avatar--image-error").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="flex items-center gap-3">
  <Avatar size="small" src="/avatar-image-not-found.png" />
  <Avatar size="medium" src="/avatar-image-not-found.png" />
  <Avatar size="large" src="/avatar-image-not-found.png" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar size="small" src="/avatar-image-not-found.png" />
      <Avatar size="medium" src="/avatar-image-not-found.png" />
      <Avatar size="large" src="/avatar-image-not-found.png" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-avatar--sizes"),
    docs: {
      ...storyDescription("components-avatar--sizes").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex items-center gap-3">
  <Avatar size="small">S</Avatar>
  <Avatar size="medium">M</Avatar>
  <Avatar size="large">L</Avatar>
</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar size="small">S</Avatar>
      <Avatar size="medium">M</Avatar>
      <Avatar size="large">L</Avatar>
    </div>
  ),
};

export const TypesSizesAndShapes: Story = {
  parameters: {
    ...storyDescription("components-avatar--types-sizes-and-shapes"),
    docs: {
      ...storyDescription("components-avatar--types-sizes-and-shapes").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-col items-start gap-4">
  <div className="flex flex-wrap items-center gap-3">
    <Avatar type="default" size="small" shape="circle">M</Avatar>
    <Avatar type="default" size="medium" shape="circle">M</Avatar>
    <Avatar type="default" size="large" shape="circle">M</Avatar>
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <Avatar type="default" size="small" shape="square">M</Avatar>
    <Avatar type="default" size="medium" shape="square">M</Avatar>
    <Avatar type="default" size="large" shape="square">M</Avatar>
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <Avatar type="label" size="small" shape="circle" src="https://api.dicebear.com/9.x/miniavs/svg?seed=1">manhat</Avatar>
    <Avatar type="label" size="medium" shape="circle" src="https://api.dicebear.com/9.x/miniavs/svg?seed=1">manhat</Avatar>
    <Avatar type="label" size="large" shape="circle" src="https://api.dicebear.com/9.x/miniavs/svg?seed=1">manhat</Avatar>
  </div>
  <div className="flex flex-wrap items-center gap-3">
    <Avatar type="label" size="small" shape="square" src="https://api.dicebear.com/9.x/miniavs/svg?seed=1">manhat</Avatar>
    <Avatar type="label" size="medium" shape="square" src="https://api.dicebear.com/9.x/miniavs/svg?seed=1">manhat</Avatar>
    <Avatar type="label" size="large" shape="square" src="https://api.dicebear.com/9.x/miniavs/svg?seed=1">manhat</Avatar>
  </div>
</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar type="default" size="small" shape="circle">
          M
        </Avatar>
        <Avatar type="default" size="medium" shape="circle">
          M
        </Avatar>
        <Avatar type="default" size="large" shape="circle">
          M
        </Avatar>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Avatar type="default" size="small" shape="square">
          M
        </Avatar>
        <Avatar type="default" size="medium" shape="square">
          M
        </Avatar>
        <Avatar type="default" size="large" shape="square">
          M
        </Avatar>
      </div>
      {avatarShapes.map((shape) => (
        <div key={shape} className="flex flex-wrap items-center gap-3">
          {(["small", "medium", "large"] as const).map((size) => (
            <Avatar
              key={`${shape}-${size}`}
              type="label"
              size={size}
              shape={shape}
              src="https://api.dicebear.com/9.x/miniavs/svg?seed=1"
            >
              manhat
            </Avatar>
          ))}
        </div>
      ))}
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
          `<Avatar.Group maxCount={3}>
  <Avatar>KIM</Avatar>
  <Avatar color="#0062df">LEE</Avatar>
  <Avatar color="#52c41a">PARK</Avatar>
  <Avatar color="#722ed1">CHOI</Avatar>
</Avatar.Group>`,
        ),
      },
    },
  },
  render: () => (
    <Avatar.Group maxCount={3}>
      <Avatar>KIM</Avatar>
      <Avatar color="#0062df">LEE</Avatar>
      <Avatar color="#52c41a">PARK</Avatar>
      <Avatar color="#722ed1">CHOI</Avatar>
    </Avatar.Group>
  ),
};
