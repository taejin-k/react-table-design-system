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
| \`open\` | 설정한 내용으로 메시지를 표시해요. | (config: [\`Config\`](#config)) => MessageType | - |
| \`success\` | 성공 메시지를 표시해요. | (config: [\`Config\`](#config)) => MessageType | - |
| \`error\` | 오류 메시지를 표시해요. | (config: [\`Config\`](#config)) => MessageType | - |
| \`info\` | 정보 메시지를 표시해요. | (config: [\`Config\`](#config)) => MessageType | - |
| \`warning\` | 경고 메시지를 표시해요. | (config: [\`Config\`](#config)) => MessageType | - |
| \`loading\` | 유지되는 로딩 메시지를 표시해요. | (config: [\`Config\`](#config)) => MessageType | - |
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
    type: "info",
    duration: 3,
    pauseOnHover: true,
  },
  parameters: {
    ...storyDescription("components-message--basic"),
    controls: {
      disable: false,
      include: ["상태", "표시 시간", "Hover 중 정지"],
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
  render: ({ type, duration, pauseOnHover }) => (
    <Button
      onClick={() => message.open({ content: "새 소식이 있어요.", type, duration, pauseOnHover })}
    >
      Message 열기
    </Button>
  ),
};

export const Types: Story = {
  args: { duration: 3, pauseOnHover: true },
  parameters: {
    ...storyDescription("components-message--types"),
    controls: { disable: false, include: ["표시 시간", "Hover 중 정지"] },
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
      <Button
        onClick={() =>
          message.success({
            content: "저장했어요.",
            duration: args.duration,
            pauseOnHover: args.pauseOnHover,
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          message.error({
            content: "저장하지 못했어요.",
            duration: args.duration,
            pauseOnHover: args.pauseOnHover,
          })
        }
      >
        Error
      </Button>
      <Button
        onClick={() =>
          message.info({
            content: "새 소식이 있어요.",
            duration: args.duration,
            pauseOnHover: args.pauseOnHover,
          })
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          message.warning({
            content: "변경사항을 확인해 주세요.",
            duration: args.duration,
            pauseOnHover: args.pauseOnHover,
          })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          message.loading({
            content: "불러오는 중이에요.",
            duration: 0,
          })
        }
      >
        Loading
      </Button>
    </div>
  ),
};

export const MultilineIconAlignment: Story = {
  parameters: {
    ...storyDescription("components-message--multiline"),
    controls: { disable: true },
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
  render: () => (
    <Button
      onClick={() =>
        message.info({
          content: "첫 번째 줄의 중앙에 아이콘을 맞춰요.\n두 번째 줄도 자연스럽게 이어져요.",
          duration: 0,
        })
      }
    >
      여러 줄 Message
    </Button>
  ),
};

export const Duration: Story = {
  args: { duration: 1, secondaryDuration: 5, pauseOnHover: true },
  parameters: {
    ...storyDescription("components-message--duration"),
    controls: {
      disable: false,
      include: ["표시 시간", "두 번째 표시 시간", "Hover 중 정지"],
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
            content: `${args.duration}초 동안 표시해요.`,
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
            content: `${args.secondaryDuration}초 동안 표시해요.`,
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
  args: { updateDelay: 1200 },
  parameters: {
    ...storyDescription("components-message--update"),
    controls: { disable: false, include: ["갱신 지연"] },
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

function MessageUpdateExample({ updateDelay }: Pick<MessageStoryArgs, "updateDelay">) {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      message.destroy("save");
    },
    [],
  );

  const update = () => {
    message.loading({ key: "save", content: "저장 중이에요." });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => message.success({ key: "save", content: "저장했어요." }),
      updateDelay,
    );
  };

  return <Button onClick={update}>key로 갱신</Button>;
}

export const Promise: Story = {
  args: { duration: 1 },
  parameters: {
    ...storyDescription("components-message--promise"),
    controls: { disable: false, include: ["표시 시간"] },
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

function MessagePromiseExample({ duration }: Pick<MessageStoryArgs, "duration">) {
  const sequence = async () => {
    await message.success({ content: "첫 메시지", duration });
    message.info({ content: "첫 메시지가 닫혔어요." });
  };

  return <Button onClick={sequence}>순서대로</Button>;
}
