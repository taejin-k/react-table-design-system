import { useState } from "react";
import dayjs from "dayjs";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { TimePicker } from "./TimePicker";
import type {
  TimePickerPlacementType,
  TimePickerSizeType,
  TimePickerValueType,
  TimePickerVariantType,
} from "./TimePicker.types";

const timePickerSizes: TimePickerSizeType[] = ["lg", "md", "sm"];
const timePickerVariants: TimePickerVariantType[] = ["default", "filled"];
const timePickerPlacements: TimePickerPlacementType[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];
const timePickerValueTypes = ["Dayjs", "Dayjs[]", "null"];

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
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    size: { name: "크기", control: "select", options: ["lg", "md", "sm"] },
    variant: {
      name: "표현 방식",
      control: "select",
      options: timePickerVariants,
    },
    placeholder: { name: "안내 문구", control: "text" },
    label: { name: "레이블", control: "text" },
    errorMessage: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    allowClear: { name: "지우기", control: "boolean" },
    multiple: { name: "다중 선택", control: "boolean" },
    order: { name: "시간순 정렬", control: "boolean" },
    use12Hours: { name: "12시간제", control: "boolean" },
    showSecond: { name: "초", control: "boolean" },
    needConfirm: { name: "확인 버튼", control: "boolean" },
    readOnly: { name: "읽기 전용", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    width: { name: "가로 길이", control: "number" },
    className: { control: false },
    onChange: { control: false },
    onOpenChange: { control: false },
  },
  parameters: {
    controls: { disable: false },
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
| \`value\` | 선택한 시간을 관리해요. | [\`TimePickerValueType\`](#time-picker-value-type) | - |
| \`defaultValue\` | 처음 선택할 시간을 설정해요. | [\`TimePickerValueType\`](#time-picker-value-type) | - |
| \`placeholder\` | 선택 전 안내 문구를 설정해요. | \`string\` | \`시간을 선택하세요\` |
| \`format\` | 표시할 시간 형식을 설정해요. | \`string\` | \`HH:mm:ss\` |
| \`size\` | TimePicker의 크기를 설정해요. | [\`TimePickerSizeType\`](#time-picker-size-type) | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | [\`TimePickerVariantType\`](#time-picker-variant-type) | \`default\` |
| \`use12Hours\` | AM과 PM을 사용하는 12시간제로 표시해요. | \`boolean\` | \`false\` |
| \`showSecond\` | 초 선택 열을 표시해요. | \`boolean\` | \`true\` |
| \`hourStep\` | 시 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`minuteStep\` | 분 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`secondStep\` | 초 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`needConfirm\` | 확인을 눌러야 선택값을 반영해요. | \`boolean\` | 다중 선택은 \`true\`, 그 외 \`false\` |
| \`changeOnScroll\` | 시간 목록을 스크롤할 때 값을 변경해요. | \`boolean\` | \`false\` |
| \`disabledTime\` | 선택할 수 없는 시·분·초를 설정해요. | \`(now: Dayjs) => DisabledTime\` | - |
| \`hideDisabled\` | 비활성 시간 항목을 목록에서 숨겨요. | \`boolean\` | \`false\` |
| \`showNow\` | 현재 시간 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`allowClear\` | 선택값을 지우는 버튼을 표시해요. | \`boolean \\| { clearIcon }\` | \`true\` |
| \`multiple\` | 여러 시간을 선택해요. | \`boolean\` | \`false\` |
| \`order\` | 여러 선택값을 시간순으로 정렬해요. | \`boolean\` | \`true\` |
| \`disabled\` | 시간 선택과 열기 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 선택값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`width\` | TimePicker의 가로 길이를 설정해요. | \`number\` | \`100%\` |
| \`previewValue\` | 항목 hover 중 선택 전 값을 미리 보여줘요. | \`false \\| hover\` | \`false\` |
| \`cellRender\` | 시간 항목의 내용을 직접 구성해요. | <code>(current: number, info: <a href="#time-picker-cell-info">TimePickerCellInfo</a>) =&gt; ReactNode</code> | - |
| \`open\` | 목록 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 시간 목록을 표시할지 설정해요. | \`boolean\` | \`false\` |
| \`placement\` | 목록이 표시될 위치를 설정해요. | [\`TimePickerPlacementType\`](#time-picker-placement-type) | \`bottomLeft\` |
| \`label\` | TimePicker 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorMessage\` | TimePicker 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 선택값과 화면 형식의 문자열을 전달해요. | \`(value: TimePickerValueType, timeString: string \\| string[]) => void\` | - |
| \`onClear\` | 선택값을 지울 때 실행할 함수예요. | \`() => void\` | - |
| \`onOpenChange\` | 목록 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |

### DisabledTime

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`disabledHours\` | 선택할 수 없는 시 목록을 반환해요. | \`() => number[]\` | - |
| \`disabledMinutes\` | 선택한 시에 따라 선택할 수 없는 분 목록을 반환해요. | \`(selectedHour: number) => number[]\` | - |
| \`disabledSeconds\` | 선택한 시와 분에 따라 선택할 수 없는 초 목록을 반환해요. | \`(selectedHour: number, selectedMinute: number) => number[]\` | - |

### <span id="time-picker-cell-info">TimePickerCellInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`originNode\` | 기본 시간 항목이에요. | \`ReactNode\` | - |
| \`subType\` | 항목이 시·분·초 중 무엇인지 알려줘요. | <code>hour &#124; minute &#124; second</code> | - |

          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="time-picker-size-type">TimePickerSizeType</h3>
          <p>TimePicker 크기를 선택해요.</p>
          <TypeTokens values={timePickerSizes} />
          <h3 id="time-picker-variant-type">TimePickerVariantType</h3>
          <p>배경과 테두리 표현을 선택해요.</p>
          <TypeTokens values={timePickerVariants} />
          <h3 id="time-picker-placement-type">TimePickerPlacementType</h3>
          <p>시간 패널 위치를 선택해요.</p>
          <TypeTokens values={timePickerPlacements} />
          <h3 id="time-picker-value-type">TimePickerValueType</h3>
          <p>TimePicker의 선택값이에요.</p>
          <TypeTokens values={timePickerValueTypes} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    size: "md",
    variant: "default",
    placeholder: "시간을 선택하세요",
    label: "",
    errorMessage: "",
    required: false,
    allowClear: true,
    multiple: false,
    order: true,
    use12Hours: false,
    showSecond: true,
    needConfirm: false,
    readOnly: false,
    disabled: false,
    width: 320,
  },
  parameters: {
    ...storySource("components-timepicker--basic", "<TimePicker width={320} />"),
    controls: {
      include: [
        "크기",
        "표현 방식",
        "안내 문구",
        "레이블",
        "오류 문구",
        "필수 표시",
        "지우기",
        "다중 선택",
        "시간순 정렬",
        "12시간제",
        "초",
        "확인 버튼",
        "읽기 전용",
        "비활성",
        "가로 길이",
      ],
    },
  },
  render: (args) => <TimePicker {...args} />,
};

export const Sizes: Story = {
  argTypes: { size: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-timepicker--sizes"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-timepicker--sizes").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <TimePicker size="lg" />
  <TimePicker size="md" />
  <TimePicker size="sm" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <TimePicker {...args} size="lg" />
      <TimePicker {...args} size="md" />
      <TimePicker {...args} size="sm" />
    </div>
  ),
};

export const Widths: Story = {
  parameters: {
    ...storyDescription("components-timepicker--widths"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-timepicker--widths").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-3">
  <TimePicker placeholder="부모 너비 100%" />
  <TimePicker width={240} placeholder="가로 길이 240px" />
  <TimePicker width={320} placeholder="가로 길이 320px" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-xl gap-3">
      <TimePicker placeholder="부모 너비 100%" />
      <TimePicker width={240} placeholder="가로 길이 240px" />
      <TimePicker width={320} placeholder="가로 길이 320px" />
    </div>
  ),
};

export const States: Story = {
  args: {
    size: "md",
    variant: "default",
  },
  parameters: {
    ...storyDescription("components-timepicker--states"),
    controls: {
      disable: false,
      include: ["크기", "표현 방식", "가로 길이"],
    },
    docs: {
      ...storyDescription("components-timepicker--states").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <TimePicker placeholder="기본" />
  <TimePicker readOnly defaultValue={dayjs('2026-08-20 08:30:00')} />
  <TimePicker disabled defaultValue={dayjs('2026-08-20 09:00:00')} />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <TimePicker {...args} placeholder="기본" />
      <TimePicker {...args} readOnly defaultValue={dayjs("2026-08-20 08:30:00")} />
      <TimePicker {...args} disabled defaultValue={dayjs("2026-08-20 09:00:00")} />
    </div>
  ),
};

export const Variants: Story = {
  args: {
    size: "md",
    allowClear: true,
    use12Hours: false,
    showSecond: true,
    needConfirm: false,
    readOnly: false,
    disabled: false,
    width: 320,
  },
  argTypes: { placeholder: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-timepicker--variants"),
    controls: {
      include: [
        "크기",
        "지우기",
        "12시간제",
        "초",
        "확인 버튼",
        "읽기 전용",
        "비활성",
        "가로 길이",
      ],
    },
    docs: {
      ...storyDescription("components-timepicker--variants").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <TimePicker placeholder="기본" />
  <TimePicker variant="filled" placeholder="채움" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <TimePicker {...args} placeholder="기본" />
      <TimePicker {...args} variant="filled" placeholder="채움" />
    </div>
  ),
};

export const StaticError: Story = {
  args: {
    size: "md",
    variant: "default",
    allowClear: true,
    use12Hours: false,
    showSecond: true,
    needConfirm: false,
    readOnly: false,
    disabled: false,
  },
  argTypes: {
    label: { control: false, table: { disable: true } },
    errorMessage: { control: false, table: { disable: true } },
    required: { control: false, table: { disable: true } },
    width: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-timepicker--static-error"),
    controls: {
      include: [
        "크기",
        "표현 방식",
        "지우기",
        "12시간제",
        "초",
        "확인 버튼",
        "읽기 전용",
        "비활성",
      ],
    },
    docs: {
      ...storyDescription("components-timepicker--static-error").docs,
      source: {
        code: withStoryImports(`<TimePicker
  label="업무 시작"
  required
  width={320}
  errorMessage="시간을 선택해 주세요."
/>`),
      },
    },
  },
  render: (args) => (
    <TimePicker
      {...args}
      label="업무 시작"
      required
      width={320}
      errorMessage="시간을 선택해 주세요."
    />
  ),
};

export const FormatAndSteps: Story = {
  parameters: {
    ...storyDescription("components-timepicker--format-and-steps"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-timepicker--format-and-steps").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <TimePicker use12Hours />
  <TimePicker format="HH시 mm분" minuteStep={10} />
  <TimePicker minuteStep={15} needConfirm />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <TimePicker {...args} use12Hours />
      <TimePicker {...args} format="HH시 mm분" minuteStep={10} />
      <TimePicker {...args} minuteStep={15} needConfirm />
    </div>
  ),
};

export const Multiple: Story = {
  parameters: {
    ...storySource(
      "components-timepicker--multiple",
      `<TimePicker
  multiple
  width={420}
  defaultValue={[
    dayjs('2026-08-20 09:00:00'),
    dayjs('2026-08-20 13:30:00'),
    dayjs('2026-08-20 18:15:00'),
  ]}
/>`,
    ),
    controls: { disable: true },
  },
  render: () => (
    <TimePicker
      multiple
      width={420}
      defaultValue={[
        dayjs("2026-08-20 09:00:00"),
        dayjs("2026-08-20 13:30:00"),
        dayjs("2026-08-20 18:15:00"),
      ]}
    />
  ),
};

export const DisabledTime: Story = {
  argTypes: { width: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-timepicker--disabled-time"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-timepicker--disabled-time").docs,
      source: {
        code: withStoryImports(`<TimePicker
  width={320}
  disabledTime={() => ({
    disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
    disabledMinutes: (hour) => (hour === 9 ? [0, 10, 20] : []),
  })}
/>`),
      },
    },
  },
  render: (args) => (
    <TimePicker
      {...args}
      width={320}
      disabledTime={() => ({
        disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
        disabledMinutes: (hour) => (hour === 9 ? [0, 10, 20] : []),
      })}
    />
  ),
};

export const HideDisabled: Story = {
  argTypes: { width: { control: false, table: { disable: true } } },
  parameters: {
    ...storySource(
      "components-timepicker--hide-disabled",
      `<TimePicker
  width={320}
  hideDisabled
  disabledTime={() => ({
    disabledHours: () => Array.from({ length: 9 }, (_, index) => index),
  })}
/>`,
    ),
    controls: { disable: true },
  },
  render: (args) => (
    <TimePicker
      {...args}
      width={320}
      hideDisabled
      disabledTime={() => ({ disabledHours: () => Array.from({ length: 9 }, (_, index) => index) })}
    />
  ),
};

export const ShowNow: Story = {
  parameters: {
    ...storySource(
      "components-timepicker--show-now",
      `<div className="grid max-w-xs gap-3">
  <TimePicker />
  <TimePicker showNow={false} />
</div>`,
    ),
    controls: { disable: true },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <TimePicker {...args} />
      <TimePicker {...args} showNow={false} />
    </div>
  ),
};

export const CustomCell: Story = {
  argTypes: { width: { control: false, table: { disable: true } } },
  parameters: {
    ...storySource(
      "components-timepicker--custom-cell",
      `<TimePicker
  width={320}
  minuteStep={10}
  cellRender={(current, { originNode, subType }) => (
    <strong className={subType === 'minute' && current === 30 ? 'text-danger' : ''}>
      {originNode}
    </strong>
  )}
/>`,
    ),
    controls: { disable: true },
  },
  render: (args) => (
    <TimePicker
      {...args}
      width={320}
      minuteStep={10}
      cellRender={(current, { originNode, subType }) => (
        <strong className={subType === "minute" && current === 30 ? "text-danger" : ""}>
          {originNode}
        </strong>
      )}
    />
  ),
};

export const PreviewOnHover: Story = {
  argTypes: { width: { control: false, table: { disable: true } } },
  parameters: {
    ...storySource(
      "components-timepicker--preview-on-hover",
      '<TimePicker width={320} previewValue="hover" />',
    ),
    controls: { disable: true },
  },
  render: (args) => <TimePicker {...args} width={320} previewValue="hover" />,
};

export const ChangeOnScroll: Story = {
  argTypes: { width: { control: false, table: { disable: true } } },
  parameters: {
    ...storySource(
      "components-timepicker--change-on-scroll",
      "<TimePicker width={320} changeOnScroll minuteStep={5} />",
    ),
    controls: { disable: true },
  },
  render: (args) => <TimePicker {...args} width={320} changeOnScroll minuteStep={5} />,
};

export const Controlled: Story = {
  args: {
    size: "md",
    variant: "default",
    disabled: false,
    readOnly: false,
    allowClear: true,
    use12Hours: false,
    showSecond: true,
    needConfirm: false,
    width: 320,
  },
  parameters: {
    ...storySource(
      "components-timepicker--controlled",
      `function ControlledTimePicker() {
  const [time, setTime] = useState<TimePickerValueType>(dayjs('2026-08-20 09:00:00'));

  return <TimePicker width={320} value={time} onChange={setTime} />;
}`,
    ),
    controls: {
      include: [
        "크기",
        "표현 방식",
        "지우기",
        "12시간제",
        "초",
        "확인 버튼",
        "읽기 전용",
        "비활성",
        "가로 길이",
      ],
    },
  },
  render: function ControlledTimeStory(args) {
    const [time, setTime] = useState<TimePickerValueType>(dayjs("2026-08-20 09:00:00"));
    return <TimePicker {...args} value={time} onChange={setTime} />;
  },
};

export const Placements: Story = {
  parameters: {
    ...storySource(
      "components-timepicker--placements",
      `<div className="grid max-w-2xl grid-cols-2 gap-3">
  <TimePicker placement="topLeft" />
  <TimePicker placement="topRight" />
  <TimePicker />
  <TimePicker placement="bottomRight" />
</div>`,
    ),
    controls: { disable: true },
  },
  render: (args) => (
    <div className="grid max-w-2xl grid-cols-2 gap-3">
      <TimePicker {...args} placement="topLeft" />
      <TimePicker {...args} placement="topRight" />
      <TimePicker {...args} placement="bottomLeft" />
      <TimePicker {...args} placement="bottomRight" />
    </div>
  ),
};
