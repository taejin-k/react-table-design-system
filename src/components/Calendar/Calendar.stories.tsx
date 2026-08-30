import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Calendar } from "./Calendar";
import type { CalendarSelectSourceType } from "./Calendar.types";

const calendarSelectSources: CalendarSelectSourceType[] = ["date"];
const calendarEvents = new Set(["2026-08-07", "2026-08-14", "2026-08-21"]);

const dateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

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
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
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
| \`value\` | 선택된 날짜를 제어해요. | \`Date\` | - |
| \`defaultValue\` | 처음 선택할 날짜를 정해요. | \`Date\` | 오늘 |
| \`fullscreen\` | 전체 너비 또는 카드형 레이아웃을 정해요. | \`boolean\` | \`true\` |
| \`validRange\` | 선택하고 탐색할 수 있는 날짜 범위를 정해요. | \`[Date, Date]\` | - |
| \`disabledDate\` | 특정 날짜 선택을 막아요. | \`(date: Date) => boolean\` | - |
| \`cellRender\` | 기본 셀 내용을 감싸거나 추가 내용을 표시해요. | \`(date, info) => ReactNode\` | - |
| \`fullCellRender\` | 날짜 셀 전체를 사용자 정의해요. | \`(date, info) => ReactNode\` | - |
| \`headerRender\` | 달력 헤더 전체를 사용자 정의해요. | \`(config) => ReactNode\` | - |
| \`onChange\` | 선택 날짜가 바뀔 때 실행해요. | \`(date: Date) => void\` | - |
| \`onSelect\` | 날짜를 선택할 때 선택 출처와 함께 실행해요. | \`(date, info) => void\` | - |
| \`onPanelChange\` | 표시 중인 달이 바뀔 때 실행해요. | \`(date) => void\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="calendar-select-source-type">CalendarSelectSourceType</h3>
          <p>onSelect에서 전달하는 선택 출처예요.</p>
          <TypeTokens values={calendarSelectSources} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fullscreen: Story = {
  name: "Basic",
  args: { defaultValue: new Date(2026, 7, 20), fullscreen: true },
  parameters: {
    ...storyDescription("components-calendar--fullscreen"),
    controls: { include: ["전체 너비"] },
    docs: {
      ...storyDescription("components-calendar--fullscreen").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Calendar defaultValue={dayjs('2026-08-20').toDate()} />`),
      },
    },
  },
  render: (args) => <Calendar {...args} />,
};
export const Card: Story = {
  args: { defaultValue: new Date(2026, 7, 20), fullscreen: false },
  parameters: {
    ...storyDescription("components-calendar--card"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-calendar--card").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Calendar defaultValue={dayjs('2026-08-20').toDate()} fullscreen={false} />`,
        ),
      },
    },
  },
  render: (args) => <Calendar {...args} />,
};

export const SelectionRulesAndCell: Story = {
  args: { fullscreen: true },
  parameters: {
    ...storyDescription("components-calendar--selection-rules-and-cell"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-calendar--selection-rules-and-cell").docs,
      source: {
        type: "code",
        code: withStoryImports(`const events = new Set(['2026-08-07', '2026-08-14', '2026-08-21']);

const dateKey = (date) => dayjs(date).format('YYYY-MM-DD');

<Calendar
  defaultValue={dayjs('2026-08-12').toDate()}
  validRange={[
    dayjs('2026-08-05').toDate(),
    dayjs('2026-08-25').toDate(),
  ]}
  disabledDate={(date) => [0, 6].includes(dayjs(date).day())}
  cellRender={(date, { originNode }) => (
    <div className="relative">
      {originNode}
      {events.has(dateKey(date)) ? (
        <span className="pointer-events-none absolute right-3 bottom-2 size-1.5 rounded-full bg-[#0062df]" />
      ) : null}
    </div>
  )}
/>`),
      },
    },
  },
  render: (args) => (
    <Calendar
      {...args}
      defaultValue={new Date(2026, 7, 12)}
      validRange={[new Date(2026, 7, 5), new Date(2026, 7, 25)]}
      disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      cellRender={(date, { originNode }) => (
        <div className="relative">
          {originNode}
          {calendarEvents.has(dateKey(date)) ? (
            <span className="pointer-events-none absolute right-3 bottom-2 size-1.5 rounded-full bg-[#0062df]" />
          ) : null}
        </div>
      )}
    />
  ),
};
