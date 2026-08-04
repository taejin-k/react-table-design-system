import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import '../src/table/stories.css'

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'todo' },
    backgrounds: { default: 'canvas', values: [{ name: 'canvas', value: '#f8fafc' }, { name: 'dark', value: '#0f172a' }] },
  },
}

export default preview
