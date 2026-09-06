import { createRequire } from "node:module";
import { renderToString } from "react-dom/server";
import React from "react";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const modules = { esm: await import("../dist/index.mjs"), cjs: require("../dist/index.js") };
for (const [format, library] of Object.entries(modules)) {
  for (const name of ["Modal", "Drawer"]) {
    for (const open of [false, true]) {
      assert.doesNotThrow(() => renderToString(React.createElement(library[name], { open, title: "SSR" })));
      console.log(`${format} ${name} open=${open}: PASS`);
    }
  }
}
