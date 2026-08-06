import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';

const SIZES = ['lg', 'md', 'sm'] as const;

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: SIZES,
    },
    required: { control: 'boolean' },
  },
  args: {
    size: 'md',
    required: false,
    children: 'Label',
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const AllSizes: Story = {
  argTypes: {
    size: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-4">
      {SIZES.map((size) => (
        <Label key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const Required: Story = {
  args: { required: true },
};
