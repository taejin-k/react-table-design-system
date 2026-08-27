import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Illustrations } from "./Illustrations";
import type { IllustrationSizeType, IllustrationType } from "./Illustrations.types";

const illustrationTypes: IllustrationType[] = [
  "list",
  "noResults",
  "error",
  "network",
  "permission",
  "file",
  "notification",
  "message",
  "calendar",
  "chart",
  "comingSoon",
  "completed",
];
const illustrationSizes: IllustrationSizeType[] = ["sm", "md", "lg"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Illustrations",
  component: Illustrations,
  tags: ["autodocs"],
  argTypes: {
    type: { name: "이미지", control: "select", options: illustrationTypes },
    size: { name: "크기", control: "select", options: illustrationSizes },
    description: { name: "설명", control: "text" },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "빈 상태와 오류·안내 상황을 이미지로 보여줘요  \n상황에 맞는 이미지와 안내 내용을 표시할 수 있어요",
      },
      page: () => (
        <div className="illustrations-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Illustrations

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`type\` | 표시할 이미지 종류를 설정해요 | [\`IllustrationType\`](#illustration-type) | \`noResults\` |
| \`size\` | 이미지 크기를 설정해요 | [\`IllustrationSizeType\`](#illustration-size-type) | \`md\` |
| \`description\` | 이미지 아래에 안내 내용을 표시해요 | \`ReactNode\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요 | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="illustration-type">IllustrationType</h3>
          <p>상황에 맞는 이미지 타입을 선택해요</p>
          <div className="flex flex-wrap gap-2">
            {illustrationTypes.map((type) => (
              <IllustrationTypeCode key={type} value={type} />
            ))}
          </div>
          <h3 id="illustration-size-type">IllustrationSizeType</h3>
          <p>이미지 크기를 선택해요</p>
          <div className="flex flex-wrap gap-2">
            {illustrationSizes.map((size) => (
              <IllustrationTypeCode key={size} value={size} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Illustrations>;

export default meta;
type Story = StoryObj<typeof meta>;

function IllustrationTypeCode({ value }: { value: IllustrationType | IllustrationSizeType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {value}
    </code>
  );
}

function IllustrationExample({
  type,
  description,
}: {
  type: IllustrationType;
  description: string;
}) {
  return (
    <div className="grid gap-3">
      <p className="m-0 text-center font-mono text-sm text-[#677589]">{type}</p>
      <Illustrations type={type} description={description} />
    </div>
  );
}

function IllustrationSizeExample({ size }: { size: IllustrationSizeType }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="m-0 font-mono text-sm text-[#677589]">{size}</p>
      <Illustrations className="w-auto" size={size} description={`${size} 크기예요`} />
    </div>
  );
}

export const Types: Story = {
  args: { type: "noResults", description: "표시할 내용이 없어요" },
  parameters: {
    ...storyDescription("components-illustrations--types"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-illustrations--types").docs,
      source: {
        code: withStoryImports(`<div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">list</p>
    <Illustrations type="list" description="표시할 목록이 없어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">noResults</p>
    <Illustrations type="noResults" description="검색 결과가 없어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">error</p>
    <Illustrations type="error" description="내용을 불러오지 못했어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">network</p>
    <Illustrations type="network" description="네트워크 연결을 확인해 주세요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">permission</p>
    <Illustrations type="permission" description="접근 권한이 없어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">file</p>
    <Illustrations type="file" description="등록된 파일이 없어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">notification</p>
    <Illustrations type="notification" description="새로운 알림이 없어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">message</p>
    <Illustrations type="message" description="받은 메시지가 없어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">calendar</p>
    <Illustrations type="calendar" description="등록된 일정이 없어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">chart</p>
    <Illustrations type="chart" description="표시할 통계가 없어요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">comingSoon</p>
    <Illustrations type="comingSoon" description="곧 제공할 기능이에요" />
  </div>
  <div className="grid gap-3">
    <p className="m-0 text-center font-mono text-sm text-[#677589]">completed</p>
    <Illustrations type="completed" description="모든 작업을 완료했어요" />
  </div>
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        <IllustrationExample type="list" description="표시할 목록이 없어요" />
        <IllustrationExample type="noResults" description="검색 결과가 없어요" />
        <IllustrationExample type="error" description="내용을 불러오지 못했어요" />
        <IllustrationExample type="network" description="네트워크 연결을 확인해 주세요" />
        <IllustrationExample type="permission" description="접근 권한이 없어요" />
        <IllustrationExample type="file" description="등록된 파일이 없어요" />
        <IllustrationExample type="notification" description="새로운 알림이 없어요" />
        <IllustrationExample type="message" description="받은 메시지가 없어요" />
        <IllustrationExample type="calendar" description="등록된 일정이 없어요" />
        <IllustrationExample type="chart" description="표시할 통계가 없어요" />
        <IllustrationExample type="comingSoon" description="곧 제공할 기능이에요" />
        <IllustrationExample type="completed" description="모든 작업을 완료했어요" />
      </div>
    ) : (
      <Illustrations {...args} />
    ),
};

export const Sizes: Story = {
  args: { type: "noResults", size: "md", description: "표시할 내용이 없어요" },
  parameters: {
    ...storyDescription("components-illustrations--sizes"),
    controls: { disable: false },
    docs: {
      ...storyDescription("components-illustrations--sizes").docs,
      source: {
        code: withStoryImports(`<div className="flex flex-wrap items-end gap-12">
  <Illustrations size="sm" description="sm 크기예요" />
  <Illustrations size="md" description="md 크기예요" />
  <Illustrations size="lg" description="lg 크기예요" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-end gap-12">
        <IllustrationSizeExample size="sm" />
        <IllustrationSizeExample size="md" />
        <IllustrationSizeExample size="lg" />
      </div>
    ) : (
      <Illustrations {...args} />
    ),
};
