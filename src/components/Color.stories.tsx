import type { Meta, StoryObj } from "@storybook/react";

type ColorToken = {
  name: string;
  token: string;
  hex: string;
  description: string;
  swatchClass: string;
};

const repositoryUrl = "https://github.com/taejin-k/react-table-design-system/blob/main";

const colorTokens: ColorToken[] = [
  {
    name: "Primary",
    token: "primary",
    hex: "#0062DF",
    description: "저장·확인 같은 주요 동작과 선택·포커스 상태를 강조할 때 사용해요.",
    swatchClass: "bg-primary",
  },
  {
    name: "Primary hover",
    token: "primary-hover",
    hex: "#227CEF",
    description: "Primary 요소에 마우스를 올려 상호작용할 수 있음을 보여줄 때 사용해요.",
    swatchClass: "bg-primary-hover",
  },
  {
    name: "Primary loading",
    token: "primary-loading",
    hex: "#6EA0FA",
    description: "Primary 버튼이나 활성화된 Toggle이 처리 중임을 나타낼 때 사용해요.",
    swatchClass: "bg-primary-loading",
  },
  {
    name: "Success",
    token: "success",
    hex: "#52C41A",
    description: "작업이 성공했거나 정상적으로 완료된 상태를 알려줄 때 사용해요.",
    swatchClass: "bg-success",
  },
  {
    name: "Warning",
    token: "warning",
    hex: "#FAAD14",
    description: "사용자의 확인이 필요하거나 주의해야 할 상태를 알려줄 때 사용해요.",
    swatchClass: "bg-warning",
  },
  {
    name: "Danger",
    token: "danger",
    hex: "#FF4D4F",
    description: "삭제 같은 위험한 동작과 실패·입력 오류 상태를 표시할 때 사용해요.",
    swatchClass: "bg-danger",
  },
  {
    name: "Danger hover",
    token: "danger-hover",
    hex: "#FF7875",
    description: "Danger 요소에 마우스를 올려 위험 동작을 선택할 수 있음을 보여줘요.",
    swatchClass: "bg-danger-hover",
  },
  {
    name: "Navy",
    token: "navy",
    hex: "#023F97",
    description: "Primary와 구분되는 짙은 파란색 범주나 Navy Tag를 표시할 때 사용해요.",
    swatchClass: "bg-navy",
  },
  {
    name: "Purple",
    token: "purple",
    hex: "#4F19C4",
    description: "Primary와 구분되는 보라색 범주나 Purple Tag를 표시할 때 사용해요.",
    swatchClass: "bg-purple",
  },
];

function ColorCard({ color }: { color: ColorToken }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E1E6ED] bg-white shadow-[0_4px_16px_rgba(17,24,39,0.06)]">
      <div className={`h-36 ${color.swatchClass}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="m-0 text-lg font-semibold text-[#111]">{color.name}</h3>
            <code className="mt-2 inline-block rounded-md bg-[#F3F6F9] px-2 py-1 text-xs font-medium text-[#536071]">
              {color.token}
            </code>
          </div>
          <code className="shrink-0 pt-0.5 text-sm font-semibold text-[#596273]">{color.hex}</code>
        </div>
        <p className="mt-5 mb-0 min-h-12 text-sm leading-6 text-[#626B79]">{color.description}</p>
      </div>
    </article>
  );
}

function ColorGuide() {
  return (
    <main className="mx-auto w-full max-w-[1440px] bg-[#F8FAFC] px-6 py-10 font-pretendard text-[#111] sm:px-10 sm:py-12">
      <header className="relative overflow-hidden rounded-3xl bg-[#111] px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="absolute top-0 right-0 size-56 translate-x-20 -translate-y-20 rounded-full bg-primary opacity-35 blur-3xl" />
        <div className="absolute right-40 bottom-0 size-40 translate-y-24 rounded-full bg-purple opacity-25 blur-3xl" />
        <div className="relative max-w-3xl">
          <h1 className="mt-5 mb-0 text-3xl font-semibold tracking-tight !text-white sm:text-4xl">
            Color
          </h1>
          <p className="mt-4 mb-0 max-w-2xl text-sm leading-7 !text-white/70 sm:text-base">
            의미가 정해진 색상을 Tailwind utility로 사용해요. HEX를 직접 입력하지 않고 같은 역할에는
            같은 token을 적용합니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#111] !no-underline transition-opacity hover:!no-underline hover:opacity-85"
              href={`${repositoryUrl}/theme.css`}
              rel="noreferrer"
              target="_blank"
            >
              theme.css 보기 ↗
            </a>
            <a
              className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold !text-white !no-underline transition-colors hover:bg-white/10 hover:!no-underline"
              href="https://tailwindcss.com/docs/colors#customizing-your-colors"
              rel="noreferrer"
              target="_blank"
            >
              Tailwind color 문서 ↗
            </a>
          </div>
        </div>
      </header>

      <section className="mt-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Palette
            </span>
            <h2 className="mt-1 mb-0 text-2xl font-semibold tracking-tight">Semantic colors</h2>
            <p className="mt-2 mb-0 text-sm leading-6 text-[#666]">
              같은 의미의 색상은 화면 전체에서 동일한 token 이름으로 사용해요.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {colorTokens.map((color) => (
            <ColorCard key={color.token} color={color} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <article className="rounded-2xl bg-[#111] p-6 text-white sm:p-8">
          <span className="text-xs font-semibold tracking-[0.12em] text-primary-loading uppercase">
            Usage
          </span>
          <h2 className="mt-1 mb-0 text-xl font-semibold !text-white">사용 방법</h2>
          <p className="mt-2 mb-5 text-sm leading-6 !text-white/65">
            패키지 스타일을 한 번 불러온 다음 일반 Tailwind class처럼 사용합니다.
          </p>
          <pre className="m-0 overflow-hidden overflow-x-auto rounded-xl bg-white/8 p-4 text-xs leading-6 text-white/85">
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
