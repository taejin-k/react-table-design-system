import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExpandedRow } from "./ExpandedRow";

afterEach(() => vi.useRealTimers());

describe("Table expanded-row motion", () => {
  const content = vi.fn(() => <button type="button">상세 내용</button>);
  const fixture = (expanded: boolean) => (
    <table>
      <tbody>
        <ExpandedRow
          expanded={expanded}
          colSpan={3}
          cellClassName="border-b border-hover"
          paddingClassName="px-2 py-3"
          renderContent={content}
        />
      </tbody>
    </table>
  );

  it("mounts lazily, slides for 200ms, and removes content after closing", () => {
    vi.useFakeTimers();
    content.mockClear();
    const { container, rerender } = render(fixture(false));
    expect(content).not.toHaveBeenCalled();
    expect(container.querySelector("tr")).toBeNull();

    rerender(fixture(true));
    const motion = container.querySelector("[data-table-expand-motion]")!;
    expect(motion).toHaveStyle({ gridTemplateRows: "0fr" });
    expect(motion).toHaveClass("transition-[grid-template-rows]", "duration-200");
    expect(container.querySelector("td")).toHaveClass("p-0", "border-b-0");
    expect(container.querySelector("td")).toHaveAttribute("colspan", "3");
    expect(container.querySelector("[data-table-expanded-content]")).toHaveClass("px-2", "py-3");
    act(() => vi.advanceTimersByTime(40));
    expect(motion).toHaveStyle({ gridTemplateRows: "1fr" });

    rerender(fixture(false));
    expect(motion).toHaveStyle({ gridTemplateRows: "0fr" });
    expect(container.querySelector("button")).toBeInTheDocument();
    fireEvent.transitionEnd(container.querySelector("button")!, { propertyName: "color" });
    expect(container.querySelector("tr")).toBeInTheDocument();
    fireEvent.transitionEnd(motion, { propertyName: "grid-template-rows" });
    expect(container.querySelector("tr")).toBeNull();
  });

  it("reverses a closing row without resetting its target to zero or unmounting it", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(fixture(true));
    const motion = container.querySelector("[data-table-expand-motion]")!;
    expect(motion).toHaveStyle({ gridTemplateRows: "1fr" });
    rerender(fixture(false));
    act(() => vi.advanceTimersByTime(80));
    rerender(fixture(true));
    expect(container.querySelector("[data-table-expand-motion]")).toBe(motion);
    expect(motion).toHaveStyle({ gridTemplateRows: "1fr" });
    act(() => vi.advanceTimersByTime(300));
    expect(motion).toBeInTheDocument();
    rerender(fixture(false));
    act(() => vi.advanceTimersByTime(250));
    expect(container.querySelector("tr")).toBeNull();
  });

  it("cancels a pending opening frame when immediately closed", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(fixture(false));
    rerender(fixture(true));
    rerender(fixture(false));
    act(() => vi.advanceTimersByTime(40));
    expect(container.querySelector("[data-table-expand-motion]")).toHaveStyle({
      gridTemplateRows: "0fr",
    });
    act(() => vi.advanceTimersByTime(250));
    expect(container.querySelector("tr")).toBeNull();
  });
});
