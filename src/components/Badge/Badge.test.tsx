import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "./Badge";
import { colorTokenNames } from "../../color-tokens";

describe("Badge", () => {
  it.each(colorTokenNames)("uses the %s design token directly for the dot and pulse", (color) => {
    const { container } = render(<Badge color={color} process />);
    expect(container.querySelector("[data-badge-indicator]")).toHaveStyle({
      backgroundColor: `var(--color-${color})`,
      color: `var(--color-${color})`,
      "--badge-color": `var(--color-${color})`,
    });
  });

  it("applies className to the outer element without adding ARIA attributes", () => {
    const { container } = render(
      <Badge className="rounded bg-slate-50" color="success" label="정상" />,
    );

    expect(container.firstChild).toHaveClass("rounded", "bg-slate-50");
    expect(container.innerHTML).not.toMatch(/\saria-[\w-]+=/);
  });

  it("renders a label", () => {
    render(<Badge color="primary" label="처리 중" />);
    expect(screen.getByText("처리 중")).toBeInTheDocument();
  });

  it("preserves newlines in the label", () => {
    render(<Badge color="primary" label={"처리 중\n잠시만 기다려 주세요"} />);

    expect(screen.getByText(/처리 중\s+잠시만 기다려 주세요/)).toHaveClass("whitespace-pre-line");
  });

  it("applies the spreading animation only when process is true", () => {
    const { container, rerender } = render(<Badge color="primary" />);
    const status = container.querySelector("span > span");
    expect(status).not.toHaveClass("after:animate-ping");

    rerender(<Badge color="primary" process />);
    expect(status).toHaveClass("after:animate-ping");
  });

  it("leaves the pulse unclipped while containing long label content", () => {
    const text = "안녕하세요111111adfafsdafds".repeat(30);
    const { container } = render(<Badge color="success" process label={text} className="w-32" />);
    const indicator = container.querySelector("[data-badge-indicator]");
    expect(container.firstElementChild).not.toHaveClass("overflow-hidden");
    expect(indicator).not.toHaveClass("overflow-hidden");
    expect(indicator).toHaveClass("after:animate-ping", "shrink-0");
    expect(screen.getByText(text)).toHaveClass("min-w-0", "overflow-hidden", "break-all");
  });

  it("keeps the top-right starting point fixed as content grows and applies offsets", () => {
    const { container, rerender } = render(
      <Badge color="danger" offset={[-8, 6]} content={1}>
        <button type="button">알림</button>
      </Badge>,
    );
    const indicator = container.querySelector("[data-badge-indicator]");
    const anchor = {
      top: "0px",
      left: "100%",
      transform: "translate(-0.625rem, -50%) translate(-8px, 6px)",
    };
    expect(indicator).toHaveClass("absolute", "w-max");
    expect(indicator).toHaveStyle(anchor);
    rerender(
      <Badge color="danger" offset={[-8, 6]} content={"긴내용".repeat(100)}>
        <button type="button">알림</button>
      </Badge>,
    );
    expect(indicator).toHaveStyle(anchor);
    expect(container.firstElementChild).not.toHaveClass("overflow-hidden");
  });

  it("defaults to the top-right dot and keeps children interactive", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Badge color="danger" className="w-32" style={{ margin: 4 }}>
        <button type="button" onClick={onClick}>
          알림
        </button>
      </Badge>,
    );
    expect(container.firstElementChild).toHaveClass("w-32");
    expect(container.firstElementChild).toHaveStyle({ margin: "4px" });
    expect(container.querySelector("[data-badge-indicator]")).toHaveClass("size-1.5");
    expect(container.querySelector("[data-badge-indicator]")).toHaveStyle({
      top: "0px",
      left: "100%",
      transform: "translate(-0.1875rem, -50%) translate(0px, 0px)",
    });
    fireEvent.click(screen.getByRole("button", { name: "알림" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container.innerHTML).not.toMatch(/\saria-[\w-]+=/);
  });

  it("shows zero and text inside the badge, and returns to a dot when content is empty", () => {
    const { container, rerender } = render(<Badge color="danger" content={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(container.querySelector("[data-badge-indicator]")).toHaveStyle({
      minWidth: "min(1.25rem, var(--badge-available-width, 1.25rem))",
    });
    rerender(<Badge color="primary" content="NEW" label="새 소식" />);
    expect(screen.getByText("NEW").closest("[data-badge-indicator]")).not.toBeNull();
    expect(screen.getByText("새 소식").closest("[data-badge-indicator]")).toBeNull();
    rerender(<Badge color="danger" content="" />);
    expect(container.querySelector("[data-badge-indicator]")).toHaveClass("size-1.5");
    expect(container.querySelector("[data-badge-indicator]")).toBeEmptyDOMElement();
  });

  it("keeps label text outside the target anchor and guards invalid offsets", () => {
    const { container } = render(
      <Badge
        color="danger"
        content={3}
        label="새 소식"
        offset={[Number.NaN, Number.POSITIVE_INFINITY]}
      >
        <button type="button">알림</button>
      </Badge>,
    );
    const indicator = container.querySelector("[data-badge-indicator]");
    expect(indicator?.parentElement).toContainElement(screen.getByRole("button"));
    expect(indicator?.parentElement).not.toContainElement(screen.getByText("새 소식"));
    expect(indicator).toHaveStyle({ transform: "translate(-0.625rem, -50%) translate(0px, 0px)" });
  });

  it("uses readable content colors and constrains long text", () => {
    const { container } = render(<Badge color="gray" content={"긴내용".repeat(100)} process />);
    const indicator = container.querySelector("[data-badge-indicator]");
    expect(indicator).toHaveStyle({
      backgroundColor: "var(--color-gray)",
      color: "var(--color-dark)",
    });
    expect(indicator).toHaveStyle({
      maxWidth: "min(160px, var(--badge-available-width, calc(100vw - 16px)))",
    });
    expect(indicator).toHaveClass("after:animate-ping");
    expect(indicator?.querySelector("[data-badge-content]")).toHaveClass("truncate");
  });
});
