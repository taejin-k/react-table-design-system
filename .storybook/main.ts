import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { defaultName: 'Documentation' },
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    server: { ...viteConfig.server, allowedHosts: ['127.0.0.1', 'localhost'] },
  }),
}

export default config
