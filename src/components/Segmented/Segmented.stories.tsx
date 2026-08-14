import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Segmented } from "./Segmented";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const options = ["일간", "주간", "월간"];

const meta = {
  title: "Components/Segmented",
  component: Segmented,
  tags: ["autodocs"],
  args: { options },
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
| \`block\` | 부모의 너비를 모두 채워요. | \`boolean\` | \`false\` |
| \`disabled\` | 모든 항목을 비활성화해요. | \`boolean\` | \`false\` |
| \`orientation\` | 가로 또는 세로 방향을 설정해요. | \`horizontal \\| vertical\` | \`horizontal\` |
| \`vertical\` | 세로 방향으로 표시해요. | \`boolean\` | \`false\` |
| \`size\` | 항목 크기를 설정해요. | \`large \\| medium \\| small\` | \`medium\` |
| \`shape\` | 외곽 모양을 설정해요. | \`default \\| round\` | \`default\` |
| \`name\` | 내부 radio의 name을 설정해요. | \`string\` | - |
| \`classNames\` | 각 영역의 클래스를 설정해요. | \`Record<SemanticName, string>\` | - |
| \`styles\` | 각 영역의 스타일을 설정해요. | \`Record<SemanticName, CSSProperties>\` | - |
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
    docs: {
      source: {
        code: withStoryImports(`function BasicSegmented() {
  return <Segmented options={['일간', '주간', '월간']} />;
}`),
      },
    },
  },
};

export const SizesAndShapes: Story = {
  parameters: {
    ...storyDescription("components-segmented--sizes-shapes"),
    docs: {
      source: {
        code: withStoryImports(`function SegmentedSizesAndShapes() {
  return (
    <div className="grid gap-3">
      <Segmented options={['일간', '주간', '월간']} size="large" />
      <Segmented options={['일간', '주간', '월간']} />
      <Segmented options={['일간', '주간', '월간']} size="small" shape="round" />
      <Segmented options={['일간', '주간', '월간']} disabled />
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid justify-items-start gap-3">
      <Segmented options={options} size="large" />
      <Segmented options={options} />
      <Segmented options={options} size="small" shape="round" />
      <Segmented options={options} disabled />
    </div>
  ),
};

export const OrientationAndBlock: Story = {
  parameters: {
    ...storyDescription("components-segmented--orientation-block"),
    docs: {
      source: {
        code: withStoryImports(`function SegmentedOrientationAndBlock() {
  return (
    <div className="grid max-w-md gap-4">
      <Segmented block options={['일간', '주간', '월간']} />
      <Segmented orientation="vertical" options={['목록', '보드', '캘린더']} />
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-md gap-4">
      <Segmented block options={options} />
      <Segmented orientation="vertical" options={["목록", "보드", "캘린더"]} />
    </div>
  ),
};

export const IconsAndTooltip: Story = {
  parameters: {
    ...storyDescription("components-segmented--icons-tooltip"),
    docs: {
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
  parameters: {
    ...storyDescription("components-segmented--controlled"),
    docs: {
      source: {
        code: withStoryImports(`function ControlledSegmented() {
  const [value, setValue] = useState('주간');
  return <Segmented options={['일간', '주간', '월간']} value={value} onChange={(next) => setValue(String(next))} />;
}`),
      },
    },
  },
  render: () => <ControlledExample />,
};

function ControlledExample() {
  const [value, setValue] = useState("주간");
  return <Segmented options={options} value={value} onChange={(next) => setValue(String(next))} />;
}
