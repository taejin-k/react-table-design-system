import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Collapse } from "./Collapse";

describe("Collapse", () => {
  it("opens panels and reports active keys", async () => {
    const onChange = vi.fn();
    render(
      <Collapse items={[{ key: "one", label: "제목", children: "내용" }]} onChange={onChange} />,
    );
    await userEvent.click(screen.getByText("제목").closest("[tabindex]")!);
    expect(screen.getByText("내용")).toBeVisible();
    expect(onChange).toHaveBeenCalledWith(["one"]);
  });

  it("keeps one panel open in accordion mode", async () => {
    const onChange = vi.fn();
    render(
      <Collapse
        accordion
        defaultActiveKey={["one"]}
        onChange={onChange}
        items={[
          { key: "one", label: "하나", children: "1" },
          { key: "two", label: "둘", children: "2" },
        ]}
      />,
    );
    await userEvent.click(screen.getByText("둘").closest("[tabindex]")!);
    expect(screen.getByText("하나").closest("section")?.querySelector(".grid")).toHaveStyle({
      gridTemplateRows: "0fr",
    });
    expect(onChange).toHaveBeenCalledWith(["two"]);
  });

  it("keeps opened panel content mounted after it closes", async () => {
    render(<Collapse items={[{ key: "one", label: "제목", children: "내용" }]} />);
    const header = screen.getByText("제목").closest("[tabindex]")!;

    expect(screen.queryByText("내용")).not.toBeInTheDocument();
    await userEvent.click(header);
    await userEvent.click(header);

    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("preserves newlines in labels and text content", () => {
    render(
      <Collapse
        defaultActiveKey={["one"]}
        items={[
          { key: "one", label: "제목 첫 줄\n제목 둘째 줄", children: "내용 첫 줄\n내용 둘째 줄" },
        ]}
      />,
    );

    expect(screen.getByText(/제목 첫 줄\s+제목 둘째 줄/)).toHaveClass(
      "whitespace-pre-wrap",
      "[overflow-wrap:anywhere]",
    );
    expect(screen.getByText(/내용 첫 줄\s+내용 둘째 줄/)).toHaveClass(
      "whitespace-pre-wrap",
      "[overflow-wrap:anywhere]",
    );
  });

  it("uses the minimum header height for each size", () => {
    const { rerender } = render(<Collapse items={[{ key: "one", label: "제목" }]} size="md" />);

    expect(screen.getByText("제목").closest("[tabindex]")).toHaveClass("min-h-[38px]", "py-2");

    rerender(<Collapse items={[{ key: "one", label: "제목" }]} size="sm" />);
    expect(screen.getByText("제목").closest("[tabindex]")).toHaveClass("min-h-[30px]", "py-1");

    rerender(<Collapse items={[{ key: "one", label: "제목" }]} size="lg" />);
    expect(screen.getByText("제목").closest("[tabindex]")).toHaveClass("min-h-[46px]", "py-3");
  });

  it("keeps the original body padding for each size", () => {
    const { rerender } = render(
      <Collapse
        defaultActiveKey={["one"]}
        items={[{ key: "one", label: "제목", children: "내용" }]}
        size="md"
      />,
    );

    expect(screen.getByText("내용")).toHaveClass("px-4", "py-3");

    rerender(
      <Collapse
        defaultActiveKey={["one"]}
        items={[{ key: "one", label: "제목", children: "내용" }]}
        size="sm"
      />,
    );
    expect(screen.getByText("내용")).toHaveClass("px-3", "py-2");

    rerender(
      <Collapse
        defaultActiveKey={["one"]}
        items={[{ key: "one", label: "제목", children: "내용" }]}
        size="lg"
      />,
    );
    expect(screen.getByText("내용")).toHaveClass("px-6", "py-4");
  });

  it("keeps rounded corners and reserves a transparent border without a visible border", () => {
    const { container } = render(
      <Collapse bordered={false} items={[{ key: "one", label: "제목" }]} />,
    );

    expect(container.firstChild).toHaveClass("rounded-lg", "border", "border-transparent");
    expect(container.firstChild).not.toHaveClass("border-[#ddd]");
  });

  it("reserves transparent panel dividers when bordered is false", () => {
    const { container } = render(
      <Collapse
        bordered={false}
        items={[
          { key: "one", label: "첫 번째" },
          { key: "two", label: "두 번째" },
        ]}
      />,
    );

    expect(container.querySelectorAll("section")[1]).toHaveClass(
      "border-t",
      "border-transparent",
    );
  });

  it("applies className to the top-level element and supports Tailwind overrides", () => {
    const { container } = render(
      <Collapse className="collapse-root rounded-none bg-red-500" items={[]} />,
    );

    expect(container.firstElementChild).toHaveClass("collapse-root", "rounded-none", "bg-red-500");
    expect(container.firstElementChild).not.toHaveClass("rounded-lg", "bg-[#fafafa]");
  });

  it("supports controlled active keys without updating itself", async () => {
    const onChange = vi.fn();
    const items = [
      { key: "one", label: "하나", children: "첫 내용" },
      { key: "two", label: "둘", children: "둘째 내용" },
    ];
    const { rerender } = render(<Collapse activeKey={["one"]} items={items} onChange={onChange} />);

    await userEvent.click(screen.getByText("둘").closest("[tabindex]")!);
    expect(onChange).toHaveBeenCalledWith(["one", "two"]);
    expect(screen.getByText("둘").closest("section")?.querySelector(".grid")).toHaveStyle({
      gridTemplateRows: "0fr",
    });

    rerender(<Collapse activeKey={["two"]} items={items} onChange={onChange} />);
    expect(screen.getByText("둘").closest("section")?.querySelector(".grid")).toHaveStyle({
      gridTemplateRows: "1fr",
    });
  });

  it("keeps string and number keys distinct", () => {
    render(
      <Collapse
        activeKey={[1]}
        items={[
          { key: 1, label: "숫자", children: "숫자 내용" },
          { key: "1", label: "문자", children: "문자 내용" },
        ]}
      />,
    );

    expect(screen.getByText("숫자").closest("section")?.querySelector(".grid")).toHaveStyle({
      gridTemplateRows: "1fr",
    });
    expect(screen.getByText("문자").closest("section")?.querySelector(".grid")).toHaveStyle({
      gridTemplateRows: "0fr",
    });
  });

  it("supports each item click mode", async () => {
    render(
      <Collapse
        items={[
          { key: "header", label: "헤더", children: "헤더 내용" },
          { key: "icon", label: "아이콘", children: "아이콘 내용", collapsible: "icon" },
          { key: "disabled", label: "비활성", children: "비활성 내용", collapsible: "disabled" },
        ]}
      />,
    );

    await userEvent.click(screen.getByText("헤더"));
    expect(screen.getByText("헤더 내용")).toBeInTheDocument();

    await userEvent.click(screen.getByText("아이콘"));
    expect(screen.queryByText("아이콘 내용")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("아이콘").closest("[tabindex]")!.querySelector("svg")!);
    expect(screen.getByText("아이콘 내용")).toBeInTheDocument();

    await userEvent.click(screen.getByText("비활성"));
    expect(screen.queryByText("비활성 내용")).not.toBeInTheDocument();
  });

  it("places or hides the arrow and prevents extra content from toggling", async () => {
    const { rerender } = render(
      <Collapse
        expandIconPlacement="end"
        items={[
          {
            key: "one",
            label: "제목",
            children: "내용",
            extra: <button type="button">추가</button>,
          },
        ]}
      />,
    );
    const header = screen.getByText("제목").closest("[tabindex]")!;

    expect(header.lastElementChild?.querySelector("svg")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(screen.queryByText("내용")).not.toBeInTheDocument();

    rerender(<Collapse items={[{ key: "one", label: "제목", showArrow: false }]} />);
    expect(screen.getByText("제목").closest("[tabindex]")?.querySelector("svg")).toBeNull();
  });

  it("applies ghost styles", () => {
    const { container } = render(<Collapse ghost items={[{ key: "one", label: "제목" }]} />);

    expect(container.firstElementChild).toHaveClass("bg-transparent");
    expect(container.firstElementChild).not.toHaveClass("rounded-lg", "border", "bg-[#fafafa]");
  });
});
