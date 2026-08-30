import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
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
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    active: { name: "애니메이션", control: "boolean" },
    loading: { name: "로딩", control: "boolean" },
    avatar: { name: "아바타", control: "boolean" },
    title: { name: "제목", control: "boolean" },
    paragraph: { name: "문단", control: "boolean" },
    round: { name: "둥근 모양", control: "boolean" },
    children: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "콘텐츠를 불러오는 동안 실제 레이아웃과 비슷한 자리 표시자를 보여줘요.  \n아바타·제목·문단 조합과 버튼·입력창·이미지·사용자 정의 노드를 지원해요.",
      },
      page: () => (
        <div className="skeleton-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Skeleton

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`active\` | 자리 표시자에 흐르는 애니메이션을 적용해요. | \`boolean\` | \`false\` |
| \`loading\` | 자리 표시자와 실제 콘텐츠 중 표시할 대상을 정해요. | \`boolean\` | \`true\` |
| \`avatar\` | 아바타 자리 표시자를 표시하고 세부 모양을 정해요. | \`boolean \\| SkeletonElementProps\` | \`false\` |
| \`title\` | 제목 자리 표시자를 표시하고 너비를 정해요. | \`boolean \\| { width?: string \\| number }\` | \`true\` |
| \`paragraph\` | 문단의 행 수와 각 행 너비를 정해요. | \`boolean \\| { rows?: number; width?: string \\| number \\| Array }\` | \`true\` |
| \`round\` | 제목과 문단 모서리를 더 둥글게 표시해요. | \`boolean\` | \`false\` |
| \`children\` | 로딩이 끝난 뒤 표시할 콘텐츠예요. | \`ReactNode\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |

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
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { active: true, avatar: true, title: true, paragraph: { rows: 3 }, round: false },
  parameters: {
    ...storyDescription("components-skeleton--basic"),
    controls: { include: ["애니메이션", "아바타", "제목", "문단", "둥근 모양"] },
    docs: {
      ...storyDescription("components-skeleton--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Skeleton active avatar paragraph={{ rows: 3 }} />`),
      },
    },
  },
};
export const Elements: Story = {
  args: { active: true },
  parameters: {
    ...storyDescription("components-skeleton--elements"),
    controls: { disable: false, include: ["애니메이션"] },
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
  args: { active: true, avatar: true, title: true, round: false },
  parameters: {
    ...storyDescription("components-skeleton--loaded"),
    controls: { include: ["애니메이션", "아바타", "제목", "둥근 모양"] },
    docs: {
      ...storyDescription("components-skeleton--loaded").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `function LoadingContent() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="grid gap-4">
      <Button className="w-fit" onClick={() => setLoading((current) => !current)}>
        {loading ? '불러오기 완료' : '다시 불러오기'}
      </Button>
      <Skeleton loading={loading} active avatar paragraph={{ rows: 2 }}>
        <div className="rounded-lg border border-[#eee] p-4">
          <strong>프로젝트 현황</strong>
          <p className="mt-2 text-[#666]">최신 데이터를 모두 불러왔어요.</p>
        </div>
      </Skeleton>
    </div>
  );
}`,
        ),
      },
    },
  },
  render: (args) => <LoadingContent {...args} />,
};

export const CardGrid: Story = {
  args: { active: true, round: true },
  parameters: {
    ...storyDescription("components-skeleton--card-grid"),
    controls: { include: ["애니메이션", "둥근 모양"] },
    docs: {
      ...storyDescription("components-skeleton--card-grid").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="grid gap-4 md:grid-cols-3">
  {[1, 2, 3].map((item) => (
    <article key={item} className="grid gap-4 rounded-lg border border-[#eee] p-4">
      <Skeleton.Image active fullWidth height={128} />
      <Skeleton active round title={{ width: '55%' }} paragraph={{ rows: 2 }} />
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
          <Skeleton
            active={args.active}
            round={args.round}
            title={{ width: "55%" }}
            paragraph={{ rows: 2 }}
          />
          <Skeleton.Button active={args.active} fullWidth />
        </article>
      ))}
    </div>
  ),
};

export const List: Story = {
  args: { active: true, round: false },
  parameters: {
    ...storyDescription("components-skeleton--list"),
    controls: { include: ["애니메이션", "둥근 모양"] },
    docs: {
      ...storyDescription("components-skeleton--list").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="divide-y divide-[#eee] rounded-lg border border-[#eee] px-4">
  {[1, 2, 3, 4].map((item) => (
    <div key={item} className="py-4">
      <Skeleton
        active
        avatar={{ size: 'lg' }}
        title={{ width: item % 2 ? '32%' : '44%' }}
        paragraph={{ rows: 1, width: item % 2 ? '72%' : '58%' }}
      />
    </div>
  ))}
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="divide-y divide-[#eee] rounded-lg border border-[#eee] px-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="py-4">
          <Skeleton
            active={args.active}
            round={args.round}
            avatar={{ size: "lg" }}
            title={{ width: item % 2 ? "32%" : "44%" }}
            paragraph={{ rows: 1, width: item % 2 ? "72%" : "58%" }}
          />
        </div>
      ))}
    </div>
  ),
};

function LoadingContent(args: ComponentProps<typeof Skeleton>) {
  const [loading, setLoading] = useState(true);
  return (
    <div className="grid gap-4">
      <Button className="w-fit" onClick={() => setLoading((current) => !current)}>
        {loading ? "불러오기 완료" : "다시 불러오기"}
      </Button>
      <Skeleton {...args} loading={loading} paragraph={{ rows: 2 }}>
        <div className="rounded-lg border border-[#eee] p-4">
          <strong>프로젝트 현황</strong>
          <p className="mt-2 text-[#666]">최신 데이터를 모두 불러왔어요.</p>
        </div>
      </Skeleton>
    </div>
  );
}
