import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./Popover";

describe("Popover", () => {
  it("opens on hover and stays open while the pointer is over the card", async () => {
    const user = userEvent.setup();
    render(
      <Popover content="추가 내용" mouseEnterDelay={0} title="제목">
        <button type="button">대상</button>
      </Popover>,
    );

    await user.hover(screen.getByRole("button", { name: "대상" }));
    expect(screen.getByText("추가 내용")).toBeInTheDocument();

    await user.hover(screen.getByText("추가 내용"));
    expect(screen.getByText("추가 내용")).toBeInTheDocument();
  });

  it("allows actions inside a click popover and closes on outside click", async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();
    render(
      <div>
        <Popover
          content={
            <button type="button" onClick={handleAction}>
              실행
            </button>
          }
          trigger="click"
        >
          <button type="button">대상</button>
        </Popover>
        <button type="button">바깥</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "대상" }));
    await user.click(screen.getByRole("button", { name: "실행" }));
    expect(handleAction).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "실행" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "바깥" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "실행" })).not.toBeInTheDocument(),
    );
  });

  it("reports controlled open changes and closes on scroll", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Popover content="추가 내용" trigger="click" onOpenChange={onOpenChange}>
        <button type="button">대상</button>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "대상" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.scroll(window);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByText("추가 내용")).not.toBeInTheDocument());
  });

  it("opens at the pointer position with the context menu trigger", async () => {
    render(
      <Popover content="추가 내용" trigger="contextMenu">
        <button type="button">대상</button>
      </Popover>,
    );

    const defaultPrevented = !fireEvent.contextMenu(screen.getByRole("button", { name: "대상" }), {
      clientX: 240,
      clientY: 180,
    });

    expect(defaultPrevented).toBe(true);
    expect(await screen.findByText("추가 내용")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector<HTMLElement>("[data-popover]")).toHaveStyle({
        left: "240px",
        top: "171px",
      }),
    );
  });

  it("supports multiple trigger events", async () => {
    const user = userEvent.setup();
    render(
      <Popover content="추가 내용" mouseEnterDelay={0} trigger={["hover", "focus"]}>
        <button type="button">대상</button>
      </Popover>,
    );

    await user.tab();
    expect(await screen.findByText("추가 내용")).toBeInTheDocument();
  });

  it("does not render when content is empty", async () => {
    const user = userEvent.setup();
    render(
      <Popover content={null} mouseEnterDelay={0}>
        <button type="button">대상</button>
      </Popover>,
    );

    await user.hover(screen.getByRole("button", { name: "대상" }));
    expect(document.querySelector("[data-popover]")).not.toBeInTheDocument();
  });

  it("uses leftTop when leftBottom cannot preserve its bottom alignment", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1000 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });
    const getBoundingClientRect = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        if (this instanceof HTMLSpanElement)
          return createRect({ left: 600, top: 8, width: 120, height: 48 });
        if (this instanceof HTMLElement && this.dataset.popover !== undefined)
          return createRect({ width: 240, height: 140 });
        return createRect({});
      });

    render(
      <Popover content="추가 내용" placement="leftBottom" trigger="click">
        <button type="button">대상</button>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "대상" }));
    await waitFor(() =>
      expect(document.querySelector("[data-popover]")).toHaveAttribute("data-placement", "leftTop"),
    );
    expect(document.querySelector("[data-popover-arrow]")).toHaveStyle({
      right: "-4px",
      top: "12px",
    });

    getBoundingClientRect.mockRestore();
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
