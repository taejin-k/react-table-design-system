import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef, useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Modal } from "./Modal";
import type { ModalFuncConfig, ModalProps, ModalStatusType, ModalWidthType } from "./Modal.types";

const modalWidths = ["number", "string", "BreakpointMap"] satisfies readonly ModalWidthType[];
const modalStatuses: ModalStatusType[] = ["info", "success", "error", "warning", "confirm"];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    title: { name: "제목", control: "text" },
    centered: { name: "가운데 정렬", control: "boolean" },
    width: { name: "가로 길이", control: "text" },
    closable: { name: "닫기 버튼", control: "boolean" },
    keyboard: { name: "Escape 닫기", control: "boolean" },
    mask: { name: "배경 마스크", control: "boolean" },
    scrollLock: { name: "스크롤 잠금", control: "boolean" },
    okText: { name: "확인 버튼", control: "text" },
    cancelText: { name: "취소 버튼", control: "text" },
    open: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    footer: { control: false, table: { disable: true } },
    onOk: { control: false, table: { disable: true } },
    onCancel: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component: "현재 화면 위에서 중요한 정보나 작업을 확인해요.",
      },
      page: () => (
        <div className="modal-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Modal

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`open\` | Modal 표시 상태를 설정해요. | \`boolean\` | \`false\` |
| \`title\` | 제목을 설정해요. | \`ReactNode\` | - |
| \`footer\` | footer를 교체하거나 렌더 함수로 구성해요. | \`ReactNode \\| FooterRender\` | 확인·취소 버튼 |
| \`closable\` | 닫기 버튼 표시와 아이콘·비활성 상태를 설정해요. | \`ModalClosableType\` | \`true\` |
| \`centered\` | 화면 가운데에 배치해요. | \`boolean\` | \`false\` |
| \`width\` | 너비 또는 반응형 너비를 설정해요. | [\`ModalWidthType\`](#modal-width-type) | \`520\` |
| \`confirmLoading\` | 확인 버튼의 로딩 상태를 표시해요. | \`boolean\` | \`false\` |
| \`okText\` | 확인 버튼 내용을 설정해요. | \`ReactNode\` | \`확인\` |
| \`cancelText\` | 취소 버튼 내용을 설정해요. | \`ReactNode\` | \`취소\` |
| \`okType\` | 확인 버튼 종류를 설정해요. | \`ButtonVariantType\` | \`primary\` |
| \`okButtonProps\` | 확인 Button의 속성을 설정해요. | \`ButtonProps\` | - |
| \`cancelButtonProps\` | 취소 Button의 속성을 설정해요. | \`ButtonProps\` | - |
| \`keyboard\` | Escape로 닫을 수 있게 해요. | \`boolean\` | \`true\` |
| \`mask\` | 배경 마스크·블러·닫기 동작을 설정해요. | \`ModalMaskType\` | \`true\` |
| \`scrollLock\` | 열려 있는 동안 문서 스크롤을 잠가요. | \`boolean\` | \`true\` |
| \`forceRender\` | 닫힌 상태에서도 내용을 미리 렌더링해요. | \`boolean\` | \`false\` |
| \`destroyOnHidden\` | 닫힌 뒤 내용을 제거해요. | \`boolean\` | \`false\` |
| \`focusable\` | 포커스 순환과 원래 요소 복귀를 설정해요. | \`object\` | - |
| \`getContainer\` | Modal을 렌더링할 컨테이너를 설정해요. | \`HTMLElement \\| () => HTMLElement \\| string \\| false\` | \`document.body\` |
| \`zIndex\` | 겹치는 순서를 설정해요. | \`number\` | \`1000\` |
| \`classNames\` | 각 영역의 클래스를 설정해요. | \`Record<SemanticName, string>\` | - |
| \`styles\` | 각 영역의 스타일을 설정해요. | \`Record<SemanticName, CSSProperties>\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`modalRender\` | 전체 패널을 감싸서 렌더링해요. | \`(node) => ReactNode\` | - |
| \`afterClose\` | 닫힘 애니메이션 뒤 실행해요. | \`() => void\` | - |
| \`afterOpenChange\` | 열림 상태 전환이 끝나면 실행해요. | \`(open) => void\` | - |
| \`onOk\` | 확인 버튼을 누르면 실행해요. | \`(event) => void\` | - |
| \`onCancel\` | 취소·닫기·마스크를 누르면 실행해요. | \`(event) => void\` | - |

### Static methods

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`info\` | 정보 Modal을 표시해요. | \`(config) => ModalFuncResult\` | - |
| \`success\` | 성공 Modal을 표시해요. | \`(config) => ModalFuncResult\` | - |
| \`error\` | 오류 Modal을 표시해요. | \`(config) => ModalFuncResult\` | - |
| \`warning\` | 경고 Modal을 표시해요. | \`(config) => ModalFuncResult\` | - |
| \`confirm\` | 확인 Modal을 표시해요. | \`(config) => ModalFuncResult\` | - |
| \`destroyAll\` | 열린 정적 Modal을 모두 닫아요. | \`() => void\` | - |
      `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="modal-width-type">ModalWidthType</h3>
          <p>px 숫자, CSS 길이 또는 반응형 너비 맵을 사용해요.</p>
          <TypeTokens values={modalWidths} />
          <h3 id="modal-status-type">ModalStatusType</h3>
          <p>정적 Modal의 상태를 선택해요.</p>
          <TypeTokens values={modalStatuses} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: "구성원 추가",
    centered: false,
    width: 520,
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
    okText: "확인",
    cancelText: "취소",
  },
  parameters: {
    ...storyDescription("components-modal--basic"),
    docs: {
      ...storyDescription("components-modal--basic").docs,
      source: {
        code: withStoryImports(`function BasicModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Modal 열기</Button>
      <Modal open={open} title="구성원 추가" onCancel={() => setOpen(false)} onOk={() => setOpen(false)}>
        새 구성원을 프로젝트에 추가할까요?
      </Modal>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <BasicModalExample {...args} />,
};

function BasicModalExample(args: Partial<ModalProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Modal 열기</Button>
      <Modal {...args} open={open} onCancel={() => setOpen(false)} onOk={() => setOpen(false)}>
        새 구성원을 프로젝트에 추가할까요?
      </Modal>
    </>
  );
}

export const Async: Story = {
  args: {
    title: "변경사항 저장",
    centered: false,
    width: 520,
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
    okText: "확인",
    cancelText: "취소",
  },
  parameters: {
    ...storyDescription("components-modal--async"),
    docs: {
      ...storyDescription("components-modal--async").docs,
      source: {
        code: withStoryImports(`function AsyncModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const save = () => {
    setLoading(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1200);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>비동기 저장</Button>
      <Modal
        open={open}
        title="변경사항 저장"
        confirmLoading={loading}
        onCancel={() => setOpen(false)}
        onOk={save}
      >
        변경사항을 저장할까요?
      </Modal>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <AsyncModalExample {...args} />,
};

function AsyncModalExample(args: Partial<ModalProps>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const save = () => {
    setLoading(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 1200);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>비동기 저장</Button>
      <Modal
        {...args}
        open={open}
        confirmLoading={loading}
        onCancel={() => setOpen(false)}
        onOk={save}
      >
        변경사항을 저장할까요?
      </Modal>
    </>
  );
}

export const Footer: Story = {
  args: {
    title: "Footer 구성",
    centered: false,
    width: 520,
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
    okText: "확인",
    cancelText: "취소",
  },
  parameters: {
    ...storyDescription("components-modal--footer"),
    docs: {
      ...storyDescription("components-modal--footer").docs,
      source: {
        code: withStoryImports(`function ModalFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Footer Modal</Button>
      <Modal
        open={open}
        title="Footer 구성"
        footer={(origin) => (
          <div className="flex items-center justify-between">
            <span className="text-[#666]">자동 저장</span>
            {origin}
          </div>
        )}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        Footer의 콘텐츠와 기본 버튼을 함께 구성해요.
      </Modal>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <FooterExample {...args} />,
};

function FooterExample(args: Partial<ModalProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Footer Modal</Button>
      <Modal
        {...args}
        open={open}
        footer={(origin) => (
          <div className="flex items-center justify-between">
            <span className="text-[#666]">자동 저장</span>
            {origin}
          </div>
        )}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        Footer의 콘텐츠와 기본 버튼을 함께 구성해요.
      </Modal>
    </>
  );
}

export const StaticMethods: Story = {
  args: {
    title: "상태",
    centered: false,
    width: 520,
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
    okText: "확인",
    cancelText: "취소",
  },
  parameters: {
    ...storyDescription("components-modal--static-methods"),
    docs: {
      ...storyDescription("components-modal--static-methods").docs,
      source: {
        code: withStoryImports(`function ModalStaticMethods() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => Modal.info({ title: '안내', content: '확인할 내용이에요.' })}>Info</Button>
      <Button onClick={() => Modal.success({ title: '완료', content: '저장했어요.' })}>Success</Button>
      <Button onClick={() => Modal.error({ title: '오류', content: '다시 시도해 주세요.' })}>Error</Button>
      <Button onClick={() => Modal.warning({ title: '주의', content: '변경사항을 확인해 주세요.' })}>Warning</Button>
      <Button onClick={() => Modal.confirm({ title: '삭제', content: '정말 삭제할까요?' })}>Confirm</Button>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => Modal.info(createStaticConfig(args, "안내", "확인할 내용이에요."))}>
        Info
      </Button>
      <Button onClick={() => Modal.success(createStaticConfig(args, "완료", "저장했어요."))}>
        Success
      </Button>
      <Button onClick={() => Modal.error(createStaticConfig(args, "오류", "다시 시도해 주세요."))}>
        Error
      </Button>
      <Button
        onClick={() => Modal.warning(createStaticConfig(args, "주의", "변경사항을 확인해 주세요."))}
      >
        Warning
      </Button>
      <Button onClick={() => Modal.confirm(createStaticConfig(args, "삭제", "정말 삭제할까요?"))}>
        Confirm
      </Button>
    </div>
  ),
};

function createStaticConfig(
  args: Partial<ModalProps>,
  statusTitle: string,
  content: string,
): ModalFuncConfig {
  const prefix = typeof args.title === "string" ? args.title.trim() : "";

  return {
    title: prefix ? `${prefix} · ${statusTitle}` : statusTitle,
    content,
    centered: args.centered,
    width: args.width,
    closable: args.closable,
    keyboard: args.keyboard,
    mask: args.mask,
    scrollLock: args.scrollLock,
    okText: args.okText,
    cancelText: args.cancelText,
  };
}

export const MultilineIconAlignment: Story = {
  args: {
    title: "첫 번째 제목 줄\n두 번째 제목 줄",
  },
  parameters: {
    ...storyDescription("components-modal--multiline"),
    controls: { disable: false, include: ["title"] },
    docs: {
      ...storyDescription("components-modal--multiline").docs,
      source: {
        code: withStoryImports(`<Button
  onClick={() =>
    Modal.info({
      title: '첫 번째 제목 줄\\n두 번째 제목 줄',
      content: '첫 번째 내용 줄의 중앙에 아이콘을 맞춰요.\\n두 번째 내용 줄도 이어져요.',
    })
  }
>
  여러 줄 Modal
</Button>`),
      },
    },
  },
  render: (args) => (
    <Button
      onClick={() =>
        Modal.info({
          title: args.title,
          content: "첫 번째 내용 줄의 중앙에 아이콘을 맞춰요.\n두 번째 내용 줄도 이어져요.",
        })
      }
    >
      여러 줄 Modal
    </Button>
  ),
};

export const PositionAndWidth: Story = {
  args: {
    title: "반응형 너비",
    closable: true,
    keyboard: true,
    mask: true,
    scrollLock: true,
    okText: "확인",
    cancelText: "취소",
  },
  parameters: {
    ...storyDescription("components-modal--position-width"),
    docs: {
      ...storyDescription("components-modal--position-width").docs,
      source: {
        code: withStoryImports(`function ModalPositionAndWidth() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>넓은 중앙 Modal</Button>
      <Modal centered open={open} title="반응형 너비" width={{ xs: 320, md: 720 }} onCancel={() => setOpen(false)}>
        화면 너비에 따라 크기가 달라져요.
      </Modal>
    </>
  );
}`),
      },
    },
  },
  render: (args) => <PositionExample {...args} />,
};

function PositionExample(args: Partial<ModalProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>넓은 중앙 Modal</Button>
      <Modal
        {...args}
        centered
        open={open}
        width={{ xs: 320, md: 720 }}
        onCancel={() => setOpen(false)}
      >
        화면 너비에 따라 크기가 달라져요.
      </Modal>
    </>
  );
}
