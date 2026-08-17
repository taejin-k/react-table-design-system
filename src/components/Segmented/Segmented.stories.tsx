import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Segmented } from "./Segmented";
import type { SegmentedValue } from "./Segmented.types";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const periodOptions = [
  { value: "day", label: "일간" },
  { value: "week", label: "주간" },
  { value: "month", label: "월간" },
];

const segmentedSizes = ["lg", "md", "sm"] as const;
const segmentedShapes = ["default", "round"] as const;

const meta = {
  title: "Components/Segmented",
  component: Segmented,
  tags: ["autodocs"],
  args: {
    options: periodOptions,
    disabled: false,
    fullWidth: false,
    shape: "default",
    size: "md",
    vertical: false,
  },
  argTypes: {
    size: { name: "크기", control: "select", options: segmentedSizes },
    shape: { name: "모양", control: "select", options: segmentedShapes },
    disabled: { name: "비활성", control: "boolean" },
    fullWidth: { name: "전체 너비", control: "boolean" },
    vertical: { name: "세로 방향", control: "boolean" },
    options: { control: false, table: { disable: true } },
    value: { control: false, table: { disable: true } },
    defaultValue: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "연결된 여러 선택지 중 하나를 전환해요.  \n크기·방향·모양·아이콘과 선택 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Segmented

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`options\` | 선택 항목을 설정해요. | \`SegmentedOption[]\` | - |
| \`value\` | 선택 값을 외부에서 관리해요. | \`string \\| number\` | - |
| \`defaultValue\` | 처음 선택할 값을 설정해요. | \`string \\| number\` | 첫 항목 |
| \`fullWidth\` | 부모의 너비를 모두 채워요. | \`boolean\` | \`false\` |
| \`disabled\` | 모든 항목을 비활성화해요. | \`boolean\` | \`false\` |
| \`vertical\` | 세로 방향으로 표시해요. | \`boolean\` | \`false\` |
| \`size\` | 항목 크기를 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`shape\` | 외곽 모양을 설정해요. | \`default \\| round\` | \`default\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 선택 값이 바뀔 때 실행해요. | \`(value) => void\` | - |

### Option

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 항목의 고유 값을 설정해요. | \`string \\| number\` | - |
| \`label\` | 항목에 표시할 내용을 설정해요. | \`ReactNode\` | - |
| \`icon\` | 항목 앞에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`disabled\` | 항목을 비활성화해요. | \`boolean\` | \`false\` |
| \`tooltip\` | 항목에 Tooltip을 연결해요. | \`string \\| TooltipProps\` | - |
      `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-segmented--basic"),
    controls: { disable: false, include: ["비활성"] },
    docs: {
      ...storyDescription("components-segmented--basic").docs,
      source: {
        code: withStoryImports(`function BasicSegmented() {
  const options = [
    { value: 'day', label: '일간' },
    { value: 'week', label: '주간' },
    { value: 'month', label: '월간' },
  ];

  return <Segmented options={options} />;
}`),
      },
    },
  },
};

export const SizesAndShapes: Story = {
  parameters: {
    ...storyDescription("components-segmented--sizes-shapes"),
    controls: { disable: false, include: ["모양"] },
    docs: {
      ...storyDescription("components-segmented--sizes-shapes").docs,
      source: {
        code: withStoryImports(`function SegmentedSizesAndShapes() {
  const options = [
    { value: 'day', label: '일간' },
    { value: 'week', label: '주간' },
    { value: 'month', label: '월간' },
  ];

  return (
    <div className="grid gap-3">
      <Segmented options={options} size="lg" />
      <Segmented options={options} size="md" />
      <Segmented options={options} size="sm" />
    </div>
  );
}`),
      },
    },
  },
  render: ({ shape }) => (
    <div className="grid justify-items-start gap-3">
      <Segmented options={periodOptions} shape={shape} size="lg" />
      <Segmented options={periodOptions} shape={shape} size="md" />
      <Segmented options={periodOptions} shape={shape} size="sm" />
    </div>
  ),
};

export const VerticalAndFullWidth: Story = {
  args: { fullWidth: true },
  parameters: {
    ...storyDescription("components-segmented--vertical-full-width"),
    controls: { disable: false, include: ["세로 방향", "전체 너비"] },
    docs: {
      ...storyDescription("components-segmented--vertical-full-width").docs,
      source: {
        code: withStoryImports(`function SegmentedVerticalAndFullWidth() {
  const options = [
    { value: 'day', label: '일간' },
    { value: 'week', label: '주간' },
    { value: 'month', label: '월간' },
  ];

  return (
    <div className="max-w-md">
      <Segmented fullWidth options={options} />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-md">
      <Segmented {...args} options={periodOptions} />
    </div>
  ),
};

export const IconsAndTooltip: Story = {
  parameters: {
    ...storyDescription("components-segmented--icons-tooltip"),
    docs: {
      ...storyDescription("components-segmented--icons-tooltip").docs,
      source: {
        code: withStoryImports(`const viewOptions = [
  { value: 'list', label: '목록', icon: <Icon icon="menu" />, tooltip: '목록으로 보기' },
  { value: 'calendar', label: '달력', icon: <Icon icon="calendar" />, tooltip: '달력으로 보기' },
  { value: 'disabled', label: '잠김', icon: <Icon icon="lock" />, disabled: true },
];

function SegmentedIcons() {
  return <Segmented options={viewOptions} />;
}`),
      },
    },
  },
  render: () => (
    <Segmented
      options={[
        { value: "list", label: "목록", icon: <Icon icon="menu" />, tooltip: "목록으로 보기" },
        {
          value: "calendar",
          label: "달력",
          icon: <Icon icon="calendar" />,
          tooltip: "달력으로 보기",
        },
        { value: "disabled", label: "잠김", icon: <Icon icon="lock" />, disabled: true },
      ]}
    />
  ),
};

export const Controlled: Story = {
  tags: ["!dev"],
  parameters: {
    ...storyDescription("components-segmented--controlled"),
    docs: {
      ...storyDescription("components-segmented--controlled").docs,
      source: {
        code: withStoryImports(`function ControlledSegmented() {
  const [value, setValue] = useState<string | number>('week');
  const options = [
    { value: 'day', label: '일간' },
    { value: 'week', label: '주간' },
    { value: 'month', label: '월간' },
  ];

  return <Segmented options={options} value={value} onChange={setValue} />;
}`),
      },
    },
  },
  render: () => <ControlledSegmented />,
};

function ControlledSegmented() {
  const [value, setValue] = useState<SegmentedValue>("week");

  return <Segmented options={periodOptions} value={value} onChange={setValue} />;
}
