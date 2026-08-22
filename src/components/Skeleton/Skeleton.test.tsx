import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders children after loading", () => {
    const { rerender } = render(<Skeleton loading>내용</Skeleton>);
    expect(screen.getByLabelText("불러오는 중")).toBeInTheDocument();
    rerender(<Skeleton loading={false}>내용</Skeleton>);
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("supports active element skeletons", () => {
    const { container } = render(<Skeleton.Button active block />);
    expect(container.firstElementChild).toHaveClass("wizard-skeleton-active", "w-full");
  });
});
