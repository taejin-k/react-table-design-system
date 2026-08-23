import { useState, type ComponentType } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports as addStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Tag } from "../Tag";
import { Select } from "./Select";
import type {
  SelectModeType,
  SelectOption,
  SelectPlacementType,
  SelectProps,
  SelectSizeType,
  SelectVariantType,
} from "./Select.types";

const modes: SelectModeType[] = ["multiple", "tags"];
const sizes: SelectSizeType[] = ["lg", "md", "sm"];
const variants: SelectVariantType[] = ["default", "filled"];
const placements: SelectPlacementType[] = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
const tagColorTypeHref = `${typeof window === "undefined" ? "" : window.location.origin}/iframe.html?id=components-tag--documentation&viewMode=docs#tag-color`;

const memberOptions: SelectOption[] = [
  { label: "김민준", value: "kim" },
  { label: "이서연", value: "lee" },
  { label: "박지호", value: "park" },
];

const StorySelect = Select as ComponentType<Partial<SelectProps>>;

const sizeMemberOptions = memberOptions.slice(0, 2);

const multipleMemberOptions: SelectOption[] = [
  { label: "김민준", value: "kim" },
  { label: "이서연", value: "lee" },
  { label: "박지호", value: "park" },
  { label: "최유진", value: "choi" },
  { label: "정도윤", value: "jung" },
  { label: "한지민", value: "han" },
  { label: "윤서준", value: "yoon" },
  { label: "오하늘", value: "oh" },
];

const searchSortOptions: SelectOption[] = [
  { label: "이서연", value: "lee" },
  { label: "박지호", value: "park" },
  { label: "김민준", value: "kim" },
];

const filterOptions: SelectOption[] = [
  { label: "김민준 · Design", value: "kim" },
  { label: "이서연 · Platform", value: "lee" },
  { label: "박지호 · Growth", value: "park" },
];

const optionLabelOptions: SelectOption[] = [
  { label: "김민준 · Design", shortLabel: "김민준", value: "kim" },
  { label: "이서연 · Platform", shortLabel: "이서연", value: "lee" },
];

const groupedOptions: SelectOption[] = [
  {
    label: "제품 조직",
    options: [
      { label: "Design", value: "design" },
      { label: "Product", value: "product" },
    ],
  },
  {
    label: "기술 조직",
    options: [
      { label: "Platform", value: "platform" },
      { label: "Mobile", value: "mobile" },
    ],
  },
];

const memberOptionsSource = `const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
  { label: '박지호', value: 'park' },
];`;

function withStoryImports(code: string) {
  const completeCode =
    /\bmemberOptions\b/.test(code) && !/const memberOptions\s*=/.test(code)
      ? `${memberOptionsSource}\n\n${code}`
      : code;
  return addStoryImports(completeCode);
}

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
  title: "Components/Select",
  component: Select as ComponentType<Partial<SelectProps>>,
  tags: ["autodocs"],
  argTypes: {
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    mode: { control: false },
    size: { name: "크기", control: "select", options: sizes },
    variant: {
      name: "표현 방식",
      control: "select",
      options: variants,
    },
    width: { name: "가로 길이", control: { type: "number", min: 1 } },
    placeholder: { name: "안내 문구", control: "text" },
    label: { name: "레이블", control: "text" },
    errorMessage: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    closable: { name: "태그 닫기", control: "boolean" },
    allowClear: { name: "지우기", control: "boolean" },
    showSearch: { name: "검색", control: "boolean" },
    readOnly: { name: "읽기 전용", control: "boolean" },
    disabled: { name: "비활성", control: "boolean" },
    className: { control: false },
    onChange: { control: false },
    onSearch: { control: false },
    onOpenChange: { control: false },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "목록에서 하나 또는 여러 값과 직접 입력한 태그를 선택할 수 있어요.  \n검색·그룹·선택 제한·커스텀 렌더와 제어 상태를 설정할 수 있어요.",
      },
      page: () => (
        <div className="select-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Select

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`options\` | 선택할 항목과 그룹을 설정해요. | [\`SelectOption[]\`](#selectoption) | - |
| \`mode\` | 셀렉트의 동작 방식을 설정해요. | [\`SelectModeType\`](#select-mode-type) | - |
| \`value\` | 선택값을 외부에서 관리해요. | \`string \\| number \\| (string \\| number)[]\` | - |
| \`defaultValue\` | 처음 선택할 값을 설정해요. | \`string \\| number \\| (string \\| number)[]\` | - |
| \`placeholder\` | 선택 전 안내할 내용을 표시해요. | \`ReactNode\` | \`선택하세요\` |
| \`size\` | Select의 크기를 설정해요. | [\`SelectSizeType\`](#select-size-type) | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | [\`SelectVariantType\`](#select-variant-type) | \`default\` |
| \`width\` | Select의 가로 길이를 px 단위로 설정해요. | \`number\` | \`100%\` |
| \`showSearch\` | 검색 기능을 설정해요. | \`boolean\` | tags만 \`true\` |
| \`searchValue\` | 검색어를 외부에서 관리해요. | \`string\` | - |
| \`filterOption\` | 검색어와 항목의 일치 조건을 설정해요. | \`(input, option) => boolean\` | 기본 label 검색 |
| \`optionsSort\` | 드롭다운 항목의 정렬 방법을 설정해요. | \`(a, b, info) => number\` | - |
| \`optionFilterProp\` | 검색에 사용할 항목 속성을 설정해요. | \`string \\| string[]\` | \`label\` |
| \`optionLabelProp\` | 선택 영역에 표시할 항목 속성을 설정해요. | \`string\` | \`label\` |
| \`allowClear\` | 선택값을 지우는 버튼을 표시해요. | \`boolean\` | \`false\` |
| \`readOnly\` | 선택값을 읽기 전용으로 표시해요. | \`boolean\` | \`false\` |
| \`disabled\` | 선택과 열기 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`loading\` | 로딩 상태를 표시하고 선택 동작을 막아요. | \`boolean\` | \`false\` |
| \`open\` | 목록 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 목록을 표시할지 설정해요. | \`boolean\` | \`false\` |
| \`placement\` | 목록이 표시될 위치를 설정해요. | [\`SelectPlacementType\`](#select-placement-type) | \`bottomLeft\` |
| \`maxSelectedCount\` | 선택할 수 있는 최대 항목 수를 설정해요. | \`number\` | - |
| \`maxVisibleTagCount\` | 화면에 표시할 최대 태그 수를 설정해요. | \`number \\| responsive\` | - |
| \`maxTagTextLength\` | 태그 레이블의 최대 글자 수를 설정해요. | \`number\` | - |
| \`closable\` | 선택 태그의 삭제 아이콘을 표시해요. | \`boolean\` | \`true\` |
| \`tagSeparators\` | 입력값을 태그로 나눌 구분자를 설정해요. | \`string[] \\| (input) => string[]\` | - |
| \`listHeight\` | 목록의 최대 세로 길이를 설정해요. | \`number\` | \`256\` |
| \`popupMatchWidth\` | 목록 너비를 선택 영역과 맞추거나 지정해요. | \`boolean \\| number\` | \`true\` |
| \`virtual\` | 많은 항목을 가상 목록으로 표시해요. | \`boolean\` | \`true\` |
| \`notFoundContent\` | 항목이 없을 때 안내할 내용을 설정해요. | \`ReactNode\` | \`검색 결과가 없어요\` |
| \`optionRender\` | 목록 항목의 내용을 직접 구성해요. | \`(option, info) => ReactNode\` | - |
| \`tagRender\` | 선택 태그의 내용을 직접 구성해요. | [\`(props: SelectTagProps) => ReactNode\`](#selecttagprops) | - |
| \`labelRender\` | 선택된 레이블을 직접 구성해요. | [\`(props: SelectBasicProps) => ReactNode\`](#selectbasicprops) | - |
| \`popupRender\` | 목록 전체에 추가 내용을 구성해요. | \`(menu) => ReactNode\` | - |
| \`label\` | Select 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorMessage\` | Select 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
| \`required\` | 레이블에 필수 표시를 추가해요. | \`boolean\` | \`false\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 선택값이 바뀔 때 실행할 함수예요. | \`(value, option) => void\` | - |
| \`onSearch\` | 검색어가 바뀔 때 실행할 함수예요. | \`(value: string) => void\` | - |
| \`onSelect\` | 항목을 선택할 때 실행할 함수예요. | \`(value, option) => void\` | - |
| \`onDeselect\` | 항목 선택을 해제할 때 실행할 함수예요. | \`(value, option) => void\` | - |
| \`onClear\` | 선택값을 모두 지울 때 실행할 함수예요. | \`() => void\` | - |
| \`onOpenChange\` | 목록 표시 상태가 바뀔 때 실행할 함수예요. | \`(open: boolean) => void\` | - |
| \`onFocus\` | 선택 영역에 포커스가 들어올 때 실행해요. | \`(event) => void\` | - |
| \`onBlur\` | 선택 영역에서 포커스가 빠질 때 실행해요. | \`(event) => void\` | - |
| \`onInputKeyDown\` | 영역에서 키를 누를 때 실행해요. | \`(event) => void\` | - |
| \`onPopupScroll\` | 목록을 스크롤할 때 실행할 함수예요. | \`(event) => void\` | - |

### SelectOption

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 목록과 선택 영역에 표시할 내용을 설정해요. | \`ReactNode\` | - |
| \`value\` | 항목을 구분하고 반환할 값을 설정해요. | \`string \\| number\` | - |
| \`color\` | 선택된 기본 Tag의 색상을 설정해요. | [\`TagColorType\`](${tagColorTypeHref}) | - |
| \`disabled\` | 해당 항목을 선택할 수 없게 해요. | \`boolean\` | \`false\` |
| \`options\` | 하위 항목을 전달해 그룹을 구성해요. | [\`SelectOption[]\`](#selectoption) | - |

### SelectBasicProps

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`value\` | 선택값을 전달해요. | \`string \\| number\` | - |
| \`label\` | 선택 레이블을 전달해요. | \`ReactNode\` | - |

### SelectTagProps

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 태그에 표시할 내용이에요. | \`ReactNode\` | - |
| \`value\` | 태그가 나타내는 값이에요. | \`string \\| number\` | - |
| \`color\` | 태그의 색상이에요. | [\`TagColorType\`](${tagColorTypeHref}) | - |
| \`closable\` | 태그를 지울 수 있는 상태인지 나타내요. | \`boolean\` | - |
| \`onClose\` | 태그를 지울 때 실행할 함수예요. | \`() => void\` | - |
          `}</Markdown>
          <h2 className="component-docs-types-heading">Types</h2>
          <h3 id="select-mode-type">SelectModeType</h3>
          <p>Select에서 여러 값을 선택하거나 직접 태그를 입력할 방식을 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {modes.map((mode) => (
              <SelectTypeCode key={mode} value={mode} />
            ))}
          </div>
          <h3 id="select-size-type">SelectSizeType</h3>
          <p>Select의 크기를 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <SelectTypeCode key={size} value={size} />
            ))}
          </div>
          <h3 id="select-variant-type">SelectVariantType</h3>
          <p>Select의 배경과 테두리 표현 방식을 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <SelectTypeCode key={variant} value={variant} />
            ))}
          </div>
          <h3 id="select-placement-type">SelectPlacementType</h3>
          <p>선택 영역을 기준으로 목록이 표시될 위치를 선택해요.</p>
          <div className="flex flex-wrap gap-2">
            {placements.map((placement) => (
              <SelectTypeCode key={placement} value={placement} />
            ))}
          </div>
        </div>
      ),
    },
  },
} satisfies Meta<Partial<SelectProps>>;

export default meta;
type Story = StoryObj<typeof meta>;

function SelectTypeCode({
  value,
}: {
  value: SelectModeType | SelectSizeType | SelectVariantType | SelectPlacementType;
}) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {value}
    </code>
  );
}

export const Sizes: Story = {
  args: { variant: "default" },
  parameters: {
    ...storyDescription("components-select--sizes"),
    controls: { disable: false, include: ["표현 방식"] },
    docs: {
      ...storyDescription("components-select--sizes").docs,
      source: {
        code: withStoryImports(`const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
];

<div className="grid max-w-sm gap-3">
  <Select options={memberOptions} size="lg" />
  <Select options={memberOptions} size="md" />
  <Select options={memberOptions} size="sm" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-sm gap-3">
      <StorySelect {...args} options={sizeMemberOptions} size="lg" />
      <StorySelect {...args} options={sizeMemberOptions} size="md" />
      <StorySelect {...args} options={sizeMemberOptions} size="sm" />
    </div>
  ),
};

export const Widths: Story = {
  args: {
    options: memberOptions,
    placeholder: "가로 길이 320px",
    size: "md",
    variant: "default",
    width: 320,
  },
  parameters: {
    ...storyDescription("components-select--widths"),
    controls: {
      disable: false,
      include: ["크기", "표현 방식", "안내 문구", "가로 길이"],
    },
    docs: {
      ...storyDescription("components-select--widths").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-xl gap-3">
  <Select options={memberOptions} placeholder="부모 너비 100%" />
  <Select options={memberOptions} width={240} placeholder="가로 길이 240px" />
  <Select options={memberOptions} width={320} placeholder="가로 길이 320px" />
</div>`),
      },
    },
  },
  render: (args, { viewMode }) =>
    viewMode === "docs" ? (
      <div className="grid max-w-xl gap-3">
        <Select options={memberOptions} placeholder="부모 너비 100%" />
        <Select options={memberOptions} width={240} placeholder="가로 길이 240px" />
        <Select options={memberOptions} width={320} placeholder="가로 길이 320px" />
      </div>
    ) : (
      <StorySelect {...args} />
    ),
};

export const Variants: Story = {
  args: { size: "md" },
  parameters: {
    ...storyDescription("components-select--variants"),
    controls: { disable: false, include: ["크기"] },
    docs: {
      ...storyDescription("components-select--variants").docs,
      source: {
        code: withStoryImports(`const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
];

<div className="grid max-w-sm gap-3">
  <Select options={memberOptions} placeholder="기본" />
  <Select options={memberOptions} variant="filled" placeholder="채움" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-sm gap-3">
      <StorySelect {...args} options={sizeMemberOptions} placeholder="기본" />
      <StorySelect {...args} options={sizeMemberOptions} variant="filled" placeholder="채움" />
    </div>
  ),
};

export const States: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storyDescription("components-select--states"),
    controls: { disable: false, include: ["크기", "표현 방식"] },
    docs: {
      ...storyDescription("components-select--states").docs,
      source: {
        code: withStoryImports(`const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
];

<div className="grid max-w-sm gap-3">
  <Select options={memberOptions} placeholder="기본" />
  <Select options={memberOptions} readOnly defaultValue="lee" />
  <Select options={memberOptions} disabled defaultValue="kim" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-sm gap-3">
      <Select
        size={args.size}
        variant={args.variant}
        options={sizeMemberOptions}
        placeholder="기본"
      />
      <Select
        size={args.size}
        variant={args.variant}
        options={sizeMemberOptions}
        readOnly
        defaultValue="lee"
      />
      <Select
        size={args.size}
        variant={args.variant}
        options={sizeMemberOptions}
        disabled
        defaultValue="kim"
      />
    </div>
  ),
};

export const Multiple: Story = {
  args: { closable: true, size: "md", variant: "default" },
  parameters: {
    ...storySource(
      "components-select--multiple",
      `const multipleMemberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
  { label: '박지호', value: 'park' },
  { label: '최유진', value: 'choi' },
  { label: '정도윤', value: 'jung' },
  { label: '한지민', value: 'han' },
  { label: '윤서준', value: 'yoon' },
  { label: '오하늘', value: 'oh' },
];

<div className="max-w-md">
  <Select
    mode="multiple"
    options={multipleMemberOptions}
    defaultValue={['kim', 'lee']}
    placeholder="구성원을 선택하세요"
  />
</div>`,
    ),
    controls: { disable: false, include: ["크기", "표현 방식", "태그 닫기"] },
  },
  render: (args) => (
    <div className="max-w-md">
      <Select
        size={args.size}
        variant={args.variant}
        closable={args.closable}
        mode="multiple"
        options={multipleMemberOptions}
        defaultValue={["kim", "lee"]}
        placeholder="구성원을 선택하세요"
      />
    </div>
  ),
};

export const Tags: Story = {
  args: { closable: true, variant: "default" },
  parameters: {
    ...storySource(
      "components-select--tags",
      `<div className="grid max-w-md gap-3">
  <Select
    allowClear
    defaultValue={['kim']}
    mode="tags"
    options={memberOptions}
    size="lg"
    placeholder="이름을 입력하고 Enter를 눌러요"
  />
  <Select
    allowClear
    defaultValue={['kim']}
    mode="tags"
    options={memberOptions}
    placeholder="이름을 입력하고 Enter를 눌러요"
  />
  <Select
    allowClear
    defaultValue={['kim']}
    mode="tags"
    options={memberOptions}
    size="sm"
    placeholder="이름을 입력하고 Enter를 눌러요"
  />
</div>`,
    ),
    controls: { disable: false, include: ["표현 방식", "태그 닫기"] },
  },
  render: (args) => (
    <div className="grid max-w-md gap-3">
      <Select
        allowClear
        closable={args.closable}
        variant={args.variant}
        defaultValue={["kim"]}
        mode="tags"
        options={memberOptions}
        size="lg"
        placeholder="이름을 입력하고 Enter를 눌러요"
      />
      <Select
        allowClear
        closable={args.closable}
        variant={args.variant}
        defaultValue={["kim"]}
        mode="tags"
        options={memberOptions}
        placeholder="이름을 입력하고 Enter를 눌러요"
      />
      <Select
        allowClear
        closable={args.closable}
        variant={args.variant}
        defaultValue={["kim"]}
        mode="tags"
        options={memberOptions}
        size="sm"
        placeholder="이름을 입력하고 Enter를 눌러요"
      />
    </div>
  ),
};

export const TagRender: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storySource(
      "components-select--tag-render",
      `<div className="max-w-md">
  <Select
    mode="multiple"
    options={memberOptions}
    defaultValue={['kim', 'lee']}
    tagRender={({ label, closable, onClose }) => (
      <Tag
        color="blue"
        suffixIcon={
          closable ? <Icon icon="close" onClick={onClose} /> : undefined
        }
      >
        {label}
      </Tag>
    )}
  />
</div>`,
    ),
    controls: { disable: false, include: ["크기", "표현 방식"] },
  },
  render: (args) => (
    <div className="max-w-md">
      <Select
        size={args.size}
        variant={args.variant}
        mode="multiple"
        options={memberOptions}
        defaultValue={["kim", "lee"]}
        tagRender={({ label, closable, onClose }) => (
          <Tag
            color="blue"
            suffixIcon={closable ? <Icon icon="close" onClick={onClose} /> : undefined}
          >
            {label}
          </Tag>
        )}
      />
    </div>
  ),
};

export const OptionColors: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storySource(
      "components-select--option-colors",
      `const statusOptions: SelectOption[] = [
  { label: '활성', value: 'active', color: 'green' },
  { label: '휴가', value: 'leave', color: 'blue' },
  { label: '오류', value: 'error', color: 'red' },
];

<div className="max-w-md">
  <Select
    mode="multiple"
    options={statusOptions}
    defaultValue={['active', 'leave', 'error']}
  />
</div>`,
    ),
    controls: { disable: false, include: ["크기", "표현 방식", "태그 닫기"] },
  },
  render: (args) => {
    const statusOptions: SelectOption[] = [
      { label: "활성", value: "active", color: "green" },
      { label: "휴가", value: "leave", color: "blue" },
      { label: "오류", value: "error", color: "red" },
    ];

    return (
      <div className="max-w-md">
        <Select
          closable={args.closable}
          size={args.size}
          variant={args.variant}
          mode="multiple"
          options={statusOptions}
          defaultValue={["active", "leave", "error"]}
        />
      </div>
    );
  },
};

export const LabelAndError: Story = {
  args: {
    errorMessage: "담당자를 선택해 주세요.",
    label: "담당자",
    required: true,
    size: "md",
    variant: "default",
  },
  parameters: {
    ...storyDescription("components-select--label-and-error"),
    controls: {
      disable: false,
      include: ["크기", "표현 방식", "레이블", "오류 문구", "필수 표시"],
    },
    docs: {
      ...storyDescription("components-select--label-and-error").docs,
      source: {
        code: withStoryImports(`const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
];

<div className="max-w-sm">
  <Select
    options={memberOptions}
    label="담당자"
    required
    errorMessage="담당자를 선택해 주세요."
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-sm">
      <StorySelect {...args} options={sizeMemberOptions} />
    </div>
  ),
};

export const Search: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storyDescription("components-select--search"),
    controls: { disable: false, include: ["크기", "표현 방식"] },
    docs: {
      ...storyDescription("components-select--search").docs,
      source: {
        code: withStoryImports(`<div className="max-w-sm">
  <Select
    options={memberOptions}
    showSearch
    optionFilterProp="label"
    placeholder="이름을 검색하세요"
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-sm">
      <StorySelect
        {...args}
        options={memberOptions}
        showSearch
        optionFilterProp="label"
        placeholder="이름을 검색하세요"
      />
    </div>
  ),
};

export const FilterOption: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storySource(
      "components-select--filter-option",
      `const filterOptions = [
  { label: '김민준 · Design', value: 'kim' },
  { label: '이서연 · Platform', value: 'lee' },
  { label: '박지호 · Growth', value: 'park' },
];

<div className="max-w-sm">
  <Select
    options={filterOptions}
    showSearch
    placeholder="이름 또는 팀을 검색하세요"
    filterOption={(input, option) =>
      String(option.label ?? '')
        .toLowerCase()
        .includes(input.toLowerCase())
    }
  />
</div>`,
    ),
    controls: { disable: false, include: ["크기", "표현 방식"] },
  },
  render: (args) => (
    <div className="max-w-sm">
      <StorySelect
        {...args}
        options={filterOptions}
        showSearch
        placeholder="이름 또는 팀을 검색하세요"
        filterOption={(input, option) =>
          String(option.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    </div>
  ),
};

export const OptionLabelProp: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storySource(
      "components-select--option-label-prop",
      `const optionLabelOptions = [
  { label: '김민준 · Design', shortLabel: '김민준', value: 'kim' },
  { label: '이서연 · Platform', shortLabel: '이서연', value: 'lee' },
];

<div className="max-w-sm">
  <Select
    options={optionLabelOptions}
    optionLabelProp="shortLabel"
    defaultValue="kim"
  />
</div>`,
    ),
    controls: { disable: false, include: ["크기", "표현 방식"] },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Select
        size={args.size}
        variant={args.variant}
        options={optionLabelOptions}
        optionLabelProp="shortLabel"
        defaultValue="kim"
      />
    </div>
  ),
};

export const MultipleAndSearch: Story = {
  name: "Multiple Search",
  args: { closable: true },
  parameters: {
    ...storyDescription("components-select--multiple-and-search"),
    controls: { disable: false, include: ["태그 닫기"] },
    docs: {
      ...storyDescription("components-select--multiple-and-search").docs,
      source: {
        code: withStoryImports(`const groupedOptions = [
  {
    label: '제품 조직',
    options: [
      { label: 'Design', value: 'design' },
      { label: 'Product', value: 'product' },
    ],
  },
  {
    label: '기술 조직',
    options: [
      { label: 'Platform', value: 'platform' },
      { label: 'Mobile', value: 'mobile' },
    ],
  },
];

<div className="grid max-w-md gap-6">
  {(['default', 'filled'] as const).map((variant) => (
    <div key={variant} className="grid gap-3">
      <span className="text-sm font-medium text-[#666]">{variant}</span>
      {(['lg', 'md', 'sm'] as const).map((size) => (
        <Select
          key={size}
          allowClear
          defaultValue={['design']}
          mode="multiple"
          options={groupedOptions}
          showSearch
          size={size}
          variant={variant}
        />
      ))}
    </div>
  ))}
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-md gap-6">
      {(["default", "filled"] as const).map((variant) => (
        <div key={variant} className="grid gap-3">
          <span className="text-sm font-medium text-[#666]">{variant}</span>
          {(["lg", "md", "sm"] as const).map((size) => (
            <Select
              key={size}
              allowClear
              closable={args.closable}
              defaultValue={["design"]}
              mode="multiple"
              options={groupedOptions}
              showSearch
              size={size}
              variant={variant}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const OptionsSort: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storyDescription("components-select--options-sort"),
    controls: { disable: false, include: ["크기", "표현 방식"] },
    docs: {
      ...storyDescription("components-select--options-sort").docs,
      source: {
        code: withStoryImports(`const searchSortOptions = [
  { label: '이서연', value: 'lee' },
  { label: '박지호', value: 'park' },
  { label: '김민준', value: 'kim' },
];

<div className="max-w-sm">
  <Select
    options={searchSortOptions}
    optionsSort={(a, b) => String(a.label).localeCompare(String(b.label))}
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-sm">
      <StorySelect
        {...args}
        options={searchSortOptions}
        optionsSort={(a, b) => String(a.label).localeCompare(String(b.label))}
      />
    </div>
  ),
};

export const TagsSeparators: Story = {
  args: { closable: true, size: "md", variant: "default" },
  parameters: {
    ...storyDescription("components-select--tags-separators"),
    controls: { disable: false, include: ["크기", "표현 방식", "태그 닫기"] },
    docs: {
      ...storyDescription("components-select--tags-separators").docs,
      source: {
        code: withStoryImports(`<div className="max-w-lg">
  <Select
    mode="tags"
    options={memberOptions}
    tagSeparators={[',', ' ']}
    placeholder="이름을 입력하고 Enter를 눌러요"
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-lg">
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="tags"
        options={memberOptions}
        tagSeparators={[",", " "]}
        placeholder="이름을 입력하고 Enter를 눌러요"
      />
    </div>
  ),
};

export const SelectionLimits: Story = {
  args: { closable: true, size: "md", variant: "default" },
  parameters: {
    ...storyDescription("components-select--selection-limits"),
    controls: { disable: false, include: ["크기", "표현 방식", "태그 닫기"] },
    docs: {
      ...storyDescription("components-select--selection-limits").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-lg gap-3">
  <Select mode="multiple" options={memberOptions} maxSelectedCount={2} />
  <Select mode="tags" options={memberOptions} maxSelectedCount={2} />
  <Select
    mode="multiple"
    options={memberOptions}
    defaultValue={['kim', 'lee', 'park']}
    maxVisibleTagCount={1}
  />
  <Select
    mode="tags"
    options={memberOptions}
    defaultValue={['kim', 'lee', 'park']}
    maxVisibleTagCount={1}
  />
  <Select
    mode="multiple"
    options={memberOptions}
    defaultValue={['kim', 'lee', 'park']}
    maxVisibleTagCount="responsive"
  />
  <Select
    mode="tags"
    options={memberOptions}
    defaultValue={['kim', 'lee', 'park']}
    maxVisibleTagCount="responsive"
  />
  <Select
    mode="multiple"
    options={memberOptions}
    defaultValue={['kim', 'lee']}
    maxTagTextLength={2}
  />
  <Select
    mode="tags"
    options={memberOptions}
    defaultValue={['kim', 'lee']}
    maxTagTextLength={2}
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-lg gap-3">
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="multiple"
        options={memberOptions}
        maxSelectedCount={2}
      />
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="tags"
        options={memberOptions}
        maxSelectedCount={2}
      />
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="multiple"
        options={memberOptions}
        defaultValue={["kim", "lee", "park"]}
        maxVisibleTagCount={1}
      />
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="tags"
        options={memberOptions}
        defaultValue={["kim", "lee", "park"]}
        maxVisibleTagCount={1}
      />
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="multiple"
        options={memberOptions}
        defaultValue={["kim", "lee", "park"]}
        maxVisibleTagCount="responsive"
      />
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="tags"
        options={memberOptions}
        defaultValue={["kim", "lee", "park"]}
        maxVisibleTagCount="responsive"
      />
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="multiple"
        options={memberOptions}
        defaultValue={["kim", "lee"]}
        maxTagTextLength={2}
      />
      <Select
        closable={args.closable}
        size={args.size}
        variant={args.variant}
        mode="tags"
        options={memberOptions}
        defaultValue={["kim", "lee"]}
        maxTagTextLength={2}
      />
    </div>
  ),
};

export const CustomRendering: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storyDescription("components-select--custom-rendering"),
    controls: { disable: false, include: ["크기", "표현 방식"] },
    docs: {
      ...storyDescription("components-select--custom-rendering").docs,
      source: {
        code: withStoryImports(`<div className="max-w-sm">
  <Select
    options={memberOptions}
    defaultValue="kim"
    optionRender={(option) => <strong>{option.label}</strong>}
    labelRender={({ label }) => <>선택: {label}</>}
    popupRender={(menu) => (
      <div>
        <div className="p-2 text-xs text-[#777]">구성원 목록</div>
        {menu}
      </div>
    )}
  />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="max-w-sm">
      <Select
        size={args.size}
        variant={args.variant}
        options={memberOptions}
        defaultValue="kim"
        optionRender={(option) => <strong>{option.label}</strong>}
        labelRender={({ label: selectedLabel }) => <>선택: {selectedLabel}</>}
        popupRender={(menu) => (
          <div>
            <div className="p-2 text-xs text-[#777]">구성원 목록</div>
            {menu}
          </div>
        )}
      />
    </div>
  ),
};

export const PopupWidthAndPlacement: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storyDescription("components-select--popup-width-and-placement"),
    controls: { disable: false, include: ["크기", "표현 방식"] },
    docs: {
      ...storyDescription("components-select--popup-width-and-placement").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-sm gap-3">
  <Select options={memberOptions} popupMatchWidth={420} placement="topLeft" />
  <Select options={memberOptions} popupMatchWidth={false} placement="bottomRight" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-sm gap-3">
      <StorySelect {...args} options={memberOptions} popupMatchWidth={420} placement="topLeft" />
      <StorySelect
        {...args}
        options={memberOptions}
        popupMatchWidth={false}
        placement="bottomRight"
      />
    </div>
  ),
};

export const LoadingAndEmpty: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storyDescription("components-select--loading-and-empty"),
    controls: { disable: false, include: ["크기", "표현 방식"] },
    docs: {
      ...storyDescription("components-select--loading-and-empty").docs,
      source: {
        code: withStoryImports(`<div className="grid max-w-sm gap-3">
  <Select options={memberOptions} loading />
  <Select options={[]} notFoundContent="검색 결과가 없어요" />
</div>`),
      },
    },
  },
  render: (args) => (
    <div className="grid max-w-sm gap-3">
      <StorySelect {...args} options={memberOptions} loading />
      <StorySelect {...args} options={[]} notFoundContent="검색 결과가 없어요" />
    </div>
  ),
};

export const ControlledOpenAndSearch: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storySource(
      "components-select--controlled-open-and-search",
      `function ControlledSelect() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div className="grid max-w-sm gap-3">
      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)}>목록 열기</Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>목록 닫기</Button>
        <Button variant="tertiary" onClick={() => setSearch('')}>검색어 초기화</Button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded bg-[#f5f5f5] px-3 py-2">목록: {open ? '열림' : '닫힘'}</div>
        <div className="rounded bg-[#f5f5f5] px-3 py-2">검색어: {search || '없음'}</div>
      </div>
      <Select
        options={memberOptions}
        open={open}
        showSearch
        searchValue={search}
        onOpenChange={setOpen}
        onSearch={setSearch}
      />
    </div>
  );
}`,
    ),
    controls: { disable: false, include: ["크기", "표현 방식"] },
  },
  render: function ControlledSelectStory(args) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    return (
      <div className="grid max-w-sm gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsOpen(true)}>목록 열기</Button>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            목록 닫기
          </Button>
          <Button variant="tertiary" onClick={() => setSearch("")}>
            검색어 초기화
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded bg-[#f5f5f5] px-3 py-2">목록: {isOpen ? "열림" : "닫힘"}</div>
          <div className="rounded bg-[#f5f5f5] px-3 py-2">검색어: {search || "없음"}</div>
        </div>
        <Select
          size={args.size}
          variant={args.variant}
          options={memberOptions}
          open={isOpen}
          showSearch
          searchValue={search}
          onOpenChange={setIsOpen}
          onSearch={setSearch}
        />
      </div>
    );
  },
};

export const VirtualList: Story = {
  args: { size: "md", variant: "default" },
  parameters: {
    ...storySource(
      "components-select--virtual-list",
      `const manyOptions = Array.from({ length: 1000 }, (_, index) => ({
  label: '항목 ' + (index + 1),
  value: index + 1,
}));

<div className="max-w-sm">
  <Select options={manyOptions} showSearch listHeight={240} />
</div>`,
    ),
    controls: { disable: false, include: ["크기", "표현 방식"] },
  },
  render: (args) => (
    <div className="max-w-sm">
      <StorySelect
        {...args}
        options={Array.from({ length: 1000 }, (_, index) => ({
          label: `항목 ${index + 1}`,
          value: index + 1,
        }))}
        showSearch
        listHeight={240}
      />
    </div>
  ),
};
