import { afterEach, describe, expect, it } from "vitest";
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
  document.body.style.paddingRight = "";
  document.documentElement.style.scrollbarGutter = "";
  document.body.style.scrollbarGutter = "";
  setViewportWidths(originalInnerWidth, originalClientWidth);
});

describe("lockBodyScroll", () => {
  it("keeps the document width while the scrollbar is hidden", () => {
    setViewportWidths(1200, 1185);
    const release = lockBodyScroll();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.width).toBe("");
    expect(document.body.style.paddingRight).toBe("15px");
    expect(document.documentElement.style.scrollbarGutter).toBe("auto");
    expect(document.body.style.scrollbarGutter).toBe("auto");

    release();

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.width).toBe("");
    expect(document.body.style.paddingRight).toBe("");
    expect(document.documentElement.style.scrollbarGutter).toBe("");
    expect(document.body.style.scrollbarGutter).toBe("");
  });

  it("restores existing inline styles after the final nested lock is released", () => {
    setViewportWidths(1200, 1185);
    document.body.style.overflow = "auto";
    document.body.style.width = "80%";
    document.body.style.paddingRight = "5px";
    document.documentElement.style.scrollbarGutter = "stable";
    document.body.style.scrollbarGutter = "stable";

    const releaseFirst = lockBodyScroll();
    const releaseSecond = lockBodyScroll();

    releaseFirst();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.width).toBe("80%");
    expect(document.body.style.paddingRight).toBe("20px");
    expect(document.documentElement.style.scrollbarGutter).toBe("auto");
    expect(document.body.style.scrollbarGutter).toBe("auto");

    releaseSecond();
    expect(document.body.style.overflow).toBe("auto");
    expect(document.body.style.width).toBe("80%");
    expect(document.body.style.paddingRight).toBe("5px");
    expect(document.documentElement.style.scrollbarGutter).toBe("stable");
    expect(document.body.style.scrollbarGutter).toBe("stable");
  });

  it("does not add width compensation when there is no layout scrollbar", () => {
    setViewportWidths(1200, 1200);

    const release = lockBodyScroll();

    expect(document.body.style.width).toBe("");
    expect(document.body.style.paddingRight).toBe("");
    release();
  });
});
