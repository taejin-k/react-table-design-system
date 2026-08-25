import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Upload } from "./Upload";
import type { UploadFile, UploadFileStatusType, UploadListType } from "./Upload.types";

const uploadListTypes: UploadListType[] = ["text", "picture", "picture-card", "picture-circle"];
const uploadFileStatuses: UploadFileStatusType[] = ["uploading", "done", "error", "removed"];
const listFiles: UploadFile[] = [
  {
    uid: "design",
    name: "design-system.png",
    status: "done",
    url: "data:image/svg+xml,%3Csvg%20viewBox=%220%200%20160%20160%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect%20width=%22160%22%20height=%22160%22%20fill=%22%230062df%22/%3E%3Cpath%20d=%22M32%20112%2064%2072l24%2028%2016-20%2024%2032Z%22%20fill=%22white%22/%3E%3C/svg%3E",
    thumbUrl:
      "data:image/svg+xml,%3Csvg%20viewBox=%220%200%20160%20160%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect%20width=%22160%22%20height=%22160%22%20fill=%22%230062df%22/%3E%3Cpath%20d=%22M32%20112%2064%2072l24%2028%2016-20%2024%2032Z%22%20fill=%22white%22/%3E%3C/svg%3E",
    type: "image/png",
  },
];

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Upload",
  component: Upload,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "클릭, 드래그 또는 붙여넣기로 파일을 선택하고 전송 상태를 관리해요.  \n파일 검증, 사용자 정의 요청, 네 가지 목록 모양, 진행률과 미리보기를 지원해요.",
      },
      page: () => (
        <div className="upload-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`accept\` | 선택할 수 있는 파일 형식을 제한해요. | \`string\` | - |
| \`action\` | 파일을 전송할 주소를 정해요. | \`string \\| ((file) => string \\| Promise<string>)\` | - |
| \`beforeUpload\` | 업로드 전에 파일을 검사하거나 전송을 중단해요. | \`(file, fileList) => boolean \\| File \\| Promise<...>\` | - |
| \`customRequest\` | 기본 XHR 대신 사용자 정의 전송을 실행해요. | \`(options: UploadRequestOption) => void\` | - |
| \`data\` | 전송할 추가 데이터를 설정해요. | \`object \\| (file) => object \\| Promise<object>\` | - |
| \`fileList\` | 표시할 파일 목록을 제어해요. | \`UploadFile[]\` | - |
| \`defaultFileList\` | 처음 표시할 파일 목록을 정해요. | \`UploadFile[]\` | \`[]\` |
| \`listType\` | 파일 목록의 표현 방식을 정해요. | [\`UploadListType\`](#upload-list-type) | \`text\` |
| \`multiple\` | 파일을 여러 개 선택해요. | \`boolean\` | \`false\` |
| \`maxCount\` | 최대 파일 수를 정하고 초과 시 안내해요. | \`number\` | - |
| \`directory\` | 폴더 단위 선택을 허용해요. | \`boolean\` | \`false\` |
| \`disabled\` | 파일 선택과 제거를 비활성화해요. | \`boolean\` | \`false\` |
| \`headers\` | 업로드 요청 헤더를 설정해요. | \`Record<string, string>\` | - |
| \`method\` | 업로드 요청 메서드를 정해요. | \`string\` | \`post\` |
| \`name\` | FormData의 파일 필드명을 정해요. | \`string\` | \`file\` |
| \`openFileDialogOnClick\` | 자식 클릭으로 파일 선택창을 열어요. | \`boolean\` | \`true\` |
| \`pastable\` | 클립보드의 파일을 붙여넣어 추가해요. | \`boolean\` | \`false\` |
| \`showUploadList\` | 목록과 미리보기·제거·다운로드 버튼을 설정해요. | \`boolean \\| object\` | \`true\` |
| \`withCredentials\` | 요청에 인증 정보를 포함해요. | \`boolean\` | \`false\` |
| \`itemRender\` | 파일 목록 항목을 직접 구성해요. | \`(originNode, file, fileList, actions) => ReactNode\` | - |
| \`iconRender\` | 파일 아이콘을 직접 구성해요. | \`(file, listType) => ReactNode\` | - |
| \`isImageUrl\` | 파일이 이미지인지 판단해요. | \`(file) => boolean\` | 확장자·MIME 판단 |
| \`previewFile\` | 로컬 파일의 미리보기 주소를 만들어요. | \`(file) => Promise<string>\` | Object URL |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 파일 상태나 목록이 바뀔 때 실행해요. | \`(info: UploadChangeParam) => void\` | - |
| \`onDrop\` | 파일을 놓았을 때 실행해요. | \`(event) => void\` | - |
| \`onDownload\` | 다운로드 아이콘을 누를 때 실행해요. | \`(file) => void\` | - |
| \`onPreview\` | 파일 이름을 눌렀을 때 실행해요. | \`(file) => void\` | - |
| \`onRemove\` | 파일을 제거하기 전에 실행해요. | \`(file) => boolean \\| Promise<boolean \\| void>\` | - |

### Upload.Dragger

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`children\` | 드래그 영역에 표시할 내용을 구성해요. | \`ReactNode\` | 기본 업로드 안내 |
| \`onDrop\` | 파일을 드래그 영역에 놓을 때 실행해요. | \`(event) => void\` | - |
| \`className\` | 최상위 드래그 영역에 Tailwind 클래스를 추가해요. | \`string\` | - |
| 공통 API | 나머지 파일 선택과 업로드 설정을 사용해요. | \`UploadProps\` | Upload와 동일 |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="upload-list-type">UploadListType</h3>
          <p>파일 목록의 표현 방식을 선택해요.</p>
          <TypeTokens values={uploadListTypes} />
          <h3 id="upload-file-status-type">UploadFileStatusType</h3>
          <p>파일의 업로드 상태를 나타내요.</p>
          <TypeTokens values={uploadFileStatuses} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Upload>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    beforeUpload: () => false,
    children: (
      <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
        파일 선택
      </Button>
    ),
  },
  parameters: {
    ...storyDescription("components-upload--basic"),
    docs: {
      ...storyDescription("components-upload--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Upload beforeUpload={() => false}>\n  <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>파일 선택</Button>\n</Upload>`,
        ),
      },
    },
  },
};
export const PictureCard: Story = {
  args: {
    accept: "image/*",
    listType: "picture-card",
    maxCount: 3,
    beforeUpload: () => false,
    children: (
      <span className="flex flex-col items-center gap-2">
        <Icon icon="add" />
        업로드
      </span>
    ),
  },
  parameters: {
    ...storyDescription("components-upload--picture-card"),
    docs: {
      ...storyDescription("components-upload--picture-card").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Upload accept="image/*" listType="picture-card" maxCount={3} beforeUpload={() => false}>
  <span className="flex flex-col items-center gap-2">
    <Icon icon="add" />
    업로드
  </span>
</Upload>`,
        ),
      },
    },
  },
};

export const ListTypes: Story = {
  parameters: {
    ...storyDescription("components-upload--list-types"),
    docs: {
      ...storyDescription("components-upload--list-types").docs,
      source: {
        type: "code",
        code: withStoryImports(`const files: UploadFile[] = [
  {
    uid: 'design',
    name: 'design-system.png',
    status: 'done',
    url: 'data:image/svg+xml,%3Csvg%20viewBox=%220%200%20160%20160%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect%20width=%22160%22%20height=%22160%22%20fill=%22%230062df%22/%3E%3Cpath%20d=%22M32%20112%2064%2072l24%2028%2016-20%2024%2032Z%22%20fill=%22white%22/%3E%3C/svg%3E',
    thumbUrl: 'data:image/svg+xml,%3Csvg%20viewBox=%220%200%20160%20160%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect%20width=%22160%22%20height=%22160%22%20fill=%22%230062df%22/%3E%3Cpath%20d=%22M32%20112%2064%2072l24%2028%2016-20%2024%2032Z%22%20fill=%22white%22/%3E%3C/svg%3E',
    type: 'image/png',
  },
];

function UploadListTypes() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-3">
        <strong>Text</strong>
        <Upload listType="text" defaultFileList={files}><Button>파일 선택</Button></Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload listType="picture" defaultFileList={files}><Button>파일 선택</Button></Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture Card</strong>
        <Upload listType="picture-card" defaultFileList={files}><span>+ 업로드</span></Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture Circle</strong>
        <Upload listType="picture-circle" defaultFileList={files}><span>+ 업로드</span></Upload>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-3">
        <strong>Text</strong>
        <Upload listType="text" defaultFileList={listFiles}>
          <Button>파일 선택</Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload listType="picture" defaultFileList={listFiles}>
          <Button>파일 선택</Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture Card</strong>
        <Upload listType="picture-card" defaultFileList={listFiles}>
          <span>+ 업로드</span>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture Circle</strong>
        <Upload listType="picture-circle" defaultFileList={listFiles}>
          <span>+ 업로드</span>
        </Upload>
      </div>
    </div>
  ),
};

export const DragAndDrop: Story = {
  args: { multiple: true, beforeUpload: () => false },
  parameters: {
    ...storyDescription("components-upload--drag-and-drop"),
    docs: {
      ...storyDescription("components-upload--drag-and-drop").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Upload.Dragger multiple beforeUpload={() => false} />`),
      },
    },
  },
  render: (args) => <Upload.Dragger {...args} />,
};

export const UploadProgress: Story = {
  parameters: {
    ...storyDescription("components-upload--upload-progress"),
    docs: {
      ...storyDescription("components-upload--upload-progress").docs,
      source: {
        type: "code",
        code: withStoryImports(`function UploadProgress() {
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(timerRef.current), []);

  return (
    <Upload
      customRequest={({ onProgress, onSuccess }) => {
        let percent = 0;
        timerRef.current = window.setInterval(() => {
          percent += 20;
          onProgress({ percent });
          if (percent >= 100) {
            window.clearInterval(timerRef.current);
            onSuccess({ ok: true });
          }
        }, 300);

        return { abort: () => window.clearInterval(timerRef.current) };
      }}
    >
      <Button prefixIcon={<Icon icon="upload" />}>업로드</Button>
    </Upload>
  );
}`),
      },
    },
  },
  render: () => <UploadProgressExample />,
};

function UploadProgressExample() {
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(timerRef.current), []);
  return (
    <Upload
      customRequest={({ onProgress, onSuccess }) => {
        let percent = 0;
        timerRef.current = window.setInterval(() => {
          percent += 20;
          onProgress({ percent });
          if (percent >= 100) {
            window.clearInterval(timerRef.current);
            onSuccess({ ok: true });
          }
        }, 300);
        return { abort: () => window.clearInterval(timerRef.current) };
      }}
    >
      <Button prefixIcon={<Icon icon="upload" />}>업로드</Button>
    </Upload>
  );
}

export const FileStates: Story = {
  parameters: {
    ...storyDescription("components-upload--file-states"),
    docs: {
      ...storyDescription("components-upload--file-states").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Upload
  defaultFileList={[
    { uid: '1', name: '완료된 파일.pdf', status: 'done', url: '/sample.pdf' },
    { uid: '2', name: '업로드 중.png', status: 'uploading', percent: 60 },
    { uid: '3', name: '실패한 파일.zip', status: 'error' },
  ]}
>
  <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>파일 추가</Button>
</Upload>`),
      },
    },
  },
  render: () => (
    <Upload
      defaultFileList={[
        { uid: "1", name: "완료된 파일.pdf", status: "done", url: "/sample.pdf" },
        { uid: "2", name: "업로드 중.png", status: "uploading", percent: 60 },
        { uid: "3", name: "실패한 파일.zip", status: "error" },
      ]}
    >
      <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
        파일 추가
      </Button>
    </Upload>
  ),
};
