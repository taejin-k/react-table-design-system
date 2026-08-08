import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { Checkbox } from "./Checkbox";
import type { CheckboxProps } from "./Checkbox.types";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    label: "레이블",
  },
  argTypes: {
    label: { name: "레이블", control: "text" },
    checked: { name: "선택", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    error: { name: "오류", control: "boolean" },
    className: { control: false, table: { disable: true } },
    id: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: "선택 여부를 표시하고 레이블과 오류 상태를 함께 표현하는 체크박스예요.",
      },
      page: () => (
        <div className="checkbox-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Checkbox

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 체크박스 오른쪽에 레이블을 표시해요. | \`ReactNode\` | - |
| \`error\` | 테두리와 체크 색상을 오류 색상으로 표시해요. | \`boolean\` | \`false\` |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  parameters: {
    ...storyDescription("components-checkbox--states"),
    controls: { disable: false },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Checkbox label="기본" />
        <Checkbox error label="오류" />
        <Checkbox disabled label="비활성" />
        <Checkbox defaultChecked disabled label="비활성 · 선택" />
      </div>
    ) : (
      <ControlledCheckbox {...args} />
    ),
};

export const Label: Story = {
  argTypes: {
    disabled: { control: false, table: { disable: true } },
    error: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-checkbox--label"),
    controls: { disable: false },
  },
  render: (args) => (
    <div className="grid grid-cols-2 items-start gap-8">
      <ControlledCheckbox {...args} label={undefined} />
      <ControlledCheckbox {...args} />
    </div>
  ),
};

function ControlledCheckbox(args: CheckboxProps) {
  const [checked, setChecked] = useState(Boolean(args.checked));

  useEffect(() => setChecked(Boolean(args.checked)), [args.checked]);

  return (
    <Checkbox
      {...args}
      checked={checked}
      onChange={(event) => {
        setChecked(event.target.checked);
        args.onChange?.(event);
      }}
    />
  );
}
