import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { Icon } from "../Icon";
import { Chip } from "./Chip";

const colors = ["green", "navy", "red", "grey", "black", "purple", "blue"] as const;
const variants = ["filled", "soft-filled", "outlined"] as const;
const handleIconClick = fn();

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  args: { children: "텍스트", color: "green", variant: "filled" },
  argTypes: {
    color: { name: "색상", control: "select", options: colors },
    variant: { name: "표현 방식", control: "select", options: variants },
    prefixIcon: { control: false, table: { disable: true } },
    suffixIcon: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "상태나 범주를 짧은 텍스트로 표시해요.  \n색상·표현 방식과 앞뒤 아이콘을 설정할 수 있어요.",
      },
      page: () => (
        <div className="chip-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Chip

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`color\` | Chip의 색상을 설정해요. | \`green \\| navy \\| red \\| grey \\| black \\| purple \\| blue\` | \`green\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | \`filled \\| soft-filled \\| outlined\` | \`filled\` |
| \`prefixIcon\` | 텍스트 앞에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`suffixIcon\` | 텍스트 뒤에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  parameters: { ...storyDescription("components-chip--variants"), controls: { disable: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Chip key={variant} {...args} variant={variant} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  parameters: { ...storyDescription("components-chip--colors"), controls: { disable: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {colors.map((color) => (
        <Chip key={color} {...args} color={color} />
      ))}
    </div>
  ),
};

export const Icons: Story = {
  parameters: { ...storyDescription("components-chip--icons"), controls: { disable: false } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Chip {...args} />
      <Chip {...args} prefixIcon={<Icon icon="edit" />} />
      <Chip {...args} suffixIcon={<Icon icon="close" onClick={handleIconClick} />} />
      <Chip
        {...args}
        prefixIcon={<Icon icon="edit" />}
        suffixIcon={<Icon icon="close" onClick={handleIconClick} />}
      />
    </div>
  ),
};
