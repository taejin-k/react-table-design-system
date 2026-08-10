import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Popover } from "./Popover";
import type { PopoverPlacement, PopoverTrigger } from "./Popover.types";

const placements: PopoverPlacement[] = [
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
const triggers: PopoverTrigger[] = ["hover", "focus", "click"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  args: {
    children: <Button type="secondary">마우스를 올려보세요</Button>,
    title: "제목",
    content: "추가 내용을 표시해요.",
    placement: "top",
    trigger: "hover",
    arrow: true,
    color: "#ffffff",
    autoAdjustOverflow: true,
  },
  argTypes: {
    title: { name: "제목", control: "text" },
    content: { name: "내용", control: "text" },
    placement: { control: false, table: { disable: true } },
    trigger: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
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
          "요소와 관련된 추가 정보나 작업을 카드로 보여줘요.  \n제목·내용·위치·표시 동작과 화살표를 설정할 수 있어요.",
      },
      page: () => (
        <div className="popover-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Popover

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`children\` | Popover를 연결할 하나의 요소예요. | \`ReactElement\` | - |
| \`title\` | 카드의 제목을 설정해요. | \`ReactNode \\| () => ReactNode\` | - |
| \`content\` | 카드에 표시할 내용을 설정해요. | \`ReactNode \\| () => ReactNode\` | - |
| \`placement\` | 카드가 표시될 위치를 설정해요. | \`PopoverPlacement\` | \`top\` |
| \`trigger\` | hover, focus, click 중 표시 동작을 설정해요. | \`PopoverTrigger \\| PopoverTrigger[]\` | \`hover\` |
| \`arrow\` | 대상을 가리키는 화살표를 표시해요. | \`boolean\` | \`true\` |
| \`color\` | 카드의 배경 색상을 설정해요. | \`string\` | \`#ffffff\` |
| \`open\` | 카드의 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 렌더링할 때 카드를 표시해요. | \`boolean\` | \`false\` |
| \`autoAdjustOverflow\` | 화면을 벗어나면 반대 위치로 보정해요. | \`boolean\` | \`true\` |
| \`className\` | 대상에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onOpenChange\` | 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-popover--basic"),
    controls: { disable: false },
    docs: {
      source: {
        code: withStoryImports(`function BasicPopover() {
  return (
    <div className="flex min-h-32 items-center justify-center">
      <Popover title="제목" content="추가 내용을 표시해요.">
        <Button type="secondary">마우스를 올려보세요</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 items-center justify-center">
      <Popover {...args}>
        <Button type="secondary">마우스를 올려보세요</Button>
      </Popover>
    </div>
  ),
};

export const Placements: Story = {
  parameters: {
    ...storyDescription("components-popover--placements"),
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

function PopoverPlacements() {
  return (
    <div className="grid min-h-[420px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      {placements.map((placement) => (
        <Popover
          key={placement}
          content="추가 내용"
          placement={placement}
          title="Popover"
          trigger="click"
        >
          <Button className="w-28" type="secondary">
            {placement}
          </Button>
        </Popover>
      ))}
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid min-h-[420px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      {placements.map((placement) => (
        <Popover
          key={placement}
          content="추가 내용"
          placement={placement}
          title="Popover"
          trigger="click"
        >
          <Button className="w-28" type="secondary">
            {placement}
          </Button>
        </Popover>
      ))}
    </div>
  ),
};

export const Triggers: Story = {
  parameters: {
    ...storyDescription("components-popover--triggers"),
    controls: { disable: true },
    docs: {
      source: {
        code: withStoryImports(`const triggers = ['hover', 'focus', 'click'] as const;

function PopoverTriggers() {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3">
      {triggers.map((trigger) => (
        <Popover key={trigger} content={trigger + '로 열었어요.'} trigger={trigger}>
          <Button type="secondary">{trigger}</Button>
        </Popover>
      ))}
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex min-h-32 items-center justify-center gap-3">
      {triggers.map((trigger) => (
        <Popover key={trigger} content={`${trigger}로 열었어요.`} trigger={trigger}>
          <Button type="secondary">{trigger}</Button>
        </Popover>
      ))}
    </div>
  ),
};

export const Actions: Story = {
  parameters: {
    ...storyDescription("components-popover--actions"),
    controls: { disable: true },
    docs: {
      source: {
        code: withStoryImports(`function PopoverActions() {
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Popover
        title="항목 삭제"
        content={
          <div className="grid gap-3">
            <span>선택한 항목을 삭제할까요?</span>
            <div className="flex justify-end gap-2">
              <Button type="ghost">취소</Button>
              <Button>삭제</Button>
            </div>
          </div>
        }
        trigger="click"
      >
        <Button type="secondary">작업 열기</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex min-h-40 items-center justify-center">
      <Popover
        content={
          <div className="grid gap-3">
            <span>선택한 항목을 삭제할까요?</span>
            <div className="flex justify-end gap-2">
              <Button type="ghost">취소</Button>
              <Button>삭제</Button>
            </div>
          </div>
        }
        title="항목 삭제"
        trigger="click"
      >
        <Button type="secondary">작업 열기</Button>
      </Popover>
    </div>
  ),
};

export const Controlled: Story = {
  parameters: {
    ...storyDescription("components-popover--controlled"),
    controls: { disable: true },
    docs: {
      source: {
        code: withStoryImports(`function ControlledPopover() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Popover
        content="추가 내용"
        open={open}
        title="제목"
        trigger="click"
        onOpenChange={setOpen}
      >
        <Button type="secondary">{open ? '닫기' : '열기'}</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: () => <ControlledPopover />,
};

function ControlledPopover() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Popover content="추가 내용" open={open} title="제목" trigger="click" onOpenChange={setOpen}>
        <Button type="secondary">{open ? "닫기" : "열기"}</Button>
      </Popover>
    </div>
  );
}
