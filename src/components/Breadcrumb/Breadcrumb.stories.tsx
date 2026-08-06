import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [{ title: 'Home', href: '/' }, { title: 'Components', path: 'components' }, { title: 'Breadcrumb' }],
  },
};

export const CustomSeparator: Story = {
  args: {
    separator: '>',
    items: [{ title: 'Home', href: '/' }, { title: 'Components', path: 'components' }, { title: 'Breadcrumb' }],
  },
};

export const WithDropdownMenu: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { title: 'Home', href: '/' },
        {
          title: 'Components',
          menu: {
            items: [
              { label: 'Button', path: 'button' },
              { label: 'Input', path: 'input' },
              { type: 'divider' },
              { label: '비활성', disabled: true, path: 'disabled' },
            ],
          },
        },
        { title: 'Breadcrumb' },
      ]}
    />
  ),
};

export const WithParams: Story = {
  render: () => (
    <Breadcrumb
      params={{ id: '42' }}
      items={[
        { title: 'Home', href: '/' },
        { title: 'User :id', path: 'users/:id' },
      ]}
    />
  ),
};

export const CustomItemRender: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { title: 'Home', href: '/' },
        { title: 'Components', path: 'components' },
        { title: 'Breadcrumb' },
      ]}
      itemRender={(route, _params, _routes, paths) => (
        <span>
          {route.type === 'separator' ? null : route.title} {paths.length > 0 && `(${paths.join('/')})`}
        </span>
      )}
    />
  ),
};

export const LegacyItemApi: Story = {
  render: () => (
    <Breadcrumb>
      <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
      <Breadcrumb.Item>Components</Breadcrumb.Item>
      <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
    </Breadcrumb>
  ),
};
