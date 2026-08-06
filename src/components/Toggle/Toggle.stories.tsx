import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const SIZES = ['lg', 'md', 'sm'] as const;

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: SIZES,
    },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    size: 'md',
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
        <Controlled key={size} {...args} size={size} />
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
      <Toggle {...args} checked={false} />
      <Toggle {...args} checked={true} />
    </div>
  ),
};
