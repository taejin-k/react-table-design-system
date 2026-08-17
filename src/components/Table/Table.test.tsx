import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Table } from "./Table";
import type { ColumnsType } from "./Table.types";

type Row = { key: string; name: string; team: string };
const data: Row[] = [{ key: "1", name: "김민준", team: "Design" }];
const rows: Row[] = [
  { key: "1", name: "김민준", team: "Design" },
  { key: "2", name: "이서연", team: "Platform" },
  { key: "3", name: "박지호", team: "Design" },
];

afterEach(() => vi.unstubAllGlobals());

describe("Table regressions", () => {
  it("데이터가 없으면 기본 일러스트레이션과 안내 문구를 표시한다", () => {
    const { container } = render(
      <Table columns={[{ title: "이름", dataIndex: "name" }]} dataSource={[]} pagination={false} />,
    );

    expect(screen.getByText("데이터가 없어요")).toBeInTheDocument();
    const illustration = container.querySelector('svg[viewBox="0 0 128 128"]');
    expect(illustration).toBeInTheDocument();
    expect(illustration?.parentElement).toHaveClass("size-24");
    expect(container.querySelector("tbody td")).toHaveClass("border-b", "border-[#f0f0f0]");
  });

  it("bordered 빈 상태에서는 외곽 하단선만 표시한다", () => {
    const { container } = render(
      <Table
        bordered
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={[]}
        pagination={false}
      />,
    );

    expect(container.querySelector("tbody td")).not.toHaveClass("border-b");
    expect(container.querySelector(".rounded-lg.bg-white")).toHaveClass(
      "border",
      "border-[#f0f0f0]",
    );
  });

  it("uses fixed table layout by default", () => {
    const { container, rerender } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
      />,
    );

    expect(container.querySelector("table")).toHaveStyle({ tableLayout: "fixed" });

    rerender(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
        tableLayout="auto"
      />,
    );

    expect(container.querySelector("table")).toHaveStyle({ tableLayout: "auto" });
  });

  it("keeps the configured selection column width fixed", () => {
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
        rowSelection={{ type: "checkbox", columnWidth: 80 }}
      />,
    );

    const expectedWidth = { width: "80px", minWidth: "80px", maxWidth: "80px" };
    const columns = container.querySelectorAll<HTMLTableColElement>("col");
    expect(columns[0]).toHaveStyle(expectedWidth);
    expect(columns[1]).toHaveStyle({ width: "calc(100% - 80px)" });
    expect(container.querySelector("thead th:first-child")).toHaveStyle(expectedWidth);
    expect(container.querySelector("tbody td:first-child")).toHaveStyle(expectedWidth);
  });

  it("keeps explicit widths fixed and gives the remaining width to a minWidth column", () => {
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name", width: 150 },
          { title: "직무", dataIndex: "team", minWidth: 190 },
          { title: "프로젝트", dataIndex: "projects", width: 100 },
        ]}
        dataSource={data}
        pagination={false}
      />,
    );

    const columns = container.querySelectorAll<HTMLTableColElement>("col");
    expect(columns[0]).toHaveStyle({ width: "150px" });
    expect(columns[1]).toHaveStyle({ width: "calc(100% - 250px)" });
    expect(columns[2]).toHaveStyle({ width: "100px" });
    expect(container.querySelector("table")).toHaveStyle({ minWidth: "440px" });
  });

  it("uses minWidth as the lower bound when an explicit numeric width is smaller", () => {
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name", width: 120, minWidth: 160 },
          { title: "직무", dataIndex: "team" },
        ]}
        dataSource={data}
        pagination={false}
      />,
    );

    const columns = container.querySelectorAll<HTMLTableColElement>("col");
    expect(columns[0]).toHaveStyle({ width: "160px" });
    expect(columns[1]).toHaveStyle({ width: "calc(100% - 160px)" });
  });

  it("preserves minWidth in a max-content table with a fixed selection column", () => {
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name", width: 220 },
          { title: "직무", dataIndex: "team", minWidth: 190 },
          { title: "프로젝트", dataIndex: "projects", width: 220 },
        ]}
        dataSource={data}
        pagination={false}
        rowSelection={{ type: "checkbox", fixed: true }}
        scroll={{ x: "max-content" }}
      />,
    );

    const columns = container.querySelectorAll<HTMLTableColElement>("col");
    expect(columns[0]).toHaveStyle({ width: "48px", minWidth: "48px", maxWidth: "48px" });
    expect(columns[1]).toHaveStyle({ width: "220px" });
    expect(columns[2]).toHaveStyle({ width: "190px" });
    expect(columns[3]).toHaveStyle({ width: "220px" });
    expect(container.querySelector("table")).toHaveStyle({ minWidth: "max-content" });
  });

  it("keeps ellipsis content inside the cell when the shared tooltip is enabled", () => {
    const longRole =
      "Global Product Design System, User Experience Research Strategy, and Visual Language";
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name", width: 120 },
          { title: "직무", dataIndex: "team", width: 160, ellipsis: true },
        ]}
        dataSource={[{ key: "1", name: "김민준", team: longRole }]}
        pagination={false}
      />,
    );

    const cell = screen.getByText(longRole).closest("td");
    const tooltipTrigger = screen.getByText(longRole).parentElement;

    expect(cell).toHaveClass("overflow-hidden");
    expect(tooltipTrigger).toHaveClass("block", "w-full", "min-w-0", "overflow-hidden");
    expect(screen.getByText(longRole)).toHaveClass(
      "w-full",
      "overflow-hidden",
      "text-ellipsis",
      "whitespace-nowrap",
    );
    expect(container.querySelector("table")).toHaveStyle({ tableLayout: "fixed" });
  });

  it("renders multiple anonymous column groups without duplicate-key errors", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const columns: ColumnsType<Row> = [
      { title: "사용자", children: [{ title: "이름", dataIndex: "name" }] },
      { title: "소속", children: [{ title: "팀", dataIndex: "team" }] },
    ];

    render(<Table columns={columns} dataSource={data} pagination={false} />);
    expect(screen.getByText("사용자")).toBeInTheDocument();
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("same key");
    consoleError.mockRestore();
  });

  it("sorts rows and reports the sorter state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Table
        columns={[
          {
            title: "이름",
            dataIndex: "name",
            sorter: (left, right) => left.name.localeCompare(right.name, "ko"),
          },
        ]}
        dataSource={[rows[2], rows[0], rows[1]]}
        onChange={onChange}
        pagination={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "이름 정렬" }));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("김민준");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({ order: "ascend" }),
      expect.objectContaining({ action: "sort" }),
    );

    await user.click(screen.getByRole("button", { name: "이름 정렬" }));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("이서연");
  });

  it("shows the next sorter action in the shared tooltip", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[
          {
            title: "이름",
            dataIndex: "name",
            sorter: (left, right) => left.name.localeCompare(right.name, "ko"),
            showSorterTooltip: { target: "sorter-icon" },
          },
        ]}
        dataSource={rows}
        pagination={false}
      />,
    );

    const sorter = screen.getByRole("button", { name: "이름 정렬" });
    await user.hover(sorter);
    expect(await screen.findByText("오름차순 정렬")).toBeInTheDocument();
    await user.unhover(sorter);
    await user.click(sorter);
    await user.hover(sorter);
    expect(await screen.findByText("내림차순 정렬")).toBeInTheDocument();
  });

  it("filters rows after confirming the filter menu", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[
          {
            title: "팀",
            dataIndex: "team",
            filters: [
              { text: "Design", value: "Design" },
              { text: "Platform", value: "Platform" },
            ],
            onFilter: (value, record) => record.team === value,
          },
        ]}
        dataSource={rows}
        pagination={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "팀 필터" }));
    await user.click(screen.getByRole("checkbox", { name: "Design" }));
    await user.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(document.querySelector("[data-table-filter-motion]")).not.toBeInTheDocument();
    });
    expect(screen.getAllByText("Design")).toHaveLength(2);
    expect(screen.queryByText("Platform")).not.toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("closes the filter popup when the page scrolls", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[
          {
            title: "팀",
            dataIndex: "team",
            filters: [{ text: "Design", value: "Design" }],
            onFilter: (value, record) => record.team === value,
          },
        ]}
        dataSource={rows}
        pagination={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "팀 필터" }));
    expect(document.querySelector("[data-table-filter-motion]")).toBeInTheDocument();
    fireEvent.scroll(window);
    await waitFor(() => {
      expect(document.querySelector("[data-table-filter-motion]")).not.toBeInTheDocument();
    });
  });

  it("changes pages and page size without stale rows", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ defaultPageSize: 1, showSizeChanger: true, pageSizeOptions: [1, 2] }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "2 페이지" }));
    expect(screen.getByText("이서연")).toBeInTheDocument();
    expect(screen.queryByText("김민준")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "1 / 페이지" }));
    const pageSizePopup = await waitFor(() => {
      const popup = document.querySelector<HTMLElement>("[data-select-popup]");
      expect(popup).toBeInTheDocument();
      return popup as HTMLElement;
    });
    fireEvent.click(within(pageSizePopup).getAllByRole("button", { hidden: true })[1]);
    expect(screen.getByText("박지호")).toBeInTheDocument();
    expect(screen.queryByText("김민준")).not.toBeInTheDocument();
  });

  it("uses the design-system medium input for quick page jumps", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ defaultPageSize: 1, showQuickJumper: true }}
      />,
    );

    const quickJumper = screen.getByRole("textbox", { name: "이동할 페이지" });
    expect(quickJumper.parentElement).toHaveClass("h-[30px]");

    await user.type(quickJumper, "3{Enter}");
    expect(screen.getByText("박지호")).toBeInTheDocument();
  });

  it("expands and collapses detail rows", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        expandable={{ expandedRowRender: (record) => `${record.name} 상세 정보` }}
        pagination={false}
      />,
    );

    const trigger = screen.getByRole("button", { name: "행 펼치기" });
    await user.click(trigger);
    const detail = screen.getByText("김민준 상세 정보");
    expect(detail).toBeInTheDocument();
    expect(detail.closest("td")).toHaveClass("!bg-[#fafafa]");
    await user.click(screen.getByRole("button", { name: "행 접기" }));
    expect(screen.queryByText("김민준 상세 정보")).not.toBeInTheDocument();
  });

  it("uses the expanded background for child tree rows", () => {
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={[
          {
            key: "parent",
            name: "상위 구성원",
            team: "Design",
            children: [{ key: "child", name: "하위 구성원", team: "Design" }],
          },
        ]}
        expandable={{ defaultExpandAllRows: true }}
        pagination={false}
      />,
    );

    expect(screen.getByText("하위 구성원").closest("tr")).toHaveClass("[&>td]:bg-[#fafafa]");
    expect(screen.getByText("상위 구성원").closest("tr")).not.toHaveClass("[&>td]:bg-[#fafafa]");
  });

  it("uses radio selection as a single controlled choice", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        rowSelection={{ type: "radio", onChange }}
        pagination={false}
      />,
    );

    const radios = screen.getAllByRole("radio");
    await user.click(radios[0]);
    await user.click(radios[1]);
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(
      ["2"],
      [rows[1]],
      expect.objectContaining({ type: "single" }),
    );
  });

  it("calculates the header checkbox state from selectable table rows", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={false}
        rowSelection={{
          defaultSelectedRowKeys: ["1"],
          getCheckboxProps: (record) => ({ disabled: record.key === "3" }),
          onChange,
        }}
      />,
    );

    const selectAll = screen.getByRole("checkbox", { name: "모든 행 선택" });
    expect(selectAll).toBePartiallyChecked();

    await user.click(selectAll);
    expect(selectAll).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(
      ["1", "2"],
      rows.slice(0, 2),
      expect.objectContaining({ type: "all" }),
    );
  });

  it("renders internal row drag handles without custom row components", () => {
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={false}
        rowDrag
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(rows.length);
    expect(container.querySelectorAll("tbody tr[data-row-key]")).toHaveLength(rows.length);
    expect(container.querySelectorAll("tbody td:first-child svg")).toHaveLength(rows.length);
  });

  it("makes columns draggable without custom header components", () => {
    render(
      <Table
        columns={[
          { key: "name", title: "이름", dataIndex: "name" },
          { key: "team", title: "팀", dataIndex: "team" },
        ]}
        dataSource={rows}
        pagination={false}
        columnDrag
      />,
    );

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(2);
    headers.forEach((header) => expect(header).toHaveClass("cursor-grab"));
  });

  it("fixes the header automatically when scroll.y creates a vertical viewport", () => {
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={false}
        scroll={{ y: 120 }}
      />,
    );

    const scrollRegion = screen.getByRole("region", { name: "테이블 스크롤 영역" });
    const headerRegion = container.querySelector("[data-table-header-scroll]");

    expect(headerRegion?.querySelector("thead")).toBeInTheDocument();
    expect(scrollRegion.querySelector("thead")).not.toBeInTheDocument();
    expect(scrollRegion.querySelector("tbody")).toBeInTheDocument();
    expect(scrollRegion).toHaveStyle({ maxHeight: "120px" });
  });

  it("keeps a sticky header in the table flow without reparenting it", () => {
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={false}
        sticky
      />,
    );

    const headerRegion = container.querySelector("[data-table-sticky-header]");
    const scrollRegion = container.querySelector("[data-table-scroll-container]");

    expect(headerRegion).toHaveStyle({
      position: "sticky",
      top: "0px",
      zIndex: "40",
    });
    expect(container.contains(headerRegion)).toBe(true);
    expect(
      document.body.querySelector("[data-table-sticky-header-active]"),
    ).not.toBeInTheDocument();
    expect(headerRegion?.querySelector("thead")).toBeInTheDocument();
    expect(scrollRegion?.querySelector("thead")).not.toBeInTheDocument();
    expect(scrollRegion?.querySelector("tbody")).toBeInTheDocument();
    expect(scrollRegion).not.toHaveStyle({ maxHeight: "400px" });
  });

  it("keeps a separated header aligned with horizontal body scrolling", () => {
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name", width: 200 },
          { title: "팀", dataIndex: "team", width: 200 },
        ]}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 600, y: 120 }}
      />,
    );

    const scrollRegion = screen.getByRole("region", { name: "테이블 스크롤 영역" });
    const headerRegion = container.querySelector<HTMLElement>("[data-table-header-scroll]");

    Object.defineProperty(scrollRegion, "scrollLeft", { configurable: true, value: 80 });
    fireEvent.scroll(scrollRegion);

    expect(headerRegion?.scrollLeft).toBe(80);
  });

  it("renders an arrowless custom horizontal scrollbar and synchronizes its thumb", () => {
    vi.stubGlobal("CSS", { supports: () => true });
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name", width: 300 },
          { title: "팀", dataIndex: "team", width: 300 },
        ]}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 600 }}
      />,
    );

    const scrollRegion = container.querySelector<HTMLElement>("[data-table-scroll-container]");
    expect(scrollRegion).not.toBeNull();
    if (!scrollRegion) return;

    Object.defineProperties(scrollRegion, {
      clientWidth: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 800 },
      scrollLeft: { configurable: true, writable: true, value: 80 },
    });
    fireEvent.scroll(scrollRegion);

    const track = container.querySelector<HTMLElement>("[data-table-horizontal-scrollbar-track]");
    expect(track).toHaveStyle({ width: "400px" });
    expect(container.querySelector("[data-table-horizontal-scrollbar-thumb]")).toHaveStyle({
      width: "200px",
      transform: "translateX(40px)",
    });

    if (!track) return;
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      bottom: 8,
      height: 8,
      left: 0,
      right: 400,
      top: 0,
      width: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    scrollRegion.scrollLeft = 0;
    fireEvent.pointerDown(track, { clientX: 390, pointerId: 1 });
    expect(scrollRegion.scrollLeft).toBe(400);
    expect(container.querySelector("[data-table-horizontal-scrollbar-thumb]")).toHaveStyle({
      transform: "translateX(200px)",
    });
  });

  it("ignores subpixel width differences before showing horizontal scrolling", () => {
    vi.stubGlobal("CSS", { supports: () => true });
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name", width: 300 }]}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 300 }}
      />,
    );

    const scrollRegion = container.querySelector<HTMLElement>("[data-table-scroll-container]");
    expect(scrollRegion).not.toBeNull();
    if (!scrollRegion) return;
    Object.defineProperties(scrollRegion, {
      clientWidth: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 401.5 },
    });
    fireEvent.scroll(scrollRegion);

    expect(scrollRegion).toHaveClass("overflow-x-auto");
    expect(
      container.querySelector("[data-table-horizontal-scrollbar-track]"),
    ).not.toBeInTheDocument();
  });

  it("shows and synchronizes the sticky horizontal scrollbar while the table bottom is offscreen", () => {
    vi.stubGlobal("CSS", { supports: () => true });
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name", width: 300 },
          { title: "팀", dataIndex: "team", width: 300 },
        ]}
        dataSource={rows}
        pagination={false}
        stickyScrollBar
        scroll={{ x: 600 }}
      />,
    );

    const scrollRegion = container.querySelector<HTMLElement>("[data-table-scroll-container]");
    expect(scrollRegion).not.toBeNull();
    if (!scrollRegion) return;

    Object.defineProperties(scrollRegion, {
      clientWidth: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 800 },
      scrollLeft: { configurable: true, writable: true, value: 0 },
    });
    let bottom = 1200;
    vi.spyOn(scrollRegion, "getBoundingClientRect").mockImplementation(
      () =>
        ({
          bottom,
          height: bottom - 100,
          left: 40,
          right: 440,
          top: 100,
          width: 400,
          x: 40,
          y: 100,
          toJSON: () => ({}),
        }) as DOMRect,
    );

    fireEvent.scroll(scrollRegion);
    fireEvent.scroll(window);
    const stickyTrack = document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar]");
    expect(stickyTrack).toHaveStyle({
      left: "40px",
      opacity: "1",
      top: `${window.innerHeight - 14}px`,
      width: "400px",
    });
    expect(container.querySelector("[data-table-horizontal-scrollbar-track]")).toBeInTheDocument();

    scrollRegion.scrollLeft = 100;
    fireEvent.scroll(scrollRegion);
    expect(
      document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar-thumb]"),
    ).toHaveStyle({ transform: "translateX(50px)", width: "200px" });

    bottom = window.innerHeight - 14;
    fireEvent.scroll(window);
    expect(document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar]")).toHaveStyle({
      opacity: "0",
      pointerEvents: "none",
    });

    bottom = -100;
    fireEvent.scroll(window);
    expect(document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar]")).toHaveStyle({
      opacity: "0",
      pointerEvents: "none",
    });
  });

  it("adds internal vertical cell borders in bordered mode", () => {
    const { container } = render(
      <Table
        bordered
        columns={[
          { title: "이름", dataIndex: "name" },
          { title: "팀", dataIndex: "team" },
        ]}
        dataSource={rows}
        pagination={false}
      />,
    );

    expect(container.querySelector("table")).toHaveClass(
      "[&>thead>tr>th:not(:last-child)]:border-r",
      "[&>tbody>tr>td:not(:last-child)]:border-r",
    );
  });

  it("병합 범위의 두 번째 행을 hover해도 병합 셀을 함께 강조한다", () => {
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name" },
          {
            title: "팀",
            dataIndex: "team",
            onCell: (_record, index) =>
              index === 0 ? { rowSpan: 2 } : index === 1 ? { rowSpan: 0 } : {},
          },
        ]}
        dataSource={rows.slice(0, 2)}
        pagination={false}
      />,
    );

    const renderedRows = container.querySelectorAll<HTMLTableRowElement>("tbody tr[data-row-key]");
    const mergedCell = screen.getByText("Design").closest("td");

    fireEvent.mouseEnter(renderedRows[1]);
    expect(mergedCell).toHaveClass("bg-[#f5f5f5]");

    fireEvent.mouseLeave(renderedRows[1]);
    expect(mergedCell).not.toHaveClass("bg-[#f5f5f5]");
  });

  it("applies pagination classes", () => {
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ pageSize: 1, className: "pagination-class" }}
      />,
    );

    expect(screen.getByRole("navigation", { name: "페이지네이션" })).toHaveClass(
      "pagination-class",
    );
  });
});
