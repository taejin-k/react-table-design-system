import type { ColumnsType } from "./Table.types";

export type Member = {
  key: string;
  name: string;
  role: string;
  team: string;
  status: "활성" | "휴가" | "대기";
  projects: number;
  joinedAt: string;
  children?: Member[];
};

export const members: Member[] = [
  { key: "M-1001", name: "김민준", role: "Product Designer", team: "Design", status: "활성", projects: 8, joinedAt: "2023-02-14" },
  { key: "M-1002", name: "이서연", role: "Frontend Engineer", team: "Platform", status: "활성", projects: 12, joinedAt: "2022-08-03" },
  { key: "M-1003", name: "박지호", role: "Product Manager", team: "Growth", status: "휴가", projects: 6, joinedAt: "2024-01-22" },
  { key: "M-1004", name: "최유진", role: "Data Analyst", team: "Data", status: "활성", projects: 9, joinedAt: "2021-11-19" },
  { key: "M-1005", name: "정도윤", role: "Backend Engineer", team: "Platform", status: "대기", projects: 4, joinedAt: "2024-05-08" },
  { key: "M-1006", name: "한지우", role: "UX Researcher", team: "Design", status: "활성", projects: 7, joinedAt: "2023-07-01" },
  { key: "M-1007", name: "윤하준", role: "QA Engineer", team: "Product", status: "활성", projects: 10, joinedAt: "2022-04-27" },
  { key: "M-1008", name: "송채원", role: "Content Designer", team: "Design", status: "휴가", projects: 5, joinedAt: "2023-10-12" },
  { key: "M-1009", name: "오시우", role: "iOS Engineer", team: "Mobile", status: "활성", projects: 11, joinedAt: "2021-09-06" },
  { key: "M-1010", name: "강수아", role: "Android Engineer", team: "Mobile", status: "대기", projects: 3, joinedAt: "2024-06-17" },
  { key: "M-1011", name: "임주원", role: "DevOps Engineer", team: "Platform", status: "활성", projects: 14, joinedAt: "2020-12-02" },
  { key: "M-1012", name: "백예린", role: "Marketing Lead", team: "Growth", status: "활성", projects: 8, joinedAt: "2022-06-15" },
];

const statusPillClass: Record<Member["status"], string> = {
  활성: "bg-[#f6ffed] text-[#237804]",
  휴가: "bg-[#fffbe6] text-[#ad4e00]",
  대기: "bg-[#f5f5f5] text-[#999]",
};

export const columns: ColumnsType<Member> = [
  { title: "이름", dataIndex: "name", key: "name", width: 150, fixed: "left", sorter: (a, b) => a.name.localeCompare(b.name), ellipsis: true },
  { title: "직무", dataIndex: "role", key: "role", width: 190, ellipsis: true, responsive: ["sm"] },
  {
    title: "팀",
    dataIndex: "team",
    key: "team",
    width: 120,
    filters: ["Design", "Platform", "Growth", "Data", "Product", "Mobile"].map((value) => ({ text: value, value })),
    onFilter: (value, record) => record.team === value,
    filterSearch: true,
  },
  {
    title: "상태",
    dataIndex: "status",
    key: "status",
    width: 100,
    filters: ["활성", "휴가", "대기"].map((value) => ({ text: value, value })),
    onFilter: (value, record) => record.status === value,
    render: (value) => (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] leading-5 ${statusPillClass[value as Member["status"]]}`}>{String(value)}</span>
    ),
  },
  { title: "프로젝트", dataIndex: "projects", key: "projects", width: 110, align: "right", sorter: { compare: (a, b) => a.projects - b.projects, multiple: 2 } },
  { title: "합류일", dataIndex: "joinedAt", key: "joinedAt", width: 140, sorter: { compare: (a, b) => a.joinedAt.localeCompare(b.joinedAt), multiple: 1 }, responsive: ["md"] },
];

export const largeData: Member[] = Array.from({ length: 1000 }, (_, index) => ({
  key: `V-${index + 1}`,
  name: `구성원 ${String(index + 1).padStart(4, "0")}`,
  role: index % 2 ? "Frontend Engineer" : "Product Designer",
  team: ["Design", "Platform", "Growth"][index % 3],
  status: index % 7 === 0 ? "휴가" : "활성",
  projects: index % 15,
  joinedAt: `202${index % 5}-0${(index % 9) + 1}-12`,
}));
