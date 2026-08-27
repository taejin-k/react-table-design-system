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
    loading: { name: "로딩", control: "boolean" },
    open: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
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
| \`placement\` | 열리는 방향을 설정해요. | [\`DrawerPlacementType\`](#drawer-placement-type) | \`right\` |
| \`size\` | 기본·큰 크기 또는 직접 크기를 설정해요. | [\`DrawerSizeType\`](#drawer-size-type) | \`default\` |
| \`width\` | 좌우 Drawer 너비를 설정해요. | \`number \\| string\` | - |
| \`height\` | 상하 Drawer 높이를 설정해요. | \`number \\| string\` | - |
| \`closable\` | 닫기 버튼의 표시·위치·비활성을 설정해요. | \`DrawerClosableType\` | \`true\` |
| \`extra\` | header 오른쪽에 작업을 추가해요. | \`ReactNode\` | - |
| \`footer\` | footer 내용을 설정해요. | \`ReactNode\` | - |
| \`loading\` | 본문 로딩 상태를 표시해요. | \`boolean\` | \`false\` |
| \`keyboard\` | Escape로 닫을 수 있게 해요. | \`boolean\` | \`true\` |
| \`mask\` | 배경 마스크·블러·닫기 동작을 설정해요. | \`DrawerMaskType\` | \`true\` |
| \`scrollLock\` | 열려 있는 동안 문서 스크롤을 잠가요. | \`boolean\` | \`true\` |
| \`forceRender\` | 닫힌 상태에서도 내용을 미리 렌더링해요. | \`boolean\` | \`false\` |
| \`destroyOnHidden\` | 닫힌 뒤 내용을 제거해요. | \`boolean\` | \`false\` |
| \`push\` | 중첩 Drawer가 열릴 때 이동 거리를 설정해요. | \`boolean \\| { distance }\` | \`{ distance: 180 }\` |
| \`resizable\` | 가장자리 드래그와 크기 제한을 설정해요. | \`boolean \\| DrawerResizableConfig\` | \`false\` |
| \`focusable\` | 포커스 순환과 원래 요소 복귀를 설정해요. | \`object\` | - |
| \`getContainer\` | Drawer를 렌더링할 컨테이너를 설정해요. | \`HTMLElement \\| () => HTMLElement \\| string \\| false\` | \`document.body\` |
| \`zIndex\` | 겹치는 순서를 설정해요. | \`number\` | \`1000\` |
| \`classNames\` | 각 영역의 클래스를 설정해요. | \`Record<SemanticName, string>\` | - |
| \`styles\` | 각 영역의 스타일을 설정해요. | \`Record<SemanticName, CSSProperties>\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`drawerRender\` | 전체 패널을 감싸서 렌더링해요. | \`(node) => ReactNode\` | - |
| \`afterOpenChange\` | 열림 상태 전환이 끝나면 실행해요. | \`(open) => void\` | - |
| \`onClose\` | 닫기 동작이 발생하면 실행해요. | \`(event) => void\` | - |
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
          <Button key={item} variant="secondary" onClick={() => showDrawer(item)}>
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
          <Button key={item} variant="secondary" onClick={() => showDrawer(item)}>
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

export const SizeAndResizable: Story = {
  args: { placement: "right", closable: true, keyboard: true, mask: true, scrollLock: true },
  parameters: {
    ...storyDescription("components-drawer--size-resizable"),
    docs: {
      ...storyDescription("components-drawer--size-resizable").docs,
      source: {
        code: withStoryImports(`function ResizableDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>크기 조절 Drawer</Button>
      <Drawer
        open={open}
        title="크기 조절"
        size="large"
        resizable={{ min: 320, max: 800 }}
        onClose={() => setOpen(false)}
      >
        왼쪽 가장자리를 드래그해요.
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
  return (
    <>
      <Button onClick={() => setOpen(true)}>크기 조절 Drawer</Button>
      <Drawer
        {...args}
        open={open}
        title="크기 조절"
        size="large"
        resizable={{ min: 320, max: 800 }}
        onClose={() => setOpen(false)}
      >
        왼쪽 가장자리를 드래그해요.
      </Drawer>
    </>
  );
}

export const ExtraFooterAndLoading: Story = {
  args: {
    placement: "right",
    size: "default",
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
  },
  parameters: {
    ...storyDescription("components-drawer--extra-footer-loading"),
    docs: {
      ...storyDescription("components-drawer--extra-footer-loading").docs,
      source: {
        code: withStoryImports(`function DrawerLayout() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>작업 Drawer</Button>
      <Drawer
        open={open}
        title="상세 정보"
        loading
        extra={<Button size="sm">편집</Button>}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>확인</Button>
          </div>
        }
        onClose={() => setOpen(false)}
      />
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
        loading
        extra={<Button size="sm">편집</Button>}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>확인</Button>
          </div>
        }
        onClose={() => setOpen(false)}
      />
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
