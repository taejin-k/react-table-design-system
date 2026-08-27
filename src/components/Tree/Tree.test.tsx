import { act, createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tree } from "./Tree";

const treeData = [{ key: "parent", title: "상위", children: [{ key: "child", title: "하위" }] }];

describe("Tree", () => {
  it("expands and selects nodes", async () => {
    const onSelect = vi.fn();
    render(<Tree treeData={treeData} onSelect={onSelect} />);
    await userEvent.click(document.querySelector('[data-tree-switcher="parent"]')!);
    await userEvent.click(screen.getByText("하위"));
    expect(onSelect).toHaveBeenCalledWith(["child"], expect.objectContaining({ selected: true }));
  });

  it("checks descendants together", async () => {
    const onCheck = vi.fn();
    render(<Tree checkable defaultExpandAll treeData={treeData} onCheck={onCheck} />);
    await userEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onCheck).toHaveBeenCalledWith(
      expect.arrayContaining(["parent", "child"]),
      expect.any(Object),
    );
  });

  it("applies selection styling to the title and only fills the row with blockNode", () => {
    const { rerender } = render(
      <Tree treeData={treeData} defaultExpandedKeys={["parent"]} defaultSelectedKeys={["child"]} />,
    );
    const title = screen.getByText("하위");
    expect(title).toHaveClass("bg-[#e6f4ff]");
    expect(title.parentElement).not.toHaveClass("bg-[#e6f4ff]");

    rerender(
      <Tree
        blockNode
        treeData={treeData}
        defaultExpandedKeys={["parent"]}
        defaultSelectedKeys={["child"]}
      />,
    );
    expect(screen.getByText("하위")).toHaveClass("flex-1");
  });

  it("reports a node drop with its descendants and inside position", () => {
    const onDrop = vi.fn();
    render(
      <Tree
        draggable
        defaultExpandAll
        treeData={[
          { key: "source", title: "이동", children: [{ key: "child", title: "하위" }] },
          { key: "target", title: "대상" },
        ]}
        onDrop={onDrop}
      />,
    );
    const source = document.querySelector<HTMLElement>('[data-tree-node="source"]')!;
    const target = document.querySelector<HTMLElement>('[data-tree-node="target"]')!;
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 100,
      top: 100,
      left: 0,
      right: 200,
      bottom: 124,
      width: 200,
      height: 24,
      toJSON: () => ({}),
    });
    const dataTransfer = { dropEffect: "none", effectAllowed: "none", setData: vi.fn() };

    fireEvent.dragStart(source, { dataTransfer });
    const dragOverEvent = createEvent.dragOver(target, { dataTransfer });
    Object.defineProperty(dragOverEvent, "clientY", { value: 112 });
    fireEvent(target, dragOverEvent);
    const dropEvent = createEvent.drop(target, { dataTransfer });
    Object.defineProperty(dropEvent, "clientY", { value: 112 });
    fireEvent(target, dropEvent);

    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        node: expect.objectContaining({ key: "target" }),
        dragNode: expect.objectContaining({ key: "source" }),
        dragNodesKeys: ["source", "child"],
        dropPosition: 0,
        dropToGap: false,
      }),
    );
  });

  it("shows a gap indicator and reports a top drop", () => {
    const onDrop = vi.fn();
    render(
      <Tree
        draggable
        treeData={[
          { key: "source", title: "이동" },
          { key: "target", title: "대상" },
        ]}
        onDrop={onDrop}
      />,
    );
    const source = document.querySelector<HTMLElement>('[data-tree-node="source"]')!;
    const target = document.querySelector<HTMLElement>('[data-tree-node="target"]')!;
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 100,
      top: 100,
      left: 0,
      right: 200,
      bottom: 124,
      width: 200,
      height: 24,
      toJSON: () => ({}),
    });
    const dataTransfer = { dropEffect: "none", effectAllowed: "none", setData: vi.fn() };

    fireEvent.dragStart(source, { dataTransfer });
    const dragOverEvent = createEvent.dragOver(target, { dataTransfer });
    Object.defineProperty(dragOverEvent, "clientY", { value: 101 });
    fireEvent(target, dragOverEvent);
    expect(document.querySelector('[data-tree-drop-indicator="top"]')).toBeInTheDocument();
    const dropEvent = createEvent.drop(target, { dataTransfer });
    Object.defineProperty(dropEvent, "clientY", { value: 101 });
    fireEvent(target, dropEvent);

    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({ dropPosition: -1, dropToGap: true }),
    );
  });

  it("supports node-specific dragging without a handle", () => {
    render(
      <Tree
        draggable={{ icon: false, nodeDraggable: (node) => node.key === "child" }}
        defaultExpandAll
        treeData={treeData}
      />,
    );

    expect(document.querySelector('[data-tree-node="parent"]')).toHaveAttribute(
      "draggable",
      "false",
    );
    expect(document.querySelector('[data-tree-node="child"]')).toHaveAttribute("draggable", "true");
    expect(document.querySelector("[data-tree-drag-handle]")).not.toBeInTheDocument();
  });

  it("blocks disallowed drops and dropping a parent into its descendant", () => {
    const onDrop = vi.fn();
    const allowDrop = vi.fn(() => false);
    const { rerender } = render(
      <Tree
        draggable
        defaultExpandAll
        treeData={[
          { key: "source", title: "이동" },
          { key: "target", title: "대상" },
        ]}
        allowDrop={allowDrop}
        onDrop={onDrop}
      />,
    );
    let source = document.querySelector<HTMLElement>('[data-tree-node="source"]')!;
    let target = document.querySelector<HTMLElement>('[data-tree-node="target"]')!;
    const dataTransfer = { dropEffect: "none", effectAllowed: "none", setData: vi.fn() };

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    expect(allowDrop).toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();

    rerender(<Tree draggable defaultExpandAll treeData={treeData} onDrop={onDrop} />);
    source = document.querySelector<HTMLElement>('[data-tree-node="parent"]')!;
    target = document.querySelector<HTMLElement>('[data-tree-node="child"]')!;
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("expands a collapsed parent after hovering over its inside drop area", () => {
    vi.useFakeTimers();
    const onExpand = vi.fn();
    try {
      render(
        <Tree
          draggable
          treeData={[
            { key: "source", title: "이동" },
            { key: "target", title: "대상", children: [{ key: "child", title: "하위" }] },
          ]}
          onExpand={onExpand}
        />,
      );
      const source = document.querySelector<HTMLElement>('[data-tree-node="source"]')!;
      const target = document.querySelector<HTMLElement>('[data-tree-node="target"]')!;
      vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 100,
        top: 100,
        left: 0,
        right: 200,
        bottom: 124,
        width: 200,
        height: 24,
        toJSON: () => ({}),
      });
      const dataTransfer = { dropEffect: "none", effectAllowed: "none", setData: vi.fn() };

      fireEvent.dragStart(source, { dataTransfer });
      const dragOverEvent = createEvent.dragOver(target, { dataTransfer });
      Object.defineProperty(dragOverEvent, "clientY", { value: 112 });
      fireEvent(target, dragOverEvent);
      expect(target.parentElement?.querySelector(".grid")).toHaveStyle({ gridTemplateRows: "0fr" });

      act(() => vi.advanceTimersByTime(400));

      expect(target.parentElement?.querySelector(".grid")).toHaveStyle({ gridTemplateRows: "1fr" });
      expect(onExpand).toHaveBeenCalledWith(
        ["target"],
        expect.objectContaining({ expanded: true }),
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
