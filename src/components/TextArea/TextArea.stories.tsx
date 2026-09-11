import { useEffect, useState } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import type { AllowedCharacterType } from "../Input";
import { TextArea } from "./TextArea";
import type { TextAreaSizeType, TextAreaVariantType } from "./TextArea.types";

const sizes: TextAreaSizeType[] = ["lg", "md", "sm"];
const variants: TextAreaVariantType[] = ["default", "filled"];
const allowedCharacterTypes: AllowedCharacterType[] = ["korean", "english", "number"];

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
  argTypes: {
    value: { name: "입력값", control: "text" },
    defaultValue: { name: "초기값", control: "text" },
    size: { name: "크기", control: "select", options: sizes },
    variant: {
      name: "표현 방식",
      control: "select",
      options: variants,
    },
    placeholder: { name: "placeholder", control: "text" },
    label: { name: "레이블", control: "text" },
    errorMessage: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    autoSize: { name: "자동 높이", control: "boolean" },
    allowOnly: {
      name: "입력 문자",
      control: "select",
      options: allowedCharacterTypes,
    },
    resize: { name: "크기 조절", control: "boolean" },
    showCount: { name: "글자 수", control: "boolean" },
    maxLength: { name: "최대 글자 수", control: { type: "number", min: 1 } },
    width: { name: "가로 길이", control: { type: "number", min: 1 } },
    disabled: { name: "비활성", control: "boolean" },
    readOnly: { name: "읽기 전용", control: "boolean" },
    className: { control: false, table: { disable: true } },
    onBlur: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
    onEnter: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "TextArea는 설명이나 의견처럼 여러 줄의 텍스트를 입력할 때 사용해요.  \n높이·글자 수와 오류 상태를 함께 표시할 수 있어요.",
      },
      page: () => (
        <div className="textarea-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### TextArea

TextArea는 여러 줄의 긴 텍스트를 입력하게 해요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 입력값을 외부에서 관리해요. | \`string\` | - |
| \`defaultValue\` | 처음 표시할 입력값을 설정해요. | \`string\` | - |
| \`placeholder\` | 값이 없을 때 안내 문구를 표시해요. | \`string\` | - |
| \`width\` | TextArea의 가로 길이를 정해요. | \`number\` | \`100%\` |
| \`size\` | TextArea의 크기를 설정해요. | [\`TextAreaSizeType\`](#textarea-size-type) | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | [\`TextAreaVariantType\`](#textarea-variant-type) | \`default\` |
| \`autoSize\` | 입력 내용에 맞춰 높이를 조절해요. | \`boolean \\|\` [\`TextAreaAutoSize\`](#textarea-auto-size) | \`false\` |
| \`allowOnly\` | 입력할 수 있는 문자 종류를 제한해요. | [\`AllowedCharacterType\`](#textarea-allowed-character-type) | - |
| \`resize\` | 우측 하단 크기 조절 핸들을 표시해요. | \`boolean\` | \`true\` |
| \`showCount\` | 현재 글자 수를 표시해요. | \`boolean\` | \`false\` |
| \`maxLength\` | 입력할 수 있는 최대 글자 수를 설정해요. | \`number\` | - |
| \`disabled\` | 입력을 비활성화해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 입력값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`label\` | TextArea 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorMessage\` | 오류 문구를 표시해요. | \`ReactNode \\| ((value: string) => string \\| Promise<string>)\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 입력값이 바뀔 때 실행할 함수예요. | \`(value: string) => void\` | - |
| \`onEnter\` | Enter를 누를 때 실행할 함수예요. | \`() => void\` | - |
          `}</Markdown>
          <h3 id="textarea-auto-size">TextAreaAutoSize</h3>
          <p>TextAreaAutoSize는 입력 내용에 따라 늘어날 최소·최대 행 수를 정의해요.</p>
          <Markdown>{`
| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`minRows\` | 자동 높이의 최소 행 수를 설정해요. | \`number\` | \`1\` |
| \`maxRows\` | 자동 높이의 최대 행 수를 설정해요. | \`number\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="textarea-size-type">TextAreaSizeType</h3>
          <p>TextAreaSizeType은 TextArea의 높이와 글자 크기를 구분해요.</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <TextAreaTypeCode key={size} value={size} />
            ))}
          </div>
          <h3 id="textarea-variant-type">TextAreaVariantType</h3>
          <p>TextAreaVariantType은 TextArea의 배경과 테두리 표현 방식을 구분해요.</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <TextAreaTypeCode key={variant} value={variant} />
            ))}
          </div>
          <h3 id="textarea-allowed-character-type">AllowedCharacterType</h3>
          <p>AllowedCharacterType은 TextArea에 입력할 수 있는 문자 종류를 제한해요.</p>
          <div className="flex flex-wrap gap-2">
            {allowedCharacterTypes.map((type) => (
              <TextAreaTypeCode key={type} value={type} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

function TextAreaTypeCode({
  value,
}: {
  value: AllowedCharacterType | TextAreaSizeType | TextAreaVariantType;
}) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {value}
    </code>
  );
}

export const Sizes: Story = {
  args: {
    variant: "default",
    placeholder: "입력하세요",
    label: "",
    errorMessage: "",
    required: false,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-textarea--sizes"),
    controls: {
      disable: false,
      include: [
        "표현 방식",
        "placeholder",
        "레이블",
        "오류 문구",
        "필수 표시",
        "읽기 전용",
        "비활성",
      ],
    },
    docs: {
      ...storyDescription("components-textarea--sizes").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <TextArea size="lg" placeholder="입력하세요" />
  <TextArea size="md" placeholder="입력하세요" />
  <TextArea size="sm" placeholder="입력하세요" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      <TextArea {...args} size="lg" />
      <TextArea {...args} size="md" />
      <TextArea {...args} size="sm" />
    </div>
  ),
};

export const Widths: Story = {
  args: {
    size: "md",
    variant: "default",
    label: "",
    errorMessage: "",
    required: false,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-textarea--widths"),
    controls: {
      disable: false,
      include: ["크기", "표현 방식", "레이블", "오류 문구", "필수 표시", "읽기 전용", "비활성"],
    },
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
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      <TextArea {...args} placeholder="부모 너비 100%" />
      <TextArea {...args} width={240} placeholder="가로 길이 240px" />
      <TextArea {...args} width={320} placeholder="가로 길이 320px" />
    </div>
  ),
};

export const Variants: Story = {
  args: {
    size: "md",
    width: undefined,
    label: "",
    errorMessage: "",
    required: false,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-textarea--variants"),
    controls: {
      disable: false,
      include: ["크기", "가로 길이", "레이블", "오류 문구", "필수 표시", "읽기 전용", "비활성"],
    },
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
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      <TextArea {...args} placeholder="기본" variant="default" />
      <TextArea {...args} placeholder="채움" variant="filled" />
    </div>
  ),
};

export const States: Story = {
  args: {
    size: "md",
    variant: "default",
    width: undefined,
    label: "",
    errorMessage: "",
    required: false,
  },
  parameters: {
    ...storyDescription("components-textarea--states"),
    controls: {
      disable: false,
      include: ["크기", "표현 방식", "가로 길이", "레이블", "오류 문구", "필수 표시"],
    },
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
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      <TextArea {...args} placeholder="기본" />
      <TextArea {...args} readOnly defaultValue="읽기만 할 수 있어요" />
      <TextArea {...args} disabled defaultValue="수정할 수 없어요" />
    </div>
  ),
};

export const AllowedCharacters: Story = {
  args: {
    size: "md",
    variant: "default",
    width: undefined,
    label: "",
    errorMessage: "",
    required: false,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-textarea--allowed-characters"),
    controls: {
      disable: false,
      include: [
        "크기",
        "표현 방식",
        "가로 길이",
        "레이블",
        "오류 문구",
        "필수 표시",
        "읽기 전용",
        "비활성",
      ],
    },
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
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      <TextArea {...args} allowOnly="korean" placeholder="한글만 입력하세요" />
      <TextArea {...args} allowOnly="english" placeholder="영어만 입력하세요" />
      <TextArea {...args} allowOnly="number" placeholder="숫자만 입력하세요" />
    </div>
  ),
};

export const AutoSize: Story = {
  args: {
    variant: "default",
    width: undefined,
    label: "",
    errorMessage: "",
    required: false,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-textarea--auto-size"),
    controls: {
      disable: false,
      include: [
        "표현 방식",
        "가로 길이",
        "레이블",
        "오류 문구",
        "필수 표시",
        "읽기 전용",
        "비활성",
      ],
    },
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
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      <TextArea {...args} autoSize placeholder="내용에 따라 제한 없이 높이가 늘어나요" />
      <TextArea {...args} size="lg" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Large" />
      <TextArea {...args} size="md" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Medium" />
      <TextArea {...args} size="sm" autoSize={{ minRows: 1, maxRows: 6 }} placeholder="Small" />
    </div>
  ),
};

export const Resize: Story = {
  args: {
    size: "md",
    variant: "default",
    width: undefined,
    label: "",
    errorMessage: "",
    required: false,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-textarea--resize"),
    controls: {
      disable: false,
      include: [
        "크기",
        "표현 방식",
        "가로 길이",
        "레이블",
        "오류 문구",
        "필수 표시",
        "읽기 전용",
        "비활성",
      ],
    },
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
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      <TextArea {...args} placeholder="크기 조절 가능" />
      <TextArea {...args} resize={false} placeholder="크기 조절 불가" />
    </div>
  ),
};

export const Count: Story = {
  args: {
    size: "md",
    variant: "default",
    width: undefined,
    label: "",
    errorMessage: "",
    required: false,
    showCount: true,
    maxLength: 50,
    readOnly: false,
    disabled: false,
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
      include: [
        "크기",
        "표현 방식",
        "가로 길이",
        "레이블",
        "오류 문구",
        "필수 표시",
        "글자 수",
        "최대 글자 수",
        "읽기 전용",
        "비활성",
      ],
    },
  },
  render: ({ maxLength, ...args }) => (
    <div className="grid max-w-xl gap-6">
      <TextArea {...args} defaultValue="현재 글자 수만 보여줘요" />
      <TextArea {...args} maxLength={maxLength} defaultValue="최대 글자 수도 함께 보여줘요" />
    </div>
  ),
};

export const StaticError: Story = {
  args: {
    size: "md",
    variant: "default",
    width: undefined,
    defaultValue: "짧은 소개",
    errorMessage: "소개를 확인해 주세요.",
    label: "소개",
    placeholder: "",
    required: true,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storyDescription("components-textarea--static-error"),
    controls: {
      disable: false,
      include: [
        "크기",
        "표현 방식",
        "가로 길이",
        "placeholder",
        "레이블",
        "오류 문구",
        "필수 표시",
        "읽기 전용",
        "비활성",
      ],
    },
    docs: {
      ...storyDescription("components-textarea--static-error").docs,
      source: {
        code: withStoryImports(`<TextArea
  label="소개"
  required
  defaultValue="짧은 소개"
  errorMessage="소개를 확인해 주세요."
/>`),
      },
    },
  },
  render: (args) => <TextArea {...args} />,
};

export const ClientError: Story = {
  args: {
    size: "md",
    variant: "default",
    width: undefined,
    placeholder: "",
    label: "요청 내용",
    required: true,
    value: "",
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-textarea--client-error",
      `const validateRequest = (value: string) => {
  if (!value.trim()) return '요청 내용을 입력해 주세요.';
  if (value.trim().length < 10) return '요청 내용은 10자 이상 입력해 주세요.';
  return '';
};

function RequestTextArea() {
  const [content, setContent] = useState('');

  return (
    <TextArea
      label="요청 내용"
      required
      value={content}
      errorMessage={validateRequest}
      onChange={setContent}
    />
  );
}`,
    ),
    controls: {
      disable: false,
      include: [
        "크기",
        "표현 방식",
        "가로 길이",
        "placeholder",
        "입력값",
        "레이블",
        "필수 표시",
        "읽기 전용",
        "비활성",
      ],
    },
  },
  render: function ClientErrorStory(args) {
    const { value: controlledValue = "", onChange, ...textAreaProps } = args;
    const [content, setContent] = useState(controlledValue);

    useEffect(() => setContent(controlledValue), [controlledValue]);

    return (
      <TextArea
        {...textAreaProps}
        value={content}
        errorMessage={validateRequest}
        onChange={(nextValue) => {
          setContent(nextValue);
          onChange?.(nextValue);
        }}
      />
    );
  },
};

export const ServerError: Story = {
  args: {
    label: "요청 내용",
    value: "이미 등록된 요청",
    placeholder: "",
    size: "md",
    variant: "default",
    width: undefined,
    required: false,
    readOnly: false,
    disabled: false,
  },
  parameters: {
    ...storySource(
      "components-textarea--server-error",
      `const checkRequestAvailability = async (value: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return value.trim() === '이미 등록된 요청' ? '이미 등록된 요청이에요.' : '';
};

function ServerErrorTextArea() {
  const [content, setContent] = useState('이미 등록된 요청');

  return (
    <TextArea
      label="요청 내용"
      value={content}
      errorMessage={checkRequestAvailability}
      onChange={setContent}
    />
  );
}`,
    ),
    controls: {
      disable: false,
      include: [
        "크기",
        "표현 방식",
        "가로 길이",
        "placeholder",
        "입력값",
        "레이블",
        "필수 표시",
        "읽기 전용",
        "비활성",
      ],
    },
  },
  render: function ServerErrorStory(args) {
    const { value: controlledValue = "", onChange, ...textAreaProps } = args;
    const [content, setContent] = useState(controlledValue);

    useEffect(() => setContent(controlledValue), [controlledValue]);

    return (
      <TextArea
        {...textAreaProps}
        value={content}
        errorMessage={checkRequestAvailability}
        onChange={(nextValue) => {
          setContent(nextValue);
          onChange?.(nextValue);
        }}
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
