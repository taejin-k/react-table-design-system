import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

function ModalExample() {
  const [open, setOpen] = useState(true);
  return (
    <Modal open={open} title="제목" onCancel={() => setOpen(false)}>
      내용
    </Modal>
  );
}

describe("Modal", () => {
  afterEach(() => Modal.destroyAll());

  it("renders in a portal and closes from cancel", async () => {
    render(<ModalExample />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    await userEvent.click(screen.getByText("취소"));
    await waitFor(() => expect(document.querySelector("[data-modal-root]")).not.toBeVisible());
  });

  it("closes when the enabled mask is clicked", async () => {
    render(<ModalExample />);

    await userEvent.click(document.querySelector("[data-modal-mask]")!);

    await waitFor(() => expect(document.querySelector("[data-modal-root]")).not.toBeVisible());
  });

  it("opens from a static method without a context holder", async () => {
    render(<button onClick={() => Modal.confirm({ title: "확인", content: "내용" })}>열기</button>);
    await userEvent.click(screen.getByText("열기"));
    await waitFor(() => expect(screen.getAllByText("확인")).toHaveLength(2));
  });

  it("uses the opening click position as the zoom origin after the panel is measurable", async () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        if (this.hasAttribute("data-modal-panel")) {
          return {
            x: 300,
            y: 100,
            left: 300,
            top: 100,
            right: 820,
            bottom: 280,
            width: 520,
            height: 180,
            toJSON: () => ({}),
          };
        }
        return original.call(this);
      });

    function ClickOriginExample() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>열기</button>
          <Modal open={open} onCancel={() => setOpen(false)}>
            내용
          </Modal>
        </>
      );
    }

    render(<ClickOriginExample />);
    fireEvent.click(screen.getByText("열기"), { clientX: 80, clientY: 120 });

    await waitFor(() =>
      expect(document.querySelector("[data-modal-panel]")).toHaveStyle({
        transformOrigin: "-220px 20px",
      }),
    );
    rectSpy.mockRestore();
  });
});
