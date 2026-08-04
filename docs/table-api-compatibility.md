# Table API 호환성 감사

기준: Ant Design **6.5.3**의 공식 Table/Pagination 문서와 공개 TypeScript 선언. Orbit Table은 antd 코드를 포함하거나 래핑하지 않으며, 익숙한 API 계약과 동작을 독립 구현한다.

- ✅ 동일 이름으로 구현 및 검증
- ◐ 일반 사용은 지원하지만 antd 하위 컴포넌트 전체 옵션까지는 지원하지 않음
- ⏸ 구현 보류 — 아래 이유와 판단 항목 참고

## Table

| API | antd | Orbit | 비고 |
| --- | --- | --- | --- |
| `dataSource`, `columns`, `column`, `rowKey` | ✅ | ✅ | `column` 공통 속성 및 열별 override 지원 |
| `bordered`, `size`, `showHeader`, `rowHoverable`, `tableLayout` | ✅ | ✅ | large/medium/small 토큰 일치 |
| `title`, `footer`, `summary` | ✅ | ✅ | 현재 페이지 데이터, `Table.Summary.Row/Cell`, summary `fixed` 지원 |
| `pagination` | ✅ | ✅ | 아래 Pagination 표 참고 |
| `rowSelection` | ✅ | ✅ | 아래 RowSelection 표 참고 |
| `expandable` | ✅ | ✅ | 아래 Expandable 표 참고 |
| `scroll.x`, `scroll.y`, `scrollToFirstRowOnChange` | ✅ | ✅ | `scroll.y`는 body 높이로 계산하며 header/summary 공간을 별도 확보 |
| `sticky` | ✅ | ◐ | 헤더와 summary offset 지원. sticky 가상 스크롤바의 `offsetScroll/getContainer`는 보류 |
| `virtual` | ✅ | ◐ | 고정 행 높이 windowing과 `scrollTo` 지원. 동적 행 높이 측정은 보류 |
| `loading` | Spin Props | ◐ | `spinning`, `delay`, `indicator`, `tip`, `className`, `style` 지원 |
| `locale` | ✅ | ✅ | 필터·정렬·선택·펼침·빈 상태 문구 지원 |
| `showSorterTooltip` | Tooltip Props | ◐ | boolean, title, target 지원. 별도 Tooltip 포털은 사용하지 않음 |
| `getPopupContainer` | ✅ | ✅ | 필터 메뉴 portal 및 위치 계산 지원 |
| `components` | ✅ | ✅ | table/header/body wrapper·row·cell 교체 지원 |
| `rowClassName`, `onRow`, `onHeaderRow`, `onScroll` | ✅ | ✅ | record/index/indent 및 DOM 이벤트 지원 |
| `classNames`, `styles` | 객체/함수 | ✅ | v6 semantic 객체/함수와 기존 flat alias 지원 |
| native root props | ✅ | ✅ | `style`, `aria-*`, `data-*`, DOM 이벤트를 root div에 전달 |
| `onChange` | ✅ | ✅ | pagination/filter/sorter/extra 반환 |
| ref `nativeElement`, `scrollTo` | ✅ | ✅ | index/key/top/offset/align 지원. virtual off-screen key도 계산 이동 |
| JSX `Table.Column`, `Table.ColumnGroup` | ✅ | ✅ | `columns` prop과 동일한 열 모델로 변환 |

## Column / ColumnGroup

| 영역 | antd API | Orbit |
| --- | --- | --- |
| 기본 | `key`, `title`, `dataIndex`, `width`, `minWidth`, `align`, `className`, `hidden` | ✅ |
| 레이아웃 | `fixed`, `ellipsis`, `responsive`, `colSpan`, `rowScope`, `children` | ✅ |
| 렌더링 | `render`, RenderedCell `{ children, props }`, `onCell`, `onHeaderCell`, `shouldCellUpdate` | ✅ |
| 정렬 | `sorter`, `sortOrder`, `defaultSortOrder`, `sortDirections`, `sortIcon` | ✅ |
| 정렬 설명 | `showSorterTooltip` | ◐ native tooltip으로 동일 핵심 정보 제공 |
| 필터 상태 | `filtered`, `filteredValue`, `defaultFilteredValue`, `filterResetToDefaultFilteredValue` | ✅ |
| 필터 UI | `filters`, `filterMultiple`, `filterMode`, `filterSearch`, `filterIcon`, `filterOnClose` | ✅ |
| 커스텀 필터 | `filterDropdown`, `FilterDropdownProps` | ✅ |
| 드롭다운 옵션 | `filterDropdownProps` 전체 Dropdown Props | ◐ `open`, `onOpenChange`, `className` 지원 |
| 로컬/서버 정렬 | 함수는 로컬, `true` 또는 compare 없는 객체는 서버 정렬 | ✅ | 기존의 `sorter: true` 로컬 정렬 오류 수정 |
| 로컬/서버 필터 | `onFilter`가 있을 때만 로컬 필터 | ✅ | `filters`만 있으면 상태와 `onChange`만 갱신 |
| tree data 처리 | 자식 레벨도 정렬·필터 | ✅ | 원본 레코드를 변경하지 않고 재귀 처리 |

## Pagination

| 영역 | antd API | Orbit |
| --- | --- | --- |
| 상태 | `current`, `defaultCurrent`, `pageSize`, `defaultPageSize`, `total` | ✅ |
| 배치 | `placement`, deprecated `position`, `align` | ✅ |
| 페이지 UI | 숫자 페이지, active 상태, `prev/next`, jump ellipsis | ✅ |
| 표시 방식 | `simple`, `showLessItems`, `responsive`, `showTitle` | ✅ |
| 이동 | `showQuickJumper`, `showPrevNextJumpers`, `itemRender` | ✅ |
| 크기 변경 | `showSizeChanger`, `pageSizeOptions`, `totalBoundaryShowSizeChanger` | ✅ |
| Select 상세 옵션 | `showSizeChanger`에 전체 Select Props 전달 | ◐ 현재 `disabled`만 적용 |
| 기타 | `disabled`, `hideOnSinglePage`, `showTotal`, `size`, `locale` | ✅ |
| semantic | `classNames`, `styles` 객체/함수 | ✅ |
| 콜백 | `onChange`, `onShowSizeChange` | ✅ |

추가 동작 계약도 현재 `rc-pagination`과 대조했다. simple 입력은 여러 자릿수를 입력한 뒤 Enter/blur에서 확정하고, page-size 변경은 현재 페이지를 유지하되 범위를 벗어날 때만 보정한다. 한 페이지뿐이면 quick jumper를 숨기며, `total=0`인 Table은 pagination 자체를 렌더링하지 않는다.

## RowSelection / selection

| 영역 | antd API | Orbit |
| --- | --- | --- |
| 상태 | `type`, `selectedRowKeys`, `defaultSelectedRowKeys`, `preserveSelectedRowKeys` | ✅ |
| 트리 | `checkStrictly` | ✅ |
| 선택 열 | `align`, `columnTitle`, `columnWidth`, `fixed`, `hideSelectAll` | ✅ |
| 체크박스 | `getCheckboxProps`, `getTitleCheckboxProps`, `renderCell`, `onCell` | ✅ |
| 선택 메뉴 | `selections: true` 및 `{ key, text, onSelect }[]` | ✅ |
| 콜백 | `onChange`, `onSelect` | ✅ |
| deprecated 콜백 | `onSelectAll`, `onSelectInvert`, `onSelectNone`, `onSelectMultiple` | ✅ 호환 목적으로 유지 |
| 기본 selection | 전체 선택, 반전, 선택 해제 및 `Table.SELECTION_ALL/INVERT/NONE` | ✅ |
| Shift 범위 선택 | ✅ | ✅ |

## Expandable

`childrenColumnName`, `columnTitle`, `columnWidth`, `defaultExpandAllRows`, `defaultExpandedRowKeys`, `expandedRowKeys`, `expandedRowRender`, `expandedRowClassName`, `expandIcon`, `expandRowByClick`, `fixed`, `indentSize`, `rowExpandable`, `showExpandColumn`, `onExpand`, `onExpandedRowsChange`를 지원한다.

## 일반 기능으로 판단해 포함한 항목

- sticky header/summary와 fixed column
- 좌·우 fixed 열의 스크롤 경계 shadow와 남은 스크롤 방향 상태
- 행·열 드래그 정렬 및 주변 항목 transform 애니메이션
- 서버 정렬/필터/페이지네이션 제어 모드
- 숫자 페이지, 점프, page-size 변경, 다양한 pagination placement
- selection 메뉴와 Shift 범위 선택
- 커스텀 필터 드롭다운과 tree filter
- semantic class/style, 커스텀 body/header component
- 가상 스크롤과 imperative `scrollTo`
- `Table.Column`/`Table.ColumnGroup` JSX 문법과 `Table.Summary.Row/Cell`

## 구현 보류 항목 — 사용자 판단 필요

1. **`Table.EXPAND_COLUMN` / `Table.SELECTION_COLUMN` 열 순서 상수**

   내부 특수 열을 일반 `columns` 배열 안에서 자유롭게 재배치하는 API다. 현재는 selection → expand → data 순서로 고정되어 있다. 열 모델 재설계가 필요하지만 구현 가능하다.

2. **sticky 가상 스크롤바의 `offsetScroll`, `getContainer` 동작**

   sticky header는 구현되어 있다. 페이지 하단에 복제 스크롤바를 띄우고 외부 스크롤 컨테이너와 동기화하는 부분은 별도 스크롤 인프라가 필요하다.

3. **동적 행 높이 virtual list**

   현재는 크기별 고정 행 높이로 안정적인 1,000+ 행 windowing을 제공한다. 자동 높이 행, `rowSpan`, expanded row를 동시에 가상화하려면 측정 캐시와 ResizeObserver 기반 엔진이 필요하다.

4. **하위 컴포넌트의 모든 props**

   `loading`의 모든 Spin Props, `showSorterTooltip`의 모든 Tooltip Props, `filterDropdownProps`의 모든 Dropdown Props, `showSizeChanger`의 모든 Select Props를 그대로 전달하는 기능이다. Table 단독 패키지에 Spin/Tooltip/Dropdown/Select 시스템이 없으므로 현재는 실제 Table 사용에 필요한 하위 집합만 지원한다.

5. **stack fixed columns**

   일반 fixed left/right는 지원한다. 스크롤 거리에 따라 열이 하나씩 쌓이는 antd의 별도 데모 동작은 보류했다.

6. **서버 기능 자체**

   Ajax 호출, 서버 정렬·필터·페이지 요청은 `onChange` 계약으로 연결하지만 Table이 네트워크 요청을 직접 수행하지 않는다. 이는 antd도 동일하다.
