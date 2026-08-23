import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Tree } from "./Tree";

const treeData = [
  {
    key: "src",
    title: "src",
    icon: <Icon icon="folder-outlined" />,
    children: [
      {
        key: "components",
        title: "components",
        icon: <Icon icon="folder-outlined" />,
        children: [{ key: "button", title: "Button.tsx", icon: <Icon icon="file-outlined" /> }],
      },
      { key: "index", title: "index.ts", icon: <Icon icon="file-outlined" /> },
    ],
  },
  { key: "package", title: "package.json", icon: <Icon icon="file-outlined" /> },
];
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Tree",
  component: Tree,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "중첩된 데이터를 펼치고 접을 수 있는 계층 구조로 보여줘요.  \n단일·다중 선택, 연관 체크, 연결선, 비동기 로드와 고정 높이 스크롤을 지원해요.",
      },
      page: () => (
        <div className="tree-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`treeData\` | 계층형 노드 데이터를 전달해요. | \`TreeDataNode[]\` | \`[]\` |
| \`fieldNames\` | 데이터의 title·key·children 필드명을 바꿔요. | \`{ title?, key?, children? }\` | 기본 필드명 |
| \`blockNode\` | 노드 선택 영역을 가로로 채워요. | \`boolean\` | \`false\` |
| \`expandedKeys\` | 펼친 노드를 제어해요. | \`Key[]\` | - |
| \`defaultExpandedKeys\` | 처음 펼칠 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`selectedKeys\` | 선택된 노드를 제어해요. | \`Key[]\` | - |
| \`defaultSelectedKeys\` | 처음 선택할 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`checkedKeys\` | 체크된 노드와 부분 체크 노드를 제어해요. | \`Key[] \\| { checked: Key[]; halfChecked: Key[] }\` | - |
| \`defaultCheckedKeys\` | 처음 체크할 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`defaultExpandAll\` | 처음에 모든 노드를 펼쳐요. | \`boolean\` | \`false\` |
| \`checkable\` | 각 노드에 체크박스를 표시해요. | \`boolean\` | \`false\` |
| \`checkStrictly\` | 부모와 자식의 체크 상태를 분리해요. | \`boolean\` | \`false\` |
| \`selectable\` | 노드 선택 상태를 사용해요. | \`boolean\` | \`true\` |
| \`multiple\` | 여러 노드를 동시에 선택해요. | \`boolean\` | \`false\` |
| \`disabled\` | 전체 Tree 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`showIcon\` | 노드 아이콘을 표시해요. | \`boolean\` | \`false\` |
| \`showLine\` | 노드 사이의 연결선과 리프 아이콘을 설정해요. | \`boolean \\| { showLeafIcon?: boolean \\| ReactNode }\` | \`false\` |
| \`switcherIcon\` | 펼침·접힘 아이콘을 변경해요. | \`ReactNode \\| function\` | chevron Icon |
| \`titleRender\` | 노드 제목을 직접 구성해요. | \`(node) => ReactNode\` | - |
| \`height\` | 스크롤 영역의 최대 높이를 정해요. | \`number\` | - |
| \`loadData\` | 노드를 펼칠 때 자식 데이터를 비동기로 불러와요. | \`(node) => Promise<void>\` | - |
| \`loadedKeys\` | 불러오기를 마친 노드를 제어해요. | \`Key[]\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onExpand\` | 펼친 노드가 바뀔 때 실행해요. | \`(expandedKeys, info) => void\` | - |
| \`onSelect\` | 선택된 노드가 바뀔 때 실행해요. | \`(selectedKeys, info) => void\` | - |
| \`onCheck\` | 체크 상태가 바뀔 때 실행해요. | \`(checkedKeys, info) => void\` | - |
| \`onLoad\` | 노드 불러오기가 끝나면 실행해요. | \`(loadedKeys, info) => void\` | - |

### TreeDataNode

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 노드를 구분하는 고유한 값이에요. | \`Key\` | - |
| \`title\` | 노드에 표시할 내용이에요. | \`ReactNode\` | - |
| \`children\` | 하위 노드 목록이에요. | \`TreeDataNode[]\` | - |
| \`disabled\` | 노드의 모든 동작을 막아요. | \`boolean\` | \`false\` |
| \`disableCheckbox\` | 노드의 체크박스만 비활성화해요. | \`boolean\` | \`false\` |
| \`isLeaf\` | 자식이 없는 리프 노드임을 명시해요. | \`boolean\` | 자동 판단 |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Tree>;
export default meta;
type Story = StoryObj<typeof meta>;

const source = `<Tree
  showIcon
  defaultExpandAll
  treeData={[
    {
      key: 'src',
      title: 'src',
      icon: <Icon icon="folder-outlined" />,
      children: [
        {
          key: 'components',
          title: 'components',
          icon: <Icon icon="folder-outlined" />,
          children: [
            { key: 'button', title: 'Button.tsx', icon: <Icon icon="file-outlined" /> },
          ],
        },
        { key: 'index', title: 'index.ts', icon: <Icon icon="file-outlined" /> },
      ],
    },
    { key: 'package', title: 'package.json', icon: <Icon icon="file-outlined" /> },
  ]}
/>`;
export const Basic: Story = {
  args: { treeData, showIcon: true, defaultExpandAll: true },
  parameters: {
    ...storyDescription("components-tree--basic"),
    docs: {
      ...storyDescription("components-tree--basic").docs,
      source: { type: "code", code: withStoryImports(source) },
    },
  },
};
export const Checkable: Story = {
  args: {
    treeData,
    showIcon: true,
    defaultExpandAll: true,
    checkable: true,
    defaultCheckedKeys: ["button"],
  },
  parameters: {
    ...storyDescription("components-tree--checkable"),
    docs: {
      ...storyDescription("components-tree--checkable").docs,
      source: {
        type: "code",
        code: withStoryImports(
          source.replace("<Tree", "<Tree checkable defaultCheckedKeys={['button']}"),
        ),
      },
    },
  },
};
export const Lines: Story = {
  args: { treeData, showIcon: true, defaultExpandAll: true, showLine: true },
  parameters: {
    ...storyDescription("components-tree--lines"),
    docs: {
      ...storyDescription("components-tree--lines").docs,
      source: { type: "code", code: withStoryImports(source.replace("<Tree", "<Tree showLine")) },
    },
  },
};
