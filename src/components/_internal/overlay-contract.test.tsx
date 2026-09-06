import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "../Modal";
import { Drawer } from "../Drawer";
import { Image } from "../Image";
import { Tabs } from "../Tabs";
import { Upload } from "../Upload";

afterEach(cleanup);

describe("overlay keyboard and root contracts", () => {
  it("keeps long modal titles outside the close button area", () => {
    const title = "긴제목".repeat(50);
    const { rerender } = render(<Modal open title={title} />);
    expect(screen.getByText(title)).toHaveClass("pr-6");
    rerender(<Modal open title={title} closable={false} />);
    expect(screen.getByText(title)).not.toHaveClass("pr-6");
  });

  it("does not attach drag-library screen reader output to the document", () => {
    render(
      <>
        <Tabs onDrag={() => {}} items={[{ key: "a", label: "첫 탭" }]} />
        <Upload draggable defaultFileList={[{ uid: "a", name: "file.txt" }]} />
      </>,
    );
    expect(
      document.querySelector('[aria-live], [aria-describedby], [role="status"], [role="log"]'),
    ).toBeNull();
  });

  it.each(["Modal", "Drawer"])(
    "%s keeps focus during parent rerenders",
    async (kind) => {
      const first = vi.fn();
      const latest = vi.fn();
      const content = (onClose: () => void) =>
        kind === "Modal" ? (
          <Modal open onCancel={onClose}>
            <input placeholder="editor" />
          </Modal>
        ) : (
          <Drawer open onClose={onClose}>
            <input placeholder="editor" />
          </Drawer>
        );
      const { rerender } = render(content(first));
      const panel = document.querySelector(`[data-${kind.toLowerCase()}-panel]`);
      await waitFor(() => expect(panel).toHaveFocus());
      const input = screen.getByPlaceholderText("editor");
      input.focus();
      rerender(content(latest));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(input).toHaveFocus();
      fireEvent.keyDown(input, { key: "Escape" });
      expect(first).not.toHaveBeenCalled();
      expect(latest).toHaveBeenCalledTimes(1);
    },
  );

  it("Escape closes only the top overlay, even when it was mounted first", () => {
    const modalClose = vi.fn();
    const drawerClose = vi.fn();
    render(
      <>
        <Modal open zIndex={2000} onCancel={modalClose} />
        <Drawer open onClose={drawerClose} />
      </>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(modalClose).toHaveBeenCalledTimes(1);
    expect(drawerClose).not.toHaveBeenCalled();
  });

  it("a top overlay with keyboard disabled still protects the one below", () => {
    const close = vi.fn();
    render(
      <>
        <Modal open onCancel={close} />
        <Drawer open keyboard={false} />
      </>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(close).not.toHaveBeenCalled();
  });

  it("closing an image preview does not close its surrounding modal", () => {
    const close = vi.fn();
    const previewChange = vi.fn();
    render(
      <Modal open onCancel={close}>
        <Image src="photo.png" preview={{ open: true, onOpenChange: previewChange }} />
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(previewChange).toHaveBeenCalledWith(false, true);
    expect(close).not.toHaveBeenCalled();
  });
});
