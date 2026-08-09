import { describe, expect, it } from "vitest";
import { canTableAutoScroll, restrictRowToTableBody } from "./Table.row-drag";

function setScrollSize(element: HTMLElement, clientHeight: number, scrollHeight: number) {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: clientHeight },
    scrollHeight: { configurable: true, value: scrollHeight },
  });
}

describe("Table row drag auto scroll", () => {
  it("allows auto scrolling only inside an overflowing table body", () => {
    const tableBody = document.createElement("div");
    tableBody.setAttribute("data-table-scroll-container", "");
    setScrollSize(tableBody, 280, 660);

    const page = document.createElement("main");
    setScrollSize(page, 720, 3000);

    expect(canTableAutoScroll(tableBody)).toBe(true);
    expect(canTableAutoScroll(page)).toBe(false);
  });

  it("stops auto scrolling when the table body has no remaining overflow", () => {
    const tableBody = document.createElement("div");
    tableBody.setAttribute("data-table-scroll-container", "");
    setScrollSize(tableBody, 280, 280);

    expect(canTableAutoScroll(tableBody)).toBe(false);
  });
});

describe("Table row drag movement", () => {
  it("keeps a dragged row inside the table body", () => {
    const table = document.createElement("table");
    const tableBody = document.createElement("tbody");
    const row = document.createElement("tr");
    const handle = document.createElement("button");
    row.append(handle);
    tableBody.append(row);
    table.append(tableBody);

    tableBody.getBoundingClientRect = () =>
      DOMRect.fromRect({ x: 0, y: 100, width: 600, height: 250 });

    const pointerEvent = new PointerEvent("pointerdown");
    Object.defineProperty(pointerEvent, "target", { value: handle });
    const modifierArguments = {
      active: { data: { current: { dragType: "row" } } },
      activeNodeRect: DOMRect.fromRect({ x: 0, y: 100, width: 600, height: 50 }),
      activatorEvent: pointerEvent,
      transform: { x: 80, y: 500, scaleX: 1, scaleY: 1 },
    } as unknown as Parameters<typeof restrictRowToTableBody>[0];

    expect(restrictRowToTableBody(modifierArguments)).toEqual({
      x: 0,
      y: 200,
      scaleX: 1,
      scaleY: 1,
    });
  });
});
