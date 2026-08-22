import { useEffect, useState, type ComponentType } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Toggle } from "./Toggle";
import type { ToggleProps, ToggleSizeType } from "./Toggle.types";

const sizes: ToggleSizeType[] = ["lg", "md", "sm"];
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Toggle",
  component: Toggle as ComponentType<Partial<ToggleProps>>,
  tags: ["autodocs"],
  argTypes: {
    checked: { name: "선택", control: "boolean" },
    size: { name: "크기", control: "select", options: sizes },
    loading: { name: "로딩", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component: "설정을 켜거나 꺼요.  \n크기를 선택하고 켜짐·비활성 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="toggle-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Toggle

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`checked\` | 켜짐 상태를 설정해요. | \`boolean\` | - |
| \`size\` | Toggle의 크기를 설정해요. | [\`ToggleSizeType\`](#toggle-size) | \`md\` |
| \`loading\` | thumb 안에 로딩을 표시하고 전환 동작을 막아요. | \`boolean\` | \`false\` |
| \`disabled\` | Toggle을 비활성화하고 전환 동작을 막아요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 상태가 바뀔 때 실행할 함수예요. 변경된 상태를 인자로 받아요. | \`(checked: boolean) => void\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="toggle-size">ToggleSizeType</h3>
          <p>Toggle의 크기를 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <ToggleSizeCode key={size} size={size} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<Partial<ToggleProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

function ToggleSizeCode({ size }: { size: ToggleSizeType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {size}
    </code>
  );
}

export const Sizes: Story = {
  args: { checked: false },
  parameters: {
    ...storyDescription("components-toggle--sizes"),
    controls: { disable: false, include: ["크기"] },
    docs: {
      ...storyDescription("components-toggle--sizes").docs,
      source: {
        code: withStoryImports(`function ToggleSizes() {
  const [large, setLarge] = useState(false);
  const [medium, setMedium] = useState(false);
  const [small, setSmall] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-8">
      <Toggle size="lg" checked={large} onChange={setLarge} />
      <Toggle size="md" checked={medium} onChange={setMedium} />
      <Toggle size="sm" checked={small} onChange={setSmall} />
    </div>
  );
}`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-center gap-8">
        {sizes.map((size) => (
          <ControlledToggle key={size} {...args} size={size} />
        ))}
      </div>
    ) : (
      <ControlledToggle {...args} />
    ),
};

export const States: Story = {
  args: { checked: false },
  parameters: {
    ...storyDescription("components-toggle--states"),
    controls: { disable: false, include: ["선택", "비활성"] },
    docs: {
      ...storyDescription("components-toggle--states").docs,
      source: {
        code: withStoryImports(`function ToggleStates() {
  const [unchecked, setUnchecked] = useState(false);
  const [checked, setChecked] = useState(true);

  return (
    <div className="flex flex-wrap items-center gap-8">
      <Toggle checked={unchecked} onChange={setUnchecked} />
      <Toggle checked={checked} onChange={setChecked} />
      <Toggle checked={false} disabled />
      <Toggle checked disabled />
    </div>
  );
}`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-center gap-8">
        <ControlledToggle checked={false} />
        <ControlledToggle checked />
        <Toggle checked={false} disabled />
        <Toggle checked disabled />
      </div>
    ) : (
      <ControlledToggle {...args} />
    ),
};

export const Loading: Story = {
  args: { checked: false },
  parameters: {
    ...storyDescription("components-toggle--loading"),
    controls: { disable: false, include: ["선택", "크기", "로딩"] },
    docs: {
      ...storyDescription("components-toggle--loading").docs,
      source: {
        code: withStoryImports(`function LoadingToggle() {
  const [checked, setChecked] = useState(false);
  const [pendingChecked, setPendingChecked] = useState(null);

  useEffect(() => {
    if (pendingChecked === null) return;
    const timeout = setTimeout(() => {
      setChecked(pendingChecked);
      setPendingChecked(null);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [pendingChecked]);

  const handleChange = (nextChecked) => {
    setPendingChecked(nextChecked);
  };

  return (
    <Toggle
      checked={checked}
      loading={pendingChecked !== null}
      onChange={handleChange}
    />
  );
}`),
      },
    },
  },
  render: (args) => <LoadingToggle args={args} />,
};

function LoadingToggle({ args }: { args: Partial<ToggleProps> }) {
  const [checked, setChecked] = useState(args.checked ?? false);
  const [pendingChecked, setPendingChecked] = useState<boolean | null>(null);

  useEffect(() => setChecked(args.checked ?? false), [args.checked]);
  useEffect(() => {
    if (pendingChecked === null) return;
    const timeout = setTimeout(() => {
      setChecked(pendingChecked);
      setPendingChecked(null);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [pendingChecked]);

  const handleChange = (nextChecked: boolean) => {
    setPendingChecked(nextChecked);
  };

  return (
    <Toggle
      {...args}
      checked={checked}
      loading={pendingChecked !== null || args.loading}
      onChange={handleChange}
    />
  );
}

function ControlledToggle(args: Partial<ToggleProps>) {
  const [checked, setChecked] = useState(args.checked ?? false);
  useEffect(() => setChecked(args.checked ?? false), [args.checked]);
  return <Toggle {...args} checked={checked} onChange={setChecked} />;
}
