import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { notification } from "./Notification";
import type { NotificationPlacementType, NotificationStatusType } from "./Notification.types";

const notificationStatuses: NotificationStatusType[] = ["success", "error", "info", "warning"];
const notificationPlacements: NotificationPlacementType[] = [
  "top",
  "topLeft",
  "topRight",
  "bottom",
  "bottomLeft",
  "bottomRight",
];

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
        component: "제목과 설명이 있는 전역 알림을 화면 가장자리에 표시해요.",
      },
      page: () => (
        <div className="notification-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Notification

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`open\` | 설정한 내용으로 알림을 표시해요. | \`(config) => void\` | - |
| \`success\` | 성공 알림을 표시해요. | \`(config) => void\` | - |
| \`error\` | 오류 알림을 표시해요. | \`(config) => void\` | - |
| \`info\` | 정보 알림을 표시해요. | \`(config) => void\` | - |
| \`warning\` | 경고 알림을 표시해요. | \`(config) => void\` | - |
| \`destroy\` | key의 알림 또는 모든 알림을 닫아요. | \`(key?) => void\` | - |
| \`config\` | 전역 알림 설정을 변경해요. | \`(config) => void\` | - |

### Config

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`title\` | 알림 제목을 설정해요. | \`ReactNode\` | - |
| \`description\` | 알림 설명을 설정해요. | \`ReactNode\` | - |
| \`type\` | 알림 상태를 설정해요. | [\`NotificationStatusType\`](#notification-status-type) | - |
| \`actions\` | 알림 아래 작업을 추가해요. | \`ReactNode\` | - |
| \`closable\` | 닫기 버튼 표시·아이콘·비활성을 설정해요. | \`boolean \\| object\` | \`true\` |
| \`duration\` | 자동으로 닫히기까지의 초를 설정해요. false면 유지해요. | \`number \\| false\` | \`4.5\` |
| \`showProgress\` | 남은 시간을 하단 막대로 표시해요. | \`boolean\` | \`false\` |
| \`pauseOnHover\` | 마우스를 올리면 닫힘 시간을 멈춰요. | \`boolean\` | \`true\` |
| \`icon\` | 상태 아이콘을 변경해요. | \`ReactNode\` | - |
| \`key\` | 알림을 갱신하거나 제거할 key예요. | \`string\` | - |
| \`placement\` | 화면 배치 위치를 설정해요. | [\`NotificationPlacementType\`](#notification-placement-type) | \`topRight\` |
| \`classNames\` | 각 영역의 클래스를 설정해요. | \`Record<SemanticName, string>\` | - |
| \`styles\` | 각 영역의 스타일을 설정해요. | \`Record<SemanticName, CSSProperties>\` | - |
| \`className\` | 알림에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 알림을 누르면 실행해요. | \`() => void\` | - |
| \`onClose\` | 알림이 닫히면 실행해요. | \`() => void\` | - |

### Global config

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`top\` | 위쪽 알림의 화면 간격을 정해요. | \`number\` | \`24\` |
| \`bottom\` | 아래쪽 알림의 화면 간격을 정해요. | \`number\` | \`24\` |
| \`placement\` | 기본 표시 위치를 정해요. | [\`NotificationPlacementType\`](#notification-placement-type) | \`topRight\` |
| \`duration\` | 자동으로 닫히기까지의 초를 정해요. | \`number \\| false\` | \`4.5\` |
| \`getContainer\` | 알림을 렌더링할 컨테이너를 정해요. | \`() => HTMLElement\` | \`document.body\` |
| \`maxCount\` | 동시에 유지할 최대 알림 수를 정해요. | \`number\` | - |
| \`stack\` | 알림이 많을 때 겹쳐 표시해요. | \`boolean \\| { threshold?: number }\` | \`{ threshold: 3 }\` |
| \`showProgress\` | 남은 시간을 하단 막대로 표시해요. | \`boolean\` | \`false\` |
| \`pauseOnHover\` | hover 중 닫힘 시간을 멈춰요. | \`boolean\` | \`true\` |
      `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="notification-status-type">NotificationStatusType</h3>
          <p>알림 상태를 선택해요.</p>
          <TypeTokens values={notificationStatuses} />
          <h3 id="notification-placement-type">NotificationPlacementType</h3>
          <p>알림이 표시될 위치를 선택해요.</p>
          <TypeTokens values={notificationPlacements} />
        </div>
      ),
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Types: Story = {
  parameters: {
    ...storyDescription("components-notification--types"),
    docs: {
      ...storyDescription("components-notification--types").docs,
      source: {
        code: withStoryImports(`function NotificationTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="md" onClick={() => notification.success({ title: '저장 완료', description: '변경사항을 저장했어요.' })}>Success</Button>
      <Button size="md" onClick={() => notification.error({ title: '저장 실패', description: '잠시 뒤 다시 시도해 주세요.' })}>Error</Button>
      <Button size="md" onClick={() => notification.info({ title: '새 소식', description: '업데이트 내용을 확인해 주세요.' })}>Info</Button>
      <Button size="md" onClick={() => notification.warning({ title: '확인 필요', description: '입력값을 확인해 주세요.' })}>Warning</Button>
    </div>
  );
}`),
      },
    },
  },
  render: () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="md"
          onClick={() =>
            notification.success({
              title: "저장 완료",
              description: "변경사항을 저장했어요.",
            })
          }
        >
          Success
        </Button>
        <Button
          size="md"
          onClick={() =>
            notification.error({ title: "저장 실패", description: "잠시 뒤 다시 시도해 주세요." })
          }
        >
          Error
        </Button>
        <Button
          size="md"
          onClick={() =>
            notification.info({ title: "새 소식", description: "업데이트 내용을 확인해 주세요." })
          }
        >
          Info
        </Button>
        <Button
          size="md"
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

export const Actions: Story = {
  parameters: {
    ...storyDescription("components-notification--actions"),
    docs: {
      ...storyDescription("components-notification--actions").docs,
      source: {
        code: withStoryImports(`function NotificationActions() {
  const open = () => {
    notification.success({
      key: 'notification-actions',
      title: '저장 완료',
      description: '저장된 내용을 확인할 수 있어요.',
      duration: false,
      actions: (
        <div className="flex gap-2">
          <Button
            size="md"
            variant="secondary"
            onClick={() => notification.destroy('notification-actions')}
          >
            닫기
          </Button>
          <Button
            size="md"
            onClick={() => {
              alert('저장된 내용을 확인해요.');
              notification.destroy('notification-actions');
            }}
          >
            확인
          </Button>
        </div>
      ),
    });
  };

  return <Button size="md" onClick={open}>Actions 열기</Button>;
}`),
      },
    },
  },
  render: () => <NotificationActionsExample />,
};

function NotificationActionsExample() {
  const open = () => {
    notification.success({
      key: "notification-actions",
      title: "저장 완료",
      description: "저장된 내용을 확인할 수 있어요.",
      duration: false,
      actions: (
        <div className="flex gap-2">
          <Button
            size="md"
            variant="secondary"
            onClick={() => notification.destroy("notification-actions")}
          >
            닫기
          </Button>
          <Button
            size="md"
            onClick={() => {
              alert("저장된 내용을 확인해요.");
              notification.destroy("notification-actions");
            }}
          >
            확인
          </Button>
        </div>
      ),
    });
  };

  return (
    <Button size="md" onClick={open}>
      Actions 열기
    </Button>
  );
}

export const Placements: Story = {
  parameters: {
    ...storyDescription("components-notification--placements"),
    docs: {
      ...storyDescription("components-notification--placements").docs,
      source: {
        code: withStoryImports(`const placements = [
  'topLeft',
  'top',
  'topRight',
  'bottomLeft',
  'bottom',
  'bottomRight',
] as const;

function NotificationPlacements() {
  return (
    <div className="flex flex-wrap gap-2">
      {placements.map((placement) => (
        <Button
          key={placement}
          variant="secondary"
          onClick={() =>
            notification.info({
              title: placement,
              description: '선택한 위치에 표시돼요.',
              placement,
            })
          }
        >
          {placement}
        </Button>
      ))}
    </div>
  );
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
        ] as NotificationPlacementType[]
      ).map((placement) => (
        <Button
          key={placement}
          variant="secondary"
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

export const Progress: Story = {
  parameters: {
    ...storyDescription("components-notification--progress"),
    docs: {
      ...storyDescription("components-notification--progress").docs,
      source: {
        code: withStoryImports(`function NotificationProgress() {
  return (
    <Button
      onClick={() =>
        notification.info({
          title: '작업 진행 중',
          description: '남은 시간이 하단 진행 바로 표시돼요.',
          duration: 6,
          showProgress: true,
        })
      }
    >
      진행 상태 열기
    </Button>
  );
}`),
      },
    },
  },
  render: () => (
    <Button
      onClick={() =>
        notification.info({
          title: "작업 진행 중",
          description: "남은 시간이 하단 진행 바로 표시돼요.",
          duration: 6,
          showProgress: true,
        })
      }
    >
      진행 상태 열기
    </Button>
  ),
};

export const Update: Story = {
  parameters: {
    ...storyDescription("components-notification--update"),
    docs: {
      ...storyDescription("components-notification--update").docs,
      source: {
        code: withStoryImports(`function NotificationUpdate() {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const update = () => {
    notification.open({ key: 'upload', title: '업로드 중', description: '파일을 전송하고 있어요.', duration: false });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => notification.success({ key: 'upload', title: '업로드 완료', description: '파일을 전송했어요.' }),
      1200,
    );
  };

  return <Button onClick={update}>key로 갱신</Button>;
}`),
      },
    },
  },
  render: () => <NotificationUpdateExample />,
};

function NotificationUpdateExample() {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const update = () => {
    notification.open({
      key: "upload",
      title: "업로드 중",
      description: "파일을 전송하고 있어요.",
      duration: false,
    });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () =>
        notification.success({
          key: "upload",
          title: "업로드 완료",
          description: "파일을 전송했어요.",
        }),
      1200,
    );
  };

  return <Button onClick={update}>key로 갱신</Button>;
}
