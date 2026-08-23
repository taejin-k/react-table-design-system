import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
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
  it("renders and closes", async () => {
    render(<DrawerExample />);
    expect(screen.getByText("제목")).toBeInTheDocument();
    await userEvent.click(document.querySelector("[data-drawer-panel] button")!);
    await waitFor(() => expect(document.querySelector("[data-drawer-root]")).not.toBeVisible());
  });

  it("closes when the enabled mask is clicked", async () => {
    render(<DrawerExample />);

    await userEvent.click(document.querySelector("[data-drawer-mask]")!);

    await waitFor(() => expect(document.querySelector("[data-drawer-root]")).not.toBeVisible());
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
});
