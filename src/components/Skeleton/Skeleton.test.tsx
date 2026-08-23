import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders children after loading", () => {
    const { rerender } = render(<Skeleton loading>내용</Skeleton>);
    expect(screen.queryByText("내용")).not.toBeInTheDocument();
    rerender(<Skeleton loading={false}>내용</Skeleton>);
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("supports active element skeletons", () => {
    const { container } = render(<Skeleton.Button active fullWidth height={40} />);
    expect(container.firstElementChild).toHaveClass("wizard-skeleton-active");
    expect(container.firstElementChild).toHaveStyle({ width: "100%", height: "40px" });
  });

  it("accepts element width and height without a style prop", () => {
    const { container } = render(<Skeleton.Input width={180} height={36} />);
    expect(container.firstElementChild).toHaveStyle({ width: "180px", height: "36px" });
  });
});
