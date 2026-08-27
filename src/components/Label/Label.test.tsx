import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./Label";

describe("Label", () => {
  it("forwards native props and ref", () => {
    const ref = createRef<HTMLLabelElement>();
    render(
      <>
        <Label ref={ref} htmlFor="name" label="이름" />
        <input id="name" />
      </>,
    );

    const label = screen.getByText("이름");
    expect(label).toHaveAttribute("for", "name");
    expect(label).toHaveClass("text-[12px]");
    expect(ref.current).toBe(label);
  });

  it("shows the required mark only when requested", () => {
    const { rerender } = render(<Label label="이름" />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();

    rerender(<Label label="이름" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("applies size and an external class", () => {
    render(<Label className="custom-label" label="이름" size="lg" />);

    expect(screen.getByText("이름")).toHaveClass("custom-label", "text-[14px]");
  });

  it("preserves newlines in its text", () => {
    render(<Label label={"첫 줄\n둘째 줄"} />);

    expect(screen.getByText(/첫 줄\s+둘째 줄/)).toHaveClass("whitespace-pre-line");
  });
});
