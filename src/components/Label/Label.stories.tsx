import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Label } from "./Label";
import type { LabelProps, LabelSizeType } from "./Label.types";

const sizes: LabelSizeType[] = ["lg", "md", "sm"];
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Label",
  component: Label as ComponentType<Partial<LabelProps>>,
  tags: ["autodocs"],
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
| \`size\` | 글자 크기를 설정해요. | [\`LabelSizeType\`](#label-size) | \`md\` |
| \`required\` | 레이블 뒤에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="label-size">LabelSizeType</h3>
          <p>Label의 글자 크기를 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <LabelSizeCode key={size} size={size} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<Partial<LabelProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

function LabelSizeCode({ size }: { size: LabelSizeType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {size}
    </code>
  );
}

export const Sizes: Story = {
  args: { label: "레이블" },
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
        <Label key={size} {...args} label={args.label ?? "레이블"} size={size} />
      ))}
    </div>
  ),
};

export const Required: Story = {
  args: { label: "레이블", required: true },
  parameters: { ...storyDescription("components-label--required"), controls: { disable: false } },
};
