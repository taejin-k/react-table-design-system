import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Dropdown } from "./Dropdown";
import type { DropdownItem, DropdownPlacement, DropdownTrigger } from "./Dropdown.types";

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
const triggers: DropdownTrigger[] = ["hover", "focus", "click"];
const basicItems: DropdownItem[] = [
  { value: "edit", label: "수정" },
  { value: "copy", label: "복사" },
  { value: "share", label: "공유" },
];
const richItems: DropdownItem[] = [
  {
    value: "document",
    label: "문서 작업",
    type: "group",
    children: [
      { value: "edit", label: "수정", icon: <Icon icon="edit" /> },
      { value: "copy", label: "복사", icon: <Icon icon="copy" />, extra: "⌘C" },
    ],
  },
  { value: "disabled", label: "이동", disabled: true },
  { value: "divider", type: "divider" },
  {
    value: "share",
    label: "공유",
    children: [
      { value: "link", label: "링크 복사" },
      { value: "mail", label: "메일로 보내기" },
    ],
  },
  { value: "delete", label: "삭제", danger: true, icon: <Icon icon="delete" /> },
];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  args: {
    children: <Button variant="secondary">메뉴 열기</Button>,
    menu: { items: basicItems },
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
| \`trigger\` | hover, focus, click, contextMenu로 표시해요. | \`DropdownTrigger \\| DropdownTrigger[]\` | \`hover\` |
| \`arrow\` | 대상을 가리키는 화살표를 표시해요. | \`boolean\` | \`false\` |
| \`disabled\` | 메뉴를 열 수 없게 설정해요. | \`boolean\` | \`false\` |
| \`open\` | 메뉴의 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 렌더링할 때 메뉴를 표시해요. | \`boolean\` | \`false\` |
| \`autoAdjustOverflow\` | 화면을 벗어나면 반대 위치로 보정해요. | \`boolean\` | \`true\` |
| \`className\` | 대상에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onOpenChange\` | 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |

### DropdownMenu

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 메뉴에 표시할 항목을 전달해요. | \`DropdownItem[]\` | - |
| \`selectable\` | 메뉴 항목을 선택 가능한 상태로 만들어요. | \`boolean\` | \`false\` |
| \`multiple\` | 여러 메뉴 항목을 함께 선택해요. | \`boolean\` | \`false\` |
| \`selectedValues\` | 선택된 항목 value를 외부에서 관리해요. | \`string[]\` | - |
| \`defaultSelectedValues\` | 처음 선택할 항목 value를 설정해요. | \`string[]\` | \`[]\` |
| \`onClick\` | 메뉴 항목을 클릭할 때 실행할 함수예요. | \`(info) => void\` | - |
| \`onSelect\` | 선택 상태가 바뀔 때 실행할 함수예요. | \`(info) => void\` | - |

### DropdownItem

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 항목을 구분하는 고유한 값이에요. | \`string\` | - |
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
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--basic").docs,
      source: {
        code: withStoryImports(`const items = [
  { value: 'edit', label: '수정' },
  { value: 'copy', label: '복사' },
  { value: 'share', label: '공유' },
];

function BasicDropdown() {
  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown menu={{ items }}>
        <Button variant="secondary">메뉴 열기</Button>
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
        <Button variant="secondary">메뉴 열기</Button>
      </Dropdown>
    </div>
  ),
};

export const Triggers: Story = {
  parameters: {
    ...storyDescription("components-dropdown--triggers"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--triggers").docs,
      source: {
        code: withStoryImports(`const items = [
  { value: 'edit', label: '수정' },
  { value: 'copy', label: '복사' },
  { value: 'share', label: '공유' },
];

function DropdownTriggers() {
  return (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Dropdown menu={{ items }}>
        <Button variant="secondary">hover</Button>
      </Dropdown>
      <Dropdown menu={{ items }} trigger="focus">
        <Button variant="secondary">focus</Button>
      </Dropdown>
      <Dropdown menu={{ items }} trigger="click">
        <Button variant="secondary">click</Button>
      </Dropdown>
      <Dropdown menu={{ items }} trigger="contextMenu">
        <Button variant="secondary">contextMenu (우클릭)</Button>
      </Dropdown>
      <Dropdown menu={{ items }} trigger={['hover', 'focus']}>
        <Button variant="secondary">hover + focus</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      {triggers.map((trigger) => (
        <Dropdown key={trigger} menu={{ items: basicItems }} trigger={trigger}>
          <Button variant="secondary">{trigger}</Button>
        </Dropdown>
      ))}
      <Dropdown menu={{ items: basicItems }} trigger="contextMenu">
        <Button variant="secondary">contextMenu (우클릭)</Button>
      </Dropdown>
      <Dropdown menu={{ items: basicItems }} trigger={["hover", "focus"]}>
        <Button variant="secondary">hover + focus</Button>
      </Dropdown>
    </div>
  ),
};

export const Placements: Story = {
  parameters: {
    ...storyDescription("components-dropdown--placements"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--placements").docs,
      source: {
        code: withStoryImports(`const items = [
  { value: 'edit', label: '수정' },
  { value: 'copy', label: '복사' },
  { value: 'share', label: '공유' },
];

function DropdownPlacements() {
  return (
    <div className="grid min-h-[360px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      <Dropdown menu={{ items }} placement="topLeft" trigger="click">
        <Button className="w-28" variant="secondary">topLeft</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="top" trigger="click">
        <Button className="w-28" variant="secondary">top</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="topRight" trigger="click">
        <Button className="w-28" variant="secondary">topRight</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="leftTop" trigger="click">
        <Button className="w-28" variant="secondary">leftTop</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="rightTop" trigger="click">
        <Button className="w-28" variant="secondary">rightTop</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="left" trigger="click">
        <Button className="w-28" variant="secondary">left</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="right" trigger="click">
        <Button className="w-28" variant="secondary">right</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="leftBottom" trigger="click">
        <Button className="w-28" variant="secondary">leftBottom</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="rightBottom" trigger="click">
        <Button className="w-28" variant="secondary">rightBottom</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="bottomLeft" trigger="click">
        <Button className="w-28" variant="secondary">bottomLeft</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="bottom" trigger="click">
        <Button className="w-28" variant="secondary">bottom</Button>
      </Dropdown>
      <Dropdown menu={{ items }} placement="bottomRight" trigger="click">
        <Button className="w-28" variant="secondary">bottomRight</Button>
      </Dropdown>
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
          <Button className="w-28" variant="secondary">
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
      ...storyDescription("components-dropdown--menu-items").docs,
      source: {
        code: withStoryImports(`const items = [
  {
    value: 'document',
    label: '문서 작업',
    type: 'group' as const,
    children: [
      { value: 'edit', label: '수정', icon: <Icon icon="edit" /> },
      { value: 'copy', label: '복사', icon: <Icon icon="copy" />, extra: '⌘C' },
    ],
  },
  { value: 'disabled', label: '이동', disabled: true },
  { value: 'divider', type: 'divider' as const },
  {
    value: 'share',
    label: '공유',
    children: [
      { value: 'link', label: '링크 복사' },
      { value: 'mail', label: '메일로 보내기' },
    ],
  },
  { value: 'delete', label: '삭제', danger: true, icon: <Icon icon="delete" /> },
];

function DropdownMenuItems() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Dropdown menu={{ items }} trigger="click">
        <Button variant="secondary">다양한 메뉴</Button>
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
        <Button variant="secondary">다양한 메뉴</Button>
      </Dropdown>
    </div>
  ),
};

export const Selectable: Story = {
  parameters: {
    ...storyDescription("components-dropdown--selectable"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--selectable").docs,
      source: {
        code: withStoryImports(`const items = [
  { value: 'design', label: 'Design' },
  { value: 'platform', label: 'Platform' },
  { value: 'growth', label: 'Growth' },
];

function SelectableDropdown() {
  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        menu={{
          items,
          selectable: true,
          defaultSelectedValues: ['design'],
        }}
        trigger="click"
      >
        <Button variant="secondary">팀 선택</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => <SelectableDropdown />,
};

export const ItemClick: Story = {
  parameters: {
    ...storyDescription("components-dropdown--item-click"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--item-click").docs,
      source: {
        code: withStoryImports(`function ItemClickDropdown() {
  const [action, setAction] = useState('작업 선택');
  const items = [
    { value: 'edit', label: '수정', onClick: () => setAction('수정 선택됨') },
    { value: 'copy', label: '복사', onClick: () => setAction('복사 선택됨') },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown menu={{ items }} trigger="click">
        <Button variant="secondary">{action}</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => <ItemClickDropdown />,
};

export const Arrow: Story = {
  parameters: {
    ...storyDescription("components-dropdown--arrow"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--arrow").docs,
      source: {
        code: withStoryImports(`const items = [
  { value: 'edit', label: '수정' },
  { value: 'copy', label: '복사' },
  { value: 'share', label: '공유' },
];

function ArrowDropdown() {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3">
      <Dropdown menu={{ items }} trigger="click">
        <Button variant="secondary">기본</Button>
      </Dropdown>
      <Dropdown arrow menu={{ items }} trigger="click">
        <Button variant="secondary">화살표</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex min-h-32 items-center justify-center gap-3">
      <Dropdown menu={{ items: basicItems }} trigger="click">
        <Button variant="secondary">기본</Button>
      </Dropdown>
      <Dropdown arrow menu={{ items: basicItems }} trigger="click">
        <Button variant="secondary">화살표</Button>
      </Dropdown>
    </div>
  ),
};

export const MultipleSelectable: Story = {
  parameters: {
    ...storyDescription("components-dropdown--multiple-selectable"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--multiple-selectable").docs,
      source: {
        code: withStoryImports(`function MultipleSelectableDropdown() {
  const [selectedValues, setSelectedValues] = useState(['design', 'platform']);
  const items = [
    { value: 'design', label: 'Design' },
    { value: 'platform', label: 'Platform' },
    { value: 'growth', label: 'Growth' },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        menu={{
          items,
          selectable: true,
          multiple: true,
          selectedValues,
          onSelect: ({ selectedValues }) => setSelectedValues(selectedValues),
        }}
        trigger="click"
      >
        <Button variant="secondary">팀 선택 ({selectedValues.length})</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => <MultipleSelectableDropdown />,
};

export const Disabled: Story = {
  parameters: {
    ...storyDescription("components-dropdown--disabled"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--disabled").docs,
      source: {
        code: withStoryImports(`const items = [
  { value: 'edit', label: '수정' },
  { value: 'copy', label: '복사' },
  { value: 'share', label: '공유' },
];

function DisabledDropdown() {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3">
      <Dropdown menu={{ items }} trigger="click">
        <Button variant="secondary">사용 가능</Button>
      </Dropdown>
      <Dropdown disabled menu={{ items }} trigger="click">
        <Button variant="secondary">비활성</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex min-h-32 items-center justify-center gap-3">
      <Dropdown menu={{ items: basicItems }} trigger="click">
        <Button variant="secondary">사용 가능</Button>
      </Dropdown>
      <Dropdown disabled menu={{ items: basicItems }} trigger="click">
        <Button variant="secondary">비활성</Button>
      </Dropdown>
    </div>
  ),
};

export const Controlled: Story = {
  parameters: {
    ...storyDescription("components-dropdown--controlled"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-dropdown--controlled").docs,
      source: {
        code: withStoryImports(`function ControlledDropdown() {
  const [open, setOpen] = useState(false);
  const items = [
    { value: 'edit', label: '수정' },
    { value: 'copy', label: '복사' },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        menu={{ items }}
        open={open}
        trigger="click"
        onOpenChange={setOpen}
      >
        <Button variant="secondary">{open ? '닫기' : '열기'}</Button>
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
  const items = [
    { value: "design", label: "Design" },
    { value: "platform", label: "Platform" },
    { value: "growth", label: "Growth" },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        menu={{
          items,
          selectable: true,
          defaultSelectedValues: ["design"],
        }}
        trigger="click"
      >
        <Button variant="secondary">팀 선택</Button>
      </Dropdown>
    </div>
  );
}

function ItemClickDropdown() {
  const [action, setAction] = useState("작업 선택");
  const items = [
    { value: "edit", label: "수정", onClick: () => setAction("수정 선택됨") },
    { value: "copy", label: "복사", onClick: () => setAction("복사 선택됨") },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown menu={{ items }} trigger="click">
        <Button variant="secondary">{action}</Button>
      </Dropdown>
    </div>
  );
}

function MultipleSelectableDropdown() {
  const [selectedValues, setSelectedValues] = useState(["design", "platform"]);
  const items = [
    { value: "design", label: "Design" },
    { value: "platform", label: "Platform" },
    { value: "growth", label: "Growth" },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        menu={{
          items,
          selectable: true,
          multiple: true,
          selectedValues,
          onSelect: ({ selectedValues }) => setSelectedValues(selectedValues),
        }}
        trigger="click"
      >
        <Button variant="secondary">팀 선택 ({selectedValues.length})</Button>
      </Dropdown>
    </div>
  );
}

function ControlledDropdown() {
  const [open, setOpen] = useState(false);
  const items = [
    { value: "edit", label: "수정" },
    { value: "copy", label: "복사" },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown menu={{ items }} open={open} trigger="click" onOpenChange={setOpen}>
        <Button variant="secondary">{open ? "닫기" : "열기"}</Button>
      </Dropdown>
    </div>
  );
}
