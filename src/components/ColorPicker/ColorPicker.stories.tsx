import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { ColorPicker } from "./ColorPicker";

const presets = [
  { label: "브랜드", colors: ["#0062df", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"] },
];
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
  args: { defaultValue: "#0062df", showText: true, allowClear: true, presets },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "색상 패널과 입력값으로 색상을 선택해요.  \nHEX·RGB·HSB 형식, 투명도, 프리셋, 제어 상태와 클릭·호버 트리거를 지원해요.",
      },
      page: () => (
        <div className="color-picker-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 선택된 색상을 제어해요. | \`ColorValue\` | - |
| \`defaultValue\` | 처음 선택할 색상을 정해요. | \`ColorValue\` | - |
| \`format\` | 색상 입력 형식을 제어해요. | \`'hex' \\| 'rgb' \\| 'hsb'\` | \`'hex'\` |
| \`size\` | 트리거의 크기를 정해요. | \`'large' \\| 'medium' \\| 'small'\` | \`'medium'\` |
| \`disabledAlpha\` | 투명도 조절을 숨겨요. | \`boolean\` | \`false\` |
| \`allowClear\` | 선택한 색상을 지우는 버튼을 표시해요. | \`boolean\` | \`false\` |
| \`trigger\` | 패널을 여는 동작을 정해요. | \`'click' \\| 'hover'\` | \`'click'\` |
| \`placement\` | 트리거를 기준으로 패널 위치를 정해요. | \`FloatingPlacement\` | \`'bottomLeft'\` |
| \`showText\` | 색상 문자열 또는 사용자 정의 내용을 표시해요. | \`boolean \\| ((color: Color) => ReactNode)\` | \`false\` |
| \`presets\` | 빠르게 선택할 색상 그룹을 구성해요. | \`ColorPreset[]\` | \`[]\` |
| \`onChange\` | 색상이 바뀌는 동안 실행해요. | \`(value: Color, css: string) => void\` | - |
| \`onChangeComplete\` | 색상 조절을 마쳤을 때 실행해요. | \`(value: Color) => void\` | - |
| \`onOpenChange\` | 패널 표시 상태가 바뀔 때 실행해요. | \`(open: boolean) => void\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--basic"),
    docs: {
      ...storyDescription("components-colorpicker--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<ColorPicker defaultValue="#0062df" showText allowClear presets={[\n  { label: '브랜드', colors: ['#0062df', '#52c41a', '#faad14', '#ff4d4f'] },\n]} />`,
        ),
      },
    },
  },
};
export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--sizes"),
    docs: {
      ...storyDescription("components-colorpicker--sizes").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex items-center gap-3">\n  <ColorPicker defaultValue="#0062df" size="small" />\n  <ColorPicker defaultValue="#0062df" size="medium" />\n  <ColorPicker defaultValue="#0062df" size="large" />\n</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      <ColorPicker {...args} size="small" />
      <ColorPicker {...args} size="medium" />
      <ColorPicker {...args} size="large" />
    </div>
  ),
};
export const WithoutAlpha: Story = {
  args: { disabledAlpha: true },
  parameters: {
    ...storyDescription("components-colorpicker--without-alpha"),
    docs: {
      ...storyDescription("components-colorpicker--without-alpha").docs,
      source: {
        type: "code",
        code: withStoryImports(`<ColorPicker defaultValue="#0062df" disabledAlpha showText />`),
      },
    },
  },
};
