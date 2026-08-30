import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";

function DrawerExample() {
  const [open, setOpen] = useState(true);
  return (
    <Drawer open={open} title="제목" onClose={() => setOpen(false)}>
      내용
    </Drawer>
  );
}

describe("Drawer", () => {
  it("does not render its panel before the first open unless forceRender is true", () => {
    const { rerender } = render(<Drawer open={false}>내용</Drawer>);

    expect(document.querySelector("[data-drawer-panel]")).not.toBeInTheDocument();

    rerender(
      <Drawer open={false} forceRender>
        내용
      </Drawer>,
    );

    expect(document.querySelector("[data-drawer-panel]")).toBeInTheDocument();
  });

  it("keeps hidden content by default and removes it when destroyOnHidden is true", async () => {
    const { rerender } = render(<Drawer open>내용</Drawer>);

    rerender(<Drawer open={false}>내용</Drawer>);
    await waitFor(() => expect(document.querySelector("[data-drawer-root]")).not.toBeVisible());
    expect(document.querySelector("[data-drawer-panel]")).toBeInTheDocument();

    rerender(
      <Drawer open destroyOnHidden>
        내용
      </Drawer>,
    );
    rerender(
      <Drawer open={false} destroyOnHidden>
        내용
      </Drawer>,
    );
    await waitFor(() =>
      expect(document.querySelector("[data-drawer-panel]")).not.toBeInTheDocument(),
    );
  });

  it("renders and closes", async () => {
    render(<DrawerExample />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    await userEvent.click(document.querySelector("[data-drawer-panel] button")!);
    await waitFor(() => expect(document.querySelector("[data-drawer-root]")).not.toBeVisible());
  });

  it("uses the shared overlay close button", () => {
    render(<DrawerExample />);

    expect(document.querySelector("[data-overlay-close-button]")).toHaveClass(
      "size-7",
      "text-[#666]",
    );
  });

  it("uses the shared table scrollbar styling for its body", () => {
    render(<DrawerExample />);

    expect(document.querySelector("[data-drawer-scroll-container]")).toBeInTheDocument();
  });

  it("keeps focus off the close button when Escape closes it", async () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="제목" onClose={onClose}>
        내용
      </Drawer>,
    );

    const panel = document.querySelector<HTMLElement>("[data-drawer-panel]")!;
    const closeButton = document.querySelector<HTMLElement>("[data-overlay-close-button]")!;

    await waitFor(() => expect(document.activeElement).toBe(panel));
    expect(document.activeElement).not.toBe(closeButton);

    closeButton.focus();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(panel);
  });

  it("closes when the enabled mask is clicked", async () => {
    render(<DrawerExample />);

    await userEvent.click(document.querySelector("[data-drawer-mask]")!);

    await waitFor(() => expect(document.querySelector("[data-drawer-root]")).not.toBeVisible());
  });

  it("calls lifecycle callbacks after its motion changes", async () => {
    const onAfterOpen = vi.fn();
    const onAfterClose = vi.fn();
    const { rerender } = render(
      <Drawer open onAfterOpen={onAfterOpen} onAfterClose={onAfterClose}>
        내용
      </Drawer>,
    );

    await waitFor(() => expect(onAfterOpen).toHaveBeenCalledTimes(1));
    rerender(
      <Drawer open={false} onAfterOpen={onAfterOpen} onAfterClose={onAfterClose}>
        내용
      </Drawer>,
    );
    await waitFor(() => expect(onAfterClose).toHaveBeenCalledTimes(1));
  });

  it("keeps the opened placement while leaving", () => {
    const { rerender } = render(
      <Drawer open placement="top" onClose={() => undefined}>
        내용
      </Drawer>,
    );

    rerender(
      <Drawer open={false} placement="right" onClose={() => undefined}>
        내용
      </Drawer>,
    );

    expect(document.querySelector("[data-drawer-motion]")).toHaveAttribute("data-placement", "top");
  });

  it("uses size as width or height based on placement", () => {
    const { rerender } = render(
      <Drawer open placement="right" size={520} onClose={() => undefined}>
        내용
      </Drawer>,
    );

    expect(document.querySelector("[data-drawer-motion]")).toHaveStyle({
      width: "520px",
      height: "100%",
    });
    expect(document.querySelector("[data-drawer-panel]")).toHaveStyle({
      width: "100%",
      height: "100%",
    });

    rerender(
      <Drawer open placement="top" size="40%" onClose={() => undefined}>
        내용
      </Drawer>,
    );

    expect(document.querySelector("[data-drawer-motion]")).toHaveStyle({
      width: "100%",
      height: "40%",
    });
    expect(document.querySelector("[data-drawer-panel]")).toHaveStyle({
      width: "100%",
      height: "100%",
    });
  });

  it("starts resizing from the rendered size when size uses a CSS length", () => {
    const onResizeStart = vi.fn();
    const onResize = vi.fn();
    render(
      <Drawer
        open
        placement="right"
        size="50%"
        resizable={{ min: 320, max: 900, onResizeStart, onResize }}
        onClose={() => undefined}
      >
        내용
      </Drawer>,
    );

    const panel = document.querySelector<HTMLElement>("[data-drawer-panel]")!;
    const handle = document.querySelector<HTMLElement>("[data-drawer-resize-handle]")!;
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({
      x: 640,
      y: 0,
      left: 640,
      top: 0,
      right: 1280,
      bottom: 800,
      width: 640,
      height: 800,
      toJSON: () => ({}),
    });
    Object.defineProperty(handle, "setPointerCapture", { value: vi.fn() });

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 640 });
    fireEvent.pointerMove(document, { clientX: 590 });

    expect(onResizeStart).toHaveBeenCalledWith(640);
    expect(onResize).toHaveBeenCalledWith(690);
    expect(document.querySelector("[data-drawer-motion]")).toHaveStyle({ width: "690px" });
    expect(panel).toHaveStyle({ width: "100%" });

    fireEvent.pointerUp(document);
  });

  it("shows the motion layer on the same render that opens the drawer", async () => {
    function ClosedDrawerExample() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>열기</button>
          <Drawer open={open} onClose={() => setOpen(false)}>
            내용
          </Drawer>
        </>
      );
    }

    render(<ClosedDrawerExample />);
    await userEvent.click(screen.getByText("열기"));

    expect(document.querySelector("[data-drawer-root]")).toBeVisible();
    expect(document.querySelector("[data-drawer-motion]")).toBeVisible();
  });

  it("moves the parent by 180px only when push is true", async () => {
    const { rerender } = render(
      <Drawer open push title="부모" onClose={() => undefined}>
        <Drawer open title="자식" onClose={() => undefined}>
          내용
        </Drawer>
      </Drawer>,
    );

    const parentPanel = screen.getByText("부모").closest("[data-drawer-panel]");
    await waitFor(() =>
      expect(parentPanel).toHaveStyle({ transform: "translateX(calc(-1 * 180px))" }),
    );

    rerender(
      <Drawer open push={false} title="부모" onClose={() => undefined}>
        <Drawer open title="자식" onClose={() => undefined}>
          내용
        </Drawer>
      </Drawer>,
    );

    expect(parentPanel).toHaveStyle({ transform: "translate(0)" });
  });

  it("preserves newlines in its title and text content", () => {
    render(
      <Drawer open title={"제목 첫 줄\n제목 둘째 줄"} onClose={() => undefined}>
        {"내용 첫 줄\n내용 둘째 줄"}
      </Drawer>,
    );

    const title = screen.getByText(/제목 첫 줄\s+제목 둘째 줄/);
    expect(title).toHaveClass("whitespace-pre-wrap", "[overflow-wrap:anywhere]", "leading-6");
    expect(title.parentElement).toHaveClass("py-4");
    expect(document.querySelector("[data-overlay-close-button]")).toHaveClass("self-start");
    expect(screen.getByText(/내용 첫 줄\s+내용 둘째 줄/)).toHaveClass(
      "whitespace-pre-wrap",
      "[overflow-wrap:anywhere]",
    );
  });
});
