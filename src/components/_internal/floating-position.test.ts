import { beforeEach, describe, expect, it } from "vitest";
import { calculateFloatingPosition } from "./floating-position";

describe("calculateFloatingPosition", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1000 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });
  });

  it("uses leftTop when leftBottom would overflow the top edge", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 600, top: 8, width: 120, height: 48 }),
      createRect({ width: 240, height: 140 }),
      "leftBottom",
    );

    expect(position).toMatchObject({ left: 351, placement: "leftTop", top: 8 });
    expect(position.arrowStyle).toMatchObject({ right: -4, top: 12 });
  });

  it("uses rightTop when rightBottom would overflow the top edge", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 200, top: 8, width: 120, height: 48 }),
      createRect({ width: 240, height: 140 }),
      "rightBottom",
    );

    expect(position).toMatchObject({ left: 329, placement: "rightTop", top: 8 });
  });

  it("uses bottomLeft when bottomRight would overflow the left edge", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 8, top: 200, width: 120, height: 48 }),
      createRect({ width: 240, height: 140 }),
      "bottomRight",
    );

    expect(position).toMatchObject({ left: 8, placement: "bottomLeft", top: 257 });
  });

  it("keeps the requested corner placement when it fits", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 600, top: 300, width: 120, height: 48 }),
      createRect({ width: 240, height: 140 }),
      "leftBottom",
    );

    expect(position).toMatchObject({ left: 351, placement: "leftBottom", top: 208 });
  });

  it("uses bottom when a horizontal placement cannot fit above the visible edge", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 220, top: -12, width: 220, height: 48 }),
      createRect({ width: 145, height: 88 }),
      "leftBottom",
    );

    expect(position).toMatchObject({ placement: "bottom", top: 45 });
    expect(position.arrowStyle).toHaveProperty("top", -4);
  });

  it("uses top when a horizontal placement cannot fit below the visible edge", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 270, top: 680, width: 225, height: 48 }),
      createRect({ width: 145, height: 88 }),
      "leftTop",
    );

    expect(position).toMatchObject({ placement: "top", top: 583 });
    expect(position.arrowStyle).toHaveProperty("bottom", -4);
  });
});

function createRect({
  left = 0,
  top = 0,
  width = 0,
  height = 0,
}: Partial<Pick<DOMRect, "left" | "top" | "width" | "height">>): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  };
}
