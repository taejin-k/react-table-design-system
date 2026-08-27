import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Button } from "./Button";
import type { ButtonProps, ButtonSizeType, ButtonVariantType } from "./Button.types";

type IconMode = "default" | "prefix" | "suffix" | "both" | "iconOnly";

interface ButtonStoryArgs extends ButtonProps {
  iconMode?: IconMode;
}

const buttonVariants: ButtonVariantType[] = [
  "primary",
  "danger",
  "secondary",
  "tertiary",
  "dark",
  "ghost",
];
const buttonSizes: ButtonSizeType[] = ["lg", "md", "sm"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Button",
  component: Button as ComponentType<ButtonStoryArgs>,
  tags: ["autodocs"],
  argTypes: {
    variant: { name: "종류", control: "select", options: buttonVariants },
    size: { name: "크기", control: "select", options: buttonSizes },
    children: { name: "버튼 이름", control: "text" },
    disabled: { name: "비활성", control: "boolean" },
    shadow: { name: "그림자", control: "boolean" },
    fullWidth: { name: "전체 너비", control: "boolean" },
    rounded: { name: "둥근 모양", control: "boolean" },
    loading: { name: "로딩", control: "boolean" },
    iconOnly: { control: false, table: { disable: true } },
    type: { control: false, table: { disable: true } },
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
          "클릭해서 특정 동작을 실행해요.  \n종류와 크기를 선택하고 아이콘·로딩·비활성 상태·둥근 모양·그림자·전체 너비를 설정할 수 있어요.",
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
| \`variant\` | 버튼의 시각적 우선순위를 설정해요. | [\`ButtonVariantType\`](#button-variant) | \`primary\` |
| \`size\` | 버튼의 높이와 내부 여백을 설정해요. | [\`ButtonSizeType\`](#button-size) | \`md\` |
| \`prefixIcon\` | 버튼 이름 앞에 단일 아이콘을 표시해요. | \`ReactElement\` | - |
| \`suffixIcon\` | 버튼 이름 뒤에 단일 아이콘을 표시해요. | \`ReactElement\` | - |
| \`iconOnly\` | 아이콘만 표시하는 정사각형 버튼으로 만들어요. | \`boolean\` | \`false\` |
| \`loading\` | 아이콘 자리에 로딩을 표시하고 클릭을 막아요. | \`boolean\` | \`false\` |
| \`shadow\` | 버튼에 그림자를 표시해요. | \`boolean\` | \`false\` |
| \`fullWidth\` | 부모 요소의 너비를 모두 채워요. | \`boolean\` | \`false\` |
| \`rounded\` | 버튼 높이만큼 모서리를 둥글게 만들어요. | \`boolean\` | \`false\` |
| \`disabled\` | 버튼을 비활성화하고 클릭 동작을 막아요. | \`boolean\` | \`false\` |
| \`className\` | 외부에서 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 버튼을 클릭할 때 실행할 함수예요. | \`MouseEventHandler<HTMLButtonElement>\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="button-variant">ButtonVariantType</h3>
          <p>버튼의 시각적 우선순위를 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {buttonVariants.map((variant) => (
              <ButtonVariantCode key={variant} variant={variant} />
            ))}
          </div>
          <h3 id="button-size">ButtonSizeType</h3>
          <p>버튼의 높이와 내부 여백을 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {buttonSizes.map((size) => (
              <ButtonSizeCode key={size} size={size} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<ButtonStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

function ButtonVariantCode({ variant }: { variant: ButtonVariantType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {variant}
    </code>
  );
}

function ButtonSizeCode({ size }: { size: ButtonSizeType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {size}
    </code>
  );
}

export const Variants: Story = {
  argTypes: {
    iconMode: { control: false, table: { disable: true } },
    variant: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    shadow: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-button--variants"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-button--variants").docs,
      source: {
        code: withStoryImports(`<div className="flex flex-wrap items-center gap-2">
  <Button variant="primary">Button</Button>
  <Button variant="danger">Button</Button>
  <Button variant="secondary">Button</Button>
  <Button variant="tertiary">Button</Button>
  <Button variant="dark">Button</Button>
  <Button variant="ghost">Button</Button>
</div>`),
      },
    },
  },
  render: ({ iconMode: _iconMode, ...args }) => (
    <div className="flex flex-wrap items-center gap-2">
      {buttonVariants.map((variant) => (
        <Button {...args} key={variant} variant={variant}>
          Button
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  argTypes: {
    iconMode: { control: false, table: { disable: true } },
    size: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    shadow: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-button--sizes"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-button--sizes").docs,
      source: {
        code: withStoryImports(`<div className="flex flex-wrap items-center gap-2">
  <Button size="lg">Button</Button>
  <Button size="md">Button</Button>
  <Button size="sm">Button</Button>
</div>`),
      },
    },
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
    iconMode: { control: false, table: { disable: true } },
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

export const Rounded: Story = {
  argTypes: {
    iconMode: { control: false, table: { disable: true } },
    size: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    rounded: { control: false, table: { disable: true } },
    shadow: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-button--rounded"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-button--rounded").docs,
      source: {
        code: withStoryImports(`<div className="flex flex-wrap items-center gap-2">
  <Button rounded size="lg">Button</Button>
  <Button rounded size="md">Button</Button>
  <Button rounded size="sm">Button</Button>
  <Button rounded prefixIcon={<Icon icon="add" />}>Button</Button>
  <Button
    rounded
    prefixIcon={<Icon icon="add" />}
    suffixIcon={<Icon icon="arrow-right" />}
  >
    Button
  </Button>
  <Button
    rounded
    iconOnly
    prefixIcon={<Icon icon="add" />}
  />
</div>`),
      },
    },
  },
  render: ({ iconMode: _iconMode, ...args }) => (
    <div className="flex flex-wrap items-center gap-2">
      {buttonSizes.map((size) => (
        <Button {...args} key={size} rounded size={size}>
          Button
        </Button>
      ))}
      <Button {...args} rounded prefixIcon={<Icon icon="add" />}>
        Button
      </Button>
      <Button
        {...args}
        rounded
        prefixIcon={<Icon icon="add" />}
        suffixIcon={<Icon icon="arrow-right" />}
      >
        Button
      </Button>
      <Button {...args} rounded iconOnly prefixIcon={<Icon icon="add" />} />
    </div>
  ),
};

export const Icons: Story = {
  args: { iconMode: "default" },
  argTypes: {
    variant: { control: false, table: { disable: true } },
    size: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    shadow: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
    loading: { control: false, table: { disable: true } },
    iconMode: {
      name: "아이콘 구성",
      control: {
        type: "select",
        labels: {
          default: "None",
          prefix: "Prefix",
          suffix: "Suffix",
          both: "Both",
          iconOnly: "Icon only",
        },
      },
      options: ["default", "prefix", "suffix", "both", "iconOnly"],
    },
  },
  parameters: {
    ...storyDescription("components-button--icons"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-button--icons").docs,
      source: {
        code: withStoryImports(`<div className="flex flex-wrap items-center gap-2">
  <Button>Button</Button>
  <Button prefixIcon={<Icon icon="add" />}>Button</Button>
  <Button suffixIcon={<Icon icon="arrow-right" />}>Button</Button>
  <Button
    prefixIcon={<Icon icon="add" />}
    suffixIcon={<Icon icon="arrow-right" />}
  >
    Button
  </Button>
  <Button iconOnly prefixIcon={<Icon icon="add" />} />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-center gap-2">
        {(["default", "prefix", "suffix", "both", "iconOnly"] as const).map((mode) =>
          renderIconButton(args, mode),
        )}
      </div>
    ) : (
      <div className="flex items-center">{renderIconButton(args, args.iconMode ?? "default")}</div>
    ),
};

export const Loading: Story = {
  args: {
    variant: "primary",
    size: "md",
    disabled: false,
    shadow: false,
  },
  argTypes: {
    iconMode: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    loading: { control: false, table: { disable: true } },
    fullWidth: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-button--loading"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-button--loading").docs,
      source: {
        code: withStoryImports(`function LoadingButtons() {
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingButton) return;
    const timeout = setTimeout(() => setLoadingButton(null), 3000);
    return () => clearTimeout(timeout);
  }, [loadingButton]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        loading={loadingButton === 'default'}
        onClick={() => setLoadingButton('default')}
      >
        저장
      </Button>
      <Button
        loading={loadingButton === 'prefix'}
        prefixIcon={<Icon icon="add" />}
        onClick={() => setLoadingButton('prefix')}
      >
        추가
      </Button>
      <Button
        loading={loadingButton === 'suffix'}
        suffixIcon={<Icon icon="download" />}
        onClick={() => setLoadingButton('suffix')}
      >
        다운로드
      </Button>
      <Button
        loading={loadingButton === 'both'}
        prefixIcon={<Icon icon="add" />}
        suffixIcon={<Icon icon="arrow-right" />}
        onClick={() => setLoadingButton('both')}
      >
        계속
      </Button>
      <Button
        iconOnly
        loading={loadingButton === 'iconOnly'}
        prefixIcon={<Icon icon="add" />}
        onClick={() => setLoadingButton('iconOnly')}
      />
    </div>
  );
}`),
      },
    },
  },
  render: ({ iconMode: _iconMode, ...args }) => <LoadingButtons args={args} />,
};

function LoadingButtons({ args }: { args: ButtonStoryArgs }) {
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  useEffect(() => {
    if (!loadingButton) return;
    const timeout = setTimeout(() => setLoadingButton(null), 3000);
    return () => clearTimeout(timeout);
  }, [loadingButton]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        {...args}
        loading={loadingButton === "default"}
        onClick={() => setLoadingButton("default")}
      >
        저장
      </Button>
      <Button
        {...args}
        loading={loadingButton === "prefix"}
        prefixIcon={<Icon icon="add" />}
        onClick={() => setLoadingButton("prefix")}
      >
        추가
      </Button>
      <Button
        {...args}
        loading={loadingButton === "suffix"}
        suffixIcon={<Icon icon="download" />}
        onClick={() => setLoadingButton("suffix")}
      >
        다운로드
      </Button>
      <Button
        {...args}
        loading={loadingButton === "both"}
        prefixIcon={<Icon icon="add" />}
        suffixIcon={<Icon icon="arrow-right" />}
        onClick={() => setLoadingButton("both")}
      >
        계속
      </Button>
      <Button
        {...args}
        iconOnly
        loading={loadingButton === "iconOnly"}
        prefixIcon={<Icon icon="add" />}
        onClick={() => setLoadingButton("iconOnly")}
      />
    </div>
  );
}

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
