import { isValidElement } from "react";
import { withStoryImports } from "./story-source";

type StorySourceContext = {
  args?: Record<string, unknown>;
  name?: string;
  parameters?: {
    tableColumnsComment?: string;
    tableScrollXComment?: string;
    tableScrollYComment?: string;
    tableSource?: boolean;
  };
};

const tablePropOrder = [
  "dataSource",
  "columns",
  "rowKey",
  "pagination",
  "rowSelection",
  "rowDrag",
  "columnDrag",
  "expandable",
  "bordered",
  "loading",
  "size",
  "locale",
  "showHeader",
  "showSorterTooltip",
  "tableLayout",
  "rowHoverable",
  "stickyHeader",
  "virtual",
  "stickyScrollBar",
  "scroll",
  "sortDirections",
  "rootClassName",
  "components",
  "className",
];

const objectPropOrder = [
  "key",
  "dataIndex",
  "title",
  "width",
  "minWidth",
  "align",
  "fixed",
  "ellipsis",
  "responsive",
  "hidden",
  "filters",
  "filterMode",
  "filterSearch",
  "filterMultiple",
  "filterOnClose",
  "filteredValue",
  "defaultFilteredValue",
  "defaultSortOrder",
  "sortDirections",
  "sorter",
  "render",
];

const memberPropOrder = ["id", "name", "role", "team", "status", "projects", "joinedAt"];

const functionProp = (name: string) =>
  name.startsWith("on") || ["render", "sorter", "showTotal", "getPopupContainer"].includes(name);

function sortKeys(keys: string[], preferred: string[]) {
  return [...keys].sort((left, right) => {
    const leftFunction = functionProp(left);
    const rightFunction = functionProp(right);
    if (leftFunction !== rightFunction) return leftFunction ? 1 : -1;

    const leftIndex = preferred.indexOf(left);
    const rightIndex = preferred.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) return 0;
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}

function quote(value: string) {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function functionSource(value: (...args: never[]) => unknown) {
  const source = value
    .toString()
    .replace(/\s+/g, " ")
    .replace(/^\(([^)]*)\)\s*=>/, "($1) =>")
    .trim();

  if (!source.includes("_jsx")) return source;

  const parameters = source.match(/^\(?([^)=]*)\)?\s*=>/)?.[1]?.trim() || "value";
  if (!parameters.includes(",")) {
    return `(${parameters}) => <span>{String(${parameters})}</span>`;
  }
  return `(${parameters}) => <span>사용자 정의 콘텐츠</span>`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    Boolean(value) && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype
  );
}

function primitiveArray(value: unknown[]) {
  return value.every((item) => ["string", "number", "boolean"].includes(typeof item));
}

type SerializeOptions = {
  arrayReferences: Map<unknown[], string>;
  maxItems?: number;
  preferredKeys?: string[];
};

function serialize(value: unknown, indent: number, options: SerializeOptions): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return quote(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") {
    return functionSource(value as (...args: never[]) => unknown);
  }

  if (
    isValidElement<{
      className?: string;
      description?: string;
      size?: string;
      type?: string;
    }>(value)
  ) {
    const component = value.type as { displayName?: string };
    if (component.displayName === "Illustrations") {
      const { className, description, size, type } = value.props;
      const props = [
        type ? `type=${quote(type)}` : "",
        size ? `size=${quote(size)}` : "",
        description ? `description=${quote(description)}` : "",
        className ? `className=${quote(className)}` : "",
      ].filter(Boolean);
      return `<Illustrations ${props.join(" ")} />`;
    }
  }

  if (Array.isArray(value)) {
    const reference = options.arrayReferences.get(value);
    if (reference) return reference;
    if (!value.length) return "[]";
    if (primitiveArray(value) && value.length <= 6) {
      return `[${value.map((item) => serialize(item, indent, options)).join(", ")}]`;
    }

    const limit = options.maxItems ?? value.length;
    const visibleItems = value.slice(0, limit);
    const padding = " ".repeat(indent + 2);
    const lines = visibleItems.map((item) => `${padding}${serialize(item, indent + 2, options)},`);
    if (visibleItems.length < value.length) {
      lines.push(`${padding}// ...나머지 ${value.length - visibleItems.length}개 항목`);
    }
    return `[\n${lines.join("\n")}\n${" ".repeat(indent)}]`;
  }

  if (isPlainObject(value)) {
    const preferred = options.preferredKeys ?? objectPropOrder;
    const keys = sortKeys(
      Object.keys(value).filter((key) => value[key] !== undefined),
      preferred,
    );
    if (!keys.length) return "{}";
    const padding = " ".repeat(indent + 2);
    const lines = keys.map(
      (key) => `${padding}${key}: ${serialize(value[key], indent + 2, options)},`,
    );
    return `{\n${lines.join("\n")}\n${" ".repeat(indent)}}`;
  }

  return "/* ReactNode */";
}

function filterConstantName(column: Record<string, unknown>, index: number) {
  const dataIndex = typeof column.dataIndex === "string" ? column.dataIndex : `column${index + 1}`;
  return `${dataIndex}Filters`;
}

export function formatTableStorySource(source: string, context: StorySourceContext) {
  const args = context.args;
  const openingTag = source.match(/<([A-Z][\w.]*)([\s\S]*?)\/>/);
  const componentName = source.includes("<Table") ? "Table" : openingTag?.[1];
  const wrapperHasProps = Boolean(openingTag?.[2]?.trim());
  if (
    !args ||
    !componentName ||
    (componentName !== "Table" && !wrapperHasProps) ||
    (context.parameters?.tableSource === false && componentName === "Table")
  ) {
    return withStoryImports(source);
  }

  const arrayReferences = new Map<unknown[], string>();
  const declarations: string[] = [];
  const dataSource = Array.isArray(args.dataSource) ? args.dataSource : undefined;
  const columns = Array.isArray(args.columns) ? args.columns : undefined;

  if (columns) {
    columns.forEach((column, index) => {
      if (!isPlainObject(column) || !Array.isArray(column.filters)) return;
      const name = filterConstantName(column, index);
      declarations.push(
        `const ${name} = ${serialize(column.filters, 0, {
          arrayReferences,
          preferredKeys: ["text", "value", "children"],
        })};`,
      );
      arrayReferences.set(column.filters, name);
    });
  }

  if (dataSource?.length) {
    arrayReferences.set(dataSource, "members");
    declarations.push(
      `const members = ${serialize(dataSource, 0, {
        arrayReferences: new Map(),
        maxItems: 1,
        preferredKeys: memberPropOrder,
      })};`,
    );
  }

  if (columns?.length) {
    const columnsComment = context.parameters?.tableColumnsComment
      ? `// ${context.parameters.tableColumnsComment}\n`
      : "";
    declarations.push(
      `${columnsComment}const columns = ${serialize(columns, 0, { arrayReferences })};`,
    );
    arrayReferences.set(columns, "columns");
  }

  const keys = sortKeys(
    Object.keys(args).filter((key) => args[key] !== undefined),
    tablePropOrder,
  );
  const props = keys.map((key) => {
    const value = args[key];
    if (value === true) return `  ${key}`;
    if (typeof value === "string") return `  ${key}="${value}"`;
    if (
      key === "scroll" &&
      isPlainObject(value) &&
      (context.parameters?.tableScrollXComment || context.parameters?.tableScrollYComment)
    ) {
      const scrollLines = Object.entries(value).map(([scrollKey, scrollValue]) => {
        const comment =
          scrollKey === "x"
            ? context.parameters?.tableScrollXComment
            : scrollKey === "y"
              ? context.parameters?.tableScrollYComment
              : undefined;
        return `    ${scrollKey}: ${serialize(scrollValue, 4, { arrayReferences })},${comment ? ` // ${comment}` : ""}`;
      });
      return `  scroll={{\n${scrollLines.join("\n")}\n  }}`;
    }
    return `  ${key}={${serialize(value, 2, { arrayReferences })}}`;
  });

  const componentSource = `<${componentName}\n${props.join("\n")}\n/>`;
  const declarationSource = declarations.length ? `${declarations.join("\n\n")}\n\n` : "";

  if (componentName === "Table") {
    const storyName = context.name ?? "Table";
    const pascalName = storyName
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, character: string) => character.toUpperCase())
      .replace(/^[^a-zA-Z_]+/, "");
    const functionName = `${pascalName || "Table"}Table`;
    const indentedComponent = componentSource
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n");

    return withStoryImports(
      `${declarationSource}function ${functionName}() {\n  return (\n${indentedComponent}\n  );\n}`,
    );
  }

  return withStoryImports(`${declarationSource}${componentSource}`);
}
