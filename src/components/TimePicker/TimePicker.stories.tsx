import { useState } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { TimePicker } from "./TimePicker";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const storySource = (id: string, code: string) => ({
  docs: {
    description: { story: storyDescriptions[id] },
    source: { code: withStoryImports(code) },
  },
});

const meta = {
  title: "Components/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  args: { placeholder: "시간을 선택하세요" },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    size: { name: "크기", control: "select", options: ["lg", "md", "sm"] },
    variant: {
      name: "표현 방식",
      control: "select",
      options: ["default", "outlined", "filled", "borderless", "underlined"],
    },
    placeholder: { name: "안내 문구", control: "text" },
    label: { name: "레이블", control: "text" },
    errorText: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    allowClear: { name: "지우기", control: "boolean" },
    use12Hours: { name: "12시간제", control: "boolean" },
    showSecond: { name: "초", control: "boolean" },
    needConfirm: { name: "확인 버튼", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    className: { control: false },
    onChange: { control: false },
    onOpenChange: { control: false },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "목록에서 시·분·초를 선택할 수 있어요.  \n비활성 시간·12시간제·간격·확인 버튼과 시간 범위를 설정할 수 있어요.",
      },
      page: () => (
        <div className="timepicker-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### TimePicker

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 선택값을 HH:mm:ss 문자열로 관리해요. | \`string \\| null\` | - |
| \`defaultValue\` | 처음 선택할 시간을 설정해요. | \`string\` | - |
| \`placeholder\` | 선택 전 안내 문구를 설정해요. | \`string\` | \`시간을 선택하세요\` |
| \`format\` | 표시할 시간 형식을 설정해요. | \`string\` | \`HH:mm:ss\` |
| \`size\` | TimePicker의 크기를 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | \`default \\| outlined \\| filled \\| borderless \\| underlined\` | \`default\` |
| \`status\` | 경고나 오류 상태를 표시해요. | \`error \\| warning\` | - |
| \`use12Hours\` | AM과 PM을 사용하는 12시간제로 표시해요. | \`boolean\` | \`false\` |
| \`showSecond\` | 초 선택 열을 표시해요. | \`boolean\` | \`true\` |
| \`hourStep\` | 시 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`minuteStep\` | 분 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`secondStep\` | 초 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`needConfirm\` | 확인을 눌러야 선택값을 반영해요. | \`boolean\` | \`false\` |
| \`changeOnScroll\` | 시간 목록을 스크롤할 때 값을 변경해요. | \`boolean\` | \`false\` |
| \`disabledTime\` | 선택할 수 없는 시·분·초를 설정해요. | \`(now: Date) => DisabledTime\` | - |
| \`hideDisabledOptions\` | 비활성 시간 항목을 목록에서 숨겨요. | \`boolean\` | \`false\` |
| \`showNow\` | 현재 시간 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`allowClear\` | 선택값을 지우는 버튼을 표시해요. | \`boolean \\| { clearIcon }\` | \`true\` |
| \`disabled\` | 시간 선택과 열기 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`prefix\` | 선택 영역 앞에 추가 내용을 표시해요. | \`ReactNode\` | - |
| \`suffixIcon\` | 시간 아이콘을 변경해요. | \`ReactNode\` | - |
| \`previewValue\` | 항목 hover 중 선택 전 값을 미리 보여줘요. | \`false \\| hover\` | \`false\` |
| \`renderExtraFooter\` | 목록 아래에 추가 내용을 표시해요. | \`() => ReactNode\` | - |
| \`cellRender\` | 시간 항목의 내용을 직접 구성해요. | \`(current, info) => ReactNode\` | - |
| \`open\` | 목록 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 시간 목록을 표시할지 설정해요. | \`boolean\` | \`false\` |
| \`placement\` | 목록이 표시될 위치를 설정해요. | \`topLeft \\| topRight \\| bottomLeft \\| bottomRight\` | \`bottomLeft\` |
| \`label\` | TimePicker 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorText\` | TimePicker 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 선택값이 바뀔 때 실행할 함수예요. | \`(value, timeString) => void\` | - |
| \`onClear\` | 선택값을 지울 때 실행할 함수예요. | \`() => void\` | - |
| \`onOpenChange\` | 목록 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |

### DisabledTime

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`disabledHours\` | 선택할 수 없는 시 목록을 반환해요. | \`() => number[]\` | - |
| \`disabledMinutes\` | 선택한 시에 따라 선택할 수 없는 분 목록을 반환해요. | \`(selectedHour: number) => number[]\` | - |
| \`disabledSeconds\` | 선택한 시와 분에 따라 선택할 수 없는 초 목록을 반환해요. | \`(selectedHour: number, selectedMinute: number) => number[]\` | - |

### RangePicker

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 시작 시간과 종료 시간을 관리해요. | \`[string \\| null, string \\| null]\` | - |
| \`defaultValue\` | 처음 선택할 시작 시간과 종료 시간을 설정해요. | \`[string \\| null, string \\| null]\` | - |
| \`placeholder\` | 두 입력 영역의 안내 문구를 설정해요. | \`[string, string]\` | \`['시작 시간', '종료 시간']\` |
| \`onChange\` | 시간 범위가 바뀔 때 실행할 함수예요. | \`(value, timeStrings) => void\` | - |
| \`onCalendarChange\` | 시작 시간이나 종료 시간을 선택할 때 실행해요. | \`(value, timeStrings, info) => void\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-timepicker--sizes"),
    docs: {
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <TimePicker size="lg" />
  <TimePicker />
  <TimePicker size="sm" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-xs gap-3">
      <TimePicker size="lg" />
      <TimePicker />
      <TimePicker size="sm" />
    </div>
  ),
};

export const States: Story = {
  parameters: {
    ...storyDescription("components-timepicker--states"),
    docs: {
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <TimePicker placeholder="기본" />
  <TimePicker variant="filled" placeholder="채움" />
  <TimePicker status="warning" placeholder="경고" />
  <TimePicker disabled defaultValue="09:00:00" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-xs gap-3">
      <TimePicker placeholder="기본" />
      <TimePicker variant="filled" placeholder="채움" />
      <TimePicker status="warning" placeholder="경고" />
      <TimePicker disabled defaultValue="09:00:00" />
    </div>
  ),
};

export const LabelAndError: Story = {
  parameters: {
    ...storyDescription("components-timepicker--label-and-error"),
    docs: {
      source: {
        code: withStoryImports(`<TimePicker
  className="max-w-xs"
  label="업무 시작"
  required
  errorText="시간을 선택해 주세요."
/>`),
      },
    },
  },
  render: () => (
    <TimePicker className="max-w-xs" label="업무 시작" required errorText="시간을 선택해 주세요." />
  ),
};

export const Basic: Story = {
  parameters: {
    ...storySource("components-timepicker--basic", '<TimePicker className="max-w-xs" />'),
    controls: { disable: false },
  },
  render: (args) => <TimePicker {...args} className="max-w-xs" />,
};

export const FormatAndSteps: Story = {
  parameters: {
    ...storyDescription("components-timepicker--format-and-steps"),
    docs: {
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <TimePicker use12Hours />
  <TimePicker showSecond={false} minuteStep={10} />
  <TimePicker minuteStep={15} needConfirm />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-xs gap-3">
      <TimePicker use12Hours />
      <TimePicker showSecond={false} minuteStep={10} />
      <TimePicker minuteStep={15} needConfirm />
    </div>
  ),
};

export const Range: Story = {
  parameters: {
    ...storyDescription("components-timepicker--range"),
    docs: {
      source: {
        code: withStoryImports(`function WorkingHours() {
  const [hours, setHours] = useState<[string | null, string | null]>([
    '09:00:00',
    '18:00:00',
  ]);

  return <TimePicker.RangePicker className="max-w-xl" value={hours} onChange={setHours} />;
}`),
      },
    },
  },
  render: function TimeRangeStory() {
    const [hours, setHours] = useState<[string | null, string | null]>(["09:00:00", "18:00:00"]);
    return <TimePicker.RangePicker className="max-w-xl" value={hours} onChange={setHours} />;
  },
};

export const DisabledTime: Story = {
  parameters: {
    ...storyDescription("components-timepicker--disabled-time"),
    docs: {
      source: {
        code: withStoryImports(`<TimePicker
  className="max-w-xs"
  disabledTime={() => ({
    disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
    disabledMinutes: (hour) => (hour === 9 ? [0, 10, 20] : []),
  })}
/>`),
      },
    },
  },
  render: () => (
    <TimePicker
      className="max-w-xs"
      disabledTime={() => ({
        disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
        disabledMinutes: (hour) => (hour === 9 ? [0, 10, 20] : []),
      })}
    />
  ),
};

export const HideDisabledOptions: Story = {
  parameters: storySource(
    "components-timepicker--hide-disabled-options",
    `<TimePicker
  className="max-w-xs"
  hideDisabledOptions
  disabledTime={() => ({
    disabledHours: () => Array.from({ length: 9 }, (_, index) => index),
  })}
/>`,
  ),
  render: () => (
    <TimePicker
      className="max-w-xs"
      hideDisabledOptions
      disabledTime={() => ({ disabledHours: () => Array.from({ length: 9 }, (_, index) => index) })}
    />
  ),
};

export const ShowNowAndExtraFooter: Story = {
  parameters: storySource(
    "components-timepicker--show-now-and-footer",
    `<div className="grid max-w-xs gap-3">
  <TimePicker />
  <TimePicker
    showNow={false}
    renderExtraFooter={() => '운영 시간: 09:00-18:00'}
  />
</div>`,
  ),
  render: () => (
    <div className="grid max-w-xs gap-3">
      <TimePicker />
      <TimePicker showNow={false} renderExtraFooter={() => "운영 시간: 09:00-18:00"} />
    </div>
  ),
};

export const CustomCell: Story = {
  parameters: storySource(
    "components-timepicker--custom-cell",
    `<TimePicker
  className="max-w-xs"
  minuteStep={10}
  cellRender={(current, { originNode, subType }) => (
    <strong className={subType === 'minute' && current === 30 ? 'text-[#fe5150]' : ''}>
      {originNode}
    </strong>
  )}
/>`,
  ),
  render: () => (
    <TimePicker
      className="max-w-xs"
      minuteStep={10}
      cellRender={(current, { originNode, subType }) => (
        <strong className={subType === "minute" && current === 30 ? "text-[#fe5150]" : ""}>
          {originNode}
        </strong>
      )}
    />
  ),
};

export const PreviewOnHover: Story = {
  parameters: storySource(
    "components-timepicker--preview-on-hover",
    '<TimePicker className="max-w-xs" previewValue="hover" />',
  ),
  render: () => <TimePicker className="max-w-xs" previewValue="hover" />,
};

export const ChangeOnScroll: Story = {
  parameters: storySource(
    "components-timepicker--change-on-scroll",
    '<TimePicker className="max-w-xs" changeOnScroll minuteStep={5} />',
  ),
  render: () => <TimePicker className="max-w-xs" changeOnScroll minuteStep={5} />,
};

export const PrefixAndSuffix: Story = {
  parameters: storySource(
    "components-timepicker--prefix-and-suffix",
    `<TimePicker
  className="max-w-xs"
  prefix={<span>시작</span>}
  suffixIcon={<Icon icon="clock" />}
/>`,
  ),
  render: () => (
    <TimePicker
      className="max-w-xs"
      prefix={<span>시작</span>}
      suffixIcon={<Icon icon="clock" />}
    />
  ),
};

export const Controlled: Story = {
  parameters: storySource(
    "components-timepicker--controlled",
    `function ControlledTimePicker() {
  const [time, setTime] = useState<string | null>('09:00:00');

  return <TimePicker className="max-w-xs" value={time} onChange={setTime} />;
}`,
  ),
  render: function ControlledTimeStory() {
    const [time, setTime] = useState<string | null>("09:00:00");
    return <TimePicker className="max-w-xs" value={time} onChange={setTime} />;
  },
};

export const Placements: Story = {
  parameters: storySource(
    "components-timepicker--placements",
    `<div className="grid max-w-xs gap-3 pt-60">
  <TimePicker placement="topLeft" />
  <TimePicker placement="topRight" />
  <TimePicker />
  <TimePicker placement="bottomRight" />
</div>`,
  ),
  render: () => (
    <div className="grid max-w-xs gap-3 pt-60">
      <TimePicker placement="topLeft" />
      <TimePicker placement="topRight" />
      <TimePicker placement="bottomLeft" />
      <TimePicker placement="bottomRight" />
    </div>
  ),
};
