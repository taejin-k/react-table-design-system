import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TypeTokens } from "../../storybook/type-tokens";
import { Button } from "../Button";
import { Upload } from "./Upload";
import type { UploadFile, UploadListType, UploadProps } from "./Upload.types";

const uploadListTypes: UploadListType[] = ["text", "picture"];
const listFiles: UploadFile[] = [
  {
    uid: "list-1",
    name: "design-system.png",
    url: "https://picsum.photos/seed/wizard-upload-design-system/160/160",
    type: "image/png",
  },
  {
    uid: "list-2",
    name: "product-photo.jpg",
    url: "https://picsum.photos/seed/wizard-upload-product-photo/160/160",
    type: "image/jpeg",
  },
  {
    uid: "list-3",
    name: "profile.jpeg",
    url: "https://picsum.photos/seed/wizard-upload-profile/160/160",
    type: "image/jpeg",
  },
  {
    uid: "list-4",
    name: "presentation.ppt",
    url: "data:application/vnd.ms-powerpoint,presentation.ppt",
    type: "application/vnd.ms-powerpoint",
  },
];
const sortableFiles: UploadFile[] = [
  { ...listFiles[0], uid: "sortable-1", name: "design-system.png" },
  { ...listFiles[1], uid: "sortable-2", name: "dashboard.png" },
  { ...listFiles[2], uid: "sortable-3", name: "profile.png" },
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
    maxCount: { name: "최대 개수", control: { type: "number", min: 1, step: 1 } },
    disabled: { name: "비활성", control: "boolean" },
    draggable: { name: "드래그 정렬", control: "boolean" },
    showUploadList: { name: "목록 표시", control: "boolean" },
    directory: { name: "폴더 선택", control: "boolean" },
    children: { control: false, table: { disable: true } },
    beforeUpload: { control: false, table: { disable: true } },
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
          "클릭 또는 드래그로 파일을 선택하고 목록을 관리해요.  \n파일 검증, 두 가지 목록 모양과 미리보기를 지원해요.",
      },
      page: () => (
        <div className="upload-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### <span id="upload">Upload</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`children\` | 파일 선택 트리거를 구성해요. | \`ReactNode\` | - |
| \`accept\` | 선택할 파일의 확장자나 MIME 형식을 설정해요. | \`string\` | - |
| \`capture\` | 모바일에서 카메라나 마이크 입력을 요청해요. | \`boolean\` | \`false\` |
| \`multiple\` | 파일을 여러 개 선택해요. | \`boolean\` | \`false\` |
| \`maxCount\` | 최대 파일 수를 정하고 초과 시 안내해요. | \`number\` | - |
| \`directory\` | 폴더 단위 선택을 허용해요. | \`boolean\` | \`false\` |
| \`disabled\` | 파일 선택과 제거를 비활성화해요. | \`boolean\` | \`false\` |
| \`fileList\` | 표시할 파일 목록을 제어해요. | [\`UploadFile[]\`](#upload-file) | - |
| \`defaultFileList\` | 처음 표시할 파일 목록을 정해요. | [\`UploadFile[]\`](#upload-file) | \`[]\` |
| \`listType\` | 파일 목록의 표현 방식을 정해요. | [\`UploadListType\`](#upload-list-type) | \`text\` |
| \`showUploadList\` | 파일 목록 표시 여부를 설정해요. | \`boolean\` | \`true\` |
| \`draggable\` | text·picture 목록을 핸들로 정렬해요. | \`boolean\` | \`false\` |
| \`beforeUpload\` | 파일을 목록에 추가하기 전에 검사해요. | <code>(info: <a href="#upload-change-param">UploadChangeParam&lt;File&gt;</a>) =&gt; boolean \\| Promise&lt;boolean&gt;</code> | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 파일 목록이 바뀔 때 실행해요. | <code>(info: <a href="#upload-change-param">UploadChangeParam</a>) =&gt; void</code> | - |
| \`onDrop\` | 파일을 놓았을 때 실행해요. | \`(event) => void\` | - |
| \`onDownload\` | 다운로드 아이콘을 누를 때 실행해요. | <code>(file: <a href="#upload-file">UploadFile</a>) =&gt; void \\| Promise&lt;void&gt;</code> | - |
| \`onRemove\` | 파일을 제거하기 전에 실행해요. | <code>(file: <a href="#upload-file">UploadFile</a>) =&gt; boolean \\| Promise&lt;boolean&gt;</code> | - |

### Upload.Dragger

나머지 설정은 Upload와 같아요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`children\` | 드래그 영역에 표시할 내용을 구성해요. | \`ReactNode\` | 기본 업로드 안내 |

### <span id="upload-file">UploadFile</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`uid\` | 파일을 구분하는 키예요. | \`string\` | - |
| \`name\` | 파일 이름이에요. | \`string\` | - |
| \`size\` | 파일 크기(byte)예요. | \`number\` | - |
| \`type\` | 파일 MIME 형식이에요. | \`string\` | - |
| \`url\` | 미리보기·다운로드 주소예요. | \`string\` | - |
| \`originFileObj\` | 사용자가 선택한 원본 파일이에요. | \`File\` | - |

### <span id="upload-change-param">UploadChangeParam</span>

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`file\` | 변경을 일으킨 파일이에요. | [\`UploadFile\`](#upload-file) | - |
| \`fileList\` | 변경 후 전체 파일 목록이에요. | [\`UploadFile[]\`](#upload-file) | - |

          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="upload-list-type">UploadListType</h3>
          <p>파일 목록의 표현 방식을 선택해요.</p>
          <TypeTokens values={uploadListTypes} />
        </div>
      ),
    },
  },
} satisfies Meta<typeof Upload>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    listType: "text",
    multiple: false,
    disabled: false,
    draggable: false,
    showUploadList: true,
    directory: false,
    children: <Button>파일 선택</Button>,
  },
  parameters: {
    ...storyDescription("components-upload--basic"),
    controls: {
      include: ["목록 모양", "다중 선택", "비활성", "드래그 정렬", "목록 표시"],
    },
    docs: {
      ...storyDescription("components-upload--basic").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Upload>\n  <Button>파일 선택</Button>\n</Upload>`),
      },
    },
  },
};
export const ListTypes: Story = {
  args: {
    multiple: false,
    disabled: false,
    showUploadList: true,
    directory: false,
  },
  argTypes: { listType: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-upload--list-types"),
    controls: {
      include: ["비활성", "목록 표시"],
    },
    docs: {
      ...storyDescription("components-upload--list-types").docs,
      source: {
        type: "code",
        code: withStoryImports(`const files: UploadFile[] = [
  {
    uid: 'list-1',
    name: 'design-system.png',
    url: 'https://picsum.photos/seed/wizard-upload-design-system/160/160',
    type: 'image/png',
  },
  {
    uid: 'list-2',
    name: 'product-photo.jpg',
    url: 'https://picsum.photos/seed/wizard-upload-product-photo/160/160',
    type: 'image/jpeg',
  },
  {
    uid: 'list-3',
    name: 'profile.jpeg',
    url: 'https://picsum.photos/seed/wizard-upload-profile/160/160',
    type: 'image/jpeg',
  },
  {
    uid: 'list-4',
    name: 'presentation.ppt',
    url: 'data:application/vnd.ms-powerpoint,presentation.ppt',
    type: 'application/vnd.ms-powerpoint',
  },
];

function UploadListTypes() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <strong>Text</strong>
        <Upload listType="text" defaultFileList={files}>
          <Button>파일 선택</Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload listType="picture" defaultFileList={files}>
          <Button>파일 선택</Button>
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
          <Button>파일 선택</Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload {...args} listType="picture" defaultFileList={listFiles}>
          <Button>파일 선택</Button>
        </Upload>
      </div>
    </div>
  ),
};

export const SortableLists: Story = {
  args: {
    draggable: true,
    disabled: false,
    showUploadList: true,
  },
  argTypes: { listType: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-upload--sortable-lists"),
    controls: {
      include: ["비활성", "드래그 정렬", "목록 표시"],
    },
    docs: {
      ...storyDescription("components-upload--sortable-lists").docs,
      source: {
        type: "code",
        code: withStoryImports(`const initialFiles: UploadFile[] = [
  {
    uid: 'design',
    name: 'design-system.png',
    url: 'https://picsum.photos/seed/wizard-upload-design-system/160/160',
    type: 'image/png',
  },
  {
    uid: 'dashboard',
    name: 'dashboard.png',
    url: 'https://picsum.photos/seed/wizard-upload-product-photo/160/160',
    type: 'image/png',
  },
  {
    uid: 'profile',
    name: 'profile.png',
    url: 'https://picsum.photos/seed/wizard-upload-profile/160/160',
    type: 'image/png',
  },
];

function SortableUploadLists() {
  const [textFiles, setTextFiles] = useState<UploadFile[]>(initialFiles);
  const [pictureFiles, setPictureFiles] = useState<UploadFile[]>(initialFiles);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <strong>Text</strong>
        <Upload
          draggable
          fileList={textFiles}
          onChange={({ fileList }) => setTextFiles(fileList)}
        >
          <Button>파일 선택</Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload
          draggable
          listType="picture"
          fileList={pictureFiles}
          onChange={({ fileList }) => setPictureFiles(fileList)}
        >
          <Button>파일 선택</Button>
        </Upload>
      </div>
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <SortableListsExample {...args} />,
};

function SortableListsExample(args: Partial<UploadProps>) {
  const [textFiles, setTextFiles] = useState<UploadFile[]>(sortableFiles);
  const [pictureFiles, setPictureFiles] = useState<UploadFile[]>(sortableFiles);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <strong>Text</strong>
        <Upload
          {...args}
          listType="text"
          fileList={textFiles}
          onChange={({ fileList }) => setTextFiles(fileList)}
        >
          <Button>파일 선택</Button>
        </Upload>
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload
          {...args}
          listType="picture"
          fileList={pictureFiles}
          onChange={({ fileList }) => setPictureFiles(fileList)}
        >
          <Button>파일 선택</Button>
        </Upload>
      </div>
    </div>
  );
}

export const DragAndDrop: Story = {
  args: {
    multiple: true,
    disabled: false,
    showUploadList: true,
    directory: false,
  },
  argTypes: {
    listType: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-upload--drag-and-drop"),
    controls: {
      include: ["다중 선택", "비활성", "목록 표시"],
    },
    docs: {
      ...storyDescription("components-upload--drag-and-drop").docs,
      source: {
        type: "code",
        code: withStoryImports(`<div className="grid gap-8 lg:grid-cols-2">
  <div className="flex flex-col gap-3">
    <strong>Text</strong>
    <Upload.Dragger listType="text" multiple />
  </div>
  <div className="flex flex-col gap-3">
    <strong>Picture</strong>
    <Upload.Dragger listType="picture" multiple />
  </div>
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        <strong>Text</strong>
        <Upload.Dragger {...args} listType="text" />
      </div>
      <div className="flex flex-col gap-3">
        <strong>Picture</strong>
        <Upload.Dragger {...args} listType="picture" />
      </div>
    </div>
  ),
};

export const SelectionRules: Story = {
  args: {
    listType: "text",
    disabled: false,
    showUploadList: true,
  },
  argTypes: {
    accept: { control: false, table: { disable: true } },
    multiple: { control: false, table: { disable: true } },
    maxCount: { control: false, table: { disable: true } },
  },
  parameters: {
    ...storyDescription("components-upload--selection-rules"),
    controls: { include: ["목록 모양", "비활성", "목록 표시"] },
    docs: {
      ...storyDescription("components-upload--selection-rules").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Upload
  accept="image/png"
  multiple
  maxCount={2}
>
  <Button>PNG 파일 선택</Button>
</Upload>`),
      },
    },
  },
  render: (args) => (
    <Upload {...args} accept="image/png" multiple maxCount={2}>
      <Button>PNG 파일 선택</Button>
    </Upload>
  ),
};

export const Directory: Story = {
  args: {
    listType: "text",
    disabled: false,
    showUploadList: true,
  },
  argTypes: { multiple: { control: false, table: { disable: true } } },
  parameters: {
    ...storyDescription("components-upload--directory"),
    controls: {
      include: ["목록 모양", "비활성", "목록 표시"],
    },
    docs: {
      ...storyDescription("components-upload--directory").docs,
      source: {
        type: "code",
        code: withStoryImports(`<Upload directory multiple>
  <Button>폴더 선택</Button>
</Upload>`),
      },
    },
  },
  render: (args) => (
    <Upload {...args} directory multiple>
      <Button>폴더 선택</Button>
    </Upload>
  ),
};

export const ControlledFileList: Story = {
  args: {
    listType: "text",
    multiple: false,
    disabled: false,
    draggable: false,
    showUploadList: true,
    directory: false,
  },
  parameters: {
    ...storyDescription("components-upload--controlled-file-list"),
    controls: {
      include: ["목록 모양", "다중 선택", "비활성", "드래그 정렬", "목록 표시"],
    },
    docs: {
      ...storyDescription("components-upload--controlled-file-list").docs,
      source: {
        type: "code",
        code: withStoryImports(`function ControlledUpload() {
  const [files, setFiles] = useState<UploadFile[]>([
    { uid: 'guide', name: 'upload-guide.pdf', url: 'data:application/pdf,upload-guide' },
  ]);

  return (
    <Upload
      fileList={files}
      showUploadList
      onChange={({ fileList }) => setFiles(fileList)}
    >
      <Button>파일 선택</Button>
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
    {
      uid: "guide",
      name: "upload-guide.pdf",
      url: "data:application/pdf,upload-guide",
    },
  ]);

  return (
    <Upload {...args} fileList={files} onChange={({ fileList }) => setFiles(fileList)}>
      <Button>파일 선택</Button>
    </Upload>
  );
}
