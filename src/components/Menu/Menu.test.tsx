import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Menu } from "./Menu";

describe("Menu", () => {
  it("selects items and reports Ant Design compatible click information", async () => {
    const onClick = vi.fn();
    render(<Menu items={[{ key: "dashboard", label: "대시보드" }]} onClick={onClick} />);
    await userEvent.click(screen.getByRole("menuitem", { name: "대시보드" }));
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ key: "dashboard", keyPath: ["dashboard"] }),
    );
    expect(screen.getByRole("menuitem", { name: "대시보드" })).toHaveClass("bg-[#e6f4ff]");
  });

  it("opens inline submenus with the Ant Motion duration", async () => {
    const { container } = render(
      <Menu
        mode="inline"
        items={[{ key: "parent", label: "설정", children: [{ key: "child", label: "계정" }] }]}
      />,
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "설정" }));
    expect(screen.getByRole("menuitem", { name: "계정" })).toBeVisible();
    expect(container.querySelector(".duration-200")).toBeInTheDocument();
  });
});
