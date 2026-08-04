# Orbit Design System

Ant Design에 의존하지 않고 React, TypeScript, Tailwind CSS로 구현한 디자인 시스템입니다. Table과 Breadcrumb 모두 Ant Design의 익숙한 API 패턴을 따릅니다.

## Quick start

```tsx
import { Breadcrumb, Table, type TableColumnsType } from '@taejin-k/orbit-design-system'
import '@taejin-k/orbit-design-system/style'

type User = { key: string; name: string; age: number }

const columns: TableColumnsType<User> = [
  { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: 'Age', dataIndex: 'age', key: 'age' },
]

<Table<User>
  dataSource={[{ key: '1', name: 'Mike', age: 32 }]}
  columns={columns}
  rowSelection={{}}
  pagination={{ defaultPageSize: 10 }}
/>

<Breadcrumb items={[
  { title: 'Home', href: '/' },
  { title: 'Components', path: 'components' },
  { title: 'Breadcrumb' },
]} />
```

`defaultPageSize`는 사용자가 페이지 크기를 바꿀 수 있는 비제어 초기값입니다. `pageSize`를 전달하면 Ant Design과 마찬가지로 제어 모드가 되므로 `onChange`에서 갱신한 값을 다시 전달해야 합니다.

## Storybook

```bash
npm install
npm run storybook
```

Open <http://localhost:6006> and select **Design System / Table** or **Design System / Breadcrumb**.

The Storybook contains 120 focused component stories: 97 for Table and 23 for Breadcrumb. Every component story shows a short feature explanation directly in Canvas. Table covers layout, data interaction and composition APIs; Breadcrumb independently covers paths, params, custom rendering, separators, Dropdown behavior, semantic styling, legacy APIs and accessibility.

## Library structure

```text
src/
├── components/
│   ├── Breadcrumb/
│   │   ├── Breadcrumb.tsx
│   │   ├── Breadcrumb.types.ts
│   │   ├── Breadcrumb.css
│   │   ├── Breadcrumb.test.tsx
│   │   ├── Breadcrumb.stories.tsx
│   │   └── index.ts
│   └── Table/
│       ├── Table.tsx
│       ├── Table.types.ts
│       ├── Table.utils.ts
│       ├── Table.css
│       ├── Table.test.tsx
│       ├── Table.stories.tsx
│       └── index.ts
├── styles/
│   ├── tokens.css
│   └── index.css
├── playground/
│   └── data.tsx
└── index.ts
```

`npm run build` creates publishable ESM, CommonJS, declaration, and CSS entries under `dist/`.

## Supported feature set

### Breadcrumb

- antd-style `items`, `href`, cumulative `path`, typed `params`, `itemRender`
- custom and explicit separators, icon/Rich ReactNode titles
- Dropdown menu with hover/click, controlled state, placement and portal
- outside click, Escape, keyboard opening and focus restoration
- semantic `classNames` and `styles`, native nav props and ref
- deprecated `routes`, `Breadcrumb.Item`, `Breadcrumb.Separator`, route `children` compatibility

### Table

- antd-style generic API: `dataSource`, `columns`, `rowKey`
- antd-style JSX sugar: `Table.Column`, `Table.ColumnGroup`
- local and controlled sorting, multi-column sorter priorities
- filter menus, single/multiple filter, filter search, controlled filters
- checkbox/radio row selection, controlled selection, disabled rows, custom selection cells
- numbered pagination, controlled/remote pagination, page-size selector, quick jumper, simple mode, placement and total renderer
- expandable rows, tree data, controlled expansion, expand-on-row-click
- grouped headers, `colSpan`, `rowSpan`, nested `dataIndex`
- fixed columns, sticky header, horizontal/vertical scroll
- 1,000+ row virtual windowing and imperative `scrollTo`
- responsive and hidden columns
- ellipsis, alignment, custom render, `onCell`, `onHeaderCell`
- title, footer, `Table.Summary.Row/Cell`, empty and loading states
- large/medium/small density, bordered and hover modes
- `onChange`, `onRow`, `onHeaderRow`, `onScroll`
- semantic `classNames` and `styles` customization
- explicit light/dark theme tokens and accessible labels/focus behavior
- dnd-kit sortable composition through antd-compatible `components.body.row`

## API compatibility

The implementation is audited against Ant Design 6.5.3. See the property-by-property matrices for [Table](docs/table-api-compatibility.md) and [Breadcrumb](docs/breadcrumb-api-compatibility.md). They clearly separate full support from practical subsets of dependent component props and features awaiting a product decision.

Like Ant Design, editable cells/rows and drag sorting are composition patterns rather than mandatory table state. The Storybook drag example uses dnd-kit transforms so neighboring rows animate into place while dragging.

## Validation

```bash
npm test
npm run lint
npm run build
npm run build-storybook
```

## Design tokens

Tailwind CSS v4 and `@tailwindcss/vite` provide the build pipeline. Component defaults use stable `orbit-*` classes and CSS-variable tokens; consumers can pass Tailwind utilities through root `className` or semantic `classNames/styles`. No Ant Design CSS or runtime code is included.

Override the CSS variables at an application or theme boundary:

```css
.my-brand {
  --orbit-color-primary: #0f766e;
  --orbit-color-border: #d1d5db;
  --orbit-color-fill-alter: #f9fafb;
  --orbit-color-row-selected: #ccfbf1;
}
```
