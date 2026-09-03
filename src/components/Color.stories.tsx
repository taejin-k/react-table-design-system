import type { Meta, StoryObj } from "@storybook/react";

type ColorToken = {
  name: string;
  token: string;
  hex: string;
  role: string;
  usage: string;
  swatchClass: string;
  textClass: string;
  borderClass: string;
};

const repositoryUrl = "https://github.com/taejin-k/react-table-design-system/blob/main";

const colorTokens: ColorToken[] = [
  {
    name: "Primary",
    token: "primary",
    hex: "#0062DF",
    role: "Brand action",
    usage: "주요 동작, 선택, 포커스, 진행 상태와 드래그 위치에 사용해요.",
    swatchClass: "bg-primary",
    textClass: "text-primary",
    borderClass: "border-primary",
  },
  {
    name: "Primary hover",
    token: "primary-hover",
    hex: "#227CEF",
    role: "Brand hover",
    usage: "Primary 요소에 마우스를 올렸을 때 사용해요.",
    swatchClass: "bg-primary-hover",
    textClass: "text-primary-hover",
    borderClass: "border-primary-hover",
  },
  {
    name: "Primary loading",
    token: "primary-loading",
    hex: "#6EA0FA",
    role: "Brand loading",
    usage: "Primary 버튼과 켜진 Toggle의 로딩 상태에 사용해요.",
    swatchClass: "bg-primary-loading",
    textClass: "text-primary-loading",
    borderClass: "border-primary-loading",
  },
  {
    name: "Success",
    token: "success",
    hex: "#52C41A",
    role: "Positive status",
    usage: "성공, 완료, 정상 상태와 Green Tag에 사용해요.",
    swatchClass: "bg-success",
    textClass: "text-success",
    borderClass: "border-success",
  },
  {
    name: "Warning",
    token: "warning",
    hex: "#FAAD14",
    role: "Caution status",
    usage: "확인이 필요하거나 주의해야 하는 상태에 사용해요.",
    swatchClass: "bg-warning",
    textClass: "text-warning",
    borderClass: "border-warning",
  },
  {
    name: "Danger",
    token: "danger",
    hex: "#FF4D4F",
    role: "Error / destructive",
    usage: "삭제, 실패, 입력 검증 오류와 Red Tag에 사용해요.",
    swatchClass: "bg-danger",
    textClass: "text-danger",
    borderClass: "border-danger",
  },
  {
    name: "Danger hover",
    token: "danger-hover",
    hex: "#FF7875",
    role: "Danger hover",
    usage: "Danger 요소에 마우스를 올렸을 때 사용해요.",
    swatchClass: "bg-danger-hover",
    textClass: "text-danger-hover",
    borderClass: "border-danger-hover",
  },
  {
    name: "Navy",
    token: "navy",
    hex: "#023F97",
    role: "Navy category",
    usage: "Navy Tag처럼 Primary와 구분되는 짙은 파란 범주에 사용해요.",
    swatchClass: "bg-navy",
    textClass: "text-navy",
    borderClass: "border-navy",
  },
  {
    name: "Purple",
    token: "purple",
    hex: "#4F19C4",
    role: "Purple category",
    usage: "Purple Tag처럼 별도 범주를 구분할 때 사용해요.",
    swatchClass: "bg-purple",
    textClass: "text-purple",
    borderClass: "border-purple",
  },
];

const utilityGroups = [
  {
    title: "Surface",
    description: "요소의 면을 채워요.",
    examples: ["bg-primary", "bg-success", "bg-danger"],
  },
  {
    title: "Content",
    description: "글자와 SVG 색상을 정해요.",
    examples: ["text-primary", "fill-success", "stroke-danger"],
  },
  {
    title: "Boundary",
    description: "경계선과 포커스 표시를 정해요.",
    examples: ["border-primary", "ring-warning", "outline-danger"],
  },
  {
    title: "Detail",
    description: "입력 커서와 장식 등 세부 색상을 정해요.",
    examples: ["caret-primary", "accent-success", "decoration-purple"],
  },
  {
    title: "Gradient",
    description: "그라데이션의 시작·중간·끝 색상을 정해요.",
    examples: ["from-primary", "via-primary-hover", "to-primary-loading"],
  },
  {
    title: "State",
    description: "Tailwind variant와 조합해 상태 색상을 정해요.",
    examples: ["hover:bg-primary-hover", "focus:border-primary", "disabled:text-primary-loading"],
  },
] as const;

function CodePill({ children }: { children: string }) {
  return (
    <code className="rounded-md border border-[#e3e8ef] bg-[#f8fafc] px-2 py-1 text-xs font-medium text-[#4a5667]">
      {children}
    </code>
  );
}

function ColorCard({ color }: { color: ColorToken }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e3e8ef] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className={`h-28 ${color.swatchClass}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.1em] text-[#777] uppercase">
              {color.role}
            </span>
            <h3 className="mt-1 mb-0 text-lg font-semibold text-[#111]">{color.name}</h3>
          </div>
          <code className="shrink-0 rounded-md bg-[#f5f5f5] px-2 py-1 text-xs font-semibold text-[#555]">
            {color.hex}
          </code>
        </div>
        <p className="mt-3 mb-0 min-h-12 text-sm leading-6 text-[#666]">{color.usage}</p>
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`rounded-md bg-[#f8fafc] px-2.5 py-1 text-sm font-semibold ${color.textClass}`}
          >
            Text
          </span>
          <span className={`rounded-md border bg-white px-2.5 py-1 text-xs ${color.borderClass}`}>
            Border
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <CodePill>{`bg-${color.token}`}</CodePill>
          <CodePill>{`text-${color.token}`}</CodePill>
          <CodePill>{`border-${color.token}`}</CodePill>
        </div>
        <div className="mt-4 border-t border-[#f0f0f0] pt-4">
          <code className="text-xs text-[#777]">{`--color-${color.token}`}</code>
        </div>
      </div>
    </article>
  );
}

function ColorGuide() {
  return (
    <main className="mx-auto w-full max-w-[1440px] bg-white px-6 py-10 font-pretendard text-[#111] sm:px-10">
      <header className="relative overflow-hidden rounded-3xl bg-[#111] px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="absolute top-0 right-0 size-56 translate-x-20 -translate-y-20 rounded-full bg-primary opacity-35 blur-3xl" />
        <div className="absolute right-40 bottom-0 size-40 translate-y-24 rounded-full bg-purple opacity-25 blur-3xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase">
            Design tokens
          </span>
          <h1 className="mt-5 mb-0 text-3xl font-semibold tracking-tight !text-white sm:text-4xl">
            Color
          </h1>
          <p className="mt-4 mb-0 max-w-2xl text-sm leading-7 !text-white/70 sm:text-base">
            의미가 정해진 색상을 Tailwind utility로 사용해요. HEX를 직접 입력하지 않고 같은 역할에는
            같은 token을 적용합니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#111] no-underline transition-opacity hover:opacity-85"
              href={`${repositoryUrl}/theme.css`}
              rel="noreferrer"
              target="_blank"
            >
              theme.css 보기 ↗
            </a>
            <a
              className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold !text-white no-underline transition-colors hover:bg-white/10"
              href="https://tailwindcss.com/docs/colors#customizing-your-colors"
              rel="noreferrer"
              target="_blank"
            >
              Tailwind color 문서 ↗
            </a>
          </div>
        </div>
      </header>

      <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Palette
            </span>
            <h2 className="mt-1 mb-0 text-2xl font-semibold tracking-tight">Semantic colors</h2>
            <p className="mt-2 mb-0 text-sm leading-6 text-[#666]">
              색상 이름은 화면의 역할을 나타내며 모든 token에서 동일한 utility 조합을 사용할 수
              있어요.
            </p>
          </div>
          <span className="rounded-full bg-[#f5f5f5] px-3 py-1.5 text-xs text-[#666]">
            {colorTokens.length} tokens
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {colorTokens.map((color) => (
            <ColorCard key={color.token} color={color} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Utilities
        </span>
        <h2 className="mt-1 mb-0 text-2xl font-semibold tracking-tight">한 token, 여러 표현</h2>
        <p className="mt-2 mb-0 max-w-3xl text-sm leading-6 text-[#666]">
          `--color-*` token은 배경과 글자뿐 아니라 border, ring, SVG, 입력 cursor와 gradient에도
          연결돼요. hover·focus·disabled 같은 variant도 그대로 조합할 수 있어요.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {utilityGroups.map((group) => (
            <article key={group.title} className="rounded-xl border border-[#e3e8ef] bg-white p-5">
              <h3 className="m-0 text-base font-semibold">{group.title}</h3>
              <p className="mt-1 mb-4 text-sm text-[#777]">{group.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.examples.map((example) => (
                  <CodePill key={example}>{example}</CodePill>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-[#e3e8ef] bg-[#f8fafc] p-6">
          <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Preview
          </span>
          <h2 className="mt-1 mb-0 text-xl font-semibold">상태 조합</h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              type="button"
            >
              Primary
            </button>
            <button
              className="h-9 cursor-default rounded-md bg-primary-loading px-4 text-sm font-semibold text-white"
              type="button"
            >
              Primary loading
            </button>
            <button
              className="h-9 rounded-md bg-danger px-4 text-sm font-semibold text-white transition-colors hover:bg-danger-hover"
              type="button"
            >
              Danger
            </button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border-2 border-primary bg-white p-4">
              <strong className="block text-sm text-primary">Border</strong>
              <span className="mt-1 block text-xs text-[#777]">border-primary</span>
            </div>
            <div className="rounded-xl bg-white p-4 ring-2 ring-success ring-inset">
              <strong className="block text-sm text-success">Ring</strong>
              <span className="mt-1 block text-xs text-[#777]">ring-success</span>
            </div>
            <div className="rounded-xl bg-white p-4 outline-2 outline-offset-[-2px] outline-warning">
              <strong className="block text-sm text-warning">Outline</strong>
              <span className="mt-1 block text-xs text-[#777]">outline-warning</span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl bg-[#111] p-6 text-white">
          <span className="text-xs font-semibold tracking-[0.12em] text-primary-loading uppercase">
            Usage
          </span>
          <h2 className="mt-1 mb-0 text-xl font-semibold !text-white">사용 방법</h2>
          <p className="mt-2 mb-5 text-sm leading-6 !text-white/65">
            패키지 스타일을 한 번 불러온 다음 일반 Tailwind class처럼 사용합니다.
          </p>
          <pre className="m-0 overflow-x-auto rounded-xl bg-white/8 p-4 text-xs leading-6 text-white/85">
            <code>{`import '@taejin-k/wizard-design/style.css';

<button className="bg-primary hover:bg-primary-hover text-white">
  저장
</button>

<p className="text-danger">입력값을 확인해 주세요.</p>

<div className="border-success ring-success border ring-1">
  저장 완료
</div>`}</code>
          </pre>
        </article>
      </section>

      <section className="mt-20 rounded-2xl border border-[#e3e8ef] p-6">
        <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          SVG & gradient
        </span>
        <h2 className="mt-1 mb-0 text-xl font-semibold">벡터와 그라데이션</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl bg-[#f8fafc] p-5">
            <svg className="size-12 fill-primary" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" />
              <path className="fill-white" d="m16 24 5 5 11-12 3 3-14 15-8-8z" />
            </svg>
            <div>
              <strong className="block text-sm">fill-primary</strong>
              <span className="mt-1 block text-xs text-[#777]">
                SVG fill과 stroke에도 같은 token을 사용해요.
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-[#f8fafc] p-5">
            <div className="h-4 rounded-full bg-gradient-to-r from-primary via-primary-hover to-primary-loading" />
            <strong className="mt-4 block text-sm">Gradient stops</strong>
            <span className="mt-1 block text-xs text-[#777]">
              from-primary · via-primary-hover · to-primary-loading
            </span>
          </div>
        </div>
      </section>

      <footer className="mt-20 border-t border-[#e3e8ef] pt-6 text-xs leading-6 text-[#777]">
        공식 token은 <code>theme.css</code>에 정의되고 배포 <code>style.css</code>에도 필요한
        utility와 CSS 변수가 포함돼요. 새 색상을 추가할 때는 HEX를 컴포넌트에 직접 넣지 않고 먼저
        token을 정의합니다.
      </footer>
    </main>
  );
}

const meta = {
  title: "Components/Color",
  component: ColorGuide,
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    layout: "fullscreen",
    docs: { page: ColorGuide },
  },
} satisfies Meta<typeof ColorGuide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Palette: Story = {
  parameters: {
    controls: { disable: true },
    docs: { canvas: { sourceState: "none" } },
  },
};
