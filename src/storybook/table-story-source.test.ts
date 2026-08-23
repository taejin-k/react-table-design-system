import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Illustrations } from "../components/Illustrations";
import { formatTableStorySource } from "./table-story-source";

describe("formatTableStorySource", () => {
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
    expect(source).toContain("const columns =");
    expect(source).toContain("dataSource={members}");
    expect(source).toContain("columns={columns}");
    expect(source).toContain("pagination={false}");
    expect(source).toContain('className="max-w-[720px]"');
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
