import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("applies overflow count and hides zero by default", () => {
    const { rerender } = render(
      <Badge count={120}>
        <span>알림</span>
      </Badge>,
    );
    expect(screen.getByText("99+")).toBeInTheDocument();
    rerender(
      <Badge count={0}>
        <span>알림</span>
      </Badge>,
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders status text", () => {
    render(<Badge status="processing" text="처리 중" />);
    expect(screen.getByText("처리 중")).toBeInTheDocument();
  });
});
