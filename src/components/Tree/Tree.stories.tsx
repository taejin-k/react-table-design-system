import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Tree } from "./Tree";
import type { TreeDataNode, TreeProps } from "./Tree.types";

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
const controlledTreeData: TreeDataNode[] = [
  {
    key: "src",
    title: "src",
    children: [
      {
        key: "components",
        title: "components",
        children: [{ key: "button", title: "Button.tsx", isLeaf: true }],
      },
      { key: "index", title: "index.ts", isLeaf: true },
    ],
  },
  { key: "package", title: "package.json", isLeaf: true },
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
    fullWidth: { name: "전체 너비", control: "boolean" },
    checkable: { name: "체크박스", control: "boolean" },
    checkStrictly: { name: "독립 체크", control: "boolean" },
    selectable: { name: "선택 가능", control: "boolean" },
    multiple: { name: "다중 선택", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    draggable: { name: "드래그", control: "boolean" },
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
          "중첩된 데이터를 펼치고 접을 수 있는 계층 구조로 보여줘요.  \n단일·다중 선택, 연관 체크, 드래그 이동과 비동기 로드를 지원해요.",
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
| \`defaultTreeData\` | 내부에서 관리할 초기 노드 데이터를 전달해요. | [\`TreeDataNode[]\`](#tree-data-node) | \`[]\` |
| \`fullWidth\` | 노드의 선택·hover 영역을 부모 너비만큼 채워요. | \`boolean\` | \`false\` |
| \`expandedKeys\` | 펼친 노드를 제어해요. | \`Key[]\` | - |
| \`defaultExpandedKeys\` | 처음 펼칠 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`selectedKeys\` | 선택된 노드를 제어해요. | \`Key[]\` | - |
| \`defaultSelectedKeys\` | 처음 선택할 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`checkedKeys\` | 체크된 노드 키 목록을 제어해요. | \`Key[]\` | - |
| \`defaultCheckedKeys\` | 처음 체크할 노드를 정해요. | \`Key[]\` | \`[]\` |
| \`defaultExpandAll\` | 처음에 모든 노드를 펼쳐요. | \`boolean\` | \`false\` |
| \`checkable\` | 각 노드에 체크박스를 표시해요. | \`boolean\` | \`false\` |
| \`checkStrictly\` | 부모와 자식의 체크 상태를 분리해요. | \`boolean\` | \`false\` |
| \`selectable\` | 노드를 클릭해 선택할 수 있는지 정해요. | \`boolean\` | \`true\` |
| \`multiple\` | 여러 노드를 동시에 선택해요. | \`boolean\` | \`false\` |
| \`disabled\` | 전체 Tree 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`draggable\` | 드래그를 켜거나, 함수로 드래그할 노드를 정해요. | <code>boolean \\| ((node: <a href="#tree-data-node">TreeDataNode</a>) =&gt; boolean)</code> | \`false\` |
| \`allowDrop\` | 특정 노드를 기준으로 한 드롭을 허용할지 정해요. | <code>(node: <a href="#tree-data-node">TreeDataNode</a>) =&gt; boolean</code> | - |
| \`allowChildren\` | 계층 이동을 허용하거나 자식을 받을 노드를 정해요. | <code>boolean \\| ((node: <a href="#tree-data-node">TreeDataNode</a>) =&gt; boolean)</code> | \`true\` |
| \`titleRender\` | 노드 제목을 직접 구성해요. | <code>(node: <a href="#tree-data-node">TreeDataNode</a>) =&gt; ReactNode</code> | - |
| \`loadData\` | 노드를 펼칠 때 자식 데이터를 비동기로 불러와요. | <code>(node: <a href="#tree-data-node">TreeDataNode</a>) =&gt; Promise&lt;void&gt;</code> | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onExpand\` | 펼친 노드가 바뀔 때 실행해요. | \`(expandedKeys: Key[]) => void\` | - |
| \`onSelect\` | 선택된 노드가 바뀔 때 실행해요. | \`(selectedKeys: Key[]) => void\` | - |
| \`onCheck\` | 체크 상태가 바뀔 때 실행해요. | \`(checkedKeys: Key[]) => void\` | - |
| \`onDragStart\` | 노드 드래그를 시작할 때 실행해요. | <code>(info: <a href="#tree-drag-info">TreeDragInfo</a>) =&gt; void</code> | - |
| \`onDragEnd\` | 노드 드래그가 끝날 때 실행해요. | <code>(info: <a href="#tree-drag-info">TreeDragInfo</a>) =&gt; void</code> | - |
| \`onDrop\` | 노드를 놓은 위치와 이동 정보를 전달해요. | <code>(info: <a href="#tree-drop-info">TreeDropInfo</a>) =&gt; void</code> | - |
| \`onTreeDataChange\` | 드래그 후 전체 노드 데이터와 이동 정보를 전달해요. | <code>(info: <a href="#tree-drop-info">TreeDropInfo</a>) =&gt; void</code> | - |

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

### <span id="tree-drag-info">TreeDragInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`event\` | 원본 드래그 이벤트예요. | \`DragEvent<HTMLDivElement>\` | - |
| \`dragNode\` | 사용자가 잡아 이동 중인 노드예요. | [\`TreeDataNode\`](#tree-data-node) | - |

### <span id="tree-drop-info">TreeDropInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`event\` | 원본 드롭 이벤트예요. | \`DragEvent<HTMLDivElement>\` | - |
| \`dragNode\` | 사용자가 잡아서 이동시킨 노드예요. | [\`TreeDataNode\`](#tree-data-node) | - |
| \`treeData\` | 드롭이 반영된 최종 전체 노드 데이터예요. | [\`TreeDataNode[]\`](#tree-data-node) | - |
| \`parentKey\` | 이동한 노드의 부모 키예요. 최상위면 \`null\`이에요. | \`Key \\| null\` | - |
| \`index\` | 부모 안에서 이동한 노드의 0부터 시작하는 순서예요. | \`number\` | - |
          `}</Markdown>
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
const draggableTreeDataSource = `const data: TreeDataNode[] = [
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
];`;
export const Basic: Story = {
  args: {
    treeData: basicTreeData,
    defaultExpandAll: true,
    fullWidth: false,
    checkable: false,
    checkStrictly: false,
    selectable: true,
    multiple: false,
    disabled: false,
    draggable: false,
  },
  parameters: {
    ...storyDescription("components-tree--basic"),
    controls: {
      include: ["전체 너비", "체크박스", "독립 체크", "선택 가능", "다중 선택", "비활성", "드래그"],
    },
    docs: {
      ...storyDescription("components-tree--basic").docs,
      source: { type: "code", code: withStoryImports(basicSource) },
    },
  },
};
export const Multiple: Story = {
  args: {
    treeData: basicTreeData,
    defaultExpandAll: true,
    defaultSelectedKeys: ["components", "package"],
    multiple: true,
    fullWidth: false,
    selectable: true,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-tree--multiple"),
    controls: { include: ["전체 너비", "선택 가능", "비활성"] },
    docs: {
      ...storyDescription("components-tree--multiple").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Tree
  multiple
  defaultExpandAll
  defaultSelectedKeys={['components', 'package']}
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
/>`),
      },
    },
  },
};
export const Disabled: Story = {
  args: {
    treeData,
    defaultExpandAll: true,
    defaultCheckedKeys: ["button"],
    checkable: true,
    disabled: true,
    fullWidth: false,
  },
  parameters: {
    ...storyDescription("components-tree--disabled"),
    controls: { include: ["전체 너비", "체크박스"] },
    docs: {
      ...storyDescription("components-tree--disabled").docs,
      source: {
        type: "code",
        code: withStoryImports(
          source.replace(
            "<Tree\n",
            "<Tree\n  disabled\n  checkable\n  defaultCheckedKeys={['button']}\n",
          ),
        ),
      },
    },
  },
};
export const FullWidth: Story = {
  args: {
    treeData: basicTreeData,
    defaultExpandAll: true,
    defaultSelectedKeys: ["components"],
    fullWidth: true,
    selectable: true,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-tree--full-width"),
    controls: { include: ["전체 너비", "선택 가능", "비활성"] },
    docs: {
      ...storyDescription("components-tree--full-width").docs,
      source: {
        type: "code",
        code: withStoryImports(
          basicSource.replace(
            "<Tree\n",
            "<Tree\n  fullWidth\n  defaultSelectedKeys={['components']}\n",
          ),
        ),
      },
    },
  },
};
export const Icons: Story = {
  args: {
    treeData,
    defaultExpandAll: true,
    fullWidth: false,
    checkable: false,
    checkStrictly: false,
    selectable: true,
    multiple: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-tree--icons"),
    controls: {
      include: ["전체 너비", "체크박스", "독립 체크", "선택 가능", "다중 선택", "비활성"],
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
    fullWidth: false,
    checkStrictly: false,
    selectable: true,
    multiple: false,
    disabled: false,
    defaultCheckedKeys: ["button"],
  },
  parameters: {
    ...storyDescription("components-tree--checkable"),
    controls: {
      include: ["전체 너비", "체크박스", "독립 체크", "선택 가능", "다중 선택", "비활성"],
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

<Tree draggable defaultExpandAll defaultTreeData={data} />`),
      },
    },
  },
  render: (args) => <DraggableTreeExample {...args} />,
};

function DraggableTreeExample(args: Partial<TreeProps>) {
  return <Tree {...args} draggable defaultExpandAll defaultTreeData={draggableTreeData} />;
}

export const OrderOnlyDrop: Story = {
  args: { disabled: false },
  parameters: {
    ...storyDescription("components-tree--order-only-drop"),
    controls: { include: ["비활성"] },
    docs: {
      ...storyDescription("components-tree--order-only-drop").docs,
      source: {
        type: "code",
        code: withStoryImports(`${draggableTreeDataSource}

<Tree
  fullWidth
  draggable
  defaultExpandAll
  defaultTreeData={data}
  allowChildren={false}
/>`),
      },
    },
  },
  render: (args) => (
    <Tree
      {...args}
      fullWidth
      draggable
      defaultExpandAll
      defaultTreeData={draggableTreeData}
      allowChildren={false}
    />
  ),
};

export const ProjectChildrenOnly: Story = {
  args: { disabled: false },
  parameters: {
    ...storyDescription("components-tree--project-children-only"),
    controls: { include: ["비활성"] },
    docs: {
      ...storyDescription("components-tree--project-children-only").docs,
      source: {
        type: "code",
        code: withStoryImports(`${draggableTreeDataSource}

<Tree
  fullWidth
  draggable
  defaultExpandAll
  defaultTreeData={data}
  allowChildren={(node) => node.key === 'project'}
/>`),
      },
    },
  },
  render: (args) => (
    <Tree
      {...args}
      fullWidth
      draggable
      defaultExpandAll
      defaultTreeData={draggableTreeData}
      allowChildren={(node) => node.key === "project"}
    />
  ),
};

export const DesignChildrenOnly: Story = {
  args: { disabled: false },
  parameters: {
    ...storyDescription("components-tree--design-children-only"),
    controls: { include: ["비활성"] },
    docs: {
      ...storyDescription("components-tree--design-children-only").docs,
      source: {
        type: "code",
        code: withStoryImports(`${draggableTreeDataSource}

<Tree
  fullWidth
  draggable
  defaultExpandAll
  defaultTreeData={data}
  allowChildren={(node) => node.key === 'design'}
/>`),
      },
    },
  },
  render: (args) => (
    <Tree
      {...args}
      fullWidth
      draggable
      defaultExpandAll
      defaultTreeData={draggableTreeData}
      allowChildren={(node) => node.key === "design"}
    />
  ),
};

export const ProtectedReleases: Story = {
  args: { disabled: false },
  parameters: {
    ...storyDescription("components-tree--protected-releases"),
    controls: { include: ["비활성"] },
    docs: {
      ...storyDescription("components-tree--protected-releases").docs,
      source: {
        type: "code",
        code: withStoryImports(`${draggableTreeDataSource}

<Tree
  fullWidth
  draggable
  defaultExpandAll
  defaultTreeData={data}
  allowDrop={(node) => node.key !== 'releases'}
/>`),
      },
    },
  },
  render: (args) => (
    <Tree
      {...args}
      fullWidth
      draggable
      defaultExpandAll
      defaultTreeData={draggableTreeData}
      allowDrop={(node) => node.key !== "releases"}
    />
  ),
};

export const FolderDropTargets: Story = {
  args: { disabled: false },
  parameters: {
    ...storyDescription("components-tree--folder-drop-targets"),
    controls: { include: ["비활성"] },
    docs: {
      ...storyDescription("components-tree--folder-drop-targets").docs,
      source: {
        type: "code",
        code: withStoryImports(`${draggableTreeDataSource}

<Tree
  fullWidth
  draggable
  defaultExpandAll
  defaultTreeData={data}
  allowChildren={(node) => node.key === 'project' || node.key === 'archive'}
/>`),
      },
    },
  },
  render: (args) => (
    <Tree
      {...args}
      fullWidth
      draggable
      defaultExpandAll
      defaultTreeData={draggableTreeData}
      allowChildren={(node) => node.key === "project" || node.key === "archive"}
    />
  ),
};

export const ControlledState: Story = {
  args: {
    fullWidth: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-tree--controlled-state"),
    controls: { include: ["전체 너비", "비활성"] },
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
        onExpand={setExpandedKeys}
        onSelect={setSelectedKeys}
        onCheck={setCheckedKeys}
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
        treeData={controlledTreeData}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        checkedKeys={checkedKeys}
        onExpand={setExpandedKeys}
        onSelect={setSelectedKeys}
        onCheck={setCheckedKeys}
      />
    </div>
  );
}

export const CustomTitles: Story = {
  args: {
    defaultExpandAll: true,
    fullWidth: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-tree--custom-titles"),
    controls: { include: ["전체 너비", "비활성"] },
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
      treeData={controlledTreeData}
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
    fullWidth: false,
    checkable: false,
    selectable: true,
    multiple: false,
    disabled: false,
    checkStrictly: false,
  },
  parameters: {
    ...storyDescription("components-tree--async-loading"),
    controls: {
      include: ["전체 너비", "체크박스", "독립 체크", "선택 가능", "다중 선택", "비활성"],
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
