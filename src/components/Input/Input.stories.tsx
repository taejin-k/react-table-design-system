import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Icon } from '../Icon';

const SIZES = ['lg', 'md', 'sm'] as const;

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: SIZES,
    },
    variant: {
      control: 'select',
      options: ['default', 'filled'],
    },
    value: { control: 'text' },
    label: { control: 'text' },
    errorText: { control: 'text' },
    maxLength: { control: 'number' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    showCount: { control: 'boolean' },
    prefixIcon: { control: false },
    suffixIcon: { control: false },
  },
  args: {
    size: 'md',
    variant: 'default',
    placeholder: '입력하세요',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

const Controlled = (args: React.ComponentProps<typeof Input>) => {
  const [value, setValue] = useState(args.value ?? '');
  // args.value는 Storybook control 값이므로, control이 바뀌면 내부 상태도 동기화한다.
  useEffect(() => setValue(args.value ?? ''), [args.value]);
  return <Input {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

export const AllSizes: Story = {
  argTypes: {
    size: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      {SIZES.map((size) => (
        <Controlled key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  args: { label: '이름', required: true },
  render: (args) => <Controlled {...args} />,
};

export const WithError: Story = {
  args: { label: '이메일', value: 'not-an-email', errorText: '형식이 올바르지 않습니다' },
  render: (args) => <Controlled {...args} />,
};

export const Filled: Story = {
  args: { variant: 'filled', value: '가나다라마바' },
  render: (args) => <Controlled {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true, value: '가나다라마바' },
  render: (args) => <Controlled {...args} />,
};

export const WithIcon: Story = {
  args: { prefixIcon: <Icon icon="setting" />, allowClear: true, value: '검색어' },
  render: (args) => <Controlled {...args} />,
};

export const WithMaxLength: Story = {
  args: { value: '가나다', maxLength: 10 },
  render: (args) => <Controlled {...args} />,
};
