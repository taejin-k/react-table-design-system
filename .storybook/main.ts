import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  features: {
    actions: false,
    interactions: false,
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: { defaultName: "Documentation" },
};

export default config;
