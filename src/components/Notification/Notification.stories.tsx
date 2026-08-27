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

interface NotificationStoryArgs {
  title: string;
  description: string;
  successTitle: string;
  successDescription: string;
  type: NotificationStatusType;
  duration: number;
  placement: NotificationPlacementType;
  closable: boolean;
  showProgress: boolean;
  pauseOnHover: boolean;
  updateDelay: number;
}

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Notification",
  tags: ["autodocs"],
  argTypes: {
    title: { name: "제목", control: "text" },
    description: { name: "설명", control: "text" },
    successTitle: { name: "완료 제목", control: "text" },
    successDescription: { name: "완료 설명", control: "text" },
    type: { name: "상태", control: "select", options: notificationStatuses },
    duration: { name: "표시 시간", control: { type: "number", min: 0, step: 0.5 } },
    placement: { name: "위치", control: "select", options: notificationPlacements },
    closable: { name: "닫기 버튼", control: "boolean" },
    showProgress: { name: "진행 표시", control: "boolean" },
    pauseOnHover: { name: "Hover 중 정지", control: "boolean" },
    updateDelay: { name: "갱신 지연", control: { type: "number", min: 0, step: 100 } },
  },
  parameters: {
    controls: { disable: false },
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
| \`open\` | 설정한 내용으로 알림을 표시해요. | (config: [\`Config\`](#config)) => void | - |
| \`success\` | 성공 알림을 표시해요. | (config: [\`Config\`](#config)) => void | - |
| \`error\` | 오류 알림을 표시해요. | (config: [\`Config\`](#config)) => void | - |
| \`info\` | 정보 알림을 표시해요. | (config: [\`Config\`](#config)) => void | - |
| \`warning\` | 경고 알림을 표시해요. | (config: [\`Config\`](#config)) => void | - |
| \`destroy\` | key의 알림 또는 모든 알림을 닫아요. | \`(key?) => void\` | - |

### Config

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`title\` | 알림 제목을 설정해요. | \`ReactNode\` | - |
| \`description\` | 알림 설명을 설정해요. | \`ReactNode\` | - |
| \`type\` | 알림 상태를 설정해요. | [\`NotificationStatusType\`](#notification-status-type) | - |
| \`actions\` | 알림 아래 작업을 추가해요. | \`ReactNode\` | - |
| \`closable\` | 닫기 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`duration\` | 자동으로 닫히기까지의 초를 설정해요. 0이면 유지해요. | \`number\` | \`4.5\` |
| \`showProgress\` | 남은 시간을 하단 막대로 표시해요. | \`boolean\` | \`false\` |
| \`pauseOnHover\` | 마우스를 올리면 닫힘 시간을 멈춰요. | \`boolean\` | \`true\` |
| \`icon\` | 상태 아이콘을 변경해요. | \`ReactNode\` | - |
| \`key\` | 알림을 갱신하거나 제거할 key예요. | \`string\` | - |
| \`placement\` | 화면 배치 위치를 설정해요. | [\`NotificationPlacementType\`](#notification-placement-type) | \`topRight\` |
| \`className\` | 알림에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onClick\` | 알림을 누르면 실행해요. | \`() => void\` | - |
| \`onClose\` | 알림이 닫히면 실행해요. | \`() => void\` | - |

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
} satisfies Meta<NotificationStoryArgs>;

export default meta;
type Story = StoryObj<NotificationStoryArgs>;

export const Basic: Story = {
  args: {
    title: "새 소식",
    description: "업데이트 내용을 확인해 주세요.",
    type: "info",
    duration: 4.5,
    placement: "topRight",
    closable: true,
    showProgress: false,
    pauseOnHover: true,
  },
  parameters: {
    ...storyDescription("components-notification--basic"),
    controls: {
      disable: false,
      include: [
        "제목",
        "설명",
        "상태",
        "표시 시간",
        "위치",
        "닫기 버튼",
        "진행 표시",
        "Hover 중 정지",
      ],
    },
    docs: {
      ...storyDescription("components-notification--basic").docs,
      source: {
        code: withStoryImports(`<Button
  onClick={() =>
    notification.open({
      title: '새 소식',
      description: '업데이트 내용을 확인해 주세요.',
    })
  }
>
  Notification 열기
</Button>`),
      },
    },
  },
  render: (args) => <Button onClick={() => notification.open(args)}>Notification 열기</Button>,
};

export const Types: Story = {
  args: {
    duration: 4.5,
    placement: "topRight",
    closable: true,
  },
  parameters: {
    ...storyDescription("components-notification--types"),
    controls: {
      disable: false,
      include: ["표시 시간", "위치", "닫기 버튼"],
    },
    docs: {
      ...storyDescription("components-notification--types").docs,
      source: {
        code: withStoryImports(`function NotificationTypes() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          notification.success({
            title: '저장 완료',
            description: '변경사항을 저장했어요.',
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          notification.error({
            title: '저장 실패',
            description: '잠시 뒤 다시 시도해 주세요.',
          })
        }
      >
        Error
      </Button>
      <Button
        onClick={() =>
          notification.info({
            title: '새 소식',
            description: '업데이트 내용을 확인해 주세요.',
          })
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          notification.warning({
            title: '확인 필요',
            description: '입력값을 확인해 주세요.',
          })
        }
      >
        Warning
      </Button>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            notification.success({
              title: "저장 완료",
              description: "변경사항을 저장했어요.",
              duration: args.duration,
              placement: args.placement,
              closable: args.closable,
            })
          }
        >
          Success
        </Button>
        <Button
          onClick={() =>
            notification.error({
              title: "저장 실패",
              description: "잠시 뒤 다시 시도해 주세요.",
              duration: args.duration,
              placement: args.placement,
              closable: args.closable,
            })
          }
        >
          Error
        </Button>
        <Button
          onClick={() =>
            notification.info({
              title: "새 소식",
              description: "업데이트 내용을 확인해 주세요.",
              duration: args.duration,
              placement: args.placement,
              closable: args.closable,
            })
          }
        >
          Info
        </Button>
        <Button
          onClick={() =>
            notification.warning({
              title: "확인 필요",
              description: "입력값을 확인해 주세요.",
              duration: args.duration,
              placement: args.placement,
              closable: args.closable,
            })
          }
        >
          Warning
        </Button>
      </div>
    );
  },
};

export const MultilineIconAlignment: Story = {
  args: {
    title: "첫 번째 제목 줄\n두 번째 제목 줄",
    description: "첫 번째 설명 줄의 중앙에 아이콘을 맞춰요.\n두 번째 설명 줄도 이어져요.",
    duration: 0,
  },
  parameters: {
    ...storyDescription("components-notification--multiline"),
    controls: { disable: false, include: ["제목", "설명"] },
    docs: {
      ...storyDescription("components-notification--multiline").docs,
      source: {
        code: withStoryImports(`<Button
  onClick={() =>
    notification.info({
      title: '첫 번째 제목 줄\\n두 번째 제목 줄',
      description: '첫 번째 설명 줄의 중앙에 아이콘을 맞춰요.\\n두 번째 설명 줄도 이어져요.',
      duration: 0,
    })
  }
>
  여러 줄 Notification
</Button>`),
      },
    },
  },
  render: ({ title, description }) => (
    <Button onClick={() => notification.info({ title, description, duration: 0 })}>
      여러 줄 Notification
    </Button>
  ),
};

export const Actions: Story = {
  args: {
    title: "저장 완료",
    description: "저장된 내용을 확인할 수 있어요.",
    duration: 0,
    placement: "topRight",
    closable: true,
  },
  parameters: {
    ...storyDescription("components-notification--actions"),
    controls: {
      disable: false,
      include: ["제목", "설명", "표시 시간", "위치", "닫기 버튼"],
    },
    docs: {
      ...storyDescription("components-notification--actions").docs,
      source: {
        code: withStoryImports(`function NotificationActions() {
  const open = () => {
    notification.success({
      key: 'notification-actions',
      title: '저장 완료',
      description: '저장된 내용을 확인할 수 있어요.',
      duration: 0,
      actions: (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => notification.destroy('notification-actions')}
          >
            닫기
          </Button>
          <Button
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

  return <Button onClick={open}>Actions 열기</Button>;
}`),
      },
    },
  },
  render: (args) => <NotificationActionsExample {...args} />,
};

function NotificationActionsExample(args: NotificationStoryArgs) {
  const open = () => {
    notification.success({
      key: "notification-actions",
      title: args.title,
      description: args.description,
      duration: args.duration,
      placement: args.placement,
      closable: args.closable,
      actions: (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => notification.destroy("notification-actions")}>
            닫기
          </Button>
          <Button
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

  return <Button onClick={open}>Actions 열기</Button>;
}

export const Placements: Story = {
  args: { description: "선택한 위치에 표시돼요.", duration: 4.5 },
  parameters: {
    ...storyDescription("components-notification--placements"),
    controls: { disable: false, include: ["설명", "표시 시간"] },
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
  render: (args) => (
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
          onClick={() =>
            notification.info({
              title: placement,
              description: args.description,
              duration: args.duration,
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
  args: {
    title: "작업 진행 중",
    description: "남은 시간이 하단 진행 바로 표시돼요.",
    duration: 6,
    showProgress: true,
    pauseOnHover: true,
  },
  parameters: {
    ...storyDescription("components-notification--progress"),
    controls: {
      disable: false,
      include: ["제목", "설명", "표시 시간", "진행 표시", "Hover 중 정지"],
    },
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
  render: (args) => (
    <Button
      onClick={() =>
        notification.info({
          title: args.title,
          description: args.description,
          duration: args.duration,
          showProgress: args.showProgress,
          pauseOnHover: args.pauseOnHover,
        })
      }
    >
      진행 상태 열기
    </Button>
  ),
};

export const Update: Story = {
  args: {
    title: "업로드 중",
    description: "파일을 전송하고 있어요.",
    successTitle: "업로드 완료",
    successDescription: "파일을 전송했어요.",
    updateDelay: 1200,
  },
  parameters: {
    ...storyDescription("components-notification--update"),
    controls: {
      disable: false,
      include: ["제목", "설명", "완료 제목", "완료 설명", "갱신 지연"],
    },
    docs: {
      ...storyDescription("components-notification--update").docs,
      source: {
        code: withStoryImports(`function NotificationUpdate() {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const update = () => {
    notification.open({
      key: 'upload',
      title: '업로드 중',
      description: '파일을 전송하고 있어요.',
      duration: 0,
    });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () =>
        notification.success({
          key: 'upload',
          title: '업로드 완료',
          description: '파일을 전송했어요.',
        }),
      1200,
    );
  };

  return <Button onClick={update}>key로 갱신</Button>;
}`),
      },
    },
  },
  render: (args) => <NotificationUpdateExample {...args} />,
};

function NotificationUpdateExample(args: NotificationStoryArgs) {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const update = () => {
    notification.open({
      key: "upload",
      title: args.title,
      description: args.description,
      duration: 0,
    });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () =>
        notification.success({
          key: "upload",
          title: args.successTitle,
          description: args.successDescription,
        }),
      args.updateDelay,
    );
  };

  return <Button onClick={update}>key로 갱신</Button>;
}
