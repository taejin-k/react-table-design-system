import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState, type ComponentProps } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Tag } from "./Tag";
import type { TagColorType, TagVariantType } from "./Tag.types";

const colors: TagColorType[] = ["black", "green", "navy", "red", "grey", "purple", "blue"];
const variants: TagVariantType[] = ["filled", "outlined", "solid", "soft-outlined"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  argTypes: {
    children: { name: "텍스트", control: "text" },
    color: { name: "색상", control: "select", options: colors },
    variant: { name: "표현 방식", control: "select", options: variants },
    prefixIcon: { control: false, table: { disable: true } },
    suffixIcon: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "상태나 범주를 짧은 텍스트로 표시해요.  \n색상·표현 방식과 앞뒤 아이콘을 설정할 수 있어요.",
      },
      page: () => (
        <div className="tag-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Tag

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`color\` | Tag의 색상을 설정해요. | [\`TagColorType\`](#tag-color) | \`black\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | [\`TagVariantType\`](#tag-variant) | \`filled\` |
| \`prefixIcon\` | 텍스트 앞에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`suffixIcon\` | 텍스트 뒤에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="tag-color">TagColorType</h3>
          <p>Tag에 적용할 색상을 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <TagTypeCode key={color} value={color} />
            ))}
          </div>
          <h3 id="tag-variant">TagVariantType</h3>
          <p>Tag의 배경과 테두리 표현 방식을 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <TagTypeCode key={variant} value={variant} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

function TagTypeCode({ value }: { value: TagColorType | TagVariantType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {value}
    </code>
  );
}

export const Variants: Story = {
  args: { children: "Tag" },
  argTypes: {
    children: { name: "텍스트", control: "text" },
    color: { control: false, table: { disable: true } },
    variant: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-tag--variants"),
    controls: { disable: false, include: ["텍스트"] },
    docs: {
      ...storyDescription("components-tag--variants").docs,
      description: { story: storyDescriptions["components-tag--variants"] },
      source: {
        code: withStoryImports(`function TagVariants() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-3">
        <h3 className="m-0 text-sm font-semibold">filled</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Tag color="black" variant="filled">black</Tag>
          <Tag color="green" variant="filled">green</Tag>
          <Tag color="navy" variant="filled">navy</Tag>
          <Tag color="red" variant="filled">red</Tag>
          <Tag color="grey" variant="filled">grey</Tag>
          <Tag color="purple" variant="filled">purple</Tag>
          <Tag color="blue" variant="filled">blue</Tag>
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="m-0 text-sm font-semibold">outlined</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Tag color="black" variant="outlined">black</Tag>
          <Tag color="green" variant="outlined">green</Tag>
          <Tag color="navy" variant="outlined">navy</Tag>
          <Tag color="red" variant="outlined">red</Tag>
          <Tag color="grey" variant="outlined">grey</Tag>
          <Tag color="purple" variant="outlined">purple</Tag>
          <Tag color="blue" variant="outlined">blue</Tag>
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="m-0 text-sm font-semibold">solid</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Tag color="black" variant="solid">black</Tag>
          <Tag color="green" variant="solid">green</Tag>
          <Tag color="navy" variant="solid">navy</Tag>
          <Tag color="red" variant="solid">red</Tag>
          <Tag color="grey" variant="solid">grey</Tag>
          <Tag color="purple" variant="solid">purple</Tag>
          <Tag color="blue" variant="solid">blue</Tag>
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="m-0 text-sm font-semibold">soft-outlined</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Tag color="black" variant="soft-outlined">black</Tag>
          <Tag color="green" variant="soft-outlined">green</Tag>
          <Tag color="navy" variant="soft-outlined">navy</Tag>
          <Tag color="red" variant="soft-outlined">red</Tag>
          <Tag color="grey" variant="soft-outlined">grey</Tag>
          <Tag color="purple" variant="soft-outlined">purple</Tag>
          <Tag color="blue" variant="soft-outlined">blue</Tag>
        </div>
      </section>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-6">
      {variants.map((variant) => (
        <section key={variant} className="grid gap-3">
          <h3 className="m-0 text-sm font-semibold">{variant}</h3>
          <div className="flex flex-wrap items-center gap-3">
            {colors.map((color) => (
              <Tag {...args} key={color} color={color} variant={variant} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  argTypes: {
    children: { control: false, table: { disable: true } },
    color: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-tag--colors"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-tag--colors").docs,
      description: { story: storyDescriptions["components-tag--colors"] },
      source: {
        code: withStoryImports(`<div className="flex flex-wrap items-center gap-3">
  <Tag color="black">black</Tag>
  <Tag color="green">green</Tag>
  <Tag color="navy">navy</Tag>
  <Tag color="red">red</Tag>
  <Tag color="grey">grey</Tag>
  <Tag color="purple">purple</Tag>
  <Tag color="blue">blue</Tag>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {colors.map((color) => (
        <Tag key={color} {...args} color={color}>
          {color}
        </Tag>
      ))}
    </div>
  ),
};

export const Icons: Story = {
  parameters: {
    ...storyDescription("components-tag--icons"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-tag--icons").docs,
      description: { story: storyDescriptions["components-tag--icons"] },
      source: {
        code: withStoryImports(`function TagIcons() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tag>텍스트</Tag>
      <Tag prefixIcon={<Icon icon="edit" />}>텍스트</Tag>
      <Tag
        suffixIcon={
          <Icon icon="close" loading={loading} onClick={() => setLoading(true)} />
        }
      >
        텍스트
      </Tag>
      <Tag
        prefixIcon={<Icon icon="edit" />}
        suffixIcon={<Icon icon="close" onClick={() => alert("닫기 아이콘을 클릭했어요.")} />}
      >
        텍스트
      </Tag>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <TagIcons args={args} />,
};

function TagIcons({ args }: { args: ComponentProps<typeof Tag> }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tag {...args}>텍스트</Tag>
      <Tag {...args} prefixIcon={<Icon icon="edit" />}>
        텍스트
      </Tag>
      <Tag
        {...args}
        suffixIcon={<Icon icon="close" loading={loading} onClick={() => setLoading(true)} />}
      >
        텍스트
      </Tag>
      <Tag
        {...args}
        prefixIcon={<Icon icon="edit" />}
        suffixIcon={<Icon icon="close" onClick={() => alert("닫기 아이콘을 클릭했어요.")} />}
      >
        텍스트
      </Tag>
    </div>
  );
}
