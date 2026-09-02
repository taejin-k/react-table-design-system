import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("exposes only element skeletons", () => {
    expect(typeof Skeleton).toBe("object");
    expect(Object.keys(Skeleton)).toEqual(["Avatar", "Button", "Input", "Image", "Node"]);
  });

  it("renders custom content inside a node skeleton", () => {
    render(<Skeleton.Node>내용</Skeleton.Node>);
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("supports active element skeletons", () => {
    const { container } = render(<Skeleton.Button active width="100%" height={40} />);
    expect(container.firstElementChild).toHaveClass("wizard-skeleton-active");
    expect(container.firstElementChild).toHaveStyle({ width: "100%", height: "40px" });
  });

  it("accepts element width and height without a style prop", () => {
    const { container } = render(<Skeleton.Input width={180} height={36} />);
    expect(container.firstElementChild).toHaveStyle({ width: "180px", height: "36px" });
  });

  it("allows Tailwind size classes to override element defaults", () => {
    const { container } = render(<Skeleton.Node className="h-12 w-40" />);

    expect(container.firstElementChild).toHaveClass("h-12", "w-40");
    expect(container.firstElementChild).not.toHaveClass("h-24", "w-24");
    expect(container.firstElementChild).not.toHaveAttribute("style");
  });
});
