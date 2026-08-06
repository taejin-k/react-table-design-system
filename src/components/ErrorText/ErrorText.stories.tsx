import type { Meta, StoryObj } from '@storybook/react';
import { ErrorText } from './ErrorText';

const meta: Meta<typeof ErrorText> = {
  title: 'Components/ErrorText',
  component: ErrorText,
  tags: ['autodocs'],
  args: {
    children: 'Error message',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorText>;

export const Default: Story = {};

export const Empty: Story = {
  args: { children: undefined },
};
