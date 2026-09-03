import type { Meta, StoryObj } from "@storybook/react";

type ColorItem = {
  hex: string;
  name: string;
  description: string;
  components: string[];
  source: string;
  line: number;
};

type ColorGroup = {
  title: string;
  description: string;
  colors: ColorItem[];
};

const repositoryUrl = "https://github.com/taejin-k/react-table-design-system/blob/main";

const solidGroups: ColorGroup[] = [
  {
    title: "Shared Tinted Surface",
    description: "여러 컴포넌트가 함께 사용하지만 아직 token으로 정리하지 않은 색상이에요.",
    colors: [
      {
        hex: "#EEF0F8",
        name: "Navy tint / selected row",
        description: "Navy Tag 배경과 Table 선택 행 배경에 함께 사용되고 있어요.",
        components: ["Tag", "Table"],
        source: "src/components/Table/Table.tsx",
        line: 1302,
      },
    ],
  },
  {
    title: "Neutral",
    description: "텍스트, 경계선, 비활성 상태, 배경과 구분선에 사용되는 중립 색상이에요.",
    colors: [
      {
        hex: "#111111",
        name: "Primary text",
        description: "대부분의 컴포넌트에서 본문과 강조 글자에 사용해요.",
        components: [
          "Button",
          "Input",
          "TextArea",
          "Select",
          "DatePicker",
          "TimePicker",
          "Table",
          "Tabs",
          "Menu",
          "Dropdown",
          "Tree",
          "Modal",
          "Drawer",
          "Message",
          "Notification",
          "Popover",
          "Tooltip",
          "Upload",
          "Avatar",
          "Breadcrumb",
          "Checkbox",
          "Radio",
          "Calendar",
          "Collapse",
          "ColorPicker",
          "Segmented",
          "Tag",
        ],
        source: "src/components/Table/Table.tsx",
        line: 123,
      },
      {
        hex: "#303030",
        name: "Dark hover",
        description: "Dark 버튼에 마우스를 올렸을 때 사용해요.",
        components: ["Button"],
        source: "src/components/Button/Button.tsx",
        line: 115,
      },
      {
        hex: "#666666",
        name: "Secondary text",
        description: "보조 본문, 비선택 탭과 설명 글자에 사용해요.",
        components: [
          "Badge",
          "Upload",
          "Avatar",
          "Segmented",
          "Calendar",
          "Tabs",
          "OverlayCloseButton",
        ],
        source: "src/components/Tabs/Tabs.tsx",
        line: 293,
      },
      {
        hex: "#777777",
        name: "Muted text strong",
        description: "Grey Tag와 비교적 진한 보조 정보에 사용해요.",
        components: ["Tag", "Select", "DatePicker"],
        source: "src/components/Tag/Tag.tsx",
        line: 96,
      },
      {
        hex: "#8C8C8C",
        name: "Upload muted",
        description: "Upload의 첨부·다운로드·삭제 아이콘과 안내 문구에 사용해요.",
        components: ["Upload"],
        source: "src/components/Upload/Upload.tsx",
        line: 452,
      },
      {
        hex: "#8F8F8F",
        name: "Scrollbar hover",
        description: "스크롤바 thumb hover와 TextArea resize 아이콘에 사용해요.",
        components: ["Table", "Drawer", "Calendar", "TextArea"],
        source: "src/styles/table-scrollbar.css",
        line: 51,
      },
      {
        hex: "#999999",
        name: "Placeholder",
        description: "placeholder, 보조 아이콘, 카운터와 페이지 정보에 사용해요.",
        components: [
          "Upload",
          "Tag",
          "Breadcrumb",
          "Select",
          "Menu",
          "Table",
          "Pagination",
          "Button",
          "TextArea",
          "Toggle",
          "DatePicker",
          "Input",
          "Calendar",
          "TimePicker",
          "Dropdown",
        ],
        source: "src/components/Input/Input.tsx",
        line: 111,
      },
      {
        hex: "#A8A8A8",
        name: "Scrollbar",
        description: "공통 scrollbar thumb의 기본색이에요.",
        components: ["Table", "Drawer", "Calendar", "TextArea"],
        source: "src/styles/table-scrollbar.css",
        line: 42,
      },
      {
        hex: "#AAAAAA",
        name: "Disabled text light",
        description: "비활성 아이콘·label, Breadcrumb 구분자와 Input count에 사용해요.",
        components: ["Icon", "Breadcrumb", "Input", "Checkbox", "Radio"],
        source: "src/components/Icon/Icon.tsx",
        line: 348,
      },
      {
        hex: "#BBBBBB",
        name: "Disabled text",
        description: "비활성 항목과 현재 범위 밖의 날짜를 표시해요.",
        components: [
          "Upload",
          "Select",
          "ColorPicker",
          "Collapse",
          "DatePicker",
          "Segmented",
          "Calendar",
          "Dropdown",
          "Tree",
          "Tabs",
        ],
        source: "src/components/Tree/Tree.tsx",
        line: 564,
      },
      {
        hex: "#BFBFBF",
        name: "Disabled strong",
        description: "선택 불가 날짜, 기본 Avatar와 빈 이미지 표시 등에 사용해요.",
        components: ["Badge", "Upload", "Avatar", "DatePicker", "Calendar", "Skeleton"],
        source: "src/components/Calendar/Calendar.tsx",
        line: 210,
      },
      {
        hex: "#CCCCCC",
        name: "Disabled control mark",
        description: "비활성 체크 표시와 시간 값, 정렬 아이콘, 투명도 checker에 사용해요.",
        components: ["Checkbox", "Radio", "TimePicker", "Table", "ColorPicker"],
        source: "src/components/Checkbox/Checkbox.tsx",
        line: 52,
      },
      {
        hex: "#D9D9D9",
        name: "Card border",
        description: "카드형 목록과 큰 선택 컨트롤의 경계선이에요.",
        components: ["Upload", "ColorPicker", "Tabs"],
        source: "src/components/Tabs/Tabs.tsx",
        line: 267,
      },
      {
        hex: "#DDDDDD",
        name: "Control border",
        description: "입력창, 선택 컨트롤과 일반 버튼의 기본 경계선이에요.",
        components: [
          "Button",
          "Input",
          "TextArea",
          "Select",
          "DatePicker",
          "TimePicker",
          "Checkbox",
          "Radio",
          "Toggle",
          "Table",
          "Collapse",
        ],
        source: "src/components/Input/Input.tsx",
        line: 214,
      },
      {
        hex: "#EEEEEE",
        name: "Table subtle",
        description: "Table filter popup 경계선과 정렬된 header 배경에 사용해요.",
        components: ["Table"],
        source: "src/components/Table/Table.tsx",
        line: 125,
      },
      {
        hex: "#E7E7E7",
        name: "Skeleton shimmer",
        description: "Active Skeleton에서 이동하는 중심 띠 색상이에요.",
        components: ["Skeleton"],
        source: "src/styles/interactive.css",
        line: 17,
      },
      {
        hex: "#F0F0F0",
        name: "Divider / skeleton",
        description: "구분선, 표의 cell 경계선과 Skeleton 기본 배경에 사용해요.",
        components: [
          "Skeleton",
          "Table",
          "Menu",
          "Dropdown",
          "DatePicker",
          "TimePicker",
          "Drawer",
          "Tabs",
          "Collapse",
          "ColorPicker",
          "Avatar",
        ],
        source: "src/components/Table/Table.tsx",
        line: 122,
      },
      {
        hex: "#F5F5F5",
        name: "Hover / filled surface",
        description: "일반 hover, filled 입력, 비활성 배경과 Table header에 사용해요.",
        components: [
          "Button",
          "Input",
          "TextArea",
          "Select",
          "DatePicker",
          "TimePicker",
          "Table",
          "Menu",
          "Dropdown",
          "Tree",
          "Segmented",
          "Upload",
          "Checkbox",
          "Radio",
          "Calendar",
          "Tag",
          "Avatar",
          "ColorPicker",
          "Illustrations",
        ],
        source: "src/components/Table/Table.tsx",
        line: 123,
      },
      {
        hex: "#F8F8F8",
        name: "Disabled field",
        description: "폼 입력 컴포넌트가 비활성일 때 사용하는 배경이에요.",
        components: ["Input", "TextArea", "Select", "DatePicker", "TimePicker"],
        source: "src/components/Input/Input.tsx",
        line: 225,
      },
      {
        hex: "#FAFAFA",
        name: "Subtle structure",
        description: "비활성 card tab, Collapse와 중첩·확장 Table 행에 사용해요.",
        components: ["Tabs", "Collapse", "Table"],
        source: "src/components/Table/Table.tsx",
        line: 1299,
      },
    ],
  },
];

const effects = [
  ["rgba(0, 0, 0, 0.02)", "Upload Dragger와 Collapse header의 매우 옅은 배경"],
  ["rgba(0, 0, 0, 0.03)", "Select·ColorPicker·DatePicker·TimePicker popup shadow 3단계"],
  ["rgba(0, 0, 0, 0.05)", "Modal·Menu·Table·Popover·Message·Notification·Dropdown shadow 3단계"],
  ["rgba(0, 0, 0, 0.06)", "가벼운 popup shadow 1단계"],
  ["rgba(0, 0, 0, 0.08)", "popup shadow와 Segmented 선택 면 shadow"],
  ["rgba(0, 0, 0, 0.10)", "ColorPicker swatch border, Image 제어 버튼, Tailwind shadow"],
  ["rgba(0, 0, 0, 0.12)", "Upload drag, 일반 popup, Drawer와 작은 Button shadow"],
  ["rgba(0, 0, 0, 0.15)", "Table draggable row의 drop-shadow-lg"],
  ["rgba(0, 0, 0, 0.16)", "중간 크기 Button shadow"],
  ["rgba(0, 0, 0, 0.18)", "Tooltip shadow"],
  ["rgba(0, 0, 0, 0.20)", "큰 Button shadow와 Image 제어 버튼 hover"],
  ["rgba(0, 0, 0, 0.25)", "ColorPicker slider thumb 외곽선"],
  ["rgba(0, 0, 0, 0.45)", "Modal·Drawer·Image preview mask"],
  ["rgba(5, 5, 5, 0)", "Table fixed column edge shadow가 숨겨진 상태"],
  ["rgba(5, 5, 5, 0.12)", "Table fixed column edge shadow가 보이는 상태"],
  ["rgba(255, 255, 255, 0.25)", "Image preview의 disabled action"],
  ["rgba(255, 255, 255, 0.65)", "Image preview action과 이미지 개수"],
  ["rgba(255, 255, 255, 0.70)", "ScrollFade gradient의 중심"],
  ["rgba(255, 255, 255, 0.75)", "Table loading overlay"],
  ["rgba(255, 255, 255, 0.85)", "Image preview action hover"],
  ["rgba(0, 0, 0, 0)", "Image hover cover의 초기 상태"],
  ["transparent", "ghost·borderless·scrollbar track·gradient 끝점"],
] as const;

const illustrationColors = [
  ["#677589", "설명 글자"],
  ["#CDD5E0", "기본 회색 도형"],
  ["#97A3B6", "진한 회색 디테일"],
  ["#E3E8EF", "보조 회색 면"],
  ["#FBD5D5", "Error 배경"],
  ["#E02424", "Error 느낌표"],
  ["#F05252", "Network 차단선"],
  ["#F98080", "Notification 알림점"],
  ["#C3DDFD", "연한 파란 면"],
  ["#3F83F8", "파란 강조"],
  ["#76A9FA", "Chart 중간 막대"],
  ["#A4CAFE", "Chart 밝은 막대"],
  ["#DCD7FE", "Coming Soon 배경"],
  ["#9061F9", "Coming Soon 시계"],
  ["#AC94FA", "Coming Soon 장식"],
  ["#CABFFD", "Coming Soon 밝은 장식"],
  ["#BCF0DA", "Completed 배경"],
  ["#0E9F6E", "Completed 체크"],
  ["#84E1BC", "Completed 장식점"],
] as const;

const consolidationGroups = [
  ["Control border", "#D9D9D9", "#DDDDDD"],
  ["Disabled / muted", "#999999", "#AAAAAA", "#BBBBBB", "#BFBFBF", "#CCCCCC"],
  ["Light surface", "#F0F0F0", "#F2F2F2", "#F5F5F5", "#F8F8F8", "#FAFAFA"],
] as const;

function contrastColor(color: string) {
  const normalized = color.slice(1, 7);
  if (normalized.length !== 6) return "#111111";
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114 > 155 ? "#111111" : "#FFFFFF";
}

function SourceLink({ path, line, children }: { path: string; line: number; children?: string }) {
  return (
    <a
      className="text-xs font-medium text-primary no-underline hover:underline"
      href={`${repositoryUrl}/${path}#L${line}`}
      rel="noreferrer"
      target="_blank"
    >
      {children ?? "대표 코드 보기"} ↗
    </a>
  );
}

function ColorCard({ color }: { color: ColorItem }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e3e8ef] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div
        className="flex h-24 items-end p-4"
        style={{ backgroundColor: color.hex, color: contrastColor(color.hex) }}
      >
        <code className="rounded-md bg-black/10 px-2 py-1 text-sm font-semibold">{color.hex}</code>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="m-0 text-base font-semibold text-[#111]">{color.name}</h3>
          <p className="mt-1 mb-0 text-sm leading-6 text-[#555]">{color.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {color.components.map((component) => (
            <span
              key={component}
              className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-medium text-[#4a5667]"
            >
              {component}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-1">
          <SourceLink path={color.source} line={color.line} />
        </div>
      </div>
    </article>
  );
}

function CompactSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-[#e3e8ef] bg-white p-3">
      <span
        className="size-10 shrink-0 rounded-lg border border-black/10"
        style={{ backgroundColor: color }}
      />
      <span className="min-w-0">
        <code className="block text-xs font-semibold text-[#111]">{color}</code>
        <span className="mt-0.5 block text-xs leading-5 text-[#666]">{label}</span>
      </span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
        {eyebrow}
      </span>
      <h2 className="mt-1 mb-0 text-2xl font-semibold tracking-tight text-[#111]">{title}</h2>
      <p className="mt-2 mb-0 max-w-4xl text-sm leading-6 text-[#666]">{description}</p>
    </div>
  );
}

function ColorInventory() {
  const solidColorCount = solidGroups.reduce((count, group) => count + group.colors.length, 0);

  return (
    <main className="mx-auto w-full max-w-[1440px] bg-white px-6 py-10 font-pretendard text-[#111] sm:px-10">
      <header className="overflow-hidden rounded-2xl bg-[#111] px-6 py-8 text-white sm:px-10 sm:py-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase">
              Temporary audit page
            </span>
            <h1 className="mt-5 mb-0 text-3xl font-semibold tracking-tight sm:text-4xl">
              Color Inventory
            </h1>
            <p className="mt-4 mb-0 max-w-2xl text-sm leading-7 text-[rgba(255,255,255,0.70)] sm:text-base">
              현재 컴포넌트와 배포 CSS에서 실제로 사용하는 색상을 역할별로 정리했어요. 색상 통합 전
              기준 자료이며 아직 공식 Color API나 패키지 export는 아닙니다.
            </p>
          </div>
          <div className="grid min-w-[280px] grid-cols-2 gap-2">
            {[
              [solidColorCount, "UI solid"],
              [effects.length, "Alpha & effect"],
              [illustrationColors.length, "Illustration only"],
              [consolidationGroups.length, "Review groups"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-white/10 px-4 py-3">
                <strong className="block text-xl">{value}</strong>
                <span className="text-xs text-[rgba(255,255,255,0.65)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <nav className="my-8 flex flex-wrap gap-2 border-b border-[#e3e8ef] pb-6">
        {[
          ["#solid-colors", "UI colors"],
          ["#effects", "Alpha & shadow"],
          ["#illustrations", "Illustrations"],
          ["#review-first", "통합 검토군"],
        ].map(([href, label]) => (
          <a
            key={href}
            className="rounded-full border border-[#d9d9d9] bg-white px-3 py-1.5 text-xs font-medium text-[#555] no-underline transition-colors hover:border-primary hover:text-primary"
            href={href}
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="solid-colors" className="scroll-mt-6">
        <SectionHeading
          eyebrow="01"
          title="UI solid colors"
          description="축약 HEX와 named color는 6자리 HEX로 정규화했어요. 각 카드에는 현재 역할, 사용하는 컴포넌트와 대표 소스 링크가 들어 있어요."
        />
        <div className="grid gap-12">
          {solidGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="m-0 text-lg font-semibold text-[#111]">{group.title}</h3>
                  <p className="mt-1 mb-0 text-sm text-[#666]">{group.description}</p>
                </div>
                <span className="text-xs text-[#999]">{group.colors.length} colors</span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.colors.map((color) => (
                  <ColorCard key={color.hex} color={color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="effects" className="mt-20 scroll-mt-6">
        <SectionHeading
          eyebrow="02"
          title="Alpha & shadow"
          description="같은 검정이라도 투명도와 shadow 조합이 다르면 별도 표현으로 집계했어요. popup shadow가 두 체계로 나뉘어 있는 점을 확인할 수 있어요."
        />
        <div className="overflow-hidden rounded-xl border border-[#e3e8ef]">
          {effects.map(([color, usage], index) => (
            <div
              key={color}
              className={`grid gap-2 px-4 py-3 text-sm sm:grid-cols-[220px_1fr] ${index > 0 ? "border-t border-[#e3e8ef]" : ""}`}
            >
              <code className="font-semibold text-[#111]">{color}</code>
              <span className="leading-6 text-[#555]">{usage}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-[#f8fafc] p-4 text-sm leading-6 text-[#555]">
          <strong className="text-[#111]">현재 shadow 구조</strong>
          <span className="mt-1 block">가벼운 popup: 0.06 + 0.08 + 0.03</span>
          <span className="block">일반 overlay: 0.08 + 0.12 + 0.05</span>
          <span className="block">Button·Tooltip·Upload·Drawer: 컴포넌트별 단일 shadow</span>
        </div>
      </section>

      <section id="illustrations" className="mt-20 scroll-mt-6">
        <SectionHeading
          eyebrow="03"
          title="Illustration-only palette"
          description="일러스트 내부 도형과 설명에만 쓰는 팔레트예요. UI border나 text token과 값이 같더라도 별도 역할로 유지할지 먼저 결정해야 해요."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {illustrationColors.map(([color, label]) => (
            <CompactSwatch key={color} color={color} label={label} />
          ))}
        </div>
        <div className="mt-4">
          <SourceLink
            path="src/components/Illustrations/Illustrations.tsx"
            line={48}
            children="Illustration 전체 소스"
          />
        </div>
      </section>

      <section id="review-first" className="mt-20 scroll-mt-6">
        <SectionHeading
          eyebrow="04"
          title="통합 우선 검토군"
          description="색이 가깝거나 역할이 겹쳐 보이는 값들이에요. 아직 제거 대상을 정한 것은 아니며 대비, hover와 disabled 구분을 확인한 뒤 결정해야 해요."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {consolidationGroups.map(([name, ...colors]) => (
            <div key={name} className="rounded-xl border border-[#e3e8ef] bg-[#f8fafc] p-4">
              <h3 className="m-0 text-sm font-semibold text-[#111]">{name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1.5 text-xs shadow-sm"
                  >
                    <span
                      className="size-4 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                    <code>{color}</code>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-20 border-t border-[#e3e8ef] pt-6 text-xs leading-6 text-[#777]">
        조사 범위: export된 36개 컴포넌트, 테스트·스토리를 제외한 프로덕션 TS/TSX/CSS 124개,
        dist/style.css 교차 검증. Flex는 고정 색상 없이 상위 색상을 그대로 사용해요.
      </footer>
    </main>
  );
}

const meta = {
  title: "Components/Color Temp",
  component: ColorInventory,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    layout: "fullscreen",
    docs: {
      page: ColorInventory,
    },
  },
} satisfies Meta<typeof ColorInventory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inventory: Story = {
  parameters: {
    controls: { disable: true },
    docs: { canvas: { sourceState: "none" } },
  },
};
