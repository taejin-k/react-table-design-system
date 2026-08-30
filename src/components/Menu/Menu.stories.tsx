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

const menuModes: MenuModeType[] = ["vertical", "horizontal", "inline"];
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
    inlineIndent: { name: "들여쓰기", control: "number" },
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
          "페이지 이동과 작업을 계층적으로 구성해요.  \n세 가지 배치 모드, 단일·다중 선택과 제어·비제어 펼침 상태를 지원해요.",
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
| \`items\` | 메뉴 항목, 그룹, 구분선과 하위 메뉴를 구성해요. | \`MenuItemType[]\` | \`[]\` |
| \`mode\` | 메뉴의 배치 방식을 정해요. | [\`MenuModeType\`](#menu-mode-type) | \`vertical\` |
| \`selectable\` | 항목 선택 상태를 사용해요. | \`boolean\` | \`true\` |
| \`selectedKeys\` | 선택된 항목을 제어해요. | \`string[]\` | - |
| \`defaultSelectedKeys\` | 처음 선택할 항목을 정해요. | \`string[]\` | \`[]\` |
| \`openKeys\` | 펼친 하위 메뉴를 제어해요. | \`string[]\` | - |
| \`defaultOpenKeys\` | 처음 펼칠 하위 메뉴를 정해요. | \`string[]\` | \`[]\` |
| \`multiple\` | 여러 항목을 동시에 선택해요. | \`boolean\` | \`false\` |
| \`inlineCollapsed\` | 인라인 메뉴를 아이콘 너비로 접어요. | \`boolean\` | \`false\` |
| \`inlineIndent\` | 인라인 하위 메뉴의 들여쓰기를 정해요. | \`number\` | \`24\` |
| \`forceSubMenuRender\` | 닫힌 팝업 하위 메뉴도 미리 렌더링해요. | \`boolean\` | \`false\` |
| \`triggerSubMenuAction\` | 팝업 하위 메뉴를 여는 동작을 정해요. | [\`MenuTriggerType\`](#menu-trigger-type) | \`hover\` |
| \`subMenuOpenDelay\` | hover 후 하위 메뉴를 여는 시간을 정해요. | \`number\` | \`0\` |
| \`subMenuCloseDelay\` | hover 종료 후 닫는 시간을 정해요. | \`number\` | \`0.1\` |
| \`expandIcon\` | 하위 메뉴의 펼침 아이콘을 변경해요. | \`ReactNode \\| function\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 항목을 누를 때 실행해요. | \`(info: MenuClickInfo) => void\` | - |
| \`onSelect\` | 항목을 선택할 때 실행해요. | \`(info: MenuSelectInfo) => void\` | - |
| \`onDeselect\` | 다중 선택 항목을 해제할 때 실행해요. | \`(info: MenuSelectInfo) => void\` | - |
| \`onOpenChange\` | 펼친 하위 메뉴가 바뀔 때 실행해요. | \`(openKeys: string[]) => void\` | - |

### MenuItemType

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 항목을 구분하는 고유한 값이에요. | \`Key\` | - |
| \`label\` | 항목에 표시할 내용이에요. | \`ReactNode\` | - |
| \`icon\` | 레이블 앞에 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`extra\` | 레이블 반대쪽에 보조 정보를 표시해요. | \`ReactNode\` | - |
| \`children\` | 하위 메뉴 항목이에요. | \`MenuItemType[]\` | - |
| \`disabled\` | 항목 선택을 막아요. | \`boolean\` | \`false\` |
| \`danger\` | 위험 작업 색상을 적용해요. | \`boolean\` | \`false\` |
| \`type\` | 일반 항목, 그룹 또는 구분선을 정해요. | [\`MenuItemKindType\`](#menu-item-kind-type) | \`item\` |
| \`dashed\` | 구분선을 점선으로 표시해요. | \`boolean\` | \`false\` |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="menu-mode-type">MenuModeType</h3>
          <p>메뉴 배치 방식을 선택해요.</p>
          <TypeTokens values={menuModes} />
          <h3 id="menu-trigger-type">MenuTriggerType</h3>
          <p>팝업 하위 메뉴를 여는 동작을 선택해요.</p>
          <TypeTokens values={menuTriggers} />
          <h3 id="menu-item-kind-type">MenuItemKindType</h3>
          <p>메뉴 항목의 종류를 선택해요.</p>
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
    inlineIndent: 24,
    triggerSubMenuAction: "hover",
  },
  argTypes: { mode: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-menu--basic"),
    controls: {
      include: ["선택 가능", "다중 선택", "인라인 접기", "들여쓰기", "하위 메뉴 동작"],
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

export const Horizontal: Story = {
  parameters: {
    ...storyDescription("components-menu--horizontal"),
    controls: { include: ["선택 가능", "다중 선택", "하위 메뉴 동작"] },
    docs: {
      ...storyDescription("components-menu--horizontal").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Menu mode="horizontal" items={items} />`),
      },
    },
  },
  args: {
    items,
    mode: "horizontal",
    selectable: true,
    multiple: false,
    triggerSubMenuAction: "hover",
  },
};

export const Collapsed: Story = {
  args: {
    selectable: true,
    inlineIndent: 24,
  },
  parameters: {
    ...storyDescription("components-menu--collapsed"),
    controls: { include: ["선택 가능", "들여쓰기"] },
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
    { type: 'divider', key: 'divider', dashed: true },
    {
      key: 'delete',
      label: '워크스페이스 삭제',
      icon: <Icon icon="delete-outlined" />,
      danger: true,
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
        { type: "divider", key: "divider", dashed: true },
        {
          key: "delete",
          label: "워크스페이스 삭제",
          icon: <Icon icon="delete-outlined" />,
          danger: true,
        },
      ]}
    />
  ),
};
