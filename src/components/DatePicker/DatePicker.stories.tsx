import { useState } from "react";
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
  DatePickerVariantType,
} from "./DatePicker.types";

const datePickerModes: DatePickerModeType[] = ["date", "week", "month", "quarter", "year"];
const datePickerSizes: DatePickerSizeType[] = ["lg", "md", "sm"];
const datePickerVariants: DatePickerVariantType[] = ["default", "outlined", "filled"];
const datePickerPlacements: DatePickerPlacementType[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

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
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    picker: {
      name: "선택 단위",
      control: "select",
      options: ["date", "week", "month", "quarter", "year"],
    },
    size: { name: "크기", control: "select", options: ["lg", "md", "sm"] },
    variant: {
      name: "표현 방식",
      control: "select",
      options: ["default", "outlined", "filled"],
    },
    placeholder: { name: "안내 문구", control: "text" },
    label: { name: "레이블", control: "text" },
    errorMessage: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    allowClear: { name: "지우기", control: "boolean" },
    readOnly: { name: "읽기 전용", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    width: { name: "가로 길이", control: "text" },
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
          "달력에서 날짜·주·월·분기·연도를 선택할 수 있어요.  \n단일·다중·범위·시간 선택과 비활성 날짜를 설정할 수 있어요.",
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
| \`value\` | 선택값을 외부에서 관리해요. | \`string \\| string[] \\| null\` | - |
| \`defaultValue\` | 처음 선택할 값을 설정해요. | \`string \\| string[]\` | - |
| \`placeholder\` | 선택 전 안내 문구를 설정해요. | \`string\` | \`날짜를 선택하세요\` |
| \`picker\` | 날짜 선택 단위를 설정해요. | [\`DatePickerModeType\`](#date-picker-mode-type) | \`date\` |
| \`format\` | 선택값을 화면에 표시할 형식을 설정해요. | \`string \\| (value) => string\` | - |
| \`size\` | DatePicker의 크기를 설정해요. | [\`DatePickerSizeType\`](#date-picker-size-type) | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | [\`DatePickerVariantType\`](#date-picker-variant-type) | \`default\` |
| \`allowClear\` | 선택값을 지우는 버튼을 표시해요. | \`boolean \\| { clearIcon }\` | \`true\` |
| \`disabled\` | 날짜 선택과 열기 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 선택값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`width\` | DatePicker의 가로 길이를 설정해요. | \`number \\| string\` | \`100%\` |
| \`multiple\` | 여러 날짜를 선택해요. | \`boolean\` | \`false\` |
| \`order\` | 여러 선택값을 날짜 순서로 정렬해요. | \`boolean\` | \`true\` |
| \`minDate\` | 선택할 수 있는 최소 날짜를 설정해요. | \`string\` | - |
| \`maxDate\` | 선택할 수 있는 최대 날짜를 설정해요. | \`string\` | - |
| \`disabledDate\` | 선택할 수 없는 날짜를 반환해요. | \`(date: Date) => boolean\` | - |
| \`showWeek\` | 달력에 주차 번호를 표시해요. | \`boolean\` | \`false\` |
| \`showNow\` | 오늘로 이동하는 버튼을 표시해요. | \`boolean\` | 날짜 선택 시 \`true\` |
| \`showTime\` | 날짜와 함께 시간을 선택해요. | \`boolean \\| DatePickerShowTime\` | \`false\` |
| \`needConfirm\` | 확인을 눌러야 선택값을 반영해요. | \`boolean\` | \`false\` |
| \`presets\` | 빠르게 선택할 날짜 목록을 설정해요. | \`DatePickerPreset[]\` | - |
| \`cellRender\` | 날짜 셀의 내용을 직접 구성해요. | \`(date, info) => ReactNode\` | - |
| \`renderExtraFooter\` | 달력 아래에 추가 내용을 표시해요. | \`(mode) => ReactNode\` | - |
| \`pickerValue\` | 달력 패널의 기준 날짜를 외부에서 관리해요. | \`string\` | - |
| \`defaultPickerValue\` | 달력이 처음 보여줄 기준 날짜를 설정해요. | \`string\` | - |
| \`open\` | 달력 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 달력을 표시할지 설정해요. | \`boolean\` | \`false\` |
| \`placement\` | 달력이 표시될 위치를 설정해요. | [\`DatePickerPlacementType\`](#date-picker-placement-type) | \`bottomLeft\` |
| \`label\` | DatePicker 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorMessage\` | DatePicker 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 선택값이 바뀔 때 실행할 함수예요. | \`(value, dateString) => void\` | - |
| \`onCalendarChange\` | 달력에서 선택 중인 값이 바뀔 때 실행해요. | \`(value) => void\` | - |
| \`onClear\` | 선택값을 지울 때 실행할 함수예요. | \`() => void\` | - |
| \`onOk\` | 확인 버튼을 누를 때 실행할 함수예요. | \`(value) => void\` | - |
| \`onPanelChange\` | 달력 패널의 기준 날짜가 바뀔 때 실행해요. | \`(value, mode) => void\` | - |
| \`onOpenChange\` | 달력 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |

### DatePickerShowTime

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`defaultOpenValue\` | 처음 열었을 때 기준 시간을 설정해요. | \`string\` | \`00:00:00\` |
| \`format\` | 시간 표시 형식을 설정해요. | \`string\` | \`HH:mm:ss\` |
| \`use12Hours\` | 오전·오후를 사용하는 12시간 형식으로 표시해요. | \`boolean\` | \`false\` |
| \`showSecond\` | 초 선택 열을 표시해요. | \`boolean\` | \`true\` |
| \`hourStep\` | 시간 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`minuteStep\` | 분 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`secondStep\` | 초 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`disabledTime\` | 선택할 수 없는 시간을 설정해요. | \`(now: Date) => DisabledTime\` | - |
| \`hideDisabledOptions\` | 선택할 수 없는 시간 항목을 숨겨요. | \`boolean\` | \`false\` |
| \`changeOnScroll\` | 시간 목록을 스크롤할 때 값을 변경해요. | \`boolean\` | \`false\` |
| \`cellRender\` | 시간 항목의 내용을 직접 구성해요. | \`(current, info) => ReactNode\` | - |

### DatePickerPreset

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 빠른 선택 항목에 표시할 내용을 설정해요. | \`ReactNode\` | - |
| \`value\` | 선택할 날짜나 날짜를 반환하는 함수를 설정해요. | \`string &#124; () => string\` | - |

### RangePicker

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 시작일과 종료일을 관리해요. | \`[string \\| null, string \\| null]\` | - |
| \`defaultValue\` | 처음 선택할 시작일과 종료일을 설정해요. | \`[string \\| null, string \\| null]\` | - |
| \`placeholder\` | 두 입력 영역의 안내 문구를 설정해요. | \`[string, string]\` | \`['시작 날짜', '종료 날짜']\` |
| \`presets\` | 빠르게 선택할 날짜 범위를 설정해요. | \`DateRangePreset[]\` | - |
| \`onChange\` | 날짜 범위가 바뀔 때 실행할 함수예요. | \`(value, dateStrings) => void\` | - |
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
        </div>
      ),
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { placeholder: "날짜를 선택하세요" },
  parameters: {
    ...storySource("components-datepicker--basic", `<DatePicker width={320} />`),
    controls: { disable: false },
  },
  render: (args) => <DatePicker {...args} width={320} />,
};

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-datepicker--sizes"),
    docs: {
      ...storyDescription("components-datepicker--sizes").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <DatePicker size="lg" />
  <DatePicker size="md" />
  <DatePicker size="sm" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} size="lg" />
      <DatePicker {...args} size="md" />
      <DatePicker {...args} size="sm" />
    </div>
  ),
};

export const Widths: Story = {
  args: {
    placeholder: "가로 길이 320px",
    width: 320,
  },
  parameters: {
    ...storyDescription("components-datepicker--widths"),
    controls: { disable: false, include: ["안내 문구", "가로 길이"] },
    docs: {
      ...storyDescription("components-datepicker--widths").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-3">
  <DatePicker placeholder="부모 너비 100%" />
  <DatePicker width={240} placeholder="가로 길이 240px" />
  <DatePicker width={320} placeholder="가로 길이 320px" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-3">
        <DatePicker placeholder="부모 너비 100%" />
        <DatePicker width={240} placeholder="가로 길이 240px" />
        <DatePicker width={320} placeholder="가로 길이 320px" />
      </div>
    ) : (
      <DatePicker {...args} />
    ),
};

export const States: Story = {
  parameters: {
    ...storyDescription("components-datepicker--states"),
    docs: {
      ...storyDescription("components-datepicker--states").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <DatePicker placeholder="기본" />
  <DatePicker readOnly defaultValue="2026-08-10" />
  <DatePicker disabled defaultValue="2026-08-11" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} placeholder="기본" />
      <DatePicker {...args} readOnly defaultValue="2026-08-10" />
      <DatePicker {...args} disabled defaultValue="2026-08-11" />
    </div>
  ),
};

export const Variants: Story = {
  parameters: {
    ...storyDescription("components-datepicker--variants"),
    docs: {
      ...storyDescription("components-datepicker--variants").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <DatePicker placeholder="기본" />
  <DatePicker variant="filled" placeholder="채움" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} placeholder="기본" />
      <DatePicker {...args} variant="filled" placeholder="채움" />
    </div>
  ),
};

export const StaticError: Story = {
  parameters: {
    ...storyDescription("components-datepicker--static-error"),
    docs: {
      ...storyDescription("components-datepicker--static-error").docs,
      source: {
        code: withStoryImports(
          `<DatePicker label="예약일" required errorMessage="예약일을 선택해 주세요." width={320} />`,
        ),
      },
    },
  },
  render: (args) => (
    <DatePicker
      {...args}
      label="예약일"
      required
      errorMessage="예약일을 선택해 주세요."
      width={320}
    />
  ),
};

export const PickerTypes: Story = {
  parameters: {
    ...storyDescription("components-datepicker--picker-types"),
    docs: {
      ...storyDescription("components-datepicker--picker-types").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <DatePicker />
  <DatePicker picker="week" />
  <DatePicker picker="month" />
  <DatePicker picker="quarter" />
  <DatePicker picker="year" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <DatePicker {...args} />
      <DatePicker {...args} picker="week" />
      <DatePicker {...args} picker="month" />
      <DatePicker {...args} picker="quarter" />
      <DatePicker {...args} picker="year" />
    </div>
  ),
};

export const Format: Story = {
  parameters: {
    ...storyDescription("components-datepicker--format"),
    docs: {
      ...storyDescription("components-datepicker--format").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <DatePicker defaultValue="2026-08-11" format="YYYY년 MM월 DD일" />
  <DatePicker defaultValue="2026-08-11" format={(value) => '선택일: ' + value} />
</div>`),
      },
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

export const MinMaxDate: Story = {
  parameters: storySource(
    "components-datepicker--min-max-date",
    `<div className="max-w-xs">
  <DatePicker minDate="2026-08-05" maxDate="2026-08-20" />
</div>`,
  ),
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker {...args} minDate="2026-08-05" maxDate="2026-08-20" />
    </div>
  ),
};

export const Presets: Story = {
  parameters: storySource(
    "components-datepicker--presets",
    `<div className="max-w-xs">
  <DatePicker
    presets={[
      { label: '오늘', value: '2026-08-11' },
      { label: '프로젝트 시작일', value: '2026-08-17' },
    ]}
  />
</div>`,
  ),
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker
        {...args}
        presets={[
          { label: "오늘", value: "2026-08-11" },
          { label: "프로젝트 시작일", value: "2026-08-17" },
        ]}
      />
    </div>
  ),
};

export const Multiple: Story = {
  parameters: storySource(
    "components-datepicker--multiple",
    `<div className="max-w-md">
  <DatePicker multiple defaultValue={["2026-08-11", "2026-08-14"]} />
</div>`,
  ),
  render: (args) => (
    <div className="max-w-md">
      <DatePicker {...args} multiple defaultValue={["2026-08-11", "2026-08-14"]} />
    </div>
  ),
};

export const ShowTimeAndConfirm: Story = {
  parameters: storySource(
    "components-datepicker--show-time-and-confirm",
    `<div className="max-w-xs">
  <DatePicker showTime={{ minuteStep: 5, showSecond: false }} needConfirm />
</div>`,
  ),
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker {...args} showTime={{ minuteStep: 5, showSecond: false }} needConfirm />
    </div>
  ),
};

export const WeekNumber: Story = {
  parameters: storySource(
    "components-datepicker--week-number",
    `<div className="max-w-xs">
  <DatePicker showWeek />
</div>`,
  ),
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker {...args} showWeek />
    </div>
  ),
};

export const CustomCell: Story = {
  parameters: storySource(
    "components-datepicker--custom-cell",
    `<div className="max-w-xs">
  <DatePicker
    cellRender={(date, { originNode }) => (
      <span className={date.getDay() === 0 ? 'text-[#fe5150]' : ''}>
        {originNode}
      </span>
    )}
  />
</div>`,
  ),
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker
        {...args}
        cellRender={(date, { originNode }) => (
          <span className={date.getDay() === 0 ? "text-[#fe5150]" : ""}>{originNode}</span>
        )}
      />
    </div>
  ),
};

export const ExtraFooter: Story = {
  parameters: storySource(
    "components-datepicker--extra-footer",
    `<div className="max-w-xs">
  <DatePicker
    renderExtraFooter={(mode) => (
      <span className="text-xs text-[#777]">현재 패널: {mode}</span>
    )}
  />
</div>`,
  ),
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker
        {...args}
        renderExtraFooter={(mode) => <span className="text-xs text-[#777]">현재 패널: {mode}</span>}
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
    width: "100%",
  },
  parameters: {
    ...storySource(
      "components-datepicker--range-presets",
      `<div className="max-w-xl">
  <DatePicker.RangePicker
    presets={[
      { label: '이번 주', value: ['2026-08-10', '2026-08-16'] },
      { label: '이번 달', value: ['2026-08-01', '2026-08-31'] },
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
          { label: "이번 주", value: ["2026-08-10", "2026-08-16"] },
          { label: "이번 달", value: ["2026-08-01", "2026-08-31"] },
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
  parameters: storySource(
    "components-datepicker--controlled-panel",
    `function ControlledDatePanel() {
  const [panelValue, setPanelValue] = useState('2026-08-01');

  return (
    <div className="max-w-xs">
      <DatePicker pickerValue={panelValue} onPanelChange={setPanelValue} />
    </div>
  );
}`,
  ),
  render: function ControlledPanelStory(args) {
    const [panelValue, setPanelValue] = useState("2026-08-01");
    return (
      <div className="max-w-xs">
        <DatePicker {...args} pickerValue={panelValue} onPanelChange={setPanelValue} />
      </div>
    );
  },
};

export const Placements: Story = {
  parameters: storySource(
    "components-datepicker--placements",
    `<div className="grid max-w-2xl grid-cols-2 gap-3">
  <DatePicker placement="topLeft" />
  <DatePicker placement="topRight" />
  <DatePicker />
  <DatePicker placement="bottomRight" />
</div>`,
  ),
  render: (args) => (
    <div className="grid max-w-2xl grid-cols-2 gap-3">
      <DatePicker {...args} placement="topLeft" />
      <DatePicker {...args} placement="topRight" />
      <DatePicker {...args} placement="bottomLeft" />
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
    width: "100%",
  },
  parameters: {
    ...storyDescription("components-datepicker--range"),
    docs: {
      ...storyDescription("components-datepicker--range").docs,
      source: {
        code: withStoryImports(`function ProjectPeriod() {
  const [period, setPeriod] = useState<[string | null, string | null]>([null, null]);

  return (
    <div className="max-w-xl">
      <DatePicker.RangePicker value={period} onChange={setPeriod} />
    </div>
  );
}`),
      },
    },
  },
  render: function DateRangeStory(args) {
    const [period, setPeriod] = useState<[string | null, string | null]>([null, null]);
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

export const DisabledDate: Story = {
  parameters: {
    ...storyDescription("components-datepicker--disabled-date"),
    docs: {
      ...storyDescription("components-datepicker--disabled-date").docs,
      source: {
        code: withStoryImports(`<div className="max-w-xs">
  <DatePicker disabledDate={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <DatePicker
        {...args}
        disabledDate={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
      />
    </div>
  ),
};
