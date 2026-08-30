const packageName = "@taejin-k/wizard-design";

const componentExports = [
  "Avatar",
  "Badge",
  "Breadcrumb",
  "Button",
  "Calendar",
  "Checkbox",
  "Collapse",
  "ColorPicker",
  "Description",
  "Descriptions",
  "Tag",
  "Dropdown",
  "Drawer",
  "DatePicker",
  "ErrorMessage",
  "Icon",
  "Input",
  "Illustrations",
  "Image",
  "Label",
  "Flex",
  "Modal",
  "Menu",
  "Popover",
  "Radio",
  "Select",
  "Segmented",
  "Skeleton",
  "Table",
  "Tabs",
  "TextArea",
  "TimePicker",
  "Tooltip",
  "Toggle",
  "Tree",
  "Upload",
] as const;
const apiExports = ["message", "notification"] as const;

const reactExports = ["useCallback", "useEffect", "useMemo", "useRef", "useState"] as const;
const componentTypeExports = [
  "DatePickerValueType",
  "DateRangeValueType",
  "DrawerPlacementType",
  "DropdownItem",
  "Key",
  "SelectOption",
  "TableRef",
  "TimePickerValueType",
  "TreeDataNode",
  "TreeDropInfo",
  "UploadFile",
] as const;
const dndCoreExports = [
  "closestCenter",
  "DndContext",
  "KeyboardSensor",
  "PointerSensor",
  "useSensor",
  "useSensors",
] as const;
const dndSortableExports = [
  "arrayMove",
  "horizontalListSortingStrategy",
  "SortableContext",
  "sortableKeyboardCoordinates",
  "useSortable",
  "verticalListSortingStrategy",
] as const;

function used(source: string, name: string) {
  return new RegExp(`\\b${name}\\b`).test(source);
}

function imported(source: string, name: string) {
  return new RegExp(`import[\\s\\S]*?\\b${name}\\b[\\s\\S]*?from`).test(source);
}

function importLine(source: string, names: readonly string[], from: string) {
  const imports = names.filter((name) => used(source, name) && !imported(source, name));
  return imports.length ? `import { ${imports.join(", ")} } from '${from}';` : "";
}

function apiImportLine(source: string, names: readonly string[], from: string) {
  const imports = names.filter(
    (name) => new RegExp(`\\b${name}\\s*\\.`).test(source) && !imported(source, name),
  );
  return imports.length ? `import { ${imports.join(", ")} } from '${from}';` : "";
}

export function withStoryImports(source: string) {
  const example = wrapBareJsx(source);
  const imports = [
    importLine(example, reactExports, "react"),
    importLine(example, componentExports, packageName),
    apiImportLine(example, apiExports, packageName),
    typeImportLine(example, componentTypeExports, packageName),
    importLine(example, dndCoreExports, "@dnd-kit/core"),
    importLine(example, dndSortableExports, "@dnd-kit/sortable"),
    used(example, "dayjs") && !imported(example, "dayjs") ? "import dayjs from 'dayjs';" : "",
    used(example, "CSS") && !imported(example, "CSS")
      ? "import { CSS } from '@dnd-kit/utilities';"
      : "",
  ].filter(Boolean);

  return imports.length ? `${imports.join("\n")}\n\n${example}` : example;
}

function typeImportLine(source: string, names: readonly string[], from: string) {
  const imports = names.filter((name) => used(source, name) && !imported(source, name));
  return imports.length ? `import type { ${imports.join(", ")} } from '${from}';` : "";
}

export function formatTooltipStorySource(source: string) {
  const withoutDefaults = source
    .replace(/\s+placement=(?:"top"|'top'|\{"top"\}|\{'top'\})/g, "")
    .replace(/\s+trigger=(?:"hover"|'hover'|\{"hover"\}|\{'hover'\})/g, "")
    .replace(/\s+arrow=\{true\}/g, "")
    .replace(/\s+arrow(?=\s|\/?>)/g, "")
    .replace(/\s+autoAdjustOverflow=\{true\}/g, "")
    .replace(/\s+autoAdjustOverflow(?=\s|\/?>)/g, "")
    .replace(/\s+mouseEnterDelay=\{0\.1\}/g, "")
    .replace(/\s+mouseLeaveDelay=\{0\.1\}/g, "")
    .replace(/\s+>/g, ">")
    .replace(/<Tooltip\s+([^<>\n]+)>/g, (_match, props: string) => {
      return `<Tooltip ${props.trim()}>`;
    });

  return withStoryImports(withoutDefaults);
}

function wrapBareJsx(source: string) {
  const example = source.trim();
  if (/\bfunction\s+[A-Z][A-Za-z0-9]*\s*\(/.test(example)) return example;

  const jsxStart = example.search(/^<(?:[A-Za-z]|>)/m);
  if (jsxStart < 0) return example;

  const declarations = example.slice(0, jsxStart).trimEnd();
  const jsx = example.slice(jsxStart).trim();
  const componentName = jsx.match(/<([A-Z][A-Za-z0-9]*)\b/)?.[1] ?? "Component";
  const renderedJsx = jsx
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
  const component = `function ${componentName}Example() {\n  return (\n${renderedJsx}\n  );\n}`;

  return declarations ? `${declarations}\n\n${component}` : component;
}
