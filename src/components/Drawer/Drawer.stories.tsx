import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Drawer } from "./Drawer";
import type { DrawerPlacement } from "./Drawer.types";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "화면 가장자리에서 추가 정보나 작업 영역을 열어요.  \n방향·크기·중첩·리사이즈와 header·footer를 설정할 수 있어요.",
      },
      page: () => (
        <div className="component-docs">
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
| \`placement\` | 열리는 방향을 설정해요. | \`top \\| right \\| bottom \\| left\` | \`right\` |
| \`size\` | 기본·큰 크기 또는 직접 크기를 설정해요. | \`default \\| large \\| number \\| string\` | \`default\` |
| \`closable\` | 닫기 버튼의 표시·위치·비활성을 설정해요. | \`boolean \\| DrawerClosable\` | \`true\` |
| \`extra\` | header 오른쪽에 작업을 추가해요. | \`ReactNode\` | - |
| \`footer\` | footer 내용을 설정해요. | \`ReactNode\` | - |
| \`loading\` | 본문 로딩 상태를 표시해요. | \`boolean\` | \`false\` |
| \`keyboard\` | Escape로 닫을 수 있게 해요. | \`boolean\` | \`true\` |
| \`mask\` | 배경 마스크·블러·닫기 동작을 설정해요. | \`boolean \\| DrawerMask\` | \`true\` |
| \`scrollLock\` | 열려 있는 동안 문서 스크롤을 잠가요. | \`boolean\` | \`true\` |
| \`forceRender\` | 닫힌 상태에서도 내용을 미리 렌더링해요. | \`boolean\` | \`false\` |
| \`destroyOnHidden\` | 닫힌 뒤 내용을 제거해요. | \`boolean\` | \`false\` |
| \`push\` | 중첩 Drawer가 열릴 때 이동 거리를 설정해요. | \`boolean \\| { distance }\` | \`{ distance: 180 }\` |
| \`resizable\` | 가장자리 드래그와 크기 제한을 설정해요. | \`boolean \\| DrawerResizableConfig\` | \`false\` |
| \`maxSize\` | 리사이즈 최대 크기를 설정해요. | \`number\` | - |
| \`getContainer\` | Drawer를 렌더링할 컨테이너를 설정해요. | \`HTMLElement \\| () => HTMLElement \\| string \\| false\` | \`document.body\` |
| \`zIndex\` | 겹치는 순서를 설정해요. | \`number\` | \`1000\` |
| \`classNames\` | 각 영역의 클래스를 설정해요. | \`Record<SemanticName, string>\` | - |
| \`styles\` | 각 영역의 스타일을 설정해요. | \`Record<SemanticName, CSSProperties>\` | - |
| \`className\` | 패널에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`rootClassName\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`drawerRender\` | 전체 패널을 감싸서 렌더링해요. | \`(node) => ReactNode\` | - |
| \`afterOpenChange\` | 열림 상태 전환이 끝나면 실행해요. | \`(open) => void\` | - |
| \`onClose\` | 닫기 동작이 발생하면 실행해요. | \`(event) => void\` | - |
      `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-drawer--basic"),
    docs: {
      source: {
        code: withStoryImports(`function BasicDrawer() {
  const [open, setOpen] = useState(false);
  return <><Button onClick={() => setOpen(true)}>Drawer 열기</Button><Drawer open={open} title="구성원 정보" onClose={() => setOpen(false)}>Drawer 본문이에요.</Drawer></>;
}`),
      },
    },
  },
  render: () => <BasicDrawerExample />,
};

function BasicDrawerExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Drawer 열기</Button>
      <Drawer open={open} title="구성원 정보" onClose={() => setOpen(false)}>
        Drawer 본문이에요.
      </Drawer>
    </>
  );
}

export const Placements: Story = {
  parameters: {
    ...storyDescription("components-drawer--placements"),
    docs: {
      source: {
        code: withStoryImports(`const placements: DrawerPlacement[] = ['top', 'right', 'bottom', 'left'];
function DrawerPlacements() {
  const [placement, setPlacement] = useState<DrawerPlacement | null>(null);
  return <><div className="flex gap-2">{placements.map((item) => <Button key={item} type="secondary" onClick={() => setPlacement(item)}>{item}</Button>)}</div><Drawer open={placement !== null} placement={placement ?? 'right'} title={placement} onClose={() => setPlacement(null)}>선택한 방향에서 열려요.</Drawer></>;
}`),
      },
    },
  },
  render: () => <PlacementExample />,
};

function PlacementExample() {
  const [placement, setPlacement] = useState<DrawerPlacement | null>(null);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {(["top", "right", "bottom", "left"] as const).map((item) => (
          <Button key={item} type="secondary" onClick={() => setPlacement(item)}>
            {item}
          </Button>
        ))}
      </div>
      <Drawer
        open={placement !== null}
        placement={placement ?? "right"}
        title={placement}
        onClose={() => setPlacement(null)}
      >
        선택한 방향에서 열려요.
      </Drawer>
    </>
  );
}

export const SizeAndResizable: Story = {
  parameters: {
    ...storyDescription("components-drawer--size-resizable"),
    docs: {
      source: {
        code: withStoryImports(`function ResizableDrawer() {
  const [open, setOpen] = useState(false);
  return <><Button onClick={() => setOpen(true)}>크기 조절 Drawer</Button><Drawer open={open} title="크기 조절" size="large" resizable={{ min: 320, max: 800 }} onClose={() => setOpen(false)}>왼쪽 가장자리를 드래그해요.</Drawer></>;
}`),
      },
    },
  },
  render: () => <ResizableExample />,
};

function ResizableExample() {
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
}

export const ExtraFooterAndLoading: Story = {
  parameters: {
    ...storyDescription("components-drawer--extra-footer-loading"),
    docs: {
      source: {
        code: withStoryImports(`function DrawerLayout() {
  const [open, setOpen] = useState(false);
  return <><Button onClick={() => setOpen(true)}>작업 Drawer</Button><Drawer open={open} title="상세 정보" loading extra={<Button size="sm">편집</Button>} footer={<div className="flex justify-end"><Button onClick={() => setOpen(false)}>확인</Button></div>} onClose={() => setOpen(false)} /></>;
}`),
      },
    },
  },
  render: () => <LayoutExample />,
};

function LayoutExample() {
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
}

export const Nested: Story = {
  parameters: {
    ...storyDescription("components-drawer--nested"),
    docs: {
      source: {
        code: withStoryImports(`function NestedDrawer() {
  const [open, setOpen] = useState(false);
  const [childOpen, setChildOpen] = useState(false);
  return <><Button onClick={() => setOpen(true)}>부모 Drawer</Button><Drawer open={open} title="부모" onClose={() => setOpen(false)}><Button onClick={() => setChildOpen(true)}>자식 Drawer</Button><Drawer open={childOpen} title="자식" onClose={() => setChildOpen(false)}>중첩된 내용이에요.</Drawer></Drawer></>;
}`),
      },
    },
  },
  render: () => <NestedExample />,
};

function NestedExample() {
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
}
