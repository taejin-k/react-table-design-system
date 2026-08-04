import { createElement } from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import '../src/components/Table/Table.stories.css'
import { tableStoryDescriptions } from '../src/components/Table/Table.story-descriptions'

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'todo' },
    backgrounds: { default: 'canvas', values: [{ name: 'canvas', value: '#ffffff' }, { name: 'layout', value: '#f5f5f5' }, { name: 'dark', value: '#141414' }] },
  },
  decorators: [
    (Story, context) => {
      const description = context.parameters.docs?.description?.story ?? tableStoryDescriptions[context.id]
      if (!description) return createElement(Story)
      return createElement('div', { className: 'story-documented-frame' },
        createElement('aside', { className: 'story-description', role: 'note', 'aria-label': 'Story 기능 설명' },
          createElement('span', null, context.title.replace('Design System/Table/', '').replace('Design System/Table', 'Table')),
          createElement('strong', null, context.name),
          createElement('p', null, String(description)),
        ),
        createElement(Story),
      )
    },
  ],
}

export default preview
