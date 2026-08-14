import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
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
  it("renders in a portal and closes from cancel", async () => {
    render(<ModalExample />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    await userEvent.click(screen.getByText("취소"));
    await waitFor(() =>
      expect(document.querySelector("[data-modal-root]")).toHaveClass("invisible"),
    );
  });

  it("provides hook methods with a context holder", async () => {
    function HookExample() {
      const [api, holder] = Modal.useModal();
      return (
        <>
          {holder}
          <button onClick={() => api.confirm({ title: "확인", content: "내용" })}>열기</button>
        </>
      );
    }
    render(<HookExample />);
    await userEvent.click(screen.getByText("열기"));
    expect(screen.getAllByText("확인")).toHaveLength(2);
  });
});
