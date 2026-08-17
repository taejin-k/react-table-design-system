import { useEffect, useState } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Input } from "./Input";
import type { InputProps } from "./Input.types";

const sizes = ["lg", "md", "sm"] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const createLimitedValue = (value: string, maxLength?: number) => {
  const nextValue = `${value}1`;
  return maxLength === undefined ? nextValue : nextValue.slice(0, maxLength);
};
const validateEmail = (value: string) => {
  if (!value.trim()) return "이메일을 입력해 주세요.";
  if (value.length > 50) return "이메일은 50자 이하로 입력해 주세요.";
  if (!EMAIL_PATTERN.test(value)) return "이메일 형식을 확인해 주세요.";
  return "";
};
const checkEmailAvailability = async (value: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return value === "member@example.com" ? "이미 가입된 이메일이에요." : "";
};
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "입력하세요",
  },
  argTypes: {
    size: { name: "크기", control: "select", options: sizes },
    variant: {
      name: "표현 방식",
      control: "select",
      options: ["default", "filled", "borderless", "underlined"],
    },
    value: { name: "입력값", control: "text" },
    label: { name: "레이블", control: "text" },
    errorMessage: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    password: { name: "비밀번호", control: "boolean" },
    allowOnly: {
      name: "입력 문자",
      control: "select",
      options: ["korean", "english", "number"],
    },
    allowClear: { name: "지우기", control: "boolean" },
    showCount: { name: "글자 수", control: "boolean" },
    readOnly: { name: "읽기 전용", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    maxLength: { name: "최대 글자 수", control: "number" },
    width: { name: "가로 길이", control: { type: "number", min: 1 } },
    prefixIcon: { control: false, table: { disable: true } },
    suffixIcon: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    validate: { control: false, table: { disable: true } },
    onBlur: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
    onEnter: { control: false, table: { disable: true } },
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
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | \`default \\| filled \\| borderless \\| underlined\` | \`default\` |
| \`value\` | 외부에서 관리하는 입력값이에요. | \`string\` | - |
| \`defaultValue\` | 처음 표시할 입력값이에요. | \`string\` | - |
| \`placeholder\` | 값이 없을 때 안내 문구를 표시해요. | \`string\` | - |
| \`width\` | Input의 가로 길이를 px 단위로 설정해요. | \`number\` | \`100%\` |
| \`maxLength\` | 입력할 수 있는 최대 글자 수를 설정해요. | \`number\` | - |
| \`label\` | Input 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorMessage\` | Input 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`password\` | 입력값을 가리고 눈 아이콘으로 표시 상태를 전환해요. | \`boolean\` | \`false\` |
| \`allowOnly\` | 입력할 수 있는 문자 종류를 제한해요. | \`korean \\| english \\| number\` | - |
| \`allowClear\` | 입력값을 지우는 버튼을 표시해요. | \`boolean\` | \`false\` |
| \`showCount\` | 현재 글자 수를 표시해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 입력값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`prefixIcon\` | 입력 영역 앞에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`suffixIcon\` | 입력 영역 뒤에 아이콘을 표시해요. | \`ReactNode\` | - |
| \`validate\` | 포커스가 빠지면 입력값을 동기·비동기로 검사해요. | \`(value: string) => string \\| Promise<string>\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 입력값이 바뀌면 변경값을 전달해요. | \`(value: string) => void\` | - |
| \`onEnter\` | Enter를 누를 때 실행할 함수예요. | \`() => void\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-input--sizes"),
    controls: { disable: false, include: ["placeholder", "크기", "가로 길이"] },
    docs: {
      ...storyDescription("components-input--sizes").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <Input placeholder="입력하세요" size="lg" />
  <Input placeholder="입력하세요" size="md" />
  <Input placeholder="입력하세요" size="sm" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <Input placeholder="입력하세요" size="lg" />
        <Input placeholder="입력하세요" size="md" />
        <Input placeholder="입력하세요" size="sm" />
      </div>
    ) : (
      <Input {...args} />
    ),
};

export const Widths: Story = {
  args: {
    placeholder: "가로 길이 320px",
    width: 320,
  },
  parameters: {
    ...storyDescription("components-input--widths"),
    controls: { disable: false, include: ["placeholder", "가로 길이"] },
    docs: {
      ...storyDescription("components-input--widths").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <Input placeholder="부모 너비 100%" />
  <Input width={240} placeholder="가로 길이 240px" />
  <Input width={320} placeholder="가로 길이 320px" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <Input placeholder="부모 너비 100%" />
        <Input width={240} placeholder="가로 길이 240px" />
        <Input width={320} placeholder="가로 길이 320px" />
      </div>
    ) : (
      <Input {...args} />
    ),
};

export const Variants: Story = {
  parameters: {
    ...storyDescription("components-input--variants"),
    controls: { disable: false, include: ["placeholder", "표현 방식"] },
    docs: {
      ...storyDescription("components-input--variants").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <Input placeholder="기본" />
  <Input placeholder="채움" variant="filled" />
  <Input placeholder="테두리 없음" variant="borderless" />
  <Input placeholder="밑줄" variant="underlined" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <Input placeholder="기본" />
        <Input placeholder="채움" variant="filled" />
        <Input placeholder="테두리 없음" variant="borderless" />
        <Input placeholder="밑줄" variant="underlined" />
      </div>
    ) : (
      <Input {...args} />
    ),
};

export const States: Story = {
  parameters: {
    ...storyDescription("components-input--states"),
    controls: { disable: false, include: ["placeholder", "읽기 전용", "비활성"] },
    docs: {
      ...storyDescription("components-input--states").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <Input placeholder="기본" />
  <Input defaultValue="읽기 전용 입력값" readOnly />
  <Input defaultValue="입력값" disabled />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <Input placeholder="기본" />
        <Input defaultValue="읽기 전용 입력값" readOnly />
        <Input defaultValue="입력값" disabled />
      </div>
    ) : (
      <Input {...args} />
    ),
};

export const AllowedCharacters: Story = {
  args: {
    allowOnly: "korean",
    placeholder: "한글만 입력하세요",
  },
  parameters: {
    ...storyDescription("components-input--allowed-characters"),
    controls: { disable: false, include: ["placeholder", "입력 문자"] },
    docs: {
      ...storyDescription("components-input--allowed-characters").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-4">
  <Input allowOnly="korean" placeholder="한글만 입력하세요" />
  <Input allowOnly="english" placeholder="영어만 입력하세요" />
  <Input allowOnly="number" placeholder="숫자만 입력하세요" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-4">
        <Input allowOnly="korean" placeholder="한글만 입력하세요" />
        <Input allowOnly="english" placeholder="영어만 입력하세요" />
        <Input allowOnly="number" placeholder="숫자만 입력하세요" />
      </div>
    ) : (
      <Input {...args} />
    ),
};

export const Password: Story = {
  args: {
    label: "비밀번호",
    password: true,
    placeholder: undefined,
  },
  parameters: {
    controls: {
      disable: false,
      include: ["placeholder", "레이블", "비밀번호", "비활성"],
    },
    docs: {
      description: { story: storyDescriptions["components-input--password"] },
      source: {
        code: withStoryImports(`<Input
  label="비밀번호"
  password
  defaultValue="password"
/>`),
      },
    },
  },
  render: (args) => <Input {...args} defaultValue="password" />,
};

export const IconsAndCount: Story = {
  args: {
    allowClear: true,
    showCount: true,
    maxLength: 5,
    size: "md",
    prefixIcon: <Icon icon="setting" />,
    suffixIcon: <Icon icon="edit" />,
    value: "검색어",
    placeholder: undefined,
  },
  parameters: {
    controls: {
      disable: false,
      include: ["placeholder", "입력값", "크기", "지우기", "글자 수", "최대 글자 수"],
    },
    docs: {
      description: { story: storyDescriptions["components-input--icons-and-count"] },
      source: {
        code: withStoryImports(`function SearchInputs() {
  const [keyword, setKeyword] = useState('검색어');
  const [limitedKeyword, setLimitedKeyword] = useState('검색어1');

  return (
    <div className="grid max-w-xl gap-4">
      <Input
        allowClear
        showCount
        prefixIcon={<Icon icon="setting" />}
        suffixIcon={<Icon icon="edit" />}
        value={keyword}
        onChange={setKeyword}
      />
      <Input
        allowClear
        showCount
        maxLength={5}
        prefixIcon={<Icon icon="setting" />}
        suffixIcon={<Icon icon="edit" />}
        value={limitedKeyword}
        onChange={setLimitedKeyword}
      />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <CountExamples {...args} />,
};

function CountExamples({
  value: controlledValue = "",
  maxLength,
  onChange,
  ...inputProps
}: InputProps) {
  const [keyword, setKeyword] = useState(controlledValue);
  const [limitedKeyword, setLimitedKeyword] = useState(() =>
    createLimitedValue(controlledValue, maxLength),
  );

  useEffect(() => setKeyword(controlledValue), [controlledValue]);
  useEffect(
    () => setLimitedKeyword(createLimitedValue(controlledValue, maxLength)),
    [controlledValue, maxLength],
  );

  return (
    <div className="grid max-w-xl gap-4">
      <Input
        {...inputProps}
        value={keyword}
        onChange={(nextValue) => {
          setKeyword(nextValue);
          onChange?.(nextValue);
        }}
      />
      <Input
        {...inputProps}
        maxLength={maxLength}
        value={limitedKeyword}
        onChange={(nextValue) => {
          setLimitedKeyword(nextValue);
          onChange?.(nextValue);
        }}
      />
    </div>
  );
}

export const StaticError: Story = {
  args: {
    errorMessage: "이메일을 확인해 주세요.",
    label: "이메일",
    placeholder: undefined,
    required: true,
  },
  parameters: {
    controls: {
      disable: false,
      include: ["placeholder", "레이블", "오류 문구", "필수 표시"],
    },
    docs: {
      description: { story: storyDescriptions["components-input--static-error"] },
      source: {
        code: withStoryImports(`<Input
  label="이메일"
  required
  defaultValue="email"
  errorMessage="이메일을 확인해 주세요."
/>`),
      },
    },
  },
  render: (args) => <Input {...args} defaultValue="email" />,
};

export const ClientError: Story = {
  args: {
    label: "이메일",
    required: true,
    value: "email",
  },
  parameters: {
    controls: {
      disable: false,
      include: ["placeholder", "입력값", "레이블", "필수 표시"],
    },
    docs: {
      description: { story: storyDescriptions["components-input--client-error"] },
      source: {
        code: withStoryImports(`const validateEmail = (value) => {
  if (!value.trim()) return '이메일을 입력해 주세요.';
  if (value.length > 50) return '이메일은 50자 이하로 입력해 주세요.';
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
    return '이메일 형식을 확인해 주세요.';
  }
  return '';
};

function EmailInput() {
  const [email, setEmail] = useState('email');

  return (
    <Input
      label="이메일"
      placeholder="입력하세요"
      required
      value={email}
      validate={validateEmail}
      onChange={setEmail}
    />
  );
}`),
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
        validate={validateEmail}
        onChange={(nextValue) => {
          setValue(nextValue);
          onChange?.(nextValue);
        }}
      />
    );
  },
};

export const ServerError: Story = {
  parameters: {
    ...storyDescription("components-input--server-error"),
    docs: {
      ...storyDescription("components-input--server-error").docs,
      source: {
        code: withStoryImports(`const checkEmailAvailability = async (value) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return value === 'member@example.com' ? '이미 가입된 이메일이에요.' : '';
};

function ServerErrorInput() {
  const [email, setEmail] = useState('member@example.com');

  return (
    <Input
      label="이메일"
      value={email}
      validate={checkEmailAvailability}
      onChange={setEmail}
    />
  );
}`),
      },
    },
  },
  render: () => <ServerErrorInput />,
};

function ServerErrorInput() {
  const [email, setEmail] = useState("member@example.com");

  return (
    <Input label="이메일" value={email} validate={checkEmailAvailability} onChange={setEmail} />
  );
}
