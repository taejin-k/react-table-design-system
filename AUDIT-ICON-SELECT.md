# Icon–Select 최종 검수

2026-09-06. 이번 검수 범위는 Storybook 순서의 Icon부터 Select까지 18개입니다. 기존 미커밋 작업은 유지했으며, 배포·커밋은 하지 않았습니다.

## 먼저 처리한 Table Basic

- 실제 기본값인 `bordered={false}`, `loading={false}`, `showHeader`, `rowHoverable`, `textSelectable`은 Show code에서 생략합니다.
- Controls에서 기본값과 다르게 바꾸면 다시 코드에 표시합니다.
- Table의 실제 기본 size는 `lg`이므로, Basic의 `size="md"`는 유지했습니다. 이를 생략하면 복사한 예제가 더 큰 크기로 표시됩니다.
- Table 실행 동작이나 기본값은 변경하지 않았습니다.

## 이번에 수정한 문제

| 대상                              | 수정 결과                                                                                                                                                                                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icon                              | 사용자가 `onKeyDown`에서 `preventDefault()`로 취소하면 Enter·Space의 합성 클릭도 발생하지 않습니다.                                                                                                                                            |
| Checkbox                          | 부분 선택과 error를 함께 사용할 때도 danger 색상이 적용됩니다.                                                                                                                                                                                 |
| Flex                              | `wrap`을 생략한 경우 `className="flex-wrap"`이 인라인 기본값에 막히지 않습니다. 명시한 wrap prop은 그대로 적용됩니다.                                                                                                                          |
| TextArea                          | `autoSize`에서 부모 폭 변화에 맞춰 높이를 다시 계산합니다. 높이 변화 자체는 재계산을 반복하지 않으며, autoSize를 끄면 자동 높이·overflow 설정을 해제합니다. 수동 리사이즈와 absolute count 배치는 유지합니다.                                  |
| Tooltip·Popover·Dropdown          | 트리거 래퍼에 최대 너비를 적용해, 안에 긴 Button을 넣어도 부모 폭을 넘지 않도록 했습니다.                                                                                                                                                      |
| Segmented                         | 같은 컴포넌트의 라디오 입력에 동일한 내부 name을 부여하고, 다른 인스턴스와는 구분합니다. 선택 항목이 options에서 삭제되면 선택 배경이 남지 않습니다.                                                                                           |
| Select                            | 가상 목록에서 방향키로 이동한 활성 항목이 보이도록 목록 내부만 스크롤합니다. 검색 결과가 바뀌면 스크롤 위치를 초기화하며, 마우스 hover로는 새 자동 스크롤을 일으키지 않습니다. 페이지·태그 입력 영역에 `scrollIntoView()`를 호출하지 않습니다. |
| Input·TextArea·Select의 검증 함수 | 이전 함수의 오류·늦은 비동기 응답이 교체된 함수에 남는 경우를 방지했습니다. 일반 함수가 반환한 Promise의 초기 거절과 동기 예외도 처리합니다.                                                                                                   |

공통 검증 훅은 DatePicker·TimePicker도 사용하므로, 마지막 항목의 안전성 보완은 이 두 컴포넌트에도 적용됩니다. 두 컴포넌트의 기존 테스트도 전체 테스트에 포함했습니다.

## ARIA·className·문서

- 범위 내 컴포넌트가 직접 출력하던 `aria-*`와 Icon 스토리의 스크린리더 전용 설명을 제거했습니다. 관련 문서와 테스트도 갱신했습니다.
- 실제 동작에 사용하는 native input, label 연결, 키보드 이벤트는 유지했습니다. Segmented의 `sr-only`는 실제 라디오 입력을 시각적으로 숨기는 용도이므로 유지했습니다.
- 18개 모두 표시되는 최상위 루트로 className이 전달되는지 검증했습니다. Tooltip·Popover·Dropdown은 트리거 래퍼가 해당 루트입니다.
- Button의 suffix 아이콘, Flex 정렬·래퍼, Illustrations Sizes, Segmented Sizes, Tag Variants, Tooltip Controlled의 Show code를 실제 예제와 맞췄습니다.
- Dropdown·Segmented의 controlled 예제 상태 타입을 공개 API의 `Key`와 맞췄습니다.
- Flex Basic과 Select Sizes·Widths·Variants의 Controls 초기값을 실제 동작과 맞췄습니다.
- README의 오래된 props·색상·예제를 수정하고, 외부 앱에서 `style.css`와 Tailwind theme를 사용하는 방법을 명시했습니다. 예제의 별도 Tailwind 레이아웃 클래스는 사용하는 앱에서도 생성되어야 합니다.

## 전체 범위

검수한 18개: Icon, Button, Tag, Checkbox, Radio, Toggle, Label, ErrorMessage, Breadcrumb, Input, TextArea, Tooltip, Popover, Dropdown, Segmented, Illustrations, Flex, Select.

각 컴포넌트의 소스·타입·기본값·스토리와 기존 테스트를 확인했습니다. 문제가 발견된 부분만 수정했으며, 모든 컴포넌트를 같은 API나 디자인으로 바꾸지는 않았습니다.

## 검증 결과

- 전체 자동 테스트: 52개 파일, **939개 통과**.
- `pnpm check-types`, `pnpm lint`, `pnpm build`, `git diff --check`: 통과.
- 실제 Storybook canvas **108개**: 렌더링 오류 없음.
- 명시된 Show code **104개**: Storybook args 없이 실행, 실제 초기 DOM과 비교, 소스 및 배포 선언 파일 기준 타입 검사 통과.
- 18개 × 3상태 × 2화면 폭(390px·1280px), 총 **108개** 소스/빌드 JS·CSS 비교 통과. 기본 문구, 긴 숫자·한글, root className, 가로 넘침, 주요 computed style을 확인했습니다.
- 빠른 태그 입력: lg·md·sm에서 첫 줄 이동 0, 입력 컨테이너 scrollTop 0, 입력한 태그 수 일치.
- 팝업 위치 복구·임시 검색 결과 변화의 위치 유지: 관련 회귀 테스트 통과.
- TextArea 폭 축소: 높이 128px → 408px로 내용에 맞춰 증가하는 것을 Chromium에서 확인했습니다.
- 배포 패키지 dry run: JS, 타입 선언, style.css, theme.css 포함 확인. 실제 publish는 하지 않았습니다.

검증은 현재 프로젝트의 테스트 환경과 Chromium 기준입니다. 모든 소비 앱의 전역 CSS, 모든 브라우저·OS 조합에서 문제가 없다는 보장은 아닙니다.

## 다시 실행하기

```sh
pnpm test
pnpm check-types
pnpm lint
pnpm build
WIZARD_VERIFY_BUILT_TYPES=1 pnpm exec vitest run src/storybook/icon-select-examples.test.tsx
node scripts/verify-icon-select-stories.mjs
node scripts/verify-icon-select.mjs
node scripts/verify-select-tag-scroll.mjs
```

브라우저 검증 스크립트는 localhost:6006의 Storybook과 agent-browser가 필요합니다. CSS·폰트가 로드된 뒤 비교하도록 구성했으며, 전용 브라우저 세션은 종료 시 닫습니다.
