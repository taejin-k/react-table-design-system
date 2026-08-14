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
    await waitFor(() =>
      expect(document.querySelector("[data-drawer-root]")).toHaveClass("invisible"),
    );
  });
});
