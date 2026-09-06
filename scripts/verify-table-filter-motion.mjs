// Requires Storybook on :6006 and pnpm build. Check real placement and CSS in Chromium.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const session = `filter-motion-${process.pid}`;
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
    "document.querySelector('#storybook-root table') && document.body.classList.contains('sb-show-main')",
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
    window.filterAudit={e:React.createElement,root:createRoot(host),source,built,production};
    return true;
  })()`);
  let checked = 0;
  for (const width of [390, 1280]) {
    browser("set", "viewport", String(width), "800");
    for (const kind of ["source", "built"])
      for (const placement of ["top", "bottom"]) {
        const origin = placement === "top" ? "center bottom" : "center top";
        const opening = evaluate(`(async()=>{
        const a=window.filterAudit;
        [...document.styleSheets].filter(s=>s!==a.production.sheet).forEach(s=>{s.disabled=${kind === "built"}});
        a.production.sheet.disabled=${kind !== "built"};
        a.root.render(a.e('section',{key:${JSON.stringify(kind + placement + width)},style:{position:'fixed',left:24,top:${placement === "top" ? 600 : 40},width:300}},
          a.e(a[${JSON.stringify(kind)}],{columns:[{title:'Team',dataIndex:'team',filterSearch:true,filterMode:'tree',filters:[{label:'제품 조직',value:'group',children:[{label:'Design',value:'design'},{label:'Product',value:'product'}]}]}],dataSource:[],pagination:false})));
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        document.querySelector('[data-table-filter]').click();
        const origins=[];
        for(let i=0;i<20;i++){
          await new Promise(requestAnimationFrame);
          const p=document.querySelector('[data-table-filter-motion]');
          if(p)origins.push(p.style.transformOrigin);
        }
        const p=document.querySelector('[data-table-filter-motion]');
        const anchor=document.querySelector('[data-table-filter]').getBoundingClientRect();
        const rect=p.getBoundingClientRect();
        const row=p.querySelector('label').parentElement;row.dataset.filterAuditRow='';
        window.filterAudit.row=row;
        const css=getComputedStyle(row);
        return {origins,actual:rect.bottom<=anchor.top?'top':rect.top>=anchor.bottom?'bottom':'overlap',duration:p.style.transitionDuration,hoverDuration:css.transitionDuration,hoverProperty:css.transitionProperty};
      })()`);
        assert.equal(opening.actual, placement, JSON.stringify(opening));
        assert.ok(
          opening.origins.length > 0 && opening.origins.every((x) => x === origin),
          JSON.stringify(opening),
        );
        assert.equal(opening.duration, "200ms");
        assert.equal(opening.hoverDuration, "0.2s");
        assert.ok(opening.hoverProperty.includes("background-color"));
        browser("snapshot", "-i");
        browser("hover", "[data-filter-audit-row]");
        const closing = evaluate(`(async()=>{
        const row=window.filterAudit.row;
        await new Promise(r=>setTimeout(r,230));
        const hover=getComputedStyle(row).backgroundColor;
        document.querySelector('[data-table-filter-motion] button:last-child').click();
        await new Promise(requestAnimationFrame);
        const popup=document.querySelector('[data-table-filter-motion]');
        const result={hover,origin:popup?.style.transformOrigin,transform:popup?.style.transform,opacity:popup?.style.opacity};
        await new Promise(r=>setTimeout(r,280));
        return {...result,removed:!document.querySelector('[data-table-filter-motion]')};
      })()`);
        assert.equal(closing.origin, origin);
        assert.equal(closing.transform, "scaleY(0.8)");
        assert.equal(closing.opacity, "0");
        assert.equal(closing.removed, true);
        assert.equal(closing.hover, "rgb(242, 242, 242)");
        checked++;
        console.log(`PASS ${width}px ${kind} ${placement}: enter/exit origin, 0.2s hover`);
      }
  }
  console.log(`${checked} filter motion/hover cases passed`);
} finally {
  browser("close");
}
