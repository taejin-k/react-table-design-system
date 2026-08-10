import { fireEvent, render, screen } from "@testing-library/react";
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
    expect(screen.queryByRole("button", { name: "실행" })).not.toBeInTheDocument();
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
    expect(screen.queryByText("추가 내용")).not.toBeInTheDocument();
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
});
