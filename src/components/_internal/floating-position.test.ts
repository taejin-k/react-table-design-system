import { beforeEach, describe, expect, it } from "vitest";
import { calculateFloatingPosition, getFloatingTransformOrigin } from "./floating-position";

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

  it("keeps the current placement while both sides fit", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 400, top: 300, width: 120, height: 40 }),
      createRect({ width: 240, height: 120 }),
      "bottomLeft",
      { currentPlacement: "topLeft" },
    );

    expect(position.placement).toBe("topLeft");
  });

  it("keeps the current placement through a small overflow difference", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 400, top: 110, width: 120, height: 40 }),
      createRect({ width: 240, height: 100 }),
      "bottomLeft",
      { currentPlacement: "topLeft" },
    );

    expect(position.placement).toBe("topLeft");
  });

  it("changes placement when the current side overflows beyond the hysteresis", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 400, top: 100, width: 120, height: 40 }),
      createRect({ width: 240, height: 100 }),
      "bottomLeft",
      { currentPlacement: "topLeft" },
    );

    expect(position.placement).toBe("bottomLeft");
  });

  it("prefers top for leftTop when neither horizontal side fits", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 450, top: 300, width: 100, height: 40 }),
      createRect({ width: 500, height: 100 }),
      "leftTop",
    );

    expect(position).toMatchObject({ left: 250, placement: "top", top: 191 });
  });

  it("returns from a horizontal fallback after the tag trigger shrinks", () => {
    const popup = createRect({ width: 240, height: 240 });
    const large = calculateFloatingPosition(
      createRect({ left: 100, top: 100, width: 240, height: 520 }),
      popup,
      "bottomLeft",
    );
    expect(large.placement).toBe("right");

    for (const height of [180, 40]) {
      const smaller = calculateFloatingPosition(
        createRect({ left: 100, top: 100, width: 240, height }),
        popup,
        "bottomLeft",
        { currentPlacement: large.placement },
      );
      expect(smaller.placement).toBe("bottomLeft");
    }
  });

  it("recovers above when below still cannot fit", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 100, top: 300, width: 240, height: 300 }),
      createRect({ width: 240, height: 240 }),
      "bottomLeft",
      { currentPlacement: "right" },
    );
    expect(position.placement).toBe("topLeft");
  });

  it("keeps the fallback when only a temporary search result becomes smaller", () => {
    for (const height of [60, 240, 60, 240]) {
      const position = calculateFloatingPosition(
        createRect({ left: 100, top: 100, width: 240, height: 520 }),
        createRect({ width: 240, height }),
        "bottomLeft",
        { currentPlacement: "right", recoverPreferredAxis: false },
      );
      expect(position.placement).toBe("right");
    }
  });

  it("requires spare room before returning from the side", () => {
    const popup = createRect({ width: 240, height: 240 });
    let currentPlacement: "right" | "bottomLeft" = "right";
    const cases = [
      [350, "right"],
      [338, "right"],
      [335, "right"],
      [331, "bottomLeft"],
      [335, "bottomLeft"],
      [338, "bottomLeft"],
    ] as const;
    for (const [height, expected] of cases) {
      const next = calculateFloatingPosition(
        createRect({ left: 100, top: 100, width: 240, height }),
        popup,
        "bottomLeft",
        { currentPlacement },
      );
      expect(next.placement).toBe(expected);
      currentPlacement = next.placement as typeof currentPlacement;
    }
  });

  it("uses bottom for leftTop only when top does not fit", () => {
    const position = calculateFloatingPosition(
      createRect({ left: 450, top: 40, width: 100, height: 40 }),
      createRect({ width: 500, height: 100 }),
      "leftTop",
    );

    expect(position).toMatchObject({ left: 250, placement: "bottom", top: 89 });
  });

  it("moves an aligned arrow toward the target when the popup is shifted into the viewport", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 280 });

    const position = calculateFloatingPosition(
      createRect({ left: 120, top: 300, width: 44, height: 32 }),
      createRect({ width: 250, height: 80 }),
      "topRight",
    );

    expect(position).toMatchObject({ left: 8, placement: "topRight" });
    expect(position.arrowStyle).toMatchObject({ bottom: -4, left: 130 });
    expect(getFloatingTransformOrigin(position.placement, position.arrowStyle)).toBe(
      "134px bottom",
    );
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
