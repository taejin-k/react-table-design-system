// Requires Storybook on :6006 and pnpm build. Verify shared picker panels in Chromium.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const session = `picker-hover-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 30000,
  }).trim();
const evaluate = (code) => JSON.parse(browser("eval", code));

try {
  browser(
    "open",
    "http://localhost:6006/iframe.html?id=components-datepicker--basic&viewMode=story",
  );
  browser(
    "wait",
    "--fn",
    "document.querySelector('#storybook-root button') && document.body.classList.contains('sb-show-main')",
  );
  browser("snapshot", "-i");
  browser("set", "viewport", "1000", "800");
  evaluate(`(async()=>{
    const text=await(await fetch('/src/components/DatePicker/DatePicker.tsx')).text();
    const url=text.match(/from "([^"]*\\/react.js[^"]*)"/)[1];
    const React=(await import(url)).default;
    const {createRoot}=(await import(url.replace(/react.js.*$/,'react-dom_client.js'))).default;
    const source=(await import('/src/components/DatePicker/DatePicker.tsx')).DatePicker;
    const built=(await import('/dist/index.mjs?audit='+Date.now())).DatePicker;
    document.querySelector('#storybook-root').style.display='none';
    document.documentElement.style.cssText='margin:0;overflow:hidden;scrollbar-gutter:auto';
    document.body.style.cssText='margin:0;overflow:hidden;scrollbar-gutter:auto';
    const host=document.createElement('div');document.body.append(host);
    const production=document.createElement('link');production.rel='stylesheet';production.href='/dist/style.css';
    await new Promise((ok,bad)=>{production.onload=ok;production.onerror=bad;document.head.append(production)});
    production.sheet.disabled=true;
    window.pickerAudit={e:React.createElement,root:createRoot(host),source,built,production};
    return true;
  })()`);

  let checked = 0;
  for (const kind of ["source", "built"])
    for (const range of [false, true])
      for (const picker of ["date", "month", "year"])
        for (const side of ["top", "bottom"]) {
          const id = `${kind}/${range ? "range" : "single"}/${picker}/${side}`;
          const result = evaluate(`(async()=>{
            const a=window.pickerAudit;
            [...document.styleSheets].filter(s=>s!==a.production.sheet).forEach(s=>{s.disabled=${kind === "built"}});
            a.production.sheet.disabled=${kind !== "built"};
            const Component=a[${JSON.stringify(kind)}]${range ? ".RangePicker" : ""};
            a.root.render(a.e('section',{key:${JSON.stringify(id)},'data-picker-audit-host':'',style:{position:'fixed',left:80,top:${side === "top" ? 700 : 30},width:620}},
              a.e(Component,{picker:${JSON.stringify(picker)},placement:'bottomLeft'})));
            await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
            const trigger=document.querySelector('[data-picker-audit-host] button');trigger.click();
            const origins=[];
            for(let i=0;i<20;i++){
              await new Promise(requestAnimationFrame);
              const p=document.querySelector('[data-datepicker${range ? "-range" : ""}-popup]');
              if(p && getComputedStyle(p).visibility==='visible')origins.push(p.style.transformOrigin);
            }
            const p=document.querySelector('[data-datepicker${range ? "-range" : ""}-popup]');
            const rect=p.getBoundingClientRect(),anchor=trigger.getBoundingClientRect();
            const buttons=[...p.querySelectorAll('button')].filter(b=>b.classList.contains('hover:bg-hover')&&!b.disabled);
            const navigation=buttons.find(b=>!b.textContent.trim());
            const cell=buttons.find(b=>b.textContent.trim());
            navigation.dataset.pickerAuditHover='navigation';cell.dataset.pickerAuditHover='cell';
            return {origins,actual:rect.bottom<=anchor.top?'top':rect.top>=anchor.bottom?'bottom':'overlap',motionDuration:p.style.transitionDuration,
              hover:[navigation,cell].map(b=>({duration:getComputedStyle(b).transitionDuration,property:getComputedStyle(b).transitionProperty}))};
          })()`);
          assert.equal(result.actual, side, id);
          assert.ok(
            result.origins.length > 0 &&
              result.origins.every(
                (origin) => origin === (side === "top" ? "center bottom" : "center top"),
              ),
            id,
          );
          assert.equal(result.motionDuration, "200ms", id);
          for (const hover of result.hover) {
            assert.equal(hover.duration, "0.2s", id);
            assert.ok(hover.property.includes("background-color"), id);
          }
          browser("snapshot", "-i");
          for (const target of ["navigation", "cell"]) {
            browser("hover", `[data-picker-audit-hover="${target}"]`);
            const color = evaluate(
              `(async()=>{await new Promise(r=>setTimeout(r,230));return getComputedStyle(document.querySelector('[data-picker-audit-hover="${target}"]')).backgroundColor})()`,
            );
            assert.equal(color, "rgb(242, 242, 242)", `${id}/${target}`);
          }
          checked++;
          console.log(`PASS ${id}`);
        }
  assert.equal(browser("errors"), "", "Browser runtime errors");
  console.log(`${checked} picker hover/motion cases passed.`);
} finally {
  browser("close");
}
