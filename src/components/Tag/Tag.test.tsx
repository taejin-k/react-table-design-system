import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("renders the default variant and forwards props and ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tag ref={ref} data-testid="tag" title="상태">
        활성
      </Tag>,
    );

    const tag = screen.getByTestId("tag");
    expect(tag).toHaveTextContent("활성");
    expect(tag).toHaveAttribute("title", "상태");
    expect(tag).toHaveClass("bg-[#f5f5f5]", "text-[#111111]");
    expect(ref.current).toBe(tag);
  });

  it("renders icon sockets only for provided icons", () => {
    const { container, rerender } = render(<Tag>텍스트</Tag>);
    expect(container.querySelectorAll("span span")).toHaveLength(0);

    rerender(
      <Tag prefixIcon={<span data-testid="prefix" />} suffixIcon={<span data-testid="suffix" />}>
        텍스트
      </Tag>,
    );
    expect(screen.getByTestId("prefix").parentElement).toHaveClass("size-4");
    expect(screen.getByTestId("suffix").parentElement).toHaveClass("size-4");
  });

  it("applies color, variant, and an external class", () => {
    render(
      <Tag className="custom-tag" color="red" data-testid="tag" variant="outlined">
        오류
      </Tag>,
    );

    expect(screen.getByTestId("tag")).toHaveClass(
      "custom-tag",
      "text-[#d92626]",
      "shadow-[inset_0_0_0_1px_#d92626]",
    );
  });

  it("renders a solid tag with a saturated background", () => {
    render(
      <Tag color="blue" data-testid="tag" variant="solid">
        정보
      </Tag>,
    );

    expect(screen.getByTestId("tag")).toHaveClass("bg-[#1e59a3]", "text-white");
  });

  it("renders a soft outlined tag with a tinted border and background", () => {
    render(
      <Tag color="purple" data-testid="tag" variant="soft-outlined">
        분류
      </Tag>,
    );

    expect(screen.getByTestId("tag")).toHaveClass(
      "bg-[#f5f2fd]",
      "text-[#4f19c4]",
      "shadow-[inset_0_0_0_1px_#d7c8f4]",
    );
  });
});
