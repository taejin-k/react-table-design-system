import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./Toggle";

const SIZES = ["lg", "md", "sm"] as const;

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "checked와 onChange로 상태를 제어하며 switch 역할과 키보드 조작을 제공하는 토글입니다.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: SIZES,
    },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    "aria-label": "설정 사용",
    size: "md",
    checked: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

const Controlled = (args: React.ComponentProps<typeof Toggle>) => {
  const [checked, setChecked] = useState(args.checked);
  // args.checked는 Storybook control 값이므로, control이 바뀌면 내부 상태도 동기화한다.
  useEffect(() => setChecked(args.checked), [args.checked]);
  return <Toggle {...args} checked={checked} onChange={setChecked} />;
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

export const AllSizes: Story = {
  argTypes: {
    size: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-4">
      {SIZES.map((size) => (
        <Controlled key={size} {...args} aria-label={`${size} 크기 설정 사용`} size={size} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  argTypes: {
    checked: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Toggle {...args} aria-label="꺼진 설정" checked={false} />
      <Toggle {...args} aria-label="켜진 설정" checked={true} />
    </div>
  ),
};
