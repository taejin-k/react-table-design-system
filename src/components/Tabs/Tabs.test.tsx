import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";

describe("Tabs", () => {
  it("changes the active tab and renders its panel", async () => {
    const onChange = vi.fn();
    render(
      <Tabs
        items={[
          { key: "one", label: "첫째", children: "첫 내용" },
          { key: "two", label: "둘째", children: "둘째 내용" },
        ]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "둘째" }));
    expect(onChange).toHaveBeenCalledWith("two");
    expect(document.querySelector('[data-tab-panel="two"]')).toHaveTextContent("둘째 내용");
  });

  it("reports editable card removal", async () => {
    const onEdit = vi.fn();
    render(<Tabs type="editable-card" items={[{ key: "one", label: "문서" }]} onEdit={onEdit} />);
    await userEvent.click(document.querySelector('[data-tab-close="one"]')!);
    expect(onEdit).toHaveBeenCalledWith("one", "remove");
  });

  it("uses Ant Design card dimensions and joins the active tab to the content", () => {
    render(
      <Tabs
        type="card"
        items={[
          { key: "overview", label: "개요" },
          { key: "activity", label: "활동" },
        ]}
      />,
    );

    expect(document.querySelector("[data-tabs-header]")).toHaveClass(
      "border-b",
      "border-[#d9d9d9]",
    );
    expect(document.querySelector('[data-tabs-item="overview"]')).toHaveClass(
      "h-10",
      "px-4",
      "rounded-t-md",
      "border-b-0",
      "bg-white",
    );
    expect(document.querySelector('[data-tabs-item="activity"]')).toHaveClass(
      "h-10",
      "px-4",
      "bg-[#fafafa]",
    );
    expect(document.querySelector("[data-tabs-card-bridge]")).toHaveStyle({
      transition: "width 300ms, height 300ms, transform 300ms",
    });
  });

  it("matches the editable add button height to card tabs", () => {
    render(<Tabs type="editable-card" items={[{ key: "one", label: "문서" }]} />);

    expect(document.querySelector("[data-tabs-add]")).toHaveClass(
      "h-10",
      "w-10",
      "rounded-t-md",
      "border-b-0",
    );
  });

  it("anchors the line indicator to the tab header origin", () => {
    render(<Tabs items={[{ key: "one", label: "문서", children: "내용" }]} />);
    expect(document.querySelector("[data-tabs-indicator]")).toHaveClass("top-0", "left-0");
  });

  it("keeps the same indicator element while the active tab changes", () => {
    const items = [
      { key: "one", label: "첫째", children: "첫 내용" },
      { key: "two", label: "둘째", children: "둘째 내용" },
    ];
    const { rerender } = render(<Tabs activeKey="one" items={items} />);
    const indicator = document.querySelector("[data-tabs-indicator]");

    rerender(<Tabs activeKey="two" items={items} />);

    expect(document.querySelector("[data-tabs-indicator]")).toBe(indicator);
  });
});
