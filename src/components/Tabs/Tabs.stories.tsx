import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Tabs } from "./Tabs";

const items = [
  { key: "overview", label: "개요", children: "프로젝트 개요" },
  { key: "activity", label: "활동", children: "최근 활동" },
  { key: "disabled", label: "비활성", children: "", disabled: true },
];
const itemsSource = `const items = [
  { key: 'overview', label: '개요', children: '프로젝트 개요' },
  { key: 'activity', label: '활동', children: '최근 활동' },
  { key: 'disabled', label: '비활성', disabled: true },
];`;
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: { items },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "같은 영역 안의 연관된 콘텐츠를 탭으로 전환해요.  \n선·카드·편집형 모드, 네 방향 배치, 제어 상태와 탭 전환 애니메이션을 지원해요.",
      },
      page: () => (
        <div className="tabs-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 탭 레이블과 콘텐츠를 구성해요. | \`TabItemType[]\` | \`[]\` |
| \`activeKey\` | 활성 탭을 제어해요. | \`string\` | - |
| \`defaultActiveKey\` | 처음 활성화할 탭을 정해요. | \`string\` | 첫 번째 탭 |
| \`type\` | 탭의 표현 방식을 정해요. | \`'line' \\| 'card' \\| 'editable-card'\` | \`'line'\` |
| \`size\` | 탭의 높이와 여백을 정해요. | \`'large' \\| 'medium' \\| 'small'\` | \`'medium'\` |
| \`tabPlacement\` | 탭 목록의 위치를 정해요. | \`'top' \\| 'end' \\| 'bottom' \\| 'start'\` | \`'top'\` |
| \`animated\` | 표시선과 콘텐츠 전환 애니메이션을 설정해요. | \`boolean \\| { inkBar?: boolean; tabPane?: boolean }\` | \`true\` |
| \`centered\` | 탭 목록을 가운데 정렬해요. | \`boolean\` | \`false\` |
| \`tabBarExtraContent\` | 탭 목록 양쪽에 추가 콘텐츠를 배치해요. | \`ReactNode \\| { left?: ReactNode; right?: ReactNode }\` | - |
| \`onChange\` | 활성 탭이 바뀔 때 실행해요. | \`(activeKey: string) => void\` | - |
| \`onEdit\` | 편집형 탭을 추가하거나 제거할 때 실행해요. | \`(targetKey, action) => void\` | - |

### TabItemType

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 탭을 구분하는 고유한 값이에요. | \`string\` | - |
| \`label\` | 탭 버튼에 표시할 내용이에요. | \`ReactNode\` | - |
| \`children\` | 탭이 활성화됐을 때 표시할 콘텐츠예요. | \`ReactNode\` | - |
| \`disabled\` | 탭 선택을 막아요. | \`boolean\` | \`false\` |
| \`closable\` | 편집형 탭의 닫기 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`destroyOnHidden\` | 숨겨진 탭 콘텐츠를 DOM에서 제거해요. | \`boolean\` | \`false\` |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { defaultActiveKey: "overview" },
  parameters: {
    ...storyDescription("components-tabs--basic"),
    docs: {
      ...storyDescription("components-tabs--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Tabs defaultActiveKey="overview" items={[\n  { key: 'overview', label: '개요', children: '프로젝트 개요' },\n  { key: 'activity', label: '활동', children: '최근 활동' },\n  { key: 'disabled', label: '비활성', disabled: true },\n]} />`,
        ),
      },
    },
  },
};
export const Card: Story = {
  args: { type: "card" },
  parameters: {
    ...storyDescription("components-tabs--card"),
    docs: {
      ...storyDescription("components-tabs--card").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Tabs type="card" items={items} />`),
      },
    },
  },
};
export const Editable: Story = {
  args: { type: "editable-card" },
  parameters: {
    ...storyDescription("components-tabs--editable"),
    docs: {
      ...storyDescription("components-tabs--editable").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<Tabs
  type="editable-card"
  items={items}
  onEdit={(targetKey, action) => console.log(targetKey, action)}
/>`),
      },
    },
  },
};
export const Vertical: Story = {
  args: { tabPlacement: "start" },
  parameters: {
    ...storyDescription("components-tabs--vertical"),
    docs: {
      ...storyDescription("components-tabs--vertical").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}\n\n<Tabs tabPlacement="start" items={items} />`),
      },
    },
  },
};
