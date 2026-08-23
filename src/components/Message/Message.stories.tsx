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
        component: "작업 결과나 짧은 안내를 화면 위에 표시해요.",
      },
      page: () => (
        <div className="message-docs component-docs">
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
| \`type\` | 상태 타입을 설정해요. | [\`MessageStatusType\`](#message-status-type) | \`info\` |
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

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`duration\` | 자동으로 닫히기까지의 초를 정해요. | \`number\` | \`3\` |
| \`getContainer\` | 메시지를 렌더링할 컨테이너를 정해요. | \`() => HTMLElement\` | \`document.body\` |
| \`maxCount\` | 동시에 유지할 최대 메시지 수를 정해요. | \`number\` | - |
| \`rtl\` | 내용을 오른쪽에서 왼쪽 방향으로 표시해요. | \`boolean\` | \`false\` |
| \`top\` | 화면 위쪽 간격을 px로 정해요. | \`number\` | \`8\` |
      `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="message-status-type">MessageStatusType</h3>
          <p>메시지 상태를 선택해요.</p>
          <TypeTokens values={messageStatuses} />
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
      ...storyDescription("components-message--types").docs,
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

export const DurationAndUpdate: Story = {
  parameters: {
    ...storyDescription("components-message--duration-update"),
    docs: {
      ...storyDescription("components-message--duration-update").docs,
      source: {
        code: withStoryImports(`function MessageUpdate() {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const update = () => {
    message.loading({ key: 'save', content: '저장 중이에요.', duration: 0 });
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
  render: () => <MessageUpdateExample />,
};

function MessageUpdateExample() {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const update = () => {
    message.loading({ key: "save", content: "저장 중이에요.", duration: 0 });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => message.success({ key: "save", content: "저장했어요." }),
      1200,
    );
  };

  return <Button onClick={update}>key로 갱신</Button>;
}

export const Promise: Story = {
  parameters: {
    ...storyDescription("components-message--promise"),
    docs: {
      ...storyDescription("components-message--promise").docs,
      source: {
        code: withStoryImports(`function MessagePromise() {
  const sequence = async () => {
    await message.success({ content: '첫 메시지', duration: 1 });
    message.info('첫 메시지가 닫혔어요.');
  };

  return <Button onClick={sequence}>순서대로</Button>;
}`),
      },
    },
  },
  render: () => <MessagePromiseExample />,
};

function MessagePromiseExample() {
  const sequence = async () => {
    await message.success({ content: "첫 메시지", duration: 1 });
    message.info("첫 메시지가 닫혔어요.");
  };
  return <Button onClick={sequence}>순서대로</Button>;
}
