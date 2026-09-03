import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentType } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { formatTooltipStorySource, withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Tooltip } from "./Tooltip";
import type { TooltipPlacementType, TooltipProps, TooltipTriggerType } from "./Tooltip.types";

const placements: TooltipPlacementType[] = [
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
const triggers: TooltipTriggerType[] = ["hover", "focus", "click", "contextMenu"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Tooltip",
  component: Tooltip as ComponentType<Partial<TooltipProps>>,
  tags: ["autodocs"],
  argTypes: {
    title: { name: "내용", control: "text" },
    placement: { name: "위치", control: "select", options: placements },
    trigger: { name: "표시 동작", control: "select", options: triggers },
    arrow: { name: "화살표", control: "boolean" },
    color: { name: "배경 색상", control: "color" },
    autoAdjustOverflow: {
      name: "위치 자동 보정",
      control: false,
      table: { disable: true },
    },
    mouseEnterDelay: { name: "표시 지연(초)", control: "number" },
    mouseLeaveDelay: { name: "숨김 지연(초)", control: "number" },
    children: { control: false, table: { disable: true } },
    open: { control: false, table: { disable: true } },
    defaultOpen: { control: false, table: { disable: true } },
    zIndex: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onOpenChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      source: { transform: formatTooltipStorySource },
      description: {
        component:
          "요소의 기능이나 의미를 짧은 문구로 설명해요.  \n표시 위치와 동작, 배경 색상, 화살표와 표시 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="tooltip-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Tooltip

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`title\` | 표시할 내용을 설정해요. 비어 있으면 표시하지 않아요. | \`ReactNode\` | - |
| \`children\` | Tooltip을 연결할 하나의 요소예요. | \`ReactElement\` | - |
| \`placement\` | 대상을 기준으로 Tooltip이 표시될 위치를 설정해요. | [\`TooltipPlacementType\`](#tooltip-placement-type) | \`top\` |
| \`trigger\` | hover, focus, click, contextMenu로 표시해요. | [\`TooltipTriggerType\`](#tooltip-trigger-type) \\| [\`TooltipTriggerType[]\`](#tooltip-trigger-type) | \`hover\` |
| \`arrow\` | 대상 방향을 가리키는 화살표를 표시해요. | \`boolean\` | \`true\` |
| \`color\` | Tooltip의 배경 색상을 설정해요. | \`CSSProperties['backgroundColor']\` | \`var(--color-dark)\` |
| \`open\` | Tooltip의 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 렌더링할 때 Tooltip을 표시해요. | \`boolean\` | \`false\` |
| \`autoAdjustOverflow\` | 화면을 벗어나면 반대 위치로 전환하고 안쪽으로 이동해요. | \`boolean\` | \`true\` |
| \`mouseEnterDelay\` | hover 후 표시되기까지의 시간을 초 단위로 설정해요. | \`number\` | \`0.1\` |
| \`mouseLeaveDelay\` | hover가 끝난 뒤 숨기기까지의 시간을 초 단위로 설정해요. | \`number\` | \`0.1\` |
| \`zIndex\` | Tooltip이 겹쳐지는 순서를 설정해요. | \`number\` | \`1070\` |
| \`className\` | 대상을 감싸는 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onOpenChange\` | Tooltip의 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="tooltip-placement-type">TooltipPlacementType</h3>
          <p>대상을 기준으로 Tooltip이 표시될 위치를 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {placements.map((placement) => (
              <TooltipTypeCode key={placement} value={placement} />
            ))}
          </div>
          <h3 id="tooltip-trigger-type">TooltipTriggerType</h3>
          <p>Tooltip을 표시할 동작을 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {triggers.map((trigger) => (
              <TooltipTypeCode key={trigger} value={trigger} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<Partial<TooltipProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

function TooltipTypeCode({ value }: { value: TooltipPlacementType | TooltipTriggerType }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {value}
    </code>
  );
}

export const Basic: Story = {
  args: {
    title: "Tooltip",
    placement: "top",
    trigger: "hover",
    arrow: true,
    autoAdjustOverflow: true,
    mouseEnterDelay: 0.1,
    mouseLeaveDelay: 0.1,
  },
  parameters: {
    ...storyDescription("components-tooltip--basic"),
    controls: {
      disable: false,
      include: [
        "내용",
        "위치",
        "표시 동작",
        "화살표",
        "배경 색상",
        "표시 지연(초)",
        "숨김 지연(초)",
      ],
    },
  },
  render: (args) => (
    <div className="flex min-h-28 items-center justify-center">
      <Tooltip {...args}>
        <Button>마우스를 올려보세요</Button>
      </Tooltip>
    </div>
  ),
};

export const Placements: Story = {
  args: { arrow: true },
  argTypes: {
    title: { control: false, table: { disable: true } },
    placement: { control: false, table: { disable: true } },
    trigger: { control: false, table: { disable: true } },
    color: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-tooltip--placements"),
    controls: { disable: false, include: ["화살표"] },
    docs: {
      ...storyDescription("components-tooltip--placements").docs,
      source: {
        code: withStoryImports(`function TooltipPlacements() {
  return (
    <div className="grid min-h-[360px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      <Tooltip placement="topLeft" title={"Tooltip\\ntopLeft"}>
        <Button>topLeft</Button>
      </Tooltip>
      <Tooltip placement="top" title={"Tooltip\\ntop"}>
        <Button>top</Button>
      </Tooltip>
      <Tooltip placement="topRight" title={"Tooltip\\ntopRight"}>
        <Button>topRight</Button>
      </Tooltip>
      <Tooltip placement="leftTop" title={"Tooltip\\nleftTop"}>
        <Button>leftTop</Button>
      </Tooltip>
      <Tooltip placement="rightTop" title={"Tooltip\\nrightTop"}>
        <Button>rightTop</Button>
      </Tooltip>
      <Tooltip placement="left" title={"Tooltip\\nleft"}>
        <Button>left</Button>
      </Tooltip>
      <Tooltip placement="right" title={"Tooltip\\nright"}>
        <Button>right</Button>
      </Tooltip>
      <Tooltip placement="leftBottom" title={"Tooltip\\nleftBottom"}>
        <Button>leftBottom</Button>
      </Tooltip>
      <Tooltip placement="rightBottom" title={"Tooltip\\nrightBottom"}>
        <Button>rightBottom</Button>
      </Tooltip>
      <Tooltip placement="bottomLeft" title={"Tooltip\\nbottomLeft"}>
        <Button>bottomLeft</Button>
      </Tooltip>
      <Tooltip placement="bottom" title={"Tooltip\\nbottom"}>
        <Button>bottom</Button>
      </Tooltip>
      <Tooltip placement="bottomRight" title={"Tooltip\\nbottomRight"}>
        <Button>bottomRight</Button>
      </Tooltip>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="grid min-h-[360px] grid-cols-3 place-items-center gap-x-24 gap-y-10 px-24 py-16">
      {placements.map((placement) => (
        <Tooltip {...args} key={placement} placement={placement} title={"Tooltip\n" + placement}>
          <Button>{placement}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Triggers: Story = {
  argTypes: {
    title: { control: false, table: { disable: true } },
    placement: { control: false, table: { disable: true } },
    trigger: { control: false, table: { disable: true } },
    arrow: { control: false, table: { disable: true } },
    color: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-tooltip--triggers"),
    controls: { disable: false, include: ["표시 지연(초)", "숨김 지연(초)"] },
    docs: {
      ...storyDescription("components-tooltip--triggers").docs,
      source: {
        code: withStoryImports(`<div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
  <Tooltip title="hover">
    <Button>hover</Button>
  </Tooltip>
  <Tooltip title="focus" trigger="focus">
    <Button>focus</Button>
  </Tooltip>
  <Tooltip title="click" trigger="click">
    <Button>click</Button>
  </Tooltip>
  <Tooltip title="contextMenu" trigger="contextMenu">
    <Button>contextMenu (우클릭)</Button>
  </Tooltip>
  <Tooltip title="hover + focus" trigger={['hover', 'focus']}>
    <Button>hover + focus</Button>
  </Tooltip>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      {triggers.map((trigger) => (
        <Tooltip {...args} key={trigger} title={trigger} trigger={trigger}>
          <Button>{trigger === "contextMenu" ? "contextMenu (우클릭)" : trigger}</Button>
        </Tooltip>
      ))}
      <Tooltip {...args} title="hover + focus" trigger={["hover", "focus"]}>
        <Button>hover + focus</Button>
      </Tooltip>
    </div>
  ),
};

export const Appearance: Story = {
  argTypes: {
    title: { control: false, table: { disable: true } },
    placement: { control: false, table: { disable: true } },
    trigger: { control: false, table: { disable: true } },
    color: { control: false, table: { disable: true } },
    arrow: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-tooltip--appearance"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-tooltip--appearance").docs,
      source: {
        code: withStoryImports(`function TooltipAppearance() {
  return (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Tooltip title="기본 색상">
        <Button>기본</Button>
      </Tooltip>
      <Tooltip color="#0062df" title="파란색">
        <Button>색상</Button>
      </Tooltip>
      <Tooltip arrow={false} title="화살표 없음">
        <Button>화살표 없음</Button>
      </Tooltip>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex min-h-32 flex-wrap items-center justify-center gap-3">
      <Tooltip {...args} title="기본 색상">
        <Button>기본</Button>
      </Tooltip>
      <Tooltip {...args} color="#0062df" title="파란색">
        <Button>색상</Button>
      </Tooltip>
      <Tooltip {...args} arrow={false} title="화살표 없음">
        <Button>화살표 없음</Button>
      </Tooltip>
    </div>
  ),
};

export const Controlled: Story = {
  args: { title: "Tooltip", placement: "top", arrow: true, color: "var(--color-dark)" },
  parameters: {
    ...storyDescription("components-tooltip--controlled"),
    controls: { disable: false, include: ["내용", "위치", "화살표", "배경 색상"] },
    docs: {
      ...storyDescription("components-tooltip--controlled").docs,
      source: {
        code: withStoryImports(`function ControlledTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} title="Tooltip" onOpenChange={setOpen}>
      <Button onClick={() => setOpen((current) => !current)}>
        {open ? '닫기' : '열기'}
      </Button>
    </Tooltip>
  );
}`),
      },
    },
  },
  render: (args) => <ControlledTooltip {...args} />,
};

function ControlledTooltip(args: Partial<TooltipProps>) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-28 items-center justify-center">
      <Tooltip {...args} open={open} onOpenChange={setOpen}>
        <Button onClick={() => setOpen((current) => !current)}>{open ? "닫기" : "열기"}</Button>
      </Tooltip>
    </div>
  );
}
