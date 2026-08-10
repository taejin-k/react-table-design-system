import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";

const items = [
  { key: "edit", label: "수정" },
  { key: "disabled", label: "이동", disabled: true },
  { key: "delete", label: "삭제", danger: true },
];

describe("Dropdown", () => {
  it("opens on hover and closes when the page scrolls", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown menu={{ items }} mouseEnterDelay={0}>
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    await user.hover(screen.getByRole("button", { name: "메뉴" }));
    expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();

    fireEvent.scroll(window);
    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
  });

  it("runs the menu callback and closes after clicking an item", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Dropdown menu={{ items, onClick }} trigger="click" onOpenChange={onOpenChange}>
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    await user.click(screen.getByRole("button", { name: "메뉴" }));
    await user.click(screen.getByRole("button", { name: "수정" }));

    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: "edit" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { source: "menu" });
    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
  });

  it("supports selectable and multiple menu items", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Dropdown menu={{ items, selectable: true, multiple: true, onSelect }} trigger="click">
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    await user.click(screen.getByRole("button", { name: "메뉴" }));
    await user.click(screen.getByRole("button", { name: "수정" }));
    expect(onSelect).toHaveBeenCalledWith({ key: "edit", selectedKeys: ["edit"] });
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown disabled menu={{ items }} trigger="click">
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    await user.click(screen.getByRole("button", { name: "메뉴" }));
    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
  });
});
