/** Canvas와 Docs에서 각 Story가 무엇을 검증하는지 바로 알 수 있도록 제공하는 설명이다. */
export const storyDescriptions: Record<string, string> = {
  "components-button--variants":
    "여섯 가지 버튼 종류를 비교해요. ghost는 hover하면 tertiary 배경으로 바뀌어요.",
  "components-button--sizes": "화면과 작업 환경에 맞게 세 가지 버튼 크기를 선택할 수 있어요.",
  "components-button--states": "기본, 그림자, 비활성, 전체 너비 상태를 사용할 수 있어요.",
  "components-button--rounded":
    "rounded를 사용해 각 버튼 크기의 높이만큼 모서리를 둥글게 만들 수 있어요.",
  "components-button--icons": "버튼 이름의 앞뒤에 아이콘을 배치하거나 아이콘만 표시할 수 있어요.",
  "components-button--loading": "버튼을 클릭하면 기존 아이콘 자리에 로딩을 표시해요.",

  "components-checkbox--states":
    "기본, 오류, 비활성 상태의 모양과 선택 가능 여부를 비교할 수 있어요.",
  "components-checkbox--label":
    "체크박스 오른쪽에 레이블을 표시하거나 레이블 없이 사용할 수 있어요.",
  "components-radio--states": "기본, 오류, 비활성 상태의 모양과 선택 가능 여부를 비교할 수 있어요.",
  "components-radio--label": "라디오 오른쪽에 레이블을 표시하거나 레이블 없이 사용할 수 있어요.",
  "components-radio--group":
    "같은 name을 가진 라디오를 하나의 그룹으로 묶어 한 항목만 선택할 수 있어요.",

  "components-toggle--sizes": "화면과 작업 환경에 맞게 세 가지 Toggle 크기를 선택할 수 있어요.",
  "components-toggle--states": "꺼짐, 켜짐과 비활성 상태의 모양과 동작을 비교할 수 있어요.",
  "components-toggle--loading":
    "Toggle을 클릭하면 thumb 안에 로딩을 표시하고 작업이 끝난 뒤 상태를 바꿔요.",

  "components-input--sizes": "화면과 입력 환경에 맞게 세 가지 Input 크기를 선택할 수 있어요.",
  "components-input--widths": "기본 전체 너비와 px 단위 가로 길이를 설정할 수 있어요.",
  "components-input--variants": "기본, 채움, 테두리 없음과 밑줄 표현 방식을 선택할 수 있어요.",
  "components-input--states":
    "기본, 읽기 전용과 비활성 상태의 모양과 입력 가능 여부를 비교할 수 있어요.",
  "components-input--allowed-characters": "한글, 영어 또는 숫자만 입력하도록 제한할 수 있어요.",
  "components-input--password":
    "입력값을 비밀번호로 가리고 눈 아이콘을 눌러 표시 상태를 전환할 수 있어요.",
  "components-input--icons-and-count":
    "모든 표현 방식에 아이콘과 지우기 버튼을 추가하고 글자 수를 현재 값 또는 현재/최대 값으로 표시할 수 있어요.",
  "components-input--static-error":
    "errorMessage를 전달해 입력창 아래에 고정 오류 문구와 오류 상태를 표시해요.",
  "components-input--client-error":
    "레이블과 필수 표시를 추가하고 입력값을 클라이언트에서 검증해요.",
  "components-input--server-error":
    "비동기 validate로 서버 응답을 확인하고 반환된 오류 문구를 입력창 아래에 표시해요.",

  "components-textarea--sizes": "입력할 내용의 양에 맞게 세 가지 TextArea 크기를 선택할 수 있어요.",
  "components-textarea--widths": "기본 전체 너비와 px 단위 가로 길이를 설정할 수 있어요.",
  "components-textarea--variants": "기본 배경과 채움 배경의 테두리·배경 표현을 비교할 수 있어요.",
  "components-textarea--states":
    "기본, 읽기 전용과 비활성 상태의 모양과 입력 가능 여부를 비교할 수 있어요.",
  "components-textarea--allowed-characters": "한글, 영어 또는 숫자만 입력하도록 제한할 수 있어요.",
  "components-textarea--static-error":
    "errorMessage를 전달해 입력 영역 아래에 고정 오류 문구와 오류 상태를 표시해요.",
  "components-textarea--auto-size":
    "입력 내용에 따라 높이를 자동으로 늘리거나 최소·최대 행 사이로 제한해요.",
  "components-textarea--resize":
    "resize 설정에 따라 우측 하단 핸들로 입력 영역의 높이를 직접 조절할 수 있어요.",
  "components-textarea--count":
    "입력 영역 아래에 현재 글자 수만 표시하거나 최대 글자 수를 함께 표시할 수 있어요.",
  "components-textarea--client-error": "동기 validate로 입력값을 검사하고 오류를 표시해요.",
  "components-textarea--server-error":
    "비동기 validate로 서버 응답을 확인하고 반환된 오류 문구를 입력 영역 아래에 표시해요.",

  "components-select--sizes": "화면과 선택 환경에 맞게 세 가지 Select 크기를 선택할 수 있어요.",
  "components-select--widths": "기본 전체 너비와 px 단위 가로 길이를 설정할 수 있어요.",
  "components-select--variants": "기본 배경과 채움 배경의 테두리·배경 표현을 비교할 수 있어요.",
  "components-select--states":
    "기본, 읽기 전용과 비활성 상태의 모양과 선택 가능 여부를 비교할 수 있어요.",
  "components-select--multiple":
    "등록된 항목 중 여러 값을 선택하고 선택값을 Tag로 확인하거나 해제할 수 있어요.",
  "components-select--tags":
    "등록된 항목을 선택하거나 새로운 값을 직접 입력해 Tag로 추가할 수 있어요.",
  "components-select--tag-render": "tagRender로 선택된 Tag의 색상과 내용을 직접 구성할 수 있어요.",
  "components-select--option-colors":
    "SelectOption의 color로 선택된 기본 Tag의 색상을 설정할 수 있어요.",
  "components-select--label-and-error":
    "Select 위에 레이블과 필수 표시를 추가하고 아래에 오류 문구를 표시할 수 있어요.",
  "components-select--multiple-and-search":
    "기본·filled 입력창에서 그룹 항목을 검색하고 여러 값을 선택하거나 해제할 수 있어요.",
  "components-select--search":
    "Select에 검색어를 입력해 일치하는 항목만 드롭다운에 표시할 수 있어요.",
  "components-select--filter-option":
    "filterOption으로 검색어와 항목이 일치하는 조건을 직접 설정할 수 있어요.",
  "components-select--option-label-prop":
    "목록 레이블과 선택 영역에 표시할 항목 속성을 다르게 설정할 수 있어요.",
  "components-select--options-sort":
    "optionsSort로 드롭다운 항목을 원하는 기준과 순서로 정렬할 수 있어요.",
  "components-select--tags-separators":
    "직접 입력한 값을 쉼표 같은 구분자로 나눠 여러 Tag로 한 번에 추가할 수 있어요.",
  "components-select--selection-limits":
    "선택할 수 있는 최대 항목 수와 입력창에 표시할 최대 Tag 수를 각각 제한할 수 있어요.",
  "components-select--custom-rendering": "항목, 선택 레이블과 목록 아래 영역을 직접 구성해요.",
  "components-select--popup-width-and-placement":
    "Select를 기준으로 드롭다운의 너비와 위·아래 표시 위치를 설정할 수 있어요.",
  "components-select--loading-and-empty":
    "항목을 불러오는 동안 로딩을 표시하고 결과가 없을 때 안내 문구를 보여줘요.",
  "components-select--controlled-open-and-search":
    "open과 searchValue로 드롭다운 표시 상태와 검색어를 외부에서 함께 관리해요.",
  "components-select--virtual-list":
    "많은 항목 중 화면에 보이는 영역만 가상 렌더링해 목록을 부드럽게 탐색할 수 있어요.",
  "components-datepicker--sizes":
    "화면과 날짜 선택 환경에 맞게 두 가지 DatePicker 크기를 선택할 수 있어요.",
  "components-datepicker--widths": "기본 전체 너비와 px 단위 가로 길이를 설정할 수 있어요.",
  "components-datepicker--states":
    "기본, 읽기 전용과 비활성 상태의 모양과 선택 가능 여부를 비교할 수 있어요.",
  "components-datepicker--variants":
    "DatePicker의 배경과 테두리 표현 방식을 나란히 비교할 수 있어요.",
  "components-datepicker--label-and-error":
    "DatePicker 위에 레이블과 필수 표시를 추가하고 아래에 고정 오류 문구를 표시해요.",
  "components-datepicker--basic": "달력에서 날짜를 선택하고 선택값을 확인하거나 지울 수 있어요.",
  "components-datepicker--picker-types": "날짜, 월과 연도 중 필요한 선택 단위를 사용할 수 있어요.",
  "components-datepicker--range": "이어진 두 달력에서 시작일과 종료일을 순서대로 선택할 수 있어요.",
  "components-datepicker--date-limits":
    "고정된 날짜 범위와 조건을 이용해 선택할 수 없는 날짜를 설정해요.",
  "components-datepicker--format": "선택한 날짜를 원하는 문자열 형식으로 변환해 표시할 수 있어요.",
  "components-datepicker--presets":
    "자주 사용하는 날짜를 미리 등록해 달력에서 빠르게 선택할 수 있어요.",
  "components-datepicker--multiple":
    "하나의 달력에서 여러 날짜를 선택하고 선택한 날짜를 입력 영역에서 확인할 수 있어요.",
  "components-datepicker--controlled-multiple":
    "여러 날짜의 선택값을 문자열 배열로 외부에서 관리해요.",
  "components-datepicker--show-time-and-confirm":
    "날짜와 시간을 한 패널에서 선택하고 확인 버튼을 눌러 값을 반영할 수 있어요.",
  "components-datepicker--multiple-show-time":
    "여러 날짜와 시간을 함께 선택하고 입력 영역에서 확인해요.",
  "components-datepicker--time-formats": "시간을 시·분·초 또는 시·분 형식으로 표시해요.",
  "components-datepicker--use-12-hours":
    "24시간 형식과 오전·오후를 사용하는 12시간 형식을 비교해요.",
  "components-datepicker--time-limits": "시간 간격과 선택할 수 있는 업무 시간 범위를 설정해요.",
  "components-datepicker--custom-cell":
    "cellRender로 날짜 셀의 내용과 상태 표현을 목적에 맞게 구성할 수 있어요.",
  "components-datepicker--range-presets":
    "자주 사용하는 시작일과 종료일 조합을 미리 등록해 빠르게 선택할 수 있어요.",
  "components-datepicker--controlled-panel":
    "선택된 날짜와 달력에서 보고 있는 달을 각각 제어해 value와 pickerValue의 차이를 확인해요.",
  "components-datepicker--placements":
    "입력창을 기준으로 달력 패널이 열릴 네 가지 위치를 선택할 수 있어요.",

  "components-timepicker--sizes":
    "화면과 시간 선택 환경에 맞게 세 가지 TimePicker 크기를 선택할 수 있어요.",
  "components-timepicker--widths": "기본 전체 너비와 px 단위 가로 길이를 설정할 수 있어요.",
  "components-timepicker--states":
    "기본, 읽기 전용과 비활성 상태의 모양과 선택 가능 여부를 비교할 수 있어요.",
  "components-timepicker--variants":
    "TimePicker의 배경과 테두리 표현 방식을 나란히 비교할 수 있어요.",
  "components-timepicker--static-error":
    "TimePicker 위에 레이블과 필수 표시를 추가하고 아래에 고정 오류 문구를 표시해요.",
  "components-timepicker--basic":
    "목록에서 시·분·초를 선택하고 선택값을 확인하거나 지울 수 있어요.",
  "components-timepicker--format-and-steps":
    "12시간제, 시간 간격과 확인 버튼을 조합해 선택 방식을 설정할 수 있어요.",
  "components-timepicker--multiple":
    "시간을 여러 개 선택하고 입력창에서 각 선택값을 확인하거나 개별로 지울 수 있어요.",
  "components-timepicker--disabled-time":
    "disabledTime 조건에 맞는 시·분·초를 비활성화해 선택할 수 없게 해요.",
  "components-timepicker--hide-disabled":
    "비활성 시간 항목을 목록에 표시하거나 완전히 숨길 수 있어요.",
  "components-timepicker--show-now": "현재 시간 선택 버튼을 표시하거나 숨길 수 있어요.",
  "components-timepicker--custom-cell":
    "cellRender로 시간 항목의 내용과 상태 표현을 목적에 맞게 구성할 수 있어요.",
  "components-timepicker--preview-on-hover":
    "시간 항목에 마우스를 올려 확정 전의 선택값을 입력창에서 미리 확인할 수 있어요.",
  "components-timepicker--change-on-scroll":
    "시간 목록을 스크롤하는 즉시 선택값이 함께 변경되도록 설정할 수 있어요.",
  "components-timepicker--controlled":
    "value와 onChange로 선택 시간을 외부 상태에서 직접 관리할 수 있어요.",
  "components-timepicker--placements":
    "입력창을 기준으로 시간 패널이 열릴 네 가지 위치를 선택할 수 있어요.",

  "components-icon--icons":
    "비슷한 아이콘을 가까이 배치한 목록에서 이름으로 검색하고 outlined·filled 아이콘을 각각 확인할 수 있어요.",
  "components-icon--size-and-color": "사용 환경에 맞게 아이콘의 크기와 색상을 변경할 수 있어요.",
  "components-icon--clickable": "아이콘에 클릭 동작과 hover 피드백을 추가할 수 있어요.",
  "components-icon--loading":
    "아이콘을 클릭하면 기존 크기와 색상을 유지한 채 로딩 상태로 전환해요.",
  "components-icon--disabled": "아이콘의 클릭과 hover 동작을 비활성화할 수 있어요.",
  "components-tag--variants": "네 가지 표현 방식과 색상 조합을 비교할 수 있어요.",
  "components-tag--colors": "콘텐츠의 상태와 분류에 맞게 일곱 가지 Tag 색상을 선택할 수 있어요.",
  "components-tag--icons": "Tag의 앞뒤에 아이콘을 배치하고 클릭 동작을 연결할 수 있어요.",
  "components-label--sizes": "연결할 입력 컴포넌트에 맞게 세 가지 Label 크기를 선택할 수 있어요.",
  "components-label--required": "레이블 옆에 필수 입력을 나타내는 표시를 추가하거나 뺄 수 있어요.",
  "components-errormessage--message":
    "입력 컴포넌트 아래에 표시할 오류 문구를 전달하거나 숨길 수 있어요.",

  "components-breadcrumb--items": "상위 경로부터 현재 위치까지 각 항목을 순서대로 보여줘요.",
  "components-breadcrumb--with-icons": "각 항목에 아이콘을 더해 경로를 쉽게 구분할 수 있어요.",
  "components-breadcrumb--single-icon":
    "경로 이름 없이 아이콘만 사용해 간결한 이동 경로를 구성할 수 있어요.",
  "components-breadcrumb--item-colors": "각 항목의 글자와 아이콘에 원하는 색상을 적용할 수 있어요.",

  "components-tooltip--basic": "대상 요소에 마우스를 올리면 가까운 위치에 짧은 설명을 표시해요.",
  "components-tooltip--placements": "대상을 기준으로 열두 가지 위치에 설명을 배치할 수 있어요.",
  "components-tooltip--triggers":
    "hover, focus, click, contextMenu 중 하나를 선택하거나 여러 동작을 함께 사용할 수 있어요.",
  "components-tooltip--appearance": "배경 색상과 화살표 표시 여부를 변경할 수 있어요.",
  "components-popover--appearance": "배경 색상과 화살표 표시 여부를 변경할 수 있어요.",
  "components-tooltip--controlled": "open과 onOpenChange로 표시 상태를 직접 관리할 수 있어요.",

  "components-dropdown--basic":
    "대상에 마우스를 올리면 선택하거나 실행할 수 있는 작업 메뉴를 표시해요.",
  "components-dropdown--triggers":
    "hover, focus, click, contextMenu 중 메뉴를 표시할 동작을 하나 이상 선택할 수 있어요.",
  "components-dropdown--placements": "대상을 기준으로 열두 가지 위치에 메뉴를 배치할 수 있어요.",
  "components-dropdown--menu-items":
    "그룹, 아이콘, 구분선, 비활성, 위험 작업과 하위 메뉴를 구성할 수 있어요.",
  "components-dropdown--selectable": "메뉴가 처음 열릴 때 선택할 항목을 지정할 수 있어요.",
  "components-dropdown--multiple-selectable":
    "여러 메뉴 항목을 동시에 선택하고 선택된 값과 표시 상태를 관리할 수 있어요.",
  "components-dropdown--item-click": "항목마다 서로 다른 클릭 동작을 연결할 수 있어요.",
  "components-dropdown--arrow": "메뉴와 대상을 연결하는 화살표를 표시할 수 있어요.",
  "components-dropdown--disabled": "필요할 때 Dropdown 전체를 비활성화할 수 있어요.",
  "components-dropdown--controlled":
    "open과 onOpenChange로 메뉴 표시 상태를 직접 관리할 수 있어요.",

  "components-popover--basic": "요소에 마우스를 올리면 제목과 추가 내용을 표시해요.",
  "components-popover--placements": "대상을 기준으로 열두 가지 위치에 카드를 배치할 수 있어요.",
  "components-popover--triggers": "hover, focus, click, contextMenu 중 표시 동작을 설정해요.",
  "components-popover--actions": "카드 안에 설명과 실행 버튼을 함께 배치할 수 있어요.",
  "components-popover--controlled": "open과 onOpenChange로 카드 표시 상태를 직접 관리할 수 있어요.",

  "components-flex--basic": "방향, 정렬, 줄바꿈과 간격을 Controls에서 조절해보세요.",
  "components-flex--vertical":
    "vertical 설정에 따라 요소를 가로 또는 세로 방향으로 배치할 수 있어요.",
  "components-flex--wrap": "공간이 부족할 때 요소를 한 줄로 유지하거나 다음 줄로 배치할 수 있어요.",
  "components-flex--justify":
    "주축의 시작, 가운데, 끝과 요소 사이 간격을 기준으로 정렬할 수 있어요.",
  "components-flex--align":
    "교차축의 시작, 가운데, 끝과 기준선을 중심으로 요소를 정렬할 수 있어요.",
  "components-flex--flex": "각 요소가 남은 공간을 차지할 비율과 고정 너비를 함께 설정할 수 있어요.",
  "components-flex--gap": "요소 사이의 가로·세로 간격을 px 단위 숫자로 설정할 수 있어요.",
  "components-flex--component":
    "레이아웃은 유지하면서 최상위에 렌더링할 HTML 요소를 변경할 수 있어요.",

  "components-segmented--basic":
    "연관된 여러 선택지 중 하나를 선택하고 슬라이딩 표시로 빠르게 전환할 수 있어요.",
  "components-segmented--sizes": "화면 밀도에 맞는 세 가지 크기를 비교할 수 있어요.",
  "components-segmented--vertical": "항목을 세로 방향으로 배치할 수 있어요.",
  "components-segmented--full-width": "부모의 가로 길이를 모두 채우도록 설정할 수 있어요.",
  "components-segmented--icons-tooltip":
    "선택 항목에 아이콘을 표시하고 필요한 경우 Tooltip 설명을 함께 제공할 수 있어요.",
  "components-segmented--controlled":
    "value와 onChange를 사용해 현재 선택값을 외부 상태에서 직접 관리할 수 있어요.",

  "components-modal--basic":
    "버튼으로 Modal을 열고 본문을 확인한 뒤 작업을 실행하거나 취소할 수 있어요.",
  "components-modal--async": "비동기 작업이 끝날 때까지 확인 버튼을 로딩 상태로 표시해요.",
  "components-modal--footer": "footer의 콘텐츠와 기본 버튼을 함께 구성해요.",
  "components-modal--static-methods":
    "정적 메서드를 호출해 안내, 성공, 오류와 확인 용도의 Modal을 바로 열 수 있어요.",
  "components-modal--multiline":
    "여러 줄 제목과 내용에서 상태 아이콘이 첫 번째 줄 중앙에 맞춰지는 모습을 확인해요.",
  "components-modal--position-width":
    "Modal의 세로 위치와 화면 너비에 따른 반응형 가로 길이를 확인해요.",

  "components-drawer--basic":
    "버튼을 눌러 화면 가장자리에서 Drawer를 열고 내부 작업 후 닫을 수 있어요.",
  "components-drawer--placements":
    "화면의 위, 오른쪽, 아래와 왼쪽 중 원하는 방향에서 Drawer를 열 수 있어요.",
  "components-drawer--sizes": "기본, 큰 크기와 직접 지정한 Drawer 크기를 비교해요.",
  "components-drawer--resizable":
    "가로·세로 Drawer의 가장자리를 드래그하고 최소·최대 크기 제한을 확인해요.",
  "components-drawer--header-footer": "제목 옆 작업과 footer를 본문과 함께 구성해요.",
  "components-drawer--scrollable": "긴 본문만 스크롤하고 header와 footer는 고정된 상태로 유지해요.",
  "components-drawer--nested":
    "Drawer 안에서 하위 Drawer를 열면 부모 패널을 밀어내며 계층을 구분해요.",

  "components-message--basic": "설정한 내용으로 기본 정보 Message를 열어보세요.",
  "components-message--types":
    "정보, 성공, 경고, 오류와 로딩 상태에 맞는 전역 메시지를 화면에 표시해요.",
  "components-message--multiline":
    "여러 줄 내용에서 상태 아이콘이 첫 번째 줄 중앙에 맞춰지는 모습을 확인해요.",
  "components-message--duration": "메시지가 자동으로 닫히기까지의 시간을 비교해요.",
  "components-message--update": "같은 key의 로딩 메시지를 완료 메시지로 갱신해요.",
  "components-message--promise": "메시지가 닫힌 뒤 다음 메시지를 표시해요.",

  "components-notification--basic": "제목과 설명을 설정해 기본 Notification을 열어보세요.",
  "components-notification--types": "성공, 오류, 정보와 경고 상태의 알림을 비교해요.",
  "components-notification--multiline":
    "여러 줄 제목과 설명에서 상태 아이콘이 첫 번째 줄 중앙에 맞춰지는 모습을 확인해요.",
  "components-notification--actions": "알림 아래에 작업 버튼을 추가해 후속 동작을 실행해요.",
  "components-notification--placements":
    "화면의 상단과 하단을 기준으로 여섯 가지 위치에 알림을 표시할 수 있어요.",
  "components-notification--progress": "자동으로 닫히기까지 남은 시간을 진행 바로 표시해요.",
  "components-notification--update":
    "같은 key를 사용해 이미 열린 알림의 제목과 설명을 새 내용으로 갱신할 수 있어요.",

  "components-illustrations--types":
    "빈 화면, 오류와 완료 등 상태와 안내 목적에 맞는 열두 가지 이미지를 선택할 수 있어요.",
  "components-illustrations--sizes":
    "표시할 영역과 정보의 중요도에 맞게 세 가지 이미지 크기를 선택할 수 있어요.",

  "components-table--basic": "dataSource와 columns를 전달하는 가장 기본적인 사용법이에요.",
  "components-table--text-selection":
    "textSelectable=false로 셀 텍스트를 드래그해서 선택하거나 복사하지 못하게 해요.",
  "components-table--size":
    "화면에 표시할 데이터 밀도에 맞게 size로 행 높이와 셀 여백을 조절할 수 있어요.",
  "components-table--bordered": "모든 셀 경계를 표시하는 bordered 테이블이에요.",
  "components-table--alignment":
    "컬럼마다 왼쪽, 가운데와 오른쪽 정렬을 지정하고 셀의 배치를 비교할 수 있어요.",
  "components-table--ellipsis": "ellipsis로 컬럼 너비보다 긴 내용을 말줄임표로 표시해요.",
  "components-table--sorter":
    "비교 함수로 하나의 컬럼을 정렬하거나 multiple 우선순위로 여러 컬럼을 함께 정렬해요.",
  "components-table--filter":
    "트리 검색, 다중·단일 선택, 확인 시 적용과 기본값 복원을 컬럼별로 비교해요.",
  "components-table--checkbox": "여러 행을 선택하고 onChange로 선택한 key를 관리해요.",
  "components-table--checkbox-width": "columnWidth로 체크박스 컬럼의 가로 길이를 설정해요.",
  "components-table--checkbox-disabled": "getCheckboxProps로 특정 행의 체크박스를 비활성화해요.",
  "components-table--checkbox-fixed": "가로 스크롤 중 선택 체크박스 컬럼을 왼쪽에 고정해요.",
  "components-table--all-checkbox-hidden":
    "개별 행 선택은 유지하면서 헤더의 전체 선택 체크박스만 숨길 수 있어요.",
  "components-table--checkbox-default": "defaultSelectedKeys로 처음 선택된 행을 지정해요.",
  "components-table--radio": "하나의 행을 선택하고 onChange로 선택한 key를 관리해요.",
  "components-table--drag-row-sorting":
    "행을 드래그하거나 키보드로 이동하며 주변 행이 애니메이션으로 재배치돼요.",
  "components-table--drag-column-sorting":
    "헤더를 드래그해 열 순서를 변경하며 본문 셀 순서도 함께 갱신돼요.",

  "components-table-api-compatibility--grouped-headers":
    "columns의 children으로 여러 단계의 그룹 헤더를 만들어요.",
  "components-table-api-compatibility--headerless":
    "showHeader=false로 열 헤더를 숨기고 데이터만 표시해요.",
  "components-table-api-compatibility--fixed-table-height":
    "scroll.y로 테이블 본문의 최대 세로 높이를 정하고, 내용이 넘치면 본문 안에서 스크롤해요.",
  "components-table-api-compatibility--sticky-header":
    "stickyHeader=true로 페이지를 내려도 테이블 헤더가 화면 상단을 따라오게 해요.",
  "components-table-api-compatibility--fixed-columns":
    "이름은 왼쪽, 프로젝트는 오른쪽에 고정하고 가운데 열만 가로 스크롤해요.",
  "components-table-api-compatibility--sticky-scrollbar":
    "페이지를 상하로 이동해도 가로 스크롤바가 화면 아래를 따라와요.",
  "components-table-api-compatibility--sticky-offsets":
    "숫자를 입력해 고정 헤더와 가로 스크롤바의 위치를 조정해요.",
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
    "브라우저 너비에 따라 컬럼을 단계적으로 보여줘요.\nxs 0px / sm 640px / md 768px / lg 1024px / xl 1280px / xxl 1536px 이상이에요.",
  "components-table-layout--virtual-thousand-rows":
    "고정 높이 스크롤 영역에서 1,000개 행을 가상 렌더링해요.",
  "components-table-layout--merged-rows": "onCell의 rowSpan을 이용해 인접한 본문 셀을 병합해요.",
  "components-table-pagination--pagination":
    "숫자 페이지, 이전·다음 이동과 기본 페이지네이션을 사용해요.",
  "components-table-pagination--pagination-page-controls":
    "페이지당 행 수를 바꾸거나 번호를 직접 입력하고 현재 범위와 전체 건수를 확인해요.",
  "components-table-pagination--controlled-pagination":
    "외부 상태로 page와 pageSize를 제어하고 변경된 값을 onChange로 받아요.",
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

  "components-menu--basic": "같은 메뉴를 세로형과 인라인형으로 보여주고 차이를 비교해요.",
  "components-menu--collapsed":
    "인라인 메뉴를 접고 펼쳐 좁은 사이드바에서 사용하는 모습을 확인해요.",
  "components-menu--item-states":
    "그룹, 보조 정보, 비활성 항목, 구분선과 삭제 항목을 함께 보여줘요.",

  "components-tabs--basic": "탭을 선택해 연결된 콘텐츠를 전환하고 비활성 탭의 동작을 제한해요.",
  "components-tabs--sizes": "선형 탭의 sm, md와 lg 크기를 한 번에 비교해요.",
  "components-tabs--animate": "표시선과 콘텐츠가 부드럽게 이동하며 전환되는 모습을 확인해요.",
  "components-tabs--card": "카드 탭의 sm, md와 lg 크기를 한 번에 비교해요.",
  "components-tabs--on-add": "onAdd 함수로 원하는 탭을 추가하고 추가 버튼만 표시해요.",
  "components-tabs--on-delete": "onDelete setter로 탭을 삭제하고 닫기 버튼만 표시해요.",
  "components-tabs--on-add-and-delete":
    "onAdd 함수와 onDelete setter로 탭을 추가·삭제하고 두 버튼을 모두 표시해요.",
  "components-tabs--add-drag-delete":
    "card 탭을 추가·정렬·삭제하고 변경된 목록을 하나의 상태에 반영해요.",
  "components-tabs--draggable":
    "card 탭을 잡아 원하는 위치로 옮기고 변경된 순서를 상태에 반영해요.",
  "components-tabs--placements": "line과 card 탭을 top·end·bottom·start 위치별로 비교해요.",
  "components-tabs--centered": "탭 목록을 가로 영역의 가운데에 배치해요.",
  "components-tabs--controlled":
    "activeKey와 onChange로 활성 탭을 외부 상태 및 별도 버튼과 동기화해요.",

  "components-colorpicker--basic": "색상 패널에서 색조·채도·명도·투명도를 조절해요.",
  "components-colorpicker--states": "기본·읽기 전용·비활성 상태를 나란히 비교해요.",
  "components-colorpicker--allow-clear": "선택한 색상을 초기화 버튼으로 지울 수 있어요.",
  "components-colorpicker--sizes": "세 가지 트리거 크기를 나란히 비교해요.",
  "components-colorpicker--formats": "HEX·RGB·HSB 형식으로 색상 값을 표시하고 입력해요.",
  "components-colorpicker--transparency":
    "같은 색상의 서로 다른 투명도를 비교하고 패널에서 조절해요.",
  "components-colorpicker--presets":
    "자주 사용하는 브랜드·상태 색상을 그룹으로 등록해 빠르게 선택해요.",
  "components-colorpicker--triggers": "클릭 또는 hover로 색상 패널을 열어요.",
  "components-colorpicker--controlled": "value와 onChange로 선택 색상을 외부 상태에서 제어해요.",

  "components-upload--basic":
    "버튼으로 파일을 선택하고 업로드 전에 파일 목록과 제거 동작을 확인해요.",
  "components-upload--list-types":
    "listType의 text와 picture 목록이 파일을 어떻게 표시하는지 비교해요.",
  "components-upload--sortable-lists": "텍스트와 사진 목록의 핸들을 드래그해 파일 순서를 바꿔요.",
  "components-upload--drag-and-drop":
    "파일을 드래그해 추가하고 text와 picture 목록으로 표시되는 결과를 비교해요.",
  "components-upload--selection-rules":
    "PNG 파일만 여러 개 선택하고 최대 두 개까지 등록되는 제한을 확인해요.",
  "components-upload--directory": "폴더 단위로 여러 파일을 선택해 추가해요.",
  "components-upload--controlled-file-list": "fileList와 onChange로 파일 목록을 직접 제어해요.",

  "components-avatar--basic": "기본 아바타를 표시해요.",
  "components-avatar--sizes": "md와 lg 크기의 아바타를 비교해요.",
  "components-avatar--shapes": "원형과 사각형 아바타를 크기별로 비교해요.",
  "components-avatar--color": "배경색을 적용한 기본 아바타와 라벨 아바타를 비교해요.",
  "components-avatar--text": "여러 글자를 입력해도 아바타에는 첫 글자만 표시해요.",
  "components-avatar--label-text":
    "라벨 텍스트와 너비를 입력하고 지정한 영역을 넘는 텍스트의 말줄임을 확인해요.",
  "components-avatar--image": "이미지 아바타를 md와 lg 크기로 비교해요.",
  "components-avatar--image-preview":
    "기본형과 라벨형 아바타 이미지를 클릭해 크게 보고 확대·축소할 수 있어요.",
  "components-avatar--image-error":
    "이미지를 불러오지 못했을 때 두 가지 크기로 기본 사용자 아이콘을 표시해요.",
  "components-avatar--group":
    "여러 아바타를 겹쳐 표시하고 최대 개수를 넘는 사용자를 숫자로 요약해요.",

  "components-badge--basic": "상태, 텍스트와 애니메이션을 Controls에서 조절해보세요.",
  "components-badge--statuses": "성공, 처리 중, 기본, 오류와 경고 상태를 구분해요.",
  "components-badge--process": "상태 점이 퍼지는 애니메이션으로 진행 중인 상태를 강조해요.",

  "components-calendar--fullscreen":
    "월간 달력을 전체 너비로 표시하고 날짜와 이전·다음 달을 탐색해요.",
  "components-calendar--card": "작은 카드형 달력에서 날짜를 확인하고 선택해요.",
  "components-calendar--selection-rules":
    "선택 가능한 기간을 정하고 주말 날짜는 선택하지 못하게 해요.",
  "components-calendar--cell-render":
    "일정이 있는 날짜에 상태 배지와 일정 이름을 목록으로 표시해요.",
  "components-calendar--range-events":
    "시작일과 종료일을 연결해 여러 날짜에 걸친 일정을 막대로 표시해요.",
  "components-calendar--custom-header":
    "표시 중인 날짜와 변경 함수를 사용해 이전·다음 달 헤더를 만들어요.",

  "components-collapse--basic": "여러 패널을 독립적으로 열고 닫아요.",
  "components-collapse--accordion": "한 번에 하나의 패널만 펼쳐지는 아코디언을 사용해요.",
  "components-collapse--ghost": "배경과 테두리를 제거해 주변 콘텐츠에 자연스럽게 배치해요.",
  "components-collapse--borders": "테두리가 있는 패널과 없는 패널을 비교해요.",
  "components-collapse--sizes": "세 가지 크기의 패널 여백을 비교해요.",
  "components-collapse--collapsible": "헤더 전체, 아이콘 전용과 비활성 클릭 방식을 비교해요.",
  "components-collapse--header-and-icons":
    "추가 정보, 아이콘 위치와 아이콘을 숨긴 패널을 비교해요.",

  "components-image--basic":
    "이미지를 표시하고 클릭해 반전·회전·확대·축소하거나 드래그해 이동해요.",
  "components-image--cover": "hover 미리보기 안내의 표시 여부를 비교해요.",
  "components-image--dimensions": "width와 height로 자주 사용하는 이미지 크기를 비교해요.",
  "components-image--placeholder": "이미지를 불러오는 동안 같은 크기의 Image Skeleton을 보여줘요.",
  "components-image--group": "여러 이미지를 묶어 개수를 확인하고 이전·다음 이미지로 이동해요.",
  "components-image--preview-options": "미리보기를 끄거나 썸네일과 상세 이미지를 다르게 지정해요.",
  "components-image--preview-mask": "미리보기 배경 마스크를 표시하거나 숨긴 상태를 비교해요.",
  "components-image--controlled-preview":
    "버튼과 open 상태로 이미지 미리보기를 외부에서 열고 닫아요.",
  "components-image--fallback":
    "정상 원본 이미지와 로드 실패 후 fallback 이미지가 표시된 결과를 비교해요.",

  "components-tree--basic": "계층형 데이터를 펼치고 접으며 항목을 선택해요.",
  "components-tree--multiple": "여러 노드를 차례로 클릭해 동시에 선택하거나 해제해요.",
  "components-tree--disabled": "전체 Tree를 비활성화해 펼침, 선택과 체크 동작을 막아요.",
  "components-tree--full-width":
    "fullWidth로 노드의 선택, hover와 클릭 영역을 부모 너비 전체로 확장해요.",
  "components-tree--icons": "폴더와 파일 아이콘을 함께 표시해 항목 종류를 구분해요.",
  "components-tree--checkable": "체크박스로 부모와 자식 노드의 선택 상태를 함께 관리해요.",
  "components-tree--draggable":
    "defaultTreeData의 노드를 드래그하면 별도의 이동 함수 없이 내부에서 계층과 순서를 변경해요.",
  "components-tree--order-only-drop":
    "다른 노드의 자식으로 들어가는 것은 막고, 노드 위·아래로 순서를 바꾸는 것만 허용해요.",
  "components-tree--project-children-only":
    "노드 사이 이동은 허용하고 프로젝트(project) 노드만 새로운 자식을 받을 수 있어요.",
  "components-tree--design-children-only":
    "노드 사이 이동은 허용하고 디자인(design) 노드만 새로운 자식을 받을 수 있어요.",
  "components-tree--protected-releases":
    "릴리스(releases) 노드의 위, 안과 아래 위치에는 다른 노드를 놓을 수 없어요.",
  "components-tree--folder-drop-targets":
    "노드 사이 이동은 허용하고 프로젝트(project)와 보관함(archive) 노드만 새로운 자식을 받을 수 있어요.",
  "components-tree--async-loading":
    "노드를 처음 펼칠 때 하위 데이터를 불러오고 완료 후 목록에 표시해요.",
  "components-tree--controlled-state":
    "펼침, 선택과 체크 키를 외부 상태에서 제어하고 현재 값을 함께 확인해요.",
  "components-tree--custom-titles":
    "titleRender로 노드 제목에 종류를 나타내는 보조 정보를 함께 표시해요.",
  "components-skeleton--basic": "Node element의 크기와 모양을 정해 자리 표시자를 만들어요.",
  "components-skeleton--elements":
    "아바타, 버튼, 입력창, 이미지와 사용자 정의 영역에 맞는 단독 Skeleton을 사용해요.",
  "components-skeleton--active": "모든 Skeleton element에 애니메이션을 적용해요.",
  "components-skeleton--width": "모든 Skeleton element의 너비를 같은 값으로 변경해요.",
  "components-skeleton--height": "모든 Skeleton element의 높이를 같은 값으로 변경해요.",
  "components-skeleton--shape": "모든 Skeleton element의 모양을 함께 변경해요.",

  "components-table-sorting-filtering--server-table":
    "페이지, 페이지당 행 수, 정렬과 필터 조건을 onChange로 받아 서버 API 요청 파라미터로 사용해요.",
};
