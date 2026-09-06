import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { TimePicker } from "./TimePicker";
import type {
  TimePickerPlacementType,
  TimePickerSizeType,
  TimePickerVariantType,
} from "./TimePicker.types";

const timePickerSizes: TimePickerSizeType[] = ["lg", "md"];
const timePickerVariants: TimePickerVariantType[] = ["default", "filled"];
const timePickerPlacements: TimePickerPlacementType[] = [
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
  title: "Components/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    size: { name: "크기", control: "select", options: timePickerSizes },
    variant: {
      name: "표현 방식",
      control: "select",
      options: timePickerVariants,
    },
    placeholder: { name: "placeholder", control: "text" },
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
          "TimePicker는 입력창과 목록에서 시·분·초를 선택할 때 사용해요.  \n선택 불가 시간·12시간제·시간 간격·확인 버튼과 다중 선택을 지원해요.",
      },
      page: () => (
        <div className="timepicker-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### TimePicker

TimePicker는 시간을 선택하고 입력값으로 표시해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 선택한 시간을 관리해요. | \`Dayjs \\| undefined\` (multiple: \`Dayjs[]\`) | - |
| \`defaultValue\` | 처음 선택할 시간을 설정해요. | \`Dayjs \\| undefined\` (multiple: \`Dayjs[]\`) | - |
| \`placeholder\` | 선택 전 표시할 placeholder를 설정해요. | \`string\` | \`시간을 선택하세요\` |
| \`format\` | 표시할 시간 형식을 설정해요. | \`string\` | \`HH:mm:ss\` |
| \`size\` | TimePicker의 크기를 설정해요. | [\`TimePickerSizeType\`](#time-picker-size-type) | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | [\`TimePickerVariantType\`](#time-picker-variant-type) | \`default\` |
| \`use12Hours\` | AM과 PM을 사용하는 12시간제로 표시해요. | \`boolean\` | \`false\` |
| \`showSecond\` | 초 선택 열을 표시해요. | \`boolean\` | \`true\` |
| \`hourStep\` | 시 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`minuteStep\` | 분 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`secondStep\` | 초 선택 간격을 설정해요. | \`number\` | \`1\` |
| \`needConfirm\` | 확인을 눌러야 선택값을 반영해요. | \`boolean\` | 다중 선택은 \`true\` |
| \`disabledTime\` | 선택할 수 없는 시·분·초를 설정해요. | <code>(now: Dayjs) =&gt; <a href="#disabled-time">DisabledTime</a></code> | - |
| \`hideDisabled\` | 비활성 시간 항목을 목록에서 숨겨요. | \`boolean\` | \`false\` |
| \`showNow\` | 현재 시간 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`allowClear\` | 선택값을 지우는 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`multiple\` | 여러 시간을 선택해요. | \`boolean\` | \`false\` |
| \`order\` | 여러 선택값을 시간순으로 정렬해요. | \`boolean\` | \`true\` |
| \`disabled\` | 시간 선택과 열기 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 선택값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`width\` | TimePicker의 가로 길이를 설정해요. | \`number\` | \`100%\` |
| \`cellRender\` | 시간 항목의 내용을 직접 구성해요. | <code>(current: number, info: <a href="#time-picker-cell-info">TimePickerCellInfo</a>) =&gt; ReactNode</code> | - |
| \`open\` | 목록 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 시간 목록을 표시할지 설정해요. | \`boolean\` | \`false\` |
| \`placement\` | 목록이 표시될 위치를 설정해요. | [\`TimePickerPlacementType\`](#time-picker-placement-type) | \`bottomLeft\` |
| \`label\` | TimePicker 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorMessage\` | 오류 문구를 표시하거나 선택값을 검사해요. | \`ReactNode \\| ((value: Dayjs \\| Dayjs[] \\| undefined) => string \\| Promise<string>)\` | - |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 선택값과 화면 형식의 문자열을 전달해요. | \`(value: Dayjs \\| Dayjs[] \\| undefined, timeString: string \\| string[]) => void\` | - |
| \`onClear\` | 선택값을 지울 때 실행할 함수예요. | \`() => void\` | - |
| \`onOpenChange\` | 목록 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |

### <span id="disabled-time">DisabledTime</span>

DisabledTime은 TimePicker에서 선택할 수 없는 시, 분과 초를 정의해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`disabledHours\` | 선택할 수 없는 시 목록을 반환해요. | \`() => number[]\` | - |
| \`disabledMinutes\` | 선택한 시에 따라 선택할 수 없는 분 목록을 반환해요. | \`(selectedHour: number) => number[]\` | - |
| \`disabledSeconds\` | 선택한 시와 분에 따라 선택할 수 없는 초 목록을 반환해요. | \`(selectedHour: number, selectedMinute: number) => number[]\` | - |

### <span id="time-picker-cell-info">TimePickerCellInfo</span>

TimePickerCellInfo는 시간 셀을 직접 렌더링할 때 받는 정보예요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`originNode\` | 기본 시간 항목이에요. | \`ReactNode\` | - |
| \`subType\` | 항목이 시·분·초 중 무엇인지 알려줘요. | \`hour \\| minute \\| second\` | - |

          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="time-picker-size-type">TimePickerSizeType</h3>
          <p>TimePickerSizeType은 TimePicker의 높이와 글자 크기를 구분해요.</p>
          <TypeTokens values={timePickerSizes} />
          <h3 id="time-picker-variant-type">TimePickerVariantType</h3>
          <p>TimePickerVariantType은 TimePicker의 배경과 테두리 표현 방식을 구분해요.</p>
          <TypeTokens values={timePickerVariants} />
          <h3 id="time-picker-placement-type">TimePickerPlacementType</h3>
          <p>TimePickerPlacementType은 입력창을 기준으로 시간 패널이 열릴 위치를 구분해요.</p>
          <TypeTokens values={timePickerPlacements} />
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
    needConfirm: undefined,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-timepicker--basic",
      `<div className="max-w-xs">
  <TimePicker />
</div>`,
    ),
    controls: {
      include: [
        "크기",
        "표현 방식",
        "placeholder",
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
      ],
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <TimePicker {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  args: {
    variant: "default",
    placeholder: "시간을 선택하세요",
    label: "",
    errorMessage: "",
    required: false,
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  argTypes: { size: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-timepicker--sizes"),
    controls: {
      disable: false,
      include: [
        "표현 방식",
        "placeholder",
        "레이블",
        "오류 문구",
        "필수 표시",
        "지우기",
        "읽기 전용",
        "비활성",
      ],
    },
    docs: {
      ...storyDescription("components-timepicker--sizes").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xs gap-3">
  <TimePicker size="lg" />
  <TimePicker size="md" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xs gap-3">
      <TimePicker {...args} size="lg" />
      <TimePicker {...args} size="md" />
    </div>
  ),
};

export const Widths: Story = {
  args: {
    size: "md",
    variant: "default",
    label: "",
    errorMessage: "",
    required: false,
    allowClear: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-timepicker--widths"),
    controls: {
      disable: false,
      include: [
        "크기",
        "표현 방식",
        "레이블",
        "오류 문구",
        "필수 표시",
        "지우기",
        "읽기 전용",
        "비활성",
      ],
    },
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
  render: (args) => (
    <div className="grid max-w-xl gap-3">
      <TimePicker {...args} placeholder="부모 너비 100%" />
      <TimePicker {...args} width={240} placeholder="가로 길이 240px" />
      <TimePicker {...args} width={320} placeholder="가로 길이 320px" />
    </div>
  ),
};

export const States: Story = {
  args: {
    size: "md",
    variant: "default",
    label: "",
    errorMessage: "",
    required: false,
  },
  parameters: {
    ...storyDescription("components-timepicker--states"),
    controls: {
      disable: false,
      include: ["크기", "표현 방식", "레이블", "오류 문구", "필수 표시"],
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
    label: "",
    errorMessage: "",
    required: false,
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
        "레이블",
        "오류 문구",
        "필수 표시",
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
        code: withStoryImports(`<div className="max-w-xs">
  <TimePicker
    label="업무 시작"
    required
    errorMessage="시간을 선택해 주세요."
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <TimePicker {...args} label="업무 시작" required errorMessage="시간을 선택해 주세요." />
    </div>
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
      `<div className="max-w-md">
  <TimePicker
    multiple
    defaultValue={[
      dayjs('2026-08-20 09:00:00'),
      dayjs('2026-08-20 13:30:00'),
      dayjs('2026-08-20 18:15:00'),
    ]}
  />
</div>`,
    ),
    controls: { disable: true },
  },
  render: () => (
    <div className="max-w-md">
      <TimePicker
        multiple
        defaultValue={[
          dayjs("2026-08-20 09:00:00"),
          dayjs("2026-08-20 13:30:00"),
          dayjs("2026-08-20 18:15:00"),
        ]}
      />
    </div>
  ),
};

export const DisabledTime: Story = {
  parameters: {
    ...storyDescription("components-timepicker--disabled-time"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-timepicker--disabled-time").docs,
      source: {
        code: withStoryImports(`<div className="max-w-xs">
  <TimePicker
    disabledTime={() => ({
      disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
      disabledMinutes: (hour) => (hour === 9 ? [0, 10, 20] : []),
    })}
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-xs">
      <TimePicker
        {...args}
        disabledTime={() => ({
          disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
          disabledMinutes: (hour) => (hour === 9 ? [0, 10, 20] : []),
        })}
      />
    </div>
  ),
};

export const HideDisabled: Story = {
  parameters: {
    ...storySource(
      "components-timepicker--hide-disabled",
      `<div className="max-w-xs">
  <TimePicker
    hideDisabled
    disabledTime={() => ({
      disabledHours: () => Array.from({ length: 9 }, (_, index) => index),
    })}
  />
</div>`,
    ),
    controls: { disable: true },
  },
  render: (args) => (
    <div className="max-w-xs">
      <TimePicker
        {...args}
        hideDisabled
        disabledTime={() => ({
          disabledHours: () => Array.from({ length: 9 }, (_, index) => index),
        })}
      />
    </div>
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
  parameters: {
    ...storySource(
      "components-timepicker--custom-cell",
      `<div className="max-w-xs">
  <TimePicker
    minuteStep={10}
    cellRender={(current, { originNode, subType }) => (
      <strong className={subType === 'minute' && current === 30 ? 'text-danger' : ''}>
        {originNode}
      </strong>
    )}
  />
</div>`,
    ),
    controls: { disable: true },
  },
  render: (args) => (
    <div className="max-w-xs">
      <TimePicker
        {...args}
        minuteStep={10}
        cellRender={(current, { originNode, subType }) => (
          <strong className={subType === "minute" && current === 30 ? "text-danger" : ""}>
            {originNode}
          </strong>
        )}
      />
    </div>
  ),
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
  },
  parameters: {
    ...storySource(
      "components-timepicker--controlled",
      `function ControlledTimePicker() {
  const [time, setTime] = useState<Dayjs | undefined>(dayjs('2026-08-20 09:00:00'));

  return (
    <div className="max-w-xs">
      <TimePicker value={time} onChange={setTime} />
    </div>
  );
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
      ],
    },
  },
  render: function ControlledTimeStory(args) {
    const [time, setTime] = useState<Dayjs | undefined>(dayjs("2026-08-20 09:00:00"));
    return (
      <div className="max-w-xs">
        <TimePicker<false>
          {...args}
          multiple={false}
          defaultValue={undefined}
          value={time}
          onChange={setTime}
        />
      </div>
    );
  },
};

export const Placements: Story = {
  parameters: {
    ...storySource(
      "components-timepicker--placements",
      `<div className="grid max-w-2xl grid-cols-2 gap-3">
  <TimePicker placement="topLeft" placeholder="topLeft" />
  <TimePicker placement="topRight" placeholder="topRight" />
  <TimePicker placeholder="bottomLeft" />
  <TimePicker placement="bottomRight" placeholder="bottomRight" />
</div>`,
    ),
    controls: { disable: true },
  },
  render: (args) => (
    <div className="grid max-w-2xl grid-cols-2 gap-3">
      <TimePicker {...args} placement="topLeft" placeholder="topLeft" />
      <TimePicker {...args} placement="topRight" placeholder="topRight" />
      <TimePicker {...args} placement="bottomLeft" placeholder="bottomLeft" />
      <TimePicker {...args} placement="bottomRight" placeholder="bottomRight" />
    </div>
  ),
};
