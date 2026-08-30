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

function getMetaObject(sourceFile: ts.SourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === "meta" &&
        declaration.initializer
      ) {
        return unwrapObjectLiteral(declaration.initializer);
      }
    }
  }
  return undefined;
}

function getObjectProperty(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.ObjectLiteralExpression | undefined {
  const property = getProperty(object, name);
  return property ? unwrapObjectLiteral(property.initializer) : undefined;
}

function getArgTypeNames(
  object: ts.ObjectLiteralExpression | undefined,
  sourceFile: ts.SourceFile,
) {
  const names = new Map<string, string>();
  if (!object) return names;

  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = property.name.getText(sourceFile).replace(/^['"]|['"]$/g, "");
    names.set(key, key);

    const config = unwrapObjectLiteral(property.initializer);
    const displayName = config && getProperty(config, "name");
    if (
      displayName &&
      (ts.isStringLiteral(displayName.initializer) ||
        ts.isNoSubstitutionTemplateLiteral(displayName.initializer))
    ) {
      names.set(displayName.initializer.text, key);
    }
  }
  return names;
}

function getDisabledArgTypeKeys(
  object: ts.ObjectLiteralExpression | undefined,
  sourceFile: ts.SourceFile,
) {
  const keys = new Set<string>();
  if (!object) return keys;

  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const config = unwrapObjectLiteral(property.initializer);
    const control = config && getProperty(config, "control");
    if (control?.initializer.kind === ts.SyntaxKind.FalseKeyword) {
      keys.add(property.name.getText(sourceFile).replace(/^['"]|['"]$/g, ""));
    }
  }
  return keys;
}

function getControlKinds(
  object: ts.ObjectLiteralExpression | undefined,
  sourceFile: ts.SourceFile,
) {
  const kinds = new Map<string, string>();
  if (!object) return kinds;

  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const config = unwrapObjectLiteral(property.initializer);
    const control = config && getProperty(config, "control");
    if (!control) continue;

    if (
      ts.isStringLiteral(control.initializer) ||
      ts.isNoSubstitutionTemplateLiteral(control.initializer)
    ) {
      kinds.set(
        property.name.getText(sourceFile).replace(/^['"]|['"]$/g, ""),
        control.initializer.text,
      );
      continue;
    }

    const controlObject = unwrapObjectLiteral(control.initializer);
    const type = controlObject && getProperty(controlObject, "type");
    if (
      type &&
      (ts.isStringLiteral(type.initializer) ||
        ts.isNoSubstitutionTemplateLiteral(type.initializer))
    ) {
      kinds.set(
        property.name.getText(sourceFile).replace(/^['"]|['"]$/g, ""),
        type.initializer.text,
      );
    }
  }

  return kinds;
}

function getObjectPropertyNames(object: ts.ObjectLiteralExpression | undefined, sourceFile: ts.SourceFile) {
  if (!object) return new Set<string>();
  return new Set(
    object.properties.flatMap((property) => {
      if (!property.name) return [];
      return [property.name.getText(sourceFile).replace(/^['"]|['"]$/g, "")];
    }),
  );
}

describe("Storybook render contracts", () => {
  it("does not expose inferred controls without an explicit argTypes contract", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const meta = getMetaObject(sourceFile);
      if (!meta || getObjectProperty(meta, "argTypes")) continue;

      const parameters = getObjectProperty(meta, "parameters");
      const controls = parameters && getObjectProperty(parameters, "controls");
      const disable = controls && getProperty(controls, "disable");
      if (disable?.initializer.kind !== ts.SyntaxKind.TrueKeyword) violations.push(file);
    }

    expect(violations).toEqual([]);
  });

  it("declares an explicit controls contract for every story", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const meta = getMetaObject(sourceFile);
      if (!meta || !getObjectProperty(meta, "argTypes")) continue;

      const metaParameters = getObjectProperty(meta, "parameters");
      const metaControls = metaParameters && getObjectProperty(metaParameters, "controls");
      const metaDisable = metaControls && getProperty(metaControls, "disable");
      if (metaDisable?.initializer.kind === ts.SyntaxKind.TrueKeyword) continue;

      for (const story of getStoryObjects(sourceFile)) {
        const parameters = getObjectProperty(story.object, "parameters");
        const controls = parameters && getObjectProperty(parameters, "controls");
        const include = controls && getProperty(controls, "include");
        const disable = controls && getProperty(controls, "disable");
        const explicitlyDisabled = disable?.initializer.kind === ts.SyntaxKind.TrueKeyword;

        if (!include && !explicitlyDisabled) violations.push(`${file}:${story.name}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it("only includes controls declared by the component argTypes", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const meta = getMetaObject(sourceFile);
      const argTypes = meta ? getObjectProperty(meta, "argTypes") : undefined;
      if (!argTypes) continue;

      const controlNames = getArgTypeNames(argTypes, sourceFile);

      for (const story of getStoryObjects(sourceFile)) {
        const storyControlNames = new Map(controlNames);
        const storyArgTypes = getObjectProperty(story.object, "argTypes");
        for (const [name, key] of getArgTypeNames(storyArgTypes, sourceFile))
          storyControlNames.set(name, key);
        const disabledKeys = getDisabledArgTypeKeys(argTypes, sourceFile);
        for (const key of getDisabledArgTypeKeys(storyArgTypes, sourceFile)) disabledKeys.add(key);
        for (const [name, key] of storyControlNames) {
          if (disabledKeys.has(key)) storyControlNames.delete(name);
        }

        const parameters = getObjectProperty(story.object, "parameters");
        const controls = parameters && getObjectProperty(parameters, "controls");
        const include = controls && getProperty(controls, "include");
        if (!include || !ts.isArrayLiteralExpression(include.initializer)) continue;

        for (const element of include.initializer.elements) {
          if (!ts.isStringLiteral(element) || storyControlNames.has(element.text)) continue;
          violations.push(`${file}:${story.name}:${element.text}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("initializes every included boolean and choice control", () => {
    const violations: string[] = [];
    const valueRequiredKinds = new Set(["boolean", "select", "radio", "inline-radio"]);

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const meta = getMetaObject(sourceFile);
      const metaArgTypes = meta && getObjectProperty(meta, "argTypes");
      if (!metaArgTypes) continue;

      const metaNames = getArgTypeNames(metaArgTypes, sourceFile);
      const metaKinds = getControlKinds(metaArgTypes, sourceFile);
      const metaArgs = getObjectPropertyNames(meta && getObjectProperty(meta, "args"), sourceFile);

      for (const story of getStoryObjects(sourceFile)) {
        const parameters = getObjectProperty(story.object, "parameters");
        const controls = parameters && getObjectProperty(parameters, "controls");
        const include = controls && getProperty(controls, "include");
        if (!include || !ts.isArrayLiteralExpression(include.initializer)) continue;

        const names = new Map(metaNames);
        const kinds = new Map(metaKinds);
        const storyArgTypes = getObjectProperty(story.object, "argTypes");
        for (const [name, key] of getArgTypeNames(storyArgTypes, sourceFile)) names.set(name, key);
        for (const [key, kind] of getControlKinds(storyArgTypes, sourceFile)) kinds.set(key, kind);

        const args = new Set(metaArgs);
        for (const key of getObjectPropertyNames(getObjectProperty(story.object, "args"), sourceFile)) {
          args.add(key);
        }

        for (const element of include.initializer.elements) {
          if (!ts.isStringLiteral(element)) continue;
          const key = names.get(element.text);
          if (!key || !valueRequiredKinds.has(kinds.get(key) ?? "") || args.has(key)) continue;
          violations.push(`${file}:${story.name}:${key}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("connects every included control to its custom story render", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const meta = getMetaObject(sourceFile);
      const metaNames = getArgTypeNames(meta && getObjectProperty(meta, "argTypes"), sourceFile);

      for (const story of getStoryObjects(sourceFile)) {
        const render = getProperty(story.object, "render");
        if (
          !render ||
          (!ts.isArrowFunction(render.initializer) &&
            !ts.isFunctionExpression(render.initializer)) ||
          render.initializer.parameters.length === 0
        ) {
          continue;
        }

        const parameters = getObjectProperty(story.object, "parameters");
        const controls = parameters && getObjectProperty(parameters, "controls");
        const include = controls && getProperty(controls, "include");
        if (!include || !ts.isArrayLiteralExpression(include.initializer)) continue;

        const controlNames = new Map(metaNames);
        const storyArgTypes = getObjectProperty(story.object, "argTypes");
        for (const [name, key] of getArgTypeNames(storyArgTypes, sourceFile))
          controlNames.set(name, key);

        const parameter = render.initializer.parameters[0].name;
        const used = new Set<string>();
        let usesWholeParameter = false;

        if (ts.isObjectBindingPattern(parameter)) {
          for (const element of parameter.elements) {
            if (element.dotDotDotToken) usesWholeParameter = true;
            if (ts.isIdentifier(element.name)) used.add(element.name.text);
          }
        } else if (ts.isIdentifier(parameter)) {
          const parameterName = parameter.text;
          const visit = (node: ts.Node) => {
            if (ts.isIdentifier(node) && node.text === parameterName && node !== parameter) {
              if (ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node) {
                used.add(node.parent.name.text);
              } else {
                usesWholeParameter = true;
              }
            }
            ts.forEachChild(node, visit);
          };
          visit(render.initializer.body);
        }

        if (usesWholeParameter) continue;
        for (const element of include.initializer.elements) {
          if (!ts.isStringLiteral(element)) continue;
          const key = controlNames.get(element.text);
          if (key && !used.has(key)) violations.push(`${file}:${story.name}:${key}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not expose controls that a custom render replaces with a fixed prop", () => {
    const violations: string[] = [];

    for (const [file, source] of Object.entries(storySources)) {
      const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const meta = getMetaObject(sourceFile);
      const metaNames = getArgTypeNames(meta && getObjectProperty(meta, "argTypes"), sourceFile);

      for (const story of getStoryObjects(sourceFile)) {
        const render = getProperty(story.object, "render");
        if (
          !render ||
          (!ts.isArrowFunction(render.initializer) &&
            !ts.isFunctionExpression(render.initializer)) ||
          render.initializer.parameters.length === 0 ||
          !ts.isIdentifier(render.initializer.parameters[0].name)
        ) {
          continue;
        }

        const parameters = getObjectProperty(story.object, "parameters");
        const controls = parameters && getObjectProperty(parameters, "controls");
        const include = controls && getProperty(controls, "include");
        if (!include || !ts.isArrayLiteralExpression(include.initializer)) continue;

        const controlNames = new Map(metaNames);
        const storyArgTypes = getObjectProperty(story.object, "argTypes");
        for (const [name, key] of getArgTypeNames(storyArgTypes, sourceFile))
          controlNames.set(name, key);

        const includedKeys = new Set(
          include.initializer.elements.flatMap((element) => {
            if (!ts.isStringLiteral(element)) return [];
            const key = controlNames.get(element.text);
            return key ? [key] : [];
          }),
        );
        const parameterName = render.initializer.parameters[0].name.text;

        const visit = (node: ts.Node) => {
          if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
            const attributes = node.attributes.properties;
            const spreadIndex = attributes.findIndex(
              (attribute) =>
                ts.isJsxSpreadAttribute(attribute) &&
                attribute.expression.getText(sourceFile) === parameterName,
            );

            if (spreadIndex >= 0) {
              for (const attribute of attributes.slice(spreadIndex + 1)) {
                if (!ts.isJsxAttribute(attribute)) continue;
                const key = attribute.name.getText(sourceFile);
                if (!includedKeys.has(key)) continue;

                const initializerText = attribute.initializer?.getText(sourceFile) ?? "";
                if (!initializerText.includes(`${parameterName}.${key}`)) {
                  violations.push(`${file}:${story.name}:${key}`);
                }
              }
            }
          }
          ts.forEachChild(node, visit);
        };
        visit(render.initializer.body);
      }
    }

    expect(violations).toEqual([]);
  });

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
