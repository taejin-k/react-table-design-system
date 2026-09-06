// Requires the local Storybook server and agent-browser on PATH.
// Run: node scripts/verify-select-tag-scroll.mjs
// Add --original to verify that overflow:hidden reproduces the original bug.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const session = `select-tag-scroll-${process.pid}`;
const original = process.argv.includes("--original");
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 15000,
  }).trim();
const evaluate = (source) => JSON.parse(browser("eval", source));

try {
  browser("open", "http://localhost:6006/iframe.html?id=components-select--tags&viewMode=story");
  browser("set", "viewport", "500", "900");
  browser("wait", "500");

  for (const [index, size] of ["lg", "md", "sm"].entries()) {
    // Fresh native keyboard input is essential: dispatched DOM events alone
    // don't reproduce the browser's automatic scrolling to the input caret.
    browser("reload");
    browser("wait", "300");
    const refs = [...browser("snapshot", "-i").matchAll(/textbox.*\[ref=(e\d+)\]/g)];
    assert.equal(refs.length, 3, "Expected the three Tags size examples");
    const inputRef = `@${refs[index][1]}`;
    if (original) {
      evaluate(`(() => {
        const animate = Element.prototype.animate;
        Element.prototype.animate = function(frames, options) {
          if (Array.isArray(frames)) frames = frames.map(frame =>
            frame.overflow === 'clip' ? { ...frame, overflow: 'hidden' } : frame);
          return animate.call(this, frames, options);
        };
        return true;
      })()`);
    }
    evaluate(`(() => {
      const input = document.querySelectorAll('input')[${index}];
      const container = input.parentElement;
      const trigger = container.parentElement;
      window.__sampleTrigger = trigger;
      window.__tagScrollSamples = [];
      window.__tagScrollRunning = true;
      const tick = () => {
        const root = trigger.getBoundingClientRect();
        const first = container.querySelector('[data-select-tag]').getBoundingClientRect();
        window.__tagScrollSamples.push({
          scroll: trigger.scrollTop,
          firstTop: first.top - root.top,
          height: root.height,
        });
        if (window.__tagScrollRunning) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return true;
    })()`);
    for (let tag = 0; tag < 6; tag++) {
      browser("type", inputRef, `빠른입력긴태그${tag}가나다라마바사123456789`);
      browser("press", "Enter");
    }
    browser(
      "wait",
      "--fn",
      "window.__tagScrollSamples.length > 20 && !window.__sampleTrigger.getAnimations().some(a => a.playState === 'running')",
    );
    const result = evaluate(`(() => {
      window.__tagScrollRunning = false;
      const frames = window.__tagScrollSamples;
      return {
        frames: frames.length,
        maxScroll: Math.max(...frames.map(x => x.scroll)),
        firstRowMovement: Math.max(...frames.map(x => x.firstTop)) - Math.min(...frames.map(x => x.firstTop)),
        heightChange: Math.max(...frames.map(x => x.height)) - Math.min(...frames.map(x => x.height)),
        connected: window.__sampleTrigger.isConnected,
        tagCount: window.__sampleTrigger.querySelectorAll('[data-select-tag]').length,
      };
    })()`);
    console.log(size, result);
    assert.ok(result.frames > 10, "Expected animation frame samples");
    assert.ok(result.connected, "The sampled trigger must remain mounted");
    assert.equal(result.tagCount, 7, "All six native Enter presses must add a tag");
    assert.ok(result.heightChange > 10, "Expected actual tag wrapping and height growth");
    if (original) {
      assert.ok(result.maxScroll > 0, `${size}: expected original caret scrolling`);
      assert.ok(result.firstRowMovement > 0.5, `${size}: expected original tag movement`);
    } else {
      assert.equal(result.maxScroll, 0, `${size}: browser scrolled the tag trigger`);
      assert.ok(result.firstRowMovement < 0.5, `${size}: first tag row moved`);
    }
  }
} finally {
  browser("close");
}
