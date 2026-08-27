import { useEffect, useState } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Radio } from "./Radio";
import type { RadioProps } from "./Radio.types";

const paymentOptions = [
  { label: "신용카드", value: "card" },
  { label: "계좌이체", value: "transfer" },
  { label: "간편결제", value: "easy-pay" },
] as const;

const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});

const meta = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  argTypes: {
    checked: { name: "선택", control: "boolean" },
    defaultChecked: { control: false, table: { disable: true } },
    disabled: { name: "비활성", control: "boolean" },
    label: { name: "레이블", control: "text" },
    error: { name: "오류", control: "boolean" },
    name: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "여러 선택지 중 하나를 선택해요.  \n레이블을 표시하고 오류·비활성 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="radio-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Radio

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`checked\` | 선택 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultChecked\` | 처음 렌더링할 때 선택된 상태로 표시해요. | \`boolean\` | \`false\` |
| \`name\` | 같은 이름을 가진 Radio를 하나의 선택 그룹으로 묶어요. | \`string\` | - |
| \`disabled\` | Radio를 비활성화하고 선택 동작을 막아요. | \`boolean\` | \`false\` |
| \`label\` | Radio 오른쪽에 레이블을 표시해요. | \`ReactNode\` | - |
| \`error\` | 테두리와 선택 색상을 오류 색상으로 표시해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 선택 상태가 바뀔 때 실행할 함수예요. | \`ChangeEventHandler<HTMLInputElement>\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  args: { label: "기본", checked: true },
  parameters: {
    ...storyDescription("components-radio--states"),
    controls: { disable: false, include: ["레이블", "선택"] },
    docs: {
      ...storyDescription("components-radio--states").docs,
      source: {
        code: withStoryImports(`function RadioStates() {
  const [selected, setSelected] = useState('basic');

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <Radio
        checked={selected === 'basic'}
        label="기본"
        name="radio-state"
        onChange={() => setSelected('basic')}
      />
      <Radio
        checked={selected === 'error'}
        error
        label="오류"
        name="radio-state"
        onChange={() => setSelected('error')}
      />
      <Radio disabled label="비활성" name="radio-disabled-state" />
      <Radio checked disabled label="비활성 · 선택" name="radio-disabled-state" />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <RadioStatesStory {...args} />,
};

export const Label: Story = {
  args: { checked: false, label: "레이블" },
  parameters: {
    ...storyDescription("components-radio--label"),
    controls: { disable: false, include: ["레이블", "선택"] },
    docs: {
      ...storyDescription("components-radio--label").docs,
      source: {
        code: withStoryImports(`function RadioLabels() {
  const [selected, setSelected] = useState('without-label');

  return (
    <div className="flex items-center gap-8">
      <Radio
        checked={selected === 'without-label'}
        name="label-example"
        onChange={() => setSelected('without-label')}
      />
      <Radio
        checked={selected === 'with-label'}
        label="레이블"
        name="label-example"
        onChange={() => setSelected('with-label')}
      />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <RadioLabelsStory checked={args.checked} label={args.label} />,
};

export const Group: Story = {
  args: { label: "선택 항목", disabled: false, error: false },
  parameters: {
    ...storyDescription("components-radio--group"),
    controls: { disable: false, include: ["레이블", "비활성", "오류"] },
    docs: {
      ...storyDescription("components-radio--group").docs,
      source: {
        code: withStoryImports(`const options = [
  { label: '신용카드', value: 'card' },
  { label: '계좌이체', value: 'transfer' },
  { label: '간편결제', value: 'easy-pay' },
];

function PaymentMethods() {
  const [paymentMethod, setPaymentMethod] = useState('card');

  return (
    <div className="flex flex-wrap items-center gap-8">
      {options.map((option) => (
        <Radio
          key={option.value}
          name="payment-method"
          label={option.label}
          checked={paymentMethod === option.value}
          onChange={() => setPaymentMethod(option.value)}
        />
      ))}
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <RadioGroupStory {...args} />,
};

function RadioStatesStory(args: RadioProps) {
  const [selected, setSelected] = useState("basic");

  useEffect(() => setSelected(args.checked ? "basic" : ""), [args.checked]);

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <Radio
        {...args}
        checked={selected === "basic"}
        name="radio-state"
        onChange={() => setSelected("basic")}
      />
      <Radio
        checked={selected === "error"}
        error
        label="오류"
        name="radio-state"
        onChange={() => setSelected("error")}
      />
      <Radio disabled label="비활성" name="radio-disabled-state" />
      <Radio checked disabled label="비활성 · 선택" name="radio-disabled-state" />
    </div>
  );
}

function RadioLabelsStory({ checked, label }: Pick<RadioProps, "checked" | "label">) {
  const [selected, setSelected] = useState(checked ? "with-label" : "without-label");

  useEffect(() => setSelected(checked ? "with-label" : "without-label"), [checked]);

  return (
    <div className="flex items-center gap-8">
      <Radio
        checked={selected === "without-label"}
        name="label-example"
        onChange={() => setSelected("without-label")}
      />
      <Radio
        checked={selected === "with-label"}
        label={label}
        name="label-example"
        onChange={() => setSelected("with-label")}
      />
    </div>
  );
}

function RadioGroupStory(args: RadioProps) {
  const [value, setValue] = useState("card");

  return (
    <div className="flex flex-wrap items-center gap-8">
      {paymentOptions.map((option) => (
        <Radio
          {...args}
          key={option.value}
          name="payment-method"
          label={`${args.label ?? "선택 항목"} · ${option.label}`}
          checked={value === option.value}
          onChange={() => setValue(option.value)}
        />
      ))}
    </div>
  );
}
