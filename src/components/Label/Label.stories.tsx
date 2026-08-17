import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Label } from "./Label";

const sizes = ["lg", "md", "sm"] as const;
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  args: { label: "레이블" },
  argTypes: {
    label: { name: "레이블", control: "text" },
    size: { name: "크기", control: "select", options: sizes },
    required: { name: "필수 표시", control: "boolean" },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "입력 항목의 이름을 표시해요.  \n글자 크기를 선택하고 필수 표시를 추가할 수 있어요.",
      },
      page: () => (
        <div className="label-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Label

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 화면에 표시할 레이블이에요. | \`ReactNode\` | - |
| \`size\` | 글자 크기를 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`required\` | 레이블 뒤에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  argTypes: { size: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-label--sizes"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-label--sizes").docs,
      source: {
        code: withStoryImports(`<div className="flex flex-wrap items-center gap-8">
  <Label label="레이블" size="lg" />
  <Label label="레이블" size="md" />
  <Label label="레이블" size="sm" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-8">
      {sizes.map((size) => (
        <Label key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const Required: Story = {
  args: { required: true },
  parameters: { ...storyDescription("components-label--required"), controls: { disable: false } },
};
