import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '네이티브 checkbox 동작을 유지하면서 레이블, 오류, 비활성 표현을 제공하는 선택 컴포넌트입니다.' } } },
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
    <div className="flex flex-wrap items-center gap-6">
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
      <StatefulCheckbox {...args} aria-label="선택 안 됨" label={undefined} defaultChecked={false} />
      <StatefulCheckbox {...args} aria-label="선택됨" label={undefined} defaultChecked={true} />
      <Checkbox {...args} aria-label="비활성 선택 안 됨" label={undefined} checked={false} disabled />
      <Checkbox {...args} aria-label="비활성 선택됨" label={undefined} checked={true} disabled />
    </div>
  ),
};
