// Smoke-test every actual Icon–Select Storybook canvas, including generated examples.
// Requires Storybook on :6006 and agent-browser on PATH.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const session = `icon-select-stories-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 30000,
  }).trim();
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
const index = await (await fetch("http://localhost:6006/index.json")).json();
const stories = Object.values(index.entries).filter(
  (entry) => entry.type === "story" && scope.has(entry.title.split("/").at(-1)),
);
const failures = [];
try {
  for (const [i, story] of stories.entries()) {
    try {
      browser("open", `http://localhost:6006/iframe.html?id=${story.id}&viewMode=story`);
      browser(
        "wait",
        "--fn",
        "document.body.classList.contains('sb-show-errordisplay') || document.querySelector('#storybook-root')?.children.length > 0",
      );
      const result = JSON.parse(
        browser(
          "eval",
          `({error:document.body.classList.contains('sb-show-errordisplay') ? document.querySelector('.sb-errordisplay')?.textContent : '', rendered:document.querySelector('#storybook-root')?.children.length})`,
        ),
      );
      if (result.error || !result.rendered) failures.push({ id: story.id, ...result });
    } catch (error) {
      failures.push({ id: story.id, error: error.message });
    }
    if ((i + 1) % 20 === 0) console.log(`Rendered ${i + 1}/${stories.length} canvases`);
  }
  console.log(`${stories.length} Storybook canvases; ${failures.length} failures`);
  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
} finally {
  browser("close");
}
