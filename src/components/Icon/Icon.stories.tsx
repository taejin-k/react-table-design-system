import type { Meta, StoryObj } from '@storybook/react';
import { Icon, type IconName } from './Icon';

const ICON_NAMES: IconName[] = ['add', 'close', 'delete', 'edit', 'edit-square', 'home', 'setting'];

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'currentColor를 따르는 SVG 아이콘입니다. 장식용이 기본이며 onClick 사용 시 접근성 이름과 키보드 조작을 제공합니다.' } } },
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
    <div className="flex flex-wrap gap-6">
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
    'aria-label': '삭제',
    icon: 'delete',
  },
  render: (args) => <Icon {...args} onClick={() => alert(`${args.icon} clicked`)} />,
};
