import { useState } from "react";
import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports as addStoryImports } from "../../storybook/story-source";
import { Icon } from "../Icon";
import { Select } from "./Select";
import type { SelectOption } from "./Select.types";

const memberOptions: SelectOption[] = [
  { label: "김민준", value: "kim" },
  { label: "이서연", value: "lee" },
  { label: "박지호", value: "park" },
  { label: "선택할 수 없음", value: "disabled", disabled: true },
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
  component: Select,
  tags: ["autodocs"],
  args: { options: memberOptions, placeholder: "구성원을 선택하세요" },
  argTypes: {
    options: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    mode: { control: false },
    size: { name: "크기", control: "select", options: ["lg", "md", "sm"] },
    variant: {
      name: "표현 방식",
      control: "select",
      options: ["default", "outlined", "filled", "borderless", "underlined"],
    },
    placeholder: { name: "안내 문구", control: "text" },
    label: { name: "레이블", control: "text" },
    errorText: { name: "오류 문구", control: "text" },
    required: { name: "필수 표시", control: "boolean" },
    allowClear: { name: "지우기", control: "boolean" },
    showSearch: { name: "검색", control: "boolean" },
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
| \`options\` | 선택할 항목과 그룹을 설정해요. | \`SelectOption[]\` | - |
| \`mode\` | 다중 선택이나 직접 입력 태그 방식을 설정해요. | \`multiple \\| tags\` | - |
| \`value\` | 선택값을 외부에서 관리해요. | \`SelectValue \\| SelectValue[]\` | - |
| \`defaultValue\` | 처음 선택할 값을 설정해요. | \`SelectValue \\| SelectValue[]\` | - |
| \`placeholder\` | 선택 전 안내할 내용을 표시해요. | \`ReactNode\` | \`선택하세요\` |
| \`size\` | Select의 크기를 설정해요. | \`lg \\| md \\| sm\` | \`md\` |
| \`variant\` | 배경과 테두리 표현 방식을 설정해요. | \`default \\| outlined \\| filled \\| borderless \\| underlined\` | \`default\` |
| \`status\` | 경고나 오류 상태를 표시해요. | \`warning \\| error\` | - |
| \`showSearch\` | 검색 기능과 동작을 설정해요. | \`boolean \\| SelectSearchConfig\` | 단일 \`false\`, 다중 \`true\` |
| \`searchValue\` | 검색어를 외부에서 관리해요. | \`string\` | - |
| \`filterOption\` | 검색어와 항목의 일치 조건을 설정해요. | \`boolean \\| (input, option) => boolean\` | \`true\` |
| \`filterSort\` | 검색된 항목의 정렬 방법을 설정해요. | \`(a, b, info) => number\` | - |
| \`optionFilterProp\` | 검색에 사용할 항목 속성을 설정해요. | \`string \\| string[]\` | \`label\` |
| \`optionLabelProp\` | 선택 영역에 표시할 항목 속성을 설정해요. | \`string\` | \`label\` |
| \`autoClearSearchValue\` | 다중 선택 뒤 검색어를 자동으로 지워요. | \`boolean\` | \`true\` |
| \`defaultActiveFirstOption\` | 목록을 열 때 첫 항목을 활성화해요. | \`boolean\` | \`true\` |
| \`allowClear\` | 선택값을 지우는 버튼을 표시해요. | \`boolean \\| { clearIcon }\` | \`false\` |
| \`disabled\` | 선택과 열기 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`loading\` | 목록을 불러오는 상태를 표시해요. | \`boolean\` | \`false\` |
| \`open\` | 목록 표시 상태를 외부에서 관리해요. | \`boolean\` | - |
| \`defaultOpen\` | 처음 목록을 표시할지 설정해요. | \`boolean\` | \`false\` |
| \`placement\` | 목록이 표시될 위치를 설정해요. | \`topLeft \\| topRight \\| bottomLeft \\| bottomRight\` | \`bottomLeft\` |
| \`labelInValue\` | value와 label을 객체로 함께 반환해요. | \`boolean\` | \`false\` |
| \`fieldNames\` | 데이터 필드명을 Select 구조에 연결해요. | \`SelectFieldNames\` | - |
| \`maxCount\` | 선택할 수 있는 최대 항목 수를 설정해요. | \`number\` | - |
| \`maxTagCount\` | 화면에 표시할 최대 태그 수를 설정해요. | \`number \\| responsive\` | - |
| \`maxTagPlaceholder\` | 생략된 태그 대신 표시할 내용을 설정해요. | \`ReactNode \\| (omitted) => ReactNode\` | - |
| \`maxTagTextLength\` | 태그 레이블의 최대 글자 수를 설정해요. | \`number\` | - |
| \`tokenSeparators\` | 입력값을 여러 태그로 나눌 구분자를 설정해요. | \`string[] \\| (input) => string[]\` | - |
| \`listHeight\` | 목록의 최대 세로 길이를 설정해요. | \`number\` | \`256\` |
| \`popupMatchSelectWidth\` | 목록 너비를 선택 영역과 맞추거나 지정해요. | \`boolean \\| number\` | \`true\` |
| \`virtual\` | 많은 항목을 가상 목록으로 표시해요. | \`boolean\` | \`true\` |
| \`notFoundContent\` | 항목이 없을 때 안내할 내용을 설정해요. | \`ReactNode\` | \`검색 결과가 없어요\` |
| \`prefix\` | 선택 영역 앞에 추가 내용을 표시해요. | \`ReactNode\` | - |
| \`suffixIcon\` | 펼침 아이콘을 변경해요. | \`ReactNode\` | - |
| \`removeIcon\` | 선택 태그의 삭제 아이콘을 변경해요. | \`ReactNode\` | - |
| \`menuItemSelectedIcon\` | 선택된 목록 항목의 아이콘을 변경해요. | \`ReactNode\` | - |
| \`optionRender\` | 목록 항목의 내용을 직접 구성해요. | \`(option, info) => ReactNode\` | - |
| \`tagRender\` | 선택 태그의 내용을 직접 구성해요. | \`(props) => ReactNode\` | - |
| \`labelRender\` | 선택된 레이블을 직접 구성해요. | \`(props) => ReactNode\` | - |
| \`popupRender\` | 목록 전체에 추가 내용을 구성해요. | \`(menu) => ReactNode\` | - |
| \`label\` | Select 위에 레이블을 표시해요. | \`ReactNode\` | - |
| \`errorText\` | Select 아래에 오류 문구를 표시해요. | \`ReactNode\` | - |
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
| \`onInputKeyDown\` | 선택 영역이나 검색창에서 키를 누를 때 실행해요. | \`(event) => void\` | - |
| \`onPopupScroll\` | 목록을 스크롤할 때 실행할 함수예요. | \`(event) => void\` | - |

### SelectOption

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 목록과 선택 영역에 표시할 내용을 설정해요. | \`ReactNode\` | - |
| \`value\` | 항목을 구분하고 반환할 값을 설정해요. | \`string &#124; number\` | - |
| \`disabled\` | 해당 항목을 선택할 수 없게 해요. | \`boolean\` | \`false\` |
| \`options\` | 하위 항목을 전달해 그룹을 구성해요. | \`SelectOption[]\` | - |
| \`title\` | 항목에 네이티브 안내 문구를 추가해요. | \`string\` | - |
| \`className\` | 항목에 Tailwind 클래스를 추가해요. | \`string\` | - |

### SelectSearchConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`searchValue\` | 검색어를 외부에서 관리해요. | \`string\` | - |
| \`autoClearSearchValue\` | 다중 선택 뒤 검색어를 자동으로 지워요. | \`boolean\` | \`true\` |
| \`filterOption\` | 검색어와 항목의 일치 조건을 설정해요. | \`boolean &#124; (input, option) => boolean\` | \`true\` |
| \`filterSort\` | 검색 결과의 정렬 방법을 설정해요. | \`(a, b, info) => number\` | - |
| \`optionFilterProp\` | 검색에 사용할 항목 속성을 설정해요. | \`string &#124; string[]\` | \`label\` |
| \`optionLabelProp\` | 선택 영역에 표시할 속성을 설정해요. | \`string\` | \`label\` |
| \`searchIcon\` | 검색창 앞에 표시할 아이콘을 설정해요. | \`ReactNode\` | 검색 아이콘 |
| \`onSearch\` | 검색어가 바뀔 때 실행할 함수예요. | \`(value: string) => void\` | - |

### SelectFieldNames

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`label\` | 표시 내용으로 사용할 필드명을 설정해요. | \`string\` | \`label\` |
| \`value\` | 선택값으로 사용할 필드명을 설정해요. | \`string\` | \`value\` |
| \`options\` | 하위 항목 배열의 필드명을 설정해요. | \`string\` | \`options\` |
| \`groupLabel\` | 그룹 제목으로 사용할 필드명을 설정해요. | \`string\` | \`label\` |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  parameters: {
    ...storyDescription("components-select--sizes"),
    docs: {
      source: {
        code: withStoryImports(`const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
];

<div className="grid max-w-sm gap-3">
  <Select options={memberOptions} size="lg" />
  <Select options={memberOptions} />
  <Select options={memberOptions} size="sm" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-sm gap-3">
      <Select options={memberOptions} size="lg" />
      <Select options={memberOptions} />
      <Select options={memberOptions} size="sm" />
    </div>
  ),
};

export const States: Story = {
  parameters: {
    ...storyDescription("components-select--states"),
    docs: {
      source: {
        code: withStoryImports(`const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
];

<div className="grid max-w-sm gap-3">
  <Select options={memberOptions} placeholder="기본" />
  <Select options={memberOptions} variant="filled" placeholder="채움" />
  <Select options={memberOptions} status="warning" placeholder="경고" />
  <Select options={memberOptions} disabled defaultValue="kim" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-sm gap-3">
      <Select options={memberOptions} placeholder="기본" />
      <Select options={memberOptions} variant="filled" placeholder="채움" />
      <Select options={memberOptions} status="warning" placeholder="경고" />
      <Select options={memberOptions} disabled defaultValue="kim" />
    </div>
  ),
};

export const LabelAndError: Story = {
  parameters: {
    ...storyDescription("components-select--label-and-error"),
    docs: {
      source: {
        code: withStoryImports(`const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
];

<Select
  className="max-w-sm"
  options={memberOptions}
  label="담당자"
  required
  errorText="담당자를 선택해 주세요."
/>`),
      },
    },
  },
  render: () => (
    <Select
      className="max-w-sm"
      options={memberOptions}
      label="담당자"
      required
      errorText="담당자를 선택해 주세요."
    />
  ),
};

export const Basic: Story = {
  parameters: {
    ...storyDescription("components-select--basic"),
    controls: { disable: false },
    docs: {
      source: {
        code: withStoryImports(`const memberOptions = [
  { label: '김민준', value: 'kim' },
  { label: '이서연', value: 'lee' },
  { label: '박지호', value: 'park' },
];

<Select className="max-w-sm" options={memberOptions} placeholder="구성원을 선택하세요" />`),
      },
    },
  },
  render: (args) => <Select {...args} className="max-w-sm" />,
};

export const MultipleAndSearch: Story = {
  parameters: {
    ...storyDescription("components-select--multiple-and-search"),
    docs: {
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

<Select
  className="max-w-md"
  mode="multiple"
  options={groupedOptions}
  defaultValue={['design']}
  allowClear
/>`),
      },
    },
  },
  render: () => (
    <Select
      className="max-w-md"
      mode="multiple"
      options={groupedOptions}
      defaultValue={["design"]}
      allowClear
    />
  ),
};

export const Search: Story = {
  parameters: {
    ...storyDescription("components-select--search"),
    docs: {
      source: {
        code: withStoryImports(`<Select
  className="max-w-sm"
  options={memberOptions}
  showSearch
  optionFilterProp="label"
  placeholder="이름을 검색하세요"
/>`),
      },
    },
  },
  render: () => (
    <Select
      className="max-w-sm"
      options={memberOptions}
      showSearch
      optionFilterProp="label"
      placeholder="이름을 검색하세요"
    />
  ),
};

export const CustomSearchAndSort: Story = {
  parameters: {
    ...storyDescription("components-select--custom-search-and-sort"),
    docs: {
      source: {
        code: withStoryImports(`<Select
  className="max-w-sm"
  options={memberOptions}
  showSearch
  filterOption={(input, option) =>
    String(option.label).toLowerCase().includes(input.toLowerCase())
  }
  filterSort={(a, b) => String(a.label).localeCompare(String(b.label))}
/>`),
      },
    },
  },
  render: () => (
    <Select
      className="max-w-sm"
      options={memberOptions}
      showSearch
      filterOption={(input, option) =>
        String(option.label).toLowerCase().includes(input.toLowerCase())
      }
      filterSort={(a, b) => String(a.label).localeCompare(String(b.label))}
    />
  ),
};

export const TagsAndTokenSeparators: Story = {
  parameters: {
    ...storyDescription("components-select--tags-and-token-separators"),
    docs: {
      source: {
        code: withStoryImports(`<Select
  className="max-w-lg"
  mode="tags"
  options={memberOptions}
  tokenSeparators={[',', ' ']}
  placeholder="이름을 입력하고 Enter를 눌러요"
/>`),
      },
    },
  },
  render: () => (
    <Select
      className="max-w-lg"
      mode="tags"
      options={memberOptions}
      tokenSeparators={[",", " "]}
      placeholder="이름을 입력하고 Enter를 눌러요"
    />
  ),
};

export const SelectionLimits: Story = {
  parameters: {
    ...storyDescription("components-select--selection-limits"),
    docs: {
      source: {
        code: withStoryImports(`<div className="grid max-w-lg gap-3">
  <Select mode="multiple" options={memberOptions} maxCount={2} />
  <Select
    mode="multiple"
    options={memberOptions}
    defaultValue={['kim', 'lee', 'park']}
    maxTagCount={1}
    maxTagPlaceholder={(omitted) => '외 ' + omitted.length + '명'}
  />
  <Select
    className="max-w-[160px]"
    mode="multiple"
    options={memberOptions}
    defaultValue={['kim', 'lee', 'park']}
    maxTagCount="responsive"
  />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-lg gap-3">
      <Select mode="multiple" options={memberOptions} maxCount={2} />
      <Select
        mode="multiple"
        options={memberOptions}
        defaultValue={["kim", "lee", "park"]}
        maxTagCount={1}
        maxTagPlaceholder={(omitted) => `외 ${omitted.length}명`}
      />
      <Select
        className="max-w-[160px]"
        mode="multiple"
        options={memberOptions}
        defaultValue={["kim", "lee", "park"]}
        maxTagCount="responsive"
      />
    </div>
  ),
};

export const LabelInValue: Story = {
  parameters: {
    ...storyDescription("components-select--label-in-value"),
    docs: {
      source: {
        code: withStoryImports(`function LabeledSelect() {
  const [member, setMember] = useState({ value: 'kim', label: '김민준' });

  return (
    <Select
      className="max-w-sm"
      options={memberOptions}
      labelInValue
      value={member}
      onChange={setMember}
    />
  );
}`),
      },
    },
  },
  render: function LabeledSelectStory() {
    const [member, setMember] = useState({ value: "kim", label: "김민준" });
    return (
      <Select
        className="max-w-sm"
        options={memberOptions}
        labelInValue
        value={member}
        onChange={(nextValue) => setMember(nextValue as typeof member)}
      />
    );
  },
};

export const CustomRendering: Story = {
  parameters: {
    ...storyDescription("components-select--custom-rendering"),
    docs: {
      source: {
        code: withStoryImports(`<Select
  className="max-w-sm"
  options={memberOptions}
  defaultValue="kim"
  optionRender={(option) => <strong>{option.label}</strong>}
  labelRender={({ label }) => <>선택: {label}</>}
  popupRender={(menu) => (
    <div>
      {menu}
      <div className="border-t border-[#eee] p-2 text-xs text-[#777]">구성원 목록</div>
    </div>
  )}
/>`),
      },
    },
  },
  render: () => (
    <Select
      className="max-w-sm"
      options={memberOptions}
      defaultValue="kim"
      optionRender={(option) => <strong>{option.label}</strong>}
      labelRender={({ label: selectedLabel }) => <>선택: {selectedLabel}</>}
      popupRender={(menu) => (
        <div>
          {menu}
          <div className="border-t border-[#eee] p-2 text-xs text-[#777]">구성원 목록</div>
        </div>
      )}
    />
  ),
};

export const PopupWidthAndPlacement: Story = {
  parameters: {
    ...storyDescription("components-select--popup-width-and-placement"),
    docs: {
      source: {
        code: withStoryImports(`<div className="grid max-w-sm gap-3 pt-40">
  <Select options={memberOptions} popupMatchSelectWidth={420} placement="topLeft" />
  <Select options={memberOptions} popupMatchSelectWidth={false} placement="bottomRight" />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-sm gap-3 pt-40">
      <Select options={memberOptions} popupMatchSelectWidth={420} placement="topLeft" />
      <Select options={memberOptions} popupMatchSelectWidth={false} placement="bottomRight" />
    </div>
  ),
};

export const LoadingAndEmpty: Story = {
  parameters: {
    ...storyDescription("components-select--loading-and-empty"),
    docs: {
      source: {
        code: withStoryImports(`<div className="grid max-w-sm gap-3">
  <Select options={memberOptions} loading />
  <Select options={[]} notFoundContent="검색 결과가 없어요" open />
</div>`),
      },
    },
  },
  render: () => (
    <div className="grid max-w-sm gap-3">
      <Select options={memberOptions} loading />
      <Select options={[]} notFoundContent="검색 결과가 없어요" open />
    </div>
  ),
};

export const ControlledOpenAndSearch: Story = {
  parameters: storySource(
    "components-select--controlled-open-and-search",
    `function ControlledSelect() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <Select
      className="max-w-sm"
      options={memberOptions}
      open={open}
      showSearch
      searchValue={search}
      onOpenChange={setOpen}
      onSearch={setSearch}
    />
  );
}`,
  ),
  render: function ControlledSelectStory() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    return (
      <div className="max-w-sm">
        <Select
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
  parameters: storySource(
    "components-select--virtual-list",
    `const manyOptions = Array.from({ length: 1000 }, (_, index) => ({
  label: '항목 ' + (index + 1),
  value: index + 1,
}));

<Select className="max-w-sm" options={manyOptions} showSearch listHeight={240} />`,
  ),
  render: () => (
    <Select
      className="max-w-sm"
      options={Array.from({ length: 1000 }, (_, index) => ({
        label: `항목 ${index + 1}`,
        value: index + 1,
      }))}
      showSearch
      listHeight={240}
    />
  ),
};

export const FieldNames: Story = {
  parameters: storySource(
    "components-select--field-names",
    `const teams = [
  { name: 'Design', id: 'design' },
  { name: 'Platform', id: 'platform' },
];

<Select
  className="max-w-sm"
  options={teams}
  fieldNames={{ label: 'name', value: 'id' }}
/>`,
  ),
  render: () => (
    <Select
      className="max-w-sm"
      options={[
        { name: "Design", id: "design" },
        { name: "Platform", id: "platform" },
      ]}
      fieldNames={{ label: "name", value: "id" }}
    />
  ),
};

export const CustomIcons: Story = {
  parameters: storySource(
    "components-select--custom-icons",
    `<Select
  className="max-w-md"
  mode="multiple"
  options={memberOptions}
  defaultValue={['kim', 'lee']}
  showSearch={{ searchIcon: <Icon icon="search" /> }}
  prefix={<span>담당자</span>}
  suffixIcon={<Icon icon="chevron-down" />}
  removeIcon={<Icon icon="close" />}
  menuItemSelectedIcon={<Icon icon="check" color="#0062df" />}
/>`,
  ),
  render: () => (
    <Select
      className="max-w-md"
      mode="multiple"
      options={memberOptions}
      defaultValue={["kim", "lee"]}
      showSearch={{ searchIcon: <Icon icon="search" /> }}
      prefix={<span>담당자</span>}
      suffixIcon={<Icon icon="chevron-down" />}
      removeIcon={<Icon icon="close" />}
      menuItemSelectedIcon={<Icon icon="check" color="#0062df" />}
    />
  ),
};
