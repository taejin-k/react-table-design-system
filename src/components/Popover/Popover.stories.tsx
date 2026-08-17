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
const triggers: PopoverTrigger[] = ["hover", "focus", "click", "contextMenu"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  args: {
    children: <Button variant="secondary">마우스를 올려보세요</Button>,
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
    trigger: { name: "표시 동작", control: "select", options: triggers },
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
| \`trigger\` | hover, focus, click, contextMenu로 표시해요. | \`PopoverTrigger \\| PopoverTrigger[]\` | \`hover\` |
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
      ...storyDescription("components-popover--basic").docs,
      source: {
        code: withStoryImports(`function BasicPopover() {
  return (
    <div className="flex min-h-32 items-center justify-center">
      <Popover title="제목" content="추가 내용을 표시해요.">
        <Button variant="secondary">마우스를 올려보세요</Button>
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
        <Button variant="secondary">마우스를 올려보세요</Button>
      </Popover>
    </div>
  ),
};

export const Placements: Story = {
  parameters: {
    ...storyDescription("components-popover--placements"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-popover--placements").docs,
      source: {
        code: withStoryImports(`function PopoverPlacements() {
  return (
    <div className="grid min-h-[420px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      <Popover content="추가 내용" placement="topLeft" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">topLeft</Button>
      </Popover>
      <Popover content="추가 내용" placement="top" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">top</Button>
      </Popover>
      <Popover content="추가 내용" placement="topRight" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">topRight</Button>
      </Popover>
      <Popover content="추가 내용" placement="leftTop" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">leftTop</Button>
      </Popover>
      <Popover content="추가 내용" placement="rightTop" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">rightTop</Button>
      </Popover>
      <Popover content="추가 내용" placement="left" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">left</Button>
      </Popover>
      <Popover content="추가 내용" placement="right" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">right</Button>
      </Popover>
      <Popover content="추가 내용" placement="leftBottom" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">leftBottom</Button>
      </Popover>
      <Popover content="추가 내용" placement="rightBottom" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">rightBottom</Button>
      </Popover>
      <Popover content="추가 내용" placement="bottomLeft" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">bottomLeft</Button>
      </Popover>
      <Popover content="추가 내용" placement="bottom" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">bottom</Button>
      </Popover>
      <Popover content="추가 내용" placement="bottomRight" title="Popover" trigger="click">
        <Button className="w-28" variant="secondary">bottomRight</Button>
      </Popover>
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
          <Button className="w-28" variant="secondary">
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
      ...storyDescription("components-popover--triggers").docs,
      source: {
        code: withStoryImports(`function PopoverTriggers() {
  return (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Popover content="hover로 열었어요.">
        <Button variant="secondary">hover</Button>
      </Popover>
      <Popover content="focus로 열었어요." trigger="focus">
        <Button variant="secondary">focus</Button>
      </Popover>
      <Popover content="click으로 열었어요." trigger="click">
        <Button variant="secondary">click</Button>
      </Popover>
      <Popover content="contextMenu로 열었어요." trigger="contextMenu">
        <Button variant="secondary">contextMenu (우클릭)</Button>
      </Popover>
      <Popover content="hover + focus로 열었어요." trigger={['hover', 'focus']}>
        <Button variant="secondary">hover + focus</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      {triggers.map((trigger) => (
        <Popover key={trigger} content={`${trigger}로 열었어요.`} trigger={trigger}>
          <Button variant="secondary">
            {trigger === "contextMenu" ? "contextMenu (우클릭)" : trigger}
          </Button>
        </Popover>
      ))}
      <Popover content="hover + focus로 열었어요." trigger={["hover", "focus"]}>
        <Button variant="secondary">hover + focus</Button>
      </Popover>
    </div>
  ),
};

export const Appearance: Story = {
  argTypes: {
    title: { control: false, table: { disable: true } },
    content: { control: false, table: { disable: true } },
    placement: { control: false, table: { disable: true } },
    trigger: { control: false, table: { disable: true } },
    color: { control: false, table: { disable: true } },
    arrow: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-popover--appearance"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-popover--appearance").docs,
      source: {
        code: withStoryImports(`function PopoverAppearance() {
  return (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Popover content="추가 내용" title="기본 색상">
        <Button variant="secondary">기본</Button>
      </Popover>
      <Popover color="#0062df" content="추가 내용" title="파란색">
        <Button variant="secondary">색상</Button>
      </Popover>
      <Popover arrow={false} content="추가 내용" title="화살표 없음">
        <Button variant="secondary">화살표 없음</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Popover content="추가 내용" title="기본 색상">
        <Button variant="secondary">기본</Button>
      </Popover>
      <Popover color="#0062df" content="추가 내용" title="파란색">
        <Button variant="secondary">색상</Button>
      </Popover>
      <Popover arrow={false} content="추가 내용" title="화살표 없음">
        <Button variant="secondary">화살표 없음</Button>
      </Popover>
    </div>
  ),
};

export const Actions: Story = {
  parameters: {
    ...storyDescription("components-popover--actions"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-popover--actions").docs,
      source: {
        code: withStoryImports(`function PopoverActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-40 items-center justify-center">
      <Popover
        content={
          <div className="grid gap-3">
            <span>선택한 항목을 삭제할까요?</span>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>취소</Button>
              <Button onClick={() => setOpen(false)}>삭제</Button>
            </div>
          </div>
        }
        open={open}
        title="항목 삭제"
        trigger="click"
        onOpenChange={setOpen}
      >
        <Button variant="secondary">작업 열기</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: () => <PopoverActionsExample />,
};

function PopoverActionsExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-40 items-center justify-center">
      <Popover
        content={
          <div className="grid gap-3">
            <span>선택한 항목을 삭제할까요?</span>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setOpen(false)}>삭제</Button>
            </div>
          </div>
        }
        open={open}
        title="항목 삭제"
        trigger="click"
        onOpenChange={setOpen}
      >
        <Button variant="secondary">작업 열기</Button>
      </Popover>
    </div>
  );
}

export const Controlled: Story = {
  parameters: {
    ...storyDescription("components-popover--controlled"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-popover--controlled").docs,
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
        <Button variant="secondary">{open ? '닫기' : '열기'}</Button>
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
        <Button variant="secondary">{open ? "닫기" : "열기"}</Button>
      </Popover>
    </div>
  );
}
