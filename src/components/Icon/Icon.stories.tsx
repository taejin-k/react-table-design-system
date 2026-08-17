import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon, iconNames } from "./Icon";
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
    loading: { name: "로딩", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
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
| \`loading\` | 기존 아이콘 대신 로딩을 표시하고 동작을 막아요. | \`boolean\` | \`false\` |
| \`disabled\` | 비활성 색상으로 표시하고 동작을 막아요. | \`boolean\` | \`false\` |
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
  argTypes: { icon: { control: false, table: { disable: true } } },
  render: (args) => (
    <div className="grid w-full grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {iconNames.map((name) => (
        <div key={name} className="grid min-w-0 place-items-center gap-2">
          <span
            className="flex min-h-6 items-center justify-center"
            style={{ minHeight: Math.max(args.size ?? 16, 24) }}
          >
            <Icon {...args} icon={name} />
          </span>
          <span className="flex h-8 max-w-full items-start justify-center text-center text-xs leading-4 break-words text-[#666]">
            {name}
          </span>
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
  args: { icon: "delete" },
  parameters: {
    ...storyDescription("components-icon--clickable"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-icon--clickable").docs,
      source: {
        code: withStoryImports(`<Icon
  icon="delete"
  onClick={() => window.alert('아이콘을 클릭했어요.')}
/>`),
      },
    },
  },
  render: (args) => <Icon {...args} onClick={() => window.alert("아이콘을 클릭했어요.")} />,
};

export const Loading: Story = {
  args: { color: "#0062df", icon: "close", size: 24 },
  parameters: {
    ...storyDescription("components-icon--loading"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-icon--loading").docs,
      source: {
        code: withStoryImports(`function LoadingIcon() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <Icon
      color="#0062df"
      icon="close"
      loading={loading}
      size={24}
      onClick={() => setLoading(true)}
    />
  );
}`),
      },
    },
  },
  render: (args) => <LoadingIcon args={args} />,
};

function LoadingIcon({ args }: { args: Parameters<typeof Icon>[0] }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return <Icon {...args} loading={loading || args.loading} onClick={() => setLoading(true)} />;
}

export const Disabled: Story = {
  args: { disabled: true, icon: "delete" },
  parameters: {
    ...storyDescription("components-icon--disabled"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-icon--disabled").docs,
      source: {
        code: withStoryImports(`<Icon
  disabled
  icon="delete"
  onClick={() => window.alert('아이콘을 클릭했어요.')}
/>`),
      },
    },
  },
  render: (args) => <Icon {...args} onClick={() => window.alert("아이콘을 클릭했어요.")} />,
};
