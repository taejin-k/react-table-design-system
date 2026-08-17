import { useState } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { TextArea } from "./TextArea";

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const storySource = (id: string, code: string) => ({
  docs: {
    description: { story: storyDescriptions[id] },
    source: { code: withStoryImports(code) },
  },
});

const meta = {
  title: "Components/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  args: { placeholder: "내용을 입력하세요" },
  argTypes: {
    defaultValue: { name: "초기값", control: "text" },
    size: { name: "크기", control: "select", options: ["lg", "md", "sm"] },
    variant: {
      name: "표현 방식",
      control: "select",
      options: ["default", "filled"],
    },
    placeholder: { name: "placeholder", control: "text" },
    label: { name: "레이블", control: "text" },
    errorMessage: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    autoSize: { name: "자동 높이", control: "boolean" },
    allowOnly: {
      name: "입력 문자",
      control: "select",
      options: ["korean", "english", "number"],
    },
    resize: { name: "크기 조절", control: "boolean" },
    showCount: { name: "글자 수", control: "boolean" },
    maxLength: { name: "최대 글자 수", control: { type: "number", min: 1 } },
    width: { name: "가로 길이", control: { type: "number", min: 1 } },
    disabled: { name: "비활성", control: "boolean" },
    readOnly: { name: "읽기 전용", control: "boolean" },
    className: { control: false },
    validate: { control: false },
    onBlur: { control: false },
    onChange: { control: false },
    onEnter: { control: false },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "여러 줄의 내용을 입력할 수 있어요.  \n높이·글자 수와 오류 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="textarea-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### TextArea

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 입력값을 외부에서 관리해요. | \`string\` | - |
| \`defaultValue\` | 처음 표시할 입력값을 설정해요. | \`string\` | - |
| \`placeholder\` | 값이 없을 때 안내 문구를 표시해요. | \`string\` | - |
| \`width\` | TextArea의 가로 길이를 px 단위로 설정해요. | \`number\` | \`100%\` |
| \`size\` | TextArea의 크기를 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | \`default \\| filled\` | \`default\` |
| \`autoSize\` | 입력 내용에 맞춰 높이를 조절해요. | \`boolean \\| { minRows, maxRows }\` | \`false\` |
| \`allowOnly\` | 입력할 수 있는 문자 종류를 제한해요. | \`korean \\| english \\| number\` | - |
| \`resize\` | 우측 하단 크기 조절 핸들을 표시해요. | \`boolean\` | \`true\` |
| \`showCount\` | 현재 글자 수를 표시해요. | \`boolean\` | \`false\` |
| \`maxLength\` | 입력할 수 있는 최대 글자 수를 설정해요. | \`number\` | - |
| \`disabled\` | 입력을 비활성화해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 입력값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`required\` | 필수 입력 표시와 네이티브 속성을 적용해요. | \`boolean\` | \`false\` |
| \`label\` | TextArea 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorMessage\` | TextArea 아래에 고정 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`validate\` | 포커스가 빠질 때 입력값을 검사해요. | \`(value: string) => string \\| Promise<string>\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 입력값이 바뀔 때 실행할 함수예요. | \`(value: string) => void\` | - |
| \`onEnter\` | Shift 없이 Enter를 누를 때 실행할 함수예요. | \`() => void\` | - |

          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-textarea--sizes"),
    controls: { disable: false, include: ["placeholder", "크기", "가로 길이"] },
    docs: {
      ...storyDescription("components-textarea--sizes").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea size="lg" placeholder="Large" />
  <TextArea size="md" placeholder="Medium" />
  <TextArea size="sm" placeholder="Small" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <TextArea size="lg" placeholder="Large" />
        <TextArea size="md" placeholder="Medium" />
        <TextArea size="sm" placeholder="Small" />
      </div>
    ) : (
      <TextArea {...args} className="max-w-xl" />
    ),
};

export const Widths: Story = {
  args: {
    placeholder: "가로 길이 320px",
    width: 320,
  },
  parameters: {
    ...storyDescription("components-textarea--widths"),
    controls: { disable: false, include: ["placeholder", "가로 길이"] },
    docs: {
      ...storyDescription("components-textarea--widths").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea placeholder="부모 너비 100%" />
  <TextArea width={240} placeholder="가로 길이 240px" />
  <TextArea width={320} placeholder="가로 길이 320px" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <TextArea placeholder="부모 너비 100%" />
        <TextArea width={240} placeholder="가로 길이 240px" />
        <TextArea width={320} placeholder="가로 길이 320px" />
      </div>
    ) : (
      <TextArea {...args} />
    ),
};

export const Variants: Story = {
  parameters: {
    ...storyDescription("components-textarea--variants"),
    controls: { disable: false, include: ["표현 방식"] },
    docs: {
      ...storyDescription("components-textarea--variants").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea placeholder="기본" />
  <TextArea placeholder="채움" variant="filled" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <TextArea placeholder="기본" />
        <TextArea placeholder="채움" variant="filled" />
      </div>
    ) : (
      <TextArea {...args} className="max-w-xl" />
    ),
};

export const States: Story = {
  parameters: {
    ...storyDescription("components-textarea--states"),
    controls: { disable: false, include: ["읽기 전용", "비활성"] },
    docs: {
      ...storyDescription("components-textarea--states").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea placeholder="기본" />
  <TextArea readOnly defaultValue="읽기만 할 수 있어요" />
  <TextArea disabled defaultValue="수정할 수 없어요" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <TextArea placeholder="기본" />
        <TextArea readOnly defaultValue="읽기만 할 수 있어요" />
        <TextArea disabled defaultValue="수정할 수 없어요" />
      </div>
    ) : (
      <TextArea {...args} className="max-w-xl" />
    ),
};

export const AllowedCharacters: Story = {
  args: {
    allowOnly: "korean",
    placeholder: "한글만 입력하세요",
  },
  parameters: {
    ...storyDescription("components-textarea--allowed-characters"),
    controls: { disable: false, include: ["placeholder", "입력 문자"] },
    docs: {
      ...storyDescription("components-textarea--allowed-characters").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea allowOnly="korean" placeholder="한글만 입력하세요" />
  <TextArea allowOnly="english" placeholder="영어만 입력하세요" />
  <TextArea allowOnly="number" placeholder="숫자만 입력하세요" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <TextArea allowOnly="korean" placeholder="한글만 입력하세요" />
        <TextArea allowOnly="english" placeholder="영어만 입력하세요" />
        <TextArea allowOnly="number" placeholder="숫자만 입력하세요" />
      </div>
    ) : (
      <TextArea {...args} className="max-w-xl" />
    ),
};

export const AutoSize: Story = {
  args: { autoSize: true },
  parameters: {
    ...storyDescription("components-textarea--auto-size"),
    controls: { disable: false, include: ["자동 높이"] },
    docs: {
      ...storyDescription("components-textarea--auto-size").docs,
      source: {
        code: withStoryImports(
          `<div className="grid max-w-xl gap-4">
  <TextArea autoSize placeholder="내용에 따라 제한 없이 높이가 늘어나요" />
  <TextArea size="lg" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Large" />
  <TextArea size="md" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Medium" />
  <TextArea size="sm" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Small" />
</div>`,
        ),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <TextArea autoSize placeholder="내용에 따라 제한 없이 높이가 늘어나요" />
        <TextArea size="lg" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Large" />
        <TextArea size="md" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Medium" />
        <TextArea size="sm" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Small" />
      </div>
    ) : (
      <TextArea {...args} className="max-w-xl" />
    ),
};

export const Resize: Story = {
  args: { resize: true },
  parameters: {
    ...storyDescription("components-textarea--resize"),
    controls: { disable: false, include: ["크기 조절"] },
    docs: {
      ...storyDescription("components-textarea--resize").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea placeholder="크기 조절 가능" />
  <TextArea resize={false} placeholder="크기 조절 불가" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <TextArea placeholder="크기 조절 가능" />
        <TextArea resize={false} placeholder="크기 조절 불가" />
      </div>
    ) : (
      <TextArea {...args} className="max-w-xl" />
    ),
};

export const Count: Story = {
  args: {
    defaultValue: "최대 글자 수도 함께 보여줘요",
    maxLength: 50,
    showCount: true,
  },
  parameters: {
    ...storySource(
      "components-textarea--count",
      `<div className="grid max-w-xl gap-6">
  <TextArea showCount defaultValue="현재 글자 수만 보여줘요" />
  <TextArea showCount maxLength={50} defaultValue="최대 글자 수도 함께 보여줘요" />
</div>`,
    ),
    controls: {
      disable: false,
      include: ["글자 수", "최대 글자 수"],
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-6">
        <TextArea showCount defaultValue="현재 글자 수만 보여줘요" />
        <TextArea showCount maxLength={50} defaultValue="최대 글자 수도 함께 보여줘요" />
      </div>
    ) : (
      <TextArea {...args} className="max-w-xl" />
    ),
};

export const StaticError: Story = {
  args: {
    defaultValue: "짧은 소개",
    errorMessage: "소개를 확인해 주세요.",
    label: "소개",
    required: true,
  },
  parameters: {
    ...storyDescription("components-textarea--static-error"),
    controls: {
      disable: false,
      include: ["오류 문구"],
    },
    docs: {
      ...storyDescription("components-textarea--static-error").docs,
      source: {
        code: withStoryImports(`<TextArea
  className="max-w-xl"
  label="소개"
  required
  defaultValue="짧은 소개"
  errorMessage="소개를 확인해 주세요."
/>`),
      },
    },
  },
  render: (args) => <TextArea {...args} className="max-w-xl" />,
};

export const ClientError: Story = {
  args: { label: "요청 내용", required: true },
  parameters: {
    ...storySource(
      "components-textarea--client-error",
      `const validateRequest = (value) => {
  if (!value.trim()) return '요청 내용을 입력해 주세요.';
  if (value.trim().length < 10) return '요청 내용은 10자 이상 입력해 주세요.';
  return '';
};

function RequestTextArea() {
  const [content, setContent] = useState('');

  return (
    <TextArea
      className="max-w-xl"
      label="요청 내용"
      required
      value={content}
      validate={validateRequest}
      onChange={setContent}
    />
  );
}`,
    ),
  },
  render: function ClientErrorStory(args) {
    const [content, setContent] = useState("");
    return (
      <TextArea
        {...args}
        className="max-w-xl"
        value={content}
        validate={validateRequest}
        onChange={setContent}
      />
    );
  },
};

export const ServerError: Story = {
  args: { label: "요청 내용" },
  parameters: {
    ...storySource(
      "components-textarea--server-error",
      `const checkRequestAvailability = async (value) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return value.trim() === '이미 등록된 요청' ? '이미 등록된 요청이에요.' : '';
};

function ServerErrorTextArea() {
  const [content, setContent] = useState('이미 등록된 요청');

  return (
    <TextArea
      className="max-w-xl"
      label="요청 내용"
      value={content}
      validate={checkRequestAvailability}
      onChange={setContent}
    />
  );
}`,
    ),
  },
  render: function ServerErrorStory(args) {
    const [content, setContent] = useState("이미 등록된 요청");
    return (
      <TextArea
        {...args}
        className="max-w-xl"
        value={content}
        validate={checkRequestAvailability}
        onChange={setContent}
      />
    );
  },
};

const validateRequest = (value: string) => {
  if (!value.trim()) return "요청 내용을 입력해 주세요.";
  if (value.trim().length < 10) return "요청 내용은 10자 이상 입력해 주세요.";
  return "";
};

const checkRequestAvailability = async (value: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return value.trim() === "이미 등록된 요청" ? "이미 등록된 요청이에요." : "";
};
