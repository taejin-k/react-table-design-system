import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Illustrations } from "../components/Illustrations";
import { formatTableDataSourceDeclaration, formatTableStorySource } from "./table-story-source";

describe("formatTableDataSourceDeclaration", () => {
  it("builds manual Show code from the same data used by the rendered story", () => {
    const dataSource = [
      { id: "V-1", name: "구성원 0001" },
      { id: "V-2", name: "구성원 0002" },
    ];

    const source = formatTableDataSourceDeclaration(dataSource);

    expect(source).toContain("id: 'V-1'");
    expect(source).toContain("name: '구성원 0001'");
    expect(source).toContain("// ...나머지 1개 항목");
  });
});

describe("formatTableStorySource", () => {
  it("shows custom scrollbar height and omits the default height", () => {
    expect(formatTableStorySource("<Table />", { args: { scrollBarHeight: 12 } })).toContain(
      "scrollBarHeight={12}",
    );
    expect(formatTableStorySource("<Table />", { args: { scrollBarHeight: 8 } })).not.toContain(
      "scrollBarHeight",
    );
  });
  it("uses the grouped header bordered default without hiding an explicit false", () => {
    const columns = [{ title: "구성원", children: [{ title: "이름", dataIndex: "name" }] }];
    expect(
      formatTableStorySource("<Table />", { args: { columns, bordered: true } }),
    ).not.toContain("  bordered");
    expect(formatTableStorySource("<Table />", { args: { columns, bordered: false } })).toContain(
      "bordered={false}",
    );
  });

  it("omits runtime defaults but retains Basic's non-default md size", () => {
    const source = formatTableStorySource("<Table />", {
      args: {
        bordered: false,
        loading: false,
        size: "md",
        showHeader: true,
        rowHoverable: true,
        textSelectable: true,
      },
      name: "Basic",
    });
    for (const key of ["bordered", "loading", "showHeader", "rowHoverable", "textSelectable"]) {
      expect(source).not.toContain(key);
    }
    expect(source).toContain('size="md"');
    expect(formatTableStorySource("<Table />", { args: { size: "lg" } })).not.toContain("size=");
  });

  it("retains controls changed away from their runtime defaults", () => {
    const source = formatTableStorySource("<Table />", {
      args: {
        bordered: true,
        loading: true,
        size: "sm",
        showHeader: false,
        rowHoverable: false,
        textSelectable: false,
      },
    });
    expect(source).toContain("  bordered\n");
    expect(source).toContain("  loading\n");
    expect(source).toContain('size="sm"');
    for (const key of ["showHeader", "rowHoverable", "textSelectable"]) {
      expect(source).toContain(`${key}={false}`);
    }
  });

  it("includes merged story args so the copied example does not depend on meta args", () => {
    const source = formatTableStorySource("<Table />", {
      args: {
        dataSource: [{ id: "M-1", name: "김민준" }],
        columns: [{ key: "name", dataIndex: "name", title: "이름" }],
        pagination: false,
        className: "max-w-[720px]",
      },
      name: "Basic",
    });

    expect(source).toContain("const members =");
    expect(source).toContain("const columns: ColumnsType<(typeof members)[number]> =");
    expect(source).toContain("dataSource={members}");
    expect(source).toContain("columns={columns}");
    expect(source).toContain("pagination={false}");
    expect(source).toContain('className="max-w-[720px]"');
  });

  it("includes the disabled text selection setting in copied examples", () => {
    const source = formatTableStorySource("<Table />", {
      args: { textSelectable: false },
      name: "Text Selection",
    });

    expect(source).toContain("textSelectable={false}");
  });

  it("adds the scroll.y explanation beside the fixed-table-height value", () => {
    const source = formatTableStorySource("<Table />", {
      args: { scroll: { y: 280 } },
      name: "Fixed Table Height",
      parameters: {
        tableScrollYComment: "테이블 본문의 최대 세로 높이를 설정해요.",
      },
    });

    expect(source).toContain("y: 280, // 테이블 본문의 최대 세로 높이를 설정해요.");
  });

  it("adds the scroll.x explanation beside the fixed-column value", () => {
    const source = formatTableStorySource("<Table />", {
      args: { scroll: { x: 1200 } },
      name: "Fixed Columns",
      parameters: {
        tableScrollXComment:
          "테이블을 표시할 영역의 가로 길이가 이 값보다 작으면 columns의 fixed가 적용돼요.",
      },
    });

    expect(source).toContain(
      "x: 1200, // 테이블을 표시할 영역의 가로 길이가 이 값보다 작으면 columns의 fixed가 적용돼요.",
    );
  });

  it("explains why fixed-column widths are required", () => {
    const source = formatTableStorySource("<Table />", {
      args: {
        columns: [{ key: "name", dataIndex: "name", title: "이름", width: 300 }],
      },
      name: "Fixed Columns",
      parameters: {
        tableColumnsComment:
          "고정 열의 위치와 scroll.x를 정확하게 계산하려면 각 column.width가 필요해요.",
      },
    });

    expect(source).toContain(
      "// 고정 열의 위치와 scroll.x를 정확하게 계산하려면 각 column.width가 필요해요.\nconst columns",
    );
  });

  it("serializes an Illustrations empty state with its package import", () => {
    const source = formatTableStorySource("<Table />", {
      args: {
        locale: {
          emptyText: createElement(Illustrations, { description: "아직 구성원이 없어요" }),
        },
      },
      name: "Empty",
    });

    expect(source).toContain("import { Illustrations, Table }");
    expect(source).toContain("emptyText: <Illustrations description='아직 구성원이 없어요' />");
  });

  it("keeps expandedRowRender field access in the generated example", () => {
    const source = formatTableStorySource("<Table />", {
      args: {
        expandable: {
          expandedRowRender: (record: { name: string; role: string }) =>
            `${record.name} · ${record.role}`,
        },
      },
      name: "Expanded Row",
    });

    expect(source).toContain("expandedRowRender: (record) => `${record.name} · ${record.role}`");
    expect(source).not.toContain("String(record)");
  });
});
