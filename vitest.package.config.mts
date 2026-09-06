import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react(), {
    name: "published-package-examples",
    enforce: "pre",
    transform(code, id) {
      if (!/storybook\/(icon-select|table-upload)-examples\.test\.tsx$/.test(id)) return;
      return code.replace('from "../index"', `from ${JSON.stringify(path.resolve("dist/index.mjs"))}`)
        .replace('verifyBuiltTypes ? "dist/index.d.ts" : "src/index.ts"', '"dist/index.d.ts"')
        .replace('function compileExample(code: string) {', `
          if (process.env.WIZARD_EXPORT_EXAMPLES) {
            ts.sys.createDirectory(process.env.WIZARD_EXPORT_EXAMPLES);
            for (const example of examples) {
              const source = withStoryImports(example.code);
              const ast = ts.createSourceFile('example.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
              const fn = ast.statements.filter(ts.isFunctionDeclaration).at(-1)?.name?.text;
              if (fn) ts.sys.writeFile(process.env.WIZARD_EXPORT_EXAMPLES + '/' + example.name + '.tsx', source + '\\nexport default ' + fn + ';');
            }
          }
          function compileExample(code: string) {`);
    },
  }],
  test: {
    globals: true, environment: "jsdom", setupFiles: ["src/test/setup.ts"], css: false,
    include: ["src/storybook/icon-select-examples.test.tsx", "src/storybook/table-upload-examples.test.tsx"],
  },
});
