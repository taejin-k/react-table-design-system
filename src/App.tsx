import { DataTable, type Column } from './components/DataTable'

type Member = {
  id: string
  name: string
  role: string
  team: string
  status: '활성' | '휴가' | '대기'
  projects: number
  joinedAt: string
}

const people: Member[] = [
  { id: 'M-1001', name: '김민준', role: 'Product Designer', team: 'Design', status: '활성', projects: 8, joinedAt: '2023-02-14' },
  { id: 'M-1002', name: '이서연', role: 'Frontend Engineer', team: 'Platform', status: '활성', projects: 12, joinedAt: '2022-08-03' },
  { id: 'M-1003', name: '박지호', role: 'Product Manager', team: 'Growth', status: '휴가', projects: 6, joinedAt: '2024-01-22' },
  { id: 'M-1004', name: '최유진', role: 'Data Analyst', team: 'Data', status: '활성', projects: 9, joinedAt: '2021-11-19' },
  { id: 'M-1005', name: '정도윤', role: 'Backend Engineer', team: 'Platform', status: '대기', projects: 4, joinedAt: '2024-05-08' },
  { id: 'M-1006', name: '한지우', role: 'UX Researcher', team: 'Design', status: '활성', projects: 7, joinedAt: '2023-07-01' },
  { id: 'M-1007', name: '윤하준', role: 'QA Engineer', team: 'Product', status: '활성', projects: 10, joinedAt: '2022-04-27' },
  { id: 'M-1008', name: '송채원', role: 'Content Designer', team: 'Design', status: '휴가', projects: 5, joinedAt: '2023-10-12' },
  { id: 'M-1009', name: '오시우', role: 'iOS Engineer', team: 'Mobile', status: '활성', projects: 11, joinedAt: '2021-09-06' },
  { id: 'M-1010', name: '강수아', role: 'Android Engineer', team: 'Mobile', status: '대기', projects: 3, joinedAt: '2024-06-17' },
  { id: 'M-1011', name: '임주원', role: 'DevOps Engineer', team: 'Platform', status: '활성', projects: 14, joinedAt: '2020-12-02' },
  { id: 'M-1012', name: '백예린', role: 'Marketing Lead', team: 'Growth', status: '활성', projects: 8, joinedAt: '2022-06-15' },
]

const columns: Column<Member>[] = [
  { key: 'name', title: '이름', width: 160, sortable: true, filterable: true, editable: true, fixed: 'left', render: (value, row) => <div><strong className="block text-slate-900">{String(value)}</strong><span className="text-xs text-slate-400">{row.id}</span></div> },
  { key: 'role', title: '직무', width: 200, sortable: true, filterable: true, editable: true },
  { key: 'team', title: '팀', width: 130, sortable: true, filterable: true },
  { key: 'status', title: '상태', width: 110, sortable: true, render: (value) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${value === '활성' ? 'bg-emerald-50 text-emerald-700' : value === '휴가' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{String(value)}</span> },
  { key: 'projects', title: '프로젝트', width: 120, sortable: true, editable: true },
  { key: 'joinedAt', title: '합류일', width: 140, sortable: true },
]

export default function App() {
  return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-8 lg:px-12">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-indigo-600">Orbit Design System</p><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Data Table</h1><p className="mt-2 max-w-2xl text-slate-500">antd 없이 React와 Tailwind CSS로 만든 접근성 중심의 데이터 테이블입니다.</p></div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">React 19 · TypeScript · Tailwind</div>
      </header>
      <div className="mb-4 grid gap-3 sm:grid-cols-3"><Stat label="전체 구성원" value="12" /><Stat label="활성 사용자" value="9" /><Stat label="진행 프로젝트" value="97" /></div>
      <DataTable data={people} columns={columns} pageSize={6} expandable={(row) => <div><strong className="text-slate-900">{row.name} 상세 정보</strong><p className="mt-1 text-sm text-slate-500">{row.team} 팀의 {row.role}이며 현재 {row.projects}개 프로젝트에 참여하고 있습니다.</p></div>} />
      <p className="mt-4 text-xs text-slate-400">헤더를 눌러 정렬하고, 셀을 직접 편집하거나 행을 펼쳐보세요. 열 설정에서 표시 항목을 바꿀 수 있습니다.</p>
    </div>
  </main>
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4"><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>
}
