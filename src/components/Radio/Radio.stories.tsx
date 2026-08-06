import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
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
type Story = StoryObj<typeof Radio>;

const Controlled = (args: React.ComponentProps<typeof Radio>) => {
  const [checked, setChecked] = useState(args.checked);
  useEffect(() => setChecked(args.checked), [args.checked]);
  return <Radio {...args} checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

const StatefulRadio = (props: Omit<React.ComponentProps<typeof Radio>, 'checked' | 'onChange'> & { defaultChecked?: boolean }) => {
  const { defaultChecked = false, ...rest } = props;
  const [checked, setChecked] = useState(defaultChecked);
  return <Radio {...rest} checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
};

export const AllStates: Story = {
  argTypes: {
    checked: { table: { disable: true } },
    disabled: { table: { disable: true } },
    error: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-6">
      <StatefulRadio {...args} defaultChecked={false} />
      <StatefulRadio {...args} defaultChecked={true} />
      <StatefulRadio {...args} error defaultChecked={false} />
      <StatefulRadio {...args} error defaultChecked={true} />
      <Radio {...args} checked={false} disabled />
      <Radio {...args} checked={true} disabled />
    </div>
  ),
};

// ============ 라벨 없음 ============

export const NoLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <StatefulRadio {...args} label={undefined} defaultChecked={false} />
      <StatefulRadio {...args} label={undefined} defaultChecked={true} />
      <Radio {...args} label={undefined} checked={false} disabled />
      <Radio {...args} label={undefined} checked={true} disabled />
    </div>
  ),
};

export const RadioGroup: Story = {
  render: () => <RadioGroupStory />,
};

function RadioGroupStory() {
  const [value, setValue] = useState('a');
  const options = [
    { value: 'a', label: '옵션 A' },
    { value: 'b', label: '옵션 B' },
    { value: 'c', label: '옵션 C' },
  ];
  return (
    <div className="flex items-center gap-6">
      {options.map((option) => (
        <Radio key={option.value} name="story-radio-group" label={option.label} checked={value === option.value} onChange={() => setValue(option.value)} />
      ))}
    </div>
  );
}
