import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Icon } from '../Icon';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'dark', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['lg', 'md', 'sm'],
    },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    shadow: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    htmlType: { table: { disable: true } },
    prefixIcon: { control: false },
    suffixIcon: { control: false },
  },
  args: {
    type: 'primary',
    size: 'md',
    children: 'Button',
    iconOnly: false,
    disabled: false,
    shadow: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    iconOnly: false
  },

  render: (args) => <Button {...args} />
};

export const AllTypes: Story = {
  argTypes: {
    type: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Button {...args} type="primary" />
      <Button {...args} type="secondary" />
      <Button {...args} type="tertiary" />
      <Button {...args} type="dark" />
      <Button {...args} type="ghost" />
    </div>
  ),
};

export const WithShadow: Story = {
  argTypes: {
    type: { table: { disable: true } },
    shadow: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Button {...args} shadow type="primary" />
      <Button {...args} shadow type="secondary" />
      <Button {...args} shadow type="tertiary" />
      <Button {...args} shadow type="dark" />
      <Button {...args} shadow type="ghost" />
    </div>
  ),
};

export const AllSizes: Story = {
  argTypes: {
    size: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Button {...args} size="lg" />
      <Button {...args} size="md" />
      <Button {...args} size="sm" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Button {...args} />,
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    prefixIcon: <Icon icon="add" />,
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: (args) => (
    <div className="w-80">
      <Button {...args} />
    </div>
  ),
};

export const MultipleIcons: Story = {
  render: (args) => (
    <Button
      {...args}
      prefixIcon={[<Icon icon="edit" key="edit" />, <Icon icon="delete" key="delete" />]}
      suffixIcon={<Icon icon="close" />}
    />
  ),
};

export const WithIcon: Story = {
  argTypes: {
    size: { table: { disable: true } },
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['lg', 'md', 'sm'] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <span className="w-6 text-xs text-[#777777]">{size}</span>
          <Button {...args} size={size}>
            Button
          </Button>
          <Button {...args} size={size} prefixIcon={<Icon icon="add" />}>
            Button
          </Button>
          <Button {...args} size={size} suffixIcon={<Icon icon="add" />}>
            Button
          </Button>
          <Button {...args} size={size} prefixIcon={<Icon icon="add" />} suffixIcon={<Icon icon="add" />}>
            Button
          </Button>
        </div>
      ))}
    </div>
  ),
};
