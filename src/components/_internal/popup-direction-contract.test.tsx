import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropdown } from "../Dropdown/Dropdown";
import { Menu } from "../Menu/Menu";
import { Tooltip } from "../Tooltip/Tooltip";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("popup direction stability", () => {
  it("keeps Tooltip above on content shrink, honors placement changes, and resets on reopen", () => {
    vi.stubGlobal("innerWidth", 1000);
    vi.stubGlobal("innerHeight", 600);
    let height = 240;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.hasAttribute("data-tooltip")
        ? new DOMRect(0, 0, 200, height)
        : new DOMRect(200, 400, 100, 24);
    });
    const { rerender } = render(
      <Tooltip open placement="bottomLeft" title="Long">
        <button>Target</button>
      </Tooltip>,
    );
    const popup = document.querySelector("[data-tooltip]")!;
    expect(popup).toHaveAttribute("data-placement", "topLeft");
    height = 100;
    rerender(
      <Tooltip open placement="bottomLeft" title="Short">
        <button>Target</button>
      </Tooltip>,
    );
    expect(popup).toHaveAttribute("data-placement", "topLeft");
    rerender(
      <Tooltip open={false} placement="bottomLeft" title="Short">
        <button>Target</button>
      </Tooltip>,
    );
    expect(popup).toHaveAttribute("data-placement", "topLeft");
    rerender(
      <Tooltip open placement="bottomLeft" title="Short">
        <button>Target</button>
      </Tooltip>,
    );
    expect(popup).toHaveAttribute("data-placement", "bottomLeft");
    rerender(
      <Tooltip open placement="topLeft" title="Short">
        <button>Target</button>
      </Tooltip>,
    );
    expect(popup).toHaveAttribute("data-placement", "topLeft");
  });

  it("keeps Menu left on resize and chooses a fresh side after reopening", () => {
    vi.stubGlobal("innerWidth", 1000);
    vi.stubGlobal("innerHeight", 700);
    let width = 300;
    const callbacks: (() => void)[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          callbacks.push(callback);
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      new DOMRect(700, 100, 100, 32),
    );
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.hasAttribute("data-menu-popup") ? width : 100;
    });
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(100);
    const items = [
      { key: "parent", label: "Parent", children: [{ key: "child", label: "Child" }] },
    ];
    const { rerender } = render(<Menu items={items} openKeys={["parent"]} />);
    const popup = document.querySelector("[data-menu-popup]")!;
    expect(popup).toHaveAttribute("data-placement", "leftTop");
    width = 150;
    act(() => callbacks.forEach((callback) => callback()));
    expect(popup).toHaveAttribute("data-placement", "leftTop");
    rerender(<Menu items={items} openKeys={[]} />);
    expect(popup).toHaveAttribute("data-placement", "leftTop");
    rerender(<Menu items={items} openKeys={["parent"]} />);
    expect(popup).toHaveAttribute("data-placement", "rightTop");
  });

  it.each(["click", "hover"] as const)(
    "keeps the %s Dropdown submenu side until it closes",
    (action) => {
      vi.stubGlobal("innerWidth", 1000);
      vi.stubGlobal("innerHeight", 700);
      vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1000);
      vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(700);
      let width = 300;
      vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
        new DOMRect(700, 100, 100, 32),
      );
      vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (
        this: HTMLElement,
      ) {
        return this.hasAttribute("data-dropdown-submenu") ? width : 128;
      });
      vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(100);
      const items = [
        { value: "parent", label: "Parent", children: [{ value: "child", label: "Child" }] },
      ];
      const { rerender } = render(
        <Dropdown open menu={{ items }}>
          <button>Target</button>
        </Dropdown>,
      );
      const parent = screen.getByRole("button", { name: "Parent" });
      // Preserve premeasurement so the first hover frame uses the correct side.
      expect(document.querySelector("[data-dropdown-submenu]")).toHaveClass("origin-right");
      if (action === "click") fireEvent.click(parent);
      else fireEvent.mouseEnter(parent.parentElement!);
      const popup = document.querySelector("[data-dropdown-submenu]")!;
      expect(popup).toHaveClass("origin-right");
      width = 150;
      rerender(
        <Dropdown open menu={{ items }}>
          <button>Target</button>
        </Dropdown>,
      );
      expect(popup).toHaveClass("origin-right");
      if (action === "click") fireEvent.click(parent);
      else fireEvent.mouseLeave(parent.parentElement!);
      expect(popup).toHaveClass("origin-right");
      if (action === "click") fireEvent.click(parent);
      else fireEvent.mouseEnter(parent.parentElement!);
      expect(popup).toHaveClass("origin-left");
    },
  );
});
