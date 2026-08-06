import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
  args: {
    label: '레이블',
    checked: false,
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

const Controlled = (args: React.ComponentProps<typeof Checkbox>) => {
  const [checked, setChecked] = useState(args.checked);
  useEffect(() => setChecked(args.checked), [args.checked]);
  return <Checkbox {...args} checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

const StatefulCheckbox = (props: Omit<React.ComponentProps<typeof Checkbox>, 'checked' | 'onChange'> & { defaultChecked?: boolean }) => {
  const { defaultChecked = false, ...rest } = props;
  const [checked, setChecked] = useState(defaultChecked);
  return <Checkbox {...rest} checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
};

export const AllStates: Story = {
  argTypes: {
    checked: { table: { disable: true } },
    disabled: { table: { disable: true } },
    error: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-6">
      <StatefulCheckbox {...args} defaultChecked={false} />
      <StatefulCheckbox {...args} defaultChecked={true} />
      <StatefulCheckbox {...args} error defaultChecked={false} />
      <StatefulCheckbox {...args} error defaultChecked={true} />
      <Checkbox {...args} checked={false} disabled />
      <Checkbox {...args} checked={true} disabled />
    </div>
  ),
};

// ============ 라벨 없음 ============

export const NoLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <StatefulCheckbox {...args} label={undefined} defaultChecked={false} />
      <StatefulCheckbox {...args} label={undefined} defaultChecked={true} />
      <Checkbox {...args} label={undefined} checked={false} disabled />
      <Checkbox {...args} label={undefined} checked={true} disabled />
    </div>
  ),
};
