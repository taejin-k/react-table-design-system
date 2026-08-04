import { columns, members, type Member } from './demoData'
import { Table } from './table'

export default function App() {
  return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><header className="mb-8"><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-indigo-600">Orbit Design System</p><h1 className="text-4xl font-black tracking-tight">Table</h1><p className="mt-2 text-slate-500">Ant Design과 익숙한 API, 독립적인 React·Tailwind 구현.</p></header><Table<Member> dataSource={members} columns={columns} rowSelection={{}} pagination={{ pageSize: 6, showSizeChanger: true, pageSizeOptions: [6, 12] }} expandable={{ expandedRowRender: (record) => <p><strong>{record.name}</strong> · {record.team} 팀 · {record.projects}개 프로젝트</p> }} scroll={{ x: 900 }} bordered /></div></main>
}
