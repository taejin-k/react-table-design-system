import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Table } from "./Table";
import type { ColumnsType } from "./Table.types";
import * as floatingPosition from "../_internal/floating-position";

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
  it.each(["menu", "tree"] as const)(
    "keeps the open %s filter side while searching but recalculates on reopen or overflow",
    (filterMode) => {
      vi.stubGlobal("innerWidth", 1000);
      vi.stubGlobal("innerHeight", 600);
      const rect = vi
        .spyOn(HTMLElement.prototype, "getBoundingClientRect")
        .mockImplementation(function (this: HTMLElement) {
          return this.hasAttribute("data-table-filter")
            ? new DOMRect(100, 400, 24, 24)
            : new DOMRect();
        });
      const width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
      const height = vi
        .spyOn(HTMLElement.prototype, "offsetHeight", "get")
        .mockImplementation(function (this: HTMLElement) {
          return this.hasAttribute("data-table-filter-motion")
            ? 100 + this.querySelectorAll('input[type="checkbox"]').length * 40
            : 0;
        });
      try {
        render(
          <Table
            columns={[
              {
                title: "팀",
                dataIndex: "team",
                filterSearch: true,
                filterMode,
                filters: ["Design", "Product", "Platform", "Mobile"].map((label) => ({
                  label,
                  value: label,
                })),
              },
            ]}
            dataSource={rows}
            pagination={false}
          />,
        );
        const trigger = requiredElement("[data-table-filter]");
        fireEvent.click(trigger);
        const popup = requiredElement<HTMLElement>("[data-table-filter-motion]");
        const search = screen.getByPlaceholderText("키워드를 입력해요");
        expect(popup).toHaveStyle({ transformOrigin: "center bottom" });
        for (const query of ["Design", "", "no-match", ""]) {
          fireEvent.change(search, { target: { value: query } });
          expect(popup).toHaveStyle({
            transformOrigin: "center bottom",
            top: `${400 - popup.offsetHeight - 4}px`,
          });
        }

        vi.stubGlobal("innerHeight", 900);
        fireEvent(window, new Event("resize"));
        expect(popup).toHaveStyle({ transformOrigin: "center bottom" });
        fireEvent.pointerDown(document.body);
        expect(popup).toHaveStyle({ transformOrigin: "center bottom", opacity: "0" });
        // Reopen before the leave animation has unmounted the popup.
        fireEvent.click(trigger);
        expect(requiredElement("[data-table-filter-motion]")).toHaveStyle({
          transformOrigin: "center top",
          top: "428px",
        });

        vi.stubGlobal("innerHeight", 600);
        fireEvent(window, new Event("resize"));
        expect(requiredElement("[data-table-filter-motion]")).toHaveStyle({
          transformOrigin: "center bottom",
        });
      } finally {
        rect.mockRestore();
        width.mockRestore();
        height.mockRestore();
      }
    },
  );

  it.each(["menu", "tree"] as const)(
    "repositions an upward %s filter in the same commit as its search results",
    async (filterMode) => {
      const height = vi
        .spyOn(HTMLElement.prototype, "offsetHeight", "get")
        .mockImplementation(function (this: HTMLElement) {
          return this.hasAttribute("data-table-filter-motion")
            ? 100 + this.querySelectorAll('input[type="checkbox"]').length * 40
            : 0;
        });
      const position = vi
        .spyOn(floatingPosition, "calculateFloatingPosition")
        .mockImplementation((_anchor, popup) => ({
          left: 100,
          top: 600 - popup.height,
          placement: "topLeft",
          arrowStyle: {},
        }));
      // No resize delivery: a content commit must not wait for ResizeObserver.
      vi.stubGlobal("ResizeObserver", undefined);
      try {
        render(
          <Table
            columns={[
              {
                title: "팀",
                dataIndex: "team",
                filterSearch: true,
                filterMode,
                filters: [
                  {
                    label: "제품 조직",
                    value: "product",
                    children: [
                      { label: "Design", value: "Design" },
                      { label: "Product", value: "Product" },
                    ],
                  },
                  {
                    label: "기술 조직",
                    value: "tech",
                    children: [
                      { label: "Platform", value: "Platform" },
                      { label: "Mobile", value: "Mobile" },
                    ],
                  },
                ],
              },
            ]}
            dataSource={rows}
            pagination={false}
          />,
        );
        fireEvent.click(requiredElement("[data-table-filter]"));
        const popup = requiredElement<HTMLElement>("[data-table-filter-motion]");
        const search = screen.getByPlaceholderText("키워드를 입력해요");
        await waitFor(() => expect(popup).toHaveStyle({ opacity: "1" }));
        for (const query of ["Design", "", "no-match", "기술", ""]) {
          fireEvent.change(search, { target: { value: query } });
          expect(requiredElement("[data-table-filter-motion]")).toBe(popup);
          expect(popup).toHaveStyle({
            top: `${600 - popup.offsetHeight}px`,
            opacity: "1",
            transform: "scaleY(1)",
            transformOrigin: "center bottom",
          });
          expect(document.activeElement).toBe(search);
        }
      } finally {
        height.mockRestore();
        position.mockRestore();
      }
    },
  );

  it.each([
    ["topLeft", "center bottom", "scaleY(0.8)"],
    ["bottomLeft", "center top", "scaleY(0.8)"],
    ["leftTop", "right center", "scaleX(0.8)"],
    ["rightTop", "left center", "scaleX(0.8)"],
  ] as const)(
    "uses resolved %s placement for filter enter and exit motion",
    (placement, origin, transform) => {
      const position = vi.spyOn(floatingPosition, "calculateFloatingPosition").mockReturnValue({
        left: 100,
        top: 100,
        placement,
        arrowStyle: {},
      });
      try {
        render(
          <Table
            columns={[
              { title: "팀", dataIndex: "team", filters: [{ label: "Design", value: "Design" }] },
            ]}
            dataSource={rows}
            pagination={false}
          />,
        );
        fireEvent.click(requiredElement("[data-table-filter]"));
        const popup = requiredElement<HTMLElement>("[data-table-filter-motion]");
        expect(popup).toHaveStyle({
          transformOrigin: origin,
          transform,
          transitionDuration: "200ms",
        });
        fireEvent.pointerDown(document.body);
        expect(popup).toHaveStyle({ transformOrigin: origin, transform, opacity: "0" });
      } finally {
        position.mockRestore();
      }
    },
  );

  it.each(["menu", "tree"] as const)(
    "uses 200ms hover backgrounds in %s filter rows",
    (filterMode) => {
      render(
        <Table
          columns={[
            {
              title: "팀",
              dataIndex: "team",
              filterMode,
              filters: [{ label: "Design", value: "Design" }],
            },
          ]}
          dataSource={rows}
          pagination={false}
        />,
      );
      fireEvent.click(requiredElement("[data-table-filter]"));
      const row = screen.getByRole("checkbox", { name: "Design" }).closest("label")!.parentElement;
      expect(row).toHaveClass(
        "hover:bg-hover",
        "transition-colors",
        "duration-200",
        "motion-reduce:transition-none",
      );
    },
  );

  it("emits controlled sort requests without changing the supplied order", () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={[
          {
            title: "이름",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name, "ko"),
            sortOrder: "ascend",
          },
        ]}
        dataSource={rows}
        pagination={false}
        onChange={onChange}
      />,
    );
    fireEvent.click(requiredElement("[data-table-sorter]"));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), {}, [
      expect.objectContaining({ order: "descend" }),
    ]);
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("김민준");
    fireEvent.click(requiredElement("[data-table-sorter]"));
    expect(onChange.mock.lastCall?.[2][0].order).toBe("descend");
  });

  it("honors initial loading delay across equivalent config rerenders", () => {
    vi.useFakeTimers();
    try {
      const props = {
        columns: [{ title: "이름", dataIndex: "name" }],
        dataSource: rows,
        pagination: false as const,
      };
      const { rerender } = render(<Table {...props} loading={{ delay: 200, text: "로딩 중" }} />);
      expect(screen.queryByText("로딩 중")).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(100));
      rerender(<Table {...props} loading={{ delay: 200, text: "로딩 중" }} />);
      act(() => vi.advanceTimersByTime(100));
      expect(screen.getByText("로딩 중")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it.each(["menu", "tree"] as const)(
    "shows all descendants of a matching %s filter parent",
    async (filterMode) => {
      render(
        <Table
          columns={[
            {
              title: "팀",
              dataIndex: "team",
              filterSearch: true,
              filterMode,
              filters: [
                {
                  label: "제품 조직",
                  value: "product",
                  children: [
                    { label: "Design", value: "design" },
                    {
                      label: "하위팀",
                      value: "sub",
                      children: [{ label: "Product", value: "pm" }],
                    },
                  ],
                },
                {
                  label: "기술 조직",
                  value: "tech",
                  children: [{ label: "Platform", value: "platform" }],
                },
              ],
            },
          ]}
          dataSource={data}
          pagination={false}
        />,
      );
      await userEvent.click(requiredElement("[data-table-filter]"));
      const input = screen.getByPlaceholderText("키워드를 입력해요");
      const labels = () =>
        screen.getAllByRole("checkbox").map((el) => el.closest("label")?.textContent);
      for (const value of ["제품", "ㅈㅍ", "제푸"]) {
        fireEvent.change(input, { target: { value } });
        expect(labels()).toEqual(["Design", "Product"]);
      }
      fireEvent.change(input, { target: { value: "Design" } });
      expect(labels()).toEqual(["Design"]);
      fireEvent.change(input, { target: { value: "하위" } });
      expect(labels()).toEqual(["Product"]);
      fireEvent.change(input, { target: { value: "" } });
      expect(labels()).toEqual(["Design", "Product", "Platform"]);
    },
  );

  it.each(["menu", "tree"] as const)(
    "keeps nested %s filter results only while IME is composing",
    async (filterMode) => {
      render(
        <Table
          columns={[
            {
              title: "이름",
              dataIndex: "name",
              filterSearch: true,
              filterMode,
              filters: [
                { label: "구성원", value: "group", children: [{ label: "김민준", value: "kim" }] },
              ],
            },
          ]}
          dataSource={rows}
          pagination={false}
        />,
      );
      await userEvent.click(requiredElement("[data-table-filter]"));
      const input = screen.getByPlaceholderText("키워드를 입력해요");
      fireEvent.compositionStart(input);
      fireEvent.change(input, { target: { value: "김믽" } });
      expect(screen.getByRole("checkbox", { name: "김민준" })).toBeInTheDocument();
      fireEvent.compositionEnd(input, { data: "믽" });
      expect(screen.queryByRole("checkbox", { name: "김민준" })).not.toBeInTheDocument();
      fireEvent.compositionStart(input);
      expect(screen.getByRole("checkbox", { name: "김민준" })).toBeInTheDocument();
      fireEvent.blur(input);
      expect(screen.queryByRole("checkbox", { name: "김민준" })).not.toBeInTheDocument();
    },
  );

  it.each(["menu", "tree"] as const)(
    "searches nested Korean filter labels in %s mode without filtering rows early",
    async (filterMode) => {
      const user = userEvent.setup();
      const onFilter = vi.fn((value, record: Row) => record.id === value);
      render(
        <Table<Row>
          rowKey="id"
          columns={[
            {
              title: "이름",
              dataIndex: "name",
              filterMode,
              filterSearch: true,
              onFilter,
              filters: [
                {
                  label: "구성원",
                  value: "members",
                  children: [
                    { label: "김민준", value: "1" },
                    { label: "이서연", value: "2" },
                  ],
                },
                { label: "박지호", value: "3" },
                { label: "Design42", value: "design" },
              ],
            },
          ]}
          dataSource={rows}
          pagination={false}
        />,
      );
      await user.click(requiredElement("[data-table-filter]"));
      const search = screen.getByPlaceholderText("키워드를 입력해요");
      const popup = within(requiredElement<HTMLElement>("[data-table-filter-motion]"));
      for (const query of ["ㄱ", "기", "ㄱㅁ", "ㄱㅁㅈ", "김미", "김민주", "민준"]) {
        fireEvent.change(search, { target: { value: query } });
        expect(popup.getByText("구성원")).toBeInTheDocument();
        // ㄱ also matches the parent 구성원, so both descendants are included.
        expect(popup.getAllByRole("checkbox")).toHaveLength(query === "ㄱ" ? 2 : 1);
        expect(popup.getByRole("checkbox", { name: "김민준" })).toBeInTheDocument();
        expect(document.querySelectorAll("tbody tr")).toHaveLength(3);
      }
      for (const query of ["기민", "ㄱㅈ", "없는이름"]) {
        fireEvent.change(search, { target: { value: query } });
        expect(popup.queryAllByRole("checkbox")).toHaveLength(0);
        expect(popup.getByText("검색결과가 없어요")).toBeInTheDocument();
      }
      for (const query of ["DESIGN", "42"]) {
        fireEvent.change(search, { target: { value: query } });
        expect(popup.getByRole("checkbox", { name: "Design42" })).toBeInTheDocument();
      }
      fireEvent.change(search, { target: { value: "" } });
      expect(popup.getAllByRole("checkbox")).toHaveLength(4);
      expect(onFilter).not.toHaveBeenCalled();

      fireEvent.change(search, { target: { value: "ㄱㅁㅈ" } });
      await user.click(popup.getByRole("checkbox", { name: "김민준" }));
      await user.click(popup.getByRole("button", { name: "확인" }));
      expect(onFilter).toHaveBeenCalledWith("1", rows[0]);
      expect(document.querySelectorAll("tbody tr")).toHaveLength(1);
      expect(document.querySelector("tbody")).toHaveTextContent("김민준");
    },
  );

  it("also searches Korean labels in single-selection filters", async () => {
    render(
      <Table
        columns={[
          {
            title: "이름",
            dataIndex: "name",
            filterSearch: true,
            filterMultiple: false,
            filters: [
              { label: "김민준", value: "1" },
              { label: "박지호", value: "3" },
            ],
          },
        ]}
        dataSource={rows}
        pagination={false}
      />,
    );
    await userEvent.click(requiredElement("[data-table-filter]"));
    fireEvent.change(screen.getByPlaceholderText("키워드를 입력해요"), {
      target: { value: "ㄱㅁ" },
    });
    expect(screen.getByRole("radio", { name: "김민준" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "박지호" })).not.toBeInTheDocument();
  });

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
    expect(container.querySelector("tbody td")).toHaveClass("border-b", "border-hover");
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

    expect(container.querySelector("tbody td")).toHaveClass("border-b", "border-transparent");
    expect(container.querySelector(".rounded-lg.bg-white")).toHaveClass("border", "border-hover");
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
    expect(row).not.toHaveClass("hover:[&>td]:bg-hover");
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
            filters: [{ label: "Design", value: "Design" }],
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
    expect(requiredElement("[data-table-filter]")).toHaveClass("text-primary");
  });

  it("renders filter popups in document.body", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[
          {
            title: "팀",
            dataIndex: "team",
            filters: [{ label: "Design", value: "Design" }],
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
              { label: "Design", value: "Design" },
              { label: "Platform", value: "Platform" },
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
    expect(sorter).toHaveClass("hover:bg-transparent");
    expect(sorter).not.toHaveClass("hover:bg-hover");
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
              { label: "Design", value: "Design" },
              { label: "Platform", value: "Platform" },
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

  it("keeps long filter reset and confirm actions usable", async () => {
    const resetText = "초기화".repeat(80);
    const confirmText = "확인".repeat(80);
    const onChange = vi.fn();
    render(
      <Table
        columns={[
          {
            title: "팀",
            dataIndex: "team",
            filters: [{ label: "Design", value: "Design" }],
            defaultFilteredValue: ["Design"],
            onFilter: (value, record) => record.team === value,
          },
        ]}
        dataSource={rows}
        pagination={false}
        locale={{ filterReset: resetText, filterConfirm: confirmText }}
        onChange={onChange}
      />,
    );
    await userEvent.click(requiredElement("[data-table-filter]"));
    const popup = within(requiredElement<HTMLElement>("[data-table-filter-motion]"));
    const reset = popup.getByRole("button", { name: resetText });
    const confirm = popup.getByRole("button", { name: confirmText });
    expect(reset).toHaveClass("min-w-0");
    expect(confirm).toHaveClass("min-w-0", "shrink-0", "max-w-[50%]");
    expect(reset.querySelector("span")).toHaveClass("truncate");
    await userEvent.click(reset);
    expect(popup.getByRole("checkbox", { name: "Design" })).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(confirm);
    expect(onChange).toHaveBeenCalledWith(expect.anything(), { team: null }, []);
    await waitFor(() =>
      expect(document.querySelector("[data-table-filter-motion]")).not.toBeInTheDocument(),
    );
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("closes the filter popup when the page scrolls", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={[
          {
            title: "팀",
            dataIndex: "team",
            filters: [{ label: "Design", value: "Design" }],
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
    expect(detail.closest("td")).toHaveClass("!bg-hover");
    await user.click(requiredElement("[data-table-expand]"));
    expect(screen.getByText("김민준 상세 정보")).toBeInTheDocument();
    fireEvent.transitionEnd(requiredElement("[data-table-expand-motion]"), {
      propertyName: "grid-template-rows",
    });
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

    expect(screen.getByText("하위 구성원").closest("tr")).toHaveClass("[&>td]:bg-hover");
    expect(screen.getByText("상위 구성원").closest("tr")).not.toHaveClass("[&>td]:bg-hover");
  });

  it("slides nested tree rows out before removing them and preserves expansion when reopened", () => {
    vi.useFakeTimers();
    try {
      const treeRows = [{
        ...rows[0],
        children: [{ ...rows[1], children: [rows[2]] }],
      }];
      const { container } = render(
        <Table
          columns={[{ title: "이름", dataIndex: "name", fixed: "left", width: 160 }]}
          dataSource={treeRows}
          expandable={{ defaultExpandedKeys: ["1", "2"], fixed: true }}
          rowSelection={{ fixed: true }}
          pagination={false}
        />,
      );
      act(() => vi.advanceTimersByTime(40));
      const trigger = requiredElement('[data-row-key="1"] [data-table-expand]');
      const child = requiredElement('[data-row-key="2"]');
      expect(child.querySelector("td")).toHaveStyle({ position: "sticky", left: "0px" });
      fireEvent.click(trigger);
      expect(container.querySelectorAll('[data-row-depth="1"], [data-row-depth="2"]')).toHaveLength(2);
      for (const motion of Array.from(container.querySelectorAll("[data-table-tree-motion]"))) {
        expect(motion).toHaveStyle({ gridTemplateRows: "0fr" });
        expect(motion.closest("td")).toHaveClass("!py-0", "!border-b-0");
      }
      act(() => vi.advanceTimersByTime(80));
      fireEvent.click(trigger);
      expect(requiredElement('[data-row-key="2"]')).toBe(child);
      for (const motion of Array.from(container.querySelectorAll("[data-table-tree-motion]"))) {
        expect(motion).toHaveStyle({ gridTemplateRows: "1fr" });
      }
      act(() => vi.advanceTimersByTime(300));
      expect(child).toBeInTheDocument();
      fireEvent.click(trigger);
      act(() => vi.advanceTimersByTime(250));
      expect(container.querySelector('[data-row-depth="1"]')).toBeNull();
      expect(container.querySelector('[data-row-depth="2"]')).toBeNull();
      fireEvent.click(trigger);
      act(() => vi.advanceTimersByTime(40));
      expect(requiredElement('[data-row-key="3"]')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("animates externally controlled tree collapse without changing expansion callbacks", () => {
    vi.useFakeTimers();
    try {
      const onExpandedRowsChange = vi.fn();
      const props = {
        columns: [{ title: "이름", dataIndex: "name" }],
        dataSource: [{ ...rows[0], children: [rows[1]] }],
        pagination: false as const,
      };
      const { container, rerender } = render(
        <Table {...props} expandable={{ expandedKeys: ["1"], onExpandedRowsChange }} />,
      );
      act(() => vi.advanceTimersByTime(40));
      fireEvent.click(requiredElement("[data-table-expand]"));
      expect(onExpandedRowsChange).toHaveBeenCalledWith([]);
      expect(requiredElement("[data-table-tree-motion]")).toHaveStyle({ gridTemplateRows: "1fr" });
      rerender(<Table {...props} expandable={{ expandedKeys: [], onExpandedRowsChange }} />);
      expect(requiredElement("[data-table-tree-motion]")).toHaveStyle({ gridTemplateRows: "0fr" });
      act(() => vi.advanceTimersByTime(250));
      expect(container.querySelector('[data-row-depth="1"]')).toBeNull();
      expect(onExpandedRowsChange).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
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
    expect(screen.getByText("이서연").closest("tr")).toHaveClass(
      "[&>td]:bg-selected",
      "hover:[&>td]:bg-selected",
    );
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

  it.each([
    [undefined, 8],
    [8, 8],
    [12, 12],
    [16, 16],
    [17, 16],
    [41, 16],
    [4, 8],
    [-1, 8],
    [Number.NaN, 8],
  ] as const)(
    "sizes and synchronizes the sticky horizontal scrollbar (%s px)",
    (scrollBarHeight, expectedHeight) => {
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
          scrollBarHeight={scrollBarHeight}
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
        top: `${window.innerHeight - expectedHeight - 30}px`,
        width: "400px",
        height: `${expectedHeight}px`,
      });
      expect(
        container.querySelector("[data-table-horizontal-scrollbar-track]"),
      ).toBeInTheDocument();
      expect(container.querySelector("[data-table-horizontal-scrollbar-track]")).toHaveStyle({
        height: `${expectedHeight}px`,
      });
      expect(container.querySelector("[data-table-horizontal-scrollbar-thumb]")).toHaveClass(
        "h-full",
      );
      expect(stickyTrack?.querySelector("[data-table-sticky-scrollbar-thumb]")).toHaveClass(
        "h-full",
      );
      expect(scrollRegion.style.paddingBottom).toBe("");
      expect(container.querySelector("[data-table-horizontal-scrollbar-track]")).toHaveClass(
        "bottom-0",
      );
      expect(container.firstElementChild).not.toHaveAttribute("scrollbarheight");

      scrollRegion.scrollLeft = 100;
      fireEvent.scroll(scrollRegion);
      expect(
        document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar-thumb]"),
      ).toHaveStyle({ transform: "translateX(50px)", width: "200px" });

      bottom = window.innerHeight - 29;
      fireEvent.scroll(window);
      expect(document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar]")).toHaveStyle(
        {
          opacity: "1",
        },
      );

      bottom = window.innerHeight - 30;
      fireEvent.scroll(window);
      expect(document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar]")).toHaveStyle(
        {
          opacity: "0",
          pointerEvents: "none",
        },
      );

      bottom = -100;
      fireEvent.scroll(window);
      expect(document.body.querySelector<HTMLElement>("[data-table-sticky-scrollbar]")).toHaveStyle(
        {
          opacity: "0",
          pointerEvents: "none",
        },
      );
    },
  );

  it("defaults grouped headers to bordered while respecting an explicit false", () => {
    const groupedColumns: ColumnsType<Row> = [
      {
        title: "구성원",
        children: [
          { title: "이름", dataIndex: "name" },
          { title: "팀", dataIndex: "team" },
        ],
      },
    ];
    const borderClass = "[&>tbody>tr>td:not(:last-child)]:border-r-hover";
    const { container, rerender } = render(
      <Table columns={groupedColumns} dataSource={rows} pagination={false} />,
    );
    expect(container.querySelector("table")).toHaveClass(borderClass);
    rerender(
      <Table columns={groupedColumns} dataSource={rows} pagination={false} bordered={false} />,
    );
    expect(container.querySelector("table")).not.toHaveClass(borderClass);
    rerender(<Table columns={groupedColumns} dataSource={rows} pagination={false} />);
    expect(container.querySelector("table")).toHaveClass(borderClass);
    rerender(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={false}
      />,
    );
    expect(container.querySelector("table")).not.toHaveClass(borderClass);
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
    expect(container.querySelector("thead th")).toHaveClass("border-b");
    expect(container.querySelector("thead th")).not.toHaveClass("border-b-0");
  });

  it("reserves transparent outer and cell borders when bordered is false", () => {
    const { container } = render(
      <Table
        columns={[
          { title: "이름", dataIndex: "name" },
          { title: "팀", dataIndex: "team" },
        ]}
        dataSource={rows}
        pagination={false}
      />,
    );

    expect(container.querySelector(".rounded-lg.bg-white")).toHaveClass(
      "border",
      "border-transparent",
    );
    expect(container.querySelector("table")).toHaveClass(
      "[&>thead>tr>th:not(:last-child)]:border-r",
      "[&>thead>tr>th:not(:last-child)]:border-r-transparent",
      "[&>tbody>tr>td:not(:last-child)]:border-r",
      "[&>tbody>tr>td:not(:last-child)]:border-r-transparent",
    );
    expect(container.querySelector("thead th")).toHaveClass("border-b-0");
    expect(container.querySelector("tbody td")).toHaveClass("border-b");
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
    expect(mergedCell).toHaveClass("bg-hover");

    fireEvent.mouseLeave(renderedRows[1]);
    expect(mergedCell).not.toHaveClass("bg-hover");
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

  it.each([
    { current: 1 },
    { current: 3 },
    { current: 2, disabled: true },
    { current: 2, disabled: true, simple: true },
  ])("shows disabled pagination arrows without a button box (%j)", (pagination) => {
    const onChange = vi.fn();
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ ...pagination, pageSize: 1, onChange }}
      />,
    );
    const disabledArrows = container.querySelectorAll(
      "[data-pagination-prev]:disabled, [data-pagination-next]:disabled",
    );
    expect(disabledArrows.length).toBe(pagination.disabled ? 2 : 1);
    for (const arrow of Array.from(disabledArrows)) {
      expect(arrow).toHaveClass(
        "disabled:!border-transparent",
        "disabled:!bg-transparent",
        "disabled:!text-disabled",
        "disabled:!ring-transparent",
      );
      expect(arrow).not.toHaveClass("disabled:!border-border", "disabled:!bg-hover");
      fireEvent.click(arrow);
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows disabled page numbers and jump buttons without a button box", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ disabled: true, total: 19, pageSize: 1, onChange }}
      />,
    );
    expect(requiredElement('[data-pagination-page="1"]')).toBeDisabled();
    expect(requiredElement('[data-pagination-jump="jump-next"]')).toBeDisabled();
    for (const button of Array.from(
      container.querySelectorAll("[data-pagination-page], [data-pagination-jump]"),
    )) {
      expect(button).toBeDisabled();
      expect(button).toHaveClass(
        "disabled:!border-transparent",
        "disabled:!bg-transparent",
        "disabled:!text-disabled",
        "disabled:!ring-transparent",
      );
      expect(button).not.toHaveClass("disabled:!border-border", "disabled:!bg-hover");
      fireEvent.click(button);
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps page selection instant while transitioning hover backgrounds and jump colors", () => {
    render(
      <Table
        columns={[{ title: "이름", dataIndex: "name" }]}
        dataSource={rows}
        pagination={{ pageSize: 1, total: 19 }}
      />,
    );

    expect(requiredElement('[data-pagination-page="1"]')).toHaveClass(
      "transition-none",
      "duration-0",
      "before:!opacity-0",
      "before:transition-none",
    );
    expect(requiredElement('[data-pagination-page="2"]')).toHaveClass(
      "transition-none",
      "duration-0",
      "before:transition-opacity",
      "before:duration-200",
      "before:-inset-px",
      "enabled:hover:before:opacity-100",
    );
    expect(requiredElement('[data-pagination-jump="jump-next"]')).toHaveClass(
      "transition-colors",
      "duration-200",
      "ease-out",
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
    fireEvent.click(requiredElement('[data-pagination-page="2"]'));
    expect(requiredElement('[data-pagination-page="2"]')).toHaveClass(
      "bg-primary",
      "transition-none",
      "before:!opacity-0",
    );
    expect(requiredElement('[data-pagination-page="1"]')).not.toHaveClass("bg-primary");
    expect(requiredElement('[data-pagination-page="1"]')).toHaveClass(
      "transition-none",
      "before:transition-opacity",
    );
  });
});
