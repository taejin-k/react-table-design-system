import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tooltip } from "./Tooltip";

function createRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("Tooltip", () => {
  it("opens and closes on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip mouseEnterDelay={0} mouseLeaveDelay={0} title="도움말">
        <button type="button">대상</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "대상" }));
    expect(screen.getByText("도움말")).toBeInTheDocument();

    await user.unhover(screen.getByRole("button", { name: "대상" }));
    await waitFor(() => expect(screen.queryByText("도움말")).not.toBeInTheDocument());
  });

  it("toggles on click and reports open changes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Tooltip title="도움말" trigger="click" onOpenChange={onOpenChange}>
        <button type="button">대상</button>
      </Tooltip>,
    );

    await user.click(screen.getByRole("button", { name: "대상" }));
    expect(screen.getByText("도움말")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByRole("button", { name: "대상" }));
    await waitFor(() => expect(screen.queryByText("도움말")).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("opens at the pointer position with the context menu trigger", async () => {
    render(
      <Tooltip title="도움말" trigger="contextMenu">
        <button type="button">대상</button>
      </Tooltip>,
    );

    const defaultPrevented = !fireEvent.contextMenu(screen.getByRole("button", { name: "대상" }), {
      clientX: 240,
      clientY: 180,
    });

    expect(defaultPrevented).toBe(true);
    expect(await screen.findByText("도움말")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector<HTMLElement>("[data-tooltip]")).toHaveStyle({
        left: "240px",
        top: "171px",
      }),
    );
  });

  it("closes a click tooltip on outside pointer down or Escape", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Tooltip title="도움말" trigger="click">
          <button type="button">대상</button>
        </Tooltip>
        <button type="button">바깥</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "대상" }));
    await user.click(screen.getByRole("button", { name: "바깥" }));
    await waitFor(() => expect(screen.queryByText("도움말")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "대상" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("도움말")).not.toBeInTheDocument());
  });

  it("supports controlled open state, placement, color, and arrow", () => {
    render(
      <Tooltip
        autoAdjustOverflow={false}
        color="#ffffff"
        open
        placement="rightBottom"
        title="도움말"
      >
        <button type="button">대상</button>
      </Tooltip>,
    );

    const popup = screen.getByText("도움말").closest("[data-tooltip]");
    expect(popup).toHaveAttribute("data-placement", "rightBottom");
    expect(screen.getByText("도움말").parentElement).toHaveStyle({ backgroundColor: "#ffffff" });
    expect(popup?.querySelector("[data-tooltip-arrow]")).toBeInTheDocument();
  });

  it("preserves line breaks in string content", () => {
    render(
      <Tooltip open title={`첫 번째 줄\n두 번째 줄`}>
        <button type="button">대상</button>
      </Tooltip>,
    );

    const content = document.querySelector("[data-tooltip] span");
    expect(content).toHaveTextContent("첫 번째 줄 두 번째 줄");
    expect(content).toHaveClass("whitespace-pre-wrap", "[overflow-wrap:anywhere]");
    expect(content?.textContent).toBe("첫 번째 줄\n두 번째 줄");
  });

  it("aligns the start, center, and end placements differently", () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        return this.hasAttribute("data-tooltip")
          ? createRect(0, 0, 60, 40)
          : createRect(100, 200, 100, 32);
      });

    render(
      <>
        <Tooltip open placement="topLeft" title="왼쪽">
          <button type="button">왼쪽 대상</button>
        </Tooltip>
        <Tooltip open placement="top" title="가운데">
          <button type="button">가운데 대상</button>
        </Tooltip>
        <Tooltip open placement="topRight" title="오른쪽">
          <button type="button">오른쪽 대상</button>
        </Tooltip>
        <Tooltip open placement="bottomLeft" title="아래 왼쪽">
          <button type="button">아래 왼쪽 대상</button>
        </Tooltip>
        <Tooltip open placement="bottom" title="아래 가운데">
          <button type="button">아래 가운데 대상</button>
        </Tooltip>
        <Tooltip open placement="bottomRight" title="아래 오른쪽">
          <button type="button">아래 오른쪽 대상</button>
        </Tooltip>
      </>,
    );

    expect(document.querySelector('[data-placement="topLeft"]')).toHaveStyle({
      left: "100px",
      top: "151px",
    });
    expect(document.querySelector('[data-placement="top"]')).toHaveStyle({ left: "120px" });
    expect(document.querySelector('[data-placement="topRight"]')).toHaveStyle({ left: "140px" });
    expect(document.querySelector('[data-placement="bottomLeft"]')).toHaveStyle({
      left: "100px",
      top: "241px",
    });
    expect(document.querySelector('[data-placement="bottom"]')).toHaveStyle({ left: "120px" });
    expect(document.querySelector('[data-placement="bottomRight"]')).toHaveStyle({
      left: "140px",
    });
    expect(
      document.querySelector('[data-placement="bottomLeft"] [data-tooltip-arrow]'),
    ).toHaveStyle({ left: "12px" });
    expect(document.querySelector('[data-placement="bottom"] [data-tooltip-arrow]')).toHaveStyle({
      left: "26px",
    });
    expect(
      document.querySelector('[data-placement="bottomRight"] [data-tooltip-arrow]'),
    ).toHaveStyle({ left: "40px" });
    getBoundingClientRect.mockRestore();
  });

  it("changes leftBottom to leftTop near the top viewport edge", async () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        return this.hasAttribute("data-tooltip")
          ? createRect(0, 0, 240, 140)
          : createRect(600, 8, 120, 48);
      });

    render(
      <Tooltip open placement="leftBottom" title="도움말">
        <button type="button">대상</button>
      </Tooltip>,
    );

    const popup = document.querySelector<HTMLElement>("[data-tooltip]");
    await waitFor(() => expect(popup).toHaveAttribute("data-placement", "leftTop"));
    expect(popup?.querySelector("[data-tooltip-arrow]")).toHaveStyle({
      right: "-4px",
      top: "12px",
    });
    getBoundingClientRect.mockRestore();
  });

  it("closes when the page or a scrollable ancestor scrolls", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip mouseEnterDelay={0} title="도움말">
        <button type="button">대상</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "대상" }));
    expect(screen.getByText("도움말")).toBeInTheDocument();

    fireEvent.scroll(window);
    await waitFor(() => expect(screen.queryByText("도움말")).not.toBeInTheDocument());
  });

  it("does not render when title is empty", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip mouseEnterDelay={0} title="">
        <button type="button">대상</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "대상" }));
    expect(document.querySelector("[data-tooltip]")).not.toBeInTheDocument();
  });
});
