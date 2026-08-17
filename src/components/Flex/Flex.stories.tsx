import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Flex } from "./Flex";
import type { FlexProps } from "./Flex.types";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const item =
  "flex h-12 min-w-20 items-center justify-center rounded bg-[#e6f4ff] px-4 text-center text-sm text-[#0062df]";
const flexItem = "h-12 min-w-20 rounded bg-[#e6f4ff] px-4 text-center text-sm text-[#0062df]";
const alignItem =
  "flex h-12 w-20 min-w-0 items-center justify-center rounded bg-[#e6f4ff] px-2 text-center text-sm text-[#0062df]";
const label = "m-0 text-sm font-medium text-[#555]";

function JustifyExample({ value }: { value: FlexProps["justify"] }) {
  return (
    <div className="grid gap-2">
      <p className={label}>{value}</p>
      <Flex justify={value} gap={8} className="rounded border border-[#ddd] p-3">
        <span className={item}>1</span>
        <span className={item}>2</span>
        <span className={item}>3</span>
      </Flex>
    </div>
  );
}

function AlignExample({ value }: { value: FlexProps["align"] }) {
  const isStretch = value === "stretch";
  const isBaseline = value === "baseline";

  return (
    <div className="grid gap-2">
      <p className={label}>{value}</p>
      <Flex align={value} gap={8} className="h-32 rounded border border-[#ddd] p-3">
        <span className={`${alignItem} ${isStretch ? "h-auto" : ""}`}>
          {isBaseline ? "작은 글자" : "첫 요소"}
        </span>
        <span
          className={`${alignItem} ${isStretch ? "h-auto" : "h-20"} ${isBaseline ? "text-xl" : ""}`}
        >
          {isBaseline ? "큰 글자" : "두 번째 요소"}
        </span>
      </Flex>
    </div>
  );
}

function GapExample({ value }: { value: number }) {
  return (
    <div className="grid gap-2">
      <p className={label}>gap={value}</p>
      <Flex gap={value}>
        <Button>첫 번째</Button>
        <Button>두 번째</Button>
        <Button>세 번째</Button>
      </Flex>
    </div>
  );
}

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
| \`wrap\` | 줄바꿈 방식을 설정해요. | \`CSSProperties['flexWrap'] \\| boolean\` | \`nowrap\` |
| \`justify\` | 주축 정렬을 설정해요. | \`CSSProperties['justifyContent']\` | \`normal\` |
| \`align\` | 교차축 정렬을 설정해요. | \`CSSProperties['alignItems']\` | \`normal\` |
| \`flex\` | CSS flex 축약 값을 설정해요. | \`CSSProperties['flex']\` | \`normal\` |
| \`gap\` | 요소 사이 간격을 px 단위로 설정해요. | \`number\` | - |
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

export const Vertical: Story = {
  parameters: {
    ...storyDescription("components-flex--vertical"),
    docs: {
      ...storyDescription("components-flex--vertical").docs,
      source: {
        code: withStoryImports(`function FlexVertical() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">vertical=false</p>
        <Flex vertical={false} gap={8}>
          <Button>첫 번째</Button>
          <Button variant="secondary">두 번째</Button>
          <Button variant="tertiary">세 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">vertical=true</p>
        <Flex vertical gap={8} className="items-start">
          <Button>첫 번째</Button>
          <Button variant="secondary">두 번째</Button>
          <Button variant="tertiary">세 번째</Button>
        </Flex>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className={label}>vertical=false</p>
        <Flex vertical={false} gap={8}>
          <Button>첫 번째</Button>
          <Button variant="secondary">두 번째</Button>
          <Button variant="tertiary">세 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>vertical=true</p>
        <Flex vertical gap={8} className="items-start">
          <Button>첫 번째</Button>
          <Button variant="secondary">두 번째</Button>
          <Button variant="tertiary">세 번째</Button>
        </Flex>
      </div>
    </div>
  ),
};

export const Wrap: Story = {
  parameters: {
    ...storyDescription("components-flex--wrap"),
    docs: {
      ...storyDescription("components-flex--wrap").docs,
      source: {
        code: withStoryImports(`function FlexWrap() {
  return (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">nowrap</p>
        <Flex gap={8} wrap="nowrap" className="overflow-hidden rounded border border-[#ddd] p-3">
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
          <Button>네 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">wrap</p>
        <Flex gap={8} wrap className="rounded border border-[#ddd] p-3">
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
          <Button>네 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">wrap-reverse</p>
        <Flex gap={8} wrap="wrap-reverse" className="rounded border border-[#ddd] p-3">
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
          <Button>네 번째</Button>
        </Flex>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <p className={label}>nowrap</p>
        <Flex gap={8} wrap="nowrap" className="overflow-hidden rounded border border-[#ddd] p-3">
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
          <Button>네 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>wrap</p>
        <Flex gap={8} wrap className="rounded border border-[#ddd] p-3">
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
          <Button>네 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>wrap-reverse</p>
        <Flex gap={8} wrap="wrap-reverse" className="rounded border border-[#ddd] p-3">
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
          <Button>네 번째</Button>
        </Flex>
      </div>
    </div>
  ),
};

export const Justify: Story = {
  parameters: {
    ...storyDescription("components-flex--justify"),
    docs: {
      ...storyDescription("components-flex--justify").docs,
      source: {
        code: withStoryImports(`const itemClass = "flex h-12 min-w-20 items-center justify-center rounded bg-[#e6f4ff] px-4 text-sm text-[#0062df]";
const rowClass = "rounded border border-[#ddd] p-3";
const labelClass = "m-0 text-sm font-medium text-[#555]";

function FlexJustify() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className={labelClass}>flex-start</p>
        <Flex justify="flex-start" gap={8} className={rowClass}>
          <span className={itemClass}>1</span>
          <span className={itemClass}>2</span>
          <span className={itemClass}>3</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={labelClass}>center</p>
        <Flex justify="center" gap={8} className={rowClass}>
          <span className={itemClass}>1</span>
          <span className={itemClass}>2</span>
          <span className={itemClass}>3</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={labelClass}>flex-end</p>
        <Flex justify="flex-end" gap={8} className={rowClass}>
          <span className={itemClass}>1</span>
          <span className={itemClass}>2</span>
          <span className={itemClass}>3</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={labelClass}>space-between</p>
        <Flex justify="space-between" gap={8} className={rowClass}>
          <span className={itemClass}>1</span>
          <span className={itemClass}>2</span>
          <span className={itemClass}>3</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={labelClass}>space-around</p>
        <Flex justify="space-around" gap={8} className={rowClass}>
          <span className={itemClass}>1</span>
          <span className={itemClass}>2</span>
          <span className={itemClass}>3</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={labelClass}>space-evenly</p>
        <Flex justify="space-evenly" gap={8} className={rowClass}>
          <span className={itemClass}>1</span>
          <span className={itemClass}>2</span>
          <span className={itemClass}>3</span>
        </Flex>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid gap-4">
      <JustifyExample value="flex-start" />
      <JustifyExample value="center" />
      <JustifyExample value="flex-end" />
      <JustifyExample value="space-between" />
      <JustifyExample value="space-around" />
      <JustifyExample value="space-evenly" />
    </div>
  ),
};

export const Align: Story = {
  parameters: {
    ...storyDescription("components-flex--align"),
    docs: {
      ...storyDescription("components-flex--align").docs,
      source: {
        code: withStoryImports(`const itemClass = "flex h-12 w-20 min-w-0 items-center justify-center rounded bg-[#e6f4ff] px-2 text-center text-sm text-[#0062df]";
const labelClass = "m-0 text-sm font-medium text-[#555]";

function AlignItem({ value }) {
  const isStretch = value === "stretch";
  const isBaseline = value === "baseline";

  return (
    <div className="grid gap-2">
      <p className={labelClass}>{value}</p>
      <Flex align={value} gap={8} className="h-32 rounded border border-[#ddd] p-3">
        <span className={itemClass + (isStretch ? " h-auto" : "")}>
          {isBaseline ? "작은 글자" : "첫 요소"}
        </span>
        <span className={itemClass + (isStretch ? " h-auto" : " h-20") + (isBaseline ? " text-xl" : "")}>
          {isBaseline ? "큰 글자" : "두 번째 요소"}
        </span>
      </Flex>
    </div>
  );
}

function FlexAlign() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <AlignItem value="flex-start" />
      <AlignItem value="center" />
      <AlignItem value="flex-end" />
      <AlignItem value="stretch" />
      <AlignItem value="baseline" />
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <AlignExample value="flex-start" />
      <AlignExample value="center" />
      <AlignExample value="flex-end" />
      <AlignExample value="stretch" />
      <AlignExample value="baseline" />
    </div>
  ),
};

export const FlexValue: Story = {
  name: "Flex",
  parameters: {
    ...storyDescription("components-flex--flex"),
    docs: {
      ...storyDescription("components-flex--flex").docs,
      source: {
        code: withStoryImports(`const itemClass = "h-12 min-w-20 rounded bg-[#e6f4ff] px-4 text-sm text-[#0062df]";

function FlexValue() {
  return (
    <Flex gap={8}>
      <Flex flex={1} align="center" justify="center" className={itemClass}>
        flex=1
      </Flex>
      <Flex flex="0 0 160px" align="center" justify="center" className={itemClass}>
        고정 160px
      </Flex>
      <Flex flex={2} align="center" justify="center" className={itemClass}>
        flex=2
      </Flex>
    </Flex>
  );
}`),
      },
    },
  },
  render: () => (
    <Flex gap={8}>
      <Flex flex={1} align="center" justify="center" className={flexItem}>
        flex=1
      </Flex>
      <Flex flex="0 0 160px" align="center" justify="center" className={flexItem}>
        고정 160px
      </Flex>
      <Flex flex={2} align="center" justify="center" className={flexItem}>
        flex=2
      </Flex>
    </Flex>
  ),
};

export const Gap: Story = {
  parameters: {
    ...storyDescription("components-flex--gap"),
    docs: {
      ...storyDescription("components-flex--gap").docs,
      source: {
        code: withStoryImports(`function FlexGap() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">gap=0</p>
        <Flex gap={0}>
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
        </Flex>
      </div>

      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">gap=8</p>
        <Flex gap={8}>
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
        </Flex>
      </div>

      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">gap=16</p>
        <Flex gap={16}>
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
        </Flex>
      </div>

      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">gap=24</p>
        <Flex gap={24}>
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
        </Flex>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid gap-6">
      <GapExample value={0} />
      <GapExample value={8} />
      <GapExample value={16} />
      <GapExample value={24} />
    </div>
  ),
};

export const Component: Story = {
  tags: ["!dev"],
  parameters: {
    ...storyDescription("components-flex--component"),
    docs: {
      ...storyDescription("components-flex--component").docs,
      source: {
        code: withStoryImports(`function FlexList() {
  return (
    <Flex component="ul" vertical gap={8}>
      <li>첫 항목</li>
      <li>두 번째 항목</li>
    </Flex>
  );
}`),
      },
    },
  },
  render: () => (
    <Flex component="ul" vertical gap={8}>
      <li>첫 항목</li>
      <li>두 번째 항목</li>
    </Flex>
  ),
};
