import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Table } from "./Table";
import type { ColumnsType } from "./Table.types";

type Row = { id: string; name: string; team: string };
const data: Row[] = [{ id: "1", name: "김민준", team: "Design" }];
const rows: Row[] = [
  { id: "1", name: "김민준", team: "Design" },
  { id: "2", name: "이서연", team: "Platform" },
  { id: "3", name: "박지호", team: "Design" },
];

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element;
}

afterEach(() => vi.unstubAllGlobals());

describe("Table regressions", () => {
  it("forwards className to the top-level Table element", () => {
    const { container } = render(
      <Table
        className="max-w-[720px] bg-red-500"
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
      />,
    );

    expect(container.firstElementChild).toHaveClass("max-w-[720px]", "bg-red-500");
    expect(container.querySelector("table")).not.toHaveClass("max-w-[720px]", "bg-red-500");
  });

  it("prevents text selection from the top-level element when textSelectable is false", () => {
    const { container, rerender } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
        textSelectable={false}
      />,
    );

    expect(container.firstElementChild).toHaveClass("select-none");

    rerender(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
      />,
    );

    expect(container.firstElementChild).not.toHaveClass("select-none");
  });

  it("데이터가 없으면 기본 일러스트레이션과 안내 문구를 표시한다", () => {
    const { container } = render(
      <Table columns={[{ title: "이름", dataIndex: "name" }]} dataSource={[]} pagination={false} />,
    );

    expect(screen.getByText("검색결과가 없어요")).toBeInTheDocument();
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

  it("always uses fixed table layout", () => {
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
      />,
    );

    expect(container.querySelector("table")).toHaveStyle({ tableLayout: "fixed" });
  });

  it("applies lg, md, and sm table sizes", () => {
    const { container, rerender } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
      />,
    );

    expect(container.querySelector("thead th")).toHaveClass("p-4");
    expect(container.querySelector("tbody td")).toHaveClass("p-4");

    rerender(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
        size="md"
      />,
    );

    expect(container.querySelector("thead th")).toHaveClass("px-2", "py-3");
    expect(container.querySelector("tbody td")).toHaveClass("px-2", "py-3");

    rerender(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        pagination={false}
        size="sm"
      />,
    );

    expect(container.querySelector("thead th")).toHaveClass("p-2");
    expect(container.querySelector("tbody td")).toHaveClass("p-2");
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

  it("resolves grouped flexible columns from the measured table viewport", async () => {
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(823);

    try {
      const { container } = render(
        <Table
          columns={[
            {
              title: "구성원",
              children: [
                { title: "이름", dataIndex: "name", width: 150 },
                { title: "직무", dataIndex: "team", minWidth: 190 },
              ],
            },
            {
              title: "업무 정보",
              children: [
                { title: "팀", dataIndex: "team", width: 120 },
                { title: "프로젝트", dataIndex: "projects", width: 110 },
              ],
            },
          ]}
          dataSource={data}
          pagination={false}
        />,
      );

      await waitFor(() => {
        const columns = container.querySelectorAll<HTMLTableColElement>("col");
        expect(columns[0]).toHaveStyle({ width: "150px" });
        expect(columns[1]).toHaveStyle({ width: "443px", minWidth: "190px" });
        expect(columns[2]).toHaveStyle({ width: "120px" });
        expect(columns[3]).toHaveStyle({ width: "110px" });
      });
    } finally {
      clientWidth.mockRestore();
    }
  });

  it("updates flexible widths before checking overflow during a container resize", async () => {
    let viewportWidth = 900;
    const resizeCallbacks: ResizeObserverCallback[] = [];
    const clientWidth = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function (this: HTMLElement): number {
        return this.hasAttribute("data-table-scroll-container") ? viewportWidth : 0;
      });
    const scrollWidth = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockImplementation(function (this: HTMLElement): number {
        if (!this.hasAttribute("data-table-scroll-container")) return 0;
        return Array.from(this.querySelectorAll<HTMLTableColElement>("col")).reduce(
          (total, column) => total + (Number.parseFloat(column.style.width) || 0),
          0,
        );
      });
    vi.stubGlobal("CSS", { supports: () => true });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          resizeCallbacks.push(callback);
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );

    try {
      const { container } = render(
        <Table
          columns={[
            { title: "이름", dataIndex: "name", width: 150 },
            { title: "직무", dataIndex: "team", minWidth: 190 },
            { title: "팀", dataIndex: "team", width: 120 },
            { title: "프로젝트", dataIndex: "projects", width: 110 },
          ]}
          dataSource={data}
          pagination={false}
          scroll={{ x: "max-content" }}
        />,
      );

      await waitFor(() =>
        expect(container.querySelectorAll<HTMLTableColElement>("col")[1]).toHaveStyle({
          width: "520px",
        }),
      );

      viewportWidth = 800;
      act(() => {
        resizeCallbacks.forEach((callback) => callback([], {} as globalThis.ResizeObserver));
      });

      await waitFor(() => {
        expect(container.querySelectorAll<HTMLTableColElement>("col")[1]).toHaveStyle({
          width: "420px",
        });
        expect(
          container.querySelector("[data-table-horizontal-scrollbar-track]"),
        ).not.toBeInTheDocument();
      });

      viewportWidth = 500;
      act(() => {
        resizeCallbacks.forEach((callback) => callback([], {} as globalThis.ResizeObserver));
      });

      await waitFor(() => {
        expect(container.querySelectorAll<HTMLTableColElement>("col")[1]).toHaveStyle({
          width: "190px",
        });
        expect(
          container.querySelector("[data-table-horizontal-scrollbar-track]"),
        ).toBeInTheDocument();
      });
    } finally {
      clientWidth.mockRestore();
      scrollWidth.mockRestore();
    }
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

  it("keeps fixed widths and lets a max-content minWidth column fill the viewport", async () => {
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);

    try {
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

      await waitFor(() => {
        const columns = container.querySelectorAll<HTMLTableColElement>("col");
        expect(columns[0]).toHaveStyle({ width: "48px", minWidth: "48px", maxWidth: "48px" });
        expect(columns[1]).toHaveStyle({ width: "220px" });
        expect(columns[2]).toHaveStyle({ width: "312px", minWidth: "190px" });
        expect(columns[3]).toHaveStyle({ width: "220px" });
        expect(container.querySelector("table")).toHaveStyle({ minWidth: "678px" });
      });
    } finally {
      clientWidth.mockRestore();
    }
  });

  it("applies the same leaf widths to grouped headers and body cells", () => {
    const { container } = render(
      <Table
        columns={[
          {
            title: "구성원",
            children: [
              { title: "이름", dataIndex: "name", width: 150 },
              { title: "팀", dataIndex: "team", minWidth: 190 },
            ],
          },
          { title: "업무", children: [{ title: "프로젝트", dataIndex: "projects", width: 100 }] },
        ]}
        dataSource={data}
        pagination={false}
      />,
    );

    const columns = container.querySelectorAll<HTMLTableColElement>("col");
    expect(columns[0]).toHaveStyle({ width: "150px" });
    expect(columns[1]).toHaveStyle({ width: "calc(100% - 250px)" });
    expect(columns[2]).toHaveStyle({ width: "100px" });
    expect(screen.getByRole("columnheader", { name: "이름" })).toHaveStyle({ width: "150px" });
    expect(screen.getByText("김민준").closest("td")).toHaveStyle({ width: "150px" });
  });

  it("applies custom row keys and native row, header, cell, and scroll props", () => {
    const onScroll = vi.fn();
    const onRow = vi.fn(() => ({ className: "custom-row" }));
    const onHeaderRow = vi.fn(() => ({ className: "custom-header-row" }));
    const { container } = render(
      <Table
        columns={[
          {
            title: "이름",
            dataIndex: "name",
            onCell: () => ({ colSpan: 2, scope: "row" }),
            onHeaderCell: () => ({ className: "custom-header-cell" }),
          },
          { title: "팀", dataIndex: "team" },
        ]}
        dataSource={data}
        pagination={false}
        rowKey="name"
        rowHoverable={false}
        onRow={onRow}
        onHeaderRow={onHeaderRow}
        onScroll={onScroll}
      />,
    );

    const row = container.querySelector<HTMLTableRowElement>("tbody tr[data-row-key]");
    expect(row).toHaveAttribute("data-row-key", "김민준");
    expect(row).toHaveClass("custom-row");
    expect(row).not.toHaveClass("hover:[&>td]:bg-[#f5f5f5]");
    expect(container.querySelector("thead tr")).toHaveClass("custom-header-row");
    expect(container.querySelector("thead th")).toHaveClass("custom-header-cell");
    expect(screen.getByText("김민준").closest("td")).toHaveAttribute("colspan", "2");
    expect(screen.getByText("김민준").closest("td")).toHaveAttribute("scope", "row");

    fireEvent.scroll(container.querySelector("[data-table-scroll-container]") as HTMLElement);
    expect(onScroll).toHaveBeenCalledOnce();
    expect(onRow).toHaveBeenCalledWith(data[0], 0);
    expect(onHeaderRow).toHaveBeenCalled();
  });

  it("supports controlled sorting and filtering", () => {
    render(
      <Table
        columns={[
          {
            title: "이름",
            dataIndex: "name",
            sorter: (left, right) => left.name.localeCompare(right.name),
            sortOrder: "descend",
          },
          {
            title: "팀",
            dataIndex: "team",
            filters: [{ text: "Design", value: "Design" }],
            filteredValue: ["Design"],
            onFilter: (value, record) => record.team === value,
          },
        ]}
        dataSource={rows}
        pagination={false}
      />,
    );

    expect(screen.queryByText("Platform")).not.toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("박지호");
    expect(requiredElement("[data-table-filter]")).toHaveClass("text-[#0062df]");
  });

  it("renders filter popups in document.body", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[
          {
            title: "팀",
            dataIndex: "team",
            filters: [{ text: "Design", value: "Design" }],
          },
        ]}
        dataSource={data}
        pagination={false}
      />,
    );

    await user.click(requiredElement("[data-table-filter]"));
    expect(document.body.querySelector("[data-table-filter-motion]")).toBeInTheDocument();
  });

  it("shows the default empty text when filter search has no results", async () => {
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
            filterSearch: true,
          },
        ]}
        dataSource={data}
        pagination={false}
      />,
    );

    await user.click(requiredElement("[data-table-filter]"));
    await user.type(screen.getByPlaceholderText("키워드를 입력해요"), "검색 결과 없음");

    expect(screen.getByText("검색결과가 없어요")).toBeInTheDocument();
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
        dataSource={[{ id: "1", name: "김민준", team: longRole }]}
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

    await user.click(requiredElement("[data-table-sorter]"));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("김민준");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.arrayContaining([expect.objectContaining({ order: "ascend" })]),
    );

    await user.click(requiredElement("[data-table-sorter]"));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("이서연");

    await user.click(requiredElement("[data-table-sorter]"));
    expect(onChange.mock.calls[onChange.mock.calls.length - 1]?.[2]).toEqual([]);
  });

  it("applies defaultSortOrder on the first render", () => {
    render(
      <Table
        columns={[
          {
            title: "이름",
            dataIndex: "name",
            sorter: (left, right) => left.name.localeCompare(right.name, "ko"),
            defaultSortOrder: "descend",
          },
        ]}
        dataSource={[rows[2], rows[0], rows[1]]}
        pagination={false}
      />,
    );

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
          },
        ]}
        dataSource={rows}
        pagination={false}
      />,
    );

    const sorter = requiredElement<HTMLElement>("[data-table-sorter]");
    await user.hover(sorter);
    expect(await screen.findByText("오름차순 정렬")).toBeInTheDocument();
    await user.unhover(sorter);
    await user.click(sorter);
    await user.hover(sorter);
    expect(await screen.findByText("내림차순 정렬")).toBeInTheDocument();
  });

  it("scrolls to the first row after sorting", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Table
        columns={[
          {
            title: "이름",
            dataIndex: "name",
            sorter: (left, right) => left.name.localeCompare(right.name, "ko"),
          },
        ]}
        dataSource={rows}
        pagination={false}
        scroll={{ y: 120 }}
      />,
    );
    const scrollRegion = container.querySelector<HTMLElement>(
      "[data-table-scroll-container]",
    ) as HTMLElement;
    const scrollTo = vi.fn();
    Object.defineProperty(scrollRegion, "scrollTo", { configurable: true, value: scrollTo });

    await user.click(requiredElement("[data-table-sorter]"));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
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

    await user.click(requiredElement("[data-table-filter]"));
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

    await user.click(requiredElement("[data-table-filter]"));
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

    await user.click(requiredElement('[data-pagination-page="2"]'));
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

  it("uses 10, 20, and 50 as the default page size options", async () => {
    const user = userEvent.setup();
    const manyRows = Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      name: `구성원 ${index + 1}`,
    }));

    render(<Table columns={[{ title: "이름", dataIndex: "name" }]} dataSource={manyRows} />);

    await user.click(screen.getByRole("button", { name: "10 / 페이지" }));
    const pageSizePopup = await waitFor(() => {
      const popup = document.querySelector<HTMLElement>("[data-select-popup]");
      expect(popup).toBeInTheDocument();
      return popup as HTMLElement;
    });

    expect(within(pageSizePopup).getByText("20 / 페이지")).toBeInTheDocument();
    expect(within(pageSizePopup).getByText("50 / 페이지")).toBeInTheDocument();
    expect(within(pageSizePopup).queryByText("100 / 페이지")).not.toBeInTheDocument();
  });

  it("uses defaultPage as the initial uncontrolled page", () => {
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ defaultPage: 2, defaultPageSize: 1 }}
      />,
    );

    expect(screen.getByText("이서연")).toBeInTheDocument();
    expect(screen.queryByText("김민준")).not.toBeInTheDocument();
  });

  it("uses page as the controlled page", async () => {
    const user = userEvent.setup();
    const onPaginationChange = vi.fn();
    const tableProps = {
      columns: [{ title: "이름", dataIndex: "name" }] satisfies ColumnsType<Row>,
      dataSource: rows,
    };
    const { rerender } = render(
      <Table {...tableProps} pagination={{ page: 1, pageSize: 1, onChange: onPaginationChange }} />,
    );

    await user.click(requiredElement('[data-pagination-page="2"]'));
    expect(onPaginationChange).toHaveBeenCalledWith(2, 1);
    expect(screen.getByText("김민준")).toBeInTheDocument();

    rerender(
      <Table {...tableProps} pagination={{ page: 2, pageSize: 1, onChange: onPaginationChange }} />,
    );
    expect(screen.getByText("이서연")).toBeInTheDocument();
    expect(screen.queryByText("김민준")).not.toBeInTheDocument();
  });

  it("reports page in the Table onChange pagination config", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ pageSize: 1 }}
        onChange={onChange}
      />,
    );

    await user.click(requiredElement('[data-pagination-page="2"]'));
    expect(onChange.mock.calls[0]?.[0]).toMatchObject({ page: 2, pageSize: 1 });
    expect(onChange.mock.calls[0]?.[0]).not.toHaveProperty("current");
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

    const quickJumper = requiredElement<HTMLInputElement>("[data-pagination-jumper]");
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

    const trigger = requiredElement<HTMLElement>("[data-table-expand]");
    await user.click(trigger);
    const detail = screen.getByText("김민준 상세 정보");
    expect(detail).toBeInTheDocument();
    expect(detail.closest("td")).toHaveClass("!bg-[#fafafa]");
    await user.click(requiredElement("[data-table-expand]"));
    expect(screen.queryByText("김민준 상세 정보")).not.toBeInTheDocument();
  });

  it("shows a pointer cursor only on rows that expand by click", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: (record) => `${record.name} 상세 정보`,
          rowExpandable: (record) => record.id === "1",
        }}
        pagination={false}
      />,
    );

    const expandableRow = screen.getByText("김민준").closest("tr");
    const staticRow = screen.getByText("이서연").closest("tr");
    expect(expandableRow).toHaveClass("cursor-pointer");
    expect(staticRow).not.toHaveClass("cursor-pointer");

    await user.click(screen.getByText("김민준"));
    expect(screen.getByText("김민준 상세 정보")).toBeInTheDocument();
  });

  it("supports controlled expanded rows and expansion callbacks", async () => {
    const user = userEvent.setup();
    const onExpand = vi.fn();
    const onExpandedRowsChange = vi.fn();
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={data}
        expandable={{
          expandedKeys: ["1"],
          expandedRowRender: (record) => `${record.name} 상세 정보`,
          onExpand,
          onExpandedRowsChange,
        }}
        pagination={false}
      />,
    );

    expect(screen.getByText("김민준 상세 정보")).toBeInTheDocument();
    await user.click(requiredElement("[data-table-expand]"));
    expect(onExpand).toHaveBeenCalledWith(false, data[0]);
    expect(onExpandedRowsChange).toHaveBeenCalledWith([]);
  });

  it("fixes the expand column to the left when fixed is true", () => {
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name", width: 600 }]}
        dataSource={data}
        expandable={{
          fixed: true,
          expandedRowRender: (record) => `${record.name} 상세 정보`,
        }}
        pagination={false}
        scroll={{ x: 648 }}
      />,
    );

    expect(container.querySelector("thead th")).toHaveStyle({ position: "sticky", left: "0px" });
    expect(container.querySelector("tbody td")).toHaveStyle({ position: "sticky", left: "0px" });
  });

  it("uses the expanded background for child tree rows", () => {
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={[
          {
            id: "parent",
            name: "상위 구성원",
            team: "Design",
            children: [{ id: "child", name: "하위 구성원", team: "Design" }],
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
    expect(onChange).toHaveBeenLastCalledWith(["2"], [rows[1]]);
  });

  it("preserves selected rows that temporarily leave the data source", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={false}
        rowSelection={{
          defaultSelectedKeys: ["1"],
          preserveSelectedKeys: true,
          onChange,
        }}
      />,
    );

    rerender(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows.slice(1)}
        pagination={false}
        rowSelection={{ preserveSelectedKeys: true, onChange }}
      />,
    );
    await user.click(
      requiredElement<HTMLInputElement>('tbody tr[data-row-key="2"] input[type="checkbox"]'),
    );

    expect(onChange).toHaveBeenLastCalledWith(["1", "2"], [rows[0], rows[1]]);
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
          defaultSelectedKeys: ["1"],
          getCheckboxProps: (record) => ({ disabled: record.id === "3" }),
          onChange,
        }}
      />,
    );

    const selectAll = requiredElement<HTMLInputElement>('thead input[type="checkbox"]');
    expect(selectAll).toBePartiallyChecked();

    await user.click(selectAll);
    expect(selectAll).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(["1", "2"], rows.slice(0, 2));
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
    expect(
      Array.from(container.querySelectorAll("*")).flatMap((element) =>
        Array.from(element.attributes).filter((attribute) => attribute.name.startsWith("aria-")),
      ),
    ).toHaveLength(0);
    expect(document.querySelector('[id^="DndDescribedBy"]')).not.toBeInTheDocument();
    expect(document.querySelector('[id^="DndLiveRegion"]')).not.toBeInTheDocument();
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

    const scrollRegion = requiredElement<HTMLElement>("[data-table-scroll-container]");
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
        stickyHeader
        stickyHeaderOffset={48}
      />,
    );

    const headerRegion = container.querySelector("[data-table-sticky-header]");
    const scrollRegion = container.querySelector("[data-table-scroll-container]");

    expect(headerRegion).toHaveStyle({
      position: "sticky",
      top: "48px",
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

    const scrollRegion = requiredElement<HTMLElement>("[data-table-scroll-container]");
    const headerRegion = container.querySelector<HTMLElement>("[data-table-header-scroll]");

    Object.defineProperty(scrollRegion, "scrollLeft", { configurable: true, value: 80 });
    fireEvent.scroll(scrollRegion);

    expect(headerRegion?.scrollLeft).toBe(80);
  });

  it("keeps separated header and virtual body column sizing identical after scrolling", () => {
    const virtualRows = Array.from({ length: 40 }, (_, index) => ({
      id: String(index),
      name: `구성원 ${index}`,
      team: "Design",
    }));
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name", width: 150 },
          { title: "팀", dataIndex: "team", minWidth: 190 },
          { title: "프로젝트", dataIndex: "projects", width: 100 },
        ]}
        dataSource={virtualRows}
        pagination={false}
        virtual
        scroll={{ y: 120 }}
      />,
    );

    const tables = container.querySelectorAll("table");
    expect(tables).toHaveLength(2);
    const widthList = (table: HTMLTableElement) =>
      Array.from(table.querySelectorAll<HTMLTableColElement>("col")).map(
        (column) => column.style.width,
      );
    expect(widthList(tables[0])).toEqual(widthList(tables[1]));
    expect(tables[0]).toHaveStyle({ minWidth: "440px" });
    expect(tables[1]).toHaveStyle({ minWidth: "440px" });

    const scrollRegion = requiredElement<HTMLElement>("[data-table-scroll-container]");
    Object.defineProperty(scrollRegion, "scrollTop", { configurable: true, value: 500 });
    fireEvent.scroll(scrollRegion);

    expect(widthList(tables[0])).toEqual(widthList(tables[1]));
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
        stickyScrollBarOffset={24}
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
      top: `${window.innerHeight - 38}px`,
      width: "400px",
    });
    expect(container.querySelector("[data-table-horizontal-scrollbar-track]")).toBeInTheDocument();

    scrollRegion.scrollLeft = 100;
    fireEvent.scroll(scrollRegion);
    expect(
      document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar-thumb]"),
    ).toHaveStyle({ transform: "translateX(50px)", width: "200px" });

    bottom = window.innerHeight - 29;
    fireEvent.scroll(window);
    expect(document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar]")).toHaveStyle({
      opacity: "1",
    });

    bottom = window.innerHeight - 30;
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

  it("uses compact pagination in a narrow table container", () => {
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        constructor(private readonly callback: ResizeObserverCallback) {}
        observe(target: Element) {
          Object.defineProperty(target, "clientWidth", { configurable: true, value: 420 });
          this.callback([], this as unknown as globalThis.ResizeObserver);
        }
        disconnect() {}
        unobserve() {}
      },
    );

    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ pageSize: 1 }}
      />,
    );

    expect(screen.getByRole("navigation")).toHaveAttribute("data-pagination-compact");
    expect(requiredElement("[data-pagination-current]")).toBeInTheDocument();
  });

  it("keeps page buttons static and transitions only previous and next buttons", () => {
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ pageSize: 1 }}
      />,
    );

    expect(requiredElement('[data-pagination-page="1"]')).toHaveClass(
      "transition-none",
      "duration-0",
    );
    expect(requiredElement("[data-pagination-prev]")).toHaveClass(
      "transition-colors",
      "duration-200",
      "ease-out",
    );
    expect(requiredElement("[data-pagination-next]")).toHaveClass(
      "transition-colors",
      "duration-200",
      "ease-out",
    );
  });
});
