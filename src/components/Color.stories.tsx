import type { Meta, StoryObj } from "@storybook/react";
import { colorTokenNames, shadowTokenNames } from "../color-tokens";

type ColorToken = {
  name: string;
  token: string;
  hex: string;
  description: string;
  swatchClass: string;
};

type ColorGroup = {
  name: string;
  description: string;
  colors: ColorToken[];
};

type ShadowToken = {
  name: string;
  token: string;
  description: string;
  className: string;
};

const colorGroups: ColorGroup[] = [
  {
    name: "Functional",
    description: "selected, hover, disabled 상태를 표시할 때 사용하는 색상이에요.",
    colors: [
      {
        name: "Selected",
        token: "selected",
        hex: "#E6F4FF",
        description: "선택된 항목의 배경에 사용해요.",
        swatchClass: "bg-selected",
      },
      {
        name: "Hover",
        token: "hover",
        hex: "#F2F2F2",
        description: "마우스를 올린 항목의 배경에 사용해요.",
        swatchClass: "border-b border-[#e1e6ed] bg-hover",
      },
      {
        name: "Disabled",
        token: "disabled",
        hex: "#BBBBBB",
        description: "사용할 수 없는 요소를 표시할 때 사용해요.",
        swatchClass: "bg-disabled",
      },
    ],
  },
  {
    name: "Status",
    description: "컴포넌트의 의미를 구분할 때 사용하는 색상이에요.",
    colors: [
      {
        name: "Primary",
        token: "primary",
        hex: "#0062DF",
        description: "가장 중요한 동작을 강조할 때 사용해요.",
        swatchClass: "bg-primary",
      },
      {
        name: "Success",
        token: "success",
        hex: "#52C41A",
        description: "작업이 성공한 상태를 표시할 때 사용해요.",
        swatchClass: "bg-success",
      },
      {
        name: "Warning",
        token: "warning",
        hex: "#FAAD14",
        description: "주의가 필요한 상태를 표시할 때 사용해요.",
        swatchClass: "bg-warning",
      },
      {
        name: "Danger",
        token: "danger",
        hex: "#FF4D4F",
        description: "위험한 상태를 표시할 때 사용해요.",
        swatchClass: "bg-danger",
      },
      {
        name: "Navy",
        token: "navy",
        hex: "#023F97",
        description: "짙은 파란색 범주의 항목을 구분할 때 사용해요.",
        swatchClass: "bg-navy",
      },
      {
        name: "Purple",
        token: "purple",
        hex: "#4F19C4",
        description: "보라색 범주의 항목을 구분할 때 사용해요.",
        swatchClass: "bg-purple",
      },
    ],
  },
  {
    name: "Neutral",
    description: "화면의 기본 구조를 표현할 때 사용하는 색상이에요.",
    colors: [
      {
        name: "Black",
        token: "black",
        hex: "#000000",
        description: "가장 높은 대비가 필요한 콘텐츠에 사용해요.",
        swatchClass: "bg-black",
      },
      {
        name: "Dark",
        token: "dark",
        hex: "#111111",
        description: "기본 글자색으로 사용해요.",
        swatchClass: "bg-dark",
      },
      {
        name: "Dark gray",
        token: "dark-gray",
        hex: "#666666",
        description: "보조 설명의 글자색으로 사용해요.",
        swatchClass: "bg-dark-gray",
      },
      {
        name: "Gray",
        token: "gray",
        hex: "#999999",
        description: "입력 안내 문구의 글자색으로 사용해요.",
        swatchClass: "bg-gray",
      },
      {
        name: "Border",
        token: "border",
        hex: "#DDDDDD",
        description: "요소의 기본 테두리에 사용해요.",
        swatchClass: "bg-border",
      },
      {
        name: "White",
        token: "white",
        hex: "#FFFFFF",
        description: "기본 화면 배경에 사용해요.",
        swatchClass: "border-b border-[#e1e6ed] bg-white",
      },
    ],
  },
];

const shadowTokens: ShadowToken[] = [
  {
    name: "Extra small",
    token: "shadow-xs",
    description: "아주 낮게 떠 있는 요소에 사용해요.",
    className: "shadow-xs",
  },
  {
    name: "Small",
    token: "shadow-sm",
    description: "낮게 떠 있는 요소에 사용해요.",
    className: "shadow-sm",
  },
  {
    name: "Medium",
    token: "shadow-md",
    description: "드래그 중인 요소를 강조할 때 사용해요.",
    className: "shadow-md",
  },
  {
    name: "Large",
    token: "shadow-lg",
    description: "주변보다 높게 떠 있는 요소에 사용해요.",
    className: "shadow-lg",
  },
  {
    name: "Extra large",
    token: "shadow-xl",
    description: "입력 요소에서 열리는 선택창에 사용해요.",
    className: "shadow-xl",
  },
  {
    name: "2X large",
    token: "shadow-2xl",
    description: "화면 위에 열리는 팝업에 사용해요.",
    className: "shadow-2xl",
  },
];

function ColorCard({ color }: { color: ColorToken }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E1E6ED] bg-white shadow-sm">
      <div className={`h-36 ${color.swatchClass}`} />
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="m-0 text-lg font-semibold text-dark">{color.name}</h3>
            <code className="mt-2 inline-block rounded-md bg-[#F3F6F9] px-2 py-1 text-xs font-medium text-[#536071]">
              {color.token}
            </code>
          </div>
          <code className="shrink-0 pt-0.5 text-sm font-semibold text-[#596273]">{color.hex}</code>
        </div>
        <p className="mt-5 mb-0 text-sm leading-6 text-[#626B79]">{color.description}</p>
      </div>
    </article>
  );
}

function ShadowCard({ shadow }: { shadow: ShadowToken }) {
  return (
    <article className="rounded-2xl border border-border bg-white px-6 pt-6 pb-4">
      <div className="flex h-36 items-center justify-center rounded-xl bg-hover">
        <div
          className={`flex size-24 items-center justify-center rounded-xl bg-white ${shadow.className}`}
        >
          <span className="text-xs font-semibold text-gray">{shadow.name}</span>
        </div>
      </div>
      <h3 className="mt-10 mb-0 text-lg font-semibold text-dark" style={{ marginTop: 40 }}>
        {shadow.name}
      </h3>
      <code className="mt-2 inline-block rounded-md bg-hover px-2 py-1 text-xs font-medium text-dark-gray">
        {shadow.token}
      </code>
      <p className="mt-4 mb-0 text-sm leading-6 text-dark-gray">{shadow.description}</p>
    </article>
  );
}

function TokenCode({
  name,
}: {
  name: (typeof colorTokenNames)[number] | (typeof shadowTokenNames)[number];
}) {
  return (
    <code className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]">
      {name}
    </code>
  );
}

function ColorGuide() {
  return (
    <main className="color-docs component-docs font-pretendard text-dark">
      <header>
        <h1 className="sbdocs-title">Color</h1>
        <p>
          컴포넌트에 적용할 공통 색상과 그림자 토큰을 확인할 수 있어요.
          <br />
          같은 역할에는 같은 토큰을 사용해 화면을 일관되게 만들어요.
        </p>
      </header>

      <section className="mt-14">
        <div
          className="flex w-full flex-wrap items-end justify-between gap-5"
          style={{ marginBottom: 40 }}
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Palette
            </span>
            <h2
              className="mt-1 !mb-0 !border-0 !pb-0 text-2xl font-semibold tracking-tight"
              style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}
            >
              Semantic colors
            </h2>
            <p className="mt-1 mb-0 text-sm leading-6 text-dark-gray" style={{ marginTop: 4 }}>
              화면에서 표현할 상태에 맞는 색상 토큰을 선택해요.
            </p>
          </div>
        </div>
        <div className="grid" style={{ gap: 80 }}>
          {colorGroups.map((group) => (
            <div key={group.name}>
              <h3 className="m-0 text-lg font-semibold text-dark" style={{ marginBottom: 0 }}>
                {group.name}
              </h3>
              <p className="mt-0.5 mb-5 text-sm leading-6 text-gray" style={{ marginTop: 2 }}>
                {group.description}
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {group.colors.map((color) => (
                  <ColorCard key={color.token} color={color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="mb-7">
          <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Elevation
          </span>
          <h2
            className="mt-1 !mb-0 !border-0 !pb-0 text-2xl font-semibold tracking-tight text-dark"
            style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}
          >
            Shadow
          </h2>
          <p className="!mt-0 mb-0 text-sm leading-6 text-dark-gray" style={{ marginTop: 2 }}>
            요소가 떠 있는 높이에 맞는 그림자 토큰을 선택해요.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shadowTokens.map((shadow) => (
            <ShadowCard key={shadow.token} shadow={shadow} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <article className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Usage
          </span>
          <h2 className="mt-1 mb-0 !border-0 !pb-0 text-xl font-semibold text-dark">사용 방법</h2>
          <p className="mt-1 mb-0 text-sm leading-6 text-dark-gray">
            패키지 스타일을 불러온 뒤 Tailwind 클래스처럼 사용해요.
          </p>
          <div className="mt-4 mb-5 w-full border-t border-border" />
          <pre
            className="m-0 overflow-hidden overflow-x-auto !rounded-xl !bg-dark !p-4 text-xs leading-6 !text-[#D1D5DB]"
            style={{ backgroundColor: "var(--color-dark)", borderRadius: 12, padding: 16 }}
          >
            <code className="!text-[#D1D5DB]">
              <span className="!text-[#C586C0]">import</span>{" "}
              <span className="!text-[#CE9178]">'@taejin-k/wizard-design/style.css'</span>;{"\n\n"}
              <span className="!text-[#569CD6]">{"<button"}</span>{" "}
              <span className="!text-[#9CDCFE]">className</span>=
              <span className="!text-[#CE9178]">
                &quot;bg-primary text-white hover:opacity-90&quot;
              </span>
              <span className="!text-[#569CD6]">{">"}</span>
              {"\n  저장\n"}
              <span className="!text-[#569CD6]">{"</button>"}</span>
              {"\n\n"}
              <span className="!text-[#569CD6]">{"<p"}</span>{" "}
              <span className="!text-[#9CDCFE]">className</span>=
              <span className="!text-[#CE9178]">&quot;text-danger&quot;</span>
              <span className="!text-[#569CD6]">{">"}</span>
              입력값을 확인해 주세요.
              <span className="!text-[#569CD6]">{"</p>"}</span>
              {"\n\n"}
              <span className="!text-[#569CD6]">{"<div"}</span>{" "}
              <span className="!text-[#9CDCFE]">className</span>=
              <span className="!text-[#CE9178]">
                &quot;border-success ring-success border ring-1&quot;
              </span>
              <span className="!text-[#569CD6]">{">"}</span>
              {"\n  저장 완료\n"}
              <span className="!text-[#569CD6]">{"</div>"}</span>
            </code>
          </pre>
        </article>
      </section>

      <h2 className="component-docs-types-heading" style={{ marginTop: 80 }}>
        Types
      </h2>
      <h3 id="color-token-type">ColorTokenType</h3>
      <p>Color에서 제공하는 색상 토큰 이름이에요.</p>
      <div className="flex flex-wrap gap-2">
        {colorTokenNames.map((name) => (
          <TokenCode key={name} name={name} />
        ))}
      </div>
      <h3 id="shadow-token-type">ShadowTokenType</h3>
      <p>Color에서 제공하는 그림자 토큰 이름이에요.</p>
      <div className="flex flex-wrap gap-2">
        {shadowTokenNames.map((name) => (
          <TokenCode key={name} name={name} />
        ))}
      </div>
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
  tags: ["!dev"],
  parameters: {
    controls: { disable: true },
    docs: { canvas: { sourceState: "none" } },
  },
};
