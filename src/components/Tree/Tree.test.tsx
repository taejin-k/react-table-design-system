import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { canDropTreeNode, getTreeDropPosition, Tree } from "./Tree";

const treeData = [{ key: "parent", title: "상위", children: [{ key: "child", title: "하위" }] }];

describe("Tree", () => {
  it("applies className to the outermost element", () => {
    const { container } = render(<Tree className="tree-custom w-full" treeData={treeData} />);

    expect(container.firstElementChild).toHaveAttribute("data-tree-root");
    expect(container.firstElementChild).toHaveClass("tree-custom", "w-full");
  });

  it("does not create an internal scroll container", () => {
    render(<Tree treeData={treeData} />);

    expect(document.querySelector("[data-tree-root]")).not.toHaveClass("overflow-auto");
  });

  it("expands and selects nodes", async () => {
    const onSelect = vi.fn();
    render(<Tree treeData={treeData} onSelect={onSelect} />);
    await userEvent.click(document.querySelector('[data-tree-switcher="parent"]')!);
    await userEvent.click(screen.getByText("하위"));
    expect(onSelect).toHaveBeenCalledWith(["child"]);
  });

  it("keeps a node collapsed when async loading fails and allows retrying", async () => {
    const loadData = vi
      .fn()
      .mockRejectedValueOnce(new Error("load failed"))
      .mockResolvedValueOnce(undefined);
    const onExpand = vi.fn();
    const { container } = render(
      <Tree
        treeData={[{ key: "async", title: "비동기", isLeaf: false }]}
        loadData={loadData}
        onExpand={onExpand}
      />,
    );
    const switcher = container.querySelector('[data-tree-switcher="async"]')!;

    await userEvent.click(switcher);
    await waitFor(() => expect(loadData).toHaveBeenCalledTimes(1));
    expect(onExpand).not.toHaveBeenCalled();
    expect(container.querySelector('[data-tree-children="async"]')).toHaveStyle({
      gridTemplateRows: "0fr",
    });

    await userEvent.click(switcher);
    await waitFor(() => expect(loadData).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(onExpand).toHaveBeenCalledWith(["async"]));
  });

  it("keeps row spacing stable while a parent is collapsed", async () => {
    render(<Tree defaultExpandedKeys={["parent"]} treeData={treeData} />);
    const children = document.querySelector('[data-tree-children="parent"]')!;
    const parentItem = document.querySelector('[data-tree-node="parent"]')!.closest("li");
    const rootList = document.querySelector("[data-tree-root] > ul");

    expect(children.firstElementChild).toHaveClass("pt-1");
    expect(rootList).toHaveClass("flex", "flex-col", "gap-1");
    expect(parentItem).not.toHaveClass("pb-0", "pb-1", "transition-[padding-bottom]");
    expect(children.querySelector("ul")).not.toHaveClass("overflow-hidden");
    await userEvent.click(document.querySelector('[data-tree-switcher="parent"]')!);
    expect(children.firstElementChild).toHaveClass(
      "pt-0",
      "transition-[padding-top]",
      "duration-200",
    );
    expect(children.firstElementChild).not.toHaveClass("pt-1");
    expect(children).toHaveStyle({ gridTemplateRows: "0fr" });
    expect(parentItem).not.toHaveClass("pb-0", "pb-1", "transition-[padding-bottom]");
  });

  it("does not add a spacing transition when a drop target gains its first child", () => {
    const { rerender } = render(
      <Tree defaultExpandAll treeData={[{ key: "empty", title: "빈 노드" }]} />,
    );

    rerender(
      <Tree
        defaultExpandAll
        treeData={[
          { key: "empty", title: "빈 노드", children: [{ key: "child", title: "새 자식" }] },
        ]}
      />,
    );

    const parentItem = document.querySelector('[data-tree-node="empty"]')!.closest("li");
    expect(parentItem).not.toHaveClass("transition-[padding-bottom]", "pb-0", "pb-1");
    expect(document.querySelector('[data-tree-children="empty"]')).toHaveStyle({
      gridTemplateRows: "1fr",
    });
  });

  it("checks descendants together", async () => {
    const onCheck = vi.fn();
    render(<Tree checkable defaultExpandAll treeData={treeData} onCheck={onCheck} />);
    expect(screen.getAllByRole("checkbox")[0].parentElement?.parentElement).toHaveClass("mr-1");
    await userEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onCheck).toHaveBeenCalledWith(expect.arrayContaining(["parent", "child"]));
  });

  it("always reports checked keys as an array in strict mode", async () => {
    const onCheck = vi.fn();
    render(<Tree checkable checkStrictly defaultExpandAll treeData={treeData} onCheck={onCheck} />);

    await userEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(onCheck).toHaveBeenCalledWith(["child"]);
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

  it("removes selection interaction styles when selection is unavailable", () => {
    const { rerender } = render(
      <Tree
        selectable={false}
        defaultSelectedKeys={["item"]}
        treeData={[{ key: "item", title: "선택 불가" }]}
      />,
    );
    const selectionContent = document.querySelector('[data-tree-selection-content="item"]');

    expect(selectionContent).not.toHaveClass("cursor-pointer");
    expect(selectionContent).not.toHaveClass("hover:bg-[#f5f5f5]");
    expect(selectionContent).toHaveClass("bg-[#e6f4ff]");

    rerender(
      <Tree
        defaultSelectedKeys={["item"]}
        treeData={[{ key: "item", title: "선택 불가", selectable: false }]}
      />,
    );
    const nodeSelectionContent = document.querySelector('[data-tree-selection-content="item"]');
    expect(nodeSelectionContent).not.toHaveClass("cursor-pointer");
    expect(nodeSelectionContent).not.toHaveClass("hover:bg-[#f5f5f5]");
  });

  it("hides selection styling while the tree is disabled", () => {
    const { rerender } = render(
      <Tree defaultSelectedKeys={["item"]} treeData={[{ key: "item", title: "선택 항목" }]} />,
    );
    const selectionContent = document.querySelector('[data-tree-selection-content="item"]');

    expect(selectionContent).toHaveClass("bg-[#e6f4ff]", "text-[#0062df]");

    rerender(
      <Tree
        disabled
        defaultSelectedKeys={["item"]}
        treeData={[{ key: "item", title: "선택 항목" }]}
      />,
    );
    const disabledSelectionContent = document.querySelector('[data-tree-selection-content="item"]');
    expect(disabledSelectionContent).not.toHaveClass("bg-[#e6f4ff]");
    expect(disabledSelectionContent).not.toHaveClass("text-[#0062df]");
    expect(disabledSelectionContent).toHaveClass("cursor-not-allowed");
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

  it("ignores empty row space when calculating horizontal drag depth", () => {
    render(
      <Tree
        draggable
        treeData={[
          { key: "source", title: "보관함" },
          { key: "target", title: "프로젝트" },
        ]}
      />,
    );
    const source = document.querySelector<HTMLElement>('[data-tree-node="source"]')!;
    const title = source.querySelector<HTMLElement>('[data-tree-title="source"]')!;
    const target = document.querySelector<HTMLElement>('[data-tree-node="target"]')!;
    const rect = (top: number, width = 600) => ({
      x: 0,
      y: top,
      top,
      left: 0,
      right: width,
      bottom: top + 24,
      width,
      height: 24,
      toJSON: () => ({}),
    });
    vi.spyOn(source, "getBoundingClientRect").mockReturnValue(rect(50));
    vi.spyOn(title, "getBoundingClientRect").mockReturnValue({
      ...rect(50, 120),
      x: 20,
      left: 20,
      width: 100,
    });
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue(rect(100));
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      setData: vi.fn(),
    };
    const dispatch = (type: "dragstart" | "dragover", clientX: number) => {
      const event =
        type === "dragstart"
          ? createEvent.dragStart(source, { dataTransfer })
          : createEvent.dragOver(target, { dataTransfer });
      Object.defineProperty(event, "clientX", { value: clientX });
      Object.defineProperty(event, "clientY", { value: type === "dragstart" ? 62 : 112 });
      fireEvent(type === "dragstart" ? source : target, event);
    };

    dispatch("dragstart", 500);
    dispatch("dragover", 120);
    expect(target.querySelector("[data-tree-drop-indicator]")).toHaveStyle({ left: "0px" });

    dispatch("dragover", 144);
    expect(target.querySelector("[data-tree-drop-indicator]")).toHaveStyle({ left: "24px" });
  });

  it("uses the dragged row center instead of the pointer row for vertical placement", () => {
    render(
      <Tree
        draggable
        treeData={[
          { key: "source", title: "이동" },
          { key: "upper", title: "위" },
          { key: "middle", title: "중간" },
          { key: "lower", title: "아래" },
        ]}
      />,
    );
    const source = document.querySelector<HTMLElement>('[data-tree-node="source"]')!;
    const upper = document.querySelector<HTMLElement>('[data-tree-node="upper"]')!;
    const middle = document.querySelector<HTMLElement>('[data-tree-node="middle"]')!;
    const lower = document.querySelector<HTMLElement>('[data-tree-node="lower"]')!;
    const rect = (top: number, height = 24) => ({
      x: 0,
      y: top,
      top,
      left: 0,
      right: 200,
      bottom: top + height,
      width: 200,
      height,
      toJSON: () => ({}),
    });
    vi.spyOn(source, "getBoundingClientRect").mockReturnValue(rect(50, 80));
    vi.spyOn(upper, "getBoundingClientRect").mockReturnValue(rect(150));
    vi.spyOn(middle, "getBoundingClientRect").mockReturnValue(rect(178));
    vi.spyOn(lower, "getBoundingClientRect").mockReturnValue(rect(206));
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      setData: vi.fn(),
    };
    const dispatch = (type: "dragstart" | "dragover", element: HTMLElement, clientY: number) => {
      const event =
        type === "dragstart"
          ? createEvent.dragStart(element, { dataTransfer })
          : createEvent.dragOver(element, { dataTransfer });
      Object.defineProperty(event, "clientX", { value: 100 });
      Object.defineProperty(event, "clientY", { value: clientY });
      fireEvent(element, event);
    };

    dispatch("dragstart", source, 129);
    dispatch("dragover", lower, 209);

    expect(middle.querySelector('[data-tree-drop-indicator="top"]')).toBeInTheDocument();
    expect(lower.querySelector("[data-tree-drop-indicator]")).not.toBeInTheDocument();
  });

  it("shows the original insertion boundary above the dragged row when it returns", () => {
    render(
      <Tree
        draggable
        defaultExpandAll
        treeData={[
          {
            key: "project",
            title: "프로젝트",
            children: [
              { key: "design", title: "디자인" },
              { key: "development", title: "개발" },
            ],
          },
          { key: "documents", title: "문서" },
        ]}
      />,
    );
    const project = document.querySelector<HTMLElement>('[data-tree-node="project"]')!;
    const design = document.querySelector<HTMLElement>('[data-tree-node="design"]')!;
    const development = document.querySelector<HTMLElement>('[data-tree-node="development"]')!;
    const documents = document.querySelector<HTMLElement>('[data-tree-node="documents"]')!;
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
    vi.spyOn(project, "getBoundingClientRect").mockReturnValue(rect(72));
    vi.spyOn(design, "getBoundingClientRect").mockReturnValue(rect(100));
    vi.spyOn(development, "getBoundingClientRect").mockReturnValue(rect(128));
    vi.spyOn(documents, "getBoundingClientRect").mockReturnValue(rect(156));
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      setData: vi.fn(),
    };
    const dispatch = (type: "dragstart" | "dragover", element: HTMLElement, clientY: number) => {
      const event =
        type === "dragstart"
          ? createEvent.dragStart(element, { dataTransfer })
          : createEvent.dragOver(element, { dataTransfer });
      Object.defineProperty(event, "clientX", { value: 100 });
      Object.defineProperty(event, "clientY", { value: clientY });
      fireEvent(element, event);
    };

    dispatch("dragstart", development, 140);
    dispatch("dragover", project, 88);
    expect(project.querySelector('[data-tree-drop-indicator="bottom"]')).toHaveStyle({
      left: "24px",
    });
    expect(design.querySelector("[data-tree-drop-indicator]")).not.toBeInTheDocument();

    dispatch("dragover", documents, 180);
    dispatch("dragover", development, 140);

    expect(development.querySelector('[data-tree-drop-indicator="top"]')).toHaveStyle({
      left: "24px",
      top: "-3px",
    });
    expect(documents.querySelector("[data-tree-drop-indicator]")).not.toBeInTheDocument();
  });

  it("anchors an outdented child indicator outside its clipped children container", () => {
    render(
      <Tree
        draggable
        defaultExpandAll
        treeData={[
          {
            key: "project",
            title: "프로젝트",
            children: [
              {
                key: "design",
                title: "디자인",
                children: [{ key: "development", title: "개발" }],
              },
            ],
          },
          { key: "documents", title: "문서" },
        ]}
      />,
    );
    const project = document.querySelector<HTMLElement>('[data-tree-node="project"]')!;
    const design = document.querySelector<HTMLElement>('[data-tree-node="design"]')!;
    const development = document.querySelector<HTMLElement>('[data-tree-node="development"]')!;
    const documents = document.querySelector<HTMLElement>('[data-tree-node="documents"]')!;
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
    vi.spyOn(project, "getBoundingClientRect").mockReturnValue(rect(72));
    vi.spyOn(design, "getBoundingClientRect").mockReturnValue(rect(100));
    vi.spyOn(development, "getBoundingClientRect").mockReturnValue(rect(128));
    vi.spyOn(documents, "getBoundingClientRect").mockReturnValue(rect(156));
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      setData: vi.fn(),
    };
    const dispatch = (
      type: "dragstart" | "dragover",
      element: HTMLElement,
      clientX: number,
      clientY: number,
    ) => {
      const event =
        type === "dragstart"
          ? createEvent.dragStart(element, { dataTransfer })
          : createEvent.dragOver(element, { dataTransfer });
      Object.defineProperty(event, "clientX", { value: clientX });
      Object.defineProperty(event, "clientY", { value: clientY });
      fireEvent(element, event);
    };

    dispatch("dragstart", development, 100, 140);
    expect(document.querySelector('[data-tree-children="design"]')?.firstElementChild).toHaveClass(
      "overflow-visible",
    );
    dispatch("dragover", development, 76, 140);

    expect(documents.querySelector('[data-tree-drop-indicator="top"]')).toHaveStyle({
      left: "24px",
      top: "-3px",
    });
    expect(development.querySelector("[data-tree-drop-indicator]")).not.toBeInTheDocument();

    fireEvent.dragEnd(development, { dataTransfer });
    expect(
      document.querySelector('[data-tree-children="design"]')?.firstElementChild,
    ).not.toHaveClass("overflow-visible");
  });

  it("uses vertical movement for order and horizontal movement for depth", () => {
    const onDrop = vi.fn();
    const onTreeDataChange = vi.fn();
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
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
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
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
    expect(onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({ dragNode: expect.objectContaining({ key: "source" }) }),
    );

    dispatchDragEvent("dragover", development, 40, 151);
    const childBoundaryIndicator = document.querySelector<HTMLElement>(
      '[data-tree-drop-indicator="top"]',
    );
    expect(childBoundaryIndicator).toHaveStyle({ left: "24px", top: "-3px" });
    expect(childBoundaryIndicator?.firstElementChild).toHaveClass(
      "size-1.5",
      "rounded-full",
      "bg-[#0062df]",
      "left-0",
    );
    expect(childBoundaryIndicator?.firstElementChild).not.toHaveClass("-left-[3px]");

    dispatchDragEvent("dragover", development, 100, 170);
    expect(archive.querySelector('[data-tree-drop-indicator="top"]')).toHaveStyle({
      left: "0px",
      top: "-3px",
    });
    expect(development.querySelector("[data-tree-drop-indicator]")).not.toBeInTheDocument();
    fireEvent.dragLeave(archive, { relatedTarget: development });
    expect(archive.querySelector('[data-tree-drop-indicator="top"]')).toBeInTheDocument();

    const archiveGap = archive.querySelector<HTMLElement>('[data-tree-drop-hit-area="archive"]')!;
    dispatchDragEvent("dragover", archiveGap, 100, 226);
    expect(document.querySelector('[data-tree-drop-indicator="bottom"]')).toHaveStyle({
      left: "0px",
    });
    dispatchDragEvent("drop", archiveGap, 100, 226);
    expect(onDrop).toHaveBeenLastCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({ type: "drop" }),
        dragNode: expect.objectContaining({ key: "source" }),
        treeData: [
          expect.objectContaining({ key: "project" }),
          expect.objectContaining({ key: "archive" }),
          expect.objectContaining({ key: "source" }),
        ],
        parentKey: null,
        index: 2,
      }),
    );
    expect(onTreeDataChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        treeData: [
          expect.objectContaining({ key: "project" }),
          expect.objectContaining({ key: "archive" }),
          expect.objectContaining({ key: "source" }),
        ],
        parentKey: null,
        index: 2,
      }),
    );

    fireEvent.dragEnd(source, { dataTransfer });
    expect(onDragEnd).toHaveBeenCalledWith(
      expect.objectContaining({ dragNode: expect.objectContaining({ key: "source" }) }),
    );
    dispatchDragEvent("dragstart", source, 100, 62);
    const nextArchiveGap = archive.querySelector<HTMLElement>(
      '[data-tree-drop-hit-area="archive"]',
    )!;
    dispatchDragEvent("dragover", nextArchiveGap, 124, 226);
    expect(archive.querySelector('[data-tree-drop-indicator="bottom"]')).toHaveStyle({
      left: "24px",
    });
    expect(source.querySelector("[data-tree-drop-indicator]")).not.toBeInTheDocument();
    dispatchDragEvent("drop", nextArchiveGap, 124, 226);
    expect(onDrop).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dragNode: expect.objectContaining({ key: "source" }),
        treeData: [
          expect.objectContaining({ key: "project" }),
          expect.objectContaining({
            key: "archive",
            children: [expect.objectContaining({ key: "source" })],
          }),
        ],
        parentKey: "archive",
        index: 0,
      }),
    );
    expect(onTreeDataChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        treeData: [
          expect.objectContaining({ key: "project" }),
          expect.objectContaining({
            key: "archive",
            children: [expect.objectContaining({ key: "source" })],
          }),
        ],
        parentKey: "archive",
        index: 0,
      }),
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
      <Tree draggable={(node) => node.key === "child"} defaultExpandAll treeData={treeData} />,
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
    expect(allowDrop).toHaveBeenCalledWith(target);
    expect(
      canDropTreeNode({ key: "parent", children: [{ key: "child" }] }, { key: "child" }, 0),
    ).toBe(false);

    const releases = { key: "releases", title: "릴리스" };
    const settings = { key: "settings", title: "설정" };
    expect(
      canDropTreeNode(source, settings, -1, {
        allowDrop: (node) => node.key !== "releases",
        relatedDropNodes: [releases, settings],
      }),
    ).toBe(false);
  });

  it("controls hierarchy changes with allowChildren", () => {
    const design = { key: "design", title: "디자인" };
    const development = { key: "development", title: "개발" };
    const project = {
      key: "project",
      title: "프로젝트",
      children: [design, development],
    };
    const settings = { key: "settings", title: "설정" };
    const leaf = { key: "leaf", title: "파일", isLeaf: true };
    const data = [project, settings, leaf];

    expect(canDropTreeNode(settings, design, -1, { treeData: data, allowChildren: false })).toBe(
      false,
    );
    expect(canDropTreeNode(design, development, 1, { treeData: data, allowChildren: false })).toBe(
      true,
    );
    expect(canDropTreeNode(design, settings, 1, { treeData: data, allowChildren: false })).toBe(
      false,
    );
    expect(
      canDropTreeNode(settings, project, 0, {
        treeData: data,
        allowChildren: (node) => node.key === "project",
      }),
    ).toBe(true);
    expect(
      canDropTreeNode(settings, leaf, 0, {
        treeData: data,
        allowChildren: () => true,
      }),
    ).toBe(false);
  });
});
