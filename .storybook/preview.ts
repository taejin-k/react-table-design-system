import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import '../src/components/Table/Table.stories.css'

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'todo' },
    backgrounds: { default: 'canvas', values: [{ name: 'canvas', value: '#ffffff' }, { name: 'layout', value: '#f5f5f5' }, { name: 'dark', value: '#141414' }] },
  },
}

export default preview
