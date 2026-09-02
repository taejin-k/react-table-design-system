import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Menu } from "./Menu";
import type { MenuItemKindType, MenuModeType, MenuTriggerType } from "./Menu.types";

const menuModes: MenuModeType[] = ["vertical", "inline"];
const menuTriggers: MenuTriggerType[] = ["hover", "click"];
const menuItemKinds: MenuItemKindType[] = ["item", "group", "divider"];

const items = [
  { key: "home", label: "홈", icon: <Icon icon="home-outlined" /> },
  {
    key: "workspace",
    label: "워크스페이스",
    icon: <Icon icon="folder-outlined" />,
    children: [
      { key: "documents", label: "문서" },
      { key: "members", label: "멤버" },
    ],
  },
  { type: "divider" as const, key: "divider" },
  { key: "settings", label: "설정", icon: <Icon icon="setting" /> },
];
const itemsSource = `const items = [
  { key: 'home', label: '홈', icon: <Icon icon="home-outlined" /> },
  {
    key: 'workspace',
    label: '워크스페이스',
    icon: <Icon icon="folder-outlined" />,
    children: [
      { key: 'documents', label: '문서' },
      { key: 'members', label: '멤버' },
    ],
  },
  { type: 'divider', key: 'divider' },
  { key: 'settings', label: '설정', icon: <Icon icon="setting" /> },
];`;

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Menu",
  component: Menu,
  tags: ["autodocs"],
  argTypes: {
    mode: { name: "배치", control: "select", options: menuModes },
    selectable: { name: "선택 가능", control: "boolean" },
    multiple: { name: "다중 선택", control: "boolean" },
    inlineCollapsed: { name: "인라인 접기", control: "boolean" },
    triggerSubMenuAction: { name: "하위 메뉴 동작", control: "select", options: menuTriggers },
    items: { control: false, table: { disable: true } },
    selectedKeys: { control: false, table: { disable: true } },
    openKeys: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onClick: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "페이지 이동이나 작업 메뉴를 단계별로 보여줘요.  \n세로형과 인라인형, 한 개·여러 개 선택과 펼침 상태 제어를 지원해요.",
      },
      page: () => (
        <div className="menu-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Menu

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 메뉴 항목과 그룹, 구분선, 하위 메뉴를 넣어요. | [\`MenuItemType[]\`](#menu-item-type) | \`[]\` |
| \`mode\` | 메뉴를 세로형 또는 인라인형으로 배치해요. | [\`MenuModeType\`](#menu-mode-type) | \`vertical\` |
| \`selectable\` | 메뉴 항목을 선택할 수 있게 해요. | \`boolean\` | \`true\` |
| \`selectedKeys\` | 현재 선택된 항목을 직접 관리해요. | \`Key[]\` | - |
| \`defaultSelectedKeys\` | 처음 선택할 항목을 정해요. | \`Key[]\` | \`[]\` |
| \`openKeys\` | 현재 펼친 하위 메뉴를 직접 관리해요. | \`Key[]\` | - |
| \`defaultOpenKeys\` | 처음 펼쳐둘 하위 메뉴를 정해요. | \`Key[]\` | \`[]\` |
| \`multiple\` | 메뉴 항목을 여러 개 선택할 수 있게 해요. | \`boolean\` | \`false\` |
| \`inlineCollapsed\` | 인라인 메뉴를 아이콘만 보이게 접어요. | \`boolean\` | \`false\` |
| \`triggerSubMenuAction\` | 하위 메뉴를 클릭 또는 호버로 열게 해요. | [\`MenuTriggerType\`](#menu-trigger-type) | \`hover\` |
| \`className\` | 메뉴 최상위 요소에 Tailwind 스타일을 추가해요. | \`string\` | - |
| \`onClick\` | 메뉴 항목을 누르면 실행해요. | <code>(info: <a href="#menu-click-info">MenuClickInfo</a>) =&gt; void</code> | - |
| \`onSelect\` | 메뉴 항목이 선택되면 실행해요. | <code>(info: <a href="#menu-select-info">MenuSelectInfo</a>) =&gt; void</code> | - |
| \`onDeselect\` | 선택된 항목을 해제하면 실행해요. | <code>(info: <a href="#menu-select-info">MenuSelectInfo</a>) =&gt; void</code> | - |
| \`onOpenChange\` | 메뉴를 펼치거나 접을 때 실행해요. | \`(openKeys: Key[]) => void\` | - |

### <span id="menu-item-type">MenuItemType</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 항목을 구분하는 고유 값이에요. | \`Key\` | - |
| \`label\` | 항목에 보여줄 내용이에요. | \`ReactNode\` | - |
| \`icon\` | 항목 앞에 보여줄 아이콘이에요. | \`ReactNode\` | - |
| \`extra\` | 항목 오른쪽에 보조 내용을 보여줘요. | \`ReactNode\` | - |
| \`title\` | 항목의 기본 툴팁 문구를 정해요. | \`string\` | 접힌 메뉴의 문자열 \`label\` |
| \`children\` | 항목 아래에 표시할 하위 메뉴예요. | [\`MenuItemType[]\`](#menu-item-type) | - |
| \`disabled\` | 항목을 누르거나 선택하지 못하게 해요. | \`boolean\` | \`false\` |
| \`type\` | 항목을 일반, 그룹 또는 구분선으로 정해요. | [\`MenuItemKindType\`](#menu-item-kind-type) | \`item\` |
| \`popupClassName\` | 팝업 하위 메뉴에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`popupOffset\` | 팝업 하위 메뉴의 가로·세로 위치를 조정해요. | \`[number, number]\` | \`[0, 0]\` |
| \`onClick\` | 해당 메뉴 항목을 누르면 실행해요. | <code>(info: <a href="#menu-click-info">MenuClickInfo</a>) =&gt; void</code> | - |
| \`onTitleClick\` | 하위 메뉴가 있는 항목을 누르면 실행해요. | \`(info: { key: Key; event: MouseEvent<HTMLElement> }) => void\` | - |

### <span id="menu-click-info">MenuClickInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 누른 메뉴 항목의 키예요. | \`Key\` | - |
| \`event\` | 메뉴 항목에서 발생한 마우스 이벤트예요. | \`MouseEvent<HTMLElement>\` | - |

### <span id="menu-select-info">MenuSelectInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 선택하거나 해제한 메뉴 항목의 키예요. | \`Key\` | - |
| \`event\` | 메뉴 항목에서 발생한 마우스 이벤트예요. | \`MouseEvent<HTMLElement>\` | - |
| \`selectedKeys\` | 현재 선택된 모든 메뉴 항목의 키예요. | \`Key[]\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="menu-mode-type">MenuModeType</h3>
          <p>세로형 또는 인라인형을 선택해요.</p>
          <TypeTokens values={menuModes} />
          <h3 id="menu-trigger-type">MenuTriggerType</h3>
          <p>클릭 또는 호버 중 여는 방법을 선택해요.</p>
          <TypeTokens values={menuTriggers} />
          <h3 id="menu-item-kind-type">MenuItemKindType</h3>
          <p>일반 항목, 그룹 또는 구분선을 선택해요.</p>
          <TypeTokens values={menuItemKinds} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    selectable: true,
    multiple: false,
    inlineCollapsed: false,
    triggerSubMenuAction: "hover",
  },
  argTypes: { mode: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-menu--basic"),
    controls: {
      include: ["선택 가능", "다중 선택", "인라인 접기", "하위 메뉴 동작"],
    },
    docs: {
      ...storyDescription("components-menu--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<div className="grid gap-6 md:grid-cols-2">
  <div>
    <strong className="mb-2 block">Vertical</strong>
    <Menu defaultSelectedKeys={['home']} items={items} />
  </div>
  <div>
    <strong className="mb-2 block">Inline</strong>
    <Menu
      mode="inline"
      defaultSelectedKeys={['home']}
      defaultOpenKeys={['workspace']}
      items={items}
    />
  </div>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <strong className="mb-2 block">Vertical</strong>
        <Menu {...args} mode="vertical" defaultSelectedKeys={["home"]} items={items} />
      </div>
      <div>
        <strong className="mb-2 block">Inline</strong>
        <Menu
          {...args}
          mode="inline"
          defaultSelectedKeys={["home"]}
          defaultOpenKeys={["workspace"]}
          items={items}
        />
      </div>
    </div>
  ),
};

export const Collapsed: Story = {
  args: {
    selectable: true,
  },
  parameters: {
    ...storyDescription("components-menu--collapsed"),
    controls: { include: ["선택 가능"] },
    docs: {
      ...storyDescription("components-menu--collapsed").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

function CollapsibleMenu() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="grid w-fit gap-3">
      <Button size="sm" variant="secondary" onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? '메뉴 펼치기' : '메뉴 접기'}
      </Button>
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        defaultSelectedKeys={['home']}
        defaultOpenKeys={['workspace']}
        items={items}
      />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <CollapsedMenuExample {...args} />,
};

function CollapsedMenuExample(args: React.ComponentProps<typeof Menu>) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="grid w-fit gap-3">
      <Button size="sm" variant="secondary" onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? "메뉴 펼치기" : "메뉴 접기"}
      </Button>
      <Menu
        {...args}
        mode="inline"
        inlineCollapsed={collapsed}
        defaultSelectedKeys={["home"]}
        defaultOpenKeys={["workspace"]}
        items={items}
      />
    </div>
  );
}

export const ItemStates: Story = {
  args: {
    mode: "inline",
    selectable: true,
    multiple: false,
  },
  parameters: {
    ...storyDescription("components-menu--item-states"),
    controls: { include: ["배치", "선택 가능", "다중 선택"] },
    docs: {
      ...storyDescription("components-menu--item-states").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Menu
  mode="inline"
  defaultOpenKeys={['workspace']}
  items={[
    {
      type: 'group',
      key: 'workspace-group',
      label: '워크스페이스',
      children: [
        { key: 'overview', label: '개요', icon: <Icon icon="home-outlined" /> },
        { key: 'members', label: '멤버', extra: '12명' },
        { key: 'billing', label: '결제 관리', disabled: true },
      ],
    },
    { type: 'divider', key: 'divider' },
    {
      key: 'delete',
      label: '워크스페이스 삭제',
      icon: <Icon icon="delete-outlined" />,
    },
  ]}
/>`),
      },
    },
  },
  render: (args) => (
    <Menu
      {...args}
      defaultSelectedKeys={["overview"]}
      items={[
        {
          type: "group",
          key: "workspace-group",
          label: "워크스페이스",
          children: [
            { key: "overview", label: "개요", icon: <Icon icon="home-outlined" /> },
            { key: "members", label: "멤버", extra: "12명" },
            { key: "billing", label: "결제 관리", disabled: true },
          ],
        },
        { type: "divider", key: "divider" },
        {
          key: "delete",
          label: "워크스페이스 삭제",
          icon: <Icon icon="delete-outlined" />,
        },
      ]}
    />
  ),
};
