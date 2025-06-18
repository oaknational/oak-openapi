import type { Meta, StoryObj } from '@storybook/react';

import { SimpleButton } from './SimpleButton';

const meta = {
  title: 'Components/simpleButton',
  component: SimpleButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SimpleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Click Me',
  },
}; 