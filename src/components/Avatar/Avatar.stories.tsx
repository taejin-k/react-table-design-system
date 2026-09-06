import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";
import { colorTokenNames } from "../../color-tokens";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Input } from "../Input";
import { Avatar } from "./Avatar";
import type { AvatarShapeType, AvatarSizeType } from "./Avatar.types";

const avatarSizes: AvatarSizeType[] = ["md", "lg"];
const avatarShapes: AvatarShapeType[] = ["circle", "square"];
const avatarImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='18' fill='%23d9eaff'/%3E%3Ccircle cx='40' cy='31' r='15' fill='%23ffd19a'/%3E%3Cpath d='M24 29c1-14 29-18 32 1-8-3-19-6-32-1Z' fill='%23502b12'/%3E%3Cpath d='M16 80c1-20 12-31 24-31s23 11 24 31' fill='%230062df'/%3E%3Ccircle cx='34' cy='32' r='1.5' fill='%23111'/%3E%3Ccircle cx='46' cy='32' r='1.5' fill='%23111'/%3E%3Cpath d='M35 40c3 3 7 3 10 0' fill='none' stroke='%23b5534c' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";
const invalidAvatarImage = "data:image/png;base64,invalid";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    children: { name: "텍스트", control: "text" },
    size: { name: "크기", control: "select", options: avatarSizes },
    shape: { name: "모양", control: "select", options: avatarShapes },
    color: { name: "배경색", control: "select", options: colorTokenNames },
    showLabel: { name: "라벨 표시", control: "boolean" },
    labelWidth: {
      name: "라벨 너비",
      control: { type: "number", min: 0, step: 1 },
      if: { arg: "showLabel", truthy: true },
    },
    preview: { name: "이미지 미리보기", control: "boolean" },
    src: { control: false, table: { disable: true } },
    icon: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "Avatar는 사용자 프로필이나 항목을 이미지·아이콘·짧은 문자로 표시해요.  \n크기와 모양을 지정하고 여러 Avatar를 그룹으로 묶을 수 있어요.",
      },
      page: () => (
        <div className="avatar-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Avatar

Avatar는 사용자 프로필이나 항목을 이미지·아이콘·짧은 문자로 표시해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`src\` | 아바타 이미지 주소 또는 이미지 노드를 전달해요. | \`ReactNode\` | - |
| \`icon\` | 이미지 대신 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`color\` | 디자인 토큰으로 배경색을 설정해요. | [\`ColorTokenType\`](./iframe.html?id=components-color--documentation&viewMode=docs#color-token-type) | 라벨: \`primary\`, 그 외: \`hover\` |
| \`showLabel\` | 아바타 옆에 라벨을 표시해요. | \`boolean\` | \`false\` |
| \`labelWidth\` | 라벨 너비를 px로 정하고 넘치는 텍스트를 말줄임해요. | \`number\` | 텍스트 너비 |
| \`size\` | 아바타 크기를 정해요. | [\`AvatarSizeType\`](#avatar-size-type) | \`md\` |
| \`shape\` | 원형 또는 사각형 모양을 정해요. | [\`AvatarShapeType\`](#avatar-shape-type) | \`circle\` |
| \`preview\` | 이미지를 클릭해 상세 보기를 열어요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |

### Avatar.Group

Avatar.Group은 여러 Avatar를 겹쳐 하나의 그룹으로 표시해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`maxCount\` | 표시할 최대 개수를 정해요. | \`number\` | - |
| \`size\` | 그룹 안 아바타의 공통 크기를 정해요. | [\`AvatarSizeType\`](#avatar-size-type) | \`md\` |
| \`shape\` | 그룹 안 아바타의 공통 모양을 정해요. | [\`AvatarShapeType\`](#avatar-shape-type) | \`circle\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="avatar-size-type">AvatarSizeType</h3>
          <p>AvatarSizeType은 Avatar의 높이와 너비를 구분해요.</p>
          <TypeTokens values={avatarSizes} />
          <h3 id="avatar-shape-type">AvatarShapeType</h3>
          <p>AvatarShapeType은 Avatar의 원형과 사각형 모양을 구분해요.</p>
          <TypeTokens values={avatarShapes} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    color: undefined,
    children: "MD",
    size: "md",
    shape: "circle",
    showLabel: false,
    preview: false,
  },
  parameters: {
    ...storyDescription("components-avatar--basic"),
    controls: {
      disable: false,
      include: ["텍스트", "크기", "모양", "배경색", "라벨 표시", "라벨 너비"],
    },
    docs: {
      ...storyDescription("components-avatar--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Avatar>MD</Avatar>`),
      },
    },
  },
};

export const Sizes: Story = {
  args: { color: undefined, shape: "circle", showLabel: false },
  parameters: {
    ...storyDescription("components-avatar--sizes"),
    controls: { disable: false, include: ["모양", "배경색", "라벨 표시"] },
    docs: {
      ...storyDescription("components-avatar--sizes").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="flex items-center gap-3">
  <Avatar size="md">MD</Avatar>
  <Avatar size="lg">LG</Avatar>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} size="md">
        MD
      </Avatar>
      <Avatar {...args} size="lg">
        LG
      </Avatar>
    </div>
  ),
};

export const Shapes: Story = {
  args: { color: undefined, showLabel: false },
  parameters: {
    ...storyDescription("components-avatar--shapes"),
    controls: { disable: false, include: ["배경색", "라벨 표시"] },
    docs: {
      ...storyDescription("components-avatar--shapes").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="flex flex-col items-start gap-3">
  <div className="flex items-center gap-3">
    <Avatar size="md" shape="circle">MD</Avatar>
    <Avatar size="lg" shape="circle">LG</Avatar>
  </div>
  <div className="flex items-center gap-3">
    <Avatar size="md" shape="square">MD</Avatar>
    <Avatar size="lg" shape="square">LG</Avatar>
  </div>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      {avatarShapes.map((shape) => (
        <div key={shape} className="flex items-center gap-3">
          {avatarSizes.map((size) => (
            <Avatar {...args} key={size} size={size} shape={shape}>
              {size.toUpperCase()}
            </Avatar>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Color: Story = {
  args: { size: "md", shape: "circle", showLabel: false },
  parameters: {
    ...storyDescription("components-avatar--color"),
    controls: { disable: false, include: ["크기", "모양", "라벨 표시"] },
    docs: {
      ...storyDescription("components-avatar--color").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="flex flex-col items-start gap-3">
  <div className="flex items-center gap-3">
    <Avatar color="primary">K</Avatar>
    <Avatar color="success">L</Avatar>
    <Avatar color="warning">P</Avatar>
    <Avatar color="purple">C</Avatar>
  </div>
  <div className="flex items-center gap-3">
    <Avatar color="primary" showLabel>김민준</Avatar>
    <Avatar color="success" showLabel>이서연</Avatar>
    <Avatar color="warning" showLabel>박지호</Avatar>
    <Avatar color="purple" showLabel>최유진</Avatar>
  </div>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <Avatar {...args} color="primary">
          K
        </Avatar>
        <Avatar {...args} color="success">
          L
        </Avatar>
        <Avatar {...args} color="warning">
          P
        </Avatar>
        <Avatar {...args} color="purple">
          C
        </Avatar>
      </div>
      <div className="flex items-center gap-3">
        <Avatar color="primary" showLabel>
          김민준
        </Avatar>
        <Avatar color="success" showLabel>
          이서연
        </Avatar>
        <Avatar color="warning" showLabel>
          박지호
        </Avatar>
        <Avatar color="purple" showLabel>
          최유진
        </Avatar>
      </div>
    </div>
  ),
};

export const Text: Story = {
  args: { color: undefined, size: "md", shape: "circle" },
  parameters: {
    ...storyDescription("components-avatar--text"),
    controls: { disable: false, include: ["크기", "모양", "배경색"] },
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
        <Avatar>{text}</Avatar>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <AvatarTextExample {...args} />,
};

function AvatarTextExample(args: ComponentProps<typeof Avatar>) {
  const [text, setText] = useState("김");

  return (
    <div className="flex flex-col items-start gap-3">
      <Input label="아바타 글자" value={text} width={160} onChange={setText} />
      <div className="flex items-center gap-3">
        <Avatar {...args}>{text}</Avatar>
      </div>
    </div>
  );
}

function AvatarLabelTextExample(args: ComponentProps<typeof Avatar>) {
  const [text, setText] = useState("긴 라벨 텍스트를 입력해보세요");
  const [width, setWidth] = useState("180");

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Input label="라벨 텍스트" value={text} width={240} onChange={setText} />
        <Input
          type="number"
          min={80}
          label="라벨 너비"
          value={width}
          width={160}
          onChange={setWidth}
        />
      </div>
      <Avatar {...args} showLabel labelWidth={Number(width) || 180} src={avatarImage}>
        {text}
      </Avatar>
    </div>
  );
}

export const LabelText: Story = {
  args: { color: undefined, size: "lg", shape: "circle", preview: false },
  parameters: {
    ...storyDescription("components-avatar--label-text"),
    controls: {
      disable: false,
      include: ["크기", "모양", "배경색", "이미지 미리보기"],
    },
    docs: {
      ...storyDescription("components-avatar--label-text").docs,
      source: {
        type: "code",
        code: withStoryImports(`const avatarImage = ${JSON.stringify(avatarImage)};

function AvatarLabelText() {
  const [text, setText] = useState('긴 라벨 텍스트를 입력해보세요');
  const [width, setWidth] = useState('180');

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="라벨 텍스트"
          value={text}
          width={240}
          onChange={setText}
        />
        <Input
          type="number"
          min={80}
          label="라벨 너비"
          value={width}
          width={160}
          onChange={setWidth}
        />
      </div>
      <Avatar
        showLabel
        labelWidth={Number(width) || 180}
        size="lg"
        src={avatarImage}
      >
        {text}
      </Avatar>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <AvatarLabelTextExample {...args} />,
};

export const Image: Story = {
  args: { shape: "circle", preview: false },
  parameters: {
    ...storyDescription("components-avatar--image"),
    controls: { disable: false, include: ["모양", "이미지 미리보기"] },
    docs: {
      ...storyDescription("components-avatar--image").docs,
      source: {
        type: "code",
        code: withStoryImports(`const avatarImage = ${JSON.stringify(avatarImage)};

<div className="flex items-center gap-3">
  <Avatar
    src={avatarImage}
    size="md"
  />
  <Avatar
    src={avatarImage}
    size="lg"
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} src={avatarImage} size="md" />
      <Avatar {...args} src={avatarImage} size="lg" />
    </div>
  ),
};

export const ImagePreview: Story = {
  args: { shape: "circle", preview: true },
  parameters: {
    ...storyDescription("components-avatar--image-preview"),
    controls: {
      disable: false,
      include: ["모양", "이미지 미리보기"],
    },
    docs: {
      ...storyDescription("components-avatar--image-preview").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const avatarImage = ${JSON.stringify(avatarImage)};

<div className="flex items-center gap-3">
  <Avatar
    src={avatarImage}
    size="lg"
    preview
  />
  <Avatar
    showLabel
    src={avatarImage}
    size="lg"
    preview
  >
    manhat
  </Avatar>
</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} src={avatarImage} size="lg" />
      <Avatar {...args} showLabel src={avatarImage} size="lg">
        manhat
      </Avatar>
    </div>
  ),
};

export const ImageError: Story = {
  args: { color: undefined, shape: "circle" },
  parameters: {
    ...storyDescription("components-avatar--image-error"),
    controls: { disable: false, include: ["모양", "배경색"] },
    docs: {
      ...storyDescription("components-avatar--image-error").docs,
      source: {
        type: "code",
        code: withStoryImports(`const invalidAvatarImage = "data:image/png;base64,invalid";

<div className="flex items-center gap-3">
  <Avatar size="md" src={invalidAvatarImage} />
  <Avatar size="lg" src={invalidAvatarImage} />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} size="md" src={invalidAvatarImage} />
      <Avatar {...args} size="lg" src={invalidAvatarImage} />
    </div>
  ),
};

export const Group: Story = {
  args: { size: "md", shape: "circle" },
  parameters: {
    ...storyDescription("components-avatar--group"),
    controls: { disable: false, include: ["크기", "모양"] },
    docs: {
      ...storyDescription("components-avatar--group").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Avatar.Group maxCount={3}>
  <Avatar>KIM</Avatar>
  <Avatar color="primary">LEE</Avatar>
  <Avatar color="success">PARK</Avatar>
  <Avatar color="purple">CHOI</Avatar>
</Avatar.Group>`,
        ),
      },
    },
  },
  render: (args) => (
    <Avatar.Group maxCount={3} size={args.size} shape={args.shape}>
      <Avatar size={args.size} shape={args.shape}>
        KIM
      </Avatar>
      <Avatar size={args.size} shape={args.shape} color="primary">
        LEE
      </Avatar>
      <Avatar size={args.size} shape={args.shape} color="success">
        PARK
      </Avatar>
      <Avatar size={args.size} shape={args.shape} color="purple">
        CHOI
      </Avatar>
    </Avatar.Group>
  ),
};
