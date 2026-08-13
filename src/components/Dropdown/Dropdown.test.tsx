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
    expect(screen.getByRole("button", { name: "수정" })).toHaveClass("cursor-pointer");
    expect(screen.getByRole("button", { name: "이동" })).toHaveClass("cursor-not-allowed");

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

    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(onSelect).toHaveBeenLastCalledWith({
      key: "delete",
      selectedKeys: ["edit", "delete"],
    });
    expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown disabled menu={{ items }} trigger="click">
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "메뉴" });
    expect(trigger.parentElement).toHaveClass(
      "cursor-not-allowed",
      "[&>*]:pointer-events-none",
    );

    await user.click(trigger);
    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
  });

  it("renders grouped items and runs an item callback", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(
      <Dropdown
        menu={{
          items: [
            {
              key: "actions",
              label: "문서 작업",
              type: "group",
              children: [{ key: "edit", label: "수정", onClick: onItemClick }],
            },
          ],
        }}
        trigger="click"
      >
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    await user.click(screen.getByRole("button", { name: "메뉴" }));
    expect(screen.getByText("문서 작업")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "수정" }));
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ key: "edit", keyPath: ["edit", "actions"] }),
    );
  });

  it("renders an arrow when requested", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown arrow menu={{ items }} trigger="click">
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    await user.click(screen.getByRole("button", { name: "메뉴" }));
    expect(document.querySelector("[data-dropdown-arrow]")).toBeInTheDocument();
  });
});
