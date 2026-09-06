// Requires local Storybook and agent-browser. Checks real focus scrolling,
// grid collapse, and popup recovery using the actual exported components.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const session = `expansion-scroll-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 15000,
  }).trim();
const evaluate = (source) => JSON.parse(browser("eval", source));

try {
  browser("open", "http://localhost:6006/iframe.html?id=components-select--tags&viewMode=story");
  browser("set", "viewport", "1100", "700");
  browser("wait", "500");
  evaluate(readFileSync(new URL("./expansion-audit.js", import.meta.url), "utf8"));

  for (const kind of ["Collapse", "Tree", "Menu"]) {
    evaluate(`renderFixture('${kind}', false); true`);
    browser("wait", "350");
    evaluate(`auditExpansion('${kind}')`);
    browser("wait", "--fn", "window.expansionSamples.length >= 15");
    const result = evaluate(`({
      frames: expansionSamples.length,
      maxScroll: Math.max(...expansionSamples.map(x => x.scroll)),
      openHeight: expansionSamples.at(-1).height,
      heightChange: Math.max(...expansionSamples.map(x => x.height)) - Math.min(...expansionSamples.map(x => x.height)),
    })`);
    assert.ok(result.frames >= 15, `${kind}: animation must be sampled`);
    assert.ok(result.heightChange > 10, `${kind}: expansion must still animate`);
    assert.equal(result.maxScroll, 0, `${kind}: focus must not scroll the clipped contents`);
    assert.ok(result.openHeight > 100, `${kind}: contents must expand`);

    evaluate(`renderFixture('${kind}', false); true`);
    browser("wait", "400");
    const closedHeight = evaluate(
      `document.querySelector('#audit-fixture [style*="grid-template-rows"]').getBoundingClientRect().height`,
    );
    assert.ok(closedHeight < 1, `${kind}: contents must fully collapse`);
    console.log(kind, { ...result, closedHeight });
  }

  evaluate("renderFixture('ColorPicker', true); true");
  browser("wait", "450");
  const before = evaluate(
    "document.querySelector('[data-colorpicker-popup]').style.transformOrigin",
  );
  assert.equal(before, "left center", "The large panel must first fall back to the right");
  evaluate("renderFixture('ColorPicker', false); true");
  browser("wait", "450");
  const after = evaluate(
    "document.querySelector('[data-colorpicker-popup]').style.transformOrigin",
  );
  assert.equal(after, "center top", "The smaller panel must return below without scrolling");
  console.log("ColorPicker", { before, after });
} finally {
  browser("close");
}
