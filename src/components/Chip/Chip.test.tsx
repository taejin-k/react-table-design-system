import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders the default variant and forwards props and ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Chip ref={ref} data-testid="chip" title="상태">
        활성
      </Chip>,
    );

    const chip = screen.getByTestId("chip");
    expect(chip).toHaveTextContent("활성");
    expect(chip).toHaveAttribute("title", "상태");
    expect(chip).toHaveClass("bg-[#1c8616]", "text-white");
    expect(ref.current).toBe(chip);
  });

  it("renders icon sockets only for provided icons", () => {
    const { container, rerender } = render(<Chip>텍스트</Chip>);
    expect(container.querySelectorAll("span span")).toHaveLength(0);

    rerender(
      <Chip prefixIcon={<span data-testid="prefix" />} suffixIcon={<span data-testid="suffix" />}>
        텍스트
      </Chip>,
    );
    expect(screen.getByTestId("prefix").parentElement).toHaveClass("size-4");
    expect(screen.getByTestId("suffix").parentElement).toHaveClass("size-4");
  });

  it("applies color, variant, and an external class", () => {
    render(
      <Chip className="custom-chip" color="red" data-testid="chip" variant="outlined">
        오류
      </Chip>,
    );

    expect(screen.getByTestId("chip")).toHaveClass(
      "custom-chip",
      "border-[#d92626]",
      "text-[#d92626]",
    );
  });
});
