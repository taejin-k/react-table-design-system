import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { Icon } from "./Icon";
import type { IconName } from "./Icon.types";

const iconNames: IconName[] = ["add", "close", "delete", "edit", "edit-square", "home", "setting"];
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: { icon: "add" },
  argTypes: {
    icon: { name: "아이콘", control: "select", options: iconNames },
    size: { name: "크기", control: "number" },
    color: { name: "색상", control: "color" },
    className: { control: false, table: { disable: true } },
    onClick: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "화면의 동작이나 의미를 아이콘으로 전달해요.  \n아이콘 종류·크기·색상과 클릭 동작을 설정할 수 있어요.",
      },
      page: () => (
        <div className="icon-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Icon

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`icon\` | 표시할 아이콘 이름을 설정해요. | \`IconName\` | - |
| \`size\` | 아이콘의 가로와 세로 크기를 설정해요. | \`number\` | \`16\` |
| \`color\` | 아이콘 색상을 설정해요. | \`string\` | \`currentColor\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 아이콘을 클릭할 때 실행할 함수예요. | \`MouseEventHandler<SVGSVGElement>\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Icons: Story = {
  parameters: { ...storyDescription("components-icon--icons"), controls: { disable: false } },
  render: (args) => (
    <div className="flex flex-wrap items-end gap-8">
      {iconNames.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon {...args} icon={name} />
          <span className="text-xs text-[#666]">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const SizeAndColor: Story = {
  args: { size: 24, color: "#0062df" },
  parameters: {
    ...storyDescription("components-icon--size-and-color"),
    controls: { disable: false },
  },
};

export const Clickable: Story = {
  args: { icon: "delete", onClick: fn() },
  parameters: { ...storyDescription("components-icon--clickable"), controls: { disable: false } },
};
