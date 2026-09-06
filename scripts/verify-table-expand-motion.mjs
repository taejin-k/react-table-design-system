// Requires the local Storybook on :6006 and agent-browser.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const session = `table-expand-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 15000,
  }).trim();
const evaluate = (source) => JSON.parse(browser("eval", source));

try {
  browser(
    "open",
    "http://localhost:6006/iframe.html?id=components-table-expandable--expanded-row&viewMode=story",
  );
  browser(
    "wait",
    "--fn",
    "Boolean(document.querySelector('[data-table-expand]')) && document.body.classList.contains('sb-show-main')",
  );
  browser("snapshot", "-i");
  const result = evaluate(`(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const trigger = document.querySelector('[data-table-expand]');
    const measure = () => {
      const row = document.querySelector('[data-table-expanded-row]');
      const motion = document.querySelector('[data-table-expand-motion]');
      return { row: row?.getBoundingClientRect().height ?? 0,
        content: motion?.getBoundingClientRect().height ?? 0 };
    };
    const sample = async (count = 22) => {
      const samples = [];
      for (let i = 0; i < count; i++) {
        await new Promise(requestAnimationFrame);
        samples.push(measure());
      }
      return samples;
    };
    trigger.click();
    const opening = await sample();
    const duration = getComputedStyle(document.querySelector('[data-table-expand-motion]')).transitionDuration;
    trigger.click();
    const closing = await sample();
    const removed = !document.querySelector('[data-table-expanded-row]');
    trigger.click();
    await sample();
    trigger.click();
    const beforeReverse = await sample(4);
    const reversalStart = measure().row;
    trigger.click();
    const reverse = await sample();
    return { opening, closing, duration, removed, beforeReverse, reversalStart, reverse };
  })()`);
  const full = result.opening.at(-1).row;
  assert.equal(result.duration, "0.2s");
  assert.ok(full > 30);
  for (const samples of [result.opening, result.closing]) {
    assert.ok(
      samples.some(({ row }) => row > 1 && row < full - 1),
      `Must render intermediate heights: ${JSON.stringify(samples)}`,
    );
    assert.ok(
      samples.every(({ row, content }) => Math.abs(row - content) <= 1),
      "Cell padding must collapse too",
    );
  }
  assert.ok(result.removed, "Closed content must unmount");
  assert.ok(
    result.reverse.every(({ row }) => row >= result.reversalStart - 1),
    "Reopening must not reset to zero",
  );
  assert.ok(Math.abs(result.reverse.at(-1).row - full) <= 1);
  console.log(
    "Table expand: 200ms open/close, collapsed padding, exit removal, and rapid reversal passed.",
  );
  browser(
    "open",
    "http://localhost:6006/iframe.html?id=components-table-expandable--tree-data&viewMode=story",
  );
  browser("wait", "--fn", "Boolean(document.querySelector('[data-table-tree-motion]'))");
  browser(
    "wait",
    "--fn",
    "Array.from(document.querySelectorAll('[data-row-depth=\"1\"]')).every(row => row.getAnimations({subtree:true}).length === 0)",
  );
  browser("snapshot", "-i");
  const tree = evaluate(`(async () => {
    const trigger = document.querySelector('[data-row-depth="0"] [data-table-expand]');
    const children = () => [...document.querySelectorAll('[data-row-depth="1"]')];
    const height = () => children().reduce((total, row) => total + row.getBoundingClientRect().height, 0);
    const sample = async (count = 22) => {
      const heights = [];
      for (let i = 0; i < count; i++) {
        await new Promise(requestAnimationFrame);
        heights.push(height());
      }
      return heights;
    };
    const full = height();
    trigger.click();
    const closing = await sample();
    const removed = children().length === 0;
    trigger.click();
    const opening = await sample();
    const durations = [...document.querySelectorAll('[data-table-tree-motion]')].map(node => getComputedStyle(node).transitionDuration);
    const headerCells = [...trigger.closest('table').querySelectorAll('thead th')];
    const columnsAligned = children().every(row => [...row.cells].every((cell, index) =>
      Math.abs(cell.getBoundingClientRect().left - headerCells[index].getBoundingClientRect().left) < 1));
    trigger.click();
    await sample(4);
    const reversalStart = height();
    trigger.click();
    const reverse = await sample();
    return {full, closing, opening, removed, durations, columnsAligned, reversalStart, reverse};
  })()`);
  assert.ok(tree.full > 60, JSON.stringify(tree));
  assert.ok(tree.durations.every((duration) => duration === "0.2s"));
  for (const samples of [tree.closing, tree.opening]) {
    assert.ok(
      samples.some((height) => height > 1 && height < tree.full - 1),
      JSON.stringify(tree),
    );
  }
  assert.ok(tree.removed);
  assert.ok(tree.columnsAligned, "Tree cells must stay aligned to the original table columns");
  assert.ok(
    tree.reverse.every((height) => height >= tree.reversalStart - 1),
    JSON.stringify(tree),
  );
  assert.ok(Math.abs(tree.reverse.at(-1) - tree.full) <= 1);
  console.log(
    "Tree expand: 200ms open/close, column alignment, exit removal, and rapid reversal passed.",
  );
} finally {
  browser("close");
}
