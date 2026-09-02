import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "./Dropdown";

const items = [
  { value: "edit", label: "수정" },
  { value: "disabled", label: "이동", disabled: true },
  { value: "delete", label: "삭제", danger: true },
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
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument(),
    );
  });

  it("supports an array of trigger events", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown menu={{ items }} mouseEnterDelay={0} trigger={["focus", "click"]}>
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "메뉴" });
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();

    fireEvent.scroll(window);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument(),
    );

    await user.click(trigger);
    expect(screen.getByRole("button", { name: "수정" })).toBeInTheDocument();
  });

  it("opens at the pointer position with the context menu trigger", async () => {
    render(
      <Dropdown menu={{ items }} trigger="contextMenu">
        <button type="button">메뉴</button>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "메뉴" });
    const defaultPrevented = !fireEvent.contextMenu(trigger, {
      clientX: 240,
      clientY: 180,
    });

    expect(defaultPrevented).toBe(true);
    expect(await screen.findByRole("button", { name: "수정" })).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector<HTMLElement>("[data-dropdown]")).toHaveStyle({
        left: "240px",
        top: "189px",
      }),
    );
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

    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ value: "edit", event: expect.anything() }),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    const motion = document.querySelector<HTMLElement>("[data-dropdown-motion]");
    expect(motion).toHaveStyle({ opacity: "0", transform: "scaleY(0.8)" });
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument(),
    );
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
    expect(onSelect).toHaveBeenCalledWith({ value: "edit", selectedValues: ["edit"] });

    await user.click(screen.getByRole("button", { name: "삭제" }));
    expect(onSelect).toHaveBeenLastCalledWith({
      value: "delete",
      selectedValues: ["edit", "delete"],
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
    expect(trigger.parentElement).not.toHaveClass("cursor-not-allowed", "opacity-50");

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
              value: "actions",
              label: "문서 작업",
              type: "group",
              children: [{ value: "edit", label: "수정", onClick: onItemClick }],
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
      expect.objectContaining({ value: "edit", valuePath: ["edit", "actions"] }),
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
