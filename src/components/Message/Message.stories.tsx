import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { message } from "./Message";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Message",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "작업 결과나 짧은 안내를 화면 위에 표시해요.  \n정적 메서드와 useMessage를 사용할 수 있어요.",
      },
      page: () => (
        <div className="component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Methods

\`message.success\` · \`message.error\` · \`message.info\` · \`message.warning\` · \`message.loading\` · \`message.open\`을 제공해요.

각 호출은 직접 닫을 수 있고 닫힘을 기다릴 수 있는 thenable 함수를 반환해요.

### Config

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`content\` | 표시할 내용을 설정해요. | \`ReactNode\` | - |
| \`type\` | 상태 타입을 설정해요. | \`success \\| error \\| info \\| warning \\| loading\` | \`info\` |
| \`duration\` | 자동으로 닫히기까지의 초를 설정해요. 0이면 유지해요. | \`number\` | \`3\` |
| \`icon\` | 상태 아이콘을 변경해요. | \`ReactNode\` | - |
| \`key\` | 같은 메시지를 갱신하거나 제거할 key예요. | \`string \\| number\` | - |
| \`pauseOnHover\` | 마우스를 올리면 닫힘 시간을 멈춰요. | \`boolean\` | \`true\` |
| \`classNames\` | 각 영역의 클래스를 설정해요. | \`Record<SemanticName, string>\` | - |
| \`styles\` | 각 영역의 스타일을 설정해요. | \`Record<SemanticName, CSSProperties>\` | - |
| \`className\` | 메시지에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 메시지를 누르면 실행해요. | \`() => void\` | - |
| \`onClose\` | 메시지가 닫히면 실행해요. | \`() => void\` | - |

### Global config

\`message.config({ duration, getContainer, maxCount, rtl, stack, top })\`으로 정적 메시지 기본값을 설정해요.

\`message.useMessage(config)\`은 동일한 메서드와 \`contextHolder\`를 반환해요.
      `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Types: Story = {
  parameters: {
    ...storyDescription("components-message--types"),
    docs: {
      source: {
        code: withStoryImports(`function MessageTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => message.success('저장했어요.')}>Success</Button>
      <Button onClick={() => message.error('저장하지 못했어요.')}>Error</Button>
      <Button onClick={() => message.info('새 소식이 있어요.')}>Info</Button>
      <Button onClick={() => message.warning('변경사항을 확인해 주세요.')}>Warning</Button>
      <Button onClick={() => message.loading('불러오는 중이에요.')}>Loading</Button>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => message.success("저장했어요.")}>Success</Button>
      <Button onClick={() => message.error("저장하지 못했어요.")}>Error</Button>
      <Button onClick={() => message.info("새 소식이 있어요.")}>Info</Button>
      <Button onClick={() => message.warning("변경사항을 확인해 주세요.")}>Warning</Button>
      <Button onClick={() => message.loading("불러오는 중이에요.")}>Loading</Button>
    </div>
  ),
};

export const Hook: Story = {
  parameters: {
    ...storyDescription("components-message--hook"),
    docs: {
      source: {
        code: withStoryImports(`function MessageHook() {
  const [messageApi, contextHolder] = message.useMessage();
  return <>{contextHolder}<Button onClick={() => messageApi.success('현재 Context에서 열렸어요.')}>Hook Message</Button></>;
}`),
      },
    },
  },
  render: () => <MessageHookExample />,
};

function MessageHookExample() {
  const [api, holder] = message.useMessage();
  return (
    <>
      {holder}
      <Button onClick={() => api.success("현재 Context에서 열렸어요.")}>Hook Message</Button>
    </>
  );
}

export const DurationAndUpdate: Story = {
  parameters: {
    ...storyDescription("components-message--duration-update"),
    docs: {
      source: {
        code: withStoryImports(`function MessageUpdate() {
  const update = () => {
    message.loading({ key: 'save', content: '저장 중이에요.', duration: 0 });
    setTimeout(() => message.success({ key: 'save', content: '저장했어요.' }), 1200);
  };
  return <Button onClick={update}>key로 갱신</Button>;
}`),
      },
    },
  },
  render: () => (
    <Button
      onClick={() => {
        message.loading({ key: "save", content: "저장 중이에요.", duration: 0 });
        setTimeout(() => message.success({ key: "save", content: "저장했어요." }), 1200);
      }}
    >
      key로 갱신
    </Button>
  ),
};

export const PromiseAndStack: Story = {
  parameters: {
    ...storyDescription("components-message--promise-stack"),
    docs: {
      source: {
        code: withStoryImports(`function MessagePromiseAndStack() {
  const [messageApi, contextHolder] = message.useMessage({ stack: { threshold: 3 } });
  const openMany = () => Array.from({ length: 5 }, (_, index) => messageApi.info({ content: '메시지 ' + (index + 1), duration: 0 }));
  const sequence = async () => {
    await messageApi.success({ content: '첫 메시지', duration: 1 });
    messageApi.info('첫 메시지가 닫혔어요.');
  };
  return <>{contextHolder}<div className="flex gap-2"><Button onClick={openMany}>스택</Button><Button type="secondary" onClick={sequence}>순서대로</Button></div></>;
}`),
      },
    },
  },
  render: () => <MessageStackExample />,
};

function MessageStackExample() {
  const [api, holder] = message.useMessage({ stack: { threshold: 3 } });
  const openMany = () =>
    Array.from({ length: 5 }, (_, index) =>
      api.info({ content: `메시지 ${index + 1}`, duration: 0 }),
    );
  const sequence = async () => {
    await api.success({ content: "첫 메시지", duration: 1 });
    api.info("첫 메시지가 닫혔어요.");
  };
  return (
    <>
      {holder}
      <div className="flex gap-2">
        <Button onClick={openMany}>스택</Button>
        <Button type="secondary" onClick={sequence}>
          순서대로
        </Button>
      </div>
    </>
  );
}
