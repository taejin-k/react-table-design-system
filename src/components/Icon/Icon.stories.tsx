import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState, type ComponentType } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon, iconGalleryNames } from "./Icon";
import type { IconNameType, IconProps } from "./Icon.types";
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Icon",
  component: Icon as ComponentType<Partial<IconProps>>,
  tags: ["autodocs"],
  argTypes: {
    icon: { name: "아이콘", control: "select", options: iconGalleryNames },
    size: { name: "크기", control: "number" },
    color: { name: "색상", control: "color" },
    loading: { name: "로딩", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    className: { control: false, table: { disable: true } },
    onClick: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
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
| \`icon\` | 표시할 아이콘 이름을 설정해요. | [\`IconNameType\`](#icon-name) | - |
| \`size\` | 아이콘의 가로와 세로 크기를 설정해요. | \`number\` | \`16\` |
| \`color\` | 아이콘 색상을 설정해요. 지정하지 않으면 주변 텍스트 색상을 따라요. | \`CSSProperties['color']\` | \`currentColor\` |
| \`loading\` | 기존 아이콘 대신 로딩을 표시하고 동작을 막아요. | \`boolean\` | \`false\` |
| \`disabled\` | 비활성 색상으로 표시하고 동작을 막아요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 아이콘을 클릭할 때 실행할 함수예요. | \`MouseEventHandler<SVGSVGElement>\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="icon-name">IconNameType</h3>
          <p>표시할 아이콘 이름을 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {iconGalleryNames.map((name) => (
              <IconNameCode key={name} name={name} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<Partial<IconProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

function IconNameCode({ name }: { name: IconNameType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {name}
    </code>
  );
}

function IconGallery({ args }: { args: Partial<IconProps> }) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredNames = normalizedSearch
    ? iconGalleryNames.filter((name) => name.includes(normalizedSearch))
    : iconGalleryNames;

  return (
    <div className="w-full">
      <label className="mb-8 block max-w-80">
        <span className="sr-only">아이콘 검색</span>
        <div className="relative">
          <Icon
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            color="#666"
            icon="search"
          />
          <input
            className="h-10 w-full rounded-md border border-[#d9d9d9] bg-white pr-3 pl-9 text-sm outline-none placeholder:text-[#999] focus:border-[#0062df]"
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="아이콘 이름 검색"
            type="search"
            value={search}
          />
        </div>
      </label>

      {filteredNames.length ? (
        <div className="grid w-full grid-cols-6 gap-x-6 gap-y-6">
          {filteredNames.map((name) => (
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
      ) : (
        <p className="py-12 text-center text-sm text-[#666]">검색 결과가 없어요.</p>
      )}
    </div>
  );
}

export const Icons: Story = {
  args: { loading: false, disabled: false },
  parameters: {
    ...storyDescription("components-icon--icons"),
    controls: { disable: false, include: ["크기", "색상", "로딩", "비활성"] },
    docs: {
      ...storyDescription("components-icon--icons").docs,
      canvas: { sourceState: "none" },
    },
  },
  argTypes: { icon: { control: false, table: { disable: true } } },
  render: (args) => <IconGallery args={args} />,
};

export const SizeAndColor: Story = {
  args: { icon: "add", size: 24, color: "#0062df" },
  parameters: {
    ...storyDescription("components-icon--size-and-color"),
    controls: { disable: false, include: ["아이콘", "크기", "색상"] },
  },
};

export const Clickable: Story = {
  args: { icon: "delete-outlined", loading: false, disabled: false },
  parameters: {
    ...storyDescription("components-icon--clickable"),
    controls: { disable: false, include: ["아이콘", "크기", "색상", "로딩", "비활성"] },
    docs: {
      ...storyDescription("components-icon--clickable").docs,
      source: {
        code: withStoryImports(`<Icon
  icon="delete-outlined"
  onClick={() => window.alert('아이콘을 클릭했어요.')}
/>`),
      },
    },
  },
  render: (args) => (
    <Icon
      {...args}
      icon={args.icon ?? "delete-outlined"}
      onClick={() => window.alert("아이콘을 클릭했어요.")}
    />
  ),
};

export const Loading: Story = {
  args: { color: "#0062df", icon: "close", size: 24, disabled: false },
  parameters: {
    ...storyDescription("components-icon--loading"),
    controls: { disable: false, include: ["아이콘", "크기", "색상", "비활성"] },
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

function LoadingIcon({ args }: { args: Partial<IconProps> }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <Icon
      {...args}
      icon={args.icon ?? "close"}
      loading={loading || args.loading}
      onClick={() => setLoading(true)}
    />
  );
}

export const Disabled: Story = {
  args: { disabled: true, icon: "delete-outlined" },
  parameters: {
    ...storyDescription("components-icon--disabled"),
    controls: { disable: false, include: ["아이콘", "크기", "색상"] },
    docs: {
      ...storyDescription("components-icon--disabled").docs,
      source: {
        code: withStoryImports(`<Icon
  disabled
  icon="delete-outlined"
  onClick={() => window.alert('아이콘을 클릭했어요.')}
/>`),
      },
    },
  },
  render: (args) => (
    <Icon
      {...args}
      icon={args.icon ?? "delete-outlined"}
      onClick={() => window.alert("아이콘을 클릭했어요.")}
    />
  ),
};
