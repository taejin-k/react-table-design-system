import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Tag } from "../Tag";
import { Collapse } from "./Collapse";
import type {
  CollapseCollapsibleType,
  CollapseExpandIconPlacementType,
  CollapseItem,
  CollapseSizeType,
} from "./Collapse.types";

const collapseSizes: CollapseSizeType[] = ["large", "medium", "small"];
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
    label: "추가 정보와 사용자 정의 아이콘",
    children: "extra와 expandIcon을 함께 사용할 수 있어요.",
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
  parameters: {
    controls: { disable: true },
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
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 패널 헤더와 콘텐츠를 구성해요. | [\`CollapseItem[]\`](#collapse-item) | \`[]\` |
| \`activeKey\` | 펼친 패널을 제어해요. | \`string \\| number \\| (string \\| number)[]\` | - |
| \`defaultActiveKey\` | 처음 펼칠 패널을 정해요. | \`string \\| number \\| (string \\| number)[]\` | \`[]\` |
| \`accordion\` | 한 번에 하나의 패널만 펼쳐요. | \`boolean\` | \`false\` |
| \`bordered\` | 외곽선과 패널 구분선을 표시해요. | \`boolean\` | \`true\` |
| \`ghost\` | 배경과 테두리를 제거해요. | \`boolean\` | \`false\` |
| \`size\` | 패널 헤더와 본문의 여백을 정해요. | [\`CollapseSizeType\`](#collapse-size-type) | \`medium\` |
| \`collapsible\` | 헤더·아이콘만 클릭하거나 전체를 비활성화해요. | [\`CollapseCollapsibleType\`](#collapse-collapsible-type) | \`header\` |
| \`expandIcon\` | 펼침 아이콘을 직접 구성해요. | \`({ isActive, item }) => ReactNode\` | 기본 화살표 |
| \`expandIconPlacement\` | 펼침 아이콘을 시작 또는 끝에 배치해요. | [\`CollapseExpandIconPlacementType\`](#collapse-expand-icon-placement-type) | \`start\` |
| \`destroyOnHidden\` | 접힌 패널 콘텐츠를 DOM에서 제거해요. | \`boolean\` | \`false\` |
| \`onChange\` | 펼친 패널이 바뀔 때 실행해요. | \`(key: string \\| number \\| (string \\| number)[]) => void\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`style\` | 최상위 요소에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |

### <span id="collapse-item">CollapseItem</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 패널을 구분하는 고유한 값이에요. | \`string \\| number\` | - |
| \`label\` | 패널 헤더에 표시할 내용이에요. | \`ReactNode\` | - |
| \`children\` | 패널을 펼쳤을 때 표시할 내용이에요. | \`ReactNode\` | - |
| \`extra\` | 헤더 반대편에 추가 콘텐츠를 배치해요. | \`ReactNode\` | - |
| \`collapsible\` | 패널별 클릭 영역이나 비활성 상태를 정해요. | [\`CollapseCollapsibleType\`](#collapse-collapsible-type) | Collapse의 collapsible |
| \`forceRender\` | 접힌 상태에서도 콘텐츠를 미리 렌더링해요. | \`boolean\` | \`false\` |
| \`showArrow\` | 펼침 아이콘 표시 여부를 정해요. | \`boolean\` | \`true\` |
| \`className\` | 패널 최상위 요소에 클래스를 추가해요. | \`string\` | - |
| \`style\` | 패널 최상위 요소에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |
| \`classNames\` | 패널 헤더와 본문에 클래스를 추가해요. | \`{ header?, body? }\` | - |
| \`styles\` | 패널 헤더와 본문에 인라인 스타일을 추가해요. | \`{ header?, body? }\` | - |
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
  args: { items, defaultActiveKey: ["one"] },
  parameters: {
    ...storyDescription("components-collapse--basic"),
    docs: {
      ...storyDescription("components-collapse--basic").docs,
      source: { type: "code", code: withStoryImports(basicSource) },
    },
  },
};
export const Accordion: Story = {
  args: { items, accordion: true, defaultActiveKey: "one" },
  parameters: {
    ...storyDescription("components-collapse--accordion"),
    docs: {
      ...storyDescription("components-collapse--accordion").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${itemsSource}\n\n<Collapse accordion defaultActiveKey="one" items={items} />`,
        ),
      },
    },
  },
};
export const Ghost: Story = {
  args: { items, ghost: true, defaultActiveKey: ["one"] },
  parameters: {
    ...storyDescription("components-collapse--ghost"),
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

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-collapse--sizes"),
    docs: {
      ...storyDescription("components-collapse--sizes").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<div className="grid gap-4">
  <div>
    <p className="mb-2 text-sm text-[#666]">Large</p>
    <Collapse size="large" items={items} />
  </div>
  <div>
    <p className="mb-2 text-sm text-[#666]">Medium</p>
    <Collapse size="medium" items={items} />
  </div>
  <div>
    <p className="mb-2 text-sm text-[#666]">Small</p>
    <Collapse size="small" items={items} />
  </div>
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid gap-4">
      <div>
        <p className="mb-2 text-sm text-[#666]">Large</p>
        <Collapse size="large" items={items} />
      </div>
      <div>
        <p className="mb-2 text-sm text-[#666]">Medium</p>
        <Collapse size="medium" items={items} />
      </div>
      <div>
        <p className="mb-2 text-sm text-[#666]">Small</p>
        <Collapse size="small" items={items} />
      </div>
    </div>
  ),
};

export const Collapsible: Story = {
  parameters: {
    ...storyDescription("components-collapse--collapsible"),
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
  render: () => (
    <Collapse
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
  parameters: {
    ...storyDescription("components-collapse--header-and-icons"),
    docs: {
      ...storyDescription("components-collapse--header-and-icons").docs,
      source: {
        type: "code",
        code: withStoryImports(`const items = [
  {
    key: 'extra',
    label: '추가 정보와 사용자 정의 아이콘',
    children: 'extra와 expandIcon을 함께 사용할 수 있어요.',
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
  expandIcon={({ isActive }) => (
    <Icon icon={isActive ? 'remove' : 'add'} size={12} />
  )}
  items={items}
/>`),
      },
    },
  },
  render: () => (
    <Collapse
      defaultActiveKey={["extra"]}
      expandIconPlacement="end"
      expandIcon={({ isActive }) => <Icon icon={isActive ? "remove" : "add"} size={12} />}
      items={headerAndIconItems}
    />
  ),
};

function PanelCounter({ label }: { label: string }) {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <span>
        {label}: {count}
      </span>
      <Button size="sm" onClick={() => setCount((current) => current + 1)}>
        증가
      </Button>
    </div>
  );
}

function ControlledAndRenderingExample() {
  const [activeKey, setActiveKey] = useState(["destroyed"]);

  return (
    <div className="grid gap-3">
      <p className="text-sm text-[#666]">
        펼친 패널: {activeKey.length > 0 ? activeKey.join(", ") : "없음"}
      </p>
      <Collapse
        activeKey={activeKey}
        destroyOnHidden
        onChange={(key) => setActiveKey((Array.isArray(key) ? key : [key]).map(String))}
        items={[
          {
            key: "destroyed",
            label: "접으면 상태 초기화",
            children: <PanelCounter label="제거되는 콘텐츠" />,
          },
          {
            key: "preserved",
            label: "접어도 상태 유지",
            forceRender: true,
            children: <PanelCounter label="유지되는 콘텐츠" />,
          },
        ]}
      />
    </div>
  );
}

export const ControlledAndRendering: Story = {
  parameters: {
    ...storyDescription("components-collapse--controlled-and-rendering"),
    docs: {
      ...storyDescription("components-collapse--controlled-and-rendering").docs,
      source: {
        type: "code",
        code: withStoryImports(`function PanelCounter({ label }) {
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <span>{label}: {count}</span>
      <Button size="sm" onClick={() => setCount((current) => current + 1)}>
        증가
      </Button>
    </div>
  );
}

function ControlledAndRendering() {
  const [activeKey, setActiveKey] = useState(['destroyed']);

  return (
    <div className="grid gap-3">
      <p className="text-sm text-[#666]">
        펼친 패널: {activeKey.length > 0 ? activeKey.join(', ') : '없음'}
      </p>
      <Collapse
        activeKey={activeKey}
        destroyOnHidden
        onChange={(key) => {
          setActiveKey((Array.isArray(key) ? key : [key]).map(String));
        }}
        items={[
          {
            key: 'destroyed',
            label: '접으면 상태 초기화',
            children: <PanelCounter label="제거되는 콘텐츠" />,
          },
          {
            key: 'preserved',
            label: '접어도 상태 유지',
            forceRender: true,
            children: <PanelCounter label="유지되는 콘텐츠" />,
          },
        ]}
      />
    </div>
  );
}`),
      },
    },
  },
  render: () => <ControlledAndRenderingExample />,
};
