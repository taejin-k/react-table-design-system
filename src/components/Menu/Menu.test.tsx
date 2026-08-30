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
      expect.objectContaining({ key: "dashboard", keyPath: ["dashboard"] }),
    );
    expect(screen.getByRole("button", { name: "대시보드" })).toHaveClass("bg-[#e6f4ff]");
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

  it("renders popup submenus in document.body so overflow parents cannot clip them", async () => {
    const { container } = render(
      <div className="overflow-hidden">
        <Menu
          mode="horizontal"
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
    expect(popup).toHaveClass("fixed", "opacity-100");
    expect(container.querySelector("[data-menu-popup]")).not.toBeInTheDocument();
    await waitFor(() => expect(popup).toHaveStyle({ visibility: "visible" }));
    expect(screen.getByRole("button", { name: "문서" })).toBeVisible();
  });

  it("keeps horizontal items inside the menu viewport", () => {
    const { container } = render(
      <Menu
        mode="horizontal"
        items={[
          { key: "home", label: "홈" },
          { key: "workspace", label: "워크스페이스" },
          { key: "settings", label: "설정" },
        ]}
      />,
    );

    expect(container.querySelector("ul")).toHaveClass(
      "max-w-full",
      "overflow-x-auto",
      "wizard-scrollbar-hidden",
    );
  });
});
