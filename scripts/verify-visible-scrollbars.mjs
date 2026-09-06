// Focused source check: Storybook :6006, agent-browser. No production build required.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const session = `visible-scrollbars-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 30000,
  }).trim();
const evaluate = (code) => JSON.parse(browser("eval", code));
try {
  browser("open", "http://localhost:6006/iframe.html?id=components-table--basic&viewMode=story");
  browser("wait", "--fn", "Boolean(document.querySelector('#storybook-root table'))");
  browser("snapshot", "-i");
  evaluate(`(async()=>{
    const text=await(await fetch('/src/components/Table/Table.tsx')).text();
    const url=text.match(/from "([^"]*\\/react.js[^"]*)"/)[1];
    const React=(await import(url)).default;
    const {createRoot}=(await import(url.replace(/react.js.*$/,'react-dom_client.js'))).default;
    const {Table}=await import('/src/components/Table/Table.tsx');
    const {Drawer}=await import('/src/components/Drawer/Drawer.tsx');
    const {Modal}=await import('/src/components/Modal/Modal.tsx');
    document.querySelector('#storybook-root').style.display='none';
    document.documentElement.style.cssText='margin:0;scrollbar-gutter:auto';
    document.body.style.cssText='margin:0;scrollbar-gutter:auto';
    const host=document.createElement('div');host.style.cssText='position:fixed;left:40px;top:550px;width:400px';document.body.append(host);
    const e=React.createElement,root=createRoot(host);
    window.scrollAudit={e,root,host,render:(kind,count=30)=>{
      const children=Array.from({length:count},(_,i)=>e('div',{key:i,style:{height:40}},'항목 '+i));
      root.render(kind==='filter'?e(Table,{columns:[{title:'팀',dataIndex:'team',filterSearch:true,filters:Array.from({length:30},(_,i)=>({label:'조직 '+i,value:String(i)}))}],dataSource:[],pagination:false})
        :kind==='drawer'?e(Drawer,{open:true,title:'제목',footer:'하단',onClose:()=>{}},children)
        :e(Modal,{open:true,title:'제목',onCancel:()=>{}},children));
    }};
    return true;
  })()`);
  browser("set", "viewport", "1280", "800");
  for (const [kind, marker] of [
    ["filter", "data-table-filter-scroll-container"],
    ["drawer", "data-drawer-scroll-container"],
    ["modal", "data-modal-scroll-container"],
    ["modal-outer", "data-modal-outer-scroll-container"],
  ]) {
    evaluate(
      `(async()=>{window.scrollAudit.render(${JSON.stringify(kind)});await new Promise(r=>setTimeout(r,400));return true})()`,
    );
    if (kind === "filter") {
      browser("click", "[data-table-filter]");
      evaluate("new Promise(r=>setTimeout(()=>r(true),250))");
    }
    browser("snapshot", "-i");
    const baseline = evaluate(`(()=>{
      const viewport=document.querySelector('[${marker}]');
      const area=viewport.parentElement;
      const thumb=area.querySelector(':scope > [data-scroll-track="y"] > [data-scroll-thumb]');
      area.dataset.scrollAuditArea='';thumb.dataset.scrollAuditThumb='';
      window.scrollAudit.viewport=viewport;window.scrollAudit.area=area;
      const css=getComputedStyle(thumb);
      return {overflow:viewport.scrollHeight-viewport.clientHeight,color:css.backgroundColor,duration:css.transitionDuration,width:thumb.getBoundingClientRect().width,display:thumb.parentElement.style.display};
    })()`);
    assert.ok(baseline.overflow > 0, JSON.stringify({ kind, baseline }));
    assert.notEqual(baseline.display, "none");
    assert.equal(baseline.color, "rgb(221, 221, 221)");
    assert.equal(baseline.duration, "0.2s");
    assert.equal(baseline.width, 6);
    evaluate(
      `(()=>{const thumb=document.querySelector('[data-scroll-audit-thumb]');window.scrollAudit.samples=[];let n=30;function sample(){window.scrollAudit.samples.push(getComputedStyle(thumb).backgroundColor);if(--n)requestAnimationFrame(sample)}requestAnimationFrame(sample);return true})()`,
    );
    browser("hover", "[data-scroll-audit-thumb]");
    const hover = evaluate(
      `(async()=>{await new Promise(r=>setTimeout(r,250));return {color:getComputedStyle(document.querySelector('[data-scroll-audit-thumb]')).backgroundColor,samples:[...new Set(window.scrollAudit.samples)]}})()`,
    );
    assert.equal(hover.color, "rgb(187, 187, 187)");
    assert.ok(
      hover.samples.some(
        (color) => color !== "rgb(221, 221, 221)" && color !== "rgb(187, 187, 187)",
      ),
      JSON.stringify(hover),
    );
    const point = evaluate(
      `(()=>{const r=document.querySelector('[data-scroll-audit-thumb]').getBoundingClientRect();return {x:Math.round(r.x+3),y:Math.round(r.y+Math.min(12,r.height/2))}})()`,
    );
    browser("mouse", "move", String(point.x), String(point.y));
    browser("mouse", "down");
    browser("mouse", "move", String(point.x), String(point.y + 32));
    browser("mouse", "up");
    assert.ok(evaluate("window.scrollAudit.viewport.scrollTop") > 0, kind + " drag did not scroll");
    if (kind === "filter") {
      const result = evaluate(`(async()=>{
        const menu=document.querySelector('[data-table-filter-motion]');const origin=menu.style.transformOrigin;
        const input=menu.querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'조직 29');input.dispatchEvent(new Event('input',{bubbles:true}));
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        return {sameMenu:menu===document.querySelector('[data-table-filter-motion]'),origin,nextOrigin:menu.style.transformOrigin,display:window.scrollAudit.area.querySelector(':scope > [data-scroll-track="y"]').style.display};
      })()`);
      assert.equal(result.sameMenu, true);
      assert.equal(result.origin, "center bottom");
      assert.equal(result.nextOrigin, result.origin);
      assert.equal(result.display, "none");
    } else if (kind !== "modal-outer") {
      const hidden = evaluate(
        `(async()=>{window.scrollAudit.render(${JSON.stringify(kind)},1);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return window.scrollAudit.area.querySelector(':scope > [data-scroll-track="y"]').style.display})()`,
      );
      assert.equal(hidden, "none");
    }
    console.log(
      `PASS ${kind}: 6px, border → disabled, 0.2s transition, drag${kind === "filter" ? ", search keeps top placement" : ""}`,
    );
    evaluate(
      `(()=>{document.querySelectorAll('[data-scroll-audit-thumb]').forEach(e=>e.removeAttribute('data-scroll-audit-thumb'));document.querySelectorAll('[data-scroll-audit-area]').forEach(e=>e.removeAttribute('data-scroll-audit-area'));return true})()`,
    );
    browser("mouse", "move", "10", "10");
  }
} finally {
  browser("close");
}
