import { cleanup, render } from "@testing-library/react";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";
import * as library from "../index";
import { withStoryImports } from "./story-source";

const verifyBuiltTypes = (
  globalThis as { process?: { env?: { WIZARD_VERIFY_BUILT_TYPES?: string } } }
).process?.env?.WIZARD_VERIFY_BUILT_TYPES;

const scope = new Set([
  "Icon",
  "Button",
  "Tag",
  "Checkbox",
  "Radio",
  "Toggle",
  "Label",
  "ErrorMessage",
  "Breadcrumb",
  "Input",
  "TextArea",
  "Tooltip",
  "Popover",
  "Dropdown",
  "Segmented",
  "Illustrations",
  "Flex",
  "Select",
]);
type Story = {
  args?: Record<string, unknown>;
  render?: React.ComponentType<Record<string, unknown>>;
  parameters?: { docs?: { source?: { code?: string } } };
};
const modules = import.meta.glob<Record<string, Story>>("../components/**/*.stories.tsx", {
  eager: true,
});
const examples = Object.entries(modules).flatMap(([path, module]) => {
  const segments = path.split("/");
  const component = segments[segments.length - 2];
  if (!scope.has(component)) return [];
  return Object.entries(module).flatMap(([name, story]) => {
    const code = story.parameters?.docs?.source?.code;
    return name !== "default" && code ? [{ name: `${component}.${name}`, code, story }] : [];
  });
});

function compileExample(code: string) {
  const source = withStoryImports(code);
  const ast = ts.createSourceFile(
    "example.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const functions = ast.statements.filter(ts.isFunctionDeclaration);
  const name = functions[functions.length - 1]?.name?.text;
  if (!name) throw new Error("Show code needs a runnable example component");
  const compiled = ts.transpileModule(`${source}\nexports.Example = ${name};`, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
    reportDiagnostics: true,
  });
  if (compiled.diagnostics?.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(compiled.diagnostics, {
        getCurrentDirectory: () => "",
        getCanonicalFileName: (f) => f,
        getNewLine: () => "\n",
      }),
    );
  const exports: { Example?: React.ComponentType } = {};
  const require = (name: string) => {
    if (name === "react") return React;
    if (name === "react/jsx-runtime") return jsxRuntime;
    if (name === "@taejin-k/wizard-design") return library;
    throw new Error(`Unexpected example dependency: ${name}`);
  };
  new Function("require", "exports", compiled.outputText)(require, exports);
  return exports.Example!;
}

afterEach(cleanup);

describe("Icon–Select standalone Show code", () => {
  it("type-checks copied examples against the public package API", () => {
    const cwd = ts.sys.getCurrentDirectory();
    const config = ts.readConfigFile(`${cwd}/tsconfig.json`, ts.sys.readFile);
    const options = ts.parseJsonConfigFileContent(config.config, ts.sys, cwd).options;
    const files = new Map(
      examples.map(({ name, code }) => [
        `${cwd}/src/__showcode__/${name}.tsx`,
        withStoryImports(code),
      ]),
    );
    const host = ts.createCompilerHost(options);
    const originalGetSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (file, language, onError, createNew) =>
      files.has(file)
        ? ts.createSourceFile(file, files.get(file)!, language, true, ts.ScriptKind.TSX)
        : originalGetSourceFile(file, language, onError, createNew);
    const program = ts.createProgram(
      [...files.keys()],
      {
        ...options,
        baseUrl: cwd,
        paths: {
          "@taejin-k/wizard-design": [verifyBuiltTypes ? "dist/index.d.ts" : "src/index.ts"],
        },
      },
      host,
    );
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((d) => d.file && files.has(d.file.fileName));
    expect(
      diagnostics.map(
        (d) =>
          `${d.file!.fileName.split("/").pop()}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
      ),
    ).toEqual([]);
  }, 20000);

  it.each(examples)("$name runs without Storybook args or private variables", ({ code }) => {
    const Example = compileExample(code);
    expect(() => render(<Example />)).not.toThrow();
  });

  it("matches the initial rendered story without shared args", () => {
    const differences: string[] = [];
    const signature = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() ?? "";
      if (!(node instanceof Element)) return "";
      const attributes = Array.from(node.attributes)
        .filter(
          (a) =>
            !["id", "for", "data-wizard-floating-trigger", "data-wizard-floating-id"].includes(
              a.name,
            ) &&
            !(a.name === "name" && a.value.startsWith("_r_")) &&
            !(a.name === "placeholder" && a.value === ""),
        )
        .map(
          (a) =>
            `${a.name}=${
              a.name === "class"
                ? a.value.split(/\s+/).sort().join(" ")
                : a.name === "style"
                  ? a.value
                      .split(";")
                      .map((s) => s.trim())
                      .filter((s) => s && !s.endsWith(": normal"))
                      .sort()
                      .join(";")
                  : a.value
            }`,
        )
        .sort()
        .join(";");
      return `<${node.tagName} ${attributes}>${Array.from(node.childNodes).map(signature).join("")}</${node.tagName}>`;
    };
    for (const { name, code, story } of examples) {
      if (!story.render) continue;
      const Example = compileExample(code);
      const actual = render(React.createElement(story.render, story.args ?? {}));
      const actualMarkup = signature(actual.container);
      cleanup();
      const expected = render(<Example />);
      const expectedMarkup = signature(expected.container);
      cleanup();
      if (actualMarkup !== expectedMarkup) {
        let first = 0;
        while (actualMarkup[first] === expectedMarkup[first]) first++;
        differences.push(
          `${name}: story=${actualMarkup.slice(first, first + 160)} / code=${expectedMarkup.slice(first, first + 160)}`,
        );
      }
    }
    expect(differences).toEqual([]);
  });
});
