# Orbit Table Design System

Ant Design에 의존하지 않고 React, TypeScript, Tailwind CSS로 구현한 테이블 디자인 시스템입니다. 사용법은 Ant Design Table의 익숙한 `dataSource` + `columns` 패턴을 따릅니다.

## Quick start

```tsx
import { Table, type TableColumnsType } from 'react-table-design-system'
import 'react-table-design-system/styles.css'

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
- dark color-scheme tokens and accessible labels/focus behavior

Like Ant Design, editable cells/rows and drag sorting are composition patterns rather than mandatory table state. Build them with `render`, `onCell`, `onRow`, and controlled `dataSource`.

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
  --orbit-primary: #0f766e;
  --orbit-border: #d1d5db;
  --orbit-header: #f9fafb;
  --orbit-selected: #ccfbf1;
}
```
