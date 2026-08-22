import {
  Description as DocsDescription,
  Markdown,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Badge } from "../Badge";
import { Description } from "./Description";

const items = [
  { key: "name", label: "이름", children: "김태진" },
  { key: "status", label: "상태", children: <Badge status="success" text="사용 중" /> },
  { key: "phone", label: "전화번호", children: "010-1234-5678" },
  { key: "address", label: "주소", children: "서울특별시 강남구", span: 2 },
];
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Description",
  component: Description,
  tags: ["autodocs"],
  args: { title: "사용자 정보", items },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "여러 항목의 레이블과 값을 정돈된 표 형태로 보여줘요.  \n가로·세로 레이아웃, 반응형 열, 병합 범위, 테두리와 Item 하위 컴포넌트를 지원해요.",
      },
      page: () => (
        <div className="description-docs component-docs">
          <Title />
          <DocsDescription />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Description

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 레이블과 값으로 구성된 항목을 전달해요. | \`DescriptionItem[]\` | \`[]\` |
| \`title\` | 정보 목록 위에 제목을 표시해요. | \`ReactNode\` | - |
| \`extra\` | 제목 반대편에 추가 콘텐츠를 배치해요. | \`ReactNode\` | - |
| \`bordered\` | 레이블과 값을 셀 테두리로 구분해요. | \`boolean\` | \`false\` |
| \`colon\` | 가로 레이아웃의 레이블 뒤에 콜론을 표시해요. | \`boolean\` | \`true\` |
| \`column\` | 한 행의 열 개수 또는 반응형 열 개수를 정해요. | \`number \\| ResponsiveColumns\` | \`3\` |
| \`layout\` | 레이블과 값의 배치 방향을 정해요. | \`'horizontal' \\| 'vertical'\` | \`'horizontal'\` |
| \`size\` | 셀의 여백과 글자 크기를 정해요. | \`'large' \\| 'medium' \\| 'small'\` | \`'medium'\` |

### Description.Item

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 항목의 이름이에요. | \`ReactNode\` | - |
| \`children\` | 항목의 값이에요. | \`ReactNode\` | - |
| \`span\` | 항목이 차지할 열 수 또는 반응형 범위를 정해요. | \`number \\| 'filled' \\| ResponsiveSpan\` | \`1\` |
| \`labelStyle\` | 레이블에 인라인 스타일을 적용해요. | \`CSSProperties\` | - |
| \`contentStyle\` | 값에 인라인 스타일을 적용해요. | \`CSSProperties\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Description>;
export default meta;
type Story = StoryObj<typeof meta>;

const source = `<Description title="사용자 정보" items={[\n  { key: 'name', label: '이름', children: '김태진' },\n  { key: 'status', label: '상태', children: <Badge status="success" text="사용 중" /> },\n  { key: 'phone', label: '전화번호', children: '010-1234-5678' },\n  { key: 'address', label: '주소', children: '서울특별시 강남구', span: 2 },\n]} />`;
export const Basic: Story = {
  parameters: {
    ...storyDescription("components-description--basic"),
    docs: {
      ...storyDescription("components-description--basic").docs,
      source: { type: "code", code: withStoryImports(source) },
    },
  },
};
export const Bordered: Story = {
  args: { bordered: true },
  parameters: {
    ...storyDescription("components-description--bordered"),
    docs: {
      ...storyDescription("components-description--bordered").docs,
      source: {
        type: "code",
        code: withStoryImports(source.replace("<Description", "<Description bordered")),
      },
    },
  },
};
export const Vertical: Story = {
  args: { layout: "vertical" },
  parameters: {
    ...storyDescription("components-description--vertical"),
    docs: {
      ...storyDescription("components-description--vertical").docs,
      source: {
        type: "code",
        code: withStoryImports(source.replace("<Description", '<Description layout="vertical"')),
      },
    },
  },
};
