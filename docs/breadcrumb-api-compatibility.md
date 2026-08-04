# Breadcrumb API 호환성 감사

기준: Ant Design **6.5.3** 공식 Breadcrumb 문서와 공개 TypeScript 선언. Orbit Breadcrumb는 antd, rc-dropdown, rc-menu를 포함하거나 래핑하지 않고 동일한 핵심 API 계약과 상호작용을 독립 구현한다.

Storybook에는 Breadcrumb 기능을 나눈 23개 Story가 있으며, 모든 Canvas 상단에 목적과 확인 포인트가 표시된다.

- ✅ 동일 이름과 핵심 동작으로 구현 및 검증
- ◐ 일반 Breadcrumb 사용에 필요한 범위를 구현했으나 종속 컴포넌트의 모든 옵션은 전달하지 않음

## Breadcrumb

| API | antd | Orbit | 비고 |
| --- | --- | --- | --- |
| `items` | ✅ | ✅ | route item과 separator item 지원 |
| `separator` | ✅ | ✅ | 전역 ReactNode 구분자 |
| `dropdownIcon` | ✅ | ✅ | 메뉴형 항목의 공통 아이콘 교체 |
| `itemRender` | ✅ | ✅ | `(route, params, routes, paths)` 계약 |
| `params` | ✅ | ✅ | `:key` 동적 path와 title 치환 |
| `classNames`, `styles` | 객체/함수 | ✅ | `root`, `item`, `separator` semantic 구조 |
| native root props | ✅ | ✅ | nav의 `aria-*`, `data-*`, className, style, 이벤트 및 ref |
| deprecated `routes` | ✅ | ✅ | `items` 별칭으로 유지 |
| deprecated children API | ✅ | ✅ | `Breadcrumb.Item`, `Breadcrumb.Separator` 유지 |

## RouteItemType / SeparatorType

| 영역 | antd API | Orbit |
| --- | --- | --- |
| 식별·표현 | `key`, `title`, deprecated `breadcrumbName`, `className`, `style` | ✅ |
| 이동 | `href`, 누적 `path`, `onClick` | ✅ |
| 접근성·데이터 | `aria-*`, `data-*` | ✅ |
| Dropdown | `menu`, `dropdownProps` | ◐ 아래 범위 지원 |
| legacy 하위 메뉴 | deprecated `children` | ✅ `menu.items`로 변환 |
| 명시적 구분자 | `type: 'separator'`, `separator` | ✅ |

## Dropdown / Menu 지원 범위

- `dropdownProps`: `open`, `defaultOpen`, `trigger`, `placement`, `disabled`, `className`, `overlayClassName`, `style`, `getPopupContainer`, `onOpenChange`
- `menu`: `items`, `onClick`, `className`, `style`
- menu item: `key`, `label`, `title`, `path`, `href`, `icon`, `disabled`, `danger`, `type: 'divider'`, `className`, `style`, `onClick`
- hover/click 열기, 바깥 클릭, Escape, ArrowDown/Enter/Space, 첫 활성 항목 포커스, 선택 후 trigger 포커스 복귀
- body 또는 사용자 컨테이너 포털과 top/bottom 좌우 배치

## 의도적으로 포함하지 않은 종속 API

Ant Design의 `menu`와 `dropdownProps` 타입은 각각 완전한 Menu, Dropdown 컴포넌트의 전체 API를 끌어온다. Orbit 패키지에는 아직 독립 Menu/Dropdown 컴포넌트가 없으므로 다음 고급 종속 옵션은 Breadcrumb 내부에 중복 구현하지 않았다.

- Menu의 다단 submenu, selectable/multiple 상태, overflow, motion, 전체 keyboard roving model
- Dropdown의 arrow, autoAdjustOverflow, align, destroyOnHidden, popupRender 등 전체 overlay 엔진 옵션

일반적인 Breadcrumb 하위 이동 메뉴에는 위의 지원 범위로 충분하다. 향후 독립 Menu/Dropdown 컴포넌트를 추가하면 해당 props를 공유하는 방식으로 확장하는 것이 중복과 동작 차이를 방지한다.

## Tailwind 사용 방식

프로젝트는 Tailwind CSS v4와 `@tailwindcss/vite` 빌드 파이프라인을 사용한다. 기본 컴포넌트 외형은 안정적인 BEM 클래스와 CSS 변수 디자인 토큰으로 제공하고, 소비자는 `className` 및 semantic `classNames/styles`에 Tailwind utility를 전달해 확장한다. antd CSS와 런타임 의존성은 없다.
