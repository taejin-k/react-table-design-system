import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef, useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Tag } from "../Tag";
import { Upload } from "./Upload";
import type {
  UploadCaptureType,
  UploadFile,
  UploadFileStatusType,
  UploadListType,
  UploadProps,
} from "./Upload.types";

const uploadListTypes: UploadListType[] = ["text", "picture", "picture-card", "picture-circle"];
const uploadFileStatuses: UploadFileStatusType[] = ["uploading", "done", "error", "removed"];
const uploadCaptureTypes: UploadCaptureType[] = [true, "user", "environment"];
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
  argTypes: {
    accept: { name: "파일 형식", control: "text" },
    listType: { name: "목록 모양", control: "select", options: uploadListTypes },
    multiple: { name: "다중 선택", control: "boolean" },
    maxCount: { name: "최대 개수", control: "number" },
    disabled: { name: "비활성", control: "boolean" },
    showUploadList: { name: "파일 목록", control: "boolean" },
    directory: { name: "폴더 선택", control: "boolean" },
    pastable: { name: "붙여넣기", control: "boolean" },
    openFileDialogOnClick: { name: "클릭으로 열기", control: "boolean" },
    children: { control: false, table: { disable: true } },
    beforeUpload: { control: false, table: { disable: true } },
    customRequest: { control: false, table: { disable: true } },
    defaultFileList: { control: false, table: { disable: true } },
    fileList: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
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
### Upload

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`accept\` | 선택할 파일 형식과 필터를 설정해요. | \`string \\| \`[\`UploadAcceptConfig\`](#uploadacceptconfig) | - |
| \`action\` | 파일을 전송할 주소를 정해요. | \`string \\| ((file) => string \\| Promise<string>)\` | - |
| \`capture\` | 모바일 카메라나 마이크 입력을 선택해요. | [\`UploadCaptureType\`](#upload-capture-type) | - |
| \`beforeUpload\` | 업로드 전에 파일을 검사하거나 중단해요. \`Upload.LIST_IGNORE\`면 목록에서도 제외해요. | \`(file, fileList) => boolean \\| File \\| Promise<boolean \\| File> \\| typeof Upload.LIST_IGNORE\` | - |
| \`customRequest\` | 기본 XHR 대신 직접 전송해요. | \`(options: UploadRequestOption, info: UploadCustomRequestInfo) => void \\| { abort? }\` | - |
| \`data\` | 전송할 추가 데이터를 설정해요. | \`object \\| (file) => object \\| Promise<object>\` | - |
| \`fileList\` | 표시할 파일 목록을 제어해요. | [\`UploadFile[]\`](#uploadfile) | - |
| \`defaultFileList\` | 처음 표시할 파일 목록을 정해요. | [\`UploadFile[]\`](#uploadfile) | \`[]\` |
| \`listType\` | 파일 목록의 표현 방식을 정해요. | [\`UploadListType\`](#upload-list-type) | \`text\` |
| \`multiple\` | 파일을 여러 개 선택해요. | \`boolean\` | \`false\` |
| \`maxCount\` | 최대 파일 수를 정하고 초과 시 안내해요. | \`number\` | - |
| \`directory\` | 폴더 단위 선택을 허용해요. | \`boolean\` | \`false\` |
| \`disabled\` | 파일 선택과 제거를 비활성화해요. | \`boolean\` | \`false\` |
| \`headers\` | 업로드 요청 헤더를 설정해요. | \`Record<string, string>\` | - |
| \`method\` | 업로드 요청 메서드를 정해요. | [\`UploadMethodType\`](#upload-method-type) | \`post\` |
| \`name\` | FormData의 파일 필드명을 정해요. | \`string\` | \`file\` |
| \`openFileDialogOnClick\` | 자식 클릭으로 파일 선택창을 열어요. | \`boolean\` | \`true\` |
| \`pastable\` | 클립보드의 파일을 붙여넣어 추가해요. | \`boolean\` | \`false\` |
| \`progress\` | 목록 진행률의 색상·굵기·수치를 설정해요. | [\`UploadProgressType\`](#uploadprogresstype) | 기본 진행률 |
| \`showUploadList\` | 목록과 파일별 동작을 설정해요. | \`boolean \\| \`[\`UploadShowListType\`](#uploadshowlisttype) | \`true\` |
| \`withCredentials\` | 요청에 인증 정보를 포함해요. | \`boolean\` | \`false\` |
| \`children\` | 파일 선택 트리거를 구성해요. | \`ReactNode\` | - |
| \`itemRender\` | 파일 목록 항목을 직접 구성해요. | \`(originNode, file, fileList, actions) => ReactNode\` | - |
| \`iconRender\` | 파일 아이콘을 직접 구성해요. | \`(file, listType) => ReactNode\` | - |
| \`isImageUrl\` | 파일이 이미지인지 판단해요. | \`(file) => boolean\` | 확장자·MIME 판단 |
| \`previewFile\` | 로컬 파일의 미리보기 주소를 만들어요. | \`(file) => Promise<string>\` | Object URL |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`style\` | 최상위 요소에 인라인 스타일을 추가해요. | \`CSSProperties\` | - |
| \`onChange\` | 파일 상태나 목록이 바뀔 때 실행해요. | \`(info: \`[\`UploadChangeParam\`](#uploadchangeparam)\`) => void\` | - |
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
          <h3 id="upload-capture-type">UploadCaptureType</h3>
          <p>모바일에서 사용할 입력 장치를 선택해요.</p>
          <TypeTokens values={uploadCaptureTypes} />
          <h3 id="upload-method-type">UploadMethodType</h3>
          <p>업로드 요청에 사용할 HTTP 메서드예요.</p>
          <TypeTokens values={["post", "put", "patch"]} />
          <Markdown>{`
### UploadFile

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`uid\` | 파일을 구분하는 키예요. | \`string\` | - |
| \`name\` | 파일 이름이에요. | \`string\` | - |
| \`status\` | 현재 업로드 상태예요. | [\`UploadFileStatusType\`](#upload-file-status-type) | - |
| \`percent\` | 업로드 진행률이에요. | \`number\` | - |
| \`size\` | 파일 크기(byte)예요. | \`number\` | - |
| \`type\` | 파일 MIME 형식이에요. | \`string\` | - |
| \`url\` | 미리보기·다운로드 주소예요. | \`string\` | - |
| \`thumbUrl\` | 목록 썸네일 주소예요. | \`string\` | - |
| \`originFileObj\` | 사용자가 선택한 원본 파일이에요. | \`File\` | - |
| \`response\` | 업로드 응답 데이터예요. | \`unknown\` | - |
| \`error\` | 업로드 오류 정보예요. | \`unknown\` | - |

### UploadAcceptConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`format\` | 파일 선택창에서 허용할 확장자나 MIME 형식이에요. | \`string\` | - |
| \`filter\` | 선택한 파일을 추가로 검사해요. | \`native \\| (file) => boolean\` | \`native\` |

### UploadShowListType

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`extra\` | 파일 오른쪽에 추가 내용을 표시해요. | \`ReactNode \\| (file) => ReactNode\` | - |
| \`showPreviewIcon\` | 미리보기 동작을 표시해요. | \`boolean \\| (file) => boolean\` | \`true\` |
| \`showRemoveIcon\` | 제거 동작을 표시해요. | \`boolean \\| (file) => boolean\` | \`true\` |
| \`showDownloadIcon\` | 다운로드 동작을 표시해요. | \`boolean \\| (file) => boolean\` | \`true\` |
| \`previewIcon\` | 미리보기 아이콘을 변경해요. | \`ReactNode \\| (file) => ReactNode\` | eye Icon |
| \`removeIcon\` | 제거 아이콘을 변경해요. | \`ReactNode \\| (file) => ReactNode\` | delete Icon |
| \`downloadIcon\` | 다운로드 아이콘을 변경해요. | \`ReactNode \\| (file) => ReactNode\` | download Icon |

### UploadProgressType

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`strokeColor\` | 진행 막대 색상을 정해요. | \`CSSProperties['color']\` | \`#0062df\` |
| \`strokeWidth\` | 진행 막대 굵기를 정해요. | \`number\` | \`2\` |
| \`showInfo\` | 진행률 숫자를 표시해요. | \`boolean\` | \`false\` |

### UploadChangeParam

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`file\` | 상태가 바뀐 파일이에요. | [\`UploadFile\`](#uploadfile) | - |
| \`fileList\` | 변경 후 전체 파일 목록이에요. | [\`UploadFile[]\`](#uploadfile) | - |
| \`event\` | 업로드 진행률 정보예요. | \`{ percent: number }\` | - |

### UploadRequestOption

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`action\` | 전송할 주소예요. | \`string\` | - |
| \`filename\` | FormData 파일 필드명이에요. | \`string\` | - |
| \`file\` | 전송할 원본 파일이에요. | \`File\` | - |
| \`data\` | 함께 전송할 데이터예요. | \`Record<string, unknown>\` | - |
| \`headers\` | 요청 헤더예요. | \`Record<string, string>\` | - |
| \`method\` | 요청 메서드예요. | [\`UploadMethodType\`](#upload-method-type) | - |
| \`withCredentials\` | 인증 정보 포함 여부예요. | \`boolean\` | - |
| \`onProgress\` | 진행률을 전달해요. | \`(event) => void\` | - |
| \`onSuccess\` | 성공 응답을 전달해요. | \`(body) => void\` | - |
| \`onError\` | 오류 응답을 전달해요. | \`(error, body?) => void\` | - |

### UploadCustomRequestInfo

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`defaultRequest\` | 필요한 경우 기본 XHR 전송을 호출해요. | \`(options: UploadRequestOption) => XMLHttpRequest\` | - |
          `}</Markdown>
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
    maxCount: 4,
    beforeUpload: () => false,
    defaultFileList: [
      listFiles[0],
      { uid: "uploading", name: "banner.png", status: "uploading", percent: 64 },
      { uid: "error", name: "broken.png", status: "error" },
    ],
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
          `const files: UploadFile[] = [
  {
    uid: 'design',
    name: 'design-system.png',
    status: 'done',
    url: '/images/design-system.png',
    thumbUrl: '/images/design-system.png',
    type: 'image/png',
  },
  { uid: 'uploading', name: 'banner.png', status: 'uploading', percent: 64 },
  { uid: 'error', name: 'broken.png', status: 'error' },
];

<Upload
  accept="image/*"
  listType="picture-card"
  maxCount={4}
  defaultFileList={files}
  beforeUpload={() => false}
>
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
  args: { multiple: false, disabled: false, showUploadList: true },
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
    url: '/images/design-system.png',
    thumbUrl: '/images/design-system.png',
    type: 'image/png',
  },
];

function UploadListTypes() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <strong>Text</strong>
        <Upload listType="text" defaultFileList={files}>
          <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>파일 선택</Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload listType="picture" defaultFileList={files}>
          <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>파일 선택</Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture Card</strong>
        <Upload listType="picture-card" defaultFileList={files}>
          <span className="flex flex-col items-center gap-2"><Icon icon="add" />업로드</span>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture Circle</strong>
        <Upload listType="picture-circle" defaultFileList={files}>
          <span className="flex flex-col items-center gap-2"><Icon icon="add" />업로드</span>
        </Upload>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <strong>Text</strong>
        <Upload {...args} listType="text" defaultFileList={listFiles}>
          <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
            파일 선택
          </Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload {...args} listType="picture" defaultFileList={listFiles}>
          <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
            파일 선택
          </Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture Card</strong>
        <Upload {...args} listType="picture-card" defaultFileList={listFiles}>
          <span className="flex flex-col items-center gap-2">
            <Icon icon="add" />
            업로드
          </span>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture Circle</strong>
        <Upload {...args} listType="picture-circle" defaultFileList={listFiles}>
          <span className="flex flex-col items-center gap-2">
            <Icon icon="add" />
            업로드
          </span>
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
  args: { multiple: false, disabled: false, showUploadList: true },
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
  render: (args) => <UploadProgressExample {...args} />,
};

function UploadProgressExample(args: Partial<UploadProps>) {
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearInterval(timerRef.current), []);
  return (
    <Upload
      {...args}
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
  args: { multiple: false, disabled: false, showUploadList: true },
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
  render: (args) => (
    <Upload
      {...args}
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

export const SelectionRules: Story = {
  args: { disabled: false, showUploadList: true, openFileDialogOnClick: true },
  parameters: {
    ...storyDescription("components-upload--selection-rules"),
    docs: {
      ...storyDescription("components-upload--selection-rules").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Upload
  accept="image/png"
  multiple
  maxCount={2}
  beforeUpload={() => false}
>
  <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
    PNG 파일 선택
  </Button>
</Upload>`),
      },
    },
  },
  render: (args) => (
    <Upload {...args} accept="image/png" multiple maxCount={2} beforeUpload={() => false}>
      <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
        PNG 파일 선택
      </Button>
    </Upload>
  ),
};

export const DirectoryAndPaste: Story = {
  args: { disabled: false, showUploadList: true, openFileDialogOnClick: true },
  parameters: {
    ...storyDescription("components-upload--directory-and-paste"),
    docs: {
      ...storyDescription("components-upload--directory-and-paste").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="flex flex-wrap gap-3">
  <Upload directory multiple beforeUpload={() => false}>
    <Button variant="secondary" prefixIcon={<Icon icon="folder-outlined" />}>
      폴더 선택
    </Button>
  </Upload>
  <Upload pastable multiple beforeUpload={() => false}>
    <Button variant="secondary" prefixIcon={<Icon icon="copy-outlined" />}>
      파일 붙여넣기
    </Button>
  </Upload>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      <Upload {...args} directory multiple beforeUpload={() => false}>
        <Button variant="secondary" prefixIcon={<Icon icon="folder-outlined" />}>
          폴더 선택
        </Button>
      </Upload>
      <Upload {...args} pastable multiple beforeUpload={() => false}>
        <Button variant="secondary" prefixIcon={<Icon icon="copy-outlined" />}>
          파일 붙여넣기
        </Button>
      </Upload>
    </div>
  ),
};

export const ControlledFileList: Story = {
  args: { multiple: false, disabled: false, openFileDialogOnClick: true },
  parameters: {
    ...storyDescription("components-upload--controlled-file-list"),
    docs: {
      ...storyDescription("components-upload--controlled-file-list").docs,
      source: {
        type: "code",
        code: withStoryImports(`function ControlledUpload() {
  const [files, setFiles] = useState<UploadFile[]>([
    { uid: 'guide', name: 'upload-guide.pdf', status: 'done', url: '/guide.pdf' },
  ]);

  return (
    <Upload
      fileList={files}
      beforeUpload={() => false}
      showUploadList={{
        extra: (file) => file.status === 'done' && <Tag color="green">완료</Tag>,
      }}
      onChange={({ fileList }) => setFiles(fileList)}
    >
      <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
        파일 선택
      </Button>
    </Upload>
  );
}`),
      },
    },
  },
  render: (args) => <ControlledUploadExample {...args} />,
};

function ControlledUploadExample(args: Partial<UploadProps>) {
  const [files, setFiles] = useState<UploadFile[]>([
    { uid: "guide", name: "upload-guide.pdf", status: "done", url: "/guide.pdf" },
  ]);

  return (
    <Upload
      {...args}
      fileList={files}
      beforeUpload={() => false}
      showUploadList={{
        extra: (file) => file.status === "done" && <Tag color="green">완료</Tag>,
      }}
      onChange={({ fileList }) => setFiles(fileList)}
    >
      <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
        파일 선택
      </Button>
    </Upload>
  );
}
