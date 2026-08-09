import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
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
        component:
          "항목을 선택하거나 선택 해제해요.  \n레이블을 표시하고 오류·비활성 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="checkbox-docs component-docs">
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
| \`indeterminate\` | 일부 항목만 선택된 중간 상태를 표시해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 선택 상태가 바뀔 때 실행할 함수예요. | \`ChangeEventHandler<HTMLInputElement>\` | - |
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
    docs: {
      source: {
        code: withStoryImports(`function CheckboxStates() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <Checkbox
        checked={checked}
        label="기본"
        onChange={(event) => setChecked(event.target.checked)}
      />
      <Checkbox error label="오류" />
      <Checkbox disabled label="비활성" />
      <Checkbox defaultChecked disabled label="비활성 · 선택" />
    </div>
  );
}`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
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
    docs: {
      source: {
        code: withStoryImports(`function CheckboxLabels() {
  const [withoutLabel, setWithoutLabel] = useState(false);
  const [withLabel, setWithLabel] = useState(false);

  return (
    <div className="flex items-center gap-8">
      <Checkbox
        checked={withoutLabel}
        onChange={(event) => setWithoutLabel(event.target.checked)}
      />
      <Checkbox
        checked={withLabel}
        label="레이블"
        onChange={(event) => setWithLabel(event.target.checked)}
      />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-8">
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
