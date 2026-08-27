import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("applies className to the outer element without adding ARIA attributes", () => {
    const { container } = render(
      <Badge className="rounded bg-slate-50" status="success" text="정상" />,
    );

    expect(container.firstChild).toHaveClass("rounded", "bg-slate-50");
    expect(container.innerHTML).not.toMatch(/\saria-[\w-]+=/);
  });

  it("renders status text", () => {
    render(<Badge status="processing" text="처리 중" />);
    expect(screen.getByText("처리 중")).toBeInTheDocument();
  });

  it("applies a custom status color", () => {
    const { container } = render(<Badge status="default" color="#722ed1" />);
    expect(container.querySelector("span > span")).toHaveStyle({
      backgroundColor: "#722ed1",
      color: "#722ed1",
    });
  });

  it("applies the spreading animation only when process is true", () => {
    const { container, rerender } = render(<Badge status="processing" />);
    const status = container.querySelector("span > span");
    expect(status).not.toHaveClass("after:animate-ping");

    rerender(<Badge status="processing" process />);
    expect(status).toHaveClass("after:animate-ping");
  });
});
