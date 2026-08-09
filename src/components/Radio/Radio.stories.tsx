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
  args: { label: "레이블", checked: false, disabled: false, error: false },
  argTypes: {
    label: { name: "레이블", control: "text" },
    checked: { name: "선택", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    error: { name: "오류", control: "boolean" },
    className: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
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
  parameters: {
    ...storyDescription("components-radio--states"),
    controls: {
      disable: false,
      include: ["레이블", "선택", "오류", "비활성"],
    },
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
      <Radio disabled label="비활성" name="radio-state" />
      <Radio checked disabled label="비활성 · 선택" name="radio-state" />
    </div>
  );
}`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <Radio label="기본" />
        <Radio error label="오류" />
        <Radio disabled label="비활성" />
        <Radio defaultChecked disabled label="비활성 · 선택" />
      </div>
    ) : (
      <ControlledRadio {...args} />
    ),
};

export const Label: Story = {
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
  render: (args) => (
    <div className="flex items-center gap-8">
      <ControlledRadio {...args} label={undefined} />
      <ControlledRadio {...args} />
    </div>
  ),
};

export const Group: Story = {
  parameters: {
    ...storyDescription("components-radio--group"),
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
  render: () => <RadioGroupStory />,
};

function ControlledRadio(args: RadioProps) {
  const [checked, setChecked] = useState(Boolean(args.checked));
  useEffect(() => setChecked(Boolean(args.checked)), [args.checked]);
  return (
    <Radio
      {...args}
      checked={checked}
      onChange={(event) => {
        setChecked(event.target.checked);
        args.onChange?.(event);
      }}
    />
  );
}

function RadioGroupStory() {
  const [value, setValue] = useState("card");

  return (
    <div className="flex flex-wrap items-center gap-8">
      {paymentOptions.map((option) => (
        <Radio
          key={option.value}
          name="payment-method"
          label={option.label}
          checked={value === option.value}
          onChange={() => setValue(option.value)}
        />
      ))}
    </div>
  );
}
