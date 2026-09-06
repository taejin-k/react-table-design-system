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
  - [Tag](#tag)
  - [Toggle](#toggle)
  - [Label](#label)
  - [ErrorMessage](#errormessage)
  - [Input](#input)
  - [Checkbox](#checkbox)
  - [Radio](#radio)
  - [Breadcrumb](#breadcrumb)
  - [Illustrations](#illustrations)
  - [Table](#table)
  - [Flex](#flex)
  - [Segmented](#segmented)
  - [Modal](#modal)
  - [Drawer](#drawer)
  - [Message](#message)
  - [Notification](#notification)
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

개인 GitHub Packages에 배포됩니다. 설치할 레포의 `.npmrc`에 추가합니다.

```
@taejin-k:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN`은 `read:packages` 권한이 있는 GitHub Personal Access Token을
환경변수로 설정합니다.

```bash
pnpm add @taejin-k/wizard-design
```

설치·업데이트 후에도 에디터가 새 타입을 못 읽어오는 경우가 있습니다(특히
`npm`/`pnpm`을 섞어 썼거나, 버전을 새로 올린 직후). 이럴 땐 VS Code에서
`Cmd+Shift+P` → **"TypeScript: Restart TS Server"** 를 실행합니다. 그래도
안 되면 **"Developer: Reload Window"** 까지 실행합니다.

<br />

## 사용

앱 진입점(`layout.tsx`, `_app.tsx` 등)에서 스타일시트를 한 번 import합니다.

```ts
import "@taejin-k/wizard-design/style.css";
```

`style.css`는 Pretendard 웹폰트를 jsDelivr CDN에서 불러옵니다. 외부 CDN을
허용하지 않는 환경에서는 앱에서 Pretendard를 직접 호스팅하고 같은
`font-family`를 제공해야 합니다.

Show code 안의 `className`도 그대로 사용하려면 앱에 Tailwind CSS 4를 설정하고,
앱의 Tailwind 진입 CSS에서 디자인 토큰을 함께 불러옵니다.

```css
@import "tailwindcss";
@import "@taejin-k/wizard-design/theme.css";
```

컴포넌트 자체 스타일은 `style.css`에 포함되어 있습니다. 예시에 직접 작성한
레이아웃 클래스와 사용자 지정 Tailwind 클래스는 앱에서 생성해야 합니다.
`className`은 컴포넌트의 최상위 요소에 적용되며, 팝업 컴포넌트에서는 트리거를 감싼 요소에 적용됩니다.

```tsx
import { Button, Icon } from '@taejin-k/wizard-design';

<Button variant="primary" size="lg">
  버튼
</Button>

<Icon icon="add" />
```

<br />

## 컴포넌트

### Button

| prop         | 타입                                                                    | 필수  | 기본값    | 설명                        |
| ------------ | ----------------------------------------------------------------------- | ----- | --------- | --------------------------- |
| `variant`    | `primary` \| `danger` \| `secondary` \| `tertiary` \| `dark` \| `ghost` | false | `primary` | 버튼 종류                   |
| `size`       | `lg` \| `md` \| `sm`                                                    | false | `md`      | 버튼 크기                   |
| `iconOnly`   | `boolean`                                                               | false | `false`   | 아이콘만 표시(정사각형)     |
| `shadow`     | `boolean`                                                               | false | `false`   | 그림자 표시                 |
| `fullWidth`  | `boolean`                                                               | false | `false`   | 부모 너비 100%              |
| `prefixIcon` | `ReactElement`                                                          | false | -         | 앞쪽에 표시할 단일 아이콘   |
| `suffixIcon` | `ReactElement`                                                          | false | -         | 뒤쪽에 표시할 단일 아이콘   |
| `loading`    | `boolean`                                                               | false | `false`   | 로딩을 표시하고 클릭을 막음 |
| `onClick`    | `MouseEventHandler<HTMLButtonElement>`                                  | false | -         | 클릭할 때 실행할 함수       |

`disabled`, `onClick` 등 나머지 네이티브 `<button>` props는 그대로 지원합니다.

### Icon

Figma Icon 라이브러리 아이콘입니다.

```tsx
<Icon icon="add" />
<Icon icon="add" size={24} color="#0062df" />
<Icon icon="close" loading />
```

| prop      | 타입                                          | 필수  | 기본값         | 설명                       |
| --------- | --------------------------------------------- | ----- | -------------- | -------------------------- |
| `icon`    | `add` \| `close` \| `delete` \| `edit` \| ... | true  | -              | 아이콘 종류                |
| `size`    | `number`                                      | false | `16`           | 크기(px)                   |
| `color`   | `string`                                      | false | `currentColor` | 색상(기본: 부모 텍스트 색) |
| `loading` | `boolean`                                     | false | `false`        | 로딩 표시 및 동작 차단     |

`onClick`이 있으면 hover 효과가 적용되며 Enter와 Space 키로도 실행됩니다. `disabled` 또는 `loading`이면 클릭과 키보드 실행을 막습니다.

### Tag

```tsx
<Tag color="success" variant="filled">텍스트</Tag>
<Tag prefixIcon={<Icon icon="edit" />} suffixIcon={<Icon icon="close" />}>텍스트</Tag>
```

| prop         | 타입                                                                         | 필수  | 기본값   | 설명                           |
| ------------ | ---------------------------------------------------------------------------- | ----- | -------- | ------------------------------ |
| `color`      | `dark` \| `success` \| `navy` \| `danger` \| `gray` \| `purple` \| `primary` | false | `dark`   | 색상                           |
| `variant`    | `filled` \| `outlined` \| `solid` \| `soft-outlined`                         | false | `filled` | 스타일                         |
| `prefixIcon` | `ReactNode`                                                                  | false | -        | 앞쪽 아이콘. 16x16 영역에 표시 |
| `suffixIcon` | `ReactNode`                                                                  | false | -        | 뒤쪽 아이콘. 16x16 영역에 표시 |

Button과 달리 아이콘의 `onClick`을 무시하지 않습니다(닫기 버튼처럼 상호작용 가능해야 하는 경우가 있어서).

### Toggle

```tsx
const [checked, setChecked] = useState(false);

<Toggle checked={checked} onChange={setChecked} />;
```

| prop       | 타입                         | 필수  | 기본값  | 설명                                 |
| ---------- | ---------------------------- | ----- | ------- | ------------------------------------ |
| `size`     | `lg` \| `md` \| `sm`         | false | `md`    | 크기                                 |
| `checked`  | `boolean`                    | true  | -       | 컨트롤드 컴포넌트라 반드시 넘겨야 함 |
| `loading`  | `boolean`                    | false | `false` | thumb 안에 로딩 표시 및 동작 차단    |
| `onChange` | `(checked: boolean) => void` | false | -       | 클릭 시 반전된 값과 함께 호출        |
| `disabled` | `boolean`                    | false | `false` | 비활성화                             |

### Label

```tsx
<Label label="이름" size="md" required />
```

| prop       | 타입                 | 필수  | 기본값  | 설명               |
| ---------- | -------------------- | ----- | ------- | ------------------ |
| `size`     | `lg` \| `md` \| `sm` | false | `md`    | 크기               |
| `required` | `boolean`            | false | `false` | 뒤에 빨간 `*` 표시 |
| `label`    | `ReactNode`          | true  | -       | 라벨 텍스트        |

`htmlFor` 등 나머지 네이티브 `<label>` props도 그대로 지원합니다. Input 전용이 아니라 Select, CheckBox 등 다른 필드에서도 재사용하는 독립 컴포넌트입니다.

### ErrorMessage

```tsx
<ErrorMessage errorMessage={error ? "형식이 올바르지 않습니다" : undefined} />
```

| prop           | 타입        | 필수  | 기본값 | 설명                                                    |
| -------------- | ----------- | ----- | ------ | ------------------------------------------------------- |
| `errorMessage` | `ReactNode` | false | -      | 에러 메시지. 없으면(`undefined`/`false`) 접혀서 안 보임 |

`errorMessage`가 생기면 위→아래로 슬라이드하며 나타나고, 없어지면 반대로 슬라이드업하며 사라집니다. 긴 문장은 줄바꿈됩니다. Label과 마찬가지로 Input 전용이 아닌 독립 컴포넌트입니다.

### Input

```tsx
const [value, setValue] = useState("");

const validateEmail = (value: string) => (value.includes("@") ? "" : "형식이 올바르지 않습니다");

<Input
  label="이메일"
  required
  value={value}
  errorMessage={validateEmail}
  onChange={setValue}
  allowClear
  maxLength={30}
/>;
```

| prop           | 타입                                                          | 필수  | 기본값    | 설명                                                          |
| -------------- | ------------------------------------------------------------- | ----- | --------- | ------------------------------------------------------------- |
| `size`         | `lg` \| `md` \| `sm`                                          | false | `md`      | 크기                                                          |
| `variant`      | `default` \| `filled` \| `borderless` \| `underlined`         | false | `default` | 스타일                                                        |
| `label`        | `ReactNode`                                                   | false | -         | 있으면 위에 [Label](#label) 렌더링                            |
| `required`     | `boolean`                                                     | false | `false`   | 실제 input에 required 적용 + Label이 있으면 `*` 표시          |
| `password`     | `boolean`                                                     | false | `false`   | 입력값을 가리고 눈 아이콘으로 표시 상태 전환                  |
| `errorMessage` | `ReactNode` \| `(value: string) => string \| Promise<string>` | false | -         | 오류를 바로 표시하거나 동기·비동기 검증 후 반환된 오류를 표시 |
| `disabled`     | `boolean`                                                     | false | `false`   | 비활성화                                                      |
| `allowClear`   | `boolean`                                                     | false | `false`   | 값 있을 때 지우기 버튼. 지운 뒤 input으로 포커스 복귀         |
| `showCount`    | `boolean`                                                     | false | `false`   | 글자 수 표시. `maxLength`가 있으면 `n / maxLength` 형식       |
| `maxLength`    | `number`                                                      | false | -         | 최대 글자수. 한글 IME 조합 중에도 자체 검증해서 강제함        |
| `prefixIcon`   | `ReactNode`                                                   | false | -         | 앞쪽 아이콘                                                   |
| `suffixIcon`   | `ReactNode`                                                   | false | -         | 뒤쪽 아이콘                                                   |
| `className`    | `string`                                                      | false | -         | 최상위 요소 클래스                                            |
| `onChange`     | `(value: string) => void`                                     | false | -         | 입력값이 바뀔 때 변경된 입력값과 함께 호출                    |
| `onBlur`       | `FocusEventHandler<HTMLInputElement>`                         | false | -         | 포커스가 빠질 때 이벤트와 함께 호출                           |
| `onEnter`      | `() => void`                                                  | false | -         | Enter를 누를 때 호출                                          |

`placeholder`, `disabled` 등 나머지 네이티브 `<input>` props도 지원합니다.

### Checkbox

```tsx
<Checkbox label="레이블" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
```

| prop      | 타입        | 필수  | 기본값  | 설명                                                                                              |
| --------- | ----------- | ----- | ------- | ------------------------------------------------------------------------------------------------- |
| `label`   | `ReactNode` | false | -       | 있으면 오른쪽에 라벨 텍스트 렌더링                                                                |
| `error`   | `boolean`   | false | `false` | 테두리/체크 색이 danger 색으로 바뀜                                                               |
| `checked` | `boolean`   | false | -       | 나머지 네이티브 `<input type="checkbox">` props(`checked`/`onChange`/`disabled` 등)도 그대로 지원 |

### Radio

```tsx
<Radio name="group" label="옵션 A" checked={value === "a"} onChange={() => setValue("a")} />
```

| prop    | 타입        | 필수  | 기본값  | 설명                                |
| ------- | ----------- | ----- | ------- | ----------------------------------- |
| `label` | `ReactNode` | false | -       | 있으면 오른쪽에 라벨 텍스트 렌더링  |
| `error` | `boolean`   | false | `false` | 테두리/선택 색이 danger 색으로 바뀜 |

나머지 네이티브 `<input type="radio">` props(`name`/`checked`/`onChange`/`disabled` 등)도 그대로 지원합니다. 같은 그룹은 `name`으로 묶습니다.

### Breadcrumb

페이지 내 현재 위치와 이동 경로를 한눈에 보여줘요. 구분자는 `/`로 고정되어 있으며 드롭다운은 제공하지 않아요. 각 항목에는 링크, 아이콘과 색상을 선택적으로 지정할 수 있어요.

```tsx
<Breadcrumb
  items={[
    { title: "홈", href: "/", icon: <Icon icon="home" /> },
    { title: "컴포넌트", href: "/components", color: "#0062df" },
    { title: "Breadcrumb", color: "#111" },
  ]}
/>
```

`href` 또는 `onClick`이 있는 항목에 마우스 호버와 키보드 포커스 디자인이 적용돼요. 링크에는 `target`, `rel` 등을 전달할 수 있고, 각 항목에 `className`, `style`을 지정할 수 있어요.

### Illustrations

빈 목록, 검색 결과 없음, 오류와 네트워크 상태 등 화면 상태를 이미지와 문구로 보여줘요. `type`으로 상황을 선택하고 `size`로 크기를 조절할 수 있어요.

### Table

Ant Design과 익숙한 핵심 API 사용 패턴을 제공하는 독립 Table입니다. `dataSource`/`columns`/`rowKey` 기본 사용부터 정렬·필터·행 선택(체크박스/라디오/트리)·확장 행·페이지네이션·고정 헤더와 컬럼·반응형 컬럼·행과 열 드래그·가상 스크롤·병합 셀·`ref.scrollTo`를 제공합니다. Ant Design 전체 구현과 완전히 동일하다는 의미는 아니며, 실제 지원 범위와 예제는 Storybook을 기준으로 합니다.

```tsx
<Table<Member>
  dataSource={members}
  columns={columns}
  rowSelection={{}}
  pagination={{ defaultPageSize: 10 }}
/>
```

체크박스/라디오 행 선택 UI는 Table 내부에 인라인으로 구현되어 있으며 별도로 export하지 않습니다(다른 컴포넌트로 자유롭게 교체 가능하도록). `@dnd-kit/core`/`@dnd-kit/sortable`로 행·열 드래그 정렬을 조합하는 예시는 Storybook의 `Drag Row Sorting`/`Drag Column Sorting` 스토리를 참조합니다. 전체 prop과 세부 기능별 예시(API Compatibility/Expandable/Layout/Pagination/Selection/Sorting & Filtering)는 Storybook 참조.

### Flex

가로·세로 방향, 정렬, 줄바꿈과 간격을 설정해 여러 요소를 배치합니다.

```tsx
import { Button, Flex } from "@taejin-k/wizard-design";

<Flex align="center" gap={8} justify="space-between" wrap>
  <Button>취소</Button>
  <Button variant="primary">저장</Button>
</Flex>;
```

`gap`은 px 단위의 숫자로 설정합니다. `vertical`로 세로 배치를 만들고, `component`로 최상위 HTML 요소를 변경할 수 있습니다.

### Segmented

여러 선택지 중 하나를 빠르게 전환합니다. `value`, `label`과 선택적인 아이콘·비활성화·Tooltip을 포함한 객체 배열을 전달합니다.

```tsx
import { useState, type Key } from "react";
import { Segmented } from "@taejin-k/wizard-design";

function PeriodSegmented() {
  const [period, setPeriod] = useState<Key>("week");

  return (
    <Segmented
      options={[
        { value: "day", label: "일간" },
        { value: "week", label: "주간" },
        { value: "month", label: "월간" },
      ]}
      value={period}
      onChange={setPeriod}
    />
  );
}
```

`size`, `fullWidth`, `disabled`, `vertical`을 지원하며 각 객체 옵션에는 `label`, `icon`, `disabled`, `tooltip`을 설정할 수 있습니다.

### Modal

기본 Modal은 `open` 상태를 외부에서 관리합니다.

```tsx
import { useState } from "react";
import { Button, Modal } from "@taejin-k/wizard-design";

function BasicModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>열기</Button>
      <Modal
        open={open}
        title="구성원 삭제"
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      >
        선택한 구성원을 삭제할까요?
      </Modal>
    </>
  );
}
```

간단한 확인창은 정적 메서드로 열 수 있습니다.

```tsx
Modal.confirm({
  title: "구성원 삭제",
  content: "삭제한 구성원은 복구할 수 없어요.",
  onConfirm: async () => {
    await fetch("/api/members/1", { method: "DELETE" });
  },
});
```

앱의 Context가 필요한 내용은 선언형 `<Modal>` 안에 렌더링하세요. 정적 메서드는 별도 React 루트에서 실행되며 `useModal` Hook API는 제공하지 않습니다.

`Modal.info`, `Modal.success`, `Modal.error`, `Modal.warning`, `Modal.confirm`, `Modal.destroyAll`을 제공하며 반환값의 `update`, `destroy`와 `await`도 지원합니다.

### Drawer

화면 가장자리에서 패널을 엽니다.

```tsx
import { useState } from "react";
import { Button, Drawer } from "@taejin-k/wizard-design";

function BasicDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>상세 보기</Button>
      <Drawer open={open} title="구성원 상세" onClose={() => setOpen(false)}>
        구성원 정보를 표시합니다.
      </Drawer>
    </>
  );
}
```

`placement`, `size`, `extra`, `footer`, `push`, `resizable`, `mask`, `keyboard`, `scrollLock`, `forceRender`, `destroyOnHidden`을 지원합니다. 가로·세로 크기는 방향에 따라 `size`로 지정합니다.

Modal과 Drawer의 `mask={false}`는 dimmed를 숨기지 않고 배경 클릭 닫기만 막습니다. `keyboard={false}`는 Escape 닫기만 막으며 키보드 포커스는 패널 안에 유지합니다.

### Message

작업 결과나 짧은 안내를 화면 위에 표시합니다.

```tsx
import { Button, message } from "@taejin-k/wizard-design";

<Button onClick={() => message.success({ content: "저장했어요." })}>저장</Button>;
```

`message.success`, `message.error`, `message.info`, `message.warning`, `message.loading`, `message.open`, `message.destroy`를 제공합니다. 각 호출은 `MessageConfig` 객체를 받으며 반환하는 함수로 직접 닫거나 닫힘을 `await`할 수 있습니다. `duration`은 초 단위이고 `0`은 자동 닫힘을 끕니다. 동일한 `key`로 다시 호출하면 내용을 갱신합니다. `useMessage`와 전역 `config` API는 제공하지 않습니다.

### Notification

제목, 상세 내용과 작업 버튼을 포함한 알림을 화면 모서리에 표시합니다.

```tsx
import { Button, notification } from "@taejin-k/wizard-design";

<Button
  onClick={() =>
    notification.success({
      title: "저장 완료",
      description: "변경사항을 저장했어요.",
      placement: "topRight",
    })
  }
>
  저장
</Button>;
```

`notification.open`, 상태별 메서드와 `destroy`를 지원하며 `actions`, `duration`, `showProgress`, `pauseOnHover`, `placement`, `closable`을 설정할 수 있습니다. `duration`은 초 단위이고 `0`은 자동 닫힘을 끕니다. 동일한 `key`로 내용을 갱신하며 `useNotification`과 전역 `config` API는 제공하지 않습니다.

### 입력값 검증과 호환성

- DatePicker·RangePicker의 빠른 선택에도 날짜 제한이 적용됩니다. 시간 선택은 비활성 시·분·초를 확정할 수 없습니다.
- ColorPicker는 범위를 벗어난 RGB·HSB·alpha 입력을 확정하지 않습니다. 올바른 값으로 수정하면 `onChange`가 호출됩니다.
- 날짜·시간 입출력은 Dayjs를 사용하고, 빈 단일 값·빈 범위는 `undefined`, 다중 선택의 빈 값은 `[]`입니다.
- React 18과 19를 지원합니다. SSR에서는 ESM/CJS 양쪽으로 import할 수 있으며, 정적 알림 메서드는 브라우저 이벤트에서 호출하세요.

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
