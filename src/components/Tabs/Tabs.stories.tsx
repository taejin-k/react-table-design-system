import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState, type Key } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Tabs } from "./Tabs";
import type {
  TabItemType,
  TabsPlacementType,
  TabsProps,
  TabsSizeType,
  TabsType,
} from "./Tabs.types";

const tabsTypes: TabsType[] = ["line", "card"];
const tabsSizes: TabsSizeType[] = ["lg", "md", "sm"];
const tabsPlacements: TabsPlacementType[] = ["top", "end", "bottom", "start"];

const items: TabItemType[] = [
  { key: "overview", label: "개요", children: "프로젝트 개요" },
  { key: "activity", label: "활동", children: "최근 활동" },
  { key: "disabled", label: "비활성", disabled: true },
];
const itemsSource = `const items: TabItemType[] = [
  { key: 'overview', label: '개요', children: '프로젝트 개요' },
  { key: 'activity', label: '활동', children: '최근 활동' },
  { key: 'disabled', label: '비활성', disabled: true },
];`;
const draggableItems: TabItemType[] = [
  { key: "overview", label: "개요", children: "프로젝트 개요" },
  { key: "activity", label: "활동", children: "최근 활동" },
  { key: "settings", label: "설정", children: "프로젝트 설정" },
];
const draggableItemsSource = `const initialItems: TabItemType[] = [
  { key: 'overview', label: '개요', children: '프로젝트 개요' },
  { key: 'activity', label: '활동', children: '최근 활동' },
  { key: 'settings', label: '설정', children: '프로젝트 설정' },
];`;
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

function EditableTabsExample({
  addable = true,
  deletable = false,
  draggable = false,
  ...args
}: Partial<TabsProps> & {
  addable?: boolean;
  deletable?: boolean;
  draggable?: boolean;
}) {
  const [editableItems, setEditableItems] = useState(items);
  const handleAdd = (current: TabItemType[]) => {
    const newItem: TabItemType = {
      key: `new-${Date.now()}`,
      label: "새 탭",
      children: "새 탭 내용",
    };
    setEditableItems([...current, newItem]);
  };

  return (
    <Tabs
      {...args}
      type="card"
      items={editableItems}
      onAdd={addable ? handleAdd : undefined}
      onDelete={deletable ? setEditableItems : undefined}
      onDrag={draggable ? setEditableItems : undefined}
    />
  );
}

function DraggableTabsExample(args: Partial<TabsProps>) {
  const [draggableTabs, setDraggableTabs] = useState(draggableItems);

  return <Tabs {...args} type="card" items={draggableTabs} onDrag={setDraggableTabs} />;
}

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    type: { name: "종류", control: "select", options: tabsTypes },
    size: { name: "크기", control: "select", options: tabsSizes },
    placement: { name: "위치", control: "select", options: tabsPlacements },
    animated: { name: "애니메이션", control: "boolean" },
    centered: { name: "가운데 정렬", control: "boolean" },
    items: { control: false, table: { disable: true } },
    activeKey: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
    onAdd: { control: false, table: { disable: true } },
    onDelete: { control: false, table: { disable: true } },
    onDrag: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "같은 영역 안의 연관된 콘텐츠를 탭으로 전환해요.  \n선·카드 모드, 네 방향 배치, 탭 추가·삭제·드래그 정렬과 콘텐츠 전환 애니메이션을 지원해요.",
      },
      page: () => (
        <div className="tabs-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### <span id="tabs">Tabs</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 탭 레이블과 콘텐츠를 구성해요. | [\`TabItemType[]\`](#tab-item-type) | \`[]\` |
| \`activeKey\` | 활성 탭을 제어해요. | \`Key\` | - |
| \`defaultActiveKey\` | 처음 활성화할 탭을 정해요. | \`Key\` | 첫 번째 탭 |
| \`type\` | 탭의 표현 방식을 정해요. | [\`TabsType\`](#tabs-type) | \`line\` |
| \`size\` | 탭의 높이와 여백을 정해요. | [\`TabsSizeType\`](#tabs-size-type) | \`md\` |
| \`placement\` | 탭 목록의 위치를 정해요. | [\`TabsPlacementType\`](#tabs-placement-type) | \`top\` |
| \`animated\` | 콘텐츠 전환 애니메이션을 설정해요. | \`boolean\` | \`false\` |
| \`centered\` | 탭 목록을 가운데 정렬해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 활성 탭이 바뀔 때 실행해요. | \`(activeKey: Key) => void\` | - |
| \`onAdd\` | 추가 버튼을 표시하고 현재 목록을 전달해요. | <code>(items: <a href="#tab-item-type">TabItemType[]</a>) =&gt; void</code> | - |
| \`onDelete\` | 닫기 버튼을 표시하고 삭제된 목록을 전달해요. | <code>(items: <a href="#tab-item-type">TabItemType[]</a>) =&gt; void</code> | - |
| \`onDrag\` | card 탭을 드래그해 정렬하고 변경된 목록을 전달해요. | <code>(items: <a href="#tab-item-type">TabItemType[]</a>) =&gt; void</code> | - |
| \`onTabClick\` | 탭을 누를 때 실행해요. | \`(key: Key, event: MouseEvent<HTMLElement>) => void\` | - |
| \`renderTabBar\` | 탭 목록 전체를 사용자 정의해요. | \`(props: TabsProps, DefaultTabBar: () => ReactElement) => ReactElement\` | - |

### <span id="tab-item-type">TabItemType</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 탭을 구분하는 고유한 값이에요. | \`Key\` | - |
| \`label\` | 탭 버튼에 표시할 내용이에요. | \`ReactNode\` | - |
| \`icon\` | 탭 이름 앞에 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`children\` | 탭이 활성화됐을 때 표시할 콘텐츠예요. | \`ReactNode\` | - |
| \`disabled\` | 탭 선택과 삭제를 막아요. | \`boolean\` | \`false\` |
| \`closable\` | onDelete 사용 시 이 탭의 닫기 버튼을 표시해요. | \`boolean\` | \`true\` |
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
  args: {
    items,
    type: "line",
    size: "md",
    placement: "top",
    animated: false,
    centered: false,
  },
  argTypes: { size: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-tabs--basic"),
    controls: { include: ["위치", "애니메이션", "가운데 정렬"] },
    docs: {
      ...storyDescription("components-tabs--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Tabs items={items} />`),
      },
    },
  },
};

export const Sizes: Story = {
  args: {
    placement: "top",
    animated: false,
    centered: false,
  },
  argTypes: { size: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-tabs--sizes"),
    controls: { include: ["위치", "애니메이션", "가운데 정렬"] },
    docs: {
      ...storyDescription("components-tabs--sizes").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<div className="grid gap-4">
  <Tabs size="sm" items={items} />
  <Tabs size="md" items={items} />
  <Tabs size="lg" items={items} />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-4">
      <Tabs {...args} size="sm" items={items} />
      <Tabs {...args} size="md" items={items} />
      <Tabs {...args} size="lg" items={items} />
    </div>
  ),
};
export const Animate: Story = {
  args: {
    items,
    size: "md",
    placement: "top",
    animated: true,
    centered: false,
  },
  parameters: {
    ...storyDescription("components-tabs--animate"),
    controls: { include: ["크기", "위치", "애니메이션", "가운데 정렬"] },
    docs: {
      ...storyDescription("components-tabs--animate").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Tabs animated items={items} />`),
      },
    },
  },
};
export const Card: Story = {
  args: {
    placement: "top",
    animated: false,
    centered: false,
  },
  argTypes: { size: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-tabs--card"),
    controls: { include: ["위치", "애니메이션", "가운데 정렬"] },
    docs: {
      ...storyDescription("components-tabs--card").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<div className="grid gap-4">
  <Tabs type="card" size="sm" items={items} />
  <Tabs type="card" size="md" items={items} />
  <Tabs type="card" size="lg" items={items} />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-4">
      <Tabs {...args} type="card" size="sm" items={items} />
      <Tabs {...args} type="card" size="md" items={items} />
      <Tabs {...args} type="card" size="lg" items={items} />
    </div>
  ),
};
export const OnAdd: Story = {
  args: {
    size: "md",
    placement: "top",
    animated: false,
    centered: false,
  },
  parameters: {
    ...storyDescription("components-tabs--on-add"),
    controls: {
      include: ["크기", "위치", "애니메이션", "가운데 정렬"],
    },
    docs: {
      ...storyDescription("components-tabs--on-add").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

function EditableTabsExample() {
  const [editableItems, setEditableItems] = useState(items);
  const handleAdd = (current: TabItemType[]) => {
    const newItem: TabItemType = {
      key: \`new-\${Date.now()}\`,
      label: '새 탭',
      children: '새 탭 내용',
    };
    setEditableItems([...current, newItem]);
  };

  return (
    <Tabs
      type="card"
      items={editableItems}
      onAdd={handleAdd}
    />
  );
}

<EditableTabsExample />`),
      },
    },
  },
  render: (args) => <EditableTabsExample {...args} />,
};

export const OnDelete: Story = {
  args: {
    size: "md",
    placement: "top",
    animated: false,
    centered: false,
  },
  parameters: {
    ...storyDescription("components-tabs--on-delete"),
    controls: {
      include: ["크기", "위치", "애니메이션", "가운데 정렬"],
    },
    docs: {
      ...storyDescription("components-tabs--on-delete").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

function DeletableTabsExample() {
  const [deletableItems, setDeletableItems] = useState(items);

  return (
    <Tabs
      type="card"
      items={deletableItems}
      onDelete={setDeletableItems}
    />
  );
}

<DeletableTabsExample />`),
      },
    },
  },
  render: (args) => <EditableTabsExample {...args} addable={false} deletable />,
};

export const OnAddAndDelete: Story = {
  args: {
    size: "md",
    placement: "top",
    animated: false,
    centered: false,
  },
  parameters: {
    ...storyDescription("components-tabs--on-add-and-delete"),
    controls: {
      include: ["크기", "위치", "애니메이션", "가운데 정렬"],
    },
    docs: {
      ...storyDescription("components-tabs--on-add-and-delete").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

function EditableTabsExample() {
  const [editableItems, setEditableItems] = useState(items);
  const handleAdd = (current: TabItemType[]) => {
    const newItem: TabItemType = {
      key: \`new-\${Date.now()}\`,
      label: '새 탭',
      children: '새 탭 내용',
    };
    setEditableItems([...current, newItem]);
  };

  return (
    <Tabs
      type="card"
      items={editableItems}
      onAdd={handleAdd}
      onDelete={setEditableItems}
    />
  );
}

<EditableTabsExample />`),
      },
    },
  },
  render: (args) => <EditableTabsExample {...args} deletable />,
};

export const AddDragDelete: Story = {
  args: {
    size: "md",
    placement: "top",
    animated: false,
    centered: false,
  },
  parameters: {
    ...storyDescription("components-tabs--add-drag-delete"),
    controls: {
      include: ["크기", "위치", "애니메이션", "가운데 정렬"],
    },
    docs: {
      ...storyDescription("components-tabs--add-drag-delete").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

function EditableTabsExample() {
  const [editableItems, setEditableItems] = useState(items);
  const handleAdd = (current: TabItemType[]) => {
    const newItem: TabItemType = {
      key: \`new-\${Date.now()}\`,
      label: '새 탭',
      children: '새 탭 내용',
    };
    setEditableItems([...current, newItem]);
  };

  return (
    <Tabs
      type="card"
      items={editableItems}
      onAdd={handleAdd}
      onDrag={setEditableItems}
      onDelete={setEditableItems}
    />
  );
}

<EditableTabsExample />`),
      },
    },
  },
  render: (args) => <EditableTabsExample {...args} deletable draggable />,
};

export const Draggable: Story = {
  args: {
    size: "md",
    placement: "top",
    animated: false,
    centered: false,
  },
  parameters: {
    ...storyDescription("components-tabs--draggable"),
    controls: {
      include: ["크기", "위치", "애니메이션", "가운데 정렬"],
    },
    docs: {
      ...storyDescription("components-tabs--draggable").docs,
      source: {
        type: "code",
        code: withStoryImports(`${draggableItemsSource}

function DraggableTabsExample() {
  const [items, setItems] = useState(initialItems);

  return <Tabs type="card" items={items} onDrag={setItems} />;
}

<DraggableTabsExample />`),
      },
    },
  },
  render: (args) => <DraggableTabsExample {...args} />,
};

export const Placements: Story = {
  args: {
    size: "md",
    animated: false,
    centered: false,
  },
  argTypes: {
    type: { control: false, table: { disable: true } },
    placement: { control: false, table: { disable: true } },
    centered: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-tabs--placements"),
    controls: { include: ["크기", "애니메이션"] },
    docs: {
      ...storyDescription("components-tabs--placements").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

const placements = ['top', 'end', 'bottom', 'start'] as const;
const types = ['line', 'card'] as const;

<div className="grid gap-10">
  {types.map((type) => (
    <section key={type} className="grid gap-4">
      <strong className="capitalize">{type}</strong>
      <div className="grid gap-6 xl:grid-cols-2">
        {placements.map((placement) => (
          <div key={placement} className="min-h-44 rounded-lg border border-[#ddd] p-4">
            <span className="mb-3 block text-sm text-[#666]">{placement}</span>
            <Tabs type={type} placement={placement} items={items} />
          </div>
        ))}
      </div>
    </section>
  ))}
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-10">
      {tabsTypes.map((type) => (
        <section key={type} className="grid gap-4">
          <strong className="capitalize">{type}</strong>
          <div className="grid gap-6 xl:grid-cols-2">
            {tabsPlacements.map((placement) => (
              <div key={placement} className="min-h-44 rounded-lg border border-[#ddd] p-4">
                <span className="mb-3 block text-sm text-[#666]">{placement}</span>
                <Tabs {...args} type={type} placement={placement} items={items} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Centered: Story = {
  args: {
    items,
    type: "line",
    size: "md",
    placement: "top",
    animated: false,
    centered: true,
  },
  argTypes: {
    placement: { control: false, table: { disable: true } },
    centered: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-tabs--centered"),
    controls: { include: ["종류", "크기", "애니메이션"] },
    docs: {
      ...storyDescription("components-tabs--centered").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Tabs centered items={items} />`),
      },
    },
  },
};

export const Controlled: Story = {
  args: {
    size: "md",
    animated: false,
  },
  parameters: {
    ...storyDescription("components-tabs--controlled"),
    controls: { include: ["크기", "애니메이션"] },
    docs: {
      ...storyDescription("components-tabs--controlled").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

function ControlledTabs() {
  const [activeKey, setActiveKey] = useState<Key>('overview');

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setActiveKey('overview')}>개요 열기</Button>
        <Button size="sm" variant="secondary" onClick={() => setActiveKey('activity')}>
          활동 열기
        </Button>
      </div>
      <span className="text-sm text-[#666]">현재 탭: {activeKey}</span>
      <Tabs activeKey={activeKey} items={items} onChange={setActiveKey} />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <ControlledTabsExample {...args} />,
};

function ControlledTabsExample(args: Partial<TabsProps>) {
  const [activeKey, setActiveKey] = useState<Key>("overview");

  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setActiveKey("overview")}>
          개요 열기
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setActiveKey("activity")}>
          활동 열기
        </Button>
      </div>
      <span className="text-sm text-[#666]">현재 탭: {activeKey}</span>
      <Tabs {...args} activeKey={activeKey} items={items} onChange={setActiveKey} />
    </div>
  );
}
