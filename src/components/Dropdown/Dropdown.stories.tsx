import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { fn } from "storybook/test";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Dropdown } from "./Dropdown";
import type { DropdownItem, DropdownPlacement } from "./Dropdown.types";

const placements: DropdownPlacement[] = [
  "topLeft",
  "top",
  "topRight",
  "leftTop",
  "rightTop",
  "left",
  "right",
  "leftBottom",
  "rightBottom",
  "bottomLeft",
  "bottom",
  "bottomRight",
];
const handleMenuClick = fn();
const basicItems: DropdownItem[] = [
  { key: "edit", label: "수정" },
  { key: "copy", label: "복사" },
  { key: "share", label: "공유" },
];
const richItems: DropdownItem[] = [
  { key: "edit", label: "수정", icon: <Icon icon="edit" /> },
  { key: "copy", label: "복사", icon: <Icon icon="copy" />, extra: "⌘C" },
  { key: "disabled", label: "이동", disabled: true },
  { key: "divider", type: "divider" },
  {
    key: "share",
    label: "공유",
    children: [
      { key: "link", label: "링크 복사" },
      { key: "mail", label: "메일로 보내기" },
    ],
  },
  { key: "delete", label: "삭제", danger: true, icon: <Icon icon="delete" /> },
];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  args: {
    children: <Button type="secondary">메뉴 열기</Button>,
    menu: { items: basicItems, onClick: handleMenuClick },
    placement: "bottomLeft",
    trigger: "hover",
    arrow: false,
    disabled: false,
    autoAdjustOverflow: true,
  },
  argTypes: {
    menu: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    placement: { control: false, table: { disable: true } },
    trigger: { control: false, table: { disable: true } },
    open: { control: false, table: { disable: true } },
    defaultOpen: { control: false, table: { disable: true } },
    mouseEnterDelay: { control: false, table: { disable: true } },
    mouseLeaveDelay: { control: false, table: { disable: true } },
    zIndex: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onOpenChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "여러 작업을 하나의 메뉴로 정리해요.  \n메뉴 항목·위치·표시 동작·선택 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="dropdown-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Dropdown

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`children\` | Dropdown을 연결할 하나의 요소예요. | \`ReactElement\` | - |
| \`menu\` | 메뉴 항목과 선택 동작을 설정해요. | \`DropdownMenu\` | - |
| \`placement\` | 메뉴가 표시될 위치를 설정해요. | \`DropdownPlacement\` | \`bottomLeft\` |
| \`trigger\` | hover, focus, click 중 표시 동작을 설정해요. | \`DropdownTrigger \\| DropdownTrigger[]\` | \`hover\` |
| \`arrow\` | 대상을 가리키는 화살표를 표시해요. | \`boolean\` | \`false\` |
| \`disabled\` | 메뉴를 열 수 없게 설정해요. | \`boolean\` | \`false\` |
| \`open\` | 메뉴의 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 렌더링할 때 메뉴를 표시해요. | \`boolean\` | \`false\` |
| \`autoAdjustOverflow\` | 화면을 벗어나면 반대 위치로 보정해요. | \`boolean\` | \`true\` |
| \`className\` | 대상에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onOpenChange\` | 표시 상태가 바뀔 때 실행할 함수예요. | \`(open, info) => void\` | - |

### DropdownMenu

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 메뉴에 표시할 항목을 전달해요. | \`DropdownItem[]\` | - |
| \`selectable\` | 메뉴 항목을 선택 가능한 상태로 만들어요. | \`boolean\` | \`false\` |
| \`multiple\` | 여러 메뉴 항목을 함께 선택해요. | \`boolean\` | \`false\` |
| \`selectedKeys\` | 선택된 항목 key를 외부에서 관리해요. | \`string[]\` | - |
| \`defaultSelectedKeys\` | 처음 선택할 항목 key를 설정해요. | \`string[]\` | \`[]\` |
| \`onClick\` | 메뉴 항목을 클릭할 때 실행할 함수예요. | \`(info) => void\` | - |
| \`onSelect\` | 선택 상태가 바뀔 때 실행할 함수예요. | \`(info) => void\` | - |

### DropdownItem

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 항목을 구분하는 고유한 값이에요. | \`string\` | - |
| \`label\` | 메뉴에 표시할 내용이에요. | \`ReactNode\` | - |
| \`icon\` | 메뉴 이름 앞에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`extra\` | 메뉴 이름 뒤에 보조 내용을 표시해요. | \`ReactNode\` | - |
| \`disabled\` | 메뉴 항목을 선택할 수 없게 해요. | \`boolean\` | \`false\` |
| \`danger\` | 위험 작업의 색상을 적용해요. | \`boolean\` | \`false\` |
| \`type\` | 일반 항목, 구분선, 그룹을 설정해요. | \`item \\| divider \\| group\` | \`item\` |
| \`children\` | 오른쪽에 열리는 하위 메뉴를 설정해요. | \`DropdownItem[]\` | - |
| \`onClick\` | 해당 항목을 클릭할 때 실행할 함수예요. | \`(info) => void\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-dropdown--basic"),
    controls: { disable: false },
    docs: {
      source: {
        code: withStoryImports(`const items = [
  { key: 'edit', label: '수정' },
  { key: 'copy', label: '복사' },
  { key: 'share', label: '공유' },
];

function BasicDropdown() {
  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown menu={{ items }}>
        <Button type="secondary">메뉴 열기</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown {...args}>
        <Button type="secondary">메뉴 열기</Button>
      </Dropdown>
    </div>
  ),
};

export const Placements: Story = {
  parameters: {
    ...storyDescription("components-dropdown--placements"),
    controls: { disable: true },
    docs: {
      source: {
        code: withStoryImports(`const placements = [
  'topLeft',
  'top',
  'topRight',
  'leftTop',
  'rightTop',
  'left',
  'right',
  'leftBottom',
  'rightBottom',
  'bottomLeft',
  'bottom',
  'bottomRight',
] as const;
const items = [
  { key: 'edit', label: '수정' },
  { key: 'copy', label: '복사' },
  { key: 'share', label: '공유' },
];

function DropdownPlacements() {
  return (
    <div className="grid min-h-[360px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      {placements.map((placement) => (
        <Dropdown key={placement} menu={{ items }} placement={placement} trigger="click">
          <Button className="w-28" type="secondary">
            {placement}
          </Button>
        </Dropdown>
      ))}
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid min-h-[360px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      {placements.map((placement) => (
        <Dropdown
          key={placement}
          menu={{ items: basicItems }}
          placement={placement}
          trigger="click"
        >
          <Button className="w-28" type="secondary">
            {placement}
          </Button>
        </Dropdown>
      ))}
    </div>
  ),
};

export const MenuItems: Story = {
  parameters: {
    ...storyDescription("components-dropdown--menu-items"),
    controls: { disable: true },
    docs: {
      source: {
        code: withStoryImports(`const items = [
  { key: 'edit', label: '수정', icon: <Icon icon="edit" /> },
  { key: 'copy', label: '복사', icon: <Icon icon="copy" />, extra: '⌘C' },
  { key: 'disabled', label: '이동', disabled: true },
  { key: 'divider', type: 'divider' as const },
  {
    key: 'share',
    label: '공유',
    children: [
      { key: 'link', label: '링크 복사' },
      { key: 'mail', label: '메일로 보내기' },
    ],
  },
  { key: 'delete', label: '삭제', danger: true, icon: <Icon icon="delete" /> },
];

function DropdownMenuItems() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Dropdown menu={{ items }} trigger="click">
        <Button type="secondary">다양한 메뉴</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex min-h-40 items-center justify-center">
      <Dropdown menu={{ items: richItems }} trigger="click">
        <Button type="secondary">다양한 메뉴</Button>
      </Dropdown>
    </div>
  ),
};

export const Selectable: Story = {
  parameters: {
    ...storyDescription("components-dropdown--selectable"),
    controls: { disable: true },
    docs: {
      source: {
        code: withStoryImports(`function SelectableDropdown() {
  const [selectedKeys, setSelectedKeys] = useState(['design']);
  const items = [
    { key: 'design', label: 'Design' },
    { key: 'platform', label: 'Platform' },
    { key: 'growth', label: 'Growth' },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        menu={{
          items,
          selectable: true,
          selectedKeys,
          onSelect: ({ selectedKeys }) => setSelectedKeys(selectedKeys),
        }}
        trigger="click"
      >
        <Button type="secondary">팀 선택</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => <SelectableDropdown />,
};

export const Controlled: Story = {
  parameters: {
    ...storyDescription("components-dropdown--controlled"),
    controls: { disable: true },
    docs: {
      source: {
        code: withStoryImports(`function ControlledDropdown() {
  const [open, setOpen] = useState(false);
  const items = [
    { key: 'edit', label: '수정' },
    { key: 'copy', label: '복사' },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        menu={{ items }}
        open={open}
        trigger="click"
        onOpenChange={setOpen}
      >
        <Button type="secondary">{open ? '닫기' : '열기'}</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => <ControlledDropdown />,
};

function SelectableDropdown() {
  const [selectedKeys, setSelectedKeys] = useState(["design"]);
  const items = [
    { key: "design", label: "Design" },
    { key: "platform", label: "Platform" },
    { key: "growth", label: "Growth" },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        menu={{
          items,
          selectable: true,
          selectedKeys,
          onSelect: ({ selectedKeys: nextSelectedKeys }) => setSelectedKeys(nextSelectedKeys),
        }}
        trigger="click"
      >
        <Button type="secondary">팀 선택</Button>
      </Dropdown>
    </div>
  );
}

function ControlledDropdown() {
  const [open, setOpen] = useState(false);
  const items = [
    { key: "edit", label: "수정" },
    { key: "copy", label: "복사" },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown menu={{ items }} open={open} trigger="click" onOpenChange={setOpen}>
        <Button type="secondary">{open ? "닫기" : "열기"}</Button>
      </Dropdown>
    </div>
  );
}
