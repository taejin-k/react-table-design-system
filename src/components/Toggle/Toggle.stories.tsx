import { useEffect, useState } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Toggle } from "./Toggle";
import type { ToggleProps } from "./Toggle.types";

const sizes = ["lg", "md", "sm"] as const;
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: { size: "md", checked: false, disabled: false },
  argTypes: {
    size: { name: "크기", control: "select", options: sizes },
    checked: { name: "선택", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: "설정을 켜거나 꺼요.  \n크기를 선택하고 켜짐·비활성 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="toggle-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Toggle

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`size\` | Toggle의 크기를 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`checked\` | 켜짐 상태를 설정해요. | \`boolean\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 상태가 바뀔 때 실행할 함수예요. 변경된 상태를 인자로 받아요. | \`(checked: boolean) => void\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-toggle--sizes"),
    controls: { disable: false, include: ["크기"] },
    docs: {
      ...storyDescription("components-toggle--sizes").docs,
      source: {
        code: withStoryImports(`function LargeToggle() {
  const [enabled, setEnabled] = useState(false);

  return <Toggle size="lg" checked={enabled} onChange={setEnabled} />;
}`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-center gap-8">
        {sizes.map((size) => (
          <ControlledToggle key={size} {...args} size={size} />
        ))}
      </div>
    ) : (
      <ControlledToggle {...args} />
    ),
};

export const States: Story = {
  parameters: {
    ...storyDescription("components-toggle--states"),
    controls: { disable: false, include: ["선택", "비활성"] },
    docs: {
      ...storyDescription("components-toggle--states").docs,
      source: {
        code: withStoryImports(`function BasicToggle() {
  const [enabled, setEnabled] = useState(false);

  return <Toggle checked={enabled} onChange={setEnabled} />;
}`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-center gap-8">
        <ControlledToggle checked={false} />
        <ControlledToggle checked />
        <Toggle checked={false} disabled />
        <Toggle checked disabled />
      </div>
    ) : (
      <ControlledToggle {...args} />
    ),
};

function ControlledToggle(args: ToggleProps) {
  const [checked, setChecked] = useState(args.checked);
  useEffect(() => setChecked(args.checked), [args.checked]);
  return <Toggle {...args} checked={checked} onChange={setChecked} />;
}
