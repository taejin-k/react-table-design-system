import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Upload } from "./Upload";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Upload",
  component: Upload,
  tags: ["autodocs"],
  args: {
    beforeUpload: () => false,
    children: (
      <Button variant="secondary" prefixIcon={<Icon icon="upload" />}>
        파일 선택
      </Button>
    ),
  },
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
| \`fileList\` | 표시할 파일 목록을 제어해요. | \`UploadFile[]\` | - |
| \`defaultFileList\` | 처음 표시할 파일 목록을 정해요. | \`UploadFile[]\` | \`[]\` |
| \`listType\` | 파일 목록의 표현 방식을 정해요. | \`'text' \\| 'picture' \\| 'picture-card' \\| 'picture-circle'\` | \`'text'\` |
| \`multiple\` | 파일을 여러 개 선택해요. | \`boolean\` | \`false\` |
| \`maxCount\` | 목록에 유지할 최대 파일 수를 정해요. | \`number\` | - |
| \`directory\` | 폴더 단위 선택을 허용해요. | \`boolean\` | \`false\` |
| \`pastable\` | 클립보드의 파일을 붙여넣어 추가해요. | \`boolean\` | \`false\` |
| \`showUploadList\` | 목록과 미리보기·제거·다운로드 버튼을 설정해요. | \`boolean \\| object\` | \`true\` |
| \`onChange\` | 파일 상태나 목록이 바뀔 때 실행해요. | \`(info: UploadChangeParam) => void\` | - |
| \`onRemove\` | 파일을 제거하기 전에 실행해요. | \`(file) => boolean \\| Promise<boolean \\| void>\` | - |

### Upload.Dragger

\`Upload\`와 같은 API를 사용하며 파일을 놓을 수 있는 넓은 드래그 영역을 제공해요.
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Upload>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
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
    children: <span>+ 업로드</span>,
  },
  parameters: {
    ...storyDescription("components-upload--picture-card"),
    docs: {
      ...storyDescription("components-upload--picture-card").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Upload accept="image/*" listType="picture-card" maxCount={3} beforeUpload={() => false}>\n  <span>+ 업로드</span>\n</Upload>`,
        ),
      },
    },
  },
};
export const DragAndDrop: Story = {
  args: { multiple: true, children: undefined },
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
