import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Tree } from "./Tree";
import type { TreeDataNode, TreeDropInfo } from "./Tree.types";

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
  { key: "archive", title: "보관함" },
];

function moveTreeNode(data: TreeDataNode[], info: TreeDropInfo) {
  const cloneTree = (nodes: TreeDataNode[]): TreeDataNode[] =>
    nodes.map((node) => ({
      ...node,
      children: node.children ? cloneTree(node.children) : undefined,
    }));
  const next = cloneTree(data);
  let dragged: TreeDataNode | undefined;
  const find = (
    nodes: TreeDataNode[],
    key: React.Key,
    callback: (node: TreeDataNode, index: number, siblings: TreeDataNode[]) => void,
  ) => {
    for (const [index, node] of nodes.entries()) {
      if (Object.is(node.key, key)) {
        callback(node, index, nodes);
        return true;
      }
      if (node.children && find(node.children, key, callback)) return true;
    }
    return false;
  };

  find(next, info.dragNode.key, (node, index, siblings) => {
    [dragged] = siblings.splice(index, 1);
  });
  if (!dragged) return next;

  find(next, info.node.key, (node, index, siblings) => {
    if (!info.dropToGap) {
      node.children = [dragged!, ...(node.children ?? [])];
    } else {
      siblings.splice(info.dropPosition === -1 ? index : index + 1, 0, dragged!);
    }
  });
  return next;
}
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
          "중첩된 데이터를 펼치고 접을 수 있는 계층 구조로 보여줘요.  \n단일·다중 선택, 연관 체크, 드래그 이동, 연결선, 비동기 로드와 고정 높이 스크롤을 지원해요.",
      },
      page: () => (
        <div className="tree-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Tree

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
| \`draggable\` | 노드 드래그와 핸들을 설정해요. | [\`TreeDraggableType\`](#tree-draggable-type) | \`false\` |
| \`allowDrop\` | 위치별 드롭 허용 여부를 정해요. | \`({ dropNode, dropPosition }) => boolean\` | - |
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
| \`onDragStart\` | 노드 드래그를 시작할 때 실행해요. | \`(info: TreeDragInfo) => void\` | - |
| \`onDragEnter\` | 드래그가 노드에 들어올 때 실행해요. | \`(info: TreeDragEnterInfo) => void\` | - |
| \`onDragOver\` | 노드 위에서 드래그할 때 실행해요. | \`(info: TreeDragInfo) => void\` | - |
| \`onDragLeave\` | 드래그가 노드를 벗어날 때 실행해요. | \`(info: TreeDragInfo) => void\` | - |
| \`onDragEnd\` | 노드 드래그가 끝날 때 실행해요. | \`(info: TreeDragInfo) => void\` | - |
| \`onDrop\` | 노드를 놓은 위치와 이동 정보를 전달해요. | [\`(info: TreeDropInfo) => void\`](#tree-drop-info) | - |

### TreeDataNode

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 노드를 구분하는 고유한 값이에요. | \`Key\` | - |
| \`title\` | 노드에 표시할 내용이에요. | \`ReactNode\` | - |
| \`children\` | 하위 노드 목록이에요. | \`TreeDataNode[]\` | - |
| \`disabled\` | 노드의 모든 동작을 막아요. | \`boolean\` | \`false\` |
| \`disableCheckbox\` | 노드의 체크박스만 비활성화해요. | \`boolean\` | \`false\` |
| \`isLeaf\` | 자식이 없는 리프 노드임을 명시해요. | \`boolean\` | 자동 판단 |

### <span id="tree-draggable-type">TreeDraggableType</span>

| Type | Description |
| --- | --- |
| \`boolean\` | 전체 노드의 드래그를 켜거나 꺼요. |
| \`(node) => boolean\` | 노드별 드래그 허용 여부를 정해요. |
| \`TreeDraggableConfig\` | 핸들 아이콘과 노드별 허용 조건을 설정해요. |

### TreeDraggableConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`icon\` | 드래그 핸들 아이콘을 설정해요. | \`ReactNode \\| false\` | drag-handle Icon |
| \`nodeDraggable\` | 노드별 드래그 허용 여부를 정해요. | \`(node) => boolean\` | 모든 노드 |

### <span id="tree-drop-info">TreeDropInfo</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`event\` | 드롭 이벤트예요. | \`DragEvent\` | - |
| \`node\` | 드롭 대상 노드예요. | \`TreeDataNode\` | - |
| \`dragNode\` | 이동한 노드예요. | \`TreeDataNode\` | - |
| \`dragNodesKeys\` | 이동한 노드와 하위 노드 키예요. | \`Key[]\` | - |
| \`dropPosition\` | 위·안·아래 위치예요. | \`-1 \\| 0 \\| 1\` | - |
| \`dropToGap\` | 노드 사이에 놓았는지 나타내요. | \`boolean\` | - |
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

export const Draggable: Story = {
  parameters: {
    ...storyDescription("components-tree--draggable"),
    docs: {
      ...storyDescription("components-tree--draggable").docs,
      source: {
        type: "code",
        code: withStoryImports(`function DraggableTree() {
  const [data, setData] = useState<TreeDataNode[]>([
    {
      key: 'project',
      title: '프로젝트',
      children: [
        { key: 'design', title: '디자인' },
        { key: 'development', title: '개발' },
      ],
    },
    { key: 'documents', title: '문서' },
    { key: 'archive', title: '보관함' },
  ]);

  const moveTreeNode = (current: TreeDataNode[], info: TreeDropInfo) => {
    const cloneTree = (nodes: TreeDataNode[]): TreeDataNode[] =>
      nodes.map((node) => ({
        ...node,
        children: node.children ? cloneTree(node.children) : undefined,
      }));
    const next = cloneTree(current);
    let dragged: TreeDataNode | undefined;
    const find = (
      nodes: TreeDataNode[],
      key: TreeDataNode['key'],
      callback: (node: TreeDataNode, index: number, siblings: TreeDataNode[]) => void,
    ) => {
      for (const [index, node] of nodes.entries()) {
        if (node.key === key) {
          callback(node, index, nodes);
          return true;
        }
        if (node.children && find(node.children, key, callback)) return true;
      }
      return false;
    };

    find(next, info.dragNode.key, (node, index, siblings) => {
      [dragged] = siblings.splice(index, 1);
    });
    find(next, info.node.key, (node, index, siblings) => {
      if (!info.dropToGap) node.children = [dragged!, ...(node.children ?? [])];
      else siblings.splice(info.dropPosition === -1 ? index : index + 1, 0, dragged!);
    });
    return next;
  };

  return (
    <Tree
      blockNode
      draggable
      defaultExpandAll
      treeData={data}
      onDrop={(info) => setData((current) => moveTreeNode(current, info))}
    />
  );
}`),
      },
    },
  },
  render: () => <DraggableTreeExample />,
};

function DraggableTreeExample() {
  const [data, setData] = useState(draggableTreeData);
  return (
    <Tree
      blockNode
      draggable
      defaultExpandAll
      treeData={data}
      onDrop={(info) => setData((current) => moveTreeNode(current, info))}
    />
  );
}

export const AsyncLoading: Story = {
  parameters: {
    ...storyDescription("components-tree--async-loading"),
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
                { key: 'guide', title: '가이드.md', icon: <Icon icon="file-outlined" /> },
                { key: 'plan', title: '계획.md', icon: <Icon icon="file-outlined" /> },
              ],
            }
          : item,
      ),
    );
  };

  return <Tree showIcon treeData={data} loadData={loadData} />;
}`),
      },
    },
  },
  render: () => <AsyncTreeExample />,
};

function AsyncTreeExample() {
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
                { key: "guide", title: "가이드.md", icon: <Icon icon="file-outlined" /> },
                { key: "plan", title: "계획.md", icon: <Icon icon="file-outlined" /> },
              ],
            }
          : item,
      ),
    );
  };

  return <Tree showIcon treeData={data} loadData={loadData} />;
}
