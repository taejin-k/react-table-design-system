import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Icon } from "../Icon";
import { Tree } from "./Tree";
import type { TreeDataNode, TreeDropPositionType, TreeProps } from "./Tree.types";

const treeCheckedKeyTypes = ["Key[]", "{ checked: Key[]; halfChecked: Key[] }"] as const;
const treeDraggableTypes = [
  "boolean",
  "(node: TreeDataNode) => boolean",
  "TreeDraggableConfig",
] as const;
const treeDropPositions: TreeDropPositionType[] = [-1, 0, 1];

const basicTreeData: TreeDataNode[] = [
  {
    key: "src",
    title: "src",
    children: [
      {
        key: "components",
        title: "components",
        children: [{ key: "button", title: "Button.tsx" }],
      },
      { key: "index", title: "index.ts" },
    ],
  },
  { key: "package", title: "package.json" },
];
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
        children: [
          {
            key: "button",
            title: "Button.tsx",
            icon: <Icon icon="file-outlined" />,
            isLeaf: true,
          },
        ],
      },
      { key: "index", title: "index.ts", icon: <Icon icon="file-outlined" />, isLeaf: true },
    ],
  },
  {
    key: "package",
    title: "package.json",
    icon: <Icon icon="file-outlined" />,
    isLeaf: true,
  },
  { key: "readme", title: "README.md", isLeaf: true },
];
const draggableTreeData: TreeDataNode[] = [
  {
    key: "project",
    title: "프로젝트",
    children: [
      { key: "design", title: "디자인" },
      { key: "development", title: "개발" },
    ],
  },
  { key: "documents", title: "문서" },
  { key: "assets", title: "에셋", icon: <Icon icon="folder-outlined" /> },
  { key: "guide", title: "가이드.md", icon: <Icon icon="file-outlined" /> },
  { key: "releases", title: "릴리스" },
  { key: "settings", title: "설정", icon: <Icon icon="setting" /> },
  { key: "archive", title: "보관함" },
];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Tree",
  component: Tree,
  tags: ["autodocs"],
  argTypes: {
    blockNode: { name: "가로 채우기", control: "boolean" },
    checkable: { name: "체크박스", control: "boolean" },
    checkStrictly: { name: "독립 체크", control: "boolean" },
    selectable: { name: "선택 가능", control: "boolean" },
    multiple: { name: "다중 선택", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    draggable: { name: "드래그", control: "boolean" },
    height: { name: "높이", control: "number" },
    treeData: { control: false, table: { disable: true } },
    defaultTreeData: { control: false, table: { disable: true } },
    expandedKeys: { control: false, table: { disable: true } },
    selectedKeys: { control: false, table: { disable: true } },
    checkedKeys: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onDrop: { control: false, table: { disable: true } },
    onTreeDataChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "중첩된 데이터를 펼치고 접을 수 있는 계층 구조로 보여줘요.  \n단일·다중 선택, 연관 체크, 드래그 이동, 비동기 로드와 고정 높이 스크롤을 지원해요.",
      },
      page: () => (
        <div className="tree-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### <span id="tree">Tree</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`treeData\` | 외부에서 제어할 계층형 노드 데이터를 전달해요. | [\`TreeDataNode[]\`](#tree-data-node) | - |
| \`defaultTreeData\` | 내부에서 관리할 초기 노드 데이터를 전달해요. 드래그하면 목록이 자동으로 변경돼요. | [\`TreeDataNode[]\`](#tree-data-node) | \`[]\` |
| \`fieldNames\` | 데이터의 title·key·children 필드명을 바꿔요. | [\`TreeFieldNames\`](#tree-field-names) | 기본 필드명 |
| \`blockNode\` | 노드 선택 영역을 가로로 채워요. | \`boolean\` | \`false\` |
| \`expandedKeys\` | 펼친 노드를 제어해요. | \`Key[]\` | - |
| \`defaultExpandedKeys\` | 처음 펼칠 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`selectedKeys\` | 선택된 노드를 제어해요. | \`Key[]\` | - |
| \`defaultSelectedKeys\` | 처음 선택할 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`checkedKeys\` | 체크된 노드와 부분 체크 노드를 제어해요. | [\`TreeCheckedKeys\`](#tree-checked-keys) | - |
| \`defaultCheckedKeys\` | 처음 체크할 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`defaultExpandAll\` | 처음에 모든 노드를 펼쳐요. | \`boolean\` | \`false\` |
| \`checkable\` | 각 노드에 체크박스를 표시해요. | \`boolean\` | \`false\` |
| \`checkStrictly\` | 부모와 자식의 체크 상태를 분리해요. | \`boolean\` | \`false\` |
| \`selectable\` | 노드 선택 상태를 사용해요. | \`boolean\` | \`true\` |
| \`multiple\` | 여러 노드를 동시에 선택해요. | \`boolean\` | \`false\` |
| \`disabled\` | 전체 Tree 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`draggable\` | 노드 드래그를 설정해요. | [\`TreeDraggableType\`](#tree-draggable-type) | \`false\` |
| \`allowDrop\` | 위치별 드롭 허용 여부를 정해요. | <code>(info: <a href="#tree-allow-drop-info">TreeAllowDropInfo</a>) =&gt; boolean</code> | - |
| \`switcherIcon\` | 펼침·접힘 아이콘을 변경해요. | <code>ReactNode \\| ((info: <a href="#tree-switcher-icon-info">TreeSwitcherIconInfo</a>) =&gt; ReactNode)</code> | chevron Icon |
| \`titleRender\` | 노드 제목을 직접 구성해요. | <code>(node: <a href="#tree-data-node">TreeDataNode</a>) =&gt; ReactNode</code> | - |
| \`height\` | 스크롤 영역의 최대 높이를 정해요. | \`number\` | - |
| \`loadData\` | 노드를 펼칠 때 자식 데이터를 비동기로 불러와요. | <code>(node: <a href="#tree-data-node">TreeDataNode</a>) =&gt; Promise&lt;void&gt;</code> | - |
| \`loadedKeys\` | 불러오기를 마친 노드를 제어해요. | \`Key[]\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`style\` | 최상위 요소에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |
| \`onExpand\` | 펼친 노드가 바뀔 때 실행해요. | <code>(expandedKeys: Key[], info: <a href="#tree-event-info">TreeEventInfo</a>) =&gt; void</code> | - |
| \`onSelect\` | 선택된 노드가 바뀔 때 실행해요. | <code>(selectedKeys: Key[], info: <a href="#tree-event-info">TreeEventInfo</a>) =&gt; void</code> | - |
| \`onCheck\` | 체크 상태가 바뀔 때 실행해요. | <code>(checkedKeys: <a href="#tree-checked-keys">TreeCheckedKeys</a>, info: <a href="#tree-event-info">TreeEventInfo</a>) =&gt; void</code> | - |
| \`onLoad\` | 노드 불러오기가 끝나면 실행해요. | <code>(loadedKeys: Key[], info: <a href="#tree-load-info">TreeLoadInfo</a>) =&gt; void</code> | - |
| \`onDragStart\` | 노드 드래그를 시작할 때 실행해요. | <code>(info: <a href="#tree-drag-info">TreeDragInfo</a>) =&gt; void</code> | - |
| \`onDragEnter\` | 드래그가 노드에 들어올 때 실행해요. | <code>(info: <a href="#tree-drag-enter-info">TreeDragEnterInfo</a>) =&gt; void</code> | - |
| \`onDragOver\` | 노드 위에서 드래그할 때 실행해요. | <code>(info: <a href="#tree-drag-info">TreeDragInfo</a>) =&gt; void</code> | - |
| \`onDragLeave\` | 드래그가 노드를 벗어날 때 실행해요. | <code>(info: <a href="#tree-drag-info">TreeDragInfo</a>) =&gt; void</code> | - |
| \`onDragEnd\` | 노드 드래그가 끝날 때 실행해요. | <code>(info: <a href="#tree-drag-info">TreeDragInfo</a>) =&gt; void</code> | - |
| \`onDrop\` | 노드를 놓은 위치와 이동 정보를 전달해요. | <code>(info: <a href="#tree-drop-info">TreeDropInfo</a>) =&gt; void</code> | - |
| \`onTreeDataChange\` | 드래그로 변경된 전체 노드 데이터와 이동 정보를 전달해요. | <code>(treeData: <a href="#tree-data-node">TreeDataNode[]</a>, info: <a href="#tree-drop-info">TreeDropInfo</a>) =&gt; void</code> | - |

### <span id="tree-data-node">TreeDataNode</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 노드를 구분하는 고유한 값이에요. | \`Key\` | - |
| \`title\` | 노드에 표시할 내용이에요. | \`ReactNode\` | - |
| \`icon\` | 노드 제목 앞에 표시할 아이콘이에요. | \`ReactNode\` | - |
| \`children\` | 하위 노드 목록이에요. | [\`TreeDataNode[]\`](#tree-data-node) | - |
| \`disabled\` | 노드의 모든 동작을 막아요. | \`boolean\` | \`false\` |
| \`disableCheckbox\` | 노드의 체크박스만 비활성화해요. | \`boolean\` | \`false\` |
| \`checkable\` | 이 노드에 체크박스를 표시해요. | \`boolean\` | 부모 설정 |
| \`selectable\` | 이 노드의 선택 가능 여부를 정해요. | \`boolean\` | 부모 설정 |
| \`isLeaf\` | 자식을 받을 수 없는 리프 노드임을 명시해요. | \`boolean\` | \`false\` |
| \`className\` | 노드 항목에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`style\` | 노드 항목에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |

### <span id="tree-field-names">TreeFieldNames</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`title\` | 제목으로 사용할 필드명을 정해요. | \`string\` | \`title\` |
| \`key\` | 키로 사용할 필드명을 정해요. | \`string\` | \`key\` |
| \`children\` | 하위 목록으로 사용할 필드명을 정해요. | \`string\` | \`children\` |

### <span id="tree-draggable-config">TreeDraggableConfig</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`nodeDraggable\` | 노드별 드래그 허용 여부를 정해요. | <code>(node: <a href="#tree-data-node">TreeDataNode</a>) =&gt; boolean</code> | 모든 노드 |

### <span id="tree-allow-drop-info">TreeAllowDropInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`dropNode\` | 드롭 대상 노드예요. | [\`TreeDataNode\`](#tree-data-node) | - |
| \`dropPosition\` | 대상의 위·안·아래 위치예요. | [\`TreeDropPositionType\`](#tree-drop-position-type) | - |

### <span id="tree-switcher-icon-info">TreeSwitcherIconInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`expanded\` | 노드가 펼쳐져 있는지 나타내요. | \`boolean\` | - |
| \`node\` | 아이콘을 표시할 노드예요. | [\`TreeDataNode\`](#tree-data-node) | - |

### <span id="tree-event-info">TreeEventInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`event\` | 변경을 일으킨 동작이에요. | \`select \\| check \\| expand\` | - |
| \`selected\` | 선택 여부예요. | \`boolean\` | - |
| \`checked\` | 체크 여부예요. | \`boolean\` | - |
| \`expanded\` | 펼침 여부예요. | \`boolean\` | - |
| \`node\` | 변경된 노드예요. | [\`TreeDataNode\`](#tree-data-node) | - |
| \`nativeEvent\` | 원본 브라우저 이벤트예요. | \`Event\` | - |

### <span id="tree-load-info">TreeLoadInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`event\` | 불러오기 완료 동작이에요. | \`load\` | - |
| \`node\` | 불러오기를 마친 노드예요. | [\`TreeDataNode\`](#tree-data-node) | - |

### <span id="tree-drag-info">TreeDragInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`event\` | 원본 드래그 이벤트예요. | \`DragEvent<HTMLDivElement>\` | - |
| \`node\` | 이벤트가 발생한 노드예요. | [\`TreeDataNode\`](#tree-data-node) | - |

### <span id="tree-drag-enter-info">TreeDragEnterInfo</span>

TreeDragInfo의 필드와 함께 아래 값을 전달해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`expandedKeys\` | 현재 펼쳐진 노드 키 목록이에요. | \`Key[]\` | - |

### <span id="tree-drop-info">TreeDropInfo</span>

TreeDragInfo의 필드와 함께 아래 값을 전달해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`dragNode\` | 이동한 노드예요. | [\`TreeDataNode\`](#tree-data-node) | - |
| \`dragNodesKeys\` | 이동한 노드와 모든 하위 노드 키예요. | \`Key[]\` | - |
| \`dropPosition\` | 대상의 위·안·아래 위치예요. | [\`TreeDropPositionType\`](#tree-drop-position-type) | - |
| \`dropToGap\` | 노드 사이에 놓았는지 나타내요. | \`boolean\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="tree-checked-keys">TreeCheckedKeys</h3>
          <p>체크된 키만 전달하거나 부분 체크 키를 함께 전달해요.</p>
          <TypeTokens values={treeCheckedKeyTypes} />
          <h3 id="tree-draggable-type">TreeDraggableType</h3>
          <p>
            전체 드래그를 설정하거나 노드별 조건을 지정해요. 객체 설정은{" "}
            <a href="#tree-draggable-config">TreeDraggableConfig</a>를 사용해요.
          </p>
          <TypeTokens values={treeDraggableTypes} />
          <h3 id="tree-drop-position-type">TreeDropPositionType</h3>
          <p>-1은 위, 0은 안, 1은 아래를 나타내요.</p>
          <TypeTokens values={treeDropPositions} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Tree>;
export default meta;
type Story = StoryObj<typeof meta>;

const basicSource = `<Tree
  defaultExpandAll
  treeData={[
    {
      key: 'src',
      title: 'src',
      children: [
        {
          key: 'components',
          title: 'components',
          children: [{ key: 'button', title: 'Button.tsx' }],
        },
        { key: 'index', title: 'index.ts' },
      ],
    },
    { key: 'package', title: 'package.json' },
  ]}
/>`;
const source = `<Tree
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
    { key: 'readme', title: 'README.md' },
  ]}
/>`;
const controlledTreeDataSource = `const treeData = [
  {
    key: 'src',
    title: 'src',
    children: [
      {
        key: 'components',
        title: 'components',
        children: [{ key: 'button', title: 'Button.tsx', isLeaf: true }],
      },
      { key: 'index', title: 'index.ts', isLeaf: true },
    ],
  },
  { key: 'package', title: 'package.json', isLeaf: true },
];`;
export const Basic: Story = {
  args: {
    treeData: basicTreeData,
    defaultExpandAll: true,
    blockNode: false,
    checkable: false,
    checkStrictly: false,
    selectable: true,
    multiple: false,
    disabled: false,
    draggable: false,
    height: 240,
  },
  parameters: {
    ...storyDescription("components-tree--basic"),
    controls: {
      include: [
        "가로 채우기",
        "체크박스",
        "독립 체크",
        "선택 가능",
        "다중 선택",
        "비활성",
        "드래그",
        "높이",
      ],
    },
    docs: {
      ...storyDescription("components-tree--basic").docs,
      source: { type: "code", code: withStoryImports(basicSource) },
    },
  },
};
export const Icons: Story = {
  args: {
    treeData,
    defaultExpandAll: true,
    blockNode: false,
    checkable: false,
    checkStrictly: false,
    selectable: true,
    multiple: false,
    disabled: false,
    height: 240,
  },
  parameters: {
    ...storyDescription("components-tree--icons"),
    controls: {
      include: ["가로 채우기", "체크박스", "독립 체크", "선택 가능", "다중 선택", "비활성", "높이"],
    },
    docs: {
      ...storyDescription("components-tree--icons").docs,
      source: { type: "code", code: withStoryImports(source) },
    },
  },
};
export const Checkable: Story = {
  args: {
    treeData,
    defaultExpandAll: true,
    checkable: true,
    blockNode: false,
    checkStrictly: false,
    selectable: true,
    multiple: false,
    disabled: false,
    height: 240,
    defaultCheckedKeys: ["button"],
  },
  parameters: {
    ...storyDescription("components-tree--checkable"),
    controls: {
      include: ["가로 채우기", "체크박스", "독립 체크", "선택 가능", "다중 선택", "비활성", "높이"],
    },
    docs: {
      ...storyDescription("components-tree--checkable").docs,
      source: {
        type: "code",
        code: withStoryImports(
          source.replace("<Tree\n", "<Tree\n  checkable\n  defaultCheckedKeys={['button']}\n"),
        ),
      },
    },
  },
};
export const Draggable: Story = {
  args: {
    blockNode: true,
    checkable: false,
    selectable: true,
    multiple: false,
    disabled: false,
    checkStrictly: false,
  },
  parameters: {
    ...storyDescription("components-tree--draggable"),
    controls: {
      include: ["체크박스", "독립 체크", "선택 가능", "다중 선택", "비활성"],
    },
    docs: {
      ...storyDescription("components-tree--draggable").docs,
      source: {
        type: "code",
        code: withStoryImports(`const data: TreeDataNode[] = [
  {
    key: 'project',
    title: '프로젝트',
    children: [
      { key: 'design', title: '디자인' },
      { key: 'development', title: '개발' },
    ],
  },
  { key: 'documents', title: '문서' },
  { key: 'assets', title: '에셋', icon: <Icon icon="folder-outlined" /> },
  { key: 'guide', title: '가이드.md', icon: <Icon icon="file-outlined" /> },
  { key: 'releases', title: '릴리스' },
  { key: 'settings', title: '설정', icon: <Icon icon="setting" /> },
  { key: 'archive', title: '보관함' },
];

<Tree blockNode draggable defaultExpandAll defaultTreeData={data} />`),
      },
    },
  },
  render: (args) => <DraggableTreeExample {...args} />,
};

function DraggableTreeExample(args: Partial<TreeProps>) {
  return (
    <Tree {...args} blockNode draggable defaultExpandAll defaultTreeData={draggableTreeData} />
  );
}

export const ControlledState: Story = {
  args: {
    blockNode: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-tree--controlled-state"),
    controls: { include: ["가로 채우기", "비활성"] },
    docs: {
      ...storyDescription("components-tree--controlled-state").docs,
      source: {
        type: "code",
        code: withStoryImports(`${controlledTreeDataSource}

function ControlledTree() {
  const [expandedKeys, setExpandedKeys] = useState(['src', 'components']);
  const [selectedKeys, setSelectedKeys] = useState(['button']);
  const [checkedKeys, setCheckedKeys] = useState(['button']);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <span>선택: {selectedKeys.join(', ') || '-'}</span>
        <span>체크: {checkedKeys.join(', ') || '-'}</span>
      </div>
      <Tree
        checkable
        treeData={treeData}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        checkedKeys={checkedKeys}
        onExpand={(keys) => setExpandedKeys(keys)}
        onSelect={(keys) => setSelectedKeys(keys)}
        onCheck={(keys) => setCheckedKeys(Array.isArray(keys) ? keys : keys.checked)}
      />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <ControlledTreeExample {...args} />,
};

function ControlledTreeExample(args: Partial<TreeProps>) {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(["src", "components"]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(["button"]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(["button"]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-3 text-sm text-[#666]">
        <span>선택: {selectedKeys.join(", ") || "-"}</span>
        <span>체크: {checkedKeys.join(", ") || "-"}</span>
      </div>
      <Tree
        {...args}
        checkable
        treeData={treeData}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        checkedKeys={checkedKeys}
        onExpand={(keys) => setExpandedKeys(keys)}
        onSelect={(keys) => setSelectedKeys(keys)}
        onCheck={(keys) => setCheckedKeys(Array.isArray(keys) ? keys : keys.checked)}
      />
    </div>
  );
}

export const CustomTitles: Story = {
  args: {
    defaultExpandAll: true,
    blockNode: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-tree--custom-titles"),
    controls: { include: ["가로 채우기", "비활성"] },
    docs: {
      ...storyDescription("components-tree--custom-titles").docs,
      source: {
        type: "code",
        code: withStoryImports(`${controlledTreeDataSource}

<Tree
  defaultExpandAll
  treeData={treeData}
  titleRender={(node) => (
    <span className="flex items-center gap-2">
      <span>{node.title}</span>
      {node.isLeaf ? (
        <span className="rounded bg-[#f5f5f5] px-1.5 text-xs text-[#666]">파일</span>
      ) : null}
    </span>
  )}
/>`),
      },
    },
  },
  render: (args) => (
    <Tree
      {...args}
      treeData={treeData}
      titleRender={(node) => (
        <span className="flex items-center gap-2">
          <span>{node.title}</span>
          {node.isLeaf ? (
            <span className="rounded bg-[#f5f5f5] px-1.5 text-xs text-[#666]">파일</span>
          ) : null}
        </span>
      )}
    />
  ),
};

export const AsyncLoading: Story = {
  args: {
    blockNode: false,
    checkable: false,
    selectable: true,
    multiple: false,
    disabled: false,
    checkStrictly: false,
    height: 240,
  },
  parameters: {
    ...storyDescription("components-tree--async-loading"),
    controls: {
      include: ["가로 채우기", "체크박스", "독립 체크", "선택 가능", "다중 선택", "비활성", "높이"],
    },
    docs: {
      ...storyDescription("components-tree--async-loading").docs,
      source: {
        type: "code",
        code: withStoryImports(`function AsyncTreeExample() {
  const [data, setData] = useState([
    {
      key: 'team',
      title: '팀 문서',
      icon: <Icon icon="folder-outlined" />,
      isLeaf: false,
    },
  ]);

  const loadData = async (node) => {
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    setData((current) =>
      current.map((item) =>
        item.key === node.key
          ? {
              ...item,
              children: [
                {
                  key: 'guide',
                  title: '가이드.md',
                  icon: <Icon icon="file-outlined" />,
                  isLeaf: true,
                },
                {
                  key: 'plan',
                  title: '계획.md',
                  icon: <Icon icon="file-outlined" />,
                  isLeaf: true,
                },
              ],
            }
          : item,
      ),
    );
  };

  return <Tree treeData={data} loadData={loadData} />;
}`),
      },
    },
  },
  render: (args) => <AsyncTreeExample {...args} />,
};

function AsyncTreeExample(args: Partial<TreeProps>) {
  const [data, setData] = useState<TreeDataNode[]>([
    {
      key: "team",
      title: "팀 문서",
      icon: <Icon icon="folder-outlined" />,
      isLeaf: false,
    },
  ]);

  const loadData = async (node: TreeDataNode) => {
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    setData((current) =>
      current.map((item) =>
        item.key === node.key
          ? {
              ...item,
              children: [
                {
                  key: "guide",
                  title: "가이드.md",
                  icon: <Icon icon="file-outlined" />,
                  isLeaf: true,
                },
                {
                  key: "plan",
                  title: "계획.md",
                  icon: <Icon icon="file-outlined" />,
                  isLeaf: true,
                },
              ],
            }
          : item,
      ),
    );
  };

  return <Tree {...args} treeData={data} loadData={loadData} />;
}
