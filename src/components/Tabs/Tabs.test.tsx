import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";
import type { TabItemType } from "./Tabs.types";

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

  it("adds a custom tab and deletes tabs", async () => {
    function EditableTabs() {
      const [items, setItems] = useState<TabItemType[]>([{ key: "one", label: "문서" }]);
      const handleAdd = () => {
        setItems((current) => [
          ...current,
          { key: "custom", label: "사용자 탭", children: "사용자 탭 내용" },
        ]);
      };
      return <Tabs type="card" items={items} onAdd={handleAdd} onDelete={setItems} />;
    }

    render(<EditableTabs />);
    await userEvent.click(document.querySelector("[data-tabs-add]")!);
    expect(screen.getByRole("button", { name: /사용자 탭/ })).toBeInTheDocument();

    await userEvent.click(document.querySelector('[data-tab-close="one"]')!);
    expect(screen.queryByRole("button", { name: /문서/ })).not.toBeInTheDocument();
  });

  it("shows editable controls only when their callbacks are provided", () => {
    const items = [{ key: "one", label: "문서" }];
    const onAdd = vi.fn();
    const onDelete = vi.fn();
    const { rerender } = render(<Tabs type="card" items={items} />);

    expect(document.querySelector("[data-tabs-add]")).not.toBeInTheDocument();
    expect(document.querySelector('[data-tab-close="one"]')).not.toBeInTheDocument();

    rerender(<Tabs type="card" items={items} onAdd={onAdd} />);
    expect(document.querySelector("[data-tabs-add]")).toBeInTheDocument();
    expect(document.querySelector('[data-tab-close="one"]')).not.toBeInTheDocument();

    rerender(<Tabs type="card" items={items} onAdd={onAdd} onDelete={onDelete} />);
    expect(document.querySelector("[data-tabs-add]")).toBeInTheDocument();
    expect(document.querySelector('[data-tab-close="one"]')).toBeInTheDocument();
  });

  it("does not delete a disabled tab", () => {
    const onDelete = vi.fn();
    render(
      <Tabs
        type="card"
        items={[{ key: "disabled", label: "비활성", disabled: true }]}
        onDelete={onDelete}
      />,
    );
    const closeButton = document.querySelector('[data-tab-close="disabled"]')!;

    expect(closeButton).toHaveClass("cursor-not-allowed", "opacity-40");
    fireEvent.click(closeButton);
    expect(onDelete).not.toHaveBeenCalled();
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
    render(<Tabs type="card" items={[{ key: "one", label: "문서" }]} onAdd={vi.fn()} />);

    expect(document.querySelector("[data-tabs-add]")).toHaveClass(
      "h-10",
      "w-10",
      "rounded-t-md",
      "border-b-0",
    );
  });

  it("anchors the line indicator to the tab header origin", () => {
    render(<Tabs animated={false} items={[{ key: "one", label: "문서", children: "내용" }]} />);
    expect(document.querySelector("[data-tabs-indicator]")).toHaveClass("top-0", "left-0");
    expect(document.querySelector("[data-tabs-indicator]")).toHaveStyle({
      transition: "width 300ms, height 300ms, transform 300ms",
    });
  });

  it("uses animated only for the content transition", () => {
    const items = [{ key: "one", label: "첫째", children: "첫 내용" }];
    const { rerender } = render(<Tabs items={items} />);

    expect(document.querySelector('[data-tabs-item="one"]')).toHaveClass("transition-colors");
    expect(document.querySelector('[data-tab-panel="one"]')).not.toHaveClass(
      "animate-[wizard-tab-pane-in_0.3s_cubic-bezier(0.23,1,0.32,1)]",
    );

    rerender(<Tabs animated items={items} />);

    expect(document.querySelector('[data-tab-panel="one"]')).toHaveClass(
      "animate-[wizard-tab-pane-in_0.3s_cubic-bezier(0.23,1,0.32,1)]",
    );
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
