import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Skeleton } from "./Skeleton";
import type { SkeletonShapeType, SkeletonSizeType } from "./Skeleton.types";

const skeletonSizes = ["lg", "md", "sm", "number"] satisfies readonly (
  SkeletonSizeType | "number"
)[];
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
    fullWidth: { name: "전체 너비", control: "boolean" },
    width: { name: "너비", control: "number" },
    height: { name: "높이", control: "number" },
    size: { name: "크기", control: "select", options: ["lg", "md", "sm"] },
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
| \`Avatar\` | 아바타 자리 표시자를 표시해요. | \`(props: SkeletonElementProps) => ReactNode\` | - |
| \`Button\` | 버튼 자리 표시자를 표시해요. | \`(props: SkeletonElementProps) => ReactNode\` | - |
| \`Input\` | 입력창 자리 표시자를 표시해요. | \`(props: SkeletonElementProps) => ReactNode\` | - |
| \`Image\` | 이미지 자리 표시자를 표시해요. | \`(props: SkeletonElementProps) => ReactNode\` | - |
| \`Node\` | 사용자 정의 자리 표시자를 표시해요. | \`(props: SkeletonElementProps) => ReactNode\` | - |

### SkeletonElementProps

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`active\` | 흐르는 애니메이션을 적용해요. | \`boolean\` | \`false\` |
| \`fullWidth\` | 부모 너비를 모두 채워요. | \`boolean\` | \`false\` |
| \`width\` | 요소 너비를 정해요. | \`CSSProperties['width']\` | 요소별 기본값 |
| \`height\` | 요소 높이를 정해요. | \`CSSProperties['height']\` | 요소별 기본값 |
| \`size\` | 요소 크기를 정해요. | [\`SkeletonSizeType\`](#skeleton-size-type) | \`md\` |
| \`shape\` | 요소 모양을 정해요. | [\`SkeletonShapeType\`](#skeleton-shape-type) | 요소별 기본값 |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="skeleton-size-type">SkeletonSizeType</h3>
          <p>미리 정한 크기 또는 px 숫자를 사용해요.</p>
          <TypeTokens values={skeletonSizes} />
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
  args: { active: true, fullWidth: false, width: 240, height: 16, shape: "round" },
  parameters: {
    ...storyDescription("components-skeleton--basic"),
    controls: {
      include: ["애니메이션", "전체 너비", "너비", "높이", "모양"],
    },
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
  args: { active: true },
  parameters: {
    ...storyDescription("components-skeleton--elements"),
    controls: { include: ["애니메이션"] },
    docs: {
      ...storyDescription("components-skeleton--elements").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<div className="flex flex-wrap items-center gap-3">
  <Skeleton.Avatar active />
  <Skeleton.Button active />
  <Skeleton.Input active width={180} />
  <Skeleton.Image active />
  <Skeleton.Node active width={96} height={96}>
    <Icon icon="file-outlined" />
  </Skeleton.Node>
</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton.Avatar active={args.active} />
      <Skeleton.Button active={args.active} />
      <Skeleton.Input active={args.active} width={180} />
      <Skeleton.Image active={args.active} />
      <Skeleton.Node active={args.active} width={96} height={96}>
        <Icon icon="file-outlined" />
      </Skeleton.Node>
    </div>
  ),
};

export const Loaded: Story = {
  args: { active: true },
  parameters: {
    ...storyDescription("components-skeleton--loaded"),
    controls: { include: ["애니메이션"] },
    docs: {
      ...storyDescription("components-skeleton--loaded").docs,
      source: {
        type: "code",
        code: withStoryImports(`function LoadingContent() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="grid gap-4">
      <Button className="w-fit" onClick={() => setLoading((current) => !current)}>
        {loading ? '불러오기 완료' : '다시 불러오기'}
      </Button>
      {loading ? (
        <div className="flex gap-4">
          <Skeleton.Avatar active size="lg" />
          <div className="grid flex-1 gap-3">
            <Skeleton.Node active width="38%" height={16} shape="round" />
            <Skeleton.Node active fullWidth height={16} shape="round" />
            <Skeleton.Node active width="61%" height={16} shape="round" />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#eee] p-4">
          <strong>프로젝트 현황</strong>
          <p className="mt-2 text-[#666]">최신 데이터를 모두 불러왔어요.</p>
        </div>
      )}
    </div>
  );
}

<LoadingContent />`),
      },
    },
  },
  render: (args) => <LoadingContent active={args.active} />,
};

export const CardGrid: Story = {
  args: { active: true },
  parameters: {
    ...storyDescription("components-skeleton--card-grid"),
    controls: { include: ["애니메이션"] },
    docs: {
      ...storyDescription("components-skeleton--card-grid").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="grid gap-4 md:grid-cols-3">
  {[1, 2, 3].map((item) => (
    <article key={item} className="grid gap-4 rounded-lg border border-[#eee] p-4">
      <Skeleton.Image active fullWidth height={128} />
      <Skeleton.Node active width="55%" height={16} shape="round" />
      <Skeleton.Node active fullWidth height={16} shape="round" />
      <Skeleton.Node active width="61%" height={16} shape="round" />
      <Skeleton.Button active fullWidth />
    </article>
  ))}
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <article key={item} className="grid gap-4 rounded-lg border border-[#eee] p-4">
          <Skeleton.Image active={args.active} fullWidth height={128} />
          <Skeleton.Node active={args.active} width="55%" height={16} shape="round" />
          <Skeleton.Node active={args.active} fullWidth height={16} shape="round" />
          <Skeleton.Node active={args.active} width="61%" height={16} shape="round" />
          <Skeleton.Button active={args.active} fullWidth />
        </article>
      ))}
    </div>
  ),
};

export const List: Story = {
  args: { active: true },
  parameters: {
    ...storyDescription("components-skeleton--list"),
    controls: { include: ["애니메이션"] },
    docs: {
      ...storyDescription("components-skeleton--list").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="divide-y divide-[#eee] rounded-lg border border-[#eee] px-4">
  {[1, 2, 3, 4].map((item) => (
    <div key={item} className="flex gap-4 py-4">
      <Skeleton.Avatar active size="lg" />
      <div className="grid flex-1 gap-3">
        <Skeleton.Node active width={item % 2 ? '32%' : '44%'} height={16} shape="round" />
        <Skeleton.Node active width={item % 2 ? '72%' : '58%'} height={16} shape="round" />
      </div>
    </div>
  ))}
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="divide-y divide-[#eee] rounded-lg border border-[#eee] px-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex gap-4 py-4">
          <Skeleton.Avatar active={args.active} size="lg" />
          <div className="grid flex-1 gap-3">
            <Skeleton.Node
              active={args.active}
              width={item % 2 ? "32%" : "44%"}
              height={16}
              shape="round"
            />
            <Skeleton.Node
              active={args.active}
              width={item % 2 ? "72%" : "58%"}
              height={16}
              shape="round"
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

function LoadingContent({ active = false }: { active?: boolean }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="grid gap-4">
      <Button className="w-fit" onClick={() => setLoading((current) => !current)}>
        {loading ? "불러오기 완료" : "다시 불러오기"}
      </Button>
      {loading ? (
        <div className="flex gap-4">
          <Skeleton.Avatar active={active} size="lg" />
          <div className="grid flex-1 gap-3">
            <Skeleton.Node active={active} width="38%" height={16} shape="round" />
            <Skeleton.Node active={active} fullWidth height={16} shape="round" />
            <Skeleton.Node active={active} width="61%" height={16} shape="round" />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#eee] p-4">
          <strong>프로젝트 현황</strong>
          <p className="mt-2 text-[#666]">최신 데이터를 모두 불러왔어요.</p>
        </div>
      )}
    </div>
  );
}
