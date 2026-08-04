# Orbit Table Design System

Ant Design에 의존하지 않고 React, TypeScript, Tailwind CSS로 구현한 테이블 디자인 시스템입니다. 사용법은 Ant Design Table의 익숙한 `dataSource` + `columns` 패턴을 따릅니다.

## Quick start

```tsx
import { Table, type TableColumnsType } from '@taejin-k/orbit-design-system'
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
  pagination={{ pageSize: 10 }}
/>
```

## Storybook

```bash
npm install
npm run storybook
```

Open <http://localhost:6006> and select **Design System / Table**.

## Library structure

```text
src/
├── components/
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

- antd-style generic API: `dataSource`, `columns`, `rowKey`
- local and controlled sorting, multi-column sorter priorities
- filter menus, single/multiple filter, filter search, controlled filters
- checkbox/radio row selection, controlled selection, disabled rows, custom selection cells
- pagination, controlled pagination, page-size selector, placement and total renderer
- expandable rows, tree data, controlled expansion, expand-on-row-click
- grouped headers, `colSpan`, `rowSpan`, nested `dataIndex`
- fixed columns, sticky header, horizontal/vertical scroll
- 1,000+ row virtual windowing and imperative `scrollTo`
- responsive and hidden columns
- ellipsis, alignment, custom render, `onCell`, `onHeaderCell`
- title, footer, summary, empty and loading states
- large/medium/small density, bordered and hover modes
- `onChange`, `onRow`, `onHeaderRow`, `onScroll`
- semantic `classNames` and `styles` customization
- explicit light/dark theme tokens and accessible labels/focus behavior
- dnd-kit sortable composition through antd-compatible `components.body.row`

Like Ant Design, editable cells/rows and drag sorting are composition patterns rather than mandatory table state. The Storybook drag example uses dnd-kit transforms so neighboring rows animate into place while dragging.

## Validation

```bash
npm test
npm run lint
npm run build
npm run build-storybook
```

## Design tokens

Override the CSS variables at an application or theme boundary:

```css
.my-brand {
  --orbit-color-primary: #0f766e;
  --orbit-color-border: #d1d5db;
  --orbit-color-fill-alter: #f9fafb;
  --orbit-color-row-selected: #ccfbf1;
}
```
