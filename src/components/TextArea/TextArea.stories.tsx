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
    size: { name: "크기", control: "select", options: ["lg", "md", "sm"] },
    variant: { name: "표현 방식", control: "select", options: ["default", "filled"] },
    placeholder: { name: "안내 문구", control: "text" },
    label: { name: "레이블", control: "text" },
    errorText: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    autoSize: { name: "자동 높이", control: "boolean" },
    allowClear: { name: "지우기", control: "boolean" },
    showCount: { name: "글자 수", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    className: { control: false },
    onChange: { control: false },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "여러 줄의 내용을 입력할 수 있어요.  \n자동 높이·글자 수·지우기와 오류 상태를 설정할 수 있어요.",
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
| \`size\` | TextArea의 크기를 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | \`default \\| filled\` | \`default\` |
| \`autoSize\` | 입력 내용에 맞춰 높이를 조절해요. | \`boolean \\| { minRows, maxRows }\` | \`false\` |
| \`allowClear\` | 입력값을 지우는 버튼을 표시해요. | \`boolean\` | \`false\` |
| \`showCount\` | 현재 글자 수를 표시해요. | \`boolean\` | \`false\` |
| \`count\` | 글자 계산, 표시와 초과 처리 방식을 설정해요. | \`TextAreaCountConfig\` | - |
| \`maxLength\` | 입력할 수 있는 최대 글자 수를 설정해요. | \`number\` | - |
| \`disabled\` | 입력을 비활성화해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 입력값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`required\` | 필수 입력 표시와 네이티브 속성을 적용해요. | \`boolean\` | \`false\` |
| \`label\` | TextArea 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorText\` | TextArea 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 입력값이 바뀔 때 실행할 함수예요. | \`(value: string) => void\` | - |
| \`onBlur\` | 포커스가 빠질 때 실행할 함수예요. | \`() => void\` | - |
| \`onError\` | 입력할 때 오류 문구를 초기화할 함수예요. | \`(error: string) => void\` | - |
| \`onEnter\` | Shift 없이 Enter를 누를 때 실행할 함수예요. | \`() => void\` | - |

### TextAreaAutoSize

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`minRows\` | 자동 높이의 최소 행 수를 설정해요. | \`number\` | - |
| \`maxRows\` | 자동 높이의 최대 행 수를 설정해요. | \`number\` | - |

### TextAreaCountConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`max\` | 글자 수 기준의 최댓값을 설정해요. | \`number\` | - |
| \`strategy\` | 글자 수를 계산하는 방법을 설정해요. | \`(value: string) => number\` | 문자열 길이 |
| \`show\` | 글자 수 표시 여부나 표시 내용을 설정해요. | \`boolean &#124; (info) => ReactNode\` | \`true\` |
| \`exceedFormatter\` | 최댓값을 넘은 입력값의 처리 방법을 설정해요. | \`(value, config) => string\` | - |
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
    docs: {
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea size="lg" placeholder="Large" />
  <TextArea placeholder="Medium" />
  <TextArea size="sm" placeholder="Small" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-xl gap-4">
      <TextArea size="lg" placeholder="Large" />
      <TextArea placeholder="Medium" />
      <TextArea size="sm" placeholder="Small" />
    </div>
  ),
};

export const States: Story = {
  parameters: {
    ...storyDescription("components-textarea--states"),
    docs: {
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea placeholder="기본" />
  <TextArea variant="filled" defaultValue="채움" />
  <TextArea readOnly defaultValue="읽기만 할 수 있어요" />
  <TextArea disabled defaultValue="수정할 수 없어요" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-xl gap-4">
      <TextArea placeholder="기본" />
      <TextArea variant="filled" defaultValue="채움" />
      <TextArea readOnly defaultValue="읽기만 할 수 있어요" />
      <TextArea disabled defaultValue="수정할 수 없어요" />
    </div>
  ),
};

export const LabelAndError: Story = {
  parameters: {
    ...storyDescription("components-textarea--label-and-error"),
    docs: {
      source: {
        code: withStoryImports(`<TextArea
  className="max-w-xl"
  label="소개"
  required
  errorText="소개를 입력해 주세요."
/>`),
      },
    },
  },
  render: () => (
    <TextArea className="max-w-xl" label="소개" required errorText="소개를 입력해 주세요." />
  ),
};

export const Basic: Story = {
  parameters: {
    ...storySource(
      "components-textarea--basic",
      '<TextArea className="max-w-xl" placeholder="내용을 입력하세요" />',
    ),
    controls: { disable: false },
  },
  render: (args) => <TextArea {...args} className="max-w-xl" />,
};

export const AutoSize: Story = {
  parameters: {
    ...storyDescription("components-textarea--auto-size"),
    docs: {
      source: {
        code: withStoryImports(
          `<TextArea
  className="max-w-xl"
  autoSize={{ minRows: 2, maxRows: 6 }}
  placeholder="내용에 맞춰 높이가 바뀌어요"
/>`,
        ),
      },
    },
  },
  render: () => (
    <TextArea
      className="max-w-xl"
      autoSize={{ minRows: 2, maxRows: 6 }}
      placeholder="내용에 맞춰 높이가 바뀌어요"
    />
  ),
};

export const Clear: Story = {
  parameters: storySource(
    "components-textarea--clear",
    `function ClearTextArea() {
  const [content, setContent] = useState('지우기 버튼을 눌러 보세요.');

  return <TextArea className="max-w-xl" value={content} allowClear onChange={setContent} />;
}`,
  ),
  render: function ClearTextAreaStory() {
    const [content, setContent] = useState("지우기 버튼을 눌러 보세요.");
    return <TextArea className="max-w-xl" value={content} allowClear onChange={setContent} />;
  },
};

export const Count: Story = {
  parameters: storySource(
    "components-textarea--count",
    `<div className="grid max-w-xl gap-4">
  <TextArea showCount defaultValue="현재 글자 수만 보여줘요" />
  <TextArea showCount maxLength={50} defaultValue="최대 글자 수도 함께 보여줘요" />
</div>`,
  ),
  render: () => (
    <div className="grid max-w-xl gap-4">
      <TextArea showCount defaultValue="현재 글자 수만 보여줘요" />
      <TextArea showCount maxLength={50} defaultValue="최대 글자 수도 함께 보여줘요" />
    </div>
  ),
};

export const CustomCount: Story = {
  parameters: {
    ...storyDescription("components-textarea--custom-count"),
    docs: {
      source: {
        code: withStoryImports(`<TextArea
  className="max-w-xl"
  defaultValue="공백 제외 글자 수"
  count={{
    max: 20,
    strategy: (value) => value.split(' ').join('').length,
    show: ({ count, maxLength }) => '공백 제외 ' + count + ' / ' + maxLength,
    exceedFormatter: (value, { max }) => value.slice(0, max),
  }}
/>`),
      },
    },
  },
  render: () => (
    <TextArea
      className="max-w-xl"
      defaultValue="공백 제외 글자 수"
      count={{
        max: 20,
        strategy: (text) => text.split(" ").join("").length,
        show: ({ count, maxLength }) => `공백 제외 ${count} / ${maxLength}`,
        exceedFormatter: (text, { max }) => text.slice(0, max),
      }}
    />
  ),
};

export const Controlled: Story = {
  parameters: storySource(
    "components-textarea--controlled",
    `function ControlledTextArea() {
  const [content, setContent] = useState('');

  return (
    <TextArea
      className="max-w-xl"
      value={content}
      placeholder="외부 상태로 입력값을 관리해요"
      onChange={setContent}
    />
  );
}`,
  ),
  render: function ControlledTextAreaStory() {
    const [content, setContent] = useState("");
    return (
      <TextArea
        className="max-w-xl"
        value={content}
        placeholder="외부 상태로 입력값을 관리해요"
        onChange={setContent}
      />
    );
  },
};

export const BlurValidation: Story = {
  parameters: storySource(
    "components-textarea--blur-validation",
    `function RequestTextArea() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('내용을 10자 이상 입력해 주세요.');
  const validate = () => {
    setError(content.length >= 10 ? '' : '내용을 10자 이상 입력해 주세요.');
  };

  return (
    <TextArea
      className="max-w-xl"
      label="요청 내용"
      value={content}
      errorText={error}
      onChange={setContent}
      onError={setError}
      onBlur={validate}
    />
  );
}`,
  ),
  render: function BlurValidationStory() {
    const [content, setContent] = useState("");
    const [error, setError] = useState("내용을 10자 이상 입력해 주세요.");
    const validate = () => setError(content.length >= 10 ? "" : "내용을 10자 이상 입력해 주세요.");
    return (
      <TextArea
        className="max-w-xl"
        label="요청 내용"
        value={content}
        errorText={error}
        onChange={setContent}
        onError={setError}
        onBlur={validate}
      />
    );
  },
};
