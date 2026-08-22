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
    await userEvent.click(screen.getByRole("tab", { name: "둘째" }));
    expect(onChange).toHaveBeenCalledWith("two");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("둘째 내용");
  });

  it("reports editable card removal", async () => {
    const onEdit = vi.fn();
    render(<Tabs type="editable-card" items={[{ key: "one", label: "문서" }]} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole("button", { name: "문서 닫기" }));
    expect(onEdit).toHaveBeenCalledWith("one", "remove");
  });
});
