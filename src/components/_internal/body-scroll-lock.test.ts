import { afterEach, describe, expect, it, vi } from "vitest";
import { lockBodyScroll } from "./body-scroll-lock";

const originalInnerWidth = window.innerWidth;
const originalClientWidth = document.documentElement.clientWidth;

function setViewportWidths(innerWidth: number, clientWidth: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: innerWidth });
  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: clientWidth,
  });
}

afterEach(() => {
  document.body.style.overflow = "";
  document.body.style.width = "";
  setViewportWidths(originalInnerWidth, originalClientWidth);
});

describe("lockBodyScroll", () => {
  it("keeps the document width while the scrollbar is hidden", () => {
    setViewportWidths(1200, 1185);
    const rectSpy = vi
      .spyOn(document.body, "getBoundingClientRect")
      .mockReturnValue({ width: 1185 } as DOMRect);

    const release = lockBodyScroll();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.width).toBe("1185px");

    release();
    rectSpy.mockRestore();

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.width).toBe("");
  });

  it("restores existing inline styles after the final nested lock is released", () => {
    setViewportWidths(1200, 1185);
    document.body.style.overflow = "auto";
    document.body.style.width = "80%";
    const rectSpy = vi
      .spyOn(document.body, "getBoundingClientRect")
      .mockReturnValue({ width: 948 } as DOMRect);

    const releaseFirst = lockBodyScroll();
    const releaseSecond = lockBodyScroll();

    releaseFirst();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.width).toBe("948px");

    releaseSecond();
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.width).toBe("80%");
    rectSpy.mockRestore();
  });

  it("does not add width compensation when there is no layout scrollbar", () => {
    setViewportWidths(1200, 1200);

    const release = lockBodyScroll();

    expect(document.body.style.width).toBe("");
    release();
  });
});
