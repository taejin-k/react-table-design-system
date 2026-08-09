import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./Label";

describe("Label", () => {
  it("forwards native props and ref", () => {
    const ref = createRef<HTMLLabelElement>();
    render(
      <>
        <Label ref={ref} htmlFor="name">
          이름
        </Label>
        <input id="name" />
      </>,
    );

    const label = screen.getByText("이름");
    expect(label).toHaveAttribute("for", "name");
    expect(label).toHaveClass("text-[12px]");
    expect(ref.current).toBe(label);
  });

  it("shows the required mark only when requested", () => {
    const { rerender } = render(<Label>이름</Label>);
    expect(screen.queryByText("*")).not.toBeInTheDocument();

    rerender(<Label required>이름</Label>);
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("applies size and an external class", () => {
    render(
      <Label className="custom-label" size="lg">
        이름
      </Label>,
    );

    expect(screen.getByText("이름")).toHaveClass("custom-label", "text-[14px]");
  });
});
