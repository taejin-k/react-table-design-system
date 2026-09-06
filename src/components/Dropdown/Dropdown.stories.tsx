import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentType, type Key } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Dropdown } from "./Dropdown";
import type {
  DropdownItem,
  DropdownItemType,
  DropdownPlacementType,
  DropdownProps,
  DropdownTriggerType,
} from "./Dropdown.types";

const placements: DropdownPlacementType[] = [
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
const triggers: DropdownTriggerType[] = ["hover", "focus", "click", "contextMenu"];
const itemTypes: DropdownItemType[] = ["item", "divider", "group"];
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
      { value: "copy", label: "복사", icon: <Icon icon="copy-outlined" />, extra: "⌘C" },
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
  { value: "delete", label: "삭제", icon: <Icon icon="delete-outlined" /> },
];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Dropdown",
  component: Dropdown as ComponentType<Partial<DropdownProps>>,
  tags: ["autodocs"],
  argTypes: {
    menu: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    placement: { name: "위치", control: "select", options: placements },
    trigger: { name: "표시 동작", control: "select", options: triggers },
    arrow: { name: "화살표", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    open: { control: false, table: { disable: true } },
    defaultOpen: { control: false, table: { disable: true } },
    zIndex: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onOpenChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "Dropdown은 버튼이나 아이콘에 여러 작업을 메뉴로 묶어 표시해요.  \n메뉴 항목·위치·열리는 동작과 선택 상태를 지정할 수 있어요.",
      },
      page: () => (
        <div className="dropdown-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Dropdown

Dropdown은 버튼이나 아이콘을 조작했을 때 메뉴를 표시해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`children\` | Dropdown을 연결할 하나의 요소예요. | \`ReactElement\` | - |
| \`menu\` | 메뉴 항목과 선택 동작을 설정해요. | [\`DropdownMenu\`](#dropdownmenu) | - |
| \`placement\` | 메뉴가 표시될 위치를 설정해요. | [\`DropdownPlacementType\`](#dropdown-placement-type) | \`bottomLeft\` |
| \`trigger\` | 표시 동작을 설정해요. | [\`DropdownTriggerType\`](#dropdown-trigger-type) \\| [\`DropdownTriggerType[]\`](#dropdown-trigger-type) | \`hover\` |
| \`arrow\` | 대상을 가리키는 화살표를 표시해요. | \`boolean\` | \`false\` |
| \`disabled\` | 메뉴를 열 수 없게 설정해요. | \`boolean\` | \`false\` |
| \`open\` | 메뉴의 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 렌더링할 때 메뉴를 표시해요. | \`boolean\` | \`false\` |
| \`zIndex\` | Dropdown이 겹쳐지는 순서를 설정해요. | \`number\` | \`1050\` |
| \`className\` | 대상에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onOpenChange\` | 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |

### DropdownMenu

DropdownMenu는 Dropdown 안에 표시할 메뉴 구조와 선택 상태를 정의해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 메뉴에 표시할 항목을 전달해요. | [\`DropdownItem[]\`](#dropdownitem) | - |
| \`selectable\` | 메뉴 항목을 선택 가능한 상태로 만들어요. | \`boolean\` | \`false\` |
| \`multiple\` | 여러 메뉴 항목을 함께 선택해요. | \`boolean\` | \`false\` |
| \`selectedValues\` | 선택된 항목 value를 외부에서 관리해요. | \`Key[]\` | - |
| \`defaultSelectedValues\` | 처음 선택할 항목 value를 설정해요. | \`Key[]\` | \`[]\` |
| \`onClick\` | 메뉴 항목을 클릭할 때 실행할 함수예요. | (info: [\`DropdownClickInfo\`](#dropdownclickinfo)) => void | - |
| \`onSelect\` | 선택 상태가 바뀔 때 실행할 함수예요. | (info: [\`DropdownSelectInfo\`](#dropdownselectinfo)) => void | - |

### DropdownItem

DropdownItem은 하나의 메뉴 항목과 하위 항목을 정의해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 항목을 구분하는 고유한 값이에요. | \`Key\` | - |
| \`label\` | 메뉴에 표시할 내용이에요. | \`ReactNode\` | - |
| \`icon\` | 메뉴 이름 앞에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`extra\` | 메뉴 이름 뒤에 보조 내용을 표시해요. | \`ReactNode\` | - |
| \`disabled\` | 메뉴 항목을 선택할 수 없게 해요. | \`boolean\` | \`false\` |
| \`type\` | 일반 항목, 구분선, 그룹을 설정해요. | [\`DropdownItemType\`](#dropdown-item-type) | \`item\` |
| \`children\` | 오른쪽에 열리는 하위 메뉴를 설정해요. | [\`DropdownItem[]\`](#dropdownitem) | - |
| \`onClick\` | 이 메뉴 항목을 클릭할 때 실행할 함수예요. | (info: [\`DropdownClickInfo\`](#dropdownclickinfo)) => void | - |

### DropdownClickInfo

DropdownClickInfo는 메뉴 항목을 클릭했을 때 받는 정보예요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 클릭한 항목의 값이에요. | \`Key\` | - |
| \`event\` | 클릭할 때 발생한 이벤트예요. | \`MouseEvent<HTMLElement>\` | - |

### DropdownSelectInfo

DropdownSelectInfo는 메뉴 선택 상태가 바뀔 때 받는 정보예요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 방금 선택하거나 해제한 항목의 값이에요. | \`Key\` | - |
| \`selectedValues\` | 현재 선택된 항목 값들이에요. | \`Key[]\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="dropdown-placement-type">DropdownPlacementType</h3>
          <p>
            DropdownPlacementType은 연결된 버튼이나 아이콘을 기준으로 메뉴가 열릴 위치를 구분해요.
          </p>
          <div className="flex flex-wrap gap-2">
            {placements.map((placement) => (
              <DropdownTypeCode key={placement} value={placement} />
            ))}
          </div>
          <h3 id="dropdown-trigger-type">DropdownTriggerType</h3>
          <p>DropdownTriggerType은 Dropdown 메뉴를 열고 닫는 사용자 동작을 구분해요.</p>
          <div className="flex flex-wrap gap-2">
            {triggers.map((trigger) => (
              <DropdownTypeCode key={trigger} value={trigger} />
            ))}
          </div>
          <h3 id="dropdown-item-type">DropdownItemType</h3>
          <p>DropdownItemType은 일반 항목·그룹·구분선의 구조를 구분해요.</p>
          <div className="flex flex-wrap gap-2">
            {itemTypes.map((itemType) => (
              <DropdownTypeCode key={itemType} value={itemType} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<Partial<DropdownProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

function DropdownTypeCode({
  value,
}: {
  value: DropdownPlacementType | DropdownTriggerType | DropdownItemType;
}) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {value}
    </code>
  );
}

export const Basic: Story = {
  args: {
    menu: { items: basicItems },
    placement: "bottomLeft",
    trigger: "hover",
    arrow: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-dropdown--basic"),
    controls: {
      disable: false,
      include: ["위치", "표시 동작", "화살표", "비활성"],
    },
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
        <Button>메뉴 열기</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown {...args} menu={args.menu ?? { items: basicItems }}>
        <Button>메뉴 열기</Button>
      </Dropdown>
    </div>
  ),
};

export const Triggers: Story = {
  args: { placement: "bottomLeft", arrow: false, disabled: false },
  parameters: {
    ...storyDescription("components-dropdown--triggers"),
    controls: {
      disable: false,
      include: ["위치", "화살표", "비활성"],
    },
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
        <Button>hover</Button>
      </Dropdown>
      <Dropdown menu={{ items }} trigger="focus">
        <Button>focus</Button>
      </Dropdown>
      <Dropdown menu={{ items }} trigger="click">
        <Button>click</Button>
      </Dropdown>
      <Dropdown menu={{ items }} trigger="contextMenu">
        <Button>contextMenu (우클릭)</Button>
      </Dropdown>
      <Dropdown menu={{ items }} trigger={['hover', 'focus']}>
        <Button>hover + focus</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      {triggers.map((trigger) => (
        <Dropdown {...args} key={trigger} menu={{ items: basicItems }} trigger={trigger}>
          <Button>{trigger === "contextMenu" ? "contextMenu (우클릭)" : trigger}</Button>
        </Dropdown>
      ))}
      <Dropdown {...args} menu={{ items: basicItems }} trigger={["hover", "focus"]}>
        <Button>hover + focus</Button>
      </Dropdown>
    </div>
  ),
};

export const Placements: Story = {
  args: { trigger: "click", arrow: false, disabled: false },
  parameters: {
    ...storyDescription("components-dropdown--placements"),
    controls: {
      disable: false,
      include: ["표시 동작", "화살표", "비활성"],
    },
    docs: {
      ...storyDescription("components-dropdown--placements").docs,
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

function DropdownPlacements() {
  return (
    <div className="grid min-h-[360px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      {placements.map((placement) => (
        <Dropdown
          key={placement}
          menu={{ items: [{ value: placement, label: placement }] }}
          placement={placement}
          trigger="click"
        >
          <Button>{placement}</Button>
        </Dropdown>
      ))}
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="grid min-h-[360px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      {placements.map((placement) => (
        <Dropdown
          {...args}
          key={placement}
          menu={{ items: [{ value: placement, label: placement }] }}
          placement={placement}
        >
          <Button>{placement}</Button>
        </Dropdown>
      ))}
    </div>
  ),
};

export const MenuItems: Story = {
  args: {
    placement: "bottomLeft",
    trigger: "click",
    arrow: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-dropdown--menu-items"),
    controls: {
      disable: false,
      include: ["위치", "표시 동작", "화살표", "비활성"],
    },
    docs: {
      ...storyDescription("components-dropdown--menu-items").docs,
      source: {
        code: withStoryImports(`const items: DropdownItem[] = [
  {
    value: 'document',
    label: '문서 작업',
    type: 'group',
    children: [
      { value: 'edit', label: '수정', icon: <Icon icon="edit" /> },
      { value: 'copy', label: '복사', icon: <Icon icon="copy-outlined" />, extra: '⌘C' },
    ],
  },
  { value: 'disabled', label: '이동', disabled: true },
  { value: 'divider', type: 'divider' },
  {
    value: 'share',
    label: '공유',
    children: [
      { value: 'link', label: '링크 복사' },
      { value: 'mail', label: '메일로 보내기' },
    ],
  },
  { value: 'delete', label: '삭제', icon: <Icon icon="delete-outlined" /> },
];

function DropdownMenuItems() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Dropdown menu={{ items }} trigger="click">
        <Button>다양한 메뉴</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-40 items-center justify-center">
      <Dropdown {...args} menu={{ items: richItems }}>
        <Button>다양한 메뉴</Button>
      </Dropdown>
    </div>
  ),
};

export const Selectable: Story = {
  args: { placement: "bottomLeft", arrow: false, disabled: false },
  parameters: {
    ...storyDescription("components-dropdown--selectable"),
    controls: { disable: false, include: ["위치", "화살표", "비활성"] },
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
        <Button>팀 선택</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <SelectableDropdown {...args} />,
};

export const ItemClick: Story = {
  args: { placement: "bottomLeft", arrow: false, disabled: false },
  parameters: {
    ...storyDescription("components-dropdown--item-click"),
    controls: { disable: false, include: ["위치", "화살표", "비활성"] },
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
        <Button>{action}</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <ItemClickDropdown {...args} />,
};

export const Arrow: Story = {
  args: { placement: "bottomLeft", trigger: "click", disabled: false },
  parameters: {
    ...storyDescription("components-dropdown--arrow"),
    controls: {
      disable: false,
      include: ["위치", "표시 동작", "비활성"],
    },
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
        <Button>기본</Button>
      </Dropdown>
      <Dropdown arrow menu={{ items }} trigger="click">
        <Button>화살표</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 items-center justify-center gap-3">
      <Dropdown {...args} menu={{ items: basicItems }}>
        <Button>기본</Button>
      </Dropdown>
      <Dropdown {...args} arrow menu={{ items: basicItems }}>
        <Button>화살표</Button>
      </Dropdown>
    </div>
  ),
};

export const MultipleSelectable: Story = {
  args: { placement: "bottomLeft", arrow: false, disabled: false },
  parameters: {
    ...storyDescription("components-dropdown--multiple-selectable"),
    controls: { disable: false, include: ["위치", "화살표", "비활성"] },
    docs: {
      ...storyDescription("components-dropdown--multiple-selectable").docs,
      source: {
        code: withStoryImports(`function MultipleSelectableDropdown() {
  const [selectedValues, setSelectedValues] = useState<Key[]>(['design', 'platform']);
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
        <Button>팀 선택 ({selectedValues.length})</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <MultipleSelectableDropdown {...args} />,
};

export const Disabled: Story = {
  args: { placement: "bottomLeft", trigger: "click", arrow: false },
  parameters: {
    ...storyDescription("components-dropdown--disabled"),
    controls: {
      disable: false,
      include: ["위치", "표시 동작", "화살표"],
    },
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
        <Button>사용 가능</Button>
      </Dropdown>
      <Dropdown disabled menu={{ items }} trigger="click">
        <Button>비활성</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 items-center justify-center gap-3">
      <Dropdown {...args} menu={{ items: basicItems }}>
        <Button>사용 가능</Button>
      </Dropdown>
      <Dropdown {...args} disabled menu={{ items: basicItems }}>
        <Button>비활성</Button>
      </Dropdown>
    </div>
  ),
};

export const Controlled: Story = {
  args: { placement: "bottomLeft", arrow: false, disabled: false },
  parameters: {
    ...storyDescription("components-dropdown--controlled"),
    controls: { disable: false, include: ["위치", "화살표", "비활성"] },
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
        <Button>{open ? '닫기' : '열기'}</Button>
      </Dropdown>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <ControlledDropdown {...args} />,
};

function SelectableDropdown(args: Partial<DropdownProps>) {
  const items = [
    { value: "design", label: "Design" },
    { value: "platform", label: "Platform" },
    { value: "growth", label: "Growth" },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        {...args}
        menu={{
          items,
          selectable: true,
          defaultSelectedValues: ["design"],
        }}
        trigger="click"
      >
        <Button>팀 선택</Button>
      </Dropdown>
    </div>
  );
}

function ItemClickDropdown(args: Partial<DropdownProps>) {
  const [action, setAction] = useState("작업 선택");
  const items = [
    { value: "edit", label: "수정", onClick: () => setAction("수정 선택됨") },
    { value: "copy", label: "복사", onClick: () => setAction("복사 선택됨") },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown {...args} menu={{ items }} trigger="click">
        <Button>{action}</Button>
      </Dropdown>
    </div>
  );
}

function MultipleSelectableDropdown(args: Partial<DropdownProps>) {
  const [selectedValues, setSelectedValues] = useState<Key[]>(["design", "platform"]);
  const items = [
    { value: "design", label: "Design" },
    { value: "platform", label: "Platform" },
    { value: "growth", label: "Growth" },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown
        {...args}
        menu={{
          items,
          selectable: true,
          multiple: true,
          selectedValues,
          onSelect: ({ selectedValues }) => setSelectedValues(selectedValues),
        }}
        trigger="click"
      >
        <Button>팀 선택 ({selectedValues.length})</Button>
      </Dropdown>
    </div>
  );
}

function ControlledDropdown(args: Partial<DropdownProps>) {
  const [open, setOpen] = useState(false);
  const items = [
    { value: "edit", label: "수정" },
    { value: "copy", label: "복사" },
  ];

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Dropdown {...args} menu={{ items }} open={open} trigger="click" onOpenChange={setOpen}>
        <Button>{open ? "닫기" : "열기"}</Button>
      </Dropdown>
    </div>
  );
}
