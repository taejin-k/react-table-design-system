import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tree } from "./Tree";

const treeData = [{ key: "parent", title: "상위", children: [{ key: "child", title: "하위" }] }];

describe("Tree", () => {
  it("expands and selects nodes", async () => {
    const onSelect = vi.fn();
    render(<Tree treeData={treeData} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "펼치기" }));
    await userEvent.click(screen.getByText("하위"));
    expect(onSelect).toHaveBeenCalledWith(["child"], expect.objectContaining({ selected: true }));
  });

  it("checks descendants together", async () => {
    const onCheck = vi.fn();
    render(<Tree checkable defaultExpandAll treeData={treeData} onCheck={onCheck} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "상위 선택" }));
    expect(onCheck).toHaveBeenCalledWith(
      expect.arrayContaining(["parent", "child"]),
      expect.any(Object),
    );
  });
});
