import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Drawer } from "./Drawer";
import type { DrawerPlacementType, DrawerProps, DrawerSizeType } from "./Drawer.types";

const drawerPlacements: DrawerPlacementType[] = ["top", "right", "bottom", "left"];
const drawerSizes = ["default", "large", "number", "string"] satisfies readonly DrawerSizeType[];
const resizeExamples = {
  default: {
    title: "기본 리사이즈",
    placement: "right",
    size: "default",
    resizable: true,
    guide: "왼쪽 가장자리를 드래그해요. 최소 크기는 기본값인 180px이에요.",
  },
  percent: {
    title: "비율 크기와 제한",
    placement: "right",
    size: "50%",
    resizable: { min: 320, max: 900 },
    guide: "현재 50% 너비에서 시작하고 320~900px 안에서 조절돼요.",
  },
  bottom: {
    title: "세로 리사이즈",
    placement: "bottom",
    size: 320,
    resizable: { min: 200, max: 600 },
    guide: "위쪽 가장자리를 드래그해 높이를 200~600px로 조절해요.",
  },
} as const;

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  argTypes: {
    title: { name: "제목", control: "text" },
    placement: { name: "위치", control: "select", options: drawerPlacements },
    size: { name: "크기", control: "select", options: ["default", "large"] },
    closable: { name: "닫기 버튼", control: "boolean" },
    keyboard: { name: "Escape 닫기", control: "boolean" },
    mask: { name: "배경 마스크", control: "boolean" },
    scrollLock: { name: "스크롤 잠금", control: "boolean" },
    open: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    onClose: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "화면 가장자리에서 추가 정보나 작업 영역을 열어요.  \n방향·크기·중첩·리사이즈와 header·footer를 설정할 수 있어요.",
      },
      page: () => (
        <div className="drawer-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Drawer

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`open\` | Drawer 표시 상태를 설정해요. | \`boolean\` | \`false\` |
| \`title\` | header 제목을 설정해요. | \`ReactNode\` | - |
| \`children\` | 본문 내용을 설정해요. | \`ReactNode\` | - |
| \`placement\` | 열리는 방향을 설정해요. | [\`DrawerPlacementType\`](#drawer-placement-type) | \`right\` |
| \`size\` | 기본·큰 크기 또는 직접 크기를 설정해요. | [\`DrawerSizeType\`](#drawer-size-type) | \`default\` |
| \`closable\` | 닫기 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`extra\` | header 오른쪽에 작업을 추가해요. | \`ReactNode\` | - |
| \`footer\` | footer 내용을 설정해요. | \`ReactNode\` | - |
| \`keyboard\` | Escape로 닫을 수 있게 해요. | \`boolean\` | \`true\` |
| \`mask\` | 배경 마스크를 표시해요. | \`boolean\` | \`true\` |
| \`scrollLock\` | 열려 있는 동안 문서 스크롤을 잠가요. | \`boolean\` | \`true\` |
| \`forceRender\` | 닫힌 상태에서도 내용을 미리 렌더링해요. | \`boolean\` | \`false\` |
| \`destroyOnHidden\` | 닫힌 뒤 내용을 제거해요. | \`boolean\` | \`false\` |
| \`push\` | 자식 Drawer가 열릴 때 부모를 이동해요. | \`boolean\` | \`true\` |
| \`resizable\` | 드래그 크기 조절을 설정해요. | \`boolean \\|\` [\`DrawerResizableConfig\`](#drawer-resizable-config) | \`false\` |
| \`zIndex\` | 겹치는 순서를 설정해요. | \`number\` | \`1000\` |
| \`onAfterClose\` | 닫힘 애니메이션 뒤 실행해요. | \`() => void\` | - |
| \`onAfterOpen\` | 열림 애니메이션 뒤 실행해요. | \`() => void\` | - |
| \`onClose\` | 닫기 동작이 발생하면 실행해요. | \`(event) => void\` | - |

### <span id="drawer-resizable-config">DrawerResizableConfig</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`min\` | 줄일 수 있는 최소 크기예요. | \`number\` | \`180\` |
| \`max\` | 늘릴 수 있는 최대 크기예요. | \`number\` | - |
| \`onResizeStart\` | 크기 조절을 시작할 때 실행해요. | \`(size) => void\` | - |
| \`onResize\` | 크기를 조절할 때 실행해요. | \`(size) => void\` | - |
| \`onResizeEnd\` | 크기 조절을 마칠 때 실행해요. | \`(size) => void\` | - |
      `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="drawer-placement-type">DrawerPlacementType</h3>
          <p>Drawer가 열리는 방향을 선택해요.</p>
          <TypeTokens values={drawerPlacements} />
          <h3 id="drawer-size-type">DrawerSizeType</h3>
          <p>기본 크기, px 숫자 또는 CSS 길이를 사용해요.</p>
          <TypeTokens values={drawerSizes} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: "구성원 정보",
    placement: "right",
    size: "default",
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
  },
  parameters: {
    ...storyDescription("components-drawer--basic"),
    controls: {
      include: ["제목", "위치", "크기", "닫기 버튼", "Escape 닫기", "배경 마스크", "스크롤 잠금"],
    },
    docs: {
      ...storyDescription("components-drawer--basic").docs,
      source: {
        code: withStoryImports(`function BasicDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Drawer 열기</Button>
      <Drawer open={open} title="구성원 정보" onClose={() => setOpen(false)}>
        Drawer 본문이에요.
      </Drawer>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <BasicDrawerExample {...args} />,
};

function BasicDrawerExample(args: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Drawer 열기</Button>
      <Drawer {...args} open={open} onClose={() => setOpen(false)}>
        Drawer 본문이에요.
      </Drawer>
    </>
  );
}

export const Placements: Story = {
  args: { size: "default", closable: true, keyboard: true, mask: true, scrollLock: true },
  parameters: {
    ...storyDescription("components-drawer--placements"),
    controls: {
      include: ["크기", "닫기 버튼", "Escape 닫기", "배경 마스크", "스크롤 잠금"],
    },
    docs: {
      ...storyDescription("components-drawer--placements").docs,
      source: {
        code: withStoryImports(`const placements: DrawerPlacementType[] = ['top', 'right', 'bottom', 'left'];

function DrawerPlacements() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerPlacementType>('right');

  const showDrawer = (nextPlacement: DrawerPlacementType) => {
    setPlacement(nextPlacement);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {placements.map((item) => (
          <Button key={item} onClick={() => showDrawer(item)}>
            {item}
          </Button>
        ))}
      </div>
      <Drawer
        open={open}
        placement={placement}
        title={placement}
        onClose={() => setOpen(false)}
      >
        선택한 방향에서 열려요.
      </Drawer>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <PlacementExample {...args} />,
};

function PlacementExample(args: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerPlacementType>("right");

  const showDrawer = (nextPlacement: DrawerPlacementType) => {
    setPlacement(nextPlacement);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {(["top", "right", "bottom", "left"] as const).map((item) => (
          <Button key={item} onClick={() => showDrawer(item)}>
            {item}
          </Button>
        ))}
      </div>
      <Drawer
        {...args}
        open={open}
        placement={placement}
        title={placement}
        onClose={() => setOpen(false)}
      >
        선택한 방향에서 열려요.
      </Drawer>
    </>
  );
}

export const Sizes: Story = {
  args: { placement: "right", closable: true, keyboard: true, mask: true, scrollLock: true },
  parameters: {
    ...storyDescription("components-drawer--sizes"),
    controls: {
      include: ["위치", "닫기 버튼", "Escape 닫기", "배경 마스크", "스크롤 잠금"],
    },
    docs: {
      ...storyDescription("components-drawer--sizes").docs,
      source: {
        code: withStoryImports(`function DrawerSizes() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerSizeType>('default');

  const showDrawer = (nextSize: DrawerSizeType) => {
    setSize(nextSize);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => showDrawer('default')}>
          default
        </Button>
        <Button onClick={() => showDrawer('large')}>
          large
        </Button>
        <Button onClick={() => showDrawer(520)}>
          520px
        </Button>
      </div>
      <Drawer open={open} title="크기 비교" size={size} onClose={() => setOpen(false)}>
        선택한 크기로 열려요.
      </Drawer>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <SizesExample {...args} />,
};

function SizesExample(args: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<DrawerSizeType>("default");

  const showDrawer = (nextSize: DrawerSizeType) => {
    setSize(nextSize);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => showDrawer("default")}>default</Button>
        <Button onClick={() => showDrawer("large")}>large</Button>
        <Button onClick={() => showDrawer(520)}>520px</Button>
      </div>
      <Drawer {...args} open={open} title="크기 비교" size={size} onClose={() => setOpen(false)}>
        선택한 크기로 열려요.
      </Drawer>
    </>
  );
}

export const Resizable: Story = {
  args: { closable: true, keyboard: true, mask: true, scrollLock: true },
  parameters: {
    ...storyDescription("components-drawer--resizable"),
    controls: {
      include: ["닫기 버튼", "Escape 닫기", "배경 마스크", "스크롤 잠금"],
    },
    docs: {
      ...storyDescription("components-drawer--resizable").docs,
      source: {
        code: withStoryImports(`const resizeExamples = {
  default: {
    title: '기본 리사이즈',
    placement: 'right',
    size: 'default',
    resizable: true,
    guide: '왼쪽 가장자리를 드래그해요. 최소 크기는 기본값인 180px이에요.',
  },
  percent: {
    title: '비율 크기와 제한',
    placement: 'right',
    size: '50%',
    resizable: { min: 320, max: 900 },
    guide: '현재 50% 너비에서 시작하고 320~900px 안에서 조절돼요.',
  },
  bottom: {
    title: '세로 리사이즈',
    placement: 'bottom',
    size: 320,
    resizable: { min: 200, max: 600 },
    guide: '위쪽 가장자리를 드래그해 높이를 200~600px로 조절해요.',
  },
} as const;

function ResizableDrawer() {
  const [open, setOpen] = useState(false);
  const [example, setExample] = useState<keyof typeof resizeExamples>('default');
  const current = resizeExamples[example];

  const showDrawer = (nextExample: keyof typeof resizeExamples) => {
    setExample(nextExample);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => showDrawer('default')}>기본</Button>
        <Button onClick={() => showDrawer('percent')}>50% + min/max</Button>
        <Button onClick={() => showDrawer('bottom')}>하단 320px</Button>
      </div>
      <Drawer
        open={open}
        title={current.title}
        placement={current.placement}
        size={current.size}
        resizable={current.resizable}
        onClose={() => setOpen(false)}
      >
        {current.guide}
      </Drawer>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <ResizableExample {...args} />,
};

function ResizableExample(args: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  const [example, setExample] = useState<keyof typeof resizeExamples>("default");
  const current = resizeExamples[example];

  const showDrawer = (nextExample: keyof typeof resizeExamples) => {
    setExample(nextExample);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => showDrawer("default")}>기본</Button>
        <Button onClick={() => showDrawer("percent")}>50% + min/max</Button>
        <Button onClick={() => showDrawer("bottom")}>하단 320px</Button>
      </div>
      <Drawer
        {...args}
        open={open}
        title={current.title}
        placement={current.placement}
        size={current.size}
        resizable={current.resizable}
        onClose={() => setOpen(false)}
      >
        {current.guide}
      </Drawer>
    </>
  );
}

export const HeaderAndFooter: Story = {
  args: {
    placement: "right",
    size: "default",
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
  },
  parameters: {
    ...storyDescription("components-drawer--header-footer"),
    controls: {
      include: ["위치", "크기", "닫기 버튼", "Escape 닫기", "배경 마스크", "스크롤 잠금"],
    },
    docs: {
      ...storyDescription("components-drawer--header-footer").docs,
      source: {
        code: withStoryImports(`function DrawerLayout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>작업 Drawer</Button>
      <Drawer
        open={open}
        title="상세 정보"
        extra={<Button>편집</Button>}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>확인</Button>
          </div>
        }
        onClose={() => setOpen(false)}
      >
        구성원의 상세 정보를 확인하고 수정할 수 있어요.
      </Drawer>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <LayoutExample {...args} />,
};

function LayoutExample(args: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>작업 Drawer</Button>
      <Drawer
        {...args}
        open={open}
        title="상세 정보"
        extra={<Button>편집</Button>}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>확인</Button>
          </div>
        }
        onClose={() => setOpen(false)}
      >
        구성원의 상세 정보를 확인하고 수정할 수 있어요.
      </Drawer>
    </>
  );
}

export const ScrollableContent: Story = {
  args: {
    placement: "right",
    size: "default",
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
  },
  parameters: {
    ...storyDescription("components-drawer--scrollable"),
    controls: {
      include: ["위치", "크기", "닫기 버튼", "Escape 닫기", "배경 마스크", "스크롤 잠금"],
    },
    docs: {
      ...storyDescription("components-drawer--scrollable").docs,
      source: {
        code: withStoryImports(`function ScrollableDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>긴 본문 Drawer</Button>
      <Drawer
        open={open}
        title="활동 기록"
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>확인</Button>
          </div>
        }
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          {Array.from({ length: 50 }, (_, index) => (
            <p key={index}>활동 기록 {index + 1}</p>
          ))}
        </div>
      </Drawer>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <ScrollableExample {...args} />,
};

function ScrollableExample(args: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>긴 본문 Drawer</Button>
      <Drawer
        {...args}
        open={open}
        title="활동 기록"
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>확인</Button>
          </div>
        }
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          {Array.from({ length: 50 }, (_, index) => (
            <p key={index}>활동 기록 {index + 1}</p>
          ))}
        </div>
      </Drawer>
    </>
  );
}

export const Nested: Story = {
  args: {
    placement: "right",
    size: "default",
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
  },
  parameters: {
    ...storyDescription("components-drawer--nested"),
    controls: {
      include: ["위치", "크기", "닫기 버튼", "Escape 닫기", "배경 마스크", "스크롤 잠금"],
    },
    docs: {
      ...storyDescription("components-drawer--nested").docs,
      source: {
        code: withStoryImports(`function NestedDrawer() {
  const [open, setOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>부모 Drawer</Button>
      <Drawer open={open} title="부모" onClose={() => setOpen(false)}>
        <Button onClick={() => setChildOpen(true)}>자식 Drawer</Button>
        <Drawer open={childOpen} title="자식" onClose={() => setChildOpen(false)}>
          중첩된 내용이에요.
        </Drawer>
      </Drawer>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <NestedExample {...args} />,
};

function NestedExample(args: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>부모 Drawer</Button>
      <Drawer {...args} open={open} title="부모" onClose={() => setOpen(false)}>
        <Button onClick={() => setChildOpen(true)}>자식 Drawer</Button>
        <Drawer {...args} open={childOpen} title="자식" onClose={() => setChildOpen(false)}>
          중첩된 내용이에요.
        </Drawer>
      </Drawer>
    </>
  );
}
