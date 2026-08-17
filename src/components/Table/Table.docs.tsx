import { Canvas, Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import * as apiStories from "./Table.API.stories";
import * as expandableStories from "./Table.Expandable.stories";
import * as layoutStories from "./Table.Layout.stories";
import * as paginationStories from "./Table.Pagination.stories";
import * as selectionStories from "./Table.Selection.stories";
import * as sortingFilteringStories from "./Table.SortingFiltering.stories";

const tableApi = `
### Table

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`dataSource\` | 표에 표시할 데이터 배열이에요. | \`T[]\` | \`[]\` |
| \`columns\` | 열의 제목, 데이터, 정렬과 필터 등을 설정해요. | \`ColumnsType<T>\` | \`[]\` |
| \`rowKey\` | 각 행을 구분할 키 또는 키를 반환하는 함수예요. | \`keyof T \\| (record, index) => Key\` | \`key\` |
| \`pagination\` | 페이지네이션을 설정하거나 숨겨요. | \`false \\| PaginationConfig\` | - |
| \`rowSelection\` | 체크박스나 라디오 행 선택을 설정해요. | \`RowSelection<T>\` | - |
| \`rowDrag\` | 행 드래그 정렬과 순서 변경 함수를 설정해요. | \`boolean \\| RowDragConfig<T>\` | \`false\` |
| \`columnDrag\` | 열 드래그 정렬과 순서 변경 함수를 설정해요. | \`boolean \\| ColumnDragConfig<T>\` | \`false\` |
| \`expandable\` | 확장 행과 트리 데이터를 설정해요. | \`ExpandableConfig<T>\` | - |
| \`bordered\` | 셀 사이의 테두리를 표시해요. | \`boolean\` | \`false\` |
| \`loading\` | 로딩 오버레이와 안내 문구를 설정해요. | \`boolean \\| TableLoadingConfig\` | \`false\` |
| \`size\` | 행의 높이와 셀 여백을 설정해요. | \`large \\| medium \\| small\` | \`large\` |
| \`locale\` | 빈 상태, 필터, 정렬, 선택 문구를 바꿔요. | \`TableLocale\` | - |
| \`showHeader\` | 열 헤더를 표시하거나 숨겨요. | \`boolean\` | \`true\` |
| \`showSorterTooltip\` | 정렬 아이콘의 안내 문구를 설정해요. | \`boolean \\| SorterTooltipConfig\` | \`true\` |
| \`tableLayout\` | 브라우저의 표 레이아웃 계산 방식을 설정해요. | \`auto \\| fixed\` | \`fixed\` |
| \`rowHoverable\` | 행에 마우스를 올렸을 때 배경을 표시해요. | \`boolean\` | \`true\` |
| \`sticky\` | 페이지를 내려도 테이블 헤더를 화면 상단에 고정해요. | \`boolean\` | \`false\` |
| \`virtual\` | 많은 행을 가상 스크롤로 렌더링해요. | \`boolean\` | \`false\` |
| \`stickyScrollBar\` | 페이지를 내려도 가로 스크롤바가 화면 아래를 따라오게 해요. | \`boolean \\| { offsetScroll? }\` | \`false\` |
| \`scroll\` | 가로·세로 스크롤 크기와 이동 동작을 설정해요. | \`{ x?, y?, scrollToFirstRowOnChange? }\` | - |
| \`sortDirections\` | 표 전체의 정렬 순환 순서를 설정해요. | \`SortOrder[]\` | \`[ascend, descend, null]\` |
| \`className\` | 외부에서 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`rowClassName\` | 각 행에 적용할 Tailwind 클래스를 반환해요. | \`(record, index, indent) => string\` | - |
| \`getPopupContainer\` | 필터 팝업을 렌더링할 컨테이너를 반환해요. | \`(triggerNode) => HTMLElement\` | - |
| \`onChange\` | 페이지, 필터, 정렬 상태가 바뀔 때 실행할 함수예요. | \`(pagination, filters, sorter, extra) => void\` | - |
| \`onRow\` | 각 데이터 행에 전달할 HTML 속성을 반환해요. | \`(record, index) => HTMLAttributes\` | - |
| \`onHeaderRow\` | 헤더 행에 전달할 HTML 속성을 반환해요. | \`(columns, index) => HTMLAttributes\` | - |
| \`onScroll\` | 본문을 스크롤할 때 실행할 함수예요. | \`UIEventHandler<HTMLDivElement>\` | - |
`;

const columnApi = `
### Column

columns 배열의 각 항목에 아래 속성을 설정할 수 있어요.

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`key\` | 열을 구분하는 고유한 값이에요. | \`Key\` | - |
| \`title\` | 헤더에 표시할 제목이에요. | \`ReactNode \\| function\` | - |
| \`dataIndex\` | 데이터에서 셀 값을 읽을 경로예요. | \`string \\| number \\| (string \\| number)[]\` | - |
| \`width\` | 열의 너비를 설정해요. | \`string \\| number\` | - |
| \`minWidth\` | 남은 공간을 사용하는 열의 최소 너비를 설정해요. | \`number\` | - |
| \`align\` | 헤더와 셀의 가로 정렬을 설정해요. | \`left \\| center \\| right \\| AlignType\` | \`left\` |
| \`hidden\` | 열을 화면에서 숨겨요. | \`boolean\` | \`false\` |
| \`fixed\` | 가로 스크롤 중 열을 왼쪽이나 오른쪽에 고정해요. | \`boolean \\| left \\| right\` | \`false\` |
| \`ellipsis\` | 긴 셀 내용을 말줄임과 Tooltip으로 표시해요. | \`boolean\` | \`false\` |
| \`responsive\` | 지정한 화면 너비에서만 열을 표시해요. | \`Breakpoint[]\` | - |
| \`colSpan\` | 헤더가 차지할 열의 개수를 설정해요. | \`number\` | - |
| \`rowSpan\` | 헤더가 차지할 행의 개수를 설정해요. | \`number\` | - |
| \`rowScope\` | 행 헤더 셀의 scope를 설정해요. | \`row \\| rowgroup\` | - |
| \`className\` | 열의 셀에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`render\` | 셀 값을 원하는 콘텐츠로 렌더링해요. | \`(value, record, index) => ReactNode \\| RenderedCell\` | - |
| \`onCell\` | 각 본문 셀에 전달할 HTML 속성을 반환해요. | \`(record, rowIndex) => TdHTMLAttributes\` | - |
| \`onHeaderCell\` | 헤더 셀에 전달할 HTML 속성을 반환해요. | \`(column, index) => ThHTMLAttributes\` | - |
| \`shouldCellUpdate\` | 데이터가 바뀔 때 셀을 다시 그릴지 결정해요. | \`(record, previous) => boolean\` | - |
`;

const paginationApi = `
### PaginationConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`current\` | 현재 페이지를 외부 상태로 제어해요. | \`number\` | - |
| \`defaultCurrent\` | 처음 표시할 페이지를 설정해요. | \`number\` | \`1\` |
| \`pageSize\` | 페이지당 행 수를 외부 상태로 제어해요. | \`number\` | - |
| \`defaultPageSize\` | 처음 표시할 페이지당 행 수를 설정해요. | \`number\` | \`10\` |
| \`total\` | 전체 데이터 개수를 지정해요. | \`number\` | 데이터 개수 |
| \`placement\` | 페이지네이션을 표시할 위치를 설정해요. | \`PaginationPlacement[]\` | \`[bottomEnd]\` |
| \`align\` | 페이지네이션 내부 정렬을 설정해요. | \`start \\| center \\| end\` | \`end\` |
| \`disabled\` | 모든 페이지 이동 동작을 비활성화해요. | \`boolean\` | \`false\` |
| \`hideOnSinglePage\` | 한 페이지만 있으면 페이지네이션을 숨겨요. | \`boolean\` | \`false\` |
| \`pageSizeOptions\` | 선택할 수 있는 페이지당 행 수 목록이에요. | \`(string \\| number)[]\` | \`[10, 20, 50, 100]\` |
| \`showLessItems\` | 생략 기호 주변의 페이지 항목 수를 줄여요. | \`boolean\` | \`false\` |
| \`showPrevNextJumpers\` | 생략 구간의 이전·다음 점프 버튼을 표시해요. | \`boolean\` | \`true\` |
| \`showQuickJumper\` | 페이지 번호를 직접 입력하는 기능을 표시해요. | \`boolean \\| { goButton? }\` | \`false\` |
| \`showSizeChanger\` | 페이지당 행 수 선택기를 표시해요. | \`boolean \\| { disabled? }\` | 자동 |
| \`simple\` | 간결한 페이지네이션으로 표시해요. | \`boolean \\| { readOnly? }\` | \`false\` |
| \`size\` | 페이지네이션의 크기를 설정해요. | \`large \\| medium \\| small\` | \`medium\` |
| \`locale\` | 페이지네이션 안내 문구를 바꿔요. | \`PaginationLocale\` | - |
| \`classNames\` | 내부 영역별 Tailwind 클래스를 설정해요. | \`object \\| function\` | - |
| \`styles\` | 내부 영역별 인라인 스타일을 설정해요. | \`object \\| function\` | - |
| \`className\` | 페이지네이션 영역에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`showTotal\` | 전체 개수와 현재 범위를 표시할 콘텐츠를 반환해요. | \`(total, range) => ReactNode\` | - |
| \`onChange\` | 페이지나 페이지 크기가 바뀔 때 실행할 함수예요. | \`(page, pageSize) => void\` | - |
| \`onShowSizeChange\` | 페이지 크기가 바뀔 때 실행할 함수예요. | \`(current, size) => void\` | - |
`;

const selectionApi = `
### RowSelection

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`type\` | 여러 행 또는 한 행 선택 방식을 설정해요. | \`checkbox \\| radio\` | \`checkbox\` |
| \`checkStrictly\` | 트리의 부모와 자식 선택을 서로 분리해요. | \`boolean\` | \`true\` |
| \`selectedRowKeys\` | 선택된 행 키를 외부 상태로 제어해요. | \`Key[]\` | - |
| \`defaultSelectedRowKeys\` | 처음 선택할 행 키를 설정해요. | \`Key[]\` | \`[]\` |
| \`preserveSelectedRowKeys\` | 데이터에서 사라진 행의 선택 키도 유지해요. | \`boolean\` | \`false\` |
| \`columnWidth\` | 선택 열의 너비를 설정해요. | \`string \\| number\` | \`48\` |
| \`fixed\` | 가로 스크롤 중 선택 열을 고정해요. | \`FixedType\` | \`false\` |
| \`align\` | 선택 컨트롤의 가로 정렬을 설정해요. | \`left \\| center \\| right\` | \`center\` |
| \`hideSelectAll\` | 헤더의 전체 선택 컨트롤을 숨겨요. | \`boolean\` | \`false\` |
| \`getCheckboxProps\` | 각 행의 선택 컨트롤 속성을 반환해요. | \`(record) => InputHTMLAttributes\` | - |
| \`onChange\` | 선택 상태가 바뀔 때 실행할 함수예요. | \`(keys, rows, info) => void\` | - |
`;

const rowDragApi = `
### RowDragConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`columnWidth\` | 드래그 핸들 열의 너비를 설정해요. | \`string \\| number\` | \`48\` |
| \`onChange\` | 행 순서가 바뀔 때 변경된 데이터와 이동 정보를 전달해요. | \`(dataSource, info) => void\` | - |
`;

const columnDragApi = `
### ColumnDragConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`onChange\` | 열 순서가 바뀔 때 변경된 열과 이동 정보를 전달해요. | \`(columns, info) => void\` | - |
`;

const expandableApi = `
### ExpandableConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`childrenColumnName\` | 트리 자식 데이터를 읽을 속성 이름이에요. | \`string\` | \`children\` |
| \`columnTitle\` | 확장 열의 헤더 내용을 설정해요. | \`ReactNode\` | - |
| \`columnWidth\` | 확장 열의 너비를 설정해요. | \`string \\| number\` | \`48\` |
| \`defaultExpandAllRows\` | 처음에 모든 확장 가능한 행을 펼쳐요. | \`boolean\` | \`false\` |
| \`defaultExpandedRowKeys\` | 처음 펼칠 행 키를 설정해요. | \`Key[]\` | \`[]\` |
| \`expandedRowKeys\` | 펼쳐진 행 키를 외부 상태로 제어해요. | \`Key[]\` | - |
| \`expandRowByClick\` | 행 전체를 눌러 펼치고 접을 수 있게 해요. | \`boolean\` | \`false\` |
| \`fixed\` | 가로 스크롤 중 확장 열을 고정해요. | \`FixedType\` | \`false\` |
| \`indentSize\` | 트리 단계마다 적용할 들여쓰기 크기예요. | \`number\` | \`15\` |
| \`showExpandColumn\` | 전용 확장 열을 표시하거나 숨겨요. | \`boolean\` | \`true\` |
| \`expandedRowRender\` | 데이터 행 아래에 표시할 상세 콘텐츠를 반환해요. | \`(record, index, indent, expanded) => ReactNode\` | - |
| \`rowExpandable\` | 각 행을 펼칠 수 있는지 결정해요. | \`(record) => boolean\` | - |
| \`onExpand\` | 하나의 행을 펼치거나 접을 때 실행할 함수예요. | \`(expanded, record) => void\` | - |
| \`onExpandedRowsChange\` | 펼쳐진 행 키가 바뀔 때 실행할 함수예요. | \`(keys) => void\` | - |
`;

const sortingFilteringApi = `
### Column 정렬과 필터

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`sortOrder\` | 현재 정렬 순서를 외부 상태로 제어해요. | \`ascend \\| descend \\| null\` | - |
| \`defaultSortOrder\` | 처음 적용할 정렬 순서를 설정해요. | \`ascend \\| descend\` | - |
| \`sortDirections\` | 열의 정렬 순환 순서를 설정해요. | \`SortOrder[]\` | - |
| \`showSorterTooltip\` | 정렬 아이콘의 안내 문구를 설정해요. | \`boolean \\| SorterTooltipConfig\` | - |
| \`filtered\` | 필터 아이콘을 활성 상태로 표시해요. | \`boolean\` | \`false\` |
| \`filters\` | 필터 메뉴에 표시할 항목을 설정해요. | \`FilterItem[]\` | - |
| \`filterOnClose\` | 필터 메뉴가 닫힐 때 선택값을 적용해요. | \`boolean\` | \`true\` |
| \`filterMultiple\` | 여러 필터 값을 선택할 수 있게 해요. | \`boolean\` | \`true\` |
| \`filteredValue\` | 선택된 필터 값을 외부 상태로 제어해요. | \`FilterValue\` | - |
| \`defaultFilteredValue\` | 처음 선택할 필터 값을 설정해요. | \`FilterValue\` | - |
| \`filterMode\` | 필터 항목을 메뉴나 트리로 표시해요. | \`menu \\| tree\` | \`menu\` |
| \`filterSearch\` | 필터 항목 검색 기능을 설정해요. | \`boolean \\| function\` | \`false\` |
| \`filterResetToDefaultFilteredValue\` | 초기화할 때 기본 필터 값으로 돌아가요. | \`boolean\` | \`false\` |
| \`sorter\` | 로컬 비교 함수, 다중 정렬 우선순위 또는 서버 정렬을 설정해요. | \`boolean \\| function \\| SorterConfig\` | - |
| \`onFilter\` | 선택한 필터 값에 포함되는 행인지 결정해요. | \`(value, record) => boolean\` | - |
`;

type StoryModule = Record<string, StoryObj>;

const storyGroups = [
  {
    id: "components-table-api-compatibility",
    module: apiStories,
    stories: ["GroupedHeaders", "Headerless", "StickyScrollbar", "Loading", "Empty"],
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
    </div>
  );
}

export function TableRootDocsPage() {
  return (
    <DocsPage
      api={`${tableApi}\n${columnApi}\n${paginationApi}\n${selectionApi}\n${rowDragApi}\n${columnDragApi}\n${expandableApi}\n${sortingFilteringApi}`}
    />
  );
}
