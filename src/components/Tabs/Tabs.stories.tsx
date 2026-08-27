import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState, type MouseEvent } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Tabs } from "./Tabs";
import type { TabsPlacementType, TabsProps, TabsSizeType, TabsType } from "./Tabs.types";

const tabsTypes: TabsType[] = ["line", "card", "editable-card"];
const tabsSizes: TabsSizeType[] = ["large", "medium", "small"];
const tabsPlacements: TabsPlacementType[] = ["top", "end", "bottom", "start"];

const items = [
  { key: "overview", label: "개요", children: "프로젝트 개요" },
  { key: "activity", label: "활동", children: "최근 활동" },
  { key: "disabled", label: "비활성", disabled: true, closable: false },
];
const itemsSource = `const items = [
  { key: 'overview', label: '개요', children: '프로젝트 개요' },
  { key: 'activity', label: '활동', children: '최근 활동' },
  { key: 'disabled', label: '비활성', disabled: true, closable: false },
];`;
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

function EditableTabsExample({ size, ...args }: Partial<TabsProps> & { size: TabsSizeType }) {
  const [editableItems, setEditableItems] = useState(items);
  const [nextTab, setNextTab] = useState(1);

  const handleEdit = (targetKey: string | MouseEvent, action: "add" | "remove") => {
    if (action === "add") {
      const key = `new-${nextTab}`;
      setEditableItems((current) => [
        ...current,
        { key, label: `새 탭 ${nextTab}`, children: `새 탭 ${nextTab} 내용` },
      ]);
      setNextTab((current) => current + 1);
      return;
    }

    setEditableItems((current) => current.filter((item) => item.key !== targetKey));
  };

  return (
    <Tabs {...args} type="editable-card" size={size} items={editableItems} onEdit={handleEdit} />
  );
}

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    type: { name: "종류", control: "select", options: tabsTypes },
    size: { name: "크기", control: "select", options: tabsSizes },
    tabPlacement: { name: "위치", control: "select", options: tabsPlacements },
    animated: { name: "애니메이션", control: "boolean" },
    centered: { name: "가운데 정렬", control: "boolean" },
    tabBarGutter: { name: "탭 간격", control: "number" },
    hideAdd: { name: "추가 버튼 숨김", control: "boolean" },
    items: { control: false, table: { disable: true } },
    activeKey: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
    onEdit: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "같은 영역 안의 연관된 콘텐츠를 탭으로 전환해요.  \n선·카드·편집형 모드, 네 방향 배치, 제어 상태와 탭 전환 애니메이션을 지원해요.",
      },
      page: () => (
        <div className="tabs-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Tabs

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 탭 레이블과 콘텐츠를 구성해요. | \`TabItemType[]\` | \`[]\` |
| \`activeKey\` | 활성 탭을 제어해요. | \`string\` | - |
| \`defaultActiveKey\` | 처음 활성화할 탭을 정해요. | \`string\` | 첫 번째 탭 |
| \`type\` | 탭의 표현 방식을 정해요. | [\`TabsType\`](#tabs-type) | \`line\` |
| \`size\` | 탭의 높이와 여백을 정해요. | [\`TabsSizeType\`](#tabs-size-type) | \`medium\` |
| \`tabPlacement\` | 탭 목록의 위치를 정해요. | [\`TabsPlacementType\`](#tabs-placement-type) | \`top\` |
| \`animated\` | 표시선과 콘텐츠 전환 애니메이션을 설정해요. | \`boolean \\| { inkBar?: boolean; tabPane?: boolean }\` | \`{ inkBar: true, tabPane: false }\` |
| \`centered\` | 탭 목록을 가운데 정렬해요. | \`boolean\` | \`false\` |
| \`destroyOnHidden\` | 숨겨진 탭 콘텐츠를 DOM에서 제거해요. | \`boolean\` | \`false\` |
| \`tabBarGutter\` | 탭 사이의 간격을 px로 정해요. | \`number\` | - |
| \`tabBarExtraContent\` | 탭 목록 양쪽에 추가 콘텐츠를 배치해요. | \`ReactNode \\| { left?: ReactNode; right?: ReactNode }\` | - |
| \`tabBarStyle\` | 탭 목록에 인라인 스타일을 적용해요. | \`CSSProperties\` | - |
| \`hideAdd\` | 편집형 탭의 추가 버튼을 숨겨요. | \`boolean\` | \`false\` |
| \`addIcon\` | 편집형 탭의 추가 아이콘을 변경해요. | \`ReactNode\` | - |
| \`removeIcon\` | 편집형 탭의 제거 아이콘을 변경해요. | \`ReactNode\` | - |
| \`indicator\` | 표시선의 크기와 정렬을 설정해요. | \`{ size?, align? }\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`classNames\` | 내부 영역별 className을 설정해요. | \`{ root?, header?, body?, item?, indicator? }\` | - |
| \`styles\` | 내부 영역별 인라인 스타일을 설정해요. | \`{ root?, header?, body?, item?, indicator? }\` | - |
| \`onChange\` | 활성 탭이 바뀔 때 실행해요. | \`(activeKey: string) => void\` | - |
| \`onEdit\` | 편집형 탭을 추가하거나 제거할 때 실행해요. | \`(targetKey, action) => void\` | - |
| \`onTabClick\` | 탭을 누를 때 실행해요. | \`(key, event) => void\` | - |
| \`renderTabBar\` | 탭 목록 전체를 사용자 정의해요. | \`(props, DefaultTabBar) => ReactElement\` | - |

### TabItemType

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 탭을 구분하는 고유한 값이에요. | \`string\` | - |
| \`label\` | 탭 버튼에 표시할 내용이에요. | \`ReactNode\` | - |
| \`children\` | 탭이 활성화됐을 때 표시할 콘텐츠예요. | \`ReactNode\` | - |
| \`disabled\` | 탭 선택을 막아요. | \`boolean\` | \`false\` |
| \`closable\` | 편집형 탭의 닫기 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`destroyOnHidden\` | 숨겨진 탭 콘텐츠를 DOM에서 제거해요. | \`boolean\` | \`false\` |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="tabs-type">TabsType</h3>
          <p>탭의 표현 방식을 선택해요.</p>
          <TypeTokens values={tabsTypes} />
          <h3 id="tabs-size-type">TabsSizeType</h3>
          <p>탭 크기를 선택해요.</p>
          <TypeTokens values={tabsSizes} />
          <h3 id="tabs-placement-type">TabsPlacementType</h3>
          <p>탭 목록 위치를 선택해요.</p>
          <TypeTokens values={tabsPlacements} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { type: "line", tabPlacement: "top", animated: true, centered: false, tabBarGutter: 0 },
  parameters: {
    ...storyDescription("components-tabs--basic"),
    docs: {
      ...storyDescription("components-tabs--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<div className="grid gap-3">
  <Tabs size="small" defaultActiveKey="overview" items={items} />
  <Tabs size="medium" defaultActiveKey="overview" items={items} />
  <Tabs size="large" defaultActiveKey="overview" items={items} />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-3">
      <Tabs {...args} size="small" defaultActiveKey="overview" items={items} />
      <Tabs {...args} size="medium" defaultActiveKey="overview" items={items} />
      <Tabs {...args} size="large" defaultActiveKey="overview" items={items} />
    </div>
  ),
};
export const Card: Story = {
  args: { items, type: "card" },
  parameters: {
    ...storyDescription("components-tabs--card"),
    docs: {
      ...storyDescription("components-tabs--card").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Tabs type="card" items={items} />`),
      },
    },
  },
};
export const Editable: Story = {
  args: { tabPlacement: "top", animated: true, centered: false, tabBarGutter: 0, hideAdd: false },
  parameters: {
    ...storyDescription("components-tabs--editable"),
    docs: {
      ...storyDescription("components-tabs--editable").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

function EditableTabsExample({ size }) {
  const [editableItems, setEditableItems] = useState(items);
  const [nextTab, setNextTab] = useState(1);

  const handleEdit = (targetKey, action) => {
    if (action === 'add') {
      const key = \`new-\${nextTab}\`;
      setEditableItems((current) => [
        ...current,
        { key, label: \`새 탭 \${nextTab}\`, children: \`새 탭 \${nextTab} 내용\` },
      ]);
      setNextTab((current) => current + 1);
      return;
    }

    setEditableItems((current) => current.filter((item) => item.key !== targetKey));
  };

  return <Tabs type="editable-card" size={size} items={editableItems} onEdit={handleEdit} />;
}

<div className="grid gap-3">
  <EditableTabsExample size="small" />
  <EditableTabsExample size="medium" />
  <EditableTabsExample size="large" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-3">
      <EditableTabsExample {...args} size="small" />
      <EditableTabsExample {...args} size="medium" />
      <EditableTabsExample {...args} size="large" />
    </div>
  ),
};
export const Vertical: Story = {
  args: { items, tabPlacement: "start" },
  parameters: {
    ...storyDescription("components-tabs--vertical"),
    docs: {
      ...storyDescription("components-tabs--vertical").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Tabs tabPlacement="start" items={items} />`),
      },
    },
  },
};
