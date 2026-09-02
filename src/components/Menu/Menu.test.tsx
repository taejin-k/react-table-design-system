import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Menu } from "./Menu";

describe("Menu", () => {
  it("selects items and reports Ant Design compatible click information", async () => {
    const onClick = vi.fn();
    render(<Menu items={[{ key: "dashboard", label: "대시보드" }]} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "대시보드" }));
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "dashboard",
        event: expect.anything(),
      }),
    );
    expect(screen.getByRole("button", { name: "대시보드" })).toHaveClass("bg-[#e6f4ff]");
  });

  it("preserves numeric keys in selection callbacks", async () => {
    const onSelect = vi.fn();
    render(<Menu items={[{ key: 1, label: "숫자 메뉴" }]} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "숫자 메뉴" }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: 1, selectedKeys: [1] }));
  });

  it("opens inline submenus with the Ant Motion duration", async () => {
    const { container } = render(
      <Menu
        mode="inline"
        items={[{ key: "parent", label: "설정", children: [{ key: "child", label: "계정" }] }]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "설정" }));
    expect(screen.getByRole("button", { name: "계정" })).toBeVisible();
    expect(container.querySelector(".duration-200")).toBeInTheDocument();
  });

  it("aligns nested inline icons with the item indentation", () => {
    render(
      <Menu
        mode="inline"
        defaultOpenKeys={["parent"]}
        items={[
          {
            key: "parent",
            label: "워크스페이스",
            children: [{ key: "overview", label: "개요", icon: <span data-testid="icon" /> }],
          },
        ]}
      />,
    );

    expect(screen.getByTestId("icon").parentElement).toHaveStyle({ left: "36px" });
  });

  it("does not indent direct group items but indents their children", () => {
    render(
      <Menu
        mode="inline"
        defaultOpenKeys={["workspace"]}
        items={[
          {
            type: "group",
            key: "group",
            label: "메뉴",
            children: [
              {
                key: "workspace",
                label: "워크스페이스",
                children: [{ key: "overview", label: "개요" }],
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "워크스페이스" })).toHaveStyle({
      paddingInlineStart: "12px",
    });
    expect(screen.getByRole("button", { name: "개요" })).toHaveStyle({
      paddingInlineStart: "36px",
    });
  });

  it("renders popup submenus in document.body so overflow parents cannot clip them", async () => {
    const { container } = render(
      <div className="overflow-hidden">
        <Menu
          items={[
            {
              key: "workspace",
              label: "워크스페이스",
              children: [{ key: "document", label: "문서" }],
            },
          ]}
        />
      </div>,
    );

    await userEvent.hover(screen.getByRole("button", { name: "워크스페이스" }));
    const popup = await waitFor(() => {
      const element = document.body.querySelector("[data-menu-popup]");
      expect(element).toBeInTheDocument();
      return element;
    });
    expect(popup).toBeInTheDocument();
    expect(popup).toHaveClass("fixed");
    expect(container.querySelector("[data-menu-popup]")).not.toBeInTheDocument();
    await waitFor(() => expect(popup).toHaveStyle({ visibility: "visible" }));
    await waitFor(() => expect(popup).toHaveClass("opacity-100"));
    expect(screen.getByRole("button", { name: "문서" })).toBeVisible();

    await userEvent.unhover(screen.getByRole("button", { name: "워크스페이스" }));
    await waitFor(() => expect(popup).toHaveClass("opacity-0"));
  });

  it("keeps collapsed content mounted while its width and opacity transition", () => {
    const menuItems = [
      {
        key: "workspace",
        label: "워크스페이스",
        children: [{ key: "document", label: "문서" }],
      },
    ];
    const { container, rerender } = render(
      <Menu mode="inline" defaultOpenKeys={["workspace"]} items={menuItems} />,
    );

    const root = container.querySelector("nav > ul");
    const label = screen.getByText("워크스페이스");
    expect(root).toHaveClass("w-64", "transition-[width]");

    rerender(
      <Menu mode="inline" inlineCollapsed defaultOpenKeys={["workspace"]} items={menuItems} />,
    );

    expect(root).toHaveClass("w-16", "transition-[width]");
    expect(label).toBeInTheDocument();
    expect(label.parentElement).toHaveClass("transition-opacity", "opacity-0");
    expect(screen.getByText("문서")).toBeInTheDocument();
    expect(document.body.querySelector("[data-menu-popup]")).not.toBeInTheDocument();
  });

  it("applies inlineCollapsed only to inline menus", () => {
    const { container } = render(
      <Menu inlineCollapsed items={[{ key: "home", label: "홈", icon: <span /> }]} />,
    );

    expect(container.querySelector("nav > ul")).toHaveClass("w-64");
    expect(screen.getByText("홈").parentElement).toHaveClass("opacity-100");
  });
});
