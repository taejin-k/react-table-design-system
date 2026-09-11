# wizard-design

제품 화면에서 바로 쓸 수 있도록 만든 React·Tailwind CSS 기반 디자인 시스템입니다. 일관된 색상·여백·모션·접근성 기준을 컴포넌트에 담고, Storybook에서 사용법과 상태를 함께 제공합니다.

## 설치

GitHub Packages를 사용하는 프로젝트의 `.npmrc`에 아래 설정을 추가합니다.

```ini
@taejin-k:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN`은 `read:packages` 권한이 있는 GitHub Personal Access Token을 환경변수로 설정합니다.

```bash
pnpm add @taejin-k/wizard-design
```

설치·업데이트 후에도 에디터가 새 타입을 못 읽어오는 경우가 있습니다(특히 `npm`/`pnpm`을 섞어 썼거나, 버전을 새로 올린 직후). 이미 실행 중인 TypeScript 서버가 설치 이전의 `node_modules` 해석 결과를 캐시하고 있어서, `<But`처럼 입력해도 자동 import 후보에 컴포넌트가 뜨지 않습니다. 이럴 땐 VS Code에서 `Cmd+Shift+P` → **"TypeScript: Restart TS Server"** 를 실행합니다. 그래도 안 되면 **"Developer: Reload Window"** 까지 실행합니다.

앱 진입점에서 기본 스타일을 한 번 불러옵니다.

```ts
import "@taejin-k/wizard-design/style.css";
```

`style.css`는 Pretendard 웹폰트를 jsDelivr CDN에서 불러옵니다. 외부 CDN을 허용하지 않는 환경에서는 앱에서 Pretendard를 직접 호스팅하고 `theme.css`의 `--font-pretendard`와 같은 `font-family`를 제공해야 합니다.

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
```

### 최초 1회: GitHub 토큰 준비

1. 1Password **백오피스사업부** vault → **"GitHub Personal Access Token"** 항목에서 토큰을 확인합니다. 유효하면 이 값을 그대로 씁니다.
2. 없거나 만료됐으면 새로 발급합니다.
   - https://github.com/settings/tokens → **"Generate new token (classic)"**
   - 권한: `write:packages`, `read:packages`, `repo`
   - 생성 후 **"Configure SSO"** → `dunamu-futurewiz` 조직 **Authorize**
   - 새로 만든 토큰은 1Password 항목도 갱신해둡니다.
3. 터미널에서 매번 다시 입력하지 않도록 셸 설정 파일에 등록합니다.
   ```bash
   echo 'export GITHUB_TOKEN=발급받은_토큰' >> ~/.zshrc
   source ~/.zshrc
   ```
4. GitHub Packages에 로그인합니다.
   ```bash
   npm login --scope=@taejin-k --registry=https://npm.pkg.github.com
   ```

### 배포 절차

1. `package.json`의 `version`을 올립니다 (semver 기준: 새 기능 추가 → minor, 버그 수정 → patch).
2. 빌드합니다.
   ```bash
   pnpm build
   ```
3. 배포합니다.
   ```bash
   npm publish
   ```
