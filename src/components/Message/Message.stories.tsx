import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { message } from "./Message";
import type { MessageStatusType } from "./Message.types";

const messageStatuses: MessageStatusType[] = ["success", "error", "info", "warning", "loading"];

interface MessageStoryArgs {
  content: string;
  successContent: string;
  type: MessageStatusType;
  duration: number;
  secondaryDuration: number;
  updateDelay: number;
  pauseOnHover: boolean;
}

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Message",
  tags: ["autodocs"],
  argTypes: {
    content: { name: "내용", control: "text" },
    successContent: { name: "완료 내용", control: "text" },
    type: { name: "상태", control: "select", options: messageStatuses },
    duration: { name: "표시 시간", control: { type: "number", min: 0, step: 0.5 } },
    secondaryDuration: {
      name: "두 번째 표시 시간",
      control: { type: "number", min: 0, step: 0.5 },
    },
    updateDelay: { name: "갱신 지연", control: { type: "number", min: 0, step: 100 } },
    pauseOnHover: { name: "Hover 중 정지", control: "boolean" },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component: "작업 결과나 짧은 안내를 화면 위에 표시해요.",
      },
      page: () => (
        <div className="message-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Message

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`open\` | 설정한 내용으로 메시지를 표시해요. | ([\`Config\`](#config)) => MessageType | - |
| \`success\` | 성공 메시지를 표시해요. | ([\`Config\`](#config)) => MessageType | - |
| \`error\` | 오류 메시지를 표시해요. | ([\`Config\`](#config)) => MessageType | - |
| \`info\` | 정보 메시지를 표시해요. | ([\`Config\`](#config)) => MessageType | - |
| \`warning\` | 경고 메시지를 표시해요. | ([\`Config\`](#config)) => MessageType | - |
| \`loading\` | 유지되는 로딩 메시지를 표시해요. | ([\`Config\`](#config)) => MessageType | - |
| \`destroy\` | key의 메시지 또는 모든 메시지를 닫아요. | \`(key?) => void\` | - |

### Config

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`content\` | 표시할 내용을 설정해요. | \`ReactNode\` | - |
| \`type\` | 상태 타입을 설정해요. | [\`MessageStatusType\`](#message-status-type) | \`info\` |
| \`duration\` | 닫히기까지의 초예요. 0이면 유지해요. | \`number\` | \`3\` (loading: \`0\`) |
| \`icon\` | 상태 아이콘을 변경해요. | \`ReactNode\` | - |
| \`key\` | 같은 메시지를 갱신하거나 제거할 key예요. | \`string \\| number\` | - |
| \`pauseOnHover\` | 마우스를 올리면 닫힘 시간을 멈춰요. | \`boolean\` | \`true\` |
| \`className\` | 메시지에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 메시지를 누르면 실행해요. | \`() => void\` | - |
| \`onClose\` | 메시지가 닫히면 실행해요. | \`() => void\` | - |
      `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="message-status-type">MessageStatusType</h3>
          <p>메시지 상태를 선택해요.</p>
          <TypeTokens values={messageStatuses} />
        </div>
      ),
    },
  },
} satisfies Meta<MessageStoryArgs>;

export default meta;
type Story = StoryObj<MessageStoryArgs>;

export const Basic: Story = {
  args: {
    content: "새 소식이 있어요.",
    type: "info",
    duration: 3,
    pauseOnHover: true,
  },
  parameters: {
    ...storyDescription("components-message--basic"),
    controls: {
      disable: false,
      include: ["content", "type", "duration", "pauseOnHover"],
    },
    docs: {
      ...storyDescription("components-message--basic").docs,
      source: {
        code: withStoryImports(`<Button
  onClick={() => message.open({ content: '새 소식이 있어요.' })}
>
  Message 열기
</Button>`),
      },
    },
  },
  render: (args) => <Button onClick={() => message.open(args)}>Message 열기</Button>,
};

export const Types: Story = {
  args: { content: "상태 메시지예요.", duration: 3, pauseOnHover: true },
  parameters: {
    ...storyDescription("components-message--types"),
    controls: { disable: false, include: ["content", "duration", "pauseOnHover"] },
    docs: {
      ...storyDescription("components-message--types").docs,
      source: {
        code: withStoryImports(`function MessageTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => message.success({ content: '저장했어요.' })}>
        Success
      </Button>
      <Button onClick={() => message.error({ content: '저장하지 못했어요.' })}>
        Error
      </Button>
      <Button onClick={() => message.info({ content: '새 소식이 있어요.' })}>
        Info
      </Button>
      <Button
        onClick={() => message.warning({ content: '변경사항을 확인해 주세요.' })}
      >
        Warning
      </Button>
      <Button onClick={() => message.loading({ content: '불러오는 중이에요.' })}>
        Loading
      </Button>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => message.success(args)}>Success</Button>
      <Button onClick={() => message.error(args)}>Error</Button>
      <Button onClick={() => message.info(args)}>Info</Button>
      <Button onClick={() => message.warning(args)}>Warning</Button>
      <Button onClick={() => message.loading(args)}>Loading</Button>
    </div>
  ),
};

export const MultilineIconAlignment: Story = {
  args: {
    content: "첫 번째 줄의 중앙에 아이콘을 맞춰요.\n두 번째 줄도 자연스럽게 이어져요.",
    duration: 0,
  },
  parameters: {
    ...storyDescription("components-message--multiline"),
    controls: { disable: false, include: ["content"] },
    docs: {
      ...storyDescription("components-message--multiline").docs,
      source: {
        code: withStoryImports(`<Button
  onClick={() =>
    message.info({
      content: '첫 번째 줄의 중앙에 아이콘을 맞춰요.\\n두 번째 줄도 자연스럽게 이어져요.',
      duration: 0,
    })
  }
>
  여러 줄 Message
</Button>`),
      },
    },
  },
  render: ({ content }) => (
    <Button onClick={() => message.info({ content, duration: 0 })}>여러 줄 Message</Button>
  ),
};

export const Duration: Story = {
  args: { content: "표시 시간을 확인해요.", duration: 1, secondaryDuration: 5, pauseOnHover: true },
  parameters: {
    ...storyDescription("components-message--duration"),
    controls: {
      disable: false,
      include: ["content", "duration", "secondaryDuration", "pauseOnHover"],
    },
    docs: {
      ...storyDescription("components-message--duration").docs,
      source: {
        code: withStoryImports(`<div className="flex gap-2">
  <Button
    onClick={() => message.info({ content: '1초 동안 표시해요.', duration: 1 })}
  >
    1초
  </Button>
  <Button
    onClick={() => message.info({ content: '5초 동안 표시해요.', duration: 5 })}
  >
    5초
  </Button>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex gap-2">
      <Button
        onClick={() =>
          message.info({
            content: args.content,
            duration: args.duration,
            pauseOnHover: args.pauseOnHover,
          })
        }
      >
        {args.duration}초
      </Button>
      <Button
        onClick={() =>
          message.info({
            content: args.content,
            duration: args.secondaryDuration,
            pauseOnHover: args.pauseOnHover,
          })
        }
      >
        {args.secondaryDuration}초
      </Button>
    </div>
  ),
};

export const Update: Story = {
  args: { content: "저장 중이에요.", successContent: "저장했어요.", updateDelay: 1200 },
  parameters: {
    ...storyDescription("components-message--update"),
    controls: { disable: false, include: ["content", "successContent", "updateDelay"] },
    docs: {
      ...storyDescription("components-message--update").docs,
      source: {
        code: withStoryImports(`function MessageUpdate() {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      message.destroy('save');
    },
    [],
  );

  const update = () => {
    message.loading({ key: 'save', content: '저장 중이에요.' });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => message.success({ key: 'save', content: '저장했어요.' }),
      1200,
    );
  };

  return <Button onClick={update}>key로 갱신</Button>;
}`),
      },
    },
  },
  render: (args) => <MessageUpdateExample {...args} />,
};

function MessageUpdateExample({ content, successContent, updateDelay }: MessageStoryArgs) {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      message.destroy("save");
    },
    [],
  );

  const update = () => {
    message.loading({ key: "save", content });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => message.success({ key: "save", content: successContent }),
      updateDelay,
    );
  };

  return <Button onClick={update}>key로 갱신</Button>;
}

export const Promise: Story = {
  args: {
    content: "첫 메시지",
    successContent: "첫 메시지가 닫혔어요.",
    duration: 1,
  },
  parameters: {
    ...storyDescription("components-message--promise"),
    controls: { disable: false, include: ["content", "successContent", "duration"] },
    docs: {
      ...storyDescription("components-message--promise").docs,
      source: {
        code: withStoryImports(`function MessagePromise() {
  const sequence = async () => {
    await message.success({ content: '첫 메시지', duration: 1 });
    message.info({ content: '첫 메시지가 닫혔어요.' });
  };

  return <Button onClick={sequence}>순서대로</Button>;
}`),
      },
    },
  },
  render: (args) => <MessagePromiseExample {...args} />,
};

function MessagePromiseExample({ content, successContent, duration }: MessageStoryArgs) {
  const sequence = async () => {
    await message.success({ content, duration });
    message.info({ content: successContent });
  };

  return <Button onClick={sequence}>순서대로</Button>;
}
