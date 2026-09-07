# wizard-design

제품 화면에서 바로 쓸 수 있도록 만든 React·Tailwind CSS 기반 디자인 시스템입니다. 일관된 색상·여백·모션·접근성 기준을 컴포넌트에 담고, Storybook에서 사용법과 상태를 함께 제공합니다.

## 설치

GitHub Packages를 사용하는 프로젝트의 `.npmrc`에 아래 설정을 추가합니다.

```ini
@taejin-k:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
pnpm add @taejin-k/wizard-design
```

앱 진입점에서 기본 스타일을 한 번 불러옵니다.

```ts
import "@taejin-k/wizard-design/style.css";
```

예시의 Tailwind 유틸리티 클래스도 사용할 경우 앱의 Tailwind 진입 CSS에 토큰을 불러옵니다.

```css
@import "tailwindcss";
@import "@taejin-k/wizard-design/theme.css";
```

## 사용

```tsx
import { Button, DatePicker, Table } from "@taejin-k/wizard-design";

<Button variant="primary">저장</Button>
<DatePicker />
<Table columns={columns} dataSource={dataSource} />
```

각 컴포넌트의 전체 API, 제어/비제어 사용 예시, 상태별 동작은 Storybook에서 확인합니다.

## 설계 원칙

- **토큰 우선**: 색상, 그림자, 테두리, 상태 표현을 공통 디자인 토큰으로 연결해 화면 간 톤을 맞춥니다.
- **예측 가능한 상태**: `disabled`, `loading`, `error`, 선택·드래그·열림 상태가 컴포넌트마다 같은 규칙으로 동작하도록 구성했습니다.
- **실사용 중심 API**: 제어/비제어 패턴, 비동기 처리, 렌더 함수, 이벤트 콜백을 실제 업무 화면에서 조합하기 쉽게 제공합니다.
- **절제된 모션**: 열림·닫힘, 목록 정렬, 값 전환은 짧은 전환으로 상태 변화를 전달하고 `prefers-reduced-motion`을 존중합니다.
- **접근 가능한 기본값**: 네이티브 요소를 우선 사용하고, 키보드 조작·포커스·비활성 상태를 함께 처리합니다.

## 디자인 토큰

`theme.css`는 Tailwind에서 사용할 색상과 그림자 토큰을 제공합니다. 대표 색상 토큰은 `primary`, `success`, `danger`, `dark`, `gray`, `disabled`, `hover`, `selected`, `border`, `light-gray`이며, 컴포넌트 API의 `color`는 가능한 한 이 토큰을 사용합니다. 그림자는 `shadow-sm`, `shadow-lg`, `shadow-2xl`처럼 계층별로 제공합니다.

## 컴포넌트

- 입력·선택: Button, Input, TextArea, Select, DatePicker, TimePicker, Checkbox, Radio, Toggle, ColorPicker
- 정보 표시: Avatar, Badge, Tag, Label, Icon, Image, Illustrations, Skeleton, ErrorMessage
- 탐색·구조: Breadcrumb, Menu, Tabs, Tree, Collapse, Segmented
- 오버레이·피드백: Tooltip, Popover, Dropdown, Modal, Drawer, Message, Notification
- 데이터·작업: Table, Calendar, Upload, Flex

## 개발과 배포

변경할 때는 컴포넌트 구현, 타입, Storybook 예시·API 문서를 함께 갱신합니다. 배포 전에는 해당 컴포넌트 테스트와 타입 검사를 실행하고, 패키지 버전을 올린 뒤 GitHub Packages에 배포합니다.

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm publish
```
