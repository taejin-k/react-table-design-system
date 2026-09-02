import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import dayjs, { type Dayjs } from "dayjs";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Calendar } from "./Calendar";
import type { CalendarEvent } from "./Calendar.types";
const calendarEvents: Record<string, string[]> = {
  "2026-08-07": ["디자인 리뷰", "주간 회의", "요구사항 점검", "화면 검수", "회고"],
  "2026-08-14": ["배포 일정", "배포 전 점검", "릴리스 노트 작성"],
  "2026-08-21": ["회고", "다음 스프린트 계획"],
  "2026-08-28": ["프로덕션 배포 전 최종 점검\n검수 결과 확인"],
};
const calendarRangeEvents: CalendarEvent[] = [
  {
    key: "release",
    title: "릴리스 기간",
    start: dayjs("2026-08-04"),
    end: dayjs("2026-08-07"),
    color: "#1677ff",
  },
  {
    key: "design-review",
    title: "디자인 리뷰",
    start: dayjs("2026-08-12"),
    color: "#52c41a",
  },
  {
    key: "maintenance",
    title: "정기 점검",
    start: dayjs("2026-08-19"),
    end: dayjs("2026-08-23"),
    color: "#faad14",
  },
  {
    key: "bug-fix",
    title: "버그 수정",
    start: dayjs("2026-08-28"),
    end: dayjs("2026-08-29"),
    color: "#ff4d4f",
  },
];

const dateKey = (date: Dayjs) => date.format("YYYY-MM-DD");

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    fullscreen: { name: "전체 너비", control: "boolean" },
    value: { control: false, table: { disable: true } },
    defaultValue: { control: false, table: { disable: true } },
    validRange: { control: false, table: { disable: true } },
    disabledDate: { control: false, table: { disable: true } },
    cellRender: { control: false, table: { disable: true } },
    fullCellRender: { control: false, table: { disable: true } },
    headerRender: { control: false, table: { disable: true } },
    events: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
    onPanelChange: { control: false, table: { disable: true } },
    onSelect: { control: false, table: { disable: true } },
    onEventClick: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "월간 달력에서 날짜를 탐색하고 선택해요.  \n전체·카드 레이아웃, 선택 범위, 사용자 정의 셀과 헤더를 지원해요.",
      },
      page: () => (
        <div className="calendar-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Calendar

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 선택된 날짜를 제어해요. | \`Dayjs\` | - |
| \`defaultValue\` | 처음 선택할 날짜를 정해요. | \`Dayjs\` | 오늘 |
| \`fullscreen\` | 전체 너비 또는 카드형 레이아웃을 정해요. | \`boolean\` | \`true\` |
| \`validRange\` | 선택할 수 있는 날짜 범위를 정해요. | \`[Dayjs, Dayjs]\` | - |
| \`disabledDate\` | 특정 날짜 선택을 막아요. | \`(date: Dayjs) => boolean\` | - |
| \`cellRender\` | 기본 셀 내용을 감싸거나 추가 내용을 표시해요. | <code>(date: Dayjs, info: <a href="#calendar-cell-info">CalendarCellInfo</a>) =&gt; ReactNode</code> | - |
| \`fullCellRender\` | 날짜 셀 전체를 사용자 정의해요. | <code>(date: Dayjs, info: <a href="#calendar-cell-info">CalendarCellInfo</a>) =&gt; ReactNode</code> | - |
| \`headerRender\` | 달력 헤더 전체를 사용자 정의해요. | <code>(config: <a href="#calendar-header-config">CalendarHeaderConfig</a>) =&gt; ReactNode</code> | - |
| \`events\` | 전체 너비 달력에 기간 일정을 표시해요. | <a href="#calendar-event"><code>CalendarEvent[]</code></a> | \`[]\` |
| \`onChange\` | 선택 날짜가 바뀔 때 실행해요. | \`(date: Dayjs) => void\` | - |
| \`onSelect\` | 날짜를 선택할 때 실행해요. | \`(date: Dayjs) => void\` | - |
| \`onPanelChange\` | 표시 중인 달이 바뀔 때 실행해요. | \`(date: Dayjs) => void\` | - |
| \`onEventClick\` | 기간 일정을 클릭할 때 실행해요. | <code>(event: <a href="#calendar-event">CalendarEvent</a>) =&gt; void</code> | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |

### <span id="calendar-header-config">CalendarHeaderConfig</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 헤더에 표시 중인 날짜예요. | \`Dayjs\` | - |
| \`onChange\` | 헤더에서 표시할 날짜를 바꿔요. | \`(date: Dayjs) => void\` | - |

### <span id="calendar-cell-info">CalendarCellInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`originNode\` | 기본 날짜 셀이에요. | \`ReactElement\` | - |
| \`today\` | 오늘 날짜예요. | \`Dayjs\` | - |

### <span id="calendar-event">CalendarEvent</span>

종료일은 일정에 포함되며, 주를 넘어가는 일정은 다음 줄에서 이어서 표시해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 일정을 구분하는 키예요. | \`Key\` | - |
| \`title\` | 일정 막대에 표시할 내용이에요. | \`ReactNode\` | - |
| \`start\` | 일정 시작일이에요. | \`Dayjs\` | - |
| \`end\` | 일정 종료일이에요. | \`Dayjs\` | \`start\` |
| \`color\` | 일정 막대의 배경색이에요. | \`string\` | \`#0062df\` |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fullscreen: Story = {
  name: "Basic",
  args: { defaultValue: dayjs("2026-08-20"), fullscreen: true },
  parameters: {
    ...storyDescription("components-calendar--fullscreen"),
    controls: { include: ["전체 너비"] },
    docs: {
      ...storyDescription("components-calendar--fullscreen").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Calendar defaultValue={dayjs('2026-08-20')} />`),
      },
    },
  },
  render: (args) => <Calendar {...args} />,
};
export const Card: Story = {
  args: { defaultValue: dayjs("2026-08-20"), fullscreen: false },
  parameters: {
    ...storyDescription("components-calendar--card"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-calendar--card").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Calendar defaultValue={dayjs('2026-08-20')} fullscreen={false} />`,
        ),
      },
    },
  },
  render: (args) => <Calendar {...args} />,
};

export const SelectionRules: Story = {
  args: { fullscreen: true },
  parameters: {
    ...storyDescription("components-calendar--selection-rules"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-calendar--selection-rules").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Calendar
  defaultValue={dayjs('2026-08-12')}
  validRange={[dayjs('2026-08-05'), dayjs('2026-08-25')]}
  disabledDate={(date) => [0, 6].includes(date.day())}
/>`),
      },
    },
  },
  render: (args) => (
    <Calendar
      {...args}
      defaultValue={dayjs("2026-08-12")}
      validRange={[dayjs("2026-08-05"), dayjs("2026-08-25")]}
      disabledDate={(date) => date.day() === 0 || date.day() === 6}
    />
  ),
};

export const CellRender: Story = {
  args: { fullscreen: true },
  parameters: {
    ...storyDescription("components-calendar--cell-render"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-calendar--cell-render").docs,
      source: {
        type: "code",
        code: withStoryImports(`const schedules = {
  '2026-08-07': ['디자인 리뷰', '주간 회의', '요구사항 점검', '화면 검수', '회고'],
  '2026-08-14': ['배포 일정', '배포 전 점검', '릴리스 노트 작성'],
  '2026-08-21': ['회고', '다음 스프린트 계획'],
  '2026-08-28': ['프로덕션 배포 전 최종 점검\\n검수 결과 확인'],
};

const dateKey = (date) => date.format('YYYY-MM-DD');

<Calendar
  defaultValue={dayjs('2026-08-12')}
  cellRender={(date, { originNode }) => {
    const dailySchedules = schedules[dateKey(date)] ?? [];
    return (
      <div className="relative">
        {originNode}
        {dailySchedules.length > 0 ? (
          <div
            data-calendar-schedule-scroll-container
            className="absolute inset-x-3 top-7 bottom-1 grid auto-rows-min content-start gap-0.5 overflow-y-auto overscroll-contain pr-1"
          >
            {dailySchedules.map((schedule) => (
              <Badge
                key={schedule}
                status="processing"
                text={schedule}
                className="w-full min-w-0 gap-1.5 text-xs leading-4 [&>span:first-child]:mt-[5px] [&>span:last-child]:max-h-8 [&>span:last-child]:min-w-0 [&>span:last-child]:overflow-hidden [&>span:last-child]:break-words"
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }}
/>`),
      },
    },
  },
  render: (args) => (
    <Calendar
      {...args}
      defaultValue={dayjs("2026-08-12")}
      cellRender={(date, { originNode }) => {
        const dailySchedules = calendarEvents[dateKey(date)] ?? [];
        return (
          <div className="relative">
            {originNode}
            {dailySchedules.length > 0 ? (
              <div
                data-calendar-schedule-scroll-container
                className="absolute inset-x-3 top-7 bottom-1 grid auto-rows-min content-start gap-0.5 overflow-y-auto overscroll-contain pr-1"
              >
                {dailySchedules.map((schedule) => (
                  <Badge
                    key={schedule}
                    status="processing"
                    text={schedule}
                    className="w-full min-w-0 gap-1.5 text-xs leading-4 [&>span:first-child]:mt-[5px] [&>span:last-child]:max-h-8 [&>span:last-child]:min-w-0 [&>span:last-child]:overflow-hidden [&>span:last-child]:break-words"
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      }}
    />
  ),
};

export const RangeEvents: Story = {
  args: { fullscreen: true },
  parameters: {
    ...storyDescription("components-calendar--range-events"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-calendar--range-events").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Calendar
  defaultValue={dayjs('2026-08-01')}
  events={[
    {
      key: 'release',
      title: '릴리스 기간',
      start: dayjs('2026-08-04'),
      end: dayjs('2026-08-07'),
      color: '#1677ff',
    },
    {
      key: 'design-review',
      title: '디자인 리뷰',
      start: dayjs('2026-08-12'),
      color: '#52c41a',
    },
    {
      key: 'maintenance',
      title: '정기 점검',
      start: dayjs('2026-08-19'),
      end: dayjs('2026-08-23'),
      color: '#faad14',
    },
    {
      key: 'bug-fix',
      title: '버그 수정',
      start: dayjs('2026-08-28'),
      end: dayjs('2026-08-29'),
      color: '#ff4d4f',
    },
  ]}
/>`),
      },
    },
  },
  render: (args) => (
    <Calendar {...args} defaultValue={dayjs("2026-08-01")} events={calendarRangeEvents} />
  ),
};

export const CustomHeader: Story = {
  args: { fullscreen: true },
  parameters: {
    ...storyDescription("components-calendar--custom-header"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-calendar--custom-header").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Calendar
  defaultValue={dayjs('2026-08-20')}
  headerRender={({ value, onChange }) => (
    <div className="flex items-center justify-between p-3">
      <Button
        size="md"
        variant="secondary"
        onClick={() => onChange(value.subtract(1, 'month'))}
      >
        이전 달
      </Button>
      <strong className="text-lg">{value.format('YYYY년 M월')}</strong>
      <Button
        size="md"
        variant="secondary"
        onClick={() => onChange(value.add(1, 'month'))}
      >
        다음 달
      </Button>
    </div>
  )}
/>`),
      },
    },
  },
  render: (args) => (
    <Calendar
      {...args}
      defaultValue={dayjs("2026-08-20")}
      headerRender={({ value, onChange }) => (
        <div className="flex items-center justify-between p-3">
          <Button
            size="md"
            variant="secondary"
            onClick={() => onChange(value.subtract(1, "month"))}
          >
            이전 달
          </Button>
          <strong className="text-lg">{value.format("YYYY년 M월")}</strong>
          <Button size="md" variant="secondary" onClick={() => onChange(value.add(1, "month"))}>
            다음 달
          </Button>
        </div>
      )}
    />
  ),
};
