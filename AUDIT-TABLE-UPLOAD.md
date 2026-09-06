# Table–Upload 최종 검수

2026-09-06. Storybook 순서의 Table부터 Upload까지 **18개 컴포넌트**를 대상으로 소스·타입·기본값·스토리·기존 테스트를 검토하고, 발견한 동작 오류를 수정했습니다. 배포·커밋은 하지 않았습니다.

## 유지한 사항

- Table 예제의 `// ...나머지 N개 항목`은 사용자가 요청한 축약이므로 유지했습니다. 데이터 전체를 펼쳐 코드 예제를 길게 만들지 않습니다.
- 이 축약 때문에 복사한 Table 예제의 행 수·페이지 수까지 원본 스토리와 같지는 않습니다. 해당 예제도 타입 검사와 실행 검증은 하되, 생략한 행의 DOM 일치는 요구하지 않습니다.
- 기존 색상·그림자·duration·태그 입력 및 팝업 위치 처리의 디자인을 일괄 변경하지 않았습니다. 이번 검수에서는 Icon–Select 컴포넌트 구현을 수정하지 않았습니다.
- 내부에서 사용하는 필수 Select의 `allowClear`만 명시했습니다. Select 자체의 기본값은 변경하지 않았습니다.

## 수정한 동작

| 대상                                  | 이전 문제                                                                                                               | 수정 결과                                                                           |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Table 정렬                            | `sortOrder`를 외부에서 관리하면 클릭이 무시됨                                                                           | 다음 정렬 상태를 `onChange`로 전달하며, 화면은 전달받은 `sortOrder`를 유지          |
| Table 로딩                            | 처음부터 loading일 때 `delay`가 무시되고, 같은 설정 객체의 재생성으로 타이머가 다시 시작됨                              | 초기 딜레이 적용, 같은 설정의 재렌더링에서는 타이머 유지                            |
| DatePicker                            | 1월 31일에서 다음 달로 이동하면 2월을 건너뜀. 윤년 2월의 연도 이동도 월이 바뀜                                          | 패널 이동을 날짜와 분리해 올바른 월·연도로 이동                                     |
| DatePicker.RangePicker                | 월말에 두 패널이 연속된 월이 아니거나, 열린 상태의 `pickerValue` 변경이 반영되지 않음                                   | 연속된 월 표시 및 외부 패널 값 변경 반영                                            |
| Calendar·ColorPicker·Table Pagination | 비울 수 없는 연·월, 색상 형식, 페이지당 개수에 초기화 X가 나타남                                                        | 해당 내부 Select에만 `allowClear={false}` 적용                                      |
| Image                                 | 전달한 `onClick`이 실행되지 않음                                                                                        | 클릭 콜백 실행, `preventDefault()` 시 미리보기 열기 취소                            |
| Modal·Drawer                          | 부모 재렌더링 때 입력 포커스를 빼앗거나, 중첩 창이 Escape에 함께 닫힘                                                   | 콜백이 바뀌어도 포커스 유지. Modal·Drawer·Image 미리보기 중 최상단 창만 키보드 처리 |
| Modal                                 | 비동기 확인 실패의 Promise 거절이 처리되지 않음. 긴 제목이 X 영역을 침범함                                              | 실패 시 창을 유지하고 로딩을 해제해 재시도 가능. 닫기 버튼이 있을 때 제목 공간 확보 |
| Drawer                                | 리사이즈 중 취소·언마운트 시 문서 이벤트가 남을 수 있음                                                                 | pointercancel 및 언마운트에서 이벤트 정리                                           |
| Tree                                  | 노드의 `checkable={false}`가 전체 checkable에 덮이고, 비활성 노드가 연쇄 체크에 섞임                                    | 노드별 false 우선, 비활성 경계를 넘어 체크하지 않음                                 |
| Tabs                                  | 마지막 항목을 없애도 이전 선택 표시가 남음                                                                              | 활성 요소가 없으면 표시 위치 초기화                                                 |
| Upload                                | 비동기 검증 중 제거된 컴포넌트에서 변경 콜백이 실행되거나, 동시 검증 완료 시 최대 개수 초과 파일이 변경 이벤트에 포함됨 | 언마운트 후 처리 중단, 검증 완료 시점에 최신 파일 수 재확인                         |

## className·ARIA

- Modal·Drawer는 포털 최상위 루트에, Message·Notification은 개별 카드 루트에 `className`을 전달하도록 공개 타입·구현·문서를 보완했습니다. Tailwind 클래스 병합도 적용했습니다.
- 범위의 직접적인 ARIA 출력을 점검했습니다. Tabs·Upload의 드래그 라이브러리가 생성하는 스크린리더 설명은 Table과 같은 방식으로 실제 문서에 붙이지 않도록 했습니다. 포인터 드래그는 유지합니다.
- 입력·클릭·키보드 조작에 필요한 native 요소와 이벤트는 제거하지 않았습니다. 사용자 자식 요소의 ARIA를 강제로 지우지는 않습니다.
- React 검토 스킬의 생명주기 점검은 포커스 유지, 최신 콜백 참조, 이벤트 정리, 비동기 완료 시점 검증에 반영했습니다.

## Storybook Show code

- Table의 필터 `label`, 컬럼 타입, 정렬·필터 예제의 열 너비를 실제 동작과 맞췄습니다.
- 페이지네이션 예제의 미정의 변수, ScrollTo의 실제 데이터와 다른 행 key를 수정했습니다.
- VirtualScroll·ScrollTo는 기존의 짧은 `Array.from` 예제 형식을 유지하면서 실제 생성 데이터와 맞췄습니다. 일반 Table 데이터의 나머지 항목 축약은 유지합니다.
- Avatar 개수·크기, DatePicker·TimePicker 너비, Image alt, Menu 초기 선택값, Skeleton 설명/래퍼, Tree 아이콘·상태 타입, Upload 파일 메타데이터 등 코드와 실제 초기 화면의 차이를 수정했습니다.
- `CalendarProps`, `CollapseItem`, `ColumnsType`, `DrawerSizeType`, `MenuItemType` 등 예제에서 필요한 공개 타입을 자동 import에 포함했습니다.
- 사용자 정의 타입이 필요한 예제는 복사한 코드 자체에서 TypeScript 검사가 가능하도록 보완했습니다.

## 전체 범위와 검증

대상: Table, Badge, ColorPicker, Avatar, Image, Collapse, Message, Notification, Modal, Drawer, DatePicker, TimePicker, Calendar, Menu, Skeleton, Tabs, Tree, Upload.

- 전체 자동 테스트: **54개 파일, 1,158개 통과**.
- `pnpm check-types`, `pnpm lint`, `pnpm build`, `git diff --check`: 통과.
- 실제 Storybook canvas **194개**: 렌더링 오류 없이 로딩 확인.
- Show code **194개**: 전역 args나 비공개 변수 없이 실행, 소스 공개 API와 배포용 타입 선언 검사 통과. 해당 스위트는 타입/DOM 비교를 포함해 196개 테스트입니다.
- 초기 DOM 비교는 사용자가 허용한 Table 나머지 데이터 생략을 제외하고 수행했습니다.
- Chromium에서 Table 정렬 아이콘을 실제 클릭해 오름차순·내림차순의 행 순서 변경과 브라우저 오류 없음을 확인했습니다.
- 패키지의 CommonJS·ESM·타입 선언·style.css·theme.css 진입 파일 존재를 확인했습니다.
- 18개 × 3상태 × 2화면 폭(390px·1280px), 총 **108개 소스/배포 JS·CSS 비교 통과**. 기본 문구·긴 숫자·긴 한글의 root className, 가로 넘침, ARIA 출력, 주요 computed style을 확인했습니다. 비교 시 Storybook 전용 페이지 스크롤바 여백을 동일하게 맞췄으며 컴포넌트의 스타일을 숨기거나 변경하지 않았습니다.

Storybook 인덱스가 일시적으로 500을 반환한 경우 현재 파일의 독립 파싱 성공을 확인한 뒤 개발 서버를 재시작했습니다. 이후 Table 화면과 오류 오버레이 유무를 다시 확인했습니다.

## 검증 한계

검증은 현재 프로젝트의 자동 테스트와 Chromium 기준입니다. 모든 props 조합, 모든 브라우저·OS, 소비 앱의 전역 CSS까지 무오류를 보장하지는 않습니다. Upload는 클라이언트 파일 선택·검증·목록 콜백을 검증했으며, 외부 앱의 실제 업로드 서버와 통신한 것은 아닙니다. 별도 Tailwind 레이아웃 클래스는 소비 앱에서도 생성되어야 합니다.

## 재실행

```sh
pnpm test
pnpm check-types
pnpm lint
pnpm build
WIZARD_VERIFY_BUILT_TYPES=1 pnpm exec vitest run src/storybook/table-upload-examples.test.tsx
node scripts/verify-table-upload-stories.mjs
node scripts/verify-table-upload.mjs
```

브라우저 스크립트는 localhost:6006의 Storybook과 agent-browser가 필요합니다. 검증용 브라우저 세션은 종료 시 닫습니다.
