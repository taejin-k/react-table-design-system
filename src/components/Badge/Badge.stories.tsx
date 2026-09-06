import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { colorTokenNames } from "../../color-tokens";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Flex } from "../Flex";
import { Input } from "../Input";
import { Badge } from "./Badge";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    color: { name: "색상", control: "select", options: colorTokenNames },
    process: { name: "퍼짐 애니메이션", control: "boolean" },
    label: { name: "라벨", control: "text" },
    children: { control: false, table: { disable: true } },
    content: { name: "배지 내용", control: "text" },
    offset: { name: "위치 조절", control: "object" },
    className: { control: false, table: { disable: true } },
    style: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component: "Badge는 상태를 점과 문구로 표시하거나, 요소 오른쪽 위에 숫자·텍스트를 붙여요.",
      },
      page: () => (
        <div className="badge-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Badge

Badge는 아이콘이나 메뉴 옆에 현재 상태를 표시해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`color\` | 배지 색상을 정해요. | [\`ColorTokenType\`](./iframe.html?id=components-color--documentation&viewMode=docs#color-token-type) | - |
| \`process\` | 상태 점이 퍼지는 애니메이션을 적용해요. | \`boolean\` | \`false\` |
| \`label\` | 배지 오른쪽에 라벨을 표시해요. | \`ReactNode\` | - |
| \`children\` | 오른쪽 위에 배지를 붙일 요소예요. | \`ReactNode\` | - |
| \`content\` | 배지 안의 내용이에요. 넘치면 말줄임, 없으면 점으로 표시해요. | \`string \\| number\` | - |
| \`offset\` | [x, y] 이동 거리(px)예요. 양수는 오른쪽·아래예요. | \`[number, number]\` | \`[0, 0]\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    color: "primary",
    process: false,
    label: "처리 중",
  },
  parameters: {
    ...storyDescription("components-badge--basic"),
    controls: {
      disable: false,
      include: ["색상", "퍼짐 애니메이션", "라벨"],
    },
    docs: {
      ...storyDescription("components-badge--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Badge color="primary" label="처리 중" />`),
      },
    },
  },
};

export const Statuses: Story = {
  args: { color: "success", process: false },
  parameters: {
    ...storyDescription("components-badge--statuses"),
    controls: { disable: false, include: ["퍼짐 애니메이션"] },
    docs: {
      ...storyDescription("components-badge--statuses").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex gap-5">\n  <Badge color="success" label="정상" />\n  <Badge color="primary" label="처리 중" />\n  <Badge color="gray" label="기본" />\n  <Badge color="danger" label="오류" />\n  <Badge color="warning" label="주의" />\n</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex gap-5">
      <Badge color="success" process={args.process} label="정상" />
      <Badge color="primary" process={args.process} label="처리 중" />
      <Badge color="gray" process={args.process} label="기본" />
      <Badge color="danger" process={args.process} label="오류" />
      <Badge color="warning" process={args.process} label="주의" />
    </div>
  ),
};

export const Process: Story = {
  args: { color: "success", process: true },
  parameters: {
    ...storyDescription("components-badge--process"),
    controls: { disable: false, include: ["퍼짐 애니메이션"] },
    docs: {
      ...storyDescription("components-badge--process").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex gap-5">\n  <Badge color="success" process label="정상" />\n  <Badge color="primary" process label="처리 중" />\n  <Badge color="gray" process label="기본" />\n  <Badge color="danger" process label="오류" />\n  <Badge color="warning" process label="주의" />\n</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex gap-5">
      <Badge color="success" process={args.process} label="정상" />
      <Badge color="primary" process={args.process} label="처리 중" />
      <Badge color="gray" process={args.process} label="기본" />
      <Badge color="danger" process={args.process} label="오류" />
      <Badge color="warning" process={args.process} label="주의" />
    </div>
  ),
};

export const Content: Story = {
  args: { color: "danger" },
  parameters: {
    ...storyDescription("components-badge--content"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-badge--content").docs,
      source: {
        code: withStoryImports(`<Flex wrap gap={32} className="p-4">
  <Badge color="danger">
    <Button>점</Button>
  </Badge>
  <Badge color="danger" content={0}>
    <Button>숫자 0</Button>
  </Badge>
  <Badge color="danger" content={12}>
    <Button>숫자</Button>
  </Badge>
  <Badge color="primary" content="NEW">
    <Button>텍스트</Button>
  </Badge>
</Flex>`),
      },
    },
  },
  render: () => (
    <Flex wrap gap={32} className="p-4">
      <Badge color="danger">
        <Button>점</Button>
      </Badge>
      <Badge color="danger" content={0}>
        <Button>숫자 0</Button>
      </Badge>
      <Badge color="danger" content={12}>
        <Button>숫자</Button>
      </Badge>
      <Badge color="primary" content="NEW">
        <Button>텍스트</Button>
      </Badge>
    </Flex>
  ),
};

export const Offset: Story = {
  args: { color: "danger" },
  parameters: {
    ...storyDescription("components-badge--offset"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-badge--offset").docs,
      source: {
        code: withStoryImports(`function BadgeOffset() {
  const [x, setX] = useState('0');
  const [y, setY] = useState('0');
  const [content, setContent] = useState('12');

  return (
    <Flex vertical gap={24}>
      <Flex wrap gap={16}>
        <Input type="number" label="X offset (px)" value={x} onChange={setX} width={160} />
        <Input type="number" label="Y offset (px)" value={y} onChange={setY} width={160} />
        <Input label="배지 내용" value={content} onChange={setContent} width={160} />
      </Flex>
      <div className="p-8">
        <Badge color="danger" content={content} offset={[Number(x), Number(y)]}>
          <Button>알림</Button>
        </Badge>
      </div>
    </Flex>
  );
}`),
      },
    },
  },
  render: () => <BadgeOffset />,
};

function BadgeOffset() {
  const [x, setX] = useState("0");
  const [y, setY] = useState("0");
  const [content, setContent] = useState("12");

  return (
    <Flex vertical gap={24}>
      <Flex wrap gap={16}>
        <Input type="number" label="X offset (px)" value={x} onChange={setX} width={160} />
        <Input type="number" label="Y offset (px)" value={y} onChange={setY} width={160} />
        <Input label="배지 내용" value={content} onChange={setContent} width={160} />
      </Flex>
      <div className="p-8">
        <Badge color="danger" content={content} offset={[Number(x), Number(y)]}>
          <Button>알림</Button>
        </Badge>
      </div>
    </Flex>
  );
}
