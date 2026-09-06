import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFloatingLayer } from "./use-floating-layer";

function Fixture({ recoverOnPopupResize }: { recoverOnPopupResize?: boolean }) {
  const floating = useFloatingLayer({
    open: true,
    trigger: "click",
    placement: "bottomLeft",
    recoverOnPopupResize,
  });
  return (
    <>
      <span ref={floating.triggerRef} data-testid="trigger" />
      <div ref={floating.popupRef} data-testid="popup">
        {floating.position?.placement}
      </div>
    </>
  );
}

describe("floating placement recovery", () => {
  let popupHeight: number;
  let triggerHeight: number;
  let notifyResize: () => void;

  beforeEach(() => {
    popupHeight = 539;
    triggerHeight = 32;
    vi.stubGlobal("innerWidth", 1100);
    vi.stubGlobal("innerHeight", 700);
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          notifyResize = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.dataset.testid === "trigger"
        ? new DOMRect(20, 300, 57, triggerHeight)
        : new DOMRect(0, 0, 240, popupHeight);
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns below after a non-search panel becomes shorter", () => {
    render(<Fixture recoverOnPopupResize />);
    expect(screen.getByTestId("popup")).toHaveTextContent("right");

    popupHeight = 270;
    act(() => notifyResize());
    expect(screen.getByTestId("popup")).toHaveTextContent("bottomLeft");
  });

  it("commits the new position before the resize observer returns to the browser", () => {
    render(<Fixture recoverOnPopupResize />);
    expect(screen.getByTestId("popup")).toHaveTextContent("right");
    popupHeight = 270;
    act(() => {
      notifyResize();
      // The browser can paint as soon as resize delivery finishes; do not
      // rely on act's final flush (or React's next scheduled render).
      expect(screen.getByTestId("popup")).toHaveTextContent("bottomLeft");
    });
  });

  it("does not switch sides for temporary search-result height changes by default", () => {
    render(<Fixture />);
    expect(screen.getByTestId("popup")).toHaveTextContent("right");

    for (const height of [270, 539, 270, 539]) {
      popupHeight = height;
      act(() => notifyResize());
      expect(screen.getByTestId("popup")).toHaveTextContent("right");
    }
  });

  it("still recovers when removing tags makes the trigger shorter", () => {
    popupHeight = 320;
    triggerHeight = 330;
    render(<Fixture />);
    expect(screen.getByTestId("popup")).toHaveTextContent("right");

    triggerHeight = 32;
    act(() => notifyResize());
    expect(screen.getByTestId("popup")).toHaveTextContent("bottomLeft");
  });
});
