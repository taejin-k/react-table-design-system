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
  {
    key: "M-1001",
    name: "김민준",
    role: "Product Designer",
    team: "Design",
    status: "활성",
    projects: 8,
    joinedAt: "2023-02-14",
  },
  {
    key: "M-1002",
    name: "이서연",
    role: "Frontend Engineer",
    team: "Platform",
    status: "활성",
    projects: 12,
    joinedAt: "2022-08-03",
  },
  {
    key: "M-1003",
    name: "박지호",
    role: "Product Manager",
    team: "Growth",
    status: "휴가",
    projects: 6,
    joinedAt: "2024-01-22",
  },
  {
    key: "M-1004",
    name: "최유진",
    role: "Data Analyst",
    team: "Data",
    status: "활성",
    projects: 9,
    joinedAt: "2021-11-19",
  },
  {
    key: "M-1005",
    name: "정도윤",
    role: "Backend Engineer",
    team: "Platform",
    status: "대기",
    projects: 4,
    joinedAt: "2024-05-08",
  },
  {
    key: "M-1006",
    name: "한지우",
    role: "UX Researcher",
    team: "Design",
    status: "활성",
    projects: 7,
    joinedAt: "2023-07-01",
  },
  {
    key: "M-1007",
    name: "윤하준",
    role: "QA Engineer",
    team: "Product",
    status: "활성",
    projects: 10,
    joinedAt: "2022-04-27",
  },
  {
    key: "M-1008",
    name: "송채원",
    role: "Content Designer",
    team: "Design",
    status: "휴가",
    projects: 5,
    joinedAt: "2023-10-12",
  },
  {
    key: "M-1009",
    name: "오시우",
    role: "iOS Engineer",
    team: "Mobile",
    status: "활성",
    projects: 11,
    joinedAt: "2021-09-06",
  },
  {
    key: "M-1010",
    name: "강수아",
    role: "Android Engineer",
    team: "Mobile",
    status: "대기",
    projects: 3,
    joinedAt: "2024-06-17",
  },
  {
    key: "M-1011",
    name: "임주원",
    role: "DevOps Engineer",
    team: "Platform",
    status: "활성",
    projects: 14,
    joinedAt: "2020-12-02",
  },
  {
    key: "M-1012",
    name: "백예린",
    role: "Marketing Lead",
    team: "Growth",
    status: "활성",
    projects: 8,
    joinedAt: "2022-06-15",
  },
];

export const teamFilters = ["Design", "Platform", "Growth", "Data", "Product", "Mobile"].map(
  (value) => ({ text: value, value }),
);

export const statusFilters = ["활성", "휴가", "대기"].map((value) => ({ text: value, value }));

export const columns: ColumnsType<Member> = [
  {
    key: "name",
    dataIndex: "name",
    title: "이름",
    width: 150,
  },
  { key: "role", dataIndex: "role", title: "직무", minWidth: 190 },
  {
    key: "team",
    dataIndex: "team",
    title: "팀",
    width: 120,
  },
  {
    key: "projects",
    dataIndex: "projects",
    title: "프로젝트",
    width: 110,
  },
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
