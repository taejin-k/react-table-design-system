import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  afterEach(() => act(() => Modal.destroyAll()));

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

  it("closes a static modal when its default mask is clicked", async () => {
    render(<button onClick={() => Modal.info({ title: "안내", content: "내용" })}>열기</button>);
    await userEvent.click(screen.getByText("열기"));
    await waitFor(() => expect(document.querySelector("[data-modal-mask]")).toBeInTheDocument());

    await userEvent.click(document.querySelector("[data-modal-mask]")!);

    await waitFor(() =>
      expect(document.querySelector("[data-modal-root]")).not.toBeInTheDocument(),
    );
  });

  it("does not render a mask for a static modal when mask is false", async () => {
    render(
      <button onClick={() => Modal.info({ title: "안내", content: "내용", mask: false })}>
        열기
      </button>,
    );
    await userEvent.click(screen.getByText("열기"));
    await waitFor(() => expect(screen.getByText("안내")).toBeInTheDocument());

    expect(document.querySelector("[data-modal-mask]")).not.toBeInTheDocument();
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

  it("preserves the confirm button while its loading state changes", () => {
    const { rerender } = render(
      <Modal open confirmLoading={false} onCancel={() => undefined} onConfirm={() => undefined}>
        내용
      </Modal>,
    );
    const button = screen.getByText("확인").closest("button");

    rerender(
      <Modal open confirmLoading onCancel={() => undefined} onConfirm={() => undefined}>
        내용
      </Modal>,
    );

    expect(screen.getByText("확인").closest("button")).toBe(button);
    expect(button?.querySelector("svg")).toBeInTheDocument();
  });

  it("uses the shared overlay close button", () => {
    render(
      <Modal open title="제목" onCancel={() => undefined}>
        내용
      </Modal>,
    );

    expect(document.querySelector("[data-overlay-close-button]")).toHaveClass(
      "size-7",
      "text-[#666]",
    );
  });

  it("preserves newlines in its title and text content", () => {
    render(
      <Modal open title={"제목 첫 줄\n제목 둘째 줄"} onCancel={() => undefined}>
        {"내용 첫 줄\n내용 둘째 줄"}
      </Modal>,
    );

    expect(screen.getByText(/제목 첫 줄\s+제목 둘째 줄/)).toHaveClass(
      "whitespace-pre-wrap",
      "[overflow-wrap:anywhere]",
    );
    expect(screen.getByText(/내용 첫 줄\s+내용 둘째 줄/)).toHaveClass("whitespace-pre-wrap");
  });

  it("aligns a static status icon with the first title line", async () => {
    render(
      <button
        onClick={() =>
          Modal.info({
            title: "제목 첫 줄\n제목 둘째 줄",
            content: "내용 첫 줄\n내용 둘째 줄",
          })
        }
      >
        열기
      </button>,
    );

    await userEvent.click(screen.getByText("열기"));

    const title = await screen.findByText(/제목 첫 줄\s+제목 둘째 줄/);
    expect(title.parentElement?.parentElement?.firstElementChild).toHaveClass("-mt-0.5", "mr-2.5");
    expect(title).toHaveClass("whitespace-pre-wrap");
    expect(title.parentElement).toHaveClass("[overflow-wrap:anywhere]");
    expect(screen.getByText(/내용 첫 줄\s+내용 둘째 줄/)).toHaveClass("whitespace-pre-wrap");
  });

  it("uses a 420px default width", () => {
    render(
      <Modal open onCancel={() => undefined}>
        내용
      </Modal>,
    );

    expect(document.querySelector("[data-modal-panel]")).toHaveStyle({ width: "420px" });
  });

  it("updates a responsive width on resize before the modal closes", async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 500 });
    const { rerender } = render(
      <Modal open width={{ xs: 320, md: 720 }} onCancel={() => undefined}>
        내용
      </Modal>,
    );
    expect(document.querySelector("[data-modal-panel]")).toHaveStyle({ width: "320px" });

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 800 });
    fireEvent(window, new Event("resize"));
    await waitFor(() =>
      expect(document.querySelector("[data-modal-panel]")).toHaveStyle({ width: "720px" }),
    );

    rerender(
      <Modal open={false} width={{ xs: 320, md: 720 }} onCancel={() => undefined}>
        내용
      </Modal>,
    );
    expect(document.querySelector("[data-modal-panel]")).toHaveStyle({ width: "720px" });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
  });
});
