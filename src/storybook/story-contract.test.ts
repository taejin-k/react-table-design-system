/// <reference types="vite/client" />

import ts from "typescript";
import { describe, expect, it } from "vitest";

const storySources = import.meta.glob<string>("../components/**/*.stories.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
});

function getStoryObjects(sourceFile: ts.SourceFile) {
  return sourceFile.statements.flatMap((statement) => {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      return [];
    }

    return statement.declarationList.declarations.flatMap((declaration) => {
      if (
        !ts.isIdentifier(declaration.name) ||
        !declaration.initializer ||
        !ts.isObjectLiteralExpression(declaration.initializer)
      ) {
        return [];
      }

      return [{ name: declaration.name.text, object: declaration.initializer }];
    });
  });
}

function getProperty(object: ts.ObjectLiteralExpression, name: string) {
  return object.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && property.name.getText(object.getSourceFile()) === name,
  );
}

function unwrapObjectLiteral(expression: ts.Expression): ts.ObjectLiteralExpression | undefined {
  let current = expression;
  while (
    ts.isSatisfiesExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return ts.isObjectLiteralExpression(current) ? current : undefined;
}

describe("Storybook render contracts", () => {
  it("uses the same render tree in Canvas and Docs", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );

      const visit = (node: ts.Node) => {
        if (ts.isIdentifier(node) && node.text === "viewMode") violations.push(file);
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
    }

    expect([...new Set(violations)]).toEqual([]);
  });

  it("does not hide component defaults in shared meta args", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      if (file.includes("/Table/")) continue;

      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );

      for (const statement of sourceFile.statements) {
        if (!ts.isVariableStatement(statement)) continue;
        for (const declaration of statement.declarationList.declarations) {
          if (
            !ts.isIdentifier(declaration.name) ||
            declaration.name.text !== "meta" ||
            !declaration.initializer
          ) {
            continue;
          }

          const meta = unwrapObjectLiteral(declaration.initializer);
          if (meta && getProperty(meta, "args")) violations.push(file);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not let args.children leak into custom story renders", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );

      for (const story of getStoryObjects(sourceFile)) {
        const args = getProperty(story.object, "args");
        const render = getProperty(story.object, "render");
        if (!args || !render || !ts.isObjectLiteralExpression(args.initializer)) continue;

        const hasChildrenArg = args.initializer.properties.some(
          (property) => property.name?.getText(sourceFile) === "children",
        );
        if (!hasChildrenArg) continue;

        let spreadsArgs = false;
        const visit = (node: ts.Node) => {
          if (ts.isJsxSpreadAttribute(node) && node.expression.getText(sourceFile) === "args") {
            spreadsArgs = true;
          }
          ts.forEachChild(node, visit);
        };
        visit(render.initializer);

        if (spreadsArgs) violations.push(`${file}:${story.name}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("keeps fixed example props after the args spread", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );

      for (const story of getStoryObjects(sourceFile)) {
        const args = getProperty(story.object, "args");
        const render = getProperty(story.object, "render");
        if (!args || !render || !ts.isObjectLiteralExpression(args.initializer)) continue;

        const argNames = new Set(
          args.initializer.properties
            .map((property) => property.name?.getText(sourceFile).replace(/^['"]|['"]$/g, ""))
            .filter((name): name is string => Boolean(name)),
        );

        const visit = (node: ts.Node) => {
          if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
            const attributes = node.attributes.properties;
            const spreadIndex = attributes.findIndex(
              (attribute) =>
                ts.isJsxSpreadAttribute(attribute) &&
                attribute.expression.getText(sourceFile) === "args",
            );

            if (spreadIndex >= 0) {
              for (const attribute of attributes.slice(0, spreadIndex)) {
                if (
                  ts.isJsxAttribute(attribute) &&
                  argNames.has(attribute.name.getText(sourceFile))
                ) {
                  violations.push(`${file}:${story.name}:${attribute.name.getText(sourceFile)}`);
                }
              }
            }
          }
          ts.forEachChild(node, visit);
        };
        visit(render.initializer);
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not build visible JSX labels from hidden story args", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );

      const visit = (node: ts.Node) => {
        if (
          ts.isJsxAttribute(node) &&
          node.initializer &&
          ts.isJsxExpression(node.initializer) &&
          node.initializer.expression &&
          ts.isTemplateExpression(node.initializer.expression) &&
          /\bargs\.\w+/.test(node.initializer.expression.getText(sourceFile))
        ) {
          violations.push(`${file}:${node.name.getText(sourceFile)}`);
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
    }

    expect(violations).toEqual([]);
  });
});
