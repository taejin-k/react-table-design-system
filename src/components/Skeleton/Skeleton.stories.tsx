import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Icon } from "../Icon";
import { Skeleton } from "./Skeleton";
import type { SkeletonElementProps, SkeletonShapeType } from "./Skeleton.types";

const skeletonShapes: SkeletonShapeType[] = ["circle", "round", "square", "default"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Skeleton",
  component: Skeleton.Node,
  tags: ["autodocs"],
  argTypes: {
    active: { name: "애니메이션", control: "boolean" },
    width: { name: "너비", control: "number" },
    height: { name: "높이", control: "number" },
    shape: { name: "모양", control: "select", options: skeletonShapes },
    children: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "콘텐츠를 불러오는 동안 필요한 자리에 독립적인 Skeleton element를 배치해요.  \nAvatar·Button·Input·Image·Node를 실제 레이아웃에 맞게 조합할 수 있어요.",
      },
      page: () => (
        <div className="skeleton-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Skeleton Elements

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`Avatar\` | 아바타 자리 표시자를 표시해요. | <code>(props: <a href="#skeleton-element-props">SkeletonElementProps</a>) =&gt; ReactNode</code> | - |
| \`Button\` | 버튼 자리 표시자를 표시해요. | <code>(props: <a href="#skeleton-element-props">SkeletonElementProps</a>) =&gt; ReactNode</code> | - |
| \`Input\` | 입력창 자리 표시자를 표시해요. | <code>(props: <a href="#skeleton-element-props">SkeletonElementProps</a>) =&gt; ReactNode</code> | - |
| \`Image\` | 이미지 자리 표시자를 표시해요. | <code>(props: <a href="#skeleton-element-props">SkeletonElementProps</a>) =&gt; ReactNode</code> | - |
| \`Node\` | 사용자 정의 자리 표시자를 표시해요. | <code>(props: <a href="#skeleton-element-props">SkeletonElementProps</a>) =&gt; ReactNode</code> | - |

### <span id="skeleton-element-props">SkeletonElementProps</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`active\` | 흐르는 애니메이션을 적용해요. | \`boolean\` | \`false\` |
| \`width\` | 요소 너비를 정해요. | \`CSSProperties['width']\` | 요소별 기본값 |
| \`height\` | 요소 높이를 정해요. | \`CSSProperties['height']\` | 요소별 기본값 |
| \`shape\` | 요소 모양을 정해요. | [\`SkeletonShapeType\`](#skeleton-shape-type) | 요소별 기본값 |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="skeleton-shape-type">SkeletonShapeType</h3>
          <p>자리 표시자 모양을 선택해요.</p>
          <TypeTokens values={skeletonShapes} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Skeleton.Node>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { active: true, width: 240, height: 16, shape: "round" },
  parameters: {
    ...storyDescription("components-skeleton--basic"),
    controls: { include: ["애니메이션", "너비", "높이", "모양"] },
    docs: {
      ...storyDescription("components-skeleton--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Skeleton.Node active width={240} height={16} shape="round" />`),
      },
    },
  },
};

export const Elements: Story = {
  parameters: {
    ...storyDescription("components-skeleton--elements"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-skeleton--elements").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-end gap-6">
  <Skeleton.Avatar />
  <Skeleton.Button />
  <Skeleton.Input />
  <Skeleton.Image />
  <Skeleton.Node>
    <Icon icon="file-outlined" />
  </Skeleton.Node>
</div>`,
        ),
      },
    },
  },
  render: () => <ElementExamples />,
};

export const Active: Story = {
  args: { active: true },
  parameters: {
    ...storyDescription("components-skeleton--active"),
    controls: { include: ["애니메이션"] },
    docs: {
      ...storyDescription("components-skeleton--active").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-end gap-6">
  <Skeleton.Avatar active />
  <Skeleton.Button active />
  <Skeleton.Input active />
  <Skeleton.Image active />
  <Skeleton.Node active />
</div>`,
        ),
      },
    },
  },
  render: (args) => <ElementExamples active={args.active} />,
};

export const Width: Story = {
  args: { width: 120 },
  parameters: {
    ...storyDescription("components-skeleton--width"),
    controls: { include: ["너비"] },
    docs: {
      ...storyDescription("components-skeleton--width").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-end gap-6">
  <Skeleton.Avatar width={120} />
  <Skeleton.Button width={120} />
  <Skeleton.Input width={120} />
  <Skeleton.Image width={120} />
  <Skeleton.Node width={120} />
</div>`,
        ),
      },
    },
  },
  render: (args) => <ElementExamples width={args.width} />,
};

export const Height: Story = {
  args: { height: 48 },
  parameters: {
    ...storyDescription("components-skeleton--height"),
    controls: { include: ["높이"] },
    docs: {
      ...storyDescription("components-skeleton--height").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-end gap-6">
  <Skeleton.Avatar height={48} />
  <Skeleton.Button height={48} />
  <Skeleton.Input height={48} />
  <Skeleton.Image height={48} />
  <Skeleton.Node height={48} />
</div>`,
        ),
      },
    },
  },
  render: (args) => <ElementExamples height={args.height} />,
};

export const Shape: Story = {
  args: { shape: "round" },
  parameters: {
    ...storyDescription("components-skeleton--shape"),
    controls: { include: ["모양"] },
    docs: {
      ...storyDescription("components-skeleton--shape").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-end gap-6">
  <Skeleton.Avatar shape="round" />
  <Skeleton.Button shape="round" />
  <Skeleton.Input shape="round" />
  <Skeleton.Image shape="round" />
  <Skeleton.Node shape="round" />
</div>`,
        ),
      },
    },
  },
  render: (args) => <ElementExamples shape={args.shape} />,
};

function ElementExamples({ active, width, height, shape }: SkeletonElementProps) {
  const props = { active, width, height, shape };

  return (
    <div className="flex flex-wrap items-end gap-6">
      <Element label="Avatar">
        <Skeleton.Avatar {...props} />
      </Element>
      <Element label="Button">
        <Skeleton.Button {...props} />
      </Element>
      <Element label="Input">
        <Skeleton.Input {...props} />
      </Element>
      <Element label="Image">
        <Skeleton.Image {...props} />
      </Element>
      <Element label="Node">
        <Skeleton.Node {...props}>
          <Icon icon="file-outlined" />
        </Skeleton.Node>
      </Element>
    </div>
  );
}

function Element({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid justify-items-center gap-2">
      {children}
      <span className="text-xs text-dark-gray">{label}</span>
    </div>
  );
}
