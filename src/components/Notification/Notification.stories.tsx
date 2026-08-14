import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { notification } from "./Notification";
import type { NotificationPlacement } from "./Notification.types";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Notification",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "제목과 설명이 있는 전역 알림을 화면 가장자리에 표시해요.  \n정적 메서드와 useNotification을 사용할 수 있어요.",
      },
      page: () => (
        <div className="component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Methods

\`notification.success\` · \`notification.error\` · \`notification.info\` · \`notification.warning\` · \`notification.open\` · \`notification.destroy\`를 제공해요.

### Config

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`title\` | 알림 제목을 설정해요. | \`ReactNode\` | - |
| \`description\` | 알림 설명을 설정해요. | \`ReactNode\` | - |
| \`actions\` | 알림 아래 작업을 추가해요. | \`ReactNode\` | - |
| \`closable\` | 닫기 버튼 표시·아이콘·비활성을 설정해요. | \`boolean \\| object\` | \`true\` |
| \`duration\` | 자동으로 닫히기까지의 초를 설정해요. false면 유지해요. | \`number \\| false\` | \`4.5\` |
| \`showProgress\` | 남은 시간을 하단 막대로 표시해요. | \`boolean\` | \`false\` |
| \`pauseOnHover\` | 마우스를 올리면 닫힘 시간을 멈춰요. | \`boolean\` | \`true\` |
| \`icon\` | 상태 아이콘을 변경해요. | \`ReactNode\` | - |
| \`key\` | 알림을 갱신하거나 제거할 key예요. | \`string\` | - |
| \`placement\` | 화면 배치 위치를 설정해요. | \`NotificationPlacement\` | \`topRight\` |
| \`classNames\` | 각 영역의 클래스를 설정해요. | \`Record<SemanticName, string>\` | - |
| \`styles\` | 각 영역의 스타일을 설정해요. | \`Record<SemanticName, CSSProperties>\` | - |
| \`className\` | 알림에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 알림을 누르면 실행해요. | \`() => void\` | - |
| \`onClose\` | 알림이 닫히면 실행해요. | \`() => void\` | - |

### Global config

\`notification.config({ top, bottom, placement, duration, getContainer, maxCount, stack, showProgress, pauseOnHover })\`로 정적 알림 기본값을 설정해요.

\`notification.useNotification(config)\`은 동일한 메서드와 \`contextHolder\`를 반환해요.
      `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypesAndActions: Story = {
  parameters: {
    ...storyDescription("components-notification--types-actions"),
    docs: {
      source: {
        code: withStoryImports(`function NotificationTypes() {
  const actions = <Button size="sm">되돌리기</Button>;
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => notification.success({ title: '저장 완료', description: '변경사항을 저장했어요.', actions })}>Success</Button>
      <Button onClick={() => notification.error({ title: '저장 실패', description: '잠시 뒤 다시 시도해 주세요.' })}>Error</Button>
      <Button onClick={() => notification.info({ title: '새 소식', description: '업데이트 내용을 확인해 주세요.' })}>Info</Button>
      <Button onClick={() => notification.warning({ title: '확인 필요', description: '입력값을 확인해 주세요.' })}>Warning</Button>
    </div>
  );
}`),
      },
    },
  },
  render: () => {
    const actions = <Button size="sm">되돌리기</Button>;
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            notification.success({
              title: "저장 완료",
              description: "변경사항을 저장했어요.",
              actions,
            })
          }
        >
          Success
        </Button>
        <Button
          onClick={() =>
            notification.error({ title: "저장 실패", description: "잠시 뒤 다시 시도해 주세요." })
          }
        >
          Error
        </Button>
        <Button
          onClick={() =>
            notification.info({ title: "새 소식", description: "업데이트 내용을 확인해 주세요." })
          }
        >
          Info
        </Button>
        <Button
          onClick={() =>
            notification.warning({ title: "확인 필요", description: "입력값을 확인해 주세요." })
          }
        >
          Warning
        </Button>
      </div>
    );
  },
};

export const Placements: Story = {
  parameters: {
    ...storyDescription("components-notification--placements"),
    docs: {
      source: {
        code: withStoryImports(`const placements = ['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight'] as const;
function NotificationPlacements() {
  return <div className="flex flex-wrap gap-2">{placements.map((placement) => <Button key={placement} type="secondary" onClick={() => notification.info({ title: placement, description: '선택한 위치에 표시돼요.', placement })}>{placement}</Button>)}</div>;
}`),
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(
        [
          "topLeft",
          "top",
          "topRight",
          "bottomLeft",
          "bottom",
          "bottomRight",
        ] as NotificationPlacement[]
      ).map((placement) => (
        <Button
          key={placement}
          type="secondary"
          onClick={() =>
            notification.info({
              title: placement,
              description: "선택한 위치에 표시돼요.",
              placement,
            })
          }
        >
          {placement}
        </Button>
      ))}
    </div>
  ),
};

export const ProgressAndStack: Story = {
  parameters: {
    ...storyDescription("components-notification--progress-stack"),
    docs: {
      source: {
        code: withStoryImports(`function NotificationProgressAndStack() {
  const [api, contextHolder] = notification.useNotification({ stack: { threshold: 3 }, showProgress: true });
  const openMany = () => Array.from({ length: 5 }, (_, index) => api.info({ title: '알림 ' + (index + 1), description: '여러 알림을 스택으로 표시해요.' }));
  return <>{contextHolder}<Button onClick={openMany}>알림 5개 열기</Button></>;
}`),
      },
    },
  },
  render: () => <NotificationStackExample />,
};

function NotificationStackExample() {
  const [api, holder] = notification.useNotification({
    stack: { threshold: 3 },
    showProgress: true,
  });
  return (
    <>
      {holder}
      <Button
        onClick={() =>
          Array.from({ length: 5 }, (_, index) =>
            api.info({ title: `알림 ${index + 1}`, description: "여러 알림을 스택으로 표시해요." }),
          )
        }
      >
        알림 5개 열기
      </Button>
    </>
  );
}

export const Update: Story = {
  parameters: {
    ...storyDescription("components-notification--update"),
    docs: {
      source: {
        code: withStoryImports(`function NotificationUpdate() {
  const update = () => {
    notification.open({ key: 'upload', title: '업로드 중', description: '파일을 전송하고 있어요.', duration: false });
    setTimeout(() => notification.success({ key: 'upload', title: '업로드 완료', description: '파일을 전송했어요.' }), 1200);
  };
  return <Button onClick={update}>key로 갱신</Button>;
}`),
      },
    },
  },
  render: () => (
    <Button
      onClick={() => {
        notification.open({
          key: "upload",
          title: "업로드 중",
          description: "파일을 전송하고 있어요.",
          duration: false,
        });
        setTimeout(
          () =>
            notification.success({
              key: "upload",
              title: "업로드 완료",
              description: "파일을 전송했어요.",
            }),
          1200,
        );
      }}
    >
      key로 갱신
    </Button>
  ),
};

export const Hook: Story = {
  parameters: {
    ...storyDescription("components-notification--hook"),
    docs: {
      source: {
        code: withStoryImports(`function NotificationHook() {
  const [api, contextHolder] = notification.useNotification();
  return <>{contextHolder}<Button onClick={() => api.success({ title: 'Hook 알림', description: '현재 Context에서 열렸어요.' })}>Hook Notification</Button></>;
}`),
      },
    },
  },
  render: () => <NotificationHookExample />,
};

function NotificationHookExample() {
  const [api, holder] = notification.useNotification();
  return (
    <>
      {holder}
      <Button
        onClick={() =>
          api.success({ title: "Hook 알림", description: "현재 Context에서 열렸어요." })
        }
      >
        Hook Notification
      </Button>
    </>
  );
}
