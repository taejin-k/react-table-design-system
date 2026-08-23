import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Icon } from "../Icon";
import { Menu } from "./Menu";
import type { MenuItemKindType, MenuModeType, MenuThemeType, MenuTriggerType } from "./Menu.types";

const menuModes: MenuModeType[] = ["vertical", "horizontal", "inline"];
const menuThemes: MenuThemeType[] = ["light", "dark"];
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
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "페이지 이동과 작업을 계층적으로 구성해요.  \n세 가지 배치 모드, 단일·다중 선택, 제어·비제어 펼침 상태와 밝은·어두운 테마를 지원해요.",
      },
      page: () => (
        <div className="menu-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 메뉴 항목, 그룹, 구분선과 하위 메뉴를 구성해요. | \`MenuItemType[]\` | \`[]\` |
| \`mode\` | 메뉴의 배치 방식을 정해요. | [\`MenuModeType\`](#menu-mode-type) | \`vertical\` |
| \`theme\` | 밝거나 어두운 색상 테마를 적용해요. | [\`MenuThemeType\`](#menu-theme-type) | \`light\` |
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
| \`classNames\` | 내부 영역별 className을 설정해요. | \`{ root?, item?, submenu?, popup? }\` | - |
| \`styles\` | 내부 영역별 인라인 스타일을 설정해요. | \`{ root?, item?, submenu?, popup? }\` | - |
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
| \`children\` | 하위 메뉴 항목이에요. | \`MenuItemType[]\` | - |
| \`disabled\` | 항목 선택을 막아요. | \`boolean\` | \`false\` |
| \`danger\` | 위험 작업 색상을 적용해요. | \`boolean\` | \`false\` |
| \`type\` | 일반 항목, 그룹 또는 구분선을 정해요. | [\`MenuItemKindType\`](#menu-item-kind-type) | \`item\` |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="menu-mode-type">MenuModeType</h3>
          <p>메뉴 배치 방식을 선택해요.</p>
          <TypeTokens values={menuModes} />
          <h3 id="menu-theme-type">MenuThemeType</h3>
          <p>메뉴 테마를 선택해요.</p>
          <TypeTokens values={menuThemes} />
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
  parameters: {
    ...storyDescription("components-menu--basic"),
    docs: {
      ...storyDescription("components-menu--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Menu
  mode="inline"
  defaultSelectedKeys={['home']}
  defaultOpenKeys={['workspace']}
  items={[
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
  ]}
/>`),
      },
    },
  },
  args: {
    items,
    mode: "inline",
    defaultSelectedKeys: ["home"],
    defaultOpenKeys: ["workspace"],
  },
};

export const Horizontal: Story = {
  parameters: {
    ...storyDescription("components-menu--horizontal"),
    docs: {
      ...storyDescription("components-menu--horizontal").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Menu mode="horizontal" items={items} />`),
      },
    },
  },
  args: { items, mode: "horizontal" },
};

export const Dark: Story = {
  parameters: {
    ...storyDescription("components-menu--dark"),
    docs: {
      ...storyDescription("components-menu--dark").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<Menu theme="dark" mode="inline" defaultOpenKeys={['workspace']} items={items} />`),
      },
    },
  },
  args: { items, theme: "dark", mode: "inline", defaultOpenKeys: ["workspace"] },
};
