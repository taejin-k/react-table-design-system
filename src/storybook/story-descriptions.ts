/** Canvas와 Docs에서 각 Story가 무엇을 검증하는지 바로 알 수 있도록 제공하는 설명이다. */
export const storyDescriptions: Record<string, string> = {
  "components-button--types": "작업의 중요도에 맞게 다섯 가지 버튼 타입을 선택할 수 있어요.",
  "components-button--sizes": "화면과 작업 환경에 맞게 세 가지 버튼 크기를 선택할 수 있어요.",
  "components-button--states": "기본, 그림자, 비활성, 전체 너비 상태를 사용할 수 있어요.",
  "components-button--icons": "버튼 이름의 앞뒤에 아이콘을 배치하거나 아이콘만 표시할 수 있어요.",

  "components-checkbox--states": "기본, 오류, 비활성 상태를 선택할 수 있어요.",
  "components-checkbox--label": "레이블을 추가하거나 뺄 수 있어요.",
  "components-radio--states": "기본, 오류, 비활성 상태를 선택할 수 있어요.",
  "components-radio--label": "레이블을 추가하거나 뺄 수 있어요.",
  "components-radio--group": "같은 그룹에서 하나의 항목을 선택할 수 있어요.",

  "components-toggle--sizes": "세 가지 Toggle 크기를 선택할 수 있어요.",
  "components-toggle--states": "켜짐과 비활성 상태를 선택할 수 있어요.",

  "components-input--sizes": "세 가지 Input 크기를 선택할 수 있어요.",
  "components-input--states": "기본, 채움, 비활성 상태를 선택할 수 있어요.",
  "components-input--label-and-error": "레이블, 필수 표시와 오류 문구를 추가할 수 있어요.",
  "components-input--icons-and-count":
    "아이콘과 지우기 버튼을 추가하고 글자 수를 현재 값 또는 현재/최대 값으로 표시할 수 있어요.",

  "components-textarea--sizes": "세 가지 TextArea 크기를 선택할 수 있어요.",
  "components-textarea--states": "기본, 채움, 읽기 전용, 비활성 상태를 비교해요.",
  "components-textarea--label-and-error": "레이블, 필수 표시와 오류 문구를 추가할 수 있어요.",
  "components-textarea--basic": "여러 줄의 내용을 입력할 수 있어요.",
  "components-textarea--auto-size": "입력 내용에 맞춰 최소·최대 행 사이에서 높이를 조절해요.",
  "components-textarea--clear": "지우기 버튼으로 입력 내용을 한 번에 비울 수 있어요.",
  "components-textarea--count": "현재 글자 수와 최대 글자 수를 표시할 수 있어요.",
  "components-textarea--custom-count": "글자 계산과 초과 처리 방식을 직접 설정할 수 있어요.",
  "components-textarea--controlled": "value와 onChange로 입력값을 외부에서 관리해요.",
  "components-textarea--blur-validation": "포커스가 빠질 때 입력값을 검증하고 오류를 표시해요.",

  "components-select--sizes": "세 가지 Select 크기를 선택할 수 있어요.",
  "components-select--states": "기본, 채움, 경고, 비활성 상태를 비교해요.",
  "components-select--label-and-error": "레이블, 필수 표시와 오류 문구를 추가할 수 있어요.",
  "components-select--basic": "목록에서 하나의 값을 선택할 수 있어요.",
  "components-select--multiple-and-search":
    "그룹 항목을 검색하고 여러 값을 선택하거나 해제할 수 있어요.",
  "components-select--search": "입력한 검색어와 일치하는 항목만 보여줘요.",
  "components-select--custom-search-and-sort": "검색 조건과 결과 정렬 방법을 설정해요.",
  "components-select--tags-and-token-separators": "새 태그를 입력하고 구분자로 여러 값을 추가해요.",
  "components-select--selection-limits": "선택 수와 화면에 표시할 태그 수를 제한해요.",
  "components-select--label-in-value": "선택값과 화면 레이블을 객체로 함께 관리해요.",
  "components-select--custom-rendering": "항목, 선택 레이블과 목록 아래 영역을 직접 구성해요.",
  "components-select--popup-width-and-placement": "목록의 너비와 표시 위치를 설정해요.",
  "components-select--loading-and-empty": "로딩 상태와 검색 결과가 없는 상태를 안내해요.",
  "components-select--controlled-open-and-search": "목록 표시와 검색어를 외부 상태로 관리해요.",
  "components-select--virtual-list": "많은 항목을 가상 목록으로 부드럽게 표시해요.",
  "components-select--field-names": "기존 데이터의 필드명을 Select 구조에 연결해요.",
  "components-select--custom-icons": "선택 영역과 태그, 항목의 아이콘을 변경해요.",

  "components-datepicker--sizes": "세 가지 DatePicker 크기를 선택할 수 있어요.",
  "components-datepicker--states": "기본, 채움, 경고, 비활성 상태를 비교해요.",
  "components-datepicker--label-and-error": "레이블, 필수 표시와 오류 문구를 추가할 수 있어요.",
  "components-datepicker--basic": "달력에서 날짜를 선택하거나 선택값을 지울 수 있어요.",
  "components-datepicker--picker-types": "날짜, 월, 연도 중 필요한 단위로 선택할 수 있어요.",
  "components-datepicker--range": "시작일과 종료일을 순서대로 선택할 수 있어요.",
  "components-datepicker--disabled-date": "조건에 맞는 날짜를 선택할 수 없게 설정해요.",
  "components-datepicker--format": "선택한 날짜를 원하는 문자열 형식으로 표시해요.",
  "components-datepicker--min-max-date": "선택할 수 있는 최소 날짜와 최대 날짜를 제한해요.",
  "components-datepicker--presets": "자주 사용하는 날짜를 빠르게 선택해요.",
  "components-datepicker--multiple": "하나의 달력에서 여러 날짜를 선택해요.",
  "components-datepicker--show-time-and-confirm": "날짜와 시간을 선택하고 확인할 때 값을 반영해요.",
  "components-datepicker--week-number": "달력 왼쪽에 주차 번호를 표시해요.",
  "components-datepicker--custom-cell": "날짜 셀의 내용을 목적에 맞게 구성해요.",
  "components-datepicker--extra-footer": "달력 아래에 추가 안내나 작업을 표시해요.",
  "components-datepicker--range-presets": "자주 사용하는 날짜 범위를 빠르게 선택해요.",
  "components-datepicker--controlled-panel": "달력 패널의 기준 날짜를 외부에서 관리해요.",
  "components-datepicker--placements": "달력을 대상의 네 방향에 배치할 수 있어요.",

  "components-timepicker--sizes": "세 가지 TimePicker 크기를 선택할 수 있어요.",
  "components-timepicker--states": "기본, 채움, 경고, 비활성 상태를 비교해요.",
  "components-timepicker--label-and-error": "레이블, 필수 표시와 오류 문구를 추가할 수 있어요.",
  "components-timepicker--basic": "목록에서 시·분·초를 선택하거나 선택값을 지울 수 있어요.",
  "components-timepicker--format-and-steps": "12시간제, 분 간격과 확인 버튼을 조합할 수 있어요.",
  "components-timepicker--range": "시작 시간과 종료 시간을 선택할 수 있어요.",
  "components-timepicker--disabled-time": "조건에 맞는 시·분·초를 선택할 수 없게 설정해요.",
  "components-timepicker--hide-disabled-options": "선택할 수 없는 시간 항목을 목록에서 숨겨요.",
  "components-timepicker--show-now-and-footer": "현재 시간 버튼과 목록 아래 내용을 설정해요.",
  "components-timepicker--custom-cell": "시간 항목의 표시 내용을 직접 구성해요.",
  "components-timepicker--preview-on-hover": "항목에 마우스를 올리면 선택 전 시간을 미리 보여줘요.",
  "components-timepicker--change-on-scroll": "시간 목록을 스크롤하며 값을 변경해요.",
  "components-timepicker--prefix-and-suffix": "선택 영역 앞뒤에 추가 내용을 표시해요.",
  "components-timepicker--controlled": "value와 onChange로 선택 시간을 외부에서 관리해요.",
  "components-timepicker--placements": "시간 목록을 대상의 네 방향에 배치할 수 있어요.",

  "components-icon--icons": "사용할 아이콘을 선택할 수 있어요.",
  "components-icon--size-and-color": "아이콘의 크기와 색상을 변경할 수 있어요.",
  "components-icon--clickable": "아이콘에 클릭 동작을 추가할 수 있어요.",
  "components-chip--variants": "세 가지 표현 방식을 선택할 수 있어요.",
  "components-chip--colors": "일곱 가지 Chip 색상을 선택할 수 있어요.",
  "components-chip--icons": "Chip의 앞뒤에 아이콘을 추가할 수 있어요.",
  "components-label--sizes": "세 가지 Label 크기를 선택할 수 있어요.",
  "components-label--required": "필수 표시를 추가하거나 뺄 수 있어요.",
  "components-errortext--message": "오류 문구를 추가하거나 뺄 수 있어요.",

  "components-breadcrumb--items": "상위 경로부터 현재 위치까지 각 항목을 순서대로 보여줘요.",
  "components-breadcrumb--with-icons": "각 항목에 아이콘을 더해 경로를 쉽게 구분할 수 있어요.",
  "components-breadcrumb--item-colors": "각 항목의 글자와 아이콘에 원하는 색상을 적용할 수 있어요.",

  "components-tooltip--basic": "요소에 마우스를 올리면 짧은 설명을 표시해요.",
  "components-tooltip--placements": "대상을 기준으로 열두 가지 위치에 설명을 배치할 수 있어요.",
  "components-tooltip--triggers": "hover, focus, click 중 표시 동작을 선택할 수 있어요.",
  "components-tooltip--appearance": "배경 색상과 화살표 표시 여부를 변경할 수 있어요.",
  "components-tooltip--controlled": "open과 onOpenChange로 표시 상태를 직접 관리할 수 있어요.",

  "components-dropdown--basic": "대상에 마우스를 올리면 작업 메뉴를 표시해요.",
  "components-dropdown--triggers": "hover, focus, click 중 메뉴를 표시할 동작을 선택할 수 있어요.",
  "components-dropdown--placements": "대상을 기준으로 열두 가지 위치에 메뉴를 배치할 수 있어요.",
  "components-dropdown--menu-items":
    "그룹, 아이콘, 구분선, 비활성, 위험 작업과 하위 메뉴를 구성할 수 있어요.",
  "components-dropdown--selectable": "메뉴가 처음 열릴 때 선택할 항목을 지정할 수 있어요.",
  "components-dropdown--multiple-selectable": "여러 메뉴 항목을 선택하고 선택 상태를 관리해요.",
  "components-dropdown--item-click": "항목마다 서로 다른 클릭 동작을 연결할 수 있어요.",
  "components-dropdown--arrow": "메뉴와 대상을 연결하는 화살표를 표시할 수 있어요.",
  "components-dropdown--disabled": "필요할 때 Dropdown 전체를 비활성화할 수 있어요.",
  "components-dropdown--controlled":
    "open과 onOpenChange로 메뉴 표시 상태를 직접 관리할 수 있어요.",

  "components-popover--basic": "요소에 마우스를 올리면 제목과 추가 내용을 표시해요.",
  "components-popover--placements": "대상을 기준으로 열두 가지 위치에 카드를 배치할 수 있어요.",
  "components-popover--triggers": "hover, focus, click 중 표시 동작을 선택할 수 있어요.",
  "components-popover--actions": "카드 안에 설명과 실행 버튼을 함께 배치할 수 있어요.",
  "components-popover--controlled": "open과 onOpenChange로 카드 표시 상태를 직접 관리할 수 있어요.",

  "components-illustrations--types": "상태와 안내 목적에 맞는 열두 가지 이미지를 선택할 수 있어요",
  "components-illustrations--sizes": "화면에 맞게 세 가지 이미지 크기를 선택할 수 있어요",

  "components-table--basic": "dataSource와 columns를 전달하는 가장 기본적인 사용법이에요.",
  "components-table--size": "size로 행 높이와 셀 여백을 조절해요.",
  "components-table--bordered": "모든 셀 경계를 표시하는 bordered 테이블이에요.",
  "components-table--alignment": "컬럼별 왼쪽, 가운데, 오른쪽 정렬을 비교해요.",
  "components-table--ellipsis": "ellipsis로 컬럼 너비보다 긴 내용을 말줄임표로 표시해요.",
  "components-table--sorter":
    "비교 함수로 하나의 컬럼을 정렬하거나 multiple 우선순위로 여러 컬럼을 함께 정렬해요.",
  "components-table--filter":
    "트리 검색, 다중·단일 선택, 확인 시 적용과 기본값 복원을 컬럼별로 비교해요.",
  "components-table--checkbox": "여러 행을 선택하고 onChange로 선택한 key를 관리해요.",
  "components-table--checkbox-width": "columnWidth로 체크박스 컬럼의 가로 길이를 설정해요.",
  "components-table--checkbox-disabled": "getCheckboxProps로 특정 행의 체크박스를 비활성화해요.",
  "components-table--checkbox-fixed": "가로 스크롤 중 선택 체크박스 컬럼을 왼쪽에 고정해요.",
  "components-table--all-checkbox-hidden": "헤더의 전체 선택 체크박스를 숨겨요.",
  "components-table--checkbox-default": "defaultSelectedRowKeys로 처음 선택된 행을 지정해요.",
  "components-table--radio": "하나의 행을 선택하고 onChange로 선택한 key를 관리해요.",
  "components-table--drag-row-sorting":
    "행을 드래그하거나 키보드로 이동하며 주변 행이 애니메이션으로 재배치돼요.",
  "components-table--drag-column-sorting":
    "헤더를 드래그해 열 순서를 변경하며 본문 셀 순서도 함께 갱신돼요.",

  "components-table-api-compatibility--grouped-headers":
    "columns의 children으로 여러 단계의 그룹 헤더를 만들어요.",
  "components-table-api-compatibility--headerless":
    "showHeader=false로 열 헤더를 숨기고 데이터만 표시해요.",
  "components-table-api-compatibility--fixed-header":
    "scroll.y로 본문의 세로 높이를 정하고 헤더를 상단에 고정해요.",
  "components-table-api-compatibility--fixed-columns":
    "이름은 왼쪽, 프로젝트는 오른쪽에 고정하고 가운데 열만 가로 스크롤해요.",
  "components-table-api-compatibility--sticky-scrollbar":
    "페이지를 상하로 이동해도 가로 스크롤바가 화면 아래를 따라와요.",
  "components-table-api-compatibility--loading":
    "데이터를 불러오는 동안 로딩 상태와 안내 문구를 표시해요.",
  "components-table-api-compatibility--empty":
    "locale.emptyText에 Illustrations를 전달해 데이터가 없을 때의 안내를 표시해요.",
  "components-table-api-compatibility--imperative-scroll-to":
    "Table ref의 scrollTo로 index나 key에 해당하는 가상 행으로 이동해요.",

  "components-table-expandable--expanded-row":
    "expandedRowRender로 각 데이터 행 아래에 상세 콘텐츠를 펼쳐요.",
  "components-table-expandable--tree-data":
    "children 기반 트리 행과 들여쓰기, 기본 전체 펼침을 사용해요.",
  "components-table-expandable--expand-by-row-click":
    "아이콘뿐 아니라 행 전체를 클릭해 상세 영역을 열고 닫아요.",
  "components-table-expandable--eligible-rows": "rowExpandable로 펼칠 수 있는 행을 제한해요.",

  "components-table-layout--responsive-columns":
    "브라우저 너비에 따라 컬럼을 단계적으로 보여줘요.\nxs 0px / sm 640px / md 768px / lg 1024px / xl 1280px / xxl 1536px 이상",
  "components-table-layout--virtual-thousand-rows":
    "고정 높이 스크롤 영역에서 1,000개 행을 가상 렌더링해요.",
  "components-table-layout--merged-rows": "onCell의 rowSpan을 이용해 인접한 본문 셀을 병합해요.",
  "components-table-pagination--pagination":
    "숫자 페이지, 이전·다음 이동과 기본 페이지네이션을 사용해요.",
  "components-table-pagination--pagination-page-controls":
    "페이지당 행 수를 바꾸거나 번호를 직접 입력하고 현재 범위와 전체 건수를 확인해요.",
  "components-table-pagination--pagination-placement":
    "같은 페이지네이션을 상단 시작점과 하단 끝점에 배치하고 상태를 동기화해요.",
  "components-table-pagination--pagination-simple":
    "현재 페이지 입력과 전체 페이지 수만 표시하는 simple 모드예요.",
  "components-table-pagination--pagination-disabled":
    "이동, 크기 변경, 빠른 이동을 모두 비활성화한 상태예요.",
  "components-table-pagination--pagination-hide-on-single-page":
    "한 페이지만 존재할 때 hideOnSinglePage로 페이지네이션을 숨겨요.",
  "components-table-selection--associated-tree-selection":
    "checkStrictly=false로 부모와 자식 선택 상태를 연동해요.",

  "components-table-sorting-filtering--server-table":
    "페이지, 페이지당 행 수, 정렬과 필터 조건을 onChange로 받아 서버 API 요청 파라미터로 사용해요.",
};
