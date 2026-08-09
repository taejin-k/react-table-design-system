const packageName = "@taejin-k/wizard-design";

const componentExports = [
  "Breadcrumb",
  "Button",
  "Checkbox",
  "Chip",
  "ErrorText",
  "Icon",
  "Input",
  "Illustrations",
  "Label",
  "Radio",
  "Table",
  "Toggle",
] as const;

const reactExports = ["useCallback", "useEffect", "useMemo", "useRef", "useState"] as const;
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

export function withStoryImports(source: string) {
  const example = wrapBareJsx(source);
  const imports = [
    importLine(example, reactExports, "react"),
    importLine(example, componentExports, packageName),
    importLine(example, dndCoreExports, "@dnd-kit/core"),
    importLine(example, dndSortableExports, "@dnd-kit/sortable"),
    used(example, "CSS") && !imported(example, "CSS")
      ? "import { CSS } from '@dnd-kit/utilities';"
      : "",
  ].filter(Boolean);

  return imports.length ? `${imports.join("\n")}\n\n${example}` : example;
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
