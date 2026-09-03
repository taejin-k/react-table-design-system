import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Tag } from "../Tag";
import { Collapse } from "./Collapse";
import type {
  CollapseCollapsibleType,
  CollapseExpandIconPlacementType,
  CollapseItem,
  CollapseSizeType,
} from "./Collapse.types";

const collapseSizes: CollapseSizeType[] = ["sm", "md", "lg"];
const collapseModes: CollapseCollapsibleType[] = ["header", "icon", "disabled"];
const collapseIconPlacements: CollapseExpandIconPlacementType[] = ["start", "end"];

const items = [
  {
    key: "one",
    label: "디자인 시스템이란 무엇인가요?",
    children: "일관된 사용자 경험을 위한 원칙과 컴포넌트 모음입니다.",
  },
  {
    key: "two",
    label: "여러 패널을 열 수 있나요?",
    children: "기본 모드에서는 여러 패널을 동시에 열 수 있습니다.",
  },
];
const headerAndIconItems: CollapseItem[] = [
  {
    key: "extra",
    label: "추가 정보와 오른쪽 아이콘",
    children: "extra와 아이콘 위치를 함께 설정할 수 있어요.",
    extra: <Tag color="blue">Beta</Tag>,
  },
  {
    key: "without-arrow",
    label: "펼침 아이콘 없는 패널",
    children: "showArrow가 false여도 헤더를 눌러 열 수 있어요.",
    showArrow: false,
  },
];
const itemsSource = `const items = [
  {
    key: 'one',
    label: '디자인 시스템이란 무엇인가요?',
    children: '일관된 사용자 경험을 위한 원칙과 컴포넌트 모음입니다.',
  },
  {
    key: 'two',
    label: '여러 패널을 열 수 있나요?',
    children: '기본 모드에서는 여러 패널을 동시에 열 수 있습니다.',
  },
];`;
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Collapse",
  component: Collapse,
  tags: ["autodocs"],
  argTypes: {
    accordion: { name: "아코디언", control: "boolean" },
    bordered: { name: "테두리", control: "boolean" },
    ghost: { name: "배경 제거", control: "boolean" },
    size: { name: "크기", control: "select", options: collapseSizes },
    expandIconPlacement: {
      name: "아이콘 위치",
      control: "select",
      options: collapseIconPlacements,
    },
    items: { control: false, table: { disable: true } },
    activeKey: { control: false, table: { disable: true } },
    defaultActiveKey: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "관련 콘텐츠를 접을 수 있는 패널로 나눠 필요한 정보만 표시해요.  \n다중·아코디언 펼침, 애니메이션, 크기, 아이콘 위치와 테두리 없는 모드를 지원해요.",
      },
      page: () => (
        <div className="collapse-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Collapse

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 패널 헤더와 콘텐츠를 구성해요. | [\`CollapseItem[]\`](#collapse-item) | \`[]\` |
| \`activeKey\` | 펼친 패널을 제어해요. | \`Key[]\` | - |
| \`defaultActiveKey\` | 처음 펼칠 패널을 정해요. | \`Key[]\` | \`[]\` |
| \`accordion\` | 한 번에 하나의 패널만 펼쳐요. | \`boolean\` | \`false\` |
| \`bordered\` | 외곽선과 패널 구분선을 표시해요. | \`boolean\` | \`true\` |
| \`ghost\` | 배경과 테두리를 제거해요. | \`boolean\` | \`false\` |
| \`size\` | 패널 헤더와 본문의 여백을 정해요. | [\`CollapseSizeType\`](#collapse-size-type) | \`md\` |
| \`expandIconPlacement\` | 펼침 아이콘을 시작 또는 끝에 배치해요. | [\`CollapseExpandIconPlacementType\`](#collapse-expand-icon-placement-type) | \`start\` |
| \`onChange\` | 펼친 패널이 바뀔 때 실행해요. | \`(keys: Key[]) => void\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |

### <span id="collapse-item">CollapseItem</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 패널을 구분하는 고유한 값이에요. | \`Key\` | - |
| \`label\` | 패널 헤더에 표시할 내용이에요. | \`ReactNode\` | - |
| \`children\` | 패널을 펼쳤을 때 표시할 내용이에요. | \`ReactNode\` | - |
| \`extra\` | 헤더 반대편에 추가 콘텐츠를 배치해요. | \`ReactNode\` | - |
| \`collapsible\` | 패널별 클릭 영역이나 비활성 상태를 정해요. | [\`CollapseCollapsibleType\`](#collapse-collapsible-type) | \`header\` |
| \`showArrow\` | 펼침 아이콘 표시 여부를 정해요. | \`boolean\` | \`true\` |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="collapse-size-type">CollapseSizeType</h3>
          <p>패널 크기를 선택해요.</p>
          <TypeTokens values={collapseSizes} />
          <h3 id="collapse-collapsible-type">CollapseCollapsibleType</h3>
          <p>패널을 여는 영역을 선택해요.</p>
          <TypeTokens values={collapseModes} />
          <h3 id="collapse-expand-icon-placement-type">CollapseExpandIconPlacementType</h3>
          <p>펼침 아이콘 위치를 선택해요.</p>
          <TypeTokens values={collapseIconPlacements} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Collapse>;
export default meta;
type Story = StoryObj<typeof meta>;

const basicSource = `${itemsSource}

<Collapse defaultActiveKey={['one']} items={items} />`;
export const Basic: Story = {
  args: {
    items,
    defaultActiveKey: ["one"],
    accordion: false,
    bordered: true,
    ghost: false,
    size: "md",
    expandIconPlacement: "start",
  },
  parameters: {
    ...storyDescription("components-collapse--basic"),
    controls: {
      disable: false,
      include: ["아코디언", "테두리", "배경 제거", "크기", "아이콘 위치"],
    },
    docs: {
      ...storyDescription("components-collapse--basic").docs,
      source: { type: "code", code: withStoryImports(basicSource) },
    },
  },
};
export const Accordion: Story = {
  args: {
    items,
    accordion: true,
    bordered: true,
    ghost: false,
    size: "md",
    expandIconPlacement: "start",
    defaultActiveKey: ["one"],
  },
  parameters: {
    ...storyDescription("components-collapse--accordion"),
    controls: {
      disable: false,
      include: ["아코디언", "테두리", "배경 제거", "크기", "아이콘 위치"],
    },
    docs: {
      ...storyDescription("components-collapse--accordion").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${itemsSource}\n\n<Collapse accordion defaultActiveKey={['one']} items={items} />`,
        ),
      },
    },
  },
};
export const Ghost: Story = {
  args: {
    items,
    accordion: false,
    bordered: true,
    ghost: true,
    size: "md",
    expandIconPlacement: "start",
    defaultActiveKey: ["one"],
  },
  parameters: {
    ...storyDescription("components-collapse--ghost"),
    controls: {
      disable: false,
      include: ["아코디언", "테두리", "배경 제거", "크기", "아이콘 위치"],
    },
    docs: {
      ...storyDescription("components-collapse--ghost").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<Collapse ghost defaultActiveKey={['one']} items={items} />`),
      },
    },
  },
};

export const Borders: Story = {
  args: { accordion: false, ghost: false, size: "md", expandIconPlacement: "start" },
  parameters: {
    ...storyDescription("components-collapse--borders"),
    controls: {
      disable: false,
      include: ["아코디언", "배경 제거", "크기", "아이콘 위치"],
    },
    docs: {
      ...storyDescription("components-collapse--borders").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<div className="grid w-full min-w-0 gap-4">
  <div className="min-w-0">
    <p className="mb-2 text-sm text-dark-gray">Bordered</p>
    <Collapse defaultActiveKey={['one']} items={items} />
  </div>
  <div className="min-w-0">
    <p className="mb-2 text-sm text-dark-gray">Borderless</p>
    <Collapse bordered={false} defaultActiveKey={['one']} items={items} />
  </div>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid w-full min-w-0 gap-4">
      <div className="min-w-0">
        <p className="mb-2 text-sm text-dark-gray">Bordered</p>
        <Collapse {...args} defaultActiveKey={["one"]} items={items} bordered />
      </div>
      <div className="min-w-0">
        <p className="mb-2 text-sm text-dark-gray">Borderless</p>
        <Collapse {...args} bordered={false} defaultActiveKey={["one"]} items={items} />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  args: { accordion: false, bordered: true, ghost: false, expandIconPlacement: "start" },
  parameters: {
    ...storyDescription("components-collapse--sizes"),
    controls: {
      disable: false,
      include: ["아코디언", "테두리", "배경 제거", "아이콘 위치"],
    },
    docs: {
      ...storyDescription("components-collapse--sizes").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<div className="grid w-full min-w-0 gap-4">
  <div className="min-w-0">
    <p className="mb-2 text-sm text-dark-gray">LG</p>
    <Collapse size="lg" items={items} />
  </div>
  <div className="min-w-0">
    <p className="mb-2 text-sm text-dark-gray">MD</p>
    <Collapse size="md" items={items} />
  </div>
  <div className="min-w-0">
    <p className="mb-2 text-sm text-dark-gray">SM</p>
    <Collapse size="sm" items={items} />
  </div>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid w-full min-w-0 gap-4">
      <div className="min-w-0">
        <p className="mb-2 text-sm text-dark-gray">LG</p>
        <Collapse {...args} size="lg" items={items} />
      </div>
      <div className="min-w-0">
        <p className="mb-2 text-sm text-dark-gray">MD</p>
        <Collapse {...args} size="md" items={items} />
      </div>
      <div className="min-w-0">
        <p className="mb-2 text-sm text-dark-gray">SM</p>
        <Collapse {...args} size="sm" items={items} />
      </div>
    </div>
  ),
};

export const Collapsible: Story = {
  args: { bordered: true, ghost: false, size: "md", expandIconPlacement: "start" },
  parameters: {
    ...storyDescription("components-collapse--collapsible"),
    controls: {
      disable: false,
      include: ["테두리", "배경 제거", "크기", "아이콘 위치"],
    },
    docs: {
      ...storyDescription("components-collapse--collapsible").docs,
      source: {
        type: "code",
        code: withStoryImports(`const items = [
  {
    key: 'header',
    label: '헤더 전체로 열기',
    children: '헤더 어디를 클릭해도 패널이 열려요.',
    collapsible: 'header',
  },
  {
    key: 'icon',
    label: '아이콘으로만 열기',
    children: '펼침 아이콘을 클릭해야 패널이 열려요.',
    collapsible: 'icon',
  },
  {
    key: 'disabled',
    label: '열 수 없는 패널',
    children: '비활성 패널이에요.',
    collapsible: 'disabled',
  },
];

<Collapse items={items} />`),
      },
    },
  },
  render: (args) => (
    <Collapse
      {...args}
      items={[
        {
          key: "header",
          label: "헤더 전체로 열기",
          children: "헤더 어디를 클릭해도 패널이 열려요.",
          collapsible: "header",
        },
        {
          key: "icon",
          label: "아이콘으로만 열기",
          children: "펼침 아이콘을 클릭해야 패널이 열려요.",
          collapsible: "icon",
        },
        {
          key: "disabled",
          label: "열 수 없는 패널",
          children: "비활성 패널이에요.",
          collapsible: "disabled",
        },
      ]}
    />
  ),
};

export const HeaderAndIcons: Story = {
  args: { accordion: false, bordered: true, ghost: false, size: "md" },
  parameters: {
    ...storyDescription("components-collapse--header-and-icons"),
    controls: { disable: false, include: ["아코디언", "테두리", "배경 제거", "크기"] },
    docs: {
      ...storyDescription("components-collapse--header-and-icons").docs,
      source: {
        type: "code",
        code: withStoryImports(`const items = [
  {
    key: 'extra',
    label: '추가 정보와 오른쪽 아이콘',
    children: 'extra와 아이콘 위치를 함께 설정할 수 있어요.',
    extra: <Tag color="blue">Beta</Tag>,
  },
  {
    key: 'without-arrow',
    label: '펼침 아이콘 없는 패널',
    children: 'showArrow가 false여도 헤더를 눌러 열 수 있어요.',
    showArrow: false,
  },
];

<Collapse
  defaultActiveKey={['extra']}
  expandIconPlacement="end"
  items={items}
/>`),
      },
    },
  },
  render: (args) => (
    <Collapse
      {...args}
      defaultActiveKey={["extra"]}
      expandIconPlacement="end"
      items={headerAndIconItems}
    />
  ),
};
