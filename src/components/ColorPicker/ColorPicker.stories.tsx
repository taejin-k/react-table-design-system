import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { ColorPicker } from "./ColorPicker";
import type {
  ColorFormatType,
  ColorPickerPlacementType,
  ColorPickerSizeType,
  ColorPickerTriggerType,
} from "./ColorPicker.types";

const colorFormats: ColorFormatType[] = ["hex", "rgb", "hsb"];
const colorPickerSizes: ColorPickerSizeType[] = ["large", "medium", "small"];
const colorPickerTriggers: ColorPickerTriggerType[] = ["click", "hover"];
const colorPickerPlacements: ColorPickerPlacementType[] = [
  "top",
  "topLeft",
  "topRight",
  "bottom",
  "bottomLeft",
  "bottomRight",
  "left",
  "leftTop",
  "leftBottom",
  "right",
  "rightTop",
  "rightBottom",
];

const presets = [
  { label: "브랜드", colors: ["#0062df", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"] },
];
const presetGroups = [
  { label: "브랜드", colors: ["#0062df", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"] },
  { label: "상태", colors: ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#8c8c8c"] },
];
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
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
| \`value\` | 선택된 색상을 제어해요. | \`ColorValueType\` | - |
| \`defaultValue\` | 처음 선택할 색상을 정해요. | \`ColorValueType\` | \`#0062df\` |
| \`format\` | 색상 입력 형식을 제어해요. | [\`ColorFormatType\`](#color-format-type) | \`hex\` |
| \`defaultFormat\` | 처음 사용할 색상 입력 형식을 정해요. | [\`ColorFormatType\`](#color-format-type) | \`hex\` |
| \`size\` | 트리거의 크기를 정해요. | [\`ColorPickerSizeType\`](#color-picker-size-type) | \`medium\` |
| \`disabled\` | 색상 선택을 비활성화해요. | \`boolean\` | \`false\` |
| \`allowClear\` | 선택한 색상을 지우는 버튼을 표시해요. | \`boolean\` | \`false\` |
| \`open\` | 패널 표시 상태를 제어해요. | \`boolean\` | - |
| \`defaultOpen\` | 패널을 처음부터 열어요. | \`boolean\` | \`false\` |
| \`trigger\` | 패널을 여는 동작을 정해요. | [\`ColorPickerTriggerType\`](#color-picker-trigger-type) | \`click\` |
| \`placement\` | 트리거를 기준으로 패널 위치를 정해요. | [\`ColorPickerPlacementType\`](#color-picker-placement-type) | \`bottomLeft\` |
| \`showText\` | 색상 문자열 또는 사용자 정의 내용을 표시해요. | \`boolean \\| ((color: Color) => ReactNode)\` | \`false\` |
| \`presets\` | 빠르게 선택할 색상 그룹을 구성해요. | \`ColorPreset[]\` | \`[]\` |
| \`panelRender\` | 색상 패널 전체를 사용자 정의해요. | \`(panel, extra) => ReactNode\` | - |
| \`onChange\` | 색상이 바뀌는 동안 실행해요. | \`(value: Color, css: string) => void\` | - |
| \`onChangeComplete\` | 색상 조절을 마쳤을 때 실행해요. | \`(value: Color) => void\` | - |
| \`onFormatChange\` | 색상 입력 형식이 바뀔 때 실행해요. | \`(format: ColorFormatType) => void\` | - |
| \`onOpenChange\` | 패널 표시 상태가 바뀔 때 실행해요. | \`(open: boolean) => void\` | - |
| \`onClear\` | 선택한 색상을 지울 때 실행해요. | \`() => void\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="color-format-type">ColorFormatType</h3>
          <p>색상 입력 형식을 선택해요.</p>
          <TypeTokens values={colorFormats} />
          <h3 id="color-picker-size-type">ColorPickerSizeType</h3>
          <p>트리거 크기를 선택해요.</p>
          <TypeTokens values={colorPickerSizes} />
          <h3 id="color-picker-trigger-type">ColorPickerTriggerType</h3>
          <p>패널을 여는 동작을 선택해요.</p>
          <TypeTokens values={colorPickerTriggers} />
          <h3 id="color-picker-placement-type">ColorPickerPlacementType</h3>
          <p>패널 위치를 선택해요.</p>
          <TypeTokens values={colorPickerPlacements} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { defaultValue: "#0062df", showText: true, allowClear: true, presets },
  parameters: {
    ...storyDescription("components-colorpicker--basic"),
    docs: {
      ...storyDescription("components-colorpicker--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<ColorPicker defaultValue="#0062df" showText allowClear presets={[\n  {\n    label: '브랜드',\n    colors: ['#0062df', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],\n  },\n]} />`,
        ),
      },
    },
  },
};

export const AllowClear: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--allow-clear"),
    docs: {
      ...storyDescription("components-colorpicker--allow-clear").docs,
      source: {
        type: "code",
        code: withStoryImports(`<ColorPicker defaultValue="#0062df" showText allowClear />`),
      },
    },
  },
  render: () => <ColorPicker defaultValue="#0062df" showText allowClear />,
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
  render: () => (
    <div className="flex items-center gap-3">
      <ColorPicker defaultValue="#0062df" size="small" />
      <ColorPicker defaultValue="#0062df" size="medium" />
      <ColorPicker defaultValue="#0062df" size="large" />
    </div>
  ),
};

export const Formats: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--formats"),
    docs: {
      ...storyDescription("components-colorpicker--formats").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-center gap-3">\n  <ColorPicker defaultValue="#0062df" defaultFormat="hex" showText />\n  <ColorPicker defaultValue="#0062df" defaultFormat="rgb" showText />\n  <ColorPicker defaultValue="#0062df" defaultFormat="hsb" showText />\n</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ColorPicker defaultValue="#0062df" defaultFormat="hex" showText />
      <ColorPicker defaultValue="#0062df" defaultFormat="rgb" showText />
      <ColorPicker defaultValue="#0062df" defaultFormat="hsb" showText />
    </div>
  ),
};

export const Transparency: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--transparency"),
    docs: {
      ...storyDescription("components-colorpicker--transparency").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-center gap-3">\n  <ColorPicker defaultValue="#0062df" showText />\n  <ColorPicker defaultValue="#0062df99" showText />\n  <ColorPicker defaultValue="#0062df33" showText />\n</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <ColorPicker defaultValue="#0062df" showText />
      <ColorPicker defaultValue="#0062df99" showText />
      <ColorPicker defaultValue="#0062df33" showText />
    </div>
  ),
};

export const Presets: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--presets"),
    docs: {
      ...storyDescription("components-colorpicker--presets").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<ColorPicker\n  defaultValue="#0062df"\n  showText\n  presets={[\n    {\n      label: '브랜드',\n      colors: ['#0062df', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],\n    },\n    {\n      label: '상태',\n      colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#8c8c8c'],\n    },\n  ]}\n/>`,
        ),
      },
    },
  },
  render: () => <ColorPicker defaultValue="#0062df" showText presets={presetGroups} />,
};

export const Triggers: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--triggers"),
    docs: {
      ...storyDescription("components-colorpicker--triggers").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-center gap-6">\n  <div className="flex items-center gap-2">\n    <span>Click</span>\n    <ColorPicker defaultValue="#0062df" />\n  </div>\n  <div className="flex items-center gap-2">\n    <span>Hover</span>\n    <ColorPicker defaultValue="#52c41a" trigger="hover" />\n  </div>\n</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2">
        <span>Click</span>
        <ColorPicker defaultValue="#0062df" />
      </div>
      <div className="flex items-center gap-2">
        <span>Hover</span>
        <ColorPicker defaultValue="#52c41a" trigger="hover" />
      </div>
    </div>
  ),
};

export const Controlled: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--controlled"),
    docs: {
      ...storyDescription("components-colorpicker--controlled").docs,
      source: {
        type: "code",
        code: withStoryImports(`function ControlledColorPicker() {
  const [color, setColor] = useState('#0062df');

  return (
    <div className="flex items-center gap-3">
      <ColorPicker
        value={color}
        showText
        onChange={(_, css) => setColor(css)}
      />
      <span
        className="size-8 rounded-md border border-black/10"
        style={{ background: color }}
      />
    </div>
  );
}`),
      },
    },
  },
  render: () => <ControlledColorPicker />,
};

export const CustomTrigger: Story = {
  parameters: {
    ...storyDescription("components-colorpicker--custom-trigger"),
    docs: {
      ...storyDescription("components-colorpicker--custom-trigger").docs,
      source: {
        type: "code",
        code: withStoryImports(`function CustomColorPickerTrigger() {
  const [color, setColor] = useState('#722ed1');

  return (
    <ColorPicker
      value={color}
      onChange={(_, css) => setColor(css)}
    >
      <span
        className="size-4 rounded-full border border-black/10"
        style={{ background: color }}
      />
      <span>테마 색상</span>
    </ColorPicker>
  );
}`),
      },
    },
  },
  render: () => <CustomColorPickerTrigger />,
};

function ControlledColorPicker() {
  const [color, setColor] = useState("#0062df");

  return (
    <div className="flex items-center gap-3">
      <ColorPicker value={color} showText onChange={(_, css) => setColor(css)} />
      <span className="size-8 rounded-md border border-black/10" style={{ background: color }} />
    </div>
  );
}

function CustomColorPickerTrigger() {
  const [color, setColor] = useState("#722ed1");

  return (
    <ColorPicker value={color} onChange={(_, css) => setColor(css)}>
      <span className="size-4 rounded-full border border-black/10" style={{ background: color }} />
      <span>테마 색상</span>
    </ColorPicker>
  );
}
