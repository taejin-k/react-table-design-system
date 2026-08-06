import type { Meta, StoryObj } from '@storybook/react';
import { Icon, type IconName } from './Icon';

const ICON_NAMES: IconName[] = ['add', 'close', 'delete', 'edit', 'edit-square', 'home', 'setting'];

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: 'select',
      options: ICON_NAMES,
    },
    size: { control: 'number' },
    color: { control: 'color' },
  },
  args: {
    icon: 'add',
    size: 16,
    color: '#111111',
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

export const AllIcons: Story = {
  argTypes: {
    icon: { table: { disable: true } },
    size: { table: { disable: true } },
    color: { table: { disable: true } },
  },
  render: () => (
    <div className="flex gap-6">
      {ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-1">
          <Icon icon={name} />
          <span className="text-xs text-[#777777]">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Clickable: Story = {
  args: {
    icon: 'delete',
  },
  render: (args) => <Icon {...args} onClick={() => alert(`${args.icon} clicked`)} />,
};
