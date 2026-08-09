import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { Icon } from "../Icon";
import { Button } from "./Button";
import type { ButtonProps } from "./Button.types";

type IconMode = "none" | "prefix" | "suffix" | "both" | "multiple" | "iconOnly";

interface ButtonStoryArgs extends ButtonProps {
  iconMode?: IconMode;
}

const buttonTypes = ["primary", "secondary", "tertiary", "dark", "ghost"] as const;
const buttonSizes = ["lg", "md", "sm"] as const;

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Button",
  component: Button as ComponentType<ButtonStoryArgs>,
  tags: ["autodocs"],
  args: {
    type: "primary",
    size: "md",
    children: "Button",
  },
  argTypes: {
    type: { control: "select", options: buttonTypes },
    size: { control: "select", options: buttonSizes },
    children: { name: "버튼 이름", control: "text" },
    disabled: { name: "비활성", control: "boolean" },
    shadow: { name: "그림자", control: "boolean" },
    fullWidth: { name: "전체 너비", control: "boolean" },
    iconOnly: { control: false, table: { disable: true } },
    htmlType: { control: false, table: { disable: true } },
    prefixIcon: { control: false, table: { disable: true } },
    suffixIcon: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onClick: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "클릭해서 특정 동작을 실행해요.  \n중요도에 따라 타입과 크기를 선택하고 아이콘·비활성 상태·그림자·전체 너비를 설정할 수 있어요.",
      },
      page: () => (
        <div className="button-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Button

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`type\` | 버튼의 시각적 우선순위를 설정해요. | \`primary \\| secondary \\| tertiary \\| dark \\| ghost\` | \`primary\` |
| \`size\` | 버튼의 높이와 내부 여백을 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`prefixIcon\` | 버튼 이름 앞에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`suffixIcon\` | 버튼 이름 뒤에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`iconOnly\` | 아이콘만 표시하는 정사각형 버튼으로 만들어요. | \`boolean\` | \`false\` |
| \`shadow\` | 버튼에 그림자를 표시해요. | \`boolean\` | \`false\` |
| \`fullWidth\` | 부모 요소의 너비를 모두 채워요. | \`boolean\` | \`false\` |
| \`className\` | 외부에서 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 버튼을 클릭할 때 실행할 함수예요. | \`MouseEventHandler<HTMLButtonElement>\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<ButtonStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Types: Story = {
  argTypes: {
    type: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    shadow: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-button--types"),
    controls: { disable: false },
  },
  render: ({ iconMode: _iconMode, ...args }) => (
    <div className="flex flex-wrap items-center gap-2">
      {buttonTypes.map((type) => (
        <Button {...args} key={type} type={type}>
          Button
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  argTypes: {
    size: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    shadow: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-button--sizes"),
    controls: { disable: false },
  },
  render: ({ iconMode: _iconMode, ...args }) => (
    <div className="flex flex-wrap items-center gap-2">
      {buttonSizes.map((size) => (
        <Button {...args} key={size} size={size}>
          Button
        </Button>
      ))}
    </div>
  ),
};

export const States: Story = {
  argTypes: {
    children: { control: false, table: { disable: true } },
    disabled: { control: false, table: { disable: true } },
    shadow: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-button--states"),
    controls: { disable: false },
  },
  render: ({ iconMode: _iconMode, ...args }) => (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button {...args}>기본</Button>
        <Button {...args} shadow>
          그림자
        </Button>
        <Button {...args} disabled>
          비활성
        </Button>
      </div>
      <div className="w-80 max-w-full">
        <Button {...args} fullWidth>
          전체 너비
        </Button>
      </div>
    </div>
  ),
};

export const Icons: Story = {
  args: { iconMode: "prefix" },
  argTypes: {
    type: { control: false, table: { disable: true } },
    size: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    shadow: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
    iconMode: {
      name: "아이콘 구성",
      control: "select",
      options: ["none", "prefix", "suffix", "both", "multiple", "iconOnly"],
    },
  },
  parameters: {
    ...storyDescription("components-button--icons"),
    controls: { disable: false },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-center gap-2">
        {(["none", "prefix", "suffix", "both", "multiple", "iconOnly"] as const).map((mode) =>
          renderIconButton(args, mode),
        )}
      </div>
    ) : (
      <div className="flex items-center">{renderIconButton(args, args.iconMode ?? "prefix")}</div>
    ),
};

function renderIconButton({ iconMode: _iconMode, ...args }: ButtonStoryArgs, mode: IconMode) {
  const addIcon = <Icon icon="add" />;

  switch (mode) {
    case "prefix":
      return (
        <Button {...args} key={mode} prefixIcon={addIcon}>
          Button
        </Button>
      );
    case "suffix":
      return (
        <Button {...args} key={mode} suffixIcon={addIcon}>
          Button
        </Button>
      );
    case "both":
      return (
        <Button {...args} key={mode} prefixIcon={addIcon} suffixIcon={addIcon}>
          Button
        </Button>
      );
    case "multiple":
      return (
        <Button
          {...args}
          key={mode}
          prefixIcon={[<Icon icon="edit" key="edit" />, <Icon icon="delete" key="delete" />]}
          suffixIcon={<Icon icon="close" />}
        >
          Button
        </Button>
      );
    case "iconOnly":
      return <Button {...args} key={mode} iconOnly prefixIcon={addIcon} />;
    default:
      return (
        <Button {...args} key={mode}>
          Button
        </Button>
      );
  }
}
