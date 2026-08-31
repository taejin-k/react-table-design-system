import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { canDropTreeNode, getTreeDropPosition, Tree } from "./Tree";

const treeData = [{ key: "parent", title: "상위", children: [{ key: "child", title: "하위" }] }];

describe("Tree", () => {
  it("expands and selects nodes", async () => {
    const onSelect = vi.fn();
    render(<Tree treeData={treeData} onSelect={onSelect} />);
    await userEvent.click(document.querySelector('[data-tree-switcher="parent"]')!);
    await userEvent.click(screen.getByText("하위"));
    expect(onSelect).toHaveBeenCalledWith(["child"], expect.objectContaining({ selected: true }));
  });

  it("does not leave child spacing behind when a parent is collapsed", async () => {
    render(<Tree defaultExpandedKeys={["parent"]} treeData={treeData} />);
    const children = document.querySelector('[data-tree-children="parent"]')!;
    const parentItem = document.querySelector('[data-tree-node="parent"]')!.closest("li");

    expect(children.firstElementChild).toHaveClass("pt-1");
    expect(parentItem).toHaveClass("pb-0");
    expect(children.querySelector("ul")).not.toHaveClass("overflow-hidden");
    await userEvent.click(document.querySelector('[data-tree-switcher="parent"]')!);
    expect(children.firstElementChild).toHaveClass(
      "pt-0",
      "transition-[padding-top]",
      "duration-200",
    );
    expect(children.firstElementChild).not.toHaveClass("pt-1");
    expect(children).toHaveStyle({ gridTemplateRows: "0fr" });
    expect(parentItem).toHaveClass("pb-1");
    expect(parentItem).toHaveClass("transition-[padding-bottom]", "duration-200");
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

  it("always reports checked keys as an array in strict mode", async () => {
    const onCheck = vi.fn();
    render(<Tree checkable checkStrictly defaultExpandAll treeData={treeData} onCheck={onCheck} />);

    await userEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(onCheck).toHaveBeenCalledWith(["child"], expect.any(Object));
  });

  it("applies selection styling to the icon and title content", () => {
    const { rerender } = render(
      <Tree treeData={treeData} defaultExpandedKeys={["parent"]} defaultSelectedKeys={["child"]} />,
    );
    const title = screen.getByText("하위");
    expect(title.parentElement).toHaveClass("bg-[#e6f4ff]");
    expect(title).not.toHaveClass("bg-[#e6f4ff]");
    expect(title).toHaveClass("relative", "-top-px");

    rerender(
      <Tree
        fullWidth
        treeData={treeData}
        defaultExpandedKeys={["parent"]}
        defaultSelectedKeys={["child"]}
      />,
    );
    expect(document.querySelector('[data-tree-selection-content="child"]')).toHaveClass("flex-1");

    rerender(
      <Tree
        draggable
        fullWidth
        treeData={treeData}
        defaultExpandedKeys={["parent"]}
        defaultSelectedKeys={["child"]}
      />,
    );
    expect(document.querySelector('[data-tree-selection-content="child"]')).toHaveClass("flex-1");
  });

  it("preserves newlines in node titles", () => {
    render(<Tree treeData={[{ key: "multiline", title: "첫 줄\n둘째 줄" }]} />);

    expect(screen.getByText(/첫 줄\s+둘째 줄/)).toHaveClass("whitespace-pre-line");
  });

  it("automatically renders a node icon with a small label gap", () => {
    render(
      <Tree
        defaultSelectedKeys={["icon-node"]}
        treeData={[
          { key: "icon-node", title: "아이콘 항목", icon: <span data-testid="node-icon" /> },
        ]}
      />,
    );

    const icon = document.querySelector('[data-tree-icon="icon-node"]');
    const selectionContent = document.querySelector('[data-tree-selection-content="icon-node"]');
    expect(icon).toHaveClass("w-4");
    expect(icon).not.toHaveClass("mr-1");
    expect(selectionContent).toHaveClass("bg-[#e6f4ff]");
    expect(selectionContent).toContainElement(icon as HTMLElement);
  });

  it("uses simple drop zones based on the target node type", () => {
    const rect = { top: 100, height: 100 };

    expect(getTreeDropPosition(110, rect, false, false)).toBe(-1);
    expect(getTreeDropPosition(190, rect, false, false)).toBe(1);
    expect(getTreeDropPosition(110, rect, true, false)).toBe(-1);
    expect(getTreeDropPosition(150, rect, true, false)).toBe(0);
    expect(getTreeDropPosition(190, rect, true, false)).toBe(1);
    expect(getTreeDropPosition(110, rect, true, true)).toBe(-1);
    expect(getTreeDropPosition(150, rect, true, true)).toBe(0);
    expect(getTreeDropPosition(190, rect, true, true)).toBe(0);
  });

  it("uses native whole-node dragging without handles or overlays", () => {
    render(<Tree draggable treeData={[{ key: "source", title: "이동" }]} />);

    const source = document.querySelector('[data-tree-node="source"]');
    expect(source).toHaveAttribute("data-tree-draggable", "true");
    expect(source).toHaveAttribute("draggable", "true");
    expect(document.querySelector("[data-tree-drag-handle]")).not.toBeInTheDocument();
    expect(document.querySelector("[data-tree-drag-overlay]")).not.toBeInTheDocument();
    expect(source).toHaveClass("cursor-grab", "select-none", "w-full");
  });

  it("uses vertical movement for order and horizontal movement for depth", () => {
    const onDrop = vi.fn();
    const onTreeDataChange = vi.fn();
    render(
      <Tree
        draggable
        defaultExpandedKeys={["project"]}
        defaultTreeData={[
          { key: "source", title: "이동" },
          {
            key: "project",
            title: "프로젝트",
            children: [
              { key: "design", title: "디자인" },
              { key: "development", title: "개발" },
            ],
          },
          { key: "archive", title: "보관함" },
        ]}
        onDrop={onDrop}
        onTreeDataChange={onTreeDataChange}
      />,
    );
    const source = document.querySelector<HTMLElement>('[data-tree-node="source"]')!;
    const development = document.querySelector<HTMLElement>('[data-tree-node="development"]')!;
    const archive = document.querySelector<HTMLElement>('[data-tree-node="archive"]')!;
    const rect = (top: number) => ({
      x: 0,
      y: top,
      top,
      left: 0,
      right: 200,
      bottom: top + 24,
      width: 200,
      height: 24,
      toJSON: () => ({}),
    });
    vi.spyOn(source, "getBoundingClientRect").mockReturnValue(rect(50));
    vi.spyOn(development, "getBoundingClientRect").mockReturnValue(rect(150));
    vi.spyOn(archive, "getBoundingClientRect").mockReturnValue(rect(200));
    const setDragImage = vi.fn((dragImage: HTMLElement) => {
      expect(dragImage).toHaveAttribute("data-tree-drag-preview", "true");
      expect(dragImage).toHaveStyle({ opacity: "0.35" });
      expect(dragImage).toHaveStyle({ width: "max-content", maxWidth: "none" });
      expect(dragImage.querySelector('[data-tree-title="source"]')).toHaveStyle({
        whiteSpace: "pre",
      });
    });
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      setData: vi.fn(),
      setDragImage,
    };
    const dispatchDragEvent = (
      type: "dragstart" | "dragover" | "drop",
      element: HTMLElement,
      clientX: number,
      clientY: number,
    ) => {
      const event =
        type === "dragstart"
          ? createEvent.dragStart(element, { dataTransfer })
          : type === "dragover"
            ? createEvent.dragOver(element, { dataTransfer })
            : createEvent.drop(element, { dataTransfer });
      Object.defineProperty(event, "clientX", { value: clientX });
      Object.defineProperty(event, "clientY", { value: clientY });
      fireEvent(element, event);
    };

    dispatchDragEvent("dragstart", source, 100, 62);
    expect(source).not.toHaveClass("opacity-5");
    expect(setDragImage).toHaveBeenCalledOnce();

    dispatchDragEvent("dragover", development, 40, 151);
    const childBoundaryIndicator = document.querySelector<HTMLElement>(
      '[data-tree-drop-indicator="top"]',
    );
    expect(childBoundaryIndicator).toHaveStyle({ left: "24px", top: "-3px" });

    const archiveGap = archive.querySelector<HTMLElement>('[data-tree-drop-hit-area="archive"]')!;
    dispatchDragEvent("dragover", archiveGap, 100, 226);
    expect(document.querySelector('[data-tree-drop-indicator="bottom"]')).toHaveStyle({
      left: "0px",
    });
    dispatchDragEvent("drop", archiveGap, 100, 226);
    expect(onDrop).toHaveBeenLastCalledWith(
      expect.objectContaining({
        node: expect.objectContaining({ key: "archive" }),
        dropPosition: 1,
        dropToGap: true,
      }),
    );
    expect(onTreeDataChange).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({ key: "project" }),
        expect.objectContaining({ key: "archive" }),
        expect.objectContaining({ key: "source" }),
      ],
      expect.objectContaining({ dropPosition: 1, dropToGap: true }),
    );

    fireEvent.dragEnd(source, { dataTransfer });
    dispatchDragEvent("dragstart", source, 100, 62);
    const nextArchiveGap = archive.querySelector<HTMLElement>(
      '[data-tree-drop-hit-area="archive"]',
    )!;
    dispatchDragEvent("dragover", nextArchiveGap, 124, 226);
    expect(document.querySelector('[data-tree-drop-indicator="bottom"]')).toHaveStyle({
      left: "24px",
    });
    dispatchDragEvent("drop", nextArchiveGap, 124, 226);
    expect(onDrop).toHaveBeenLastCalledWith(
      expect.objectContaining({
        node: expect.objectContaining({ key: "archive" }),
        dropPosition: 0,
        dropToGap: false,
      }),
    );
    expect(onTreeDataChange).toHaveBeenLastCalledWith(
      [
        expect.objectContaining({ key: "project" }),
        expect.objectContaining({
          key: "archive",
          children: [expect.objectContaining({ key: "source" })],
        }),
      ],
      expect.objectContaining({ dropPosition: 0, dropToGap: false }),
    );
  });

  it("allows dropping inside an empty node unless it is explicitly a leaf", () => {
    render(
      <Tree
        draggable
        treeData={[
          { key: "source", title: "이동" },
          { key: "empty", title: "빈 노드" },
          { key: "leaf", title: "파일", isLeaf: true },
        ]}
      />,
    );
    expect(document.querySelector('[data-tree-node="empty"]')).toHaveAttribute(
      "data-tree-can-drop-inside",
      "true",
    );
    expect(document.querySelector('[data-tree-node="leaf"]')).not.toHaveAttribute(
      "data-tree-can-drop-inside",
    );
  });

  it("supports node-specific dragging", () => {
    render(
      <Tree
        draggable={{ nodeDraggable: (node) => node.key === "child" }}
        defaultExpandAll
        treeData={treeData}
      />,
    );

    expect(document.querySelector('[data-tree-node="parent"]')).not.toHaveAttribute(
      "data-tree-draggable",
    );
    expect(document.querySelector('[data-tree-node="child"]')).toHaveAttribute(
      "data-tree-draggable",
      "true",
    );
    expect(document.querySelector('[data-tree-node="parent"]')).toHaveAttribute(
      "draggable",
      "false",
    );
    expect(document.querySelector('[data-tree-node="child"]')).toHaveAttribute("draggable", "true");
  });

  it("blocks disallowed drops and dropping a parent into its descendant", () => {
    const allowDrop = vi.fn(() => false);
    const source = { key: "source", title: "이동" };
    const target = { key: "target", title: "대상" };
    expect(canDropTreeNode(source, target, 0, { allowDrop })).toBe(false);
    expect(allowDrop).toHaveBeenCalled();
    expect(
      canDropTreeNode({ key: "parent", children: [{ key: "child" }] }, { key: "child" }, 0),
    ).toBe(false);
  });
});
