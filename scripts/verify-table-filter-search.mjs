// Requires Storybook on :6006 and pnpm build. Detect stale coordinates during filtering.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const session = `filter-search-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 30000,
  }).trim();
const evaluate = (code) => JSON.parse(browser("eval", code));

try {
  browser("open", "http://localhost:6006/iframe.html?id=components-table--basic&viewMode=story");
  browser(
    "wait",
    "--fn",
    "!!document.querySelector('#storybook-root table') && document.body.classList.contains('sb-show-main')",
  );
  browser("snapshot", "-i");
  evaluate(`(async()=>{
    const text=await(await fetch('/src/components/Table/Table.tsx')).text();
    const url=text.match(/from "([^"]*\\/react.js[^"]*)"/)[1];
    const React=(await import(url)).default;
    const {createRoot}=(await import(url.replace(/react.js.*$/,'react-dom_client.js'))).default;
    const source=(await import('/src/components/Table/Table.tsx')).Table;
    const built=(await import('/dist/index.mjs?audit='+Date.now())).Table;
    document.querySelector('#storybook-root').style.display='none';
    document.documentElement.style.cssText='margin:0;overflow:hidden;scrollbar-gutter:auto';
    document.body.style.cssText='margin:0;overflow:hidden;scrollbar-gutter:auto';
    const host=document.createElement('div');document.body.append(host);
    const production=document.createElement('link');production.rel='stylesheet';production.href='/dist/style.css';
    await new Promise((ok,bad)=>{production.onload=ok;production.onerror=bad;document.head.append(production)});
    production.sheet.disabled=true;
    window.searchAudit={e:React.createElement,root:createRoot(host),source,built,production};
    return true;
  })()`);
  let checked = 0;
  for (const width of [390, 1280]) {
    browser("set", "viewport", String(width), "800");
    for (const kind of ["source", "built"])
      for (const side of ["top", "bottom"]) {
        const id = `${width}px/${kind}/${side}`;
        evaluate(`(async()=>{
          const a=window.searchAudit;
          [...document.styleSheets].filter(s=>s!==a.production.sheet).forEach(s=>{s.disabled=${kind === "built"}});
          a.production.sheet.disabled=${kind !== "built"};
          a.root.render(a.e('section',{key:${JSON.stringify(id)},style:{position:'fixed',left:24,top:${side === "top" ? 480 : 30},width:300}},
            a.e(a[${JSON.stringify(kind)}],{columns:[{title:'팀',dataIndex:'team',filterSearch:true,filterMode:'tree',filters:[
              {label:'제품 조직',value:'product',children:[{label:'Design',value:'design'},{label:'Product',value:'product-team'}]},
              {label:'기술 조직',value:'tech',children:[{label:'Platform',value:'platform'},{label:'Mobile',value:'mobile'}]}
            ]}],dataSource:[],pagination:false})));
          await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
          document.querySelector('[data-table-filter]').click();
          await new Promise(r=>setTimeout(r,350));
          a.popup=document.querySelector('[data-table-filter-motion]');
          a.input=a.popup.querySelector('input:not([type=checkbox])');
          a.input.dataset.searchAuditInput='';
          return true;
        })()`);
        browser("snapshot", "-i");
        for (const [query, count] of [
          ["Design", 1],
          ["", 4],
          ["zzzz", 0],
          ["ㅈㅍ", 2],
          ["기술", 2],
          ["", 4],
        ]) {
          evaluate(`(()=>{
            const a=window.searchAudit;a.frames=[];a.sampling=true;
            const sample=()=>{
              if(!a.sampling)return;
              const p=a.popup,rect=p.getBoundingClientRect(),anchor=document.querySelector('[data-table-filter]').getBoundingClientRect(),css=getComputedStyle(p);
              a.frames.push({gap:${side === "top" ? "anchor.top-rect.bottom" : "rect.top-anchor.bottom"},origin:p.style.transformOrigin,opacity:css.opacity,transform:css.transform,same:p===document.querySelector('[data-table-filter-motion]'),focused:document.activeElement===a.input});
              a.frame=requestAnimationFrame(sample);
            };sample();return true;
          })()`);
          if (query) browser("fill", "[data-search-audit-input]", query);
          else {
            evaluate("window.searchAudit.input.select(); true");
            browser("press", "Backspace");
          }
          const result = evaluate(`(async()=>{
            for(let i=0;i<6;i++)await new Promise(requestAnimationFrame);
            const a=window.searchAudit;a.sampling=false;cancelAnimationFrame(a.frame);
            const anchor=document.querySelector('[data-table-filter]').getBoundingClientRect();
            return {frames:a.frames,count:a.popup.querySelectorAll('input[type=checkbox]').length,value:a.input.value,fitsBelow:anchor.bottom+4+a.popup.offsetHeight<=innerHeight-8};
          })()`);
          assert.equal(result.value, query, `${id}: search input`);
          assert.equal(result.count, count, `${id}/${query}`);
          if (side === "top" && query === "Design") {
            assert.ok(result.fitsBelow, `${id}: reduced results should also fit below`);
          }
          assert.ok(result.frames.length > 1, `${id}/${query}: no animation frames sampled`);
          for (const frame of result.frames) {
            assert.ok(Math.abs(frame.gap - 4) < 1, `${id}/${query}: stale anchor gap ${frame.gap}`);
            assert.equal(frame.origin, side === "top" ? "center bottom" : "center top", id);
            assert.equal(frame.opacity, "1", id);
            assert.equal(frame.transform, "matrix(1, 0, 0, 1, 0, 0)", id);
            assert.ok(frame.same && frame.focused, id);
          }
          checked++;
        }
        if (side === "top") {
          const readPosition = () =>
            evaluate(`(async()=>{
            for(let i=0;i<6;i++)await new Promise(requestAnimationFrame);
            const p=document.querySelector('[data-table-filter-motion]');
            return {origin:p.style.transformOrigin,top:p.offsetTop,bottom:p.offsetTop+p.offsetHeight};
          })()`);
          browser("set", "viewport", String(width), "1100");
          assert.equal(
            readPosition().origin,
            "center bottom",
            `${id}: keep current side while it fits`,
          );
          browser("press", "Escape");
          browser("snapshot", "-i");
          browser("click", "[data-table-filter]");
          assert.equal(
            readPosition().origin,
            "center top",
            `${id}: reopen recalculates from default`,
          );
          browser("set", "viewport", String(width), "650");
          const corrected = readPosition();
          assert.equal(
            corrected.origin,
            "center bottom",
            `${id}: change side when current side overflows`,
          );
          assert.ok(corrected.top >= 8 && corrected.bottom <= 642, `${id}: stay in viewport`);
          browser("set", "viewport", String(width), "800");
        }
        console.log(
          `PASS ${id}: search anchoring/direction${side === "top" ? ", reopen, overflow recovery" : ""}`,
        );
      }
  }
  assert.equal(browser("errors"), "", "Browser runtime errors");
  console.log(`${checked} filter search cases passed.`);
} finally {
  browser("close");
}
