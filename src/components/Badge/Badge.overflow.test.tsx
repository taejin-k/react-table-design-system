import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Badge } from "./Badge";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function mockContent(container: HTMLElement, left: number, naturalWidth = 300, scale = 1) {
  const indicator = container.querySelector<HTMLSpanElement>("[data-badge-indicator]")!;
  const content = container.querySelector<HTMLSpanElement>("[data-badge-content]")!;
  const geometry = { left, naturalWidth };
  vi.spyOn(indicator, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(geometry.left, 100, 160 * scale, 20 * scale),
  );
  Object.defineProperty(indicator, "offsetHeight", { configurable: true, value: 20 });
  Object.defineProperties(content, {
    scrollWidth: { configurable: true, get: () => geometry.naturalWidth },
    clientWidth: {
      configurable: true,
      get: () => Math.max(0, Math.min(160, Number.parseFloat(available())) - 12),
    },
  });
  const available = () => indicator.style.getPropertyValue("--badge-available-width");
  return { indicator, content, geometry, available };
}

describe("Badge content overflow", () => {
  it("uses space to the viewport edge and updates on resize, scrolling, and offset changes", () => {
    vi.stubGlobal("innerWidth", 360);
    const { container, rerender } = render(
      <Badge color="danger" content="긴 배지 내용">
        <button>알림</button>
      </Badge>,
    );
    const { geometry, available } = mockContent(container, 280);
    fireEvent.resize(window);
    expect(available()).toBe("72px");
    vi.stubGlobal("innerWidth", 400);
    fireEvent.resize(window);
    expect(available()).toBe("112px");
    geometry.left = 300;
    fireEvent.scroll(container);
    expect(available()).toBe("92px");
    geometry.left = 320;
    rerender(
      <Badge color="danger" content="긴 배지 내용" offset={[20, 0]}>
        <button>알림</button>
      </Badge>,
    );
    expect(available()).toBe("72px");
  });

  it("respects a clipping ancestor and converts zoomed coordinates to local width", () => {
    const { container } = render(
      <div data-test-clip style={{ overflowX: "hidden" }}>
        <Badge color="primary" content="아주 긴 내용">
          <button>알림</button>
        </Badge>
      </div>,
    );
    const clip = container.querySelector<HTMLElement>("[data-test-clip]")!;
    vi.spyOn(clip, "getBoundingClientRect").mockReturnValue(new DOMRect(20, 0, 360, 200));
    Object.defineProperties(clip, {
      offsetWidth: { value: 180 },
      clientWidth: { value: 180 },
    });
    const { available } = mockContent(container, 280, 300, 2);
    fireEvent.resize(window);
    expect(available()).toBe("46px");
  });

  it("shows a tooltip only for truncated content and keeps button clicks working", () => {
    vi.useFakeTimers();
    vi.stubGlobal("innerWidth", 360);
    const onClick = vi.fn();
    const { container, getByRole } = render(
      <Badge color="danger" content="전체 배지 내용">
        <button onClick={onClick}>알림</button>
      </Badge>,
    );
    const { content, geometry } = mockContent(container, 280);
    fireEvent.resize(window);
    expect(content.parentElement).toHaveClass("pointer-events-auto");
    fireEvent.pointerEnter(content.parentElement!);
    act(() => vi.advanceTimersByTime(150));
    expect(document.querySelector("[data-tooltip]")).toHaveTextContent("전체 배지 내용");
    fireEvent.click(getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();

    geometry.naturalWidth = 20;
    fireEvent.resize(window);
    act(() => vi.advanceTimersByTime(250));
    expect(document.querySelector("[data-tooltip]")).not.toBeInTheDocument();
    expect(content.parentElement).not.toHaveClass("pointer-events-auto");
  });

  it("remeasures observed layout changes and removes the width constraint when returning to a dot", () => {
    let resize = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    vi.stubGlobal("innerWidth", 360);
    const { container, rerender } = render(<Badge color="gray" content="123456789" />);
    const { geometry, available, indicator } = mockContent(container, 280);
    act(resize);
    expect(available()).toBe("72px");
    geometry.left = 350;
    act(resize);
    expect(available()).toBe("2px");
    geometry.left = 370;
    act(resize);
    expect(available()).toBe("0px");
    rerender(<Badge color="gray" content="" process />);
    expect(available()).toBe("");
    expect(indicator).toHaveClass("size-1.5", "after:animate-ping");
    expect(indicator).not.toHaveClass("overflow-hidden");
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
