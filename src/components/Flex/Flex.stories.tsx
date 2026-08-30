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
const flexWrapOptions = [false, true, "nowrap", "wrap", "wrap-reverse"];
const flexJustifyOptions = [
  "normal",
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
];
const flexAlignOptions = ["normal", "flex-start", "center", "flex-end", "stretch", "baseline"];

function JustifyExample({ value, gap }: { value: FlexProps["justify"]; gap: number }) {
  return (
    <div className="grid gap-2">
      <p className={label}>{value}</p>
      <Flex justify={value} gap={gap} className="rounded border border-[#ddd] p-3">
        <span className={item}>1</span>
        <span className={item}>2</span>
        <span className={item}>3</span>
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
  argTypes: {
    vertical: { name: "세로 배치", control: "boolean" },
    wrap: { name: "줄바꿈", control: "select", options: flexWrapOptions },
    justify: { name: "주축 정렬", control: "select", options: flexJustifyOptions },
    align: { name: "교차축 정렬", control: "select", options: flexAlignOptions },
    gap: { name: "간격", control: { type: "number", min: 0, step: 1 } },
    children: { control: false, table: { disable: true } },
    flex: { control: false, table: { disable: true } },
    component: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
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

export const Basic: Story = {
  args: {
    vertical: false,
    wrap: false,
    justify: "flex-start",
    align: "center",
    gap: 8,
  },
  parameters: {
    ...storyDescription("components-flex--basic"),
    controls: {
      disable: false,
      include: ["세로 배치", "줄바꿈", "주축 정렬", "교차축 정렬", "간격"],
    },
    docs: {
      ...storyDescription("components-flex--basic").docs,
      source: {
        code: withStoryImports(`<Flex
  gap={8}
  align="center"
  className="min-h-20 rounded border border-[#ddd] p-3"
>
  <Button>첫 번째</Button>
  <Button>두 번째</Button>
  <Button>세 번째</Button>
</Flex>`),
      },
    },
  },
  render: (args) => (
    <Flex {...args} className="min-h-20 rounded border border-[#ddd] p-3">
      <Button>첫 번째</Button>
      <Button>두 번째</Button>
      <Button>세 번째</Button>
    </Flex>
  ),
};

export const Vertical: Story = {
  args: { gap: 8, align: "flex-start" },
  parameters: {
    ...storyDescription("components-flex--vertical"),
    controls: { disable: false, include: ["교차축 정렬", "간격"] },
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
          <Button>두 번째</Button>
          <Button>세 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className="m-0 text-sm font-medium text-[#555]">vertical=true</p>
        <Flex vertical gap={8} align="flex-start">
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
  render: (args) => (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <p className={label}>vertical=false</p>
        <Flex vertical={false} gap={args.gap} align={args.align}>
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>vertical=true</p>
        <Flex vertical gap={args.gap} align={args.align}>
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
        </Flex>
      </div>
    </div>
  ),
};

export const Wrap: Story = {
  args: { gap: 8, align: "center" },
  parameters: {
    ...storyDescription("components-flex--wrap"),
    controls: { disable: false, include: ["교차축 정렬", "간격"] },
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
  render: (args) => (
    <div className="grid max-w-xl gap-6">
      <div className="grid gap-2">
        <p className={label}>nowrap</p>
        <Flex
          gap={args.gap}
          align={args.align}
          wrap="nowrap"
          className="overflow-hidden rounded border border-[#ddd] p-3"
        >
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
          <Button>네 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>wrap</p>
        <Flex gap={args.gap} align={args.align} wrap className="rounded border border-[#ddd] p-3">
          <Button>첫 번째</Button>
          <Button>두 번째</Button>
          <Button>세 번째</Button>
          <Button>네 번째</Button>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>wrap-reverse</p>
        <Flex
          gap={args.gap}
          align={args.align}
          wrap="wrap-reverse"
          className="rounded border border-[#ddd] p-3"
        >
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
  args: { gap: 8 },
  parameters: {
    ...storyDescription("components-flex--justify"),
    controls: { disable: false, include: ["간격"] },
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
  render: (args) => (
    <div className="grid gap-4">
      <JustifyExample value="flex-start" gap={args.gap ?? 8} />
      <JustifyExample value="center" gap={args.gap ?? 8} />
      <JustifyExample value="flex-end" gap={args.gap ?? 8} />
      <JustifyExample value="space-between" gap={args.gap ?? 8} />
      <JustifyExample value="space-around" gap={args.gap ?? 8} />
      <JustifyExample value="space-evenly" gap={args.gap ?? 8} />
    </div>
  ),
};

export const Align: Story = {
  args: { gap: 8, justify: "flex-start" },
  parameters: {
    ...storyDescription("components-flex--align"),
    controls: { disable: false, include: ["주축 정렬", "간격"] },
    docs: {
      ...storyDescription("components-flex--align").docs,
      source: {
        code: withStoryImports(`const itemClass = "flex h-12 w-20 min-w-0 items-center justify-center rounded bg-[#e6f4ff] px-2 text-center text-sm text-[#0062df]";
const labelClass = "m-0 text-sm font-medium text-[#555]";

function FlexAlign() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div className="grid gap-2">
        <p className={labelClass}>flex-start</p>
        <Flex align="flex-start" gap={8} className="h-32 rounded border border-[#ddd] p-3">
          <span className={itemClass}>첫 요소</span>
          <span className={itemClass + " h-20"}>두 번째 요소</span>
        </Flex>
      </div>

      <div className="grid gap-2">
        <p className={labelClass}>center</p>
        <Flex align="center" gap={8} className="h-32 rounded border border-[#ddd] p-3">
          <span className={itemClass}>첫 요소</span>
          <span className={itemClass + " h-20"}>두 번째 요소</span>
        </Flex>
      </div>

      <div className="grid gap-2">
        <p className={labelClass}>flex-end</p>
        <Flex align="flex-end" gap={8} className="h-32 rounded border border-[#ddd] p-3">
          <span className={itemClass}>첫 요소</span>
          <span className={itemClass + " h-20"}>두 번째 요소</span>
        </Flex>
      </div>

      <div className="grid gap-2">
        <p className={labelClass}>stretch</p>
        <Flex align="stretch" gap={8} className="h-32 rounded border border-[#ddd] p-3">
          <span className={itemClass + " h-auto"}>첫 요소</span>
          <span className={itemClass + " h-auto"}>두 번째 요소</span>
        </Flex>
      </div>

      <div className="grid gap-2">
        <p className={labelClass}>baseline</p>
        <Flex align="baseline" gap={8} className="h-32 rounded border border-[#ddd] p-3">
          <span className={itemClass}>작은 글자</span>
          <span className={itemClass + " h-20 text-xl"}>큰 글자</span>
        </Flex>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div className="grid gap-2">
        <p className={label}>flex-start</p>
        <Flex
          align="flex-start"
          justify={args.justify}
          gap={args.gap}
          className="h-32 rounded border border-[#ddd] p-3"
        >
          <span className={alignItem}>첫 요소</span>
          <span className={`${alignItem} h-20`}>두 번째 요소</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>center</p>
        <Flex
          align="center"
          justify={args.justify}
          gap={args.gap}
          className="h-32 rounded border border-[#ddd] p-3"
        >
          <span className={alignItem}>첫 요소</span>
          <span className={`${alignItem} h-20`}>두 번째 요소</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>flex-end</p>
        <Flex
          align="flex-end"
          justify={args.justify}
          gap={args.gap}
          className="h-32 rounded border border-[#ddd] p-3"
        >
          <span className={alignItem}>첫 요소</span>
          <span className={`${alignItem} h-20`}>두 번째 요소</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>stretch</p>
        <Flex
          align="stretch"
          justify={args.justify}
          gap={args.gap}
          className="h-32 rounded border border-[#ddd] p-3"
        >
          <span className={`${alignItem} h-auto`}>첫 요소</span>
          <span className={`${alignItem} h-auto`}>두 번째 요소</span>
        </Flex>
      </div>
      <div className="grid gap-2">
        <p className={label}>baseline</p>
        <Flex
          align="baseline"
          justify={args.justify}
          gap={args.gap}
          className="h-32 rounded border border-[#ddd] p-3"
        >
          <span className={alignItem}>작은 글자</span>
          <span className={`${alignItem} h-20 text-xl`}>큰 글자</span>
        </Flex>
      </div>
    </div>
  ),
};

export const FlexValue: Story = {
  name: "Flex",
  args: { gap: 8, align: "center" },
  parameters: {
    ...storyDescription("components-flex--flex"),
    controls: { disable: false, include: ["교차축 정렬", "간격"] },
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
  render: (args) => (
    <Flex gap={args.gap} align={args.align}>
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
    controls: { disable: true },
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
  args: { gap: 8, align: "normal" },
  tags: ["!dev"],
  parameters: {
    ...storyDescription("components-flex--component"),
    controls: { disable: false, include: ["교차축 정렬", "간격"] },
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
  render: (args) => (
    <Flex component="ul" vertical gap={args.gap} align={args.align}>
      <li>첫 항목</li>
      <li>두 번째 항목</li>
    </Flex>
  ),
};
