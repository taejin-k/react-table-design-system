import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";
import { Icon } from "../Icon";

const colors = ["green", "navy", "red", "grey", "black", "purple", "blue"] as const;
const variants = ["filled", "soft-filled", "outlined"] as const;

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "상태와 범주를 짧게 표현하는 레이블 컴포넌트로, 색상·표현 방식·앞뒤 아이콘을 지원합니다.",
      },
    },
  },
  argTypes: {
    color: {
      control: "select",
      options: colors,
    },
    variant: {
      control: "select",
      options: variants,
    },
    prefixIcon: { control: false },
    suffixIcon: { control: false },
  },
  args: {
    color: "green",
    variant: "filled",
    children: "텍스트",
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  render: (args) => <Chip {...args} />,
};

export const AllColors: Story = {
  argTypes: {
    color: { table: { disable: true } },
    variant: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      {variants.map((variant) => (
        <div key={variant} className="flex items-center gap-2">
          {colors.map((color) => (
            <Chip key={color} {...args} variant={variant} color={color} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  argTypes: {
    variant: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      {variants.map((variant) => (
        <div key={variant} className="flex items-center gap-2">
          <Chip {...args} variant={variant} />
          <Chip {...args} variant={variant} prefixIcon={<Icon icon="edit" />} />
          <Chip {...args} variant={variant} suffixIcon={<Icon icon="edit" />} />
          <Chip
            {...args}
            variant={variant}
            prefixIcon={<Icon icon="edit" />}
            suffixIcon={<Icon icon="edit" />}
          />
        </div>
      ))}
    </div>
  ),
};
