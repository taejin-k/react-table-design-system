import { describe, expect, it } from "vitest";
import { formatTooltipStorySource, withStoryImports } from "./story-source";

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

  it("does not treat a message prop as the global message API", () => {
    const source = withStoryImports('<ErrorMessage message="입력값을 확인해 주세요." />');

    expect(source).toContain("import { ErrorMessage } from '@taejin-k/wizard-design';");
    expect(source).not.toContain("ErrorMessage, message");
  });

  it("imports lowercase APIs when their methods are called", () => {
    const source = withStoryImports("message.success('저장했어요.');");

    expect(source).toContain("import { message } from '@taejin-k/wizard-design';");
  });

  it("imports DropdownItem as a component type", () => {
    const source = withStoryImports(`const items: DropdownItem[] = [];

function DropdownExample() {
  return <Dropdown menu={{ items }} />;
}`);

    expect(source).toContain("import type { DropdownItem } from '@taejin-k/wizard-design';");
  });
});

describe("formatTooltipStorySource", () => {
  it("omits Tooltip props that already use component defaults", () => {
    const source = formatTooltipStorySource(`<Tooltip
  arrow
  autoAdjustOverflow={true}
  mouseEnterDelay={0.1}
  mouseLeaveDelay={0.1}
  placement="top"
  title="도움말"
  trigger="hover"
>
  <Button variant="secondary">대상</Button>
</Tooltip>`);

    expect(source).toContain("import { Button, Tooltip } from '@taejin-k/wizard-design';");
    expect(source).toContain('title="도움말"');
    expect(source).not.toContain("placement=");
    expect(source).not.toContain("trigger=");
    expect(source).not.toContain("autoAdjustOverflow");
    expect(source).not.toContain("mouseEnterDelay");
    expect(source).not.toContain("mouseLeaveDelay");
    expect(source).not.toMatch(/\sarrow(?:\s|=)/);
  });

  it("keeps Tooltip props when they differ from component defaults", () => {
    const source = formatTooltipStorySource(
      '<Tooltip arrow={false} placement="right" trigger="click" title="도움말"><button /></Tooltip>',
    );

    expect(source).toContain("arrow={false}");
    expect(source).toContain('placement="right"');
    expect(source).toContain('trigger="click"');
  });
});
