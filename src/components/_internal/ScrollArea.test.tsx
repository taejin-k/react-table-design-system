import { createRef } from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScrollArea } from "./ScrollArea";

describe("ScrollArea", () => {
  it("uses Table colors and syncs both thumbs without changing the native viewport", () => {
    const ref = createRef<HTMLDivElement>();
    const { container, rerender } = render(
      <ScrollArea ref={ref} className="h-24" viewportMarker="data-test-viewport">
        내용
      </ScrollArea>,
    );
    const viewport = container.querySelector<HTMLElement>("[data-test-viewport]")!;
    const xTrack = container.querySelector<HTMLElement>('[data-scroll-track="x"]')!;
    const yTrack = container.querySelector<HTMLElement>('[data-scroll-track="y"]')!;
    const xThumb = xTrack.firstElementChild as HTMLElement;
    const yThumb = yTrack.firstElementChild as HTMLElement;
    Object.defineProperties(viewport, {
      clientWidth: { configurable: true, value: 200 },
      clientHeight: { configurable: true, value: 100 },
      scrollWidth: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 500 },
    });
    Object.defineProperty(xTrack, "clientWidth", { value: 192 });
    Object.defineProperty(yTrack, "clientHeight", { value: 92 });
    viewport.scrollLeft = 100;
    viewport.scrollTop = 200;
    fireEvent.scroll(viewport);
    expect(ref.current).toBe(container.firstElementChild);
    expect(xTrack).not.toHaveStyle({ display: "none" });
    expect(yTrack).not.toHaveStyle({ display: "none" });
    expect(xThumb).toHaveStyle({ width: "96px", transform: "translateX(48px)" });
    expect(yThumb).toHaveStyle({ height: "32px", transform: "translateY(30px)" });
    expect(yThumb).toHaveClass("bg-disabled", "hover:bg-disabled", "duration-200", "w-1.5");
    Object.defineProperties(viewport, {
      scrollWidth: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 100 },
    });
    rerender(
      <ScrollArea ref={ref} className="h-24" viewportMarker="data-test-viewport">
        짧은 내용
      </ScrollArea>,
    );
    expect(container.querySelector("[data-test-viewport]")).toBe(viewport);
    expect(xTrack).toHaveStyle({ display: "none" });
    expect(yTrack).toHaveStyle({ display: "none" });
  });

  it("remeasures resized content and releases the observer on unmount", () => {
    let resize = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    try {
      const { container, unmount } = render(<ScrollArea verticalOnly>내용</ScrollArea>);
      const viewport = container.querySelector<HTMLElement>("[data-scroll-viewport]")!;
      const track = container.querySelector<HTMLElement>('[data-scroll-track="y"]')!;
      Object.defineProperties(viewport, {
        clientHeight: { value: 100 },
        scrollHeight: { value: 500 },
        clientWidth: { value: 100 },
        scrollWidth: { value: 400 },
      });
      Object.defineProperty(track, "clientHeight", { value: 100 });
      act(resize);
      expect(observe).toHaveBeenCalledWith(viewport);
      expect(observe).toHaveBeenCalledWith(viewport.firstElementChild);
      expect(track).not.toHaveStyle({ display: "none" });
      expect(container.querySelector('[data-scroll-track="x"]')).toHaveStyle({ display: "none" });
      fireEvent.wheel(track, { deltaY: 30 });
      expect(viewport.scrollTop).toBe(30);
      unmount();
      expect(disconnect).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
