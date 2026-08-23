import { Canvas, Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import type {
  BreakpointType,
  ColumnAlignType,
  ColumnFilterModeType,
  ColumnFixedType,
  PaginationPlacementType,
  RowSelectionType,
  SortOrderType,
  TableScrollAlignType,
  TableSizeType,
} from "./Table.types";
import * as apiStories from "./Table.API.stories";
import * as expandableStories from "./Table.Expandable.stories";
import * as layoutStories from "./Table.Layout.stories";
import * as paginationStories from "./Table.Pagination.stories";
import * as selectionStories from "./Table.Selection.stories";
import * as sortingFilteringStories from "./Table.SortingFiltering.stories";

const tableSizes: TableSizeType[] = ["lg", "md", "sm"];
const columnAligns: ColumnAlignType[] = ["left", "center", "right"];
const columnFixedSides: ColumnFixedType[] = ["left", "right"];
const sortOrders: SortOrderType[] = ["ascend", "descend", null];
const breakpoints: BreakpointType[] = ["xs", "sm", "md", "lg", "xl", "xxl"];
const paginationPlacements: PaginationPlacementType[] = [
  "topStart",
  "topCenter",
  "topEnd",
  "bottomStart",
  "bottomCenter",
  "bottomEnd",
  "none",
];
const rowSelectionTypes: RowSelectionType[] = ["checkbox", "radio"];
const columnFilterModes: ColumnFilterModeType[] = ["menu", "tree"];
const filterValueTypes = ["(string | number | bigint | boolean)[]", "null"] as const;
const tableScrollAligns: TableScrollAlignType[] = ["start", "center", "end", "nearest"];

const tableApi = `
### Table

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`dataSource\` | 표에 표시할 데이터 배열이에요. | \`T[]\` | \`[]\` |
| \`columns\` | 열의 제목, 데이터, 정렬과 필터 등을 설정해요. | [\`ColumnsType<T>\`](#columnstype) | \`[]\` |
| \`rowKey\` | 각 행을 구분할 데이터 필드를 설정해요. | \`keyof T\` | \`id\` |
| \`pagination\` | 페이지네이션을 설정하거나 숨겨요. | \`false \\|\` [\`PaginationConfig\`](#paginationconfig) | \`{}\` |
| \`rowSelection\` | 체크박스나 라디오 행 선택을 설정해요. | [\`RowSelection<T>\`](#rowselection) | - |
| \`rowDrag\` | 행 드래그 정렬과 순서 변경 함수를 설정해요. | \`boolean \\|\` [\`RowDragConfig<T>\`](#rowdragconfig) | \`false\` |
| \`columnDrag\` | 열 드래그 정렬과 순서 변경 함수를 설정해요. | \`boolean \\|\` [\`ColumnDragConfig<T>\`](#columndragconfig) | \`false\` |
| \`expandable\` | 확장 행과 트리 데이터를 설정해요. | [\`ExpandableConfig<T>\`](#expandableconfig) | - |
| \`bordered\` | 셀 사이의 테두리를 표시해요. | \`boolean\` | \`false\` |
| \`loading\` | 로딩 오버레이와 안내 문구를 설정해요. | \`boolean \\|\` [\`TableLoadingConfig\`](#tableloadingconfig) | \`false\` |
| \`size\` | 행의 높이와 셀 여백을 설정해요. | [\`TableSizeType\`](#table-size-type) | \`lg\` |
| \`locale\` | 빈 상태, 필터, 정렬, 선택 문구를 바꿔요. | [\`TableLocale\`](#tablelocale) | - |
| \`showHeader\` | 열 헤더를 표시하거나 숨겨요. | \`boolean\` | \`true\` |
| \`showSorterTooltip\` | 정렬 아이콘의 Tooltip 표시 여부를 설정해요. | \`boolean\` | \`true\` |
| \`rowHoverable\` | 행에 마우스를 올렸을 때 배경을 표시해요. | \`boolean\` | \`true\` |
| \`stickyHeader\` | 테이블 헤더를 화면 상단에 고정해요. | \`boolean\` | \`false\` |
| \`stickyHeaderOffset\` | 고정 헤더를 화면 상단에서 이동해요. | \`number\` | \`0\` |
| \`virtual\` | 많은 행을 가상 스크롤로 렌더링해요. | \`boolean\` | \`false\` |
| \`stickyScrollBar\` | 가로 스크롤바를 화면 아래에 고정해요. | \`boolean\` | \`false\` |
| \`stickyScrollBarOffset\` | 고정 스크롤바를 화면 하단에서 이동해요. | \`number\` | \`0\` |
| \`scroll\` | 가로·세로 스크롤 크기를 설정해요. | \`{ x?, y? }\` | - |
| \`className\` | 외부에서 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`onChange\` | 변경 상태가 있을 때 실행할 함수예요. | \`(pagination, filters, sorter) => void\` | - |
| \`onRow\` | 각 데이터 행에 전달할 HTML 속성을 반환해요. | \`(record, index) => HTMLAttributes\` | - |
| \`onHeaderRow\` | 헤더 행에 전달할 HTML 속성을 반환해요. | \`(columns, index) => HTMLAttributes\` | - |
| \`onScroll\` | 본문을 스크롤할 때 실행할 함수예요. | \`UIEventHandler<HTMLDivElement>\` | - |
`;

const columnApi = `
### ColumnsType

columns 배열의 각 항목에 아래 속성을 설정할 수 있어요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 열을 구분하는 고유한 값이에요. | \`Key\` | - |
| \`title\` | 헤더에 표시할 제목이에요. | \`ReactNode\` | - |
| \`dataIndex\` | 데이터에서 셀 값을 읽을 경로예요. | \`string \\| number \\| (string \\| number)[]\` | - |
| \`width\` | leaf 열 너비를 px로 고정해요. | \`number\` | - |
| \`minWidth\` | leaf 열의 최소 너비를 px로 설정해요. | \`number\` | - |
| \`align\` | 헤더와 셀의 가로 정렬을 설정해요. | [\`ColumnAlignType\`](#column-align-type) | \`left\` |
| \`hidden\` | 열을 화면에서 숨겨요. | \`boolean\` | \`false\` |
| \`fixed\` | 열을 왼쪽이나 오른쪽에 고정해요. | [\`ColumnFixedType\`](#column-fixed-type) | - |
| \`ellipsis\` | 긴 셀을 말줄임과 Tooltip으로 표시해요. | \`boolean\` | \`false\` |
| \`responsive\` | 지정한 화면 너비에서만 열을 표시해요. | [\`BreakpointType[]\`](#breakpoint-type) | - |
| \`className\` | 열의 셀에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`render\` | 셀 값을 원하는 콘텐츠로 렌더링해요. | \`(value, record, index) => ReactNode\` | - |
| \`sortOrder\` | 현재 정렬 순서를 외부 상태로 제어해요. | [\`SortOrderType\`](#sort-order-type) | - |
| \`defaultSortOrder\` | 처음 적용할 정렬 순서를 설정해요. | [\`SortOrderType\`](#sort-order-type) | - |
| \`showSorterTooltip\` | 정렬 아이콘의 Tooltip 표시 여부를 설정해요. | \`boolean\` | - |
| \`filters\` | 필터 메뉴에 표시할 항목을 설정해요. | [\`FilterItem[]\`](#filteritem) | - |
| \`filterOnClose\` | 필터 메뉴가 닫힐 때 선택값을 적용해요. | \`boolean\` | \`true\` |
| \`filterMultiple\` | 여러 필터 값을 선택할 수 있게 해요. | \`boolean\` | \`true\` |
| \`filteredValue\` | 선택된 필터 값을 외부 상태로 제어해요. | [\`FilterValueType\`](#filter-value-type) | - |
| \`defaultFilteredValue\` | 처음 선택할 필터 값을 설정해요. | [\`FilterValueType\`](#filter-value-type) | - |
| \`filterMode\` | 필터 항목을 메뉴나 트리로 표시해요. | [\`ColumnFilterModeType\`](#column-filter-mode-type) | \`menu\` |
| \`filterSearch\` | 필터 항목 검색 기능을 설정해요. | \`boolean\` | \`false\` |
| \`filterResetToDefault\` | 초기화할 때 기본 필터 값으로 돌아가요. | \`boolean\` | \`false\` |
| \`sorter\` | 로컬·다중·서버 정렬 방식을 설정해요. | \`boolean \\| function \\|\` [\`SorterConfig<T>\`](#sorterconfig) | - |
| \`children\` | 하위 열을 그룹 헤더로 묶어요. | [\`ColumnsType<T>\`](#columnstype) | - |
| \`onFilter\` | 선택한 필터 값에 포함되는 행인지 결정해요. | \`(value, record) => boolean\` | - |
| \`onCell\` | 각 본문 셀에 전달할 HTML 속성을 반환해요. | \`(record, rowIndex) => TdHTMLAttributes\` | - |
| \`onHeaderCell\` | 헤더 셀에 전달할 HTML 속성을 반환해요. | \`(column, index) => ThHTMLAttributes\` | - |
`;

const paginationApi = `
### PaginationConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`page\` | 현재 페이지를 외부 상태로 제어해요. | \`number\` | - |
| \`defaultPage\` | 처음 표시할 페이지를 설정해요. | \`number\` | \`1\` |
| \`pageSize\` | 페이지당 행 수를 외부 상태로 제어해요. | \`number\` | - |
| \`defaultPageSize\` | 처음 표시할 페이지당 행 수를 설정해요. | \`number\` | \`10\` |
| \`total\` | 전체 데이터 개수를 지정해요. | \`number\` | 데이터 개수 |
| \`placement\` | 페이지네이션을 표시할 위치를 설정해요. | [\`PaginationPlacementType[]\`](#pagination-placement-type) | \`[bottomEnd]\` |
| \`disabled\` | 모든 페이지 이동 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`hideOnSinglePage\` | 한 페이지만 있으면 페이지네이션을 숨겨요. | \`boolean\` | \`false\` |
| \`pageSizeOptions\` | 선택할 수 있는 페이지당 행 수 목록이에요. | \`(string \\| number)[]\` | \`[10, 20, 50]\` |
| \`showQuickJumper\` | 페이지 번호를 직접 입력하는 기능을 표시해요. | \`boolean\` | \`false\` |
| \`showSizeChanger\` | 페이지당 행 수 선택기를 표시해요. | \`boolean\` | 50개 이상 \`true\` |
| \`simple\` | 간결한 페이지네이션으로 표시해요. | \`boolean\` | \`false\` |
| \`size\` | 페이지네이션의 크기를 설정해요. | [\`TableSizeType\`](#table-size-type) | \`md\` |
| \`showTotal\` | 전체 개수와 현재 범위를 표시해요. | \`(total, range) => ReactNode\` | - |
| \`onChange\` | 페이지 정보가 바뀔 때 실행해요. | \`(page, pageSize) => void\` | - |
`;

const selectionApi = `
### RowSelection

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`type\` | 여러 행 또는 한 행 선택 방식을 설정해요. | [\`RowSelectionType\`](#row-selection-type) | \`checkbox\` |
| \`checkStrictly\` | 트리의 부모와 자식 선택을 서로 분리해요. | \`boolean\` | \`true\` |
| \`selectedKeys\` | 선택된 행 키를 외부 상태로 제어해요. | \`Key[]\` | - |
| \`defaultSelectedKeys\` | 처음 선택할 행 키를 설정해요. | \`Key[]\` | \`[]\` |
| \`preserveSelectedKeys\` | 데이터에서 사라진 행의 선택 키도 유지해요. | \`boolean\` | \`false\` |
| \`columnWidth\` | 선택 열의 너비를 px로 설정해요. | \`number\` | \`48\` |
| \`fixed\` | 가로 스크롤 중 선택 열을 왼쪽에 고정해요. | \`boolean\` | \`false\` |
| \`hideSelectAll\` | 헤더의 전체 선택 컨트롤을 숨겨요. | \`boolean\` | \`false\` |
| \`getCheckboxProps\` | 각 행의 선택 컨트롤 속성을 반환해요. | \`(record) => InputHTMLAttributes\` | - |
| \`onChange\` | 선택 상태가 바뀔 때 실행할 함수예요. | \`(keys, rows) => void\` | - |
`;

const rowDragApi = `
### RowDragConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`columnWidth\` | 드래그 핸들 열의 너비를 px로 설정해요. | \`number\` | \`48\` |
| \`onChange\` | 변경된 데이터와 이동 정보를 전달해요. | \`(records, info:\` [\`RowDrag\`](#rowdrag) \`) => void\` | - |

### RowDrag

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`activeKey\` | 원래 위치 행의 키예요. | \`Key\` | - |
| \`overKey\` | 도착한 위치 행의 키예요. | \`Key\` | - |
| \`activeIndex\` | 원래 위치 행의 인덱스예요. | \`number\` | - |
| \`overIndex\` | 도착한 위치 행의 인덱스예요. | \`number\` | - |
`;

const columnDragApi = `
### ColumnDragConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`onChange\` | 변경된 열과 이동 정보를 전달해요. | \`(columns, info:\` [\`ColumnDrag\`](#columndrag) \`) => void\` | - |

### ColumnDrag

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`activeKey\` | 이동한 열의 키예요. | \`Key\` | - |
| \`overKey\` | 놓은 위치에 있던 열의 키예요. | \`Key\` | - |
| \`activeIndex\` | 이동 전 열 인덱스예요. | \`number\` | - |
| \`overIndex\` | 이동할 열 인덱스예요. | \`number\` | - |
`;

const expandableApi = `
### ExpandableConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`childrenColumnName\` | 트리 자식 데이터를 읽을 속성 이름이에요. | \`string\` | \`children\` |
| \`columnTitle\` | 확장 열의 헤더 내용을 설정해요. | \`ReactNode\` | - |
| \`columnWidth\` | 확장 열의 너비를 px로 설정해요. | \`number\` | \`48\` |
| \`defaultExpandAllRows\` | 처음에 모든 확장 가능한 행을 펼쳐요. | \`boolean\` | \`false\` |
| \`defaultExpandedKeys\` | 처음 펼칠 행 키를 설정해요. | \`Key[]\` | \`[]\` |
| \`expandedKeys\` | 펼쳐진 행 키를 외부 상태로 제어해요. | \`Key[]\` | - |
| \`expandRowByClick\` | 행 전체를 눌러 펼치고 접을 수 있게 해요. | \`boolean\` | \`false\` |
| \`fixed\` | 가로 스크롤 중 확장 열을 왼쪽에 고정해요. | \`boolean\` | \`false\` |
| \`showExpandColumn\` | 전용 확장 열을 표시하거나 숨겨요. | \`boolean\` | \`true\` |
| \`expandedRowRender\` | 행 아래에 표시할 상세 콘텐츠를 반환해요. | \`(record, index) => ReactNode\` | - |
| \`rowExpandable\` | 각 행을 펼칠 수 있는지 결정해요. | \`(record) => boolean\` | - |
| \`onExpand\` | 하나의 행을 펼치거나 접을 때 실행할 함수예요. | \`(expanded: boolean, record) => void\` | - |
| \`onExpandedRowsChange\` | 펼쳐진 행 키가 바뀔 때 실행할 함수예요. | \`(keys: Key[]) => void\` | - |
`;

const supportingApi = `
### TableLoadingConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`spinning\` | 로딩 오버레이 표시 여부를 설정해요. | \`boolean\` | \`true\` |
| \`text\` | 로딩 아이콘 옆에 안내 문구를 표시해요. | \`ReactNode\` | - |
| \`delay\` | 지정한 시간 뒤에 로딩 오버레이를 표시해요. | \`number\` | \`0\` |

### TableLocale

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`filterConfirm\` | 필터 적용 버튼의 내용을 설정해요. | \`ReactNode\` | \`확인\` |
| \`filterReset\` | 필터 초기화 버튼의 내용을 설정해요. | \`ReactNode\` | \`초기화\` |
| \`filterEmptyText\` | 필터 항목이 없을 때 표시할 내용을 설정해요. | \`ReactNode\` | \`검색결과가 없어요\` |
| \`filterPlaceholder\` | 필터 검색 입력의 안내 문구를 설정해요. | \`string\` | \`키워드를 입력해요\` |
| \`emptyText\` | 데이터가 없을 때 표시할 내용을 설정해요. | \`ReactNode\` | \`검색결과가 없어요\` |
| \`triggerDesc\` | 내림차순 정렬 동작의 안내 문구를 설정해요. | \`string\` | \`내림차순 정렬\` |
| \`triggerAsc\` | 오름차순 정렬 동작의 안내 문구를 설정해요. | \`string\` | \`오름차순 정렬\` |
| \`cancelSort\` | 정렬 해제 동작의 안내 문구를 설정해요. | \`string\` | \`정렬 해제\` |

### TableRef

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`nativeElement\` | Table 최상위 div 요소예요. | \`HTMLDivElement \\| null\` | - |
| \`scrollTo\` | top, index 또는 key로 본문을 스크롤해요. | \`({ top?, index?, key?, offset?, align?:\` [\`TableScrollAlignType\`](#table-scroll-align-type) \`}) => void\` | - |

### FilterItem

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`text\` | 필터 메뉴에 표시할 내용이에요. | \`ReactNode\` | - |
| \`value\` | 필터 선택과 onFilter에 전달할 값이에요. | \`string \\| number \\| bigint \\| boolean\` | - |
| \`children\` | 하위 필터를 묶어 tree 구조를 만들어요. | [\`FilterItem[]\`](#filteritem) | - |

### SorterConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`compare\` | 두 행을 비교해 정렬 순서를 결정해요. | \`(a, b, sortOrder?) => number\` | - |
| \`multiple\` | 다중 정렬의 우선순위를 설정해요. | \`number\` | - |

`;

type StoryModule = Record<string, StoryObj>;

const storyGroups = [
  {
    id: "components-table-api-compatibility",
    module: apiStories,
    stories: [
      "GroupedHeaders",
      "Headerless",
      "StickyScrollbar",
      "StickyOffsets",
      "Loading",
      "Empty",
    ],
  },
  {
    id: "components-table-api-compatibility",
    module: apiStories,
    stories: ["FixedTableHeight", "StickyHeader", "FixedColumns"],
  },
  {
    id: "components-table-layout",
    module: layoutStories,
    stories: ["VirtualThousandRows"],
  },
  {
    id: "components-table-api-compatibility",
    module: apiStories,
    stories: ["ImperativeScrollTo"],
  },
  {
    id: "components-table-expandable",
    module: expandableStories,
    stories: ["ExpandedRow", "ExpandByRowClick", "TreeData", "EligibleRows"],
  },
  {
    id: "components-table-selection",
    module: selectionStories,
    stories: ["AssociatedTreeSelection"],
  },
  {
    id: "components-table-layout",
    module: layoutStories,
    stories: ["ResponsiveColumns", "MergedRows"],
  },
  {
    id: "components-table-pagination",
    module: paginationStories,
    stories: [
      "Pagination",
      "PaginationPageControls",
      "ControlledPagination",
      "PaginationPlacement",
      "PaginationSimple",
      "PaginationDisabled",
      "PaginationHideOnSinglePage",
    ],
  },
  {
    id: "components-table-sorting-filtering",
    module: sortingFilteringStories,
    stories: ["ServerTable"],
  },
] as const;

const storyName = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
const storyId = (groupId: string, name: string) =>
  `${groupId}--${name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;

function TableTypeCode({ value }: { value: string | null }) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {String(value)}
    </code>
  );
}

function TableTypes() {
  return (
    <>
      <h2 className="component-docs-types-heading">Types</h2>
      <h3 id="table-size-type">TableSizeType</h3>
      <p>Table과 Pagination의 크기를 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {tableSizes.map((size) => (
          <TableTypeCode key={size} value={size} />
        ))}
      </div>
      <h3 id="column-align-type">ColumnAlignType</h3>
      <p>헤더와 셀의 가로 정렬을 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {columnAligns.map((align) => (
          <TableTypeCode key={align} value={align} />
        ))}
      </div>
      <h3 id="column-fixed-type">ColumnFixedType</h3>
      <p>가로 스크롤 중 열을 고정할 방향을 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {columnFixedSides.map((side) => (
          <TableTypeCode key={side} value={side} />
        ))}
      </div>
      <h3 id="sort-order-type">SortOrderType</h3>
      <p>열의 정렬 방향이나 정렬하지 않는 상태를 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {sortOrders.map((order) => (
          <TableTypeCode key={String(order)} value={order} />
        ))}
      </div>
      <h3 id="breakpoint-type">BreakpointType</h3>
      <p>열을 표시할 반응형 화면 너비를 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {breakpoints.map((breakpoint) => (
          <TableTypeCode key={breakpoint} value={breakpoint} />
        ))}
      </div>
      <h3 id="pagination-placement-type">PaginationPlacementType</h3>
      <p>Table을 기준으로 Pagination이 표시될 위치를 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {paginationPlacements.map((placement) => (
          <TableTypeCode key={placement} value={placement} />
        ))}
      </div>
      <h3 id="row-selection-type">RowSelectionType</h3>
      <p>여러 행 또는 한 행을 선택할 방식을 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {rowSelectionTypes.map((type) => (
          <TableTypeCode key={type} value={type} />
        ))}
      </div>
      <h3 id="column-filter-mode-type">ColumnFilterModeType</h3>
      <p>필터 항목을 표시할 방식을 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {columnFilterModes.map((mode) => (
          <TableTypeCode key={mode} value={mode} />
        ))}
      </div>
      <h3 id="filter-value-type">FilterValueType</h3>
      <p>선택된 필터 값의 배열이나 선택값이 없는 상태예요.</p>
      <div className="flex flex-wrap gap-2">
        {filterValueTypes.map((value) => (
          <TableTypeCode key={value} value={value} />
        ))}
      </div>
      <h3 id="table-scroll-align-type">TableScrollAlignType</h3>
      <p>scrollTo로 이동한 행을 스크롤 영역에 맞출 위치를 선택해요.</p>
      <div className="flex flex-wrap gap-2">
        {tableScrollAligns.map((align) => (
          <TableTypeCode key={align} value={align} />
        ))}
      </div>
    </>
  );
}

function DocsPage({ api }: { api: string }) {
  return (
    <div className="table-docs component-docs">
      <Title />
      <Description />
      <Stories />
      {storyGroups.flatMap((group) =>
        group.stories.map((name) => {
          const id = storyId(group.id, name);
          const story = (group.module as StoryModule)[name];

          return (
            <div key={id} className="mt-8">
              <h3>{story.name ?? storyName(name)}</h3>
              <p className="component-story-description">
                {storyDescriptions[id].split("\n").map((line, index) => (
                  <span
                    key={`${index}-${line}`}
                    className={
                      index > 0
                        ? `component-story-description-detail${line.startsWith("xs 0px") ? "story-description-detail-same-color" : ""}`
                        : undefined
                    }
                  >
                    {line}
                  </span>
                ))}
              </p>
              <Canvas of={story} meta={group.module} />
            </div>
          );
        }),
      )}
      <h2>API</h2>
      <Markdown>{api}</Markdown>
      <TableTypes />
    </div>
  );
}

export function TableRootDocsPage() {
  return (
    <DocsPage
      api={`${tableApi}\n${columnApi}\n${paginationApi}\n${selectionApi}\n${rowDragApi}\n${columnDragApi}\n${expandableApi}\n${supportingApi}`}
    />
  );
}
