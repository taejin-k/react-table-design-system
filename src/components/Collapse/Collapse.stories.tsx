import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Collapse } from "./Collapse";
import type {
  CollapseCollapsibleType,
  CollapseExpandIconPlacementType,
  CollapseSizeType,
} from "./Collapse.types";

const collapseSizes: CollapseSizeType[] = ["large", "medium", "small"];
const collapseModes: CollapseCollapsibleType[] = ["header", "icon", "disabled"];
const collapseIconPlacements: CollapseExpandIconPlacementType[] = ["start", "end"];

const items = [
  {
    key: "one",
    label: "디자인 시스템이란 무엇인가요?",
    children: "일관된 사용자 경험을 위한 원칙과 컴포넌트 모음입니다.",
  },
  {
    key: "two",
    label: "여러 패널을 열 수 있나요?",
    children: "기본 모드에서는 여러 패널을 동시에 열 수 있습니다.",
  },
];
const itemsSource = `const items = [
  {
    key: 'one',
    label: '디자인 시스템이란 무엇인가요?',
    children: '일관된 사용자 경험을 위한 원칙과 컴포넌트 모음입니다.',
  },
  {
    key: 'two',
    label: '여러 패널을 열 수 있나요?',
    children: '기본 모드에서는 여러 패널을 동시에 열 수 있습니다.',
  },
];`;
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Collapse",
  component: Collapse,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "관련 콘텐츠를 접을 수 있는 패널로 나눠 필요한 정보만 표시해요.  \n다중·아코디언 펼침, 애니메이션, 크기, 아이콘 위치와 테두리 없는 모드를 지원해요.",
      },
      page: () => (
        <div className="collapse-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`items\` | 패널 헤더와 콘텐츠를 구성해요. | \`CollapseItem[]\` | \`[]\` |
| \`activeKey\` | 펼친 패널을 제어해요. | \`CollapseKeyType \\| CollapseKeyType[]\` | - |
| \`defaultActiveKey\` | 처음 펼칠 패널을 정해요. | \`CollapseKeyType \\| CollapseKeyType[]\` | \`[]\` |
| \`accordion\` | 한 번에 하나의 패널만 펼쳐요. | \`boolean\` | \`false\` |
| \`bordered\` | 외곽선과 패널 구분선을 표시해요. | \`boolean\` | \`true\` |
| \`ghost\` | 배경과 테두리를 제거해요. | \`boolean\` | \`false\` |
| \`size\` | 패널 헤더와 본문의 여백을 정해요. | [\`CollapseSizeType\`](#collapse-size-type) | \`medium\` |
| \`collapsible\` | 헤더·아이콘만 클릭하거나 전체를 비활성화해요. | [\`CollapseCollapsibleType\`](#collapse-collapsible-type) | \`header\` |
| \`expandIcon\` | 펼침 아이콘을 직접 구성해요. | \`(panel) => ReactNode\` | 기본 화살표 |
| \`expandIconPlacement\` | 펼침 아이콘을 시작 또는 끝에 배치해요. | [\`CollapseExpandIconPlacementType\`](#collapse-expand-icon-placement-type) | \`start\` |
| \`destroyOnHidden\` | 접힌 패널 콘텐츠를 DOM에서 제거해요. | \`boolean\` | \`false\` |
| \`onChange\` | 펼친 패널이 바뀔 때 실행해요. | \`(key) => void\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |

### CollapseItem

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 패널을 구분하는 고유한 값이에요. | \`string \\| number\` | - |
| \`label\` | 패널 헤더에 표시할 내용이에요. | \`ReactNode\` | - |
| \`children\` | 패널을 펼쳤을 때 표시할 내용이에요. | \`ReactNode\` | - |
| \`extra\` | 헤더 반대편에 추가 콘텐츠를 배치해요. | \`ReactNode\` | - |
| \`showArrow\` | 펼침 아이콘 표시 여부를 정해요. | \`boolean\` | \`true\` |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="collapse-size-type">CollapseSizeType</h3>
          <p>패널 크기를 선택해요.</p>
          <TypeTokens values={collapseSizes} />
          <h3 id="collapse-collapsible-type">CollapseCollapsibleType</h3>
          <p>패널을 여는 영역을 선택해요.</p>
          <TypeTokens values={collapseModes} />
          <h3 id="collapse-expand-icon-placement-type">CollapseExpandIconPlacementType</h3>
          <p>펼침 아이콘 위치를 선택해요.</p>
          <TypeTokens values={collapseIconPlacements} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Collapse>;
export default meta;
type Story = StoryObj<typeof meta>;

const basicSource = `<Collapse defaultActiveKey={['one']} items={[\n  { key: 'one', label: '디자인 시스템이란 무엇인가요?', children: '일관된 사용자 경험을 위한 원칙과 컴포넌트 모음입니다.' },\n  { key: 'two', label: '여러 패널을 열 수 있나요?', children: '기본 모드에서는 여러 패널을 동시에 열 수 있습니다.' },\n]} />`;
export const Basic: Story = {
  args: { items, defaultActiveKey: ["one"] },
  parameters: {
    ...storyDescription("components-collapse--basic"),
    docs: {
      ...storyDescription("components-collapse--basic").docs,
      source: { type: "code", code: withStoryImports(basicSource) },
    },
  },
};
export const Accordion: Story = {
  args: { items, accordion: true, defaultActiveKey: "one" },
  parameters: {
    ...storyDescription("components-collapse--accordion"),
    docs: {
      ...storyDescription("components-collapse--accordion").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `${itemsSource}\n\n<Collapse accordion defaultActiveKey="one" items={items} />`,
        ),
      },
    },
  },
};
export const Ghost: Story = {
  args: { items, ghost: true, bordered: false, defaultActiveKey: ["one"] },
  parameters: {
    ...storyDescription("components-collapse--ghost"),
    docs: {
      ...storyDescription("components-collapse--ghost").docs,
      source: {
        type: "code",
        code: withStoryImports(`${itemsSource}

<Collapse ghost bordered={false} defaultActiveKey={['one']} items={items} />`),
      },
    },
  },
};
