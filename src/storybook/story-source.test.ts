import { describe, expect, it } from "vitest";
import { withStoryImports } from "./story-source";

describe("withStoryImports", () => {
  it("adds design-system, React, and dnd-kit imports used by an example", () => {
    const source = withStoryImports(`function DragTable() {
  const [rows, setRows] = useState([]);
  const sortable = useSortable({ id: 'row' });

  return (
    <DndContext collisionDetection={closestCenter}>
      <SortableContext items={rows} strategy={verticalListSortingStrategy}>
        <Table columns={[{ render: () => <Icon icon="drag-handle" /> }]} />
      </SortableContext>
    </DndContext>
  );
}

CSS.Translate.toString(null);
arrayMove([], 0, 0);`);

    expect(source).toContain("import { useState } from 'react';");
    expect(source).toContain("import { Icon, Table } from '@taejin-k/wizard-design';");
    expect(source).toContain("import { closestCenter, DndContext } from '@dnd-kit/core';");
    expect(source).toContain(
      "import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';",
    );
    expect(source).toContain("import { CSS } from '@dnd-kit/utilities';");
  });

  it("does not duplicate an existing import", () => {
    const source = withStoryImports(`import { Input } from '@taejin-k/wizard-design';

<Input placeholder="입력하세요" />`);

    expect(source.match(/\bInput\b/g)).toHaveLength(2);
  });

  it("wraps bare JSX in a named React component", () => {
    const source = withStoryImports(`<div>
  <Checkbox label="레이블" />
</div>`);

    expect(source).toContain("function CheckboxExample() {");
    expect(source).toContain("return (");
  });

  it("keeps constants above the generated component", () => {
    const source = withStoryImports(`const items = [{ title: '홈' }];

<Breadcrumb items={items} />`);

    expect(source).toContain("const items = [{ title: '홈' }];\n\nfunction BreadcrumbExample()");
  });
});
