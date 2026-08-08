import { useEffect, useState } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { Icon } from "../Icon";
import { Input } from "./Input";

const sizes = ["lg", "md", "sm"] as const;
const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "입력하세요" },
  argTypes: {
    size: { name: "크기", control: "select", options: sizes },
    variant: { name: "표현 방식", control: "select", options: ["default", "filled"] },
    value: { name: "입력값", control: "text" },
    label: { name: "레이블", control: "text" },
    errorText: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    allowClear: { name: "지우기", control: "boolean" },
    showCount: { name: "글자 수", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    maxLength: { name: "최대 글자 수", control: "number" },
    prefixIcon: { control: false, table: { disable: true } },
    suffixIcon: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onBlur: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
    onError: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "사용자가 값을 입력하거나 수정할 수 있어요.  \n레이블·오류 문구·아이콘과 글자 수 표시를 함께 사용할 수 있어요.",
      },
      page: () => (
        <div className="input-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Input

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`size\` | Input의 크기를 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | \`default \\| filled\` | \`default\` |
| \`label\` | Input 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorText\` | Input 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`allowClear\` | 입력값을 지우는 버튼을 표시해요. | \`boolean\` | \`false\` |
| \`showCount\` | 현재 글자 수를 표시해요. | \`boolean\` | \`false\` |
| \`prefixIcon\` | 입력 영역 앞에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`suffixIcon\` | 입력 영역 뒤에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onBlur\` | 포커스가 빠질 때 현재 입력값을 전달해요. | \`(value: string) => void\` | - |
| \`onError\` | 입력값이 바뀔 때 오류 문구를 비워요. | \`(error: string) => void\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  parameters: { ...storyDescription("components-input--sizes"), controls: { disable: false } },
  render: (args) => (
    <div className="grid max-w-xl gap-4">
      {sizes.map((size) => (
        <Input key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const States: Story = {
  parameters: { ...storyDescription("components-input--states"), controls: { disable: false } },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <Input placeholder="기본" />
        <Input variant="filled" defaultValue="입력값" />
        <Input defaultValue="입력값" disabled />
      </div>
    ) : (
      <Input {...args} />
    ),
};

export const LabelAndError: Story = {
  args: {
    label: "이메일",
    required: true,
    value: "email",
    errorText: "이메일을 확인해 주세요.",
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: { story: storyDescriptions["components-input--label-and-error"] },
      source: {
        code: `const EMAIL_ERROR_MESSAGE = '이메일을 확인해 주세요.';
const validateEmail = (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
const [email, setEmail] = useState('email');
const [errorText, setErrorText] = useState(EMAIL_ERROR_MESSAGE);

const handleBlur = (value) => {
  setErrorText(validateEmail(value) ? '' : EMAIL_ERROR_MESSAGE);
};

<Input
  label="이메일"
  placeholder="입력하세요"
  required
  value={email}
  errorText={errorText}
  onBlur={handleBlur}
  onChange={setEmail}
  onError={setErrorText}
/>`,
      },
    },
  },
  render: function Render(args) {
    const {
      value: controlledValue = "",
      errorText: controlledErrorText = "",
      onBlur,
      onChange,
      onError,
      ...inputProps
    } = args;
    const [value, setValue] = useState(controlledValue);
    const [errorText, setErrorText] = useState(controlledErrorText);

    useEffect(() => setValue(controlledValue), [controlledValue]);
    useEffect(() => setErrorText(controlledErrorText), [controlledErrorText]);

    return (
      <Input
        {...inputProps}
        value={value}
        errorText={errorText}
        onBlur={(currentValue) => {
          setErrorText(validateEmail(currentValue) ? "" : controlledErrorText);
          onBlur?.(currentValue);
        }}
        onChange={(nextValue) => {
          setValue(nextValue);
          onChange?.(nextValue);
        }}
        onError={(nextError) => {
          setErrorText(nextError);
          onError?.(nextError);
        }}
      />
    );
  },
};

export const IconsAndCount: Story = {
  args: {
    allowClear: true,
    maxLength: 10,
    prefixIcon: <Icon icon="setting" />,
    suffixIcon: <Icon icon="edit" />,
    value: "검색어",
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: { story: storyDescriptions["components-input--icons-and-count"] },
      source: {
        code: `const [value, setValue] = useState('검색어');

<Input
  allowClear
  maxLength={10}
  placeholder="입력하세요"
  prefixIcon={<Icon icon="setting" />}
  suffixIcon={<Icon icon="edit" />}
  value={value}
  onChange={setValue}
/>`,
      },
    },
  },
  render: function Render(args) {
    const { value: controlledValue = "", onChange, ...inputProps } = args;
    const [value, setValue] = useState(controlledValue);

    useEffect(() => setValue(controlledValue), [controlledValue]);

    return (
      <Input
        {...inputProps}
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue);
          onChange?.(nextValue);
        }}
      />
    );
  },
};
