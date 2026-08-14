import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Flex } from "./Flex";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const item =
  "flex h-12 min-w-20 items-center justify-center rounded bg-[#e6f4ff] px-4 text-sm text-[#0062df]";

const meta = {
  title: "Components/Flex",
  component: Flex,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "요소를 가로 또는 세로로 배치해요.  \n정렬·간격·줄바꿈과 렌더링 요소를 설정할 수 있어요.",
      },
      page: () => (
        <div className="component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Flex

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`vertical\` | 요소를 세로 방향으로 배치해요. | \`boolean\` | \`false\` |
| \`orientation\` | 배치 방향을 설정해요. | \`horizontal \\| vertical\` | \`horizontal\` |
| \`wrap\` | 줄바꿈 방식을 설정해요. | \`CSSProperties['flexWrap'] \\| boolean\` | \`nowrap\` |
| \`justify\` | 주축 정렬을 설정해요. | \`CSSProperties['justifyContent']\` | \`normal\` |
| \`align\` | 교차축 정렬을 설정해요. | \`CSSProperties['alignItems']\` | \`normal\` |
| \`flex\` | CSS flex 축약 값을 설정해요. | \`CSSProperties['flex']\` | \`normal\` |
| \`gap\` | 요소 사이 간격을 설정해요. | \`small \\| medium \\| large \\| string \\| number\` | - |
| \`component\` | 렌더링할 요소를 설정해요. | \`ElementType\` | \`div\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
      `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-flex--basic"),
    docs: {
      source: {
        code: withStoryImports(`function BasicFlex() {
  return (
    <Flex gap="small">
      <Button>첫 번째</Button>
      <Button type="secondary">두 번째</Button>
      <Button type="tertiary">세 번째</Button>
    </Flex>
  );
}`),
      },
    },
  },
  render: () => (
    <Flex gap="small">
      <Button>첫 번째</Button>
      <Button type="secondary">두 번째</Button>
      <Button type="tertiary">세 번째</Button>
    </Flex>
  ),
};

export const Alignment: Story = {
  parameters: {
    ...storyDescription("components-flex--alignment"),
    docs: {
      source: {
        code: withStoryImports(`function FlexAlignment() {
  return (
    <Flex className="h-32 rounded border border-[#ddd]" align="center" justify="space-between">
      <span>시작</span>
      <span>가운데</span>
      <span>끝</span>
    </Flex>
  );
}`),
      },
    },
  },
  render: () => (
    <Flex className="h-32 rounded border border-[#ddd]" align="center" justify="space-between">
      <span className={item}>시작</span>
      <span className={item}>가운데</span>
      <span className={item}>끝</span>
    </Flex>
  ),
};

export const GapAndWrap: Story = {
  parameters: {
    ...storyDescription("components-flex--gap-wrap"),
    docs: {
      source: {
        code: withStoryImports(`function FlexGapAndWrap() {
  return (
    <Flex wrap gap="medium">
      {Array.from({ length: 8 }, (_, index) => <Button key={index}>항목 {index + 1}</Button>)}
    </Flex>
  );
}`),
      },
    },
  },
  render: () => (
    <Flex wrap gap="medium">
      {Array.from({ length: 8 }, (_, index) => (
        <Button key={index}>항목 {index + 1}</Button>
      ))}
    </Flex>
  ),
};

export const Component: Story = {
  parameters: {
    ...storyDescription("components-flex--component"),
    docs: {
      source: {
        code: withStoryImports(`function FlexList() {
  return <Flex component="ul" vertical gap="small"><li>첫 항목</li><li>두 번째 항목</li></Flex>;
}`),
      },
    },
  },
  render: () => (
    <Flex component="ul" vertical gap="small">
      <li>첫 항목</li>
      <li>두 번째 항목</li>
    </Flex>
  ),
};
