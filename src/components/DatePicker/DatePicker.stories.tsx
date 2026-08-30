import { useState } from "react";
import dayjs from "dayjs";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { DatePicker } from "./DatePicker";
import type {
  DatePickerModeType,
  DatePickerPlacementType,
  DatePickerSizeType,
  DatePickerValueType,
  DatePickerVariantType,
  DateRangeValueType,
} from "./DatePicker.types";

const datePickerModes: DatePickerModeType[] = ["date", "month", "year"];
const datePickerSizes: DatePickerSizeType[] = ["lg", "md"];
const datePickerVariants: DatePickerVariantType[] = ["default", "filled"];
const datePickerPlacements: DatePickerPlacementType[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];
const datePickerValueTypes = ["string", "string[]", "null"];
const dateRangeValueTypes = ["[string | null, string | null]"];

const storySource = (id: string, code: string) => ({
  docs: {
    description: { story: storyDescriptions[id] },
    source: { code: withStoryImports(code) },
  },
});

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    picker: {
      name: "선택 단위",
      control: "select",
      options: datePickerModes,
    },
    size: { name: "크기", control: "select", options: datePickerSizes },
    variant: {
      name: "표현 방식",
      control: "select",
      options: datePickerVariants,
    },
    placeholder: { name: "안내 문구", control: "text" },
    label: { name: "레이블", control: "text" },
    errorMessage: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    allowClear: { name: "지우기", control: "boolean" },
    readOnly: { name: "읽기 전용", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    width: { name: "가로 길이", control: "number" },
    className: { control: false },
    disabledDate: { control: false },
    onChange: { control: false },
    onOpenChange: { control: false },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "달력에서 날짜·월·연도를 선택할 수 있어요.  \n단일·다중·범위·시간 선택과 비활성 날짜를 설정할 수 있어요.",
      },
      page: () => (
        <div className="datepicker-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### DatePicker

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 선택값을 외부에서 관리해요. | [\`DatePickerValueType\`](#date-picker-value-type) | - |
| \`defaultValue\` | 처음 선택할 값을 설정해요. | [\`DatePickerValueType\`](#date-picker-value-type) | - |
| \`placeholder\` | 선택 전 안내 문구를 설정해요. | \`string\` | \`날짜를 선택하세요\` |
| \`picker\` | 날짜 선택 단위를 설정해요. | [\`DatePickerModeType\`](#date-picker-mode-type) | \`date\` |
| \`format\` | 선택값을 화면에 표시할 형식을 설정해요. | \`string \\| (value) => string\` | - |
| \`size\` | DatePicker의 크기를 설정해요. | [\`DatePickerSizeType\`](#date-picker-size-type) | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | [\`DatePickerVariantType\`](#date-picker-variant-type) | \`default\` |
| \`allowClear\` | 선택값을 지우는 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`disabled\` | 날짜 선택과 열기 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 선택값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`width\` | DatePicker의 가로 길이를 설정해요. | \`number\` | \`100%\` |
| \`multiple\` | 여러 날짜를 선택해요. | \`boolean\` | \`false\` |
| \`order\` | 여러 선택값을 날짜 순서로 정렬해요. | \`boolean\` | \`true\` |
| \`minDate\` | 선택할 수 있는 최소 날짜를 설정해요. | \`string\` | - |
| \`maxDate\` | 선택할 수 있는 최대 날짜를 설정해요. | \`string\` | - |
| \`disabledDate\` | 선택할 수 없는 날짜를 반환해요. | \`(date: Date) => boolean\` | - |
| \`showNow\` | 오늘로 이동하는 버튼을 표시해요. | \`boolean\` | \`date\`일 때 \`true\` |
| \`showTime\` | 날짜와 함께 시간을 선택해요. | \`boolean\` \\| [\`DatePickerShowTime\`](#date-picker-show-time) | \`false\` |
| \`needConfirm\` | 확인을 눌러야 선택값을 반영해요. | \`boolean\` | \`false\` |
| \`presets\` | 빠르게 선택할 날짜 목록을 설정해요. | [\`DatePickerPreset[]\`](#date-picker-preset) | - |
| \`cellRender\` | 날짜 셀의 내용을 직접 구성해요. | \`(date, origin) => ReactNode\` | - |
| \`pickerValue\` | 달력 패널의 기준 날짜를 외부에서 관리해요. | \`string\` | - |
| \`defaultPickerValue\` | 달력이 처음 보여줄 기준 날짜를 설정해요. | \`string\` | - |
| \`open\` | 달력 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 달력을 표시할지 설정해요. | \`boolean\` | \`false\` |
| \`placement\` | 달력이 표시될 위치를 설정해요. | [\`DatePickerPlacementType\`](#date-picker-placement-type) | \`bottomLeft\` |
| \`label\` | DatePicker 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorMessage\` | DatePicker 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 최종 선택값이 바뀔 때 실행해요. | \`(value) => void\` | - |
| \`onCalendarChange\` | 달력에서 값을 선택할 때 실행해요. | \`(value) => void\` | - |
| \`onClear\` | 선택값을 지울 때 실행할 함수예요. | \`() => void\` | - |
| \`onConfirm\` | 확인 버튼을 누를 때 실행할 함수예요. | \`(value) => void\` | - |
| \`onPanelChange\` | 보고 있는 달·연도가 바뀔 때 실행해요. | \`(value, mode) => void\` | - |
| \`onOpenChange\` | 달력이 열리거나 닫힐 때 실행해요. | \`(open: boolean) => void\` | - |

<h3 id="date-picker-show-time">DatePickerShowTime</h3>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`defaultOpenValue\` | 처음 열었을 때 기준 시간을 설정해요. | \`string\` | \`00:00:00\` |
| \`format\` | 시간 표시 형식을 설정해요. | \`string\` | \`HH:mm:ss\` |
| \`use12Hours\` | 12시간 형식으로 표시해요. | \`boolean\` | \`false\` |
| \`showSecond\` | 초 선택 열을 표시해요. | \`boolean\` | \`true\` |
| \`hourStep\` | 시간 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`minuteStep\` | 분 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`secondStep\` | 초 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`disabledTime\` | 선택할 수 없는 시간을 설정해요. | \`() =>\` [\`DisabledTime\`](#disabled-time) | - |
| \`hideDisabled\` | 선택할 수 없는 시간 항목을 숨겨요. | \`boolean\` | \`false\` |
| \`changeOnScroll\` | 시간 목록을 스크롤할 때 값을 변경해요. | \`boolean\` | \`false\` |

<h3 id="disabled-time">DisabledTime</h3>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`disabledHours\` | 선택할 수 없는 시 목록을 반환해요. | \`() => number[]\` | - |
| \`disabledMinutes\` | 선택할 수 없는 분을 반환해요. | \`(selectedHour: number) => number[]\` | - |
| \`disabledSeconds\` | 선택할 수 없는 초를 반환해요. | \`(selectedHour: number, selectedMinute: number) => number[]\` | - |

<h3 id="date-picker-preset">DatePickerPreset</h3>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 빠른 선택 항목에 표시할 내용을 설정해요. | \`ReactNode\` | - |
| \`value\` | 날짜나 반환 함수를 설정해요. | \`string \\| () => string\` | - |

<h3 id="date-range-preset">DateRangePreset</h3>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 빠른 범위 항목의 내용을 설정해요. | \`ReactNode\` | - |
| \`value\` | 날짜 범위나 반환 함수를 설정해요. | [\`DateRangeValueType\`](#date-range-value-type) \\| \`() =>\` [\`DateRangeValueType\`](#date-range-value-type) | - |

<h3 id="range-picker">RangePicker</h3>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 시작일과 종료일을 관리해요. | [\`DateRangeValueType\`](#date-range-value-type) | - |
| \`defaultValue\` | 처음 선택할 시작일과 종료일을 설정해요. | [\`DateRangeValueType\`](#date-range-value-type) | - |
| \`placeholder\` | 두 입력 영역의 안내 문구를 설정해요. | \`[string, string]\` | \`['시작 날짜', '종료 날짜']\` |
| \`presets\` | 빠르게 선택할 날짜 범위를 설정해요. | [\`DateRangePreset[]\`](#date-range-preset) | - |
| \`onChange\` | 날짜 범위가 바뀔 때 실행할 함수예요. | \`(value) => void\` | - |
| \`onCalendarChange\` | 시작일이나 종료일을 선택할 때 실행해요. | \`(value, info) => void\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="date-picker-mode-type">DatePickerModeType</h3>
          <p>선택할 날짜 단위를 정해요.</p>
          <TypeTokens values={datePickerModes} />
          <h3 id="date-picker-size-type">DatePickerSizeType</h3>
          <p>DatePicker 크기를 선택해요.</p>
          <TypeTokens values={datePickerSizes} />
          <h3 id="date-picker-variant-type">DatePickerVariantType</h3>
          <p>배경과 테두리 표현을 선택해요.</p>
          <TypeTokens values={datePickerVariants} />
          <h3 id="date-picker-placement-type">DatePickerPlacementType</h3>
          <p>달력 패널 위치를 선택해요.</p>
          <TypeTokens values={datePickerPlacements} />
          <h3 id="date-picker-value-type">DatePickerValueType</h3>
          <p>단일 또는 다중 날짜 선택값이에요.</p>
          <TypeTokens values={datePickerValueTypes} />
          <h3 id="date-range-value-type">DateRangeValueType</h3>
          <p>시작일과 종료일로 구성된 날짜 범위 값이에요.</p>
          <TypeTokens values={dateRangeValueTypes} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    picker: "date",
    placeholder: "날짜를 선택하세요",
    label: "",
    errorMessage: "",
    size: "md",
    variant: "default",
    width: 320,
    required: false,
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--basic",
      `<div className="max-w-xs">
  <DatePicker />
</div>`,
    ),
    controls: {
      disable: false,
      include: [
        "선택 단위",
        "크기",
        "표현 방식",
        "안내 문구",
        "레이블",
        "오류 문구",
        "필수 표시",
        "지우기",
        "읽기 전용",
        "비활성",
        "가로 길이",
      ],
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  args: {
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--sizes",
      `<div className="grid max-w-xs gap-3">
  <div className="grid gap-1">
    <span className="text-xs text-[#777]">lg</span>
    <DatePicker size="lg" />
  </div>
  <div className="grid gap-1">
    <span className="text-xs text-[#777]">md</span>
    <DatePicker />
  </div>
</div>`,
    ),
    controls: {
      include: ["표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <div className="grid gap-1">
        <span className="text-xs text-[#777]">lg</span>
        <DatePicker {...args} size="lg" />
      </div>
      <div className="grid gap-1">
        <span className="text-xs text-[#777]">md</span>
        <DatePicker {...args} size="md" />
      </div>
    </div>
  ),
};

export const Widths: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--widths",
      `<div className="grid max-w-xl gap-3">
  <DatePicker placeholder="부모 너비 100%" />
  <DatePicker width={240} placeholder="가로 길이 240px" />
  <DatePicker width={320} placeholder="가로 길이 320px" />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성"],
    },
  },
  render: (args) => (
    <div className="grid max-w-xl gap-3">
      <DatePicker {...args} placeholder="부모 너비 100%" />
      <DatePicker {...args} width={240} placeholder="가로 길이 240px" />
      <DatePicker {...args} width={320} placeholder="가로 길이 320px" />
    </div>
  ),
};

export const Variants: Story = {
  args: {
    size: "md",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--variants",
      `<div className="grid max-w-xs gap-3">
  <DatePicker placeholder="기본" />
  <DatePicker variant="filled" placeholder="채움" />
</div>`,
    ),
    controls: {
      include: ["크기", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} variant="default" placeholder="기본" />
      <DatePicker {...args} variant="filled" placeholder="채움" />
    </div>
  ),
};

export const States: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storySource(
      "components-datepicker--states",
      `<div className="grid max-w-xs gap-3">
  <DatePicker placeholder="기본" />
  <DatePicker readOnly defaultValue="2026-08-10" />
  <DatePicker disabled defaultValue="2026-08-11" />
</div>`,
    ),
    controls: { include: ["크기", "표현 방식", "가로 길이"] },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} placeholder="기본" />
      <DatePicker {...args} readOnly defaultValue="2026-08-10" />
      <DatePicker {...args} disabled defaultValue="2026-08-11" />
    </div>
  ),
};

export const LabelAndError: Story = {
  args: {
    label: "예약일",
    required: true,
    errorMessage: "예약일을 선택해 주세요.",
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--label-and-error",
      `<div className="max-w-xs">
  <DatePicker label="예약일" required errorMessage="예약일을 선택해 주세요." />
</div>`,
    ),
    controls: {
      include: [
        "크기",
        "표현 방식",
        "레이블",
        "오류 문구",
        "필수 표시",
        "지우기",
        "읽기 전용",
        "비활성",
        "가로 길이",
      ],
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker {...args} />
    </div>
  ),
};

export const PickerTypes: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--picker-types",
      `<div className="grid max-w-xs gap-3">
  <DatePicker />
  <DatePicker picker="month" />
  <DatePicker picker="year" />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} />
      <DatePicker {...args} picker="month" />
      <DatePicker {...args} picker="year" />
    </div>
  ),
};

export const Format: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--format",
      `<div className="grid max-w-xs gap-3">
  <DatePicker defaultValue="2026-08-11" format="YYYY년 MM월 DD일" />
  <DatePicker defaultValue="2026-08-11" format={(value) => '선택일: ' + value} />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} defaultValue="2026-08-11" format="YYYY년 MM월 DD일" />
      <DatePicker
        {...args}
        defaultValue="2026-08-11"
        format={(pickerValue) => `선택일: ${pickerValue}`}
      />
    </div>
  ),
};

export const DateLimits: Story = {
  args: {
    size: "md",
    variant: "default",
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--date-limits",
      `import dayjs from 'dayjs';

<div className="grid max-w-xs gap-3">
  <DatePicker
    defaultPickerValue="2026-08-01"
    minDate="2026-08-05"
    maxDate="2026-08-20"
    placeholder="8월 5일 ~ 20일 선택 가능"
  />
  <DatePicker
    disabledDate={(date) => dayjs(date).isBefore(dayjs(), 'day')}
    placeholder="오늘 이전 선택 불가"
  />
</div>`,
    ),
    controls: { include: ["크기", "표현 방식", "읽기 전용", "비활성", "가로 길이"] },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker
        {...args}
        defaultPickerValue="2026-08-01"
        minDate="2026-08-05"
        maxDate="2026-08-20"
        placeholder="8월 5일 ~ 20일 선택 가능"
      />
      <DatePicker
        {...args}
        disabledDate={(date) => dayjs(date).isBefore(dayjs(), "day")}
        placeholder="오늘 이전 선택 불가"
      />
    </div>
  ),
};

export const Presets: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--presets",
      `import dayjs from 'dayjs';

<div className="max-w-xs">
  <DatePicker
    needConfirm
    presets={[
      { label: '오늘', value: () => dayjs().format('YYYY-MM-DD') },
      { label: '프로젝트 시작일', value: '2026-08-17' },
    ]}
  />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker
        {...args}
        needConfirm
        presets={[
          { label: "오늘", value: () => dayjs().format("YYYY-MM-DD") },
          { label: "프로젝트 시작일", value: "2026-08-17" },
        ]}
      />
    </div>
  ),
};

export const Multiple: Story = {
  args: {
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--multiple",
      `<div className="grid max-w-lg gap-6">
  {(['default', 'filled'] as const).map((variant) => (
    <div key={variant} className="grid gap-3">
      <span className="text-sm font-medium text-[#666]">{variant}</span>
      {(['lg', 'md'] as const).map((size) => (
        <DatePicker
          key={size}
          multiple
          defaultValue={['2026-08-11', '2026-08-14']}
          size={size}
          variant={variant}
        />
      ))}
    </div>
  ))}
</div>`,
    ),
    controls: { include: ["지우기", "읽기 전용", "비활성", "가로 길이"] },
  },
  render: (args) => (
    <div className="grid max-w-lg gap-6">
      {(["default", "filled"] as const).map((variant) => (
        <div key={variant} className="grid gap-3">
          <span className="text-sm font-medium text-[#666]">{variant}</span>
          {(["lg", "md"] as const).map((size) => (
            <DatePicker
              {...args}
              key={size}
              multiple
              defaultValue={["2026-08-11", "2026-08-14"]}
              size={size}
              variant={variant}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const ControlledMultiple: Story = {
  args: {
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--controlled-multiple",
      `function ControlledMultipleDatePicker() {
  const [dates, setDates] = useState<DatePickerValueType>(['2026-08-11', '2026-08-14']);

  return (
    <div className="max-w-lg">
      <DatePicker
        multiple
        value={dates}
        onChange={setDates}
      />
    </div>
  );
}`,
    ),
    controls: { include: ["지우기", "읽기 전용", "비활성", "가로 길이"] },
  },
  render: function ControlledMultipleStory(args) {
    const [dates, setDates] = useState<DatePickerValueType>(["2026-08-11", "2026-08-14"]);

    return (
      <div className="max-w-lg">
        <DatePicker {...args} multiple value={dates} onChange={setDates} />
      </div>
    );
  },
};

export const ShowTimeAndConfirm: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--show-time-and-confirm",
      `<div className="max-w-xs">
  <DatePicker showTime={{ minuteStep: 5, showSecond: false }} needConfirm />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker {...args} showTime={{ minuteStep: 5, showSecond: false }} needConfirm />
    </div>
  ),
};

export const MultipleShowTime: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--multiple-show-time",
      `<div className="max-w-lg">
  <DatePicker
    multiple
    defaultValue={['2026-08-11 09:00', '2026-08-14 09:00']}
    showTime={{ format: 'HH:mm', showSecond: false, minuteStep: 15 }}
  />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="max-w-lg">
      <DatePicker
        {...args}
        multiple
        defaultValue={["2026-08-11 09:00", "2026-08-14 09:00"]}
        showTime={{ format: "HH:mm", showSecond: false, minuteStep: 15 }}
      />
    </div>
  ),
};

export const TimeFormats: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--time-formats",
      `<div className="grid max-w-xs gap-3">
  <DatePicker
    placeholder="시·분·초 형식"
    showTime={{ format: 'HH:mm:ss' }}
  />
  <DatePicker
    placeholder="시·분 형식"
    showTime={{ format: 'HH:mm', showSecond: false }}
  />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} placeholder="시·분·초 형식" showTime={{ format: "HH:mm:ss" }} />
      <DatePicker
        {...args}
        placeholder="시·분 형식"
        showTime={{ format: "HH:mm", showSecond: false }}
      />
    </div>
  ),
};

export const Use12Hours: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--use-12-hours",
      `<div className="grid max-w-xs gap-3">
  <DatePicker
    placeholder="24시간 형식"
    showTime={{ use12Hours: false, showSecond: false }}
  />
  <DatePicker
    placeholder="오전·오후 형식"
    showTime={{ use12Hours: true, showSecond: true }}
  />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker
        {...args}
        placeholder="24시간 형식"
        showTime={{ use12Hours: false, showSecond: false }}
      />
      <DatePicker
        {...args}
        placeholder="오전·오후 형식"
        showTime={{ use12Hours: true, showSecond: true }}
      />
    </div>
  ),
};

export const TimeLimits: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--time-limits",
      `<div className="grid max-w-xs gap-3">
  <div>
    <p className="mb-2 text-sm text-[#777]">비활성 시간 표시</p>
    <DatePicker
      placeholder="업무 시간을 선택하세요"
      showTime={{
        format: 'HH:mm',
        showSecond: false,
        minuteStep: 30,
        hideDisabled: false,
        disabledTime: () => ({
          disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 21, 22, 23],
        }),
      }}
    />
  </div>
  <div>
    <p className="mb-2 text-sm text-[#777]">비활성 시간 숨김</p>
    <DatePicker
      placeholder="업무 시간을 선택하세요"
      showTime={{
        format: 'HH:mm',
        showSecond: false,
        minuteStep: 30,
        hideDisabled: true,
        disabledTime: () => ({
          disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 21, 22, 23],
        }),
      }}
    />
  </div>
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      {[false, true].map((hideDisabled) => (
        <div key={String(hideDisabled)}>
          <p className="mb-2 text-sm text-[#777]">비활성 시간 {hideDisabled ? "숨김" : "표시"}</p>
          <DatePicker
            {...args}
            placeholder="업무 시간을 선택하세요"
            showTime={{
              format: "HH:mm",
              showSecond: false,
              minuteStep: 30,
              hideDisabled,
              disabledTime: () => ({
                disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 21, 22, 23],
              }),
            }}
          />
        </div>
      ))}
    </div>
  ),
};

export const CustomCell: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--custom-cell",
      `import dayjs from 'dayjs';

<div className="max-w-xs">
  <DatePicker
    cellRender={(date, origin) => {
      const day = dayjs(date).day();

      return (
        <span
          className={day === 0 ? 'text-[#fe5150]' : day === 6 ? 'text-[#0062df]' : ''}
        >
          {origin}
        </span>
      );
    }}
  />
</div>`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker
        {...args}
        cellRender={(date, origin) => {
          const day = dayjs(date).day();

          return (
            <span className={day === 0 ? "text-[#fe5150]" : day === 6 ? "text-[#0062df]" : ""}>
              {origin}
            </span>
          );
        }}
      />
    </div>
  ),
};

export const RangePresets: Story = {
  args: {
    size: "md",
    variant: "default",
    disabled: false,
    readOnly: false,
    allowClear: true,
  },
  parameters: {
    ...storySource(
      "components-datepicker--range-presets",
      `import dayjs from 'dayjs';

<div className="max-w-xl">
  <DatePicker.RangePicker
    presets={[
      {
        label: '이번 주',
        value: () => [
          dayjs().startOf('week').format('YYYY-MM-DD'),
          dayjs().endOf('week').format('YYYY-MM-DD'),
        ],
      },
      {
        label: '이번 달',
        value: () => [
          dayjs().startOf('month').format('YYYY-MM-DD'),
          dayjs().endOf('month').format('YYYY-MM-DD'),
        ],
      },
    ]}
  />
</div>`,
    ),
    controls: {
      disable: false,
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: (args) => (
    <div className="max-w-xl">
      <DatePicker.RangePicker
        size={args.size}
        variant={args.variant}
        disabled={args.disabled}
        readOnly={args.readOnly}
        allowClear={args.allowClear}
        width={args.width}
        presets={[
          {
            label: "이번 주",
            value: () => [
              dayjs().startOf("week").format("YYYY-MM-DD"),
              dayjs().endOf("week").format("YYYY-MM-DD"),
            ],
          },
          {
            label: "이번 달",
            value: () => [
              dayjs().startOf("month").format("YYYY-MM-DD"),
              dayjs().endOf("month").format("YYYY-MM-DD"),
            ],
          },
        ]}
      />
    </div>
  ),
};

export const ControlledPanel: Story = {
  args: {
    size: "md",
    variant: "default",
    disabled: false,
    readOnly: false,
    allowClear: true,
  },
  parameters: {
    ...storySource(
      "components-datepicker--controlled-panel",
      `function ControlledDatePanel() {
  const [value, setValue] = useState<DatePickerValueType>('2026-08-15');
  const [pickerValue, setPickerValue] = useState('2026-04-01');

  return (
    <div className="max-w-xs">
      <div className="mb-3 grid gap-1 text-sm text-[#555]">
        <span>선택된 날짜 (value): {value ?? '선택 안 함'}</span>
        <span>달력에서 보고 있는 달 (pickerValue): {pickerValue.slice(0, 7)}</span>
      </div>
      <DatePicker
        value={value}
        pickerValue={pickerValue}
        onChange={(nextValue) => setValue(typeof nextValue === 'string' ? nextValue : null)}
        onPanelChange={setPickerValue}
      />
    </div>
  );
}`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: function ControlledPanelStory(args) {
    const [value, setValue] = useState<DatePickerValueType>("2026-08-15");
    const [pickerValue, setPickerValue] = useState("2026-04-01");
    return (
      <div className="max-w-xs">
        <div className="mb-3 grid gap-1 text-sm text-[#555]">
          <span>선택된 날짜 (value): {value ?? "선택 안 함"}</span>
          <span>달력에서 보고 있는 달 (pickerValue): {pickerValue.slice(0, 7)}</span>
        </div>
        <DatePicker
          {...args}
          value={value}
          pickerValue={pickerValue}
          onChange={(nextValue) => setValue(typeof nextValue === "string" ? nextValue : null)}
          onPanelChange={setPickerValue}
        />
      </div>
    );
  },
};

export const Placements: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-datepicker--placements",
      `<div className="grid max-w-2xl grid-cols-2 gap-3">
  <DatePicker placement="topLeft" />
  <DatePicker placement="topRight" />
  <DatePicker />
  <DatePicker placement="bottomRight" />
</div>`,
    ),
    controls: { include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성"] },
  },
  render: (args) => (
    <div className="grid max-w-2xl grid-cols-2 gap-3">
      <DatePicker {...args} placement="topLeft" />
      <DatePicker {...args} placement="topRight" />
      <DatePicker {...args} />
      <DatePicker {...args} placement="bottomRight" />
    </div>
  ),
};

export const Range: Story = {
  args: {
    size: "md",
    variant: "default",
    disabled: false,
    readOnly: false,
    allowClear: true,
  },
  parameters: {
    ...storySource(
      "components-datepicker--range",
      `function ProjectPeriod() {
  const [period, setPeriod] = useState<DateRangeValueType>([null, null]);

  return (
    <div className="max-w-xl">
      <DatePicker.RangePicker value={period} onChange={setPeriod} />
    </div>
  );
}`,
    ),
    controls: {
      include: ["크기", "표현 방식", "지우기", "읽기 전용", "비활성", "가로 길이"],
    },
  },
  render: function DateRangeStory(args) {
    const [period, setPeriod] = useState<DateRangeValueType>([null, null]);
    return (
      <div className="max-w-xl">
        <DatePicker.RangePicker
          size={args.size}
          variant={args.variant}
          disabled={args.disabled}
          readOnly={args.readOnly}
          allowClear={args.allowClear}
          width={args.width}
          value={period}
          onChange={setPeriod}
        />
      </div>
    );
  },
};
