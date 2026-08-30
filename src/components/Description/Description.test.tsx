import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Description, Descriptions } from "./Description";

describe("Description", () => {
  it("uses table cells and converts item spans for bordered rows", () => {
    render(
      <Description
        bordered
        column={3}
        items={[
          { key: "name", label: "이름", children: "태진", span: 2 },
          { key: "status", label: "상태", children: "사용 중" },
        ]}
      />,
    );

    expect(screen.getByText("태진").closest("td")).toHaveAttribute("colspan", "3");
    expect(screen.getByText("이름").closest("th")).not.toHaveTextContent(":");
  });

  it("fills the remaining columns with the final item", () => {
    render(
      <Description
        column={3}
        items={[
          { key: "name", label: "이름", children: "태진" },
          { key: "team", label: "팀", children: "디자인" },
        ]}
      />,
    );

    expect(screen.getByText("디자인").closest("td")).toHaveAttribute("colspan", "2");
  });

  it("renders vertical labels and contents in separate rows", () => {
    render(
      <Description layout="vertical" items={[{ key: "name", label: "이름", children: "태진" }]} />,
    );

    expect(screen.getByText("이름", { exact: false }).closest("tr")).not.toBe(
      screen.getByText("태진").closest("tr"),
    );
  });

  it("uses the large bordered padding by default", () => {
    render(<Description bordered items={[{ key: "name", label: "이름", children: "태진" }]} />);

    expect(screen.getByText("태진").closest("td")).toHaveClass("px-6", "py-4");
  });

  it("keeps bordered content inside the parent width and uses single cell borders", () => {
    const { container } = render(
      <Description
        bordered
        column={2}
        items={[
          { key: "phone", label: "전화번호", children: "010-1234-5678" },
          {
            key: "period",
            label: "사용 기간",
            children: "very-long-unbroken-description-value-that-must-stay-inside-the-cell",
          },
        ]}
      />,
    );

    expect(screen.getByText("전화번호")).toHaveClass("min-w-0", "[overflow-wrap:anywhere]");
    expect(screen.getByText("사용 기간")).toHaveClass("min-w-0", "[overflow-wrap:anywhere]");
    expect(screen.getByText(/very-long-unbroken/)).toHaveClass(
      "min-w-0",
      "[overflow-wrap:anywhere]",
    );
    expect(container.querySelectorAll("col")).toHaveLength(4);
    expect(container.querySelectorAll("col")[0]).toHaveStyle({ width: "20%" });
    expect(container.querySelectorAll("col")[1]).toHaveStyle({ width: "30%" });
    expect(container.querySelector("table")).toHaveClass("border-separate", "border-spacing-0");
    expect(container.querySelector("[data-description-view]")).toHaveClass("overflow-hidden");
  });

  it("reserves a transparent outer border when bordered is false", () => {
    const { container } = render(
      <Description items={[{ key: "name", label: "이름", children: "태진" }]} />,
    );

    expect(container.querySelector("[data-description-view]")).toHaveClass(
      "border",
      "border-transparent",
    );
  });

  it("changes the default column count at responsive breakpoints", () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 500 });

    render(
      <Description
        items={[
          { key: "name", label: "이름", children: "태진" },
          { key: "team", label: "팀", children: "디자인" },
        ]}
      />,
    );

    act(() => window.dispatchEvent(new Event("resize")));
    expect(screen.getByText("태진").closest("tr")).not.toBe(
      screen.getByText("디자인").closest("tr"),
    );

    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
  });

  it("supports the Item API, plural alias, and root className", () => {
    const { container } = render(
      <Descriptions className="w-full">
        <Descriptions.Item label="상태">사용 중</Descriptions.Item>
      </Descriptions>,
    );

    expect(screen.getByText("사용 중")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("w-full");
  });
});
