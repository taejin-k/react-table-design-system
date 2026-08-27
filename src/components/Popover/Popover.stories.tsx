import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentType } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Popover } from "./Popover";
import type { PopoverPlacementType, PopoverProps, PopoverTriggerType } from "./Popover.types";

const placements: PopoverPlacementType[] = [
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
const triggers: PopoverTriggerType[] = ["hover", "focus", "click", "contextMenu"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Popover",
  component: Popover as ComponentType<Partial<PopoverProps>>,
  tags: ["autodocs"],
  argTypes: {
    title: { name: "제목", control: "text" },
    content: { name: "내용", control: "text" },
    placement: { name: "위치", control: "select", options: placements },
    trigger: { name: "표시 동작", control: "select", options: triggers },
    arrow: { name: "화살표", control: "boolean" },
    color: { name: "배경 색상", control: "color" },
    autoAdjustOverflow: { name: "위치 자동 보정", control: "boolean" },
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
    controls: { disable: false },
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
| \`title\` | 카드의 제목을 설정해요. | \`ReactNode\` | - |
| \`content\` | 카드에 표시할 내용을 설정해요. | \`ReactNode \\| () => ReactNode\` | - |
| \`placement\` | 카드가 표시될 위치를 설정해요. | [\`PopoverPlacementType\`](#popover-placement-type) | \`top\` |
| \`trigger\` | hover, focus, click, contextMenu로 표시해요. | [\`PopoverTriggerType\`](#popover-trigger-type) \\| [\`PopoverTriggerType[]\`](#popover-trigger-type) | \`hover\` |
| \`arrow\` | 대상을 가리키는 화살표를 표시해요. | \`boolean\` | \`true\` |
| \`color\` | 카드의 배경 색상을 설정해요. | \`CSSProperties['backgroundColor']\` | \`#ffffff\` |
| \`open\` | 카드의 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 렌더링할 때 카드를 표시해요. | \`boolean\` | \`false\` |
| \`autoAdjustOverflow\` | 화면을 벗어나면 반대 위치로 보정해요. | \`boolean\` | \`true\` |
| \`className\` | 대상에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onOpenChange\` | 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="popover-placement-type">PopoverPlacementType</h3>
          <p>대상을 기준으로 Popover가 표시될 위치를 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {placements.map((placement) => (
              <PopoverTypeCode key={placement} value={placement} />
            ))}
          </div>
          <h3 id="popover-trigger-type">PopoverTriggerType</h3>
          <p>Popover를 표시할 동작을 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {triggers.map((trigger) => (
              <PopoverTypeCode key={trigger} value={trigger} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<Partial<PopoverProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

function PopoverTypeCode({ value }: { value: PopoverPlacementType | PopoverTriggerType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {value}
    </code>
  );
}

export const Basic: Story = {
  args: {
    title: "제목",
    content: "추가 내용을 표시해요.",
    placement: "top",
    trigger: "hover",
    arrow: true,
    color: "#ffffff",
    autoAdjustOverflow: true,
  },
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
        <Button>마우스를 올려보세요</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 items-center justify-center">
      <Popover {...args} content={args.content ?? "추가 내용을 표시해요."}>
        <Button>마우스를 올려보세요</Button>
      </Popover>
    </div>
  ),
};

export const Placements: Story = {
  args: { title: "Popover", content: "추가 내용", trigger: "click", arrow: true },
  parameters: {
    ...storyDescription("components-popover--placements"),
    controls: { disable: false, include: ["제목", "내용", "화살표"] },
    docs: {
      ...storyDescription("components-popover--placements").docs,
      source: {
        code: withStoryImports(`function PopoverPlacements() {
  return (
    <div className="grid min-h-[420px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      <Popover content="추가 내용" placement="topLeft" title="Popover" trigger="click">
        <Button>topLeft</Button>
      </Popover>
      <Popover content="추가 내용" title="Popover" trigger="click">
        <Button>top</Button>
      </Popover>
      <Popover content="추가 내용" placement="topRight" title="Popover" trigger="click">
        <Button>topRight</Button>
      </Popover>
      <Popover content="추가 내용" placement="leftTop" title="Popover" trigger="click">
        <Button>leftTop</Button>
      </Popover>
      <Popover content="추가 내용" placement="rightTop" title="Popover" trigger="click">
        <Button>rightTop</Button>
      </Popover>
      <Popover content="추가 내용" placement="left" title="Popover" trigger="click">
        <Button>left</Button>
      </Popover>
      <Popover content="추가 내용" placement="right" title="Popover" trigger="click">
        <Button>right</Button>
      </Popover>
      <Popover content="추가 내용" placement="leftBottom" title="Popover" trigger="click">
        <Button>leftBottom</Button>
      </Popover>
      <Popover content="추가 내용" placement="rightBottom" title="Popover" trigger="click">
        <Button>rightBottom</Button>
      </Popover>
      <Popover content="추가 내용" placement="bottomLeft" title="Popover" trigger="click">
        <Button>bottomLeft</Button>
      </Popover>
      <Popover content="추가 내용" placement="bottom" title="Popover" trigger="click">
        <Button>bottom</Button>
      </Popover>
      <Popover content="추가 내용" placement="bottomRight" title="Popover" trigger="click">
        <Button>bottomRight</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="grid min-h-[420px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      {placements.map((placement) => (
        <Popover
          {...args}
          key={placement}
          content={args.content ?? "추가 내용"}
          placement={placement}
        >
          <Button>{placement}</Button>
        </Popover>
      ))}
    </div>
  ),
};

export const Triggers: Story = {
  args: { title: "Popover", placement: "top", arrow: true, color: "#ffffff" },
  parameters: {
    ...storyDescription("components-popover--triggers"),
    controls: { disable: false, include: ["제목", "위치", "화살표", "배경 색상"] },
    docs: {
      ...storyDescription("components-popover--triggers").docs,
      source: {
        code: withStoryImports(`function PopoverTriggers() {
  return (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Popover content="hover로 열었어요.">
        <Button>hover</Button>
      </Popover>
      <Popover content="focus로 열었어요." trigger="focus">
        <Button>focus</Button>
      </Popover>
      <Popover content="click으로 열었어요." trigger="click">
        <Button>click</Button>
      </Popover>
      <Popover content="contextMenu로 열었어요." trigger="contextMenu">
        <Button>contextMenu (우클릭)</Button>
      </Popover>
      <Popover content="hover + focus로 열었어요." trigger={['hover', 'focus']}>
        <Button>hover + focus</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      {triggers.map((trigger) => (
        <Popover {...args} key={trigger} content={`${trigger}로 열었어요.`} trigger={trigger}>
          <Button>{trigger === "contextMenu" ? "contextMenu (우클릭)" : trigger}</Button>
        </Popover>
      ))}
      <Popover {...args} content="hover + focus로 열었어요." trigger={["hover", "focus"]}>
        <Button>hover + focus</Button>
      </Popover>
    </div>
  ),
};

export const Appearance: Story = {
  args: { placement: "top", trigger: "hover", autoAdjustOverflow: true },
  argTypes: {
    title: { control: false, table: { disable: true } },
    content: { control: false, table: { disable: true } },
    placement: { name: "위치", control: "select", options: placements },
    trigger: { name: "표시 동작", control: "select", options: triggers },
    color: { control: false, table: { disable: true } },
    arrow: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-popover--appearance"),
    controls: { disable: false, include: ["위치", "표시 동작", "위치 자동 보정"] },
    docs: {
      ...storyDescription("components-popover--appearance").docs,
      source: {
        code: withStoryImports(`function PopoverAppearance() {
  return (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Popover content="추가 내용" title="기본 색상">
        <Button>기본</Button>
      </Popover>
      <Popover color="#0062df" content="추가 내용" title="파란색">
        <Button>색상</Button>
      </Popover>
      <Popover arrow={false} content="추가 내용" title="화살표 없음">
        <Button>화살표 없음</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Popover {...args} content="추가 내용" title="기본 색상">
        <Button>기본</Button>
      </Popover>
      <Popover {...args} color="#0062df" content="추가 내용" title="파란색">
        <Button>색상</Button>
      </Popover>
      <Popover {...args} arrow={false} content="추가 내용" title="화살표 없음">
        <Button>화살표 없음</Button>
      </Popover>
    </div>
  ),
};

export const Actions: Story = {
  args: { title: "항목 삭제", placement: "top", color: "#ffffff", arrow: true },
  parameters: {
    ...storyDescription("components-popover--actions"),
    controls: { disable: false, include: ["제목", "위치", "배경 색상", "화살표"] },
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
        <Button>작업 열기</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <PopoverActionsExample {...args} />,
};

function PopoverActionsExample(args: Partial<PopoverProps>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-40 items-center justify-center">
      <Popover
        {...args}
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
        title={args.title}
        trigger="click"
        onOpenChange={setOpen}
      >
        <Button>작업 열기</Button>
      </Popover>
    </div>
  );
}

export const Controlled: Story = {
  args: {
    title: "제목",
    content: "추가 내용",
    placement: "top",
    color: "#ffffff",
    arrow: true,
  },
  parameters: {
    ...storyDescription("components-popover--controlled"),
    controls: {
      disable: false,
      include: ["제목", "내용", "위치", "배경 색상", "화살표"],
    },
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
        <Button>{open ? '닫기' : '열기'}</Button>
      </Popover>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <ControlledPopover {...args} />,
};

function ControlledPopover(args: Partial<PopoverProps>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-32 items-center justify-center">
      <Popover
        {...args}
        content={args.content ?? "추가 내용"}
        open={open}
        trigger="click"
        onOpenChange={setOpen}
      >
        <Button>{open ? "닫기" : "열기"}</Button>
      </Popover>
    </div>
  );
}
