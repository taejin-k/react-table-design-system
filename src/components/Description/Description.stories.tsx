import {
  Description as DocsDescription,
  Markdown,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Description } from "./Description";
import type {
  DescriptionBreakpointType,
  DescriptionLayoutType,
  DescriptionSizeType,
} from "./Description.types";

const descriptionLayouts: DescriptionLayoutType[] = ["horizontal", "vertical"];
const descriptionSizes: DescriptionSizeType[] = ["large", "medium", "small"];
const descriptionBreakpoints: DescriptionBreakpointType[] = ["xs", "sm", "md", "lg", "xl", "xxl"];
const descriptionColumnTypes = ["number", "DescriptionResponsiveType"];
const descriptionSpanTypes = ["number", "filled", "DescriptionResponsiveType"];

const basicItems = [
  { key: "name", label: "이름", children: "김태진" },
  { key: "phone", label: "전화번호", children: "010-1234-5678" },
  { key: "team", label: "팀", children: "Product Design" },
  { key: "status", label: "상태", children: <Badge status="success" text="사용 중" /> },
  { key: "address", label: "주소", children: "서울특별시 강남구 테헤란로" },
];

const detailItems = [
  { key: "product", label: "상품", children: "Cloud Database" },
  { key: "billing", label: "결제 방식", children: "선불" },
  { key: "renewal", label: "자동 갱신", children: "사용" },
  { key: "orderedAt", label: "주문 일시", children: "2026-08-24 18:00" },
  { key: "usage", label: "사용 기간", children: "2026-08-24 18:00", span: 2 },
  {
    key: "status",
    label: "상태",
    children: <Badge status="processing" text="처리 중" process />,
    span: 3,
  },
  { key: "amount", label: "계약 금액", children: "₩80,000" },
  { key: "discount", label: "할인", children: "₩20,000" },
  { key: "paid", label: "결제 금액", children: "₩60,000" },
  {
    key: "config",
    label: "설정 정보",
    children: "MongoDB · v8.0 · 10 GB",
  },
];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const basicItemsSource = `const items = [
  { key: 'name', label: '이름', children: '김태진' },
  { key: 'phone', label: '전화번호', children: '010-1234-5678' },
  { key: 'team', label: '팀', children: 'Product Design' },
  {
    key: 'status',
    label: '상태',
    children: <Badge status="success" text="사용 중" />,
  },
  { key: 'address', label: '주소', children: '서울특별시 강남구 테헤란로' },
];`;

const detailItemsSource = `const items = [
  { key: 'product', label: '상품', children: 'Cloud Database' },
  { key: 'billing', label: '결제 방식', children: '선불' },
  { key: 'renewal', label: '자동 갱신', children: '사용' },
  { key: 'orderedAt', label: '주문 일시', children: '2026-08-24 18:00' },
  {
    key: 'usage',
    label: '사용 기간',
    children: '2026-08-24 18:00',
    span: 2,
  },
  {
    key: 'status',
    label: '상태',
    children: <Badge status="processing" text="처리 중" process />,
    span: 3,
  },
  { key: 'amount', label: '계약 금액', children: '₩80,000' },
  { key: 'discount', label: '할인', children: '₩20,000' },
  { key: 'paid', label: '결제 금액', children: '₩60,000' },
  {
    key: 'config',
    label: '설정 정보',
    children: 'MongoDB · v8.0 · 10 GB',
  },
];`;

const meta = {
  title: "Components/Description",
  component: Description,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "여러 개의 읽기 전용 정보를 하나의 그룹으로 표시해요.  \n가로·세로 배치, 테두리, 크기, 반응형 열과 셀 병합을 지원해요.",
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
| \`items\` | 표시할 정보 항목을 전달해요. | [\`DescriptionItemType[]\`](#descriptionitemtype) | \`[]\` |
| \`children\` | Item 컴포넌트로 항목을 구성해요. | \`ReactNode\` | - |
| \`title\` | 정보 목록의 제목을 표시해요. | \`ReactNode\` | - |
| \`extra\` | 제목 오른쪽에 추가 콘텐츠를 표시해요. | \`ReactNode\` | - |
| \`bordered\` | 레이블과 값을 테두리로 구분해요. | \`boolean\` | \`false\` |
| \`colon\` | 레이블 뒤에 콜론을 표시해요. | \`boolean\` | \`true\` |
| \`column\` | 한 행의 항목 수를 정해요. | [\`DescriptionColumnType\`](#description-column-type) | \`3\` |
| \`layout\` | 레이블과 값의 배치를 정해요. | [\`DescriptionLayoutType\`](#description-layout-type) | \`horizontal\` |
| \`size\` | 항목의 여백 크기를 정해요. | [\`DescriptionSizeType\`](#description-size-type) | \`large\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`style\` | 최상위 요소에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |

### DescriptionItemType

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 항목을 구분하는 값이에요. | \`Key\` | - |
| \`label\` | 항목의 레이블이에요. | \`ReactNode\` | - |
| \`children\` | 항목의 값이에요. | \`ReactNode\` | - |
| \`span\` | 항목이 차지할 열 수를 정해요. | [\`DescriptionSpanType\`](#description-span-type) | \`1\` |
| \`className\` | 항목 셀에 className을 추가해요. | \`string\` | - |
| \`style\` | 항목 셀에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |
| \`labelStyle\` | 레이블에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |
| \`contentStyle\` | 값에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |
| \`classNames\` | 레이블과 값에 className을 추가해요. | \`{ label?, content? }\` | - |
| \`styles\` | 레이블과 값에 스타일을 추가해요. | \`{ label?, content? }\` | - |

### DescriptionResponsiveType

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`xs\` | 0px 이상에서 사용할 값을 정해요. | \`number\` | - |
| \`sm\` | 576px 이상에서 사용할 값을 정해요. | \`number\` | - |
| \`md\` | 768px 이상에서 사용할 값을 정해요. | \`number\` | - |
| \`lg\` | 992px 이상에서 사용할 값을 정해요. | \`number\` | - |
| \`xl\` | 1200px 이상에서 사용할 값을 정해요. | \`number\` | - |
| \`xxl\` | 1600px 이상에서 사용할 값을 정해요. | \`number\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="description-layout-type">DescriptionLayoutType</h3>
          <p>레이블과 값의 배치 방향을 선택해요.</p>
          <TypeTokens values={descriptionLayouts} />
          <h3 id="description-size-type">DescriptionSizeType</h3>
          <p>항목의 여백 크기를 선택해요.</p>
          <TypeTokens values={descriptionSizes} />
          <h3 id="description-column-type">DescriptionColumnType</h3>
          <p>고정 열 수 또는 화면 크기에 따른 열 수를 설정해요.</p>
          <TypeTokens values={descriptionColumnTypes} />
          <h3 id="description-span-type">DescriptionSpanType</h3>
          <p>항목의 열 범위 또는 현재 행의 남은 범위를 설정해요.</p>
          <TypeTokens values={descriptionSpanTypes} />
          <h3 id="description-breakpoint-type">DescriptionBreakpointType</h3>
          <p>반응형 열 수와 범위에 사용할 화면 크기를 선택해요.</p>
          <TypeTokens values={descriptionBreakpoints} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Description>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-description--basic"),
    docs: {
      ...storyDescription("components-description--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${basicItemsSource}\n\n<Description title="사용자 정보" items={items} />`,
        ),
      },
    },
  },
  render: () => <Description title="사용자 정보" items={basicItems} />,
};

export const Bordered: Story = {
  parameters: {
    ...storyDescription("components-description--bordered"),
    docs: {
      ...storyDescription("components-description--bordered").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${detailItemsSource}\n\n<Description bordered title="상품 정보" items={items} />`,
        ),
      },
    },
  },
  render: () => <Description bordered title="상품 정보" items={detailItems} />,
};

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-description--sizes"),
    docs: {
      ...storyDescription("components-description--sizes").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const items = [
  { key: 'name', label: '이름', children: '김태진' },
  { key: 'phone', label: '전화번호', children: '010-1234-5678' },
  { key: 'team', label: '팀', children: 'Product Design' },
];

<div className="grid gap-8">
  <Description bordered size="large" title="Large" items={items} />
  <Description bordered size="medium" title="Medium" items={items} />
  <Description bordered size="small" title="Small" items={items} />
</div>`,
        ),
      },
    },
  },
  render: () => (
    <div className="grid gap-8">
      <Description bordered size="large" title="Large" items={basicItems.slice(0, 3)} />
      <Description bordered size="medium" title="Medium" items={basicItems.slice(0, 3)} />
      <Description bordered size="small" title="Small" items={basicItems.slice(0, 3)} />
    </div>
  ),
};

export const Responsive: Story = {
  parameters: {
    ...storyDescription("components-description--responsive"),
    docs: {
      ...storyDescription("components-description--responsive").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${basicItemsSource}\n\n<Description
  bordered
  title="반응형 사용자 정보"
  column={{ xs: 1, sm: 1, md: 2, lg: 3 }}
  items={items}
/>`,
        ),
      },
    },
  },
  render: () => (
    <Description
      bordered
      title="반응형 사용자 정보"
      column={{ xs: 1, sm: 1, md: 2, lg: 3 }}
      items={basicItems}
    />
  ),
};

export const Vertical: Story = {
  parameters: {
    ...storyDescription("components-description--vertical"),
    docs: {
      ...storyDescription("components-description--vertical").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${basicItemsSource}\n\n<Description layout="vertical" title="사용자 정보" items={items} />`,
        ),
      },
    },
  },
  render: () => <Description layout="vertical" title="사용자 정보" items={basicItems} />,
};

export const VerticalBordered: Story = {
  parameters: {
    ...storyDescription("components-description--vertical-bordered"),
    docs: {
      ...storyDescription("components-description--vertical-bordered").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${detailItemsSource}\n\n<Description bordered layout="vertical" title="상품 정보" items={items} />`,
        ),
      },
    },
  },
  render: () => <Description bordered layout="vertical" title="상품 정보" items={detailItems} />,
};

export const TitleAndExtra: Story = {
  parameters: {
    ...storyDescription("components-description--title-and-extra"),
    docs: {
      ...storyDescription("components-description--title-and-extra").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${basicItemsSource}\n\n<Description
  title="사용자 정보"
  extra={<Button>수정</Button>}
  items={items}
/>`,
        ),
      },
    },
  },
  render: () => (
    <Description title="사용자 정보" extra={<Button>수정</Button>} items={basicItems} />
  ),
};

export const SpanAndFilled: Story = {
  parameters: {
    ...storyDescription("components-description--span-and-filled"),
    docs: {
      ...storyDescription("components-description--span-and-filled").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Description
  bordered
  column={3}
  items={[
    { key: 'name', label: '이름', children: '김태진' },
    { key: 'team', label: '팀', children: 'Product Design', span: 2 },
    {
      key: 'address',
      label: '주소',
      children: '서울특별시 강남구 테헤란로',
      span: 'filled',
    },
  ]}
/>`,
        ),
      },
    },
  },
  render: () => (
    <Description
      bordered
      column={3}
      items={[
        { key: "name", label: "이름", children: "김태진" },
        { key: "team", label: "팀", children: "Product Design", span: 2 },
        {
          key: "address",
          label: "주소",
          children: "서울특별시 강남구 테헤란로",
          span: "filled",
        },
      ]}
    />
  ),
};

export const ItemComponent: Story = {
  parameters: {
    ...storyDescription("components-description--item-component"),
    docs: {
      ...storyDescription("components-description--item-component").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Description bordered title="사용자 정보">
  <Description.Item label="이름">김태진</Description.Item>
  <Description.Item label="팀">Product Design</Description.Item>
  <Description.Item label="상태">
    <Badge status="success" text="사용 중" />
  </Description.Item>
</Description>`,
        ),
      },
    },
  },
  render: () => (
    <Description bordered title="사용자 정보">
      <Description.Item label="이름">김태진</Description.Item>
      <Description.Item label="팀">Product Design</Description.Item>
      <Description.Item label="상태">
        <Badge status="success" text="사용 중" />
      </Description.Item>
    </Description>
  ),
};
