import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Calendar } from "./Calendar";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  args: { defaultValue: new Date(2026, 7, 20) },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "월 또는 연도 단위 달력에서 날짜를 탐색하고 선택해요.  \n전체·카드 레이아웃, 주차, 선택 범위, 사용자 정의 셀과 헤더를 지원해요.",
      },
      page: () => (
        <div className="calendar-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 선택된 날짜를 제어해요. | \`Date\` | - |
| \`defaultValue\` | 처음 선택할 날짜를 정해요. | \`Date\` | 오늘 |
| \`mode\` | 월간 또는 연간 패널을 표시해요. | \`'month' \\| 'year'\` | \`'month'\` |
| \`fullscreen\` | 전체 너비 또는 카드형 레이아웃을 정해요. | \`boolean\` | \`true\` |
| \`showWeek\` | 월간 달력 왼쪽에 주차를 표시해요. | \`boolean\` | \`false\` |
| \`validRange\` | 선택하고 탐색할 수 있는 날짜 범위를 정해요. | \`[Date, Date]\` | - |
| \`disabledDate\` | 특정 날짜 선택을 막아요. | \`(date: Date) => boolean\` | - |
| \`cellRender\` | 기본 셀 내용을 감싸거나 추가 내용을 표시해요. | \`(date, info) => ReactNode\` | - |
| \`fullCellRender\` | 날짜 셀 전체를 사용자 정의해요. | \`(date, info) => ReactNode\` | - |
| \`headerRender\` | 달력 헤더 전체를 사용자 정의해요. | \`(config) => ReactNode\` | - |
| \`onSelect\` | 날짜나 월을 선택할 때 선택 출처와 함께 실행해요. | \`(date, info) => void\` | - |
| \`onPanelChange\` | 표시 중인 날짜나 모드가 바뀔 때 실행해요. | \`(date, mode) => void\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Fullscreen: Story = {
  parameters: {
    ...storyDescription("components-calendar--fullscreen"),
    docs: {
      ...storyDescription("components-calendar--fullscreen").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Calendar defaultValue={new Date(2026, 7, 20)} />`),
      },
    },
  },
};
export const Card: Story = {
  args: { fullscreen: false, showWeek: true },
  parameters: {
    ...storyDescription("components-calendar--card"),
    docs: {
      ...storyDescription("components-calendar--card").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Calendar defaultValue={new Date(2026, 7, 20)} fullscreen={false} showWeek />`,
        ),
      },
    },
  },
};
export const Year: Story = {
  args: { mode: "year" },
  parameters: {
    ...storyDescription("components-calendar--year"),
    docs: {
      ...storyDescription("components-calendar--year").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Calendar defaultValue={new Date(2026, 7, 20)} mode="year" />`),
      },
    },
  },
};
