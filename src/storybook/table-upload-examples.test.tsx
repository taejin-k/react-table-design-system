import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import * as React from "react";
import dayjs from "dayjs";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";
import * as library from "../index";
import { withStoryImports } from "./story-source";
import { formatTableStorySource } from "./table-story-source";

const verifyBuiltTypes = (
  globalThis as { process?: { env?: { WIZARD_VERIFY_BUILT_TYPES?: string } } }
).process?.env?.WIZARD_VERIFY_BUILT_TYPES;

const scope = new Set([
  "Table",
  "Badge",
  "ColorPicker",
  "Avatar",
  "Image",
  "Collapse",
  "Message",
  "Notification",
  "Modal",
  "Drawer",
  "DatePicker",
  "TimePicker",
  "Calendar",
  "Menu",
  "Skeleton",
  "Tabs",
  "Tree",
  "Upload",
]);
type Story = {
  args?: Record<string, unknown>;
  render?: React.ComponentType<Record<string, unknown>>;
  component?: React.ComponentType<Record<string, unknown>>;
  parameters?: { tableSource?: boolean; docs?: { source?: { code?: string } } };
};
const modules = import.meta.glob<Record<string, Story>>("../components/**/*.stories.tsx", {
  eager: true,
});
const examples = Object.entries(modules).flatMap(([path, module]) => {
  const segments = path.split("/");
  const component = segments[segments.length - 2];
  if (!scope.has(component)) return [];
  return Object.entries(module).flatMap(([name, story]) => {
    const code =
      story.parameters?.docs?.source?.code ??
      (component === "Table" && name !== "default" && !story.render
        ? formatTableStorySource("<Table />", {
            args: { ...module.default.args, ...story.args },
            name,
            parameters: story.parameters,
          })
        : undefined);
    return name !== "default" && code
      ? [{ name: `${component}.${name}`, code, story, meta: module.default }]
      : [];
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
      esModuleInterop: true,
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
    if (name === "dayjs") return dayjs;
    if (name === "react/jsx-runtime") return jsxRuntime;
    if (name === "@taejin-k/wizard-design") return library;
    throw new Error(`Unexpected example dependency: ${name}`);
  };
  new Function("require", "exports", compiled.outputText)(require, exports);
  return exports.Example!;
}

afterEach(cleanup);

describe("Table–Upload standalone Show code", () => {
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

  it("ColorPicker.Basic applies input format control changes", () => {
    const example = examples.find(({ name }) => name === "ColorPicker.Basic")!;
    const args = { ...example.meta.args, ...example.story.args };
    const view = render(React.createElement(example.story.render!, args));
    expect(view.getByRole("button", { name: "#0062DF" })).toBeInTheDocument();
    view.rerender(React.createElement(example.story.render!, { ...args, defaultFormat: "rgb" }));
    expect(view.getByRole("button", { name: "rgb(0, 98, 223)" })).toBeInTheDocument();
    view.rerender(React.createElement(example.story.render!, { ...args, defaultFormat: "hsb" }));
    expect(view.getByRole("button", { name: /^hsb\(/ })).toBeInTheDocument();
    view.rerender(React.createElement(example.story.render!, { ...args, defaultFormat: "hex" }));
    expect(view.getByRole("button", { name: "#0062DF" })).toBeInTheDocument();
  });

  it.each(["story", "Show code"] as const)(
    "Table.Loading toggles loading in %s",
    async (target) => {
      const example = examples.find(({ name }) => name === "Table.Loading")!;
      const Example = compileExample(example.code);
      const view = render(
        target === "story" ? (
          React.createElement(example.story.render!, {
            ...example.meta.args,
            ...example.story.args,
          })
        ) : (
          <Example />
        ),
      );
      const toggle = view.getByRole("button");
      expect(view.getByText("loading: true")).toBeInTheDocument();
      expect(view.getByText("구성원을 불러오는 중")).toBeInTheDocument();

      fireEvent.click(toggle);
      expect(view.getByText("loading: false")).toBeInTheDocument();
      await waitFor(() => expect(view.queryByText("구성원을 불러오는 중")).not.toBeInTheDocument());

      fireEvent.click(toggle);
      expect(view.getByText("loading: true")).toBeInTheDocument();
      expect(view.getByText("구성원을 불러오는 중")).toBeInTheDocument();
    },
  );

  it.each(["story", "Show code"] as const)(
    "Badge.Offset edits position and content in %s",
    (target) => {
      const example = examples.find(({ name }) => name === "Badge.Offset")!;
      const Example = compileExample(example.code);
      const view = render(
        target === "story" ? (
          React.createElement(example.story.render!, {
            ...example.meta.args,
            ...example.story.args,
          })
        ) : (
          <Example />
        ),
      );
      fireEvent.change(view.getByLabelText("X offset (px)"), { target: { value: "-8" } });
      fireEvent.change(view.getByLabelText("Y offset (px)"), { target: { value: "6" } });
      fireEvent.change(view.getByLabelText("배지 내용"), { target: { value: "NEW" } });
      expect(view.container.querySelector("[data-badge-indicator]")).toHaveStyle({
        transform: "translate(-0.625rem, -50%) translate(-8px, 6px)",
      });
      expect(view.getByText("NEW")).toBeInTheDocument();
      fireEvent.change(view.getByLabelText("배지 내용"), { target: { value: "" } });
      expect(view.container.querySelector("[data-badge-indicator]")).toHaveClass("size-1.5");
      expect(view.container.querySelector("[data-badge-indicator]")).toHaveStyle({
        transform: "translate(-0.1875rem, -50%) translate(-8px, 6px)",
      });
    },
  );

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
            !(
              a.name === "name" &&
              (a.value.startsWith("_r_") || a.value.startsWith("wizard-table-selection-"))
            ) &&
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
      // React may split one visible sentence into several adjacent text nodes.
      const children: string[] = [];
      let pendingText = "";
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) pendingText += child.textContent ?? "";
        else {
          children.push(pendingText.trim(), signature(child));
          pendingText = "";
        }
      }
      children.push(pendingText.trim());
      return `<${node.tagName} ${attributes}>${children.join("")}</${node.tagName}>`;
    };
    for (const { name, code, story, meta } of examples) {
      // Table's literal data lists deliberately omit the remaining rows at the
      // user's request. Still compile/run those examples, but don't require the
      // omitted rows or their pagination totals to match the complete story.
      if (name.startsWith("Table.") && code.includes("...나머지")) continue;
      const renderer = story.render ?? meta.render ?? meta.component;
      if (!renderer) continue;
      try {
        const Example = compileExample(code);
        const actual = render(React.createElement(renderer, { ...meta.args, ...story.args }));
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
      } catch (error) {
        differences.push(`${name}: ${String(error)}`);
        cleanup();
      }
    }
    expect(differences).toEqual([]);
  });
});
