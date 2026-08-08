# wizard-design

Tailwind CSS 기반 디자인 시스템입니다.

## 목차

- [Figma](#figma)
- [작업 순서](#작업-순서)
- [설치](#설치)
- [사용](#사용)
- [컴포넌트](#컴포넌트)
  - [Button](#button)
  - [Icon](#icon)
  - [Chip](#chip)
  - [Toggle](#toggle)
  - [Label](#label)
  - [ErrorText](#errortext)
  - [Input](#input)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [Breadcrumb](#breadcrumb)
  - [Table](#table)
- [Storybook](#storybook)
- [배포 (메인테이너용)](#배포-메인테이너용)

<br />

## Figma

[GROO 스타일 라이브러리](https://www.figma.com/design/a68fSQATkeJSPgTMrx7KvU/GROO-%EC%8A%A4%ED%83%80%EC%9D%BC-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC)를 SoT(Single Source of Truth)로 합니다. 컴포넌트 스펙은 이 파일을 기준으로 합니다.

<br />

## 작업 순서

```
Figma 변경 → 코드 변경 → Storybook 업데이트 → 배포
```

1. Figma에서 디자인을 변경합니다.
2. 변경된 스펙을 컴포넌트 코드에 반영합니다.
3. Storybook 스토리도 함께 업데이트합니다(새 variant, 새 prop 등).
4. [배포](#배포-메인테이너용) 절차대로 버전을 올리고 publish합니다.

<br />

## 설치

GitHub Packages(사내 전용)에 배포됩니다. 설치할 레포의 `.npmrc`에 추가합니다.

```
@dunamu-futurewiz:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN`은 `read:packages` 권한이 있는 GitHub Personal Access Token
(SSO 조직이면 조직에 Authorize 필요)을 환경변수로 설정합니다.

```bash
pnpm add @dunamu-futurewiz/wizard-design
```

설치·업데이트 후에도 에디터가 새 타입을 못 읽어오는 경우가 있습니다(특히
`npm`/`pnpm`을 섞어 썼거나, 버전을 새로 올린 직후). 이럴 땐 VS Code에서
`Cmd+Shift+P` → **"TypeScript: Restart TS Server"** 를 실행합니다. 그래도
안 되면 **"Developer: Reload Window"** 까지 실행합니다.

<br />

## 사용

앱 진입점(`layout.tsx`, `_app.tsx` 등)에서 스타일시트를 한 번 import합니다.

```ts
import '@dunamu-futurewiz/wizard-design/style.css';
```

`style.css`는 Pretendard 웹폰트를 jsDelivr CDN에서 불러옵니다. 외부 CDN을
허용하지 않는 환경에서는 앱에서 Pretendard를 직접 호스팅하고 같은
`font-family`를 제공해야 합니다.

```tsx
import { Button, Icon } from '@dunamu-futurewiz/wizard-design';

<Button type="primary" size="lg">
  버튼
</Button>

<Icon icon="add" />
```

<br />

## 컴포넌트

### Button

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --------------------------------------------- | --- | --- | --- |
| `type` | `primary` \| `secondary` \| `tertiary` \| `dark` \| `ghost` | false | `primary` | 버튼 타입 |
| `size` | `lg` \| `md` \| `sm` | false | `md` | 버튼 크기 |
| `iconOnly` | `boolean` | false | `false` | 아이콘만 표시(정사각형) |
| `shadow` | `boolean` | false | `false` | 그림자 표시 |
| `fullWidth` | `boolean` | false | `false` | 부모 너비 100% |
| `prefixIcon` | `ReactNode` | false | - | 앞쪽 아이콘. 배열로 0~여러 개 전달 가능 |
| `suffixIcon` | `ReactNode` | false | - | 뒤쪽 아이콘. 배열로 0~여러 개 전달 가능 |

`disabled`, `onClick` 등 나머지 네이티브 `<button>` props는 그대로 지원합니다.
`iconOnly`를 사용할 때는 동작을 설명하는 `aria-label`을 반드시 함께 전달합니다.

### Icon

Figma Icon 라이브러리 아이콘입니다.

```tsx
<Icon icon="add" />
<Icon icon="add" size={24} color="#0062df" />
```

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --------------------------------------------- | --- | --- | --- |
| `icon` | `add` \| `close` \| `delete` \| `edit` \| ... | true | - | 아이콘 종류 |
| `size` | `number` | false | `16` | 크기(px) |
| `color` | `string` | false | `currentColor` | 색상(기본: 부모 텍스트 색) |

장식용 아이콘은 기본적으로 접근성 트리에서 제외됩니다. `onClick`으로 직접 상호작용하게 만들 때는 `aria-label`을 함께 전달해야 하며 Enter와 Space 키로도 실행됩니다. 일반적인 작업은 Icon 단독보다 `Button iconOnly` 조합을 권장합니다.

### Chip

```tsx
<Chip color="green" variant="filled">텍스트</Chip>
<Chip prefixIcon={<Icon icon="edit" />} suffixIcon={<Icon icon="close" />}>텍스트</Chip>
```

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `color` | `green` \| `navy` \| `red` \| `grey` \| `black` \| `purple` \| `blue` | false | `green` | 색상 |
| `variant` | `filled` \| `soft-filled` \| `outlined` | false | `filled` | 스타일 |
| `prefixIcon` | `ReactNode` | false | - | 앞쪽 아이콘. 16x16 소켓, hover 시 opacity-75 |
| `suffixIcon` | `ReactNode` | false | - | 뒤쪽 아이콘. 16x16 소켓, hover 시 opacity-75 |

Button과 달리 아이콘의 `onClick`을 무시하지 않습니다(닫기 버튼처럼 상호작용 가능해야 하는 경우가 있어서).

### Toggle

```tsx
const [checked, setChecked] = useState(false);

<Toggle aria-label="알림 사용" size="md" checked={checked} onChange={setChecked} />
```

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `size` | `lg` \| `md` \| `sm` | false | `md` | 크기 |
| `checked` | `boolean` | true | - | 컨트롤드 컴포넌트라 반드시 넘겨야 함 |
| `onChange` | `(checked: boolean) => void` | false | - | 클릭 시 반전된 값과 함께 호출 |
| `disabled` | `boolean` | false | `false` | 비활성화 |

라벨(온/오프 텍스트) 기능은 시도했으나 가변폭 처리에서 CSS 버그가 계속 발생해 제외했습니다. 라벨 없는 버전만 지원합니다.

### Label

```tsx
<Label size="md" required>이름</Label>
```

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `size` | `lg` \| `md` \| `sm` | false | `md` | 크기 |
| `required` | `boolean` | false | `false` | 뒤에 빨간 `*` 표시 |
| `children` | `ReactNode` | true | - | 라벨 텍스트 |

`htmlFor` 등 나머지 네이티브 `<label>` props도 그대로 지원합니다. Input 전용이 아니라 Select, CheckBox 등 다른 필드에서도 재사용하는 독립 컴포넌트입니다.

### ErrorText

```tsx
<ErrorText>{error && '형식이 올바르지 않습니다'}</ErrorText>
```

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | false | - | 에러 메시지. 없으면(`undefined`/`false`) 접혀서 안 보임 |

`children`이 생기면 위→아래로 슬라이드하며 나타나고, 없어지면 반대로 슬라이드업하며 사라집니다. 긴 문장은 줄바꿈되며 `role="alert"`/`aria-live="polite"`로 보조기기에 전달됩니다. Label과 마찬가지로 Input 전용이 아닌 독립 컴포넌트입니다.

### Input

```tsx
const [value, setValue] = useState('');

<Input
  label="이메일"
  required
  value={value}
  onChange={setValue}
  errorText={!value.includes('@') ? '형식이 올바르지 않습니다' : undefined}
  allowClear
  maxLength={30}
/>
```

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `size` | `lg` \| `md` \| `sm` | false | `md` | 크기 |
| `variant` | `default` \| `filled` | false | `default` | 스타일 |
| `value` | `string` | false | - | 컨트롤드 값 |
| `onChange` | `(value: string) => void` | false | - | 입력값과 함께 호출 |
| `label` | `ReactNode` | false | - | 있으면 위에 [Label](#label) 렌더링 |
| `required` | `boolean` | false | `false` | 실제 input에 required 적용 + Label이 있으면 `*` 표시 |
| `errorText` | `ReactNode` | false | - | 있으면 아래에 [ErrorText](#errortext) 렌더링 + 테두리 warning 색 |
| `disabled` | `boolean` | false | `false` | 비활성화 |
| `allowClear` | `boolean` | false | `false` | 값 있을 때 지우기 버튼. 지운 뒤 input으로 포커스 복귀 |
| `showCount` | `boolean` | false | `false` | 글자수(`value.length`) 표시. `maxLength` 있으면 무시되고 `n / maxLength` 형식 |
| `maxLength` | `number` | false | - | 최대 글자수. 한글 IME 조합 중에도 자체 검증해서 강제함 |
| `prefixIcon` | `ReactNode` | false | - | 앞쪽 아이콘 |
| `suffixIcon` | `ReactNode` | false | - | 뒤쪽 아이콘 |
| `rootClassName` | `string` | false | - | 입력 영역 wrapper 클래스 (`className`도 기존 호환을 위해 wrapper에 적용) |
| `inputClassName` | `string` | false | - | 실제 input 엘리먼트 클래스 |
| `onClear` | `() => void` | false | - | 지우기 버튼을 누른 직후 호출 |

`placeholder`, `disabled` 등 나머지 네이티브 `<input>` props도 지원합니다. `errorText`가 있으면 `aria-invalid`와 `aria-describedby`가 자동으로 연결됩니다.

### Checkbox

```tsx
<Checkbox label="레이블" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
```

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | false | - | 있으면 오른쪽에 라벨 텍스트 렌더링 |
| `error` | `boolean` | false | `false` | 테두리/체크 색이 warning(red) 색으로 바뀜 |
| `checked` | `boolean` | false | - | 나머지 네이티브 `<input type="checkbox">` props(`checked`/`onChange`/`disabled` 등)도 그대로 지원 |

### Radio

```tsx
<Radio name="group" label="옵션 A" checked={value === 'a'} onChange={() => setValue('a')} />
```

| prop | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | false | - | 있으면 오른쪽에 라벨 텍스트 렌더링 |
| `error` | `boolean` | false | `false` | 테두리/선택 색이 warning(red) 색으로 바뀜 |

나머지 네이티브 `<input type="radio">` props(`name`/`checked`/`onChange`/`disabled` 등)도 그대로 지원합니다. 같은 그룹은 `name`으로 묶습니다.

### Breadcrumb

페이지 내 현재 위치와 이동 경로를 한눈에 보여줘요. 구분자는 `/`로 고정되어 있으며 드롭다운은 제공하지 않아요. 각 항목에는 링크, 아이콘과 색상을 선택적으로 지정할 수 있어요.

```tsx
<Breadcrumb
  items={[
    { title: '홈', href: '/', icon: <Icon icon="home" /> },
    { title: '컴포넌트', href: '/components', color: '#0062df' },
    { title: 'Breadcrumb', color: '#111' },
  ]}
/>
```

`href`가 있는 항목에만 마우스 호버와 키보드 포커스 디자인이 적용돼요. `title`, `href`, `icon`, `color` 외에도 `target`, `rel`, `onClick`, `className`, `style` 같은 링크 속성을 전달할 수 있어요.

### Table

Ant Design과 익숙한 핵심 API 사용 패턴을 제공하는 독립 Table입니다. `dataSource`/`columns`/`rowKey` 기본 사용부터 정렬·필터·행 선택(체크박스/라디오/트리)·확장 행·고정 컬럼·sticky 헤더·가상 스크롤(1,000+ 행)·`Table.Summary`·`components` 슬롯 교체·`ref.scrollTo`를 제공합니다. Ant Design 전체 구현과 완전히 동일하다는 의미는 아니며, 실제 지원 범위와 예제는 Storybook을 기준으로 합니다.

```tsx
<Table<Member>
  dataSource={members}
  columns={columns}
  rowKey="key"
  rowSelection={{}}
  pagination={{ defaultPageSize: 10 }}
/>
```

체크박스/라디오 행 선택 UI는 Table 내부에 인라인으로 구현되어 있으며 별도로 export하지 않습니다(다른 컴포넌트로 자유롭게 교체 가능하도록). `@dnd-kit/core`/`@dnd-kit/sortable`로 행·열 드래그 정렬을 조합하는 예시는 Storybook의 `Drag Row Sorting`/`Drag Column Sorting` 스토리를 참조합니다. 전체 prop과 세부 기능별 예시(API Compatibility/Expandable/Layout/Pagination/Selection/Sorting & Filtering)는 Storybook 참조.

<br />

## Storybook

```bash
pnpm storybook        # 개발 서버 (localhost:6006)
pnpm build-storybook  # 정적 빌드 (storybook-static/)
pnpm test             # 핵심 상호작용 회귀 테스트
pnpm lint             # 소스/Storybook 정적 검사
pnpm check-types      # 공개 타입 검사
```

<br />

## 배포 (메인테이너용)

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
   npm login --scope=@dunamu-futurewiz --registry=https://npm.pkg.github.com
   ```

### 배포 절차

1. `package.json`의 `version`을 올립니다 (semver 기준: 새 기능 추가 →
   minor, 버그 수정 → patch).
2. 빌드합니다.
   ```bash
   pnpm build
   ```
3. 배포합니다.
   ```bash
   npm publish
   ```
